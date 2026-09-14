import { cacheGet, cacheSet, cacheKey } from './cache.js';
import { estimateTravelMinutes } from './geo.js';

function extractCoords(point) {
  if (!point || typeof point !== 'object') return null;
  const lat = Number(point.latitude ?? point.lat);
  const lng = Number(point.longitude ?? point.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, name: point.name || point.title || 'Location' };
}

function getBaseUrl() {
  return typeof window !== 'undefined' ? '' : (process.env.TEST_BASE_URL || 'http://localhost:5173');
}

/**
 * Retrieves the real driving duration and distance between two points
 * using Google Routes API v2 via /api/routes with fallback to Haversine.
 *
 * @param {Object} origin - { lat, lng } or { latitude, longitude, name? }
 * @param {Object} destination - { lat, lng } or { latitude, longitude, name? }
 * @param {Object} [options] - { travelMode: 'DRIVE'|'WALK'|'BICYCLE'|'TRANSIT' }
 * @returns {Promise<{durationMinutes: number, durationSeconds: number, distanceKm: number, distanceMeters: number, distance: string, duration: string, polyline: string|null, provider: string, fallback: boolean, source: string}>}
 */
export async function getRouteDuration(origin, destination, options = {}) {
  const p1 = extractCoords(origin);
  const p2 = extractCoords(destination);
  const travelMode = String(options.travelMode || options.mode || 'DRIVE').toUpperCase();

  if (!p1 || !p2) {
    return {
      durationMinutes: 20,
      durationSeconds: 1200,
      distanceKm: null,
      distanceMeters: null,
      distance: 'Distance unavailable',
      duration: '20 mins',
      polyline: null,
      provider: 'haversine-fallback',
      fallback: true,
      source: 'haversine-fallback'
    };
  }

  // Same coordinates (distance 0)
  if (p1.lat === p2.lat && p1.lng === p2.lng) {
    return {
      durationMinutes: 0,
      durationSeconds: 0,
      distanceKm: 0,
      distanceMeters: 0,
      distance: '0 km',
      duration: '0 mins',
      polyline: null,
      provider: 'google-routes-v2',
      fallback: false,
      source: 'google-routes-v2'
    };
  }

  const key = cacheKey([
    'route_v2_pair',
    p1.lat.toFixed(3),
    p1.lng.toFixed(3),
    p2.lat.toFixed(3),
    p2.lng.toFixed(3),
    travelMode
  ]);

  const cached = cacheGet(key);
  if (cached) return cached;

  try {
    const res = await fetch(`${getBaseUrl()}/api/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { latitude: p1.lat, longitude: p1.lng, name: p1.name },
        destination: { latitude: p2.lat, longitude: p2.lng, name: p2.name },
        travelMode
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const payload = {
          durationMinutes: data.durationMinutes,
          durationSeconds: data.durationSeconds,
          distanceKm: data.distanceKm,
          distanceMeters: data.distanceMeters,
          distance: data.distance || `${data.distanceKm} km`,
          duration: data.duration || `${data.durationMinutes} mins`,
          polyline: data.polyline || null,
          provider: data.provider || (data.fallback ? 'haversine-fallback' : 'google-routes-v2'),
          fallback: !!data.fallback,
          source: data.provider || (data.fallback ? 'haversine-fallback' : 'google-routes-v2')
        };
        cacheSet(key, payload, 30 * 60 * 1000); // 30-min cache
        return payload;
      }
    }
  } catch (err) {
    console.warn('[routeClient] Google Routes query error, falling back to Haversine:', err.message);
  }

  // Haversine fallback
  const est = estimateTravelMinutes(p1, p2);
  const fallbackPayload = {
    durationMinutes: est.minutes,
    durationSeconds: est.minutes * 60,
    distanceKm: est.km,
    distanceMeters: est.km != null ? Math.round(est.km * 1000) : null,
    distance: est.km != null ? `${est.km} km` : 'Distance estimate unavailable',
    duration: `${est.minutes} mins`,
    polyline: null,
    provider: 'haversine-fallback',
    fallback: true,
    source: 'haversine-fallback'
  };
  cacheSet(key, fallbackPayload, 15 * 60 * 1000);
  return fallbackPayload;
}

/**
 * Computes all consecutive legs in a waypoint sequence.
 * Uses Google Routes API v2 via /api/routes with fallback to Haversine.
 *
 * @param {Array} waypoints - Array of waypoints with { coordinates: { lat, lng }, name }
 * @param {Object} [options] - { travelMode: 'DRIVE' }
 */
export async function fetchRouteLegs(waypoints = [], options = {}) {
  const usable = (waypoints || []).filter((w) => {
    const lat = w?.coordinates?.lat ?? w?.latitude ?? w?.lat;
    const lng = w?.coordinates?.lng ?? w?.longitude ?? w?.lng;
    return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
  });

  if (usable.length < 2) {
    return { legs: [], source: 'none', provider: 'none', estimated: true, fallback: true };
  }

  const travelMode = String(options.travelMode || options.mode || 'DRIVE').toUpperCase();

  const key = cacheKey([
    'route_v2_legs',
    travelMode,
    ...usable.map((w) => {
      const lat = w.coordinates?.lat ?? w.latitude ?? w.lat;
      const lng = w.coordinates?.lng ?? w.longitude ?? w.lng;
      return `${Number(lat).toFixed(3)},${Number(lng).toFixed(3)}`;
    })
  ]);

  const cached = cacheGet(key);
  if (cached) return cached;

  try {
    const res = await fetch(`${getBaseUrl()}/api/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        waypoints: usable.map((w) => ({
          name: w.name || w.title || 'Stop',
          latitude: w.coordinates?.lat ?? w.latitude ?? w.lat,
          longitude: w.coordinates?.lng ?? w.longitude ?? w.lng
        })),
        travelMode
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.legs)) {
        const payload = {
          legs: data.legs,
          polyline: data.polyline || null,
          totalDistance: data.distance || `${data.distanceKm} km`,
          totalDuration: data.duration || `${data.durationMinutes} mins`,
          totalDistanceKm: data.distanceKm,
          totalDurationMinutes: data.durationMinutes,
          source: data.provider || 'google-routes-v2',
          provider: data.provider || 'google-routes-v2',
          estimated: !!data.fallback,
          fallback: !!data.fallback
        };
        cacheSet(key, payload, 30 * 60 * 1000);
        return payload;
      }
    }
  } catch (err) {
    console.warn('[routeClient] fetchRouteLegs failed, falling back to Haversine:', err.message);
  }

  // Haversine fallback for each consecutive leg
  const legs = [];
  let totalKm = 0;
  let totalMin = 0;

  for (let i = 0; i < usable.length - 1; i++) {
    const from = usable[i];
    const to = usable[i + 1];
    const fromCoord = { lat: from.coordinates?.lat ?? from.latitude ?? from.lat, lng: from.coordinates?.lng ?? from.longitude ?? from.lng };
    const toCoord = { lat: to.coordinates?.lat ?? to.latitude ?? to.lat, lng: to.coordinates?.lng ?? to.longitude ?? to.lng };
    const est = estimateTravelMinutes(fromCoord, toCoord);

    totalKm += est.km || 0;
    totalMin += est.minutes;

    legs.push({
      legIndex: i + 1,
      from: from.name || from.title || 'Origin',
      to: to.name || to.title || 'Destination',
      distanceKm: est.km,
      durationMinutes: est.minutes,
      distanceMeters: est.km != null ? Math.round(est.km * 1000) : null,
      durationSeconds: est.minutes * 60,
      distance: est.km != null ? `${est.km} km` : 'Distance estimate unavailable',
      duration: `${est.minutes} mins`,
      mode: (est.km || 0) > 80 ? 'Intercity transfer' : 'Local transit',
      estimated: true,
      source: 'haversine-fallback',
      provider: 'haversine-fallback',
      fallback: true,
      polyline: null,
      tip: 'Approximate travel time from map distance, not a live traffic route.'
    });
  }

  totalKm = Math.round(totalKm * 10) / 10;

  const fallbackPayload = {
    legs,
    polyline: null,
    totalDistance: `${totalKm} km`,
    totalDuration: totalMin >= 60 ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m` : `${totalMin} mins`,
    totalDistanceKm: totalKm,
    totalDurationMinutes: totalMin,
    source: 'haversine-fallback',
    provider: 'haversine-fallback',
    estimated: true,
    fallback: true
  };
  cacheSet(key, fallbackPayload, 15 * 60 * 1000);
  return fallbackPayload;
}
