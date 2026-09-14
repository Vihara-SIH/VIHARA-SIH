import { applyCors, rateLimit } from './_lib/http.js';

function mapsKey() {
  return (process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '').trim();
}

// In-memory server-side cache for pairwise route calculations (2-hour TTL)
export const routeServerCache = new Map();
const ROUTE_CACHE_TTL = 2 * 60 * 60 * 1000;

function cacheKey(a, b, mode) {
  return `${Number(a.lat).toFixed(3)},${Number(a.lng).toFixed(3)}|${Number(b.lat).toFixed(3)},${Number(b.lng).toFixed(3)}|${mode}`;
}

export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function estimateLeg(from, to, index = 0) {
  const km = haversineKm(from, to);
  const speed = km < 8 ? 22 : km < 40 ? 32 : km < 200 ? 55 : 70;
  const minutes = Math.max(8, Math.round((km / speed) * 60) + 5);
  const distanceKm = Math.round(km * 10) / 10;
  return {
    legIndex: index + 1,
    from: from.name || 'Origin',
    to: to.name || 'Destination',
    distanceKm,
    durationMinutes: minutes,
    distanceMeters: Math.round(distanceKm * 1000),
    durationSeconds: minutes * 60,
    distance: `${distanceKm} km`,
    duration: minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} mins`,
    mode: km > 80 ? 'Intercity transfer' : 'Local transit',
    estimated: true,
    source: 'haversine-fallback',
    provider: 'haversine-fallback',
    fallback: true,
    polyline: null,
    tip: 'Approximate geodesic estimate. Not live traffic route.'
  };
}

function parsePoint(p, i = 0) {
  if (!p || typeof p !== 'object') return null;
  const lat = parseFloat(p.latitude ?? p.lat);
  const lng = parseFloat(p.longitude ?? p.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { name: p.name || p.title || `Stop ${i + 1}`, lat, lng };
}

function normalizeTravelMode(mode) {
  const m = String(mode || 'DRIVE').toUpperCase().trim();
  if (['DRIVE', 'DRIVING', 'CAR'].includes(m)) return 'DRIVE';
  if (['WALK', 'WALKING', 'PEDESTRIAN'].includes(m)) return 'WALK';
  if (['BICYCLE', 'BICYCLING', 'BIKE'].includes(m)) return 'BICYCLE';
  if (['TRANSIT', 'PUBLIC_TRANSPORT'].includes(m)) return 'TRANSIT';
  if (['TWO_WHEELER', 'MOTORCYCLE'].includes(m)) return 'TWO_WHEELER';
  return 'DRIVE';
}

/**
 * Calls Google Routes API v2: computeRoutes
 * Endpoint: POST https://routes.googleapis.com/directions/v2:computeRoutes
 */
async function callGoogleRoutesV2(points, travelMode, key) {
  if (!points || points.length < 2) return null;

  const origin = points[0];
  const destination = points[points.length - 1];
  const intermediates = points.slice(1, -1);

  // Compute Routes payload
  const body = {
    origin: {
      location: {
        latLng: {
          latitude: origin.lat,
          longitude: origin.lng
        }
      }
    },
    destination: {
      location: {
        latLng: {
          latitude: destination.lat,
          longitude: destination.lng
        }
      }
    },
    travelMode
  };

  // routingPreference is only allowed for DRIVE and TWO_WHEELER
  if (travelMode === 'DRIVE' || travelMode === 'TWO_WHEELER') {
    body.routingPreference = 'TRAFFIC_AWARE';
  }

  if (intermediates.length > 0) {
    // Google Routes allows up to 25 intermediates
    body.intermediates = intermediates.slice(0, 25).map((p) => ({
      location: {
        latLng: {
          latitude: p.lat,
          longitude: p.lng
        }
      }
    }));
  }

  // Google Routes API v2 requires explicit FieldMask header
  const fieldMask = [
    'routes.duration',
    'routes.distanceMeters',
    'routes.polyline.encodedPolyline',
    'routes.legs.duration',
    'routes.legs.distanceMeters',
    'routes.legs.polyline.encodedPolyline'
  ].join(',');

  const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': fieldMask
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000) // 8-second timeout
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.warn(`[Google Routes API v2] Request returned ${res.status}:`, errText.slice(0, 200));
    return null;
  }

  const data = await res.json();
  if (!data?.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
    console.warn('[Google Routes API v2] No routes found in response');
    return null;
  }

  return data.routes[0];
}

export default async function handler(req, res) {
  applyCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const limited = rateLimit(req, { max: 40 });
  if (!limited.ok) {
    return res.status(429).json({ success: false, error: 'Routing rate limit exceeded. Please wait a moment.' });
  }

  const src = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const travelMode = normalizeTravelMode(src.travelMode || src.mode);

  // Parse points: either waypoints array OR explicit origin + destination
  let points = [];
  if (Array.isArray(src.waypoints) && src.waypoints.length >= 2) {
    points = src.waypoints.map(parsePoint).filter(Boolean);
  } else if (src.origin && src.destination) {
    const p1 = parsePoint(src.origin, 0);
    const p2 = parsePoint(src.destination, 1);
    if (p1 && p2) points = [p1, p2];
  }

  if (points.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'At least two waypoints with valid coordinates are required (origin and destination).'
    });
  }

  // Check pairwise server cache for 2-point routes
  if (points.length === 2) {
    const cKey = cacheKey(points[0], points[1], travelMode);
    const cached = routeServerCache.get(cKey);
    if (cached && Date.now() - cached.timestamp < ROUTE_CACHE_TTL) {
      return res.status(200).json({
        ...cached.data,
        cached: true
      });
    }
  }

  const key = mapsKey();

  if (key) {
    try {
      const route = await callGoogleRoutesV2(points, travelMode, key);

      if (route) {
        const rawDuration = route.duration || '0s';
        const totalDurationSec = parseFloat(String(rawDuration).replace('s', '')) || 0;
        const totalDurationMin = Math.max(1, Math.round(totalDurationSec / 60));
        const totalDistanceMeters = Number(route.distanceMeters || 0);
        const totalDistanceKm = Math.round((totalDistanceMeters / 1000) * 10) / 10;
        const overallPolyline = route.polyline?.encodedPolyline || null;

        const legs = [];
        const googleLegs = route.legs || [];

        for (let i = 0; i < points.length - 1; i++) {
          const from = points[i];
          const to = points[i + 1];
          const gLeg = googleLegs[i];

          if (gLeg) {
            const legSec = parseFloat(String(gLeg.duration || '0s').replace('s', '')) || 0;
            const legMin = Math.max(1, Math.round(legSec / 60));
            const legMeters = Number(gLeg.distanceMeters || 0);
            const legKm = Math.round((legMeters / 1000) * 10) / 10;
            const legPoly = gLeg.polyline?.encodedPolyline || overallPolyline;

            const legPayload = {
              legIndex: i + 1,
              from: from.name,
              to: to.name,
              distanceKm: legKm,
              durationMinutes: legMin,
              distanceMeters: legMeters,
              durationSeconds: legSec,
              distance: `${legKm} km`,
              duration: legMin >= 60 ? `${Math.floor(legMin / 60)}h ${legMin % 60}m` : `${legMin} mins`,
              mode: legKm > 80 ? 'Intercity transfer' : 'Driving',
              estimated: false,
              source: 'google-routes-v2',
              provider: 'google-routes-v2',
              fallback: false,
              polyline: legPoly,
              tip: 'Real-time driving route from Google Routes API v2.'
            };
            legs.push(legPayload);

            // Store each computed leg in pairwise cache
            routeServerCache.set(cacheKey(from, to, travelMode), {
              timestamp: Date.now(),
              data: {
                success: true,
                provider: 'google-routes-v2',
                durationSeconds: legSec,
                durationMinutes: legMin,
                distanceMeters: legMeters,
                distanceKm: legKm,
                distance: `${legKm} km`,
                duration: legPayload.duration,
                polyline: legPoly,
                fallback: false,
                legs: [legPayload]
              }
            });
          } else {
            // If Google returned fewer legs than requested points, fallback that individual leg
            legs.push(estimateLeg(from, to, i));
          }
        }

        const responsePayload = {
          success: true,
          provider: 'google-routes-v2',
          durationSeconds: totalDurationSec,
          durationMinutes: totalDurationMin,
          distanceMeters: totalDistanceMeters,
          distanceKm: totalDistanceKm,
          distance: `${totalDistanceKm} km`,
          duration: totalDurationMin >= 60 ? `${Math.floor(totalDurationMin / 60)}h ${totalDurationMin % 60}m` : `${totalDurationMin} mins`,
          polyline: overallPolyline,
          fallback: false,
          travelMode,
          legs
        };

        return res.status(200).json(responsePayload);
      }
    } catch (err) {
      console.warn('[Google Routes API v2] Routing execution error:', err.message);
    }
  }

  // ─── HA древнее HAVERSINE FALLBACK ───
  // Clearly labeled as haversine-fallback with fallback: true. Never claims Google Routes.
  const legs = [];
  let totalKm = 0;
  let totalMin = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const leg = estimateLeg(points[i], points[i + 1], i);
    legs.push(leg);
    totalKm += leg.distanceKm;
    totalMin += leg.durationMinutes;
  }

  totalKm = Math.round(totalKm * 10) / 10;

  const fallbackPayload = {
    success: true,
    provider: 'haversine-fallback',
    fallback: true,
    estimated: true,
    durationSeconds: totalMin * 60,
    durationMinutes: totalMin,
    distanceMeters: Math.round(totalKm * 1000),
    distanceKm: totalKm,
    distance: `${totalKm} km`,
    duration: totalMin >= 60 ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m` : `${totalMin} mins`,
    polyline: null,
    travelMode,
    legs
  };

  return res.status(200).json(fallbackPayload);
}
