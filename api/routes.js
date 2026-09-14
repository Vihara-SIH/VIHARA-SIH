import { applyCors, rateLimit } from './_lib/http.js';

function mapsKey() {
  return (process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '').trim();
}

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function estimateLeg(from, to, index) {
  const km = haversineKm(from, to);
  const speed = km < 8 ? 22 : km < 40 ? 32 : km < 200 ? 55 : 70;
  const minutes = Math.max(8, Math.round((km / speed) * 60) + 5);
  return {
    legIndex: index + 1,
    from: from.name,
    to: to.name,
    distanceKm: Math.round(km * 10) / 10,
    durationMinutes: minutes,
    distance: `${Math.round(km * 10) / 10} km`,
    duration: minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} mins`,
    mode: km > 80 ? 'Intercity transfer' : 'Local transit',
    estimated: true,
    source: 'haversine',
    tip: 'Approximate geodesic estimate. Not live traffic.'
  };
}

function parsePoint(p, i) {
  const lat = parseFloat(p.latitude ?? p.lat);
  const lng = parseFloat(p.longitude ?? p.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { name: p.name || `Stop ${i + 1}`, lat, lng };
}

export default async function handler(req, res) {
  applyCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const limited = rateLimit(req, { max: 25 });
  if (!limited.ok) {
    return res.status(429).json({ success: false, error: 'Routing rate limit exceeded.' });
  }

  const src = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const rawPoints = src.waypoints || [];
  const points = rawPoints.map(parsePoint).filter(Boolean);

  if (points.length < 2) {
    return res.status(400).json({ success: false, error: 'At least two waypoints with coordinates are required.' });
  }

  const key = mapsKey();
  if (key) {
    try {
      const legs = [];
      for (let i = 0; i < points.length - 1; i++) {
        const from = points[i];
        const to = points[i + 1];
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from.lat},${from.lng}&destinations=${to.lat},${to.lng}&mode=driving&units=metric&key=${encodeURIComponent(key)}`;
        const dmRes = await fetch(url);
        const dm = await dmRes.json();
        const el = dm?.rows?.[0]?.elements?.[0];
        if (dm.status === 'OK' && el?.status === 'OK') {
          legs.push({
            legIndex: i + 1,
            from: from.name,
            to: to.name,
            distanceKm: Math.round((el.distance.value / 1000) * 10) / 10,
            durationMinutes: Math.round(el.duration.value / 60),
            distance: el.distance.text,
            duration: el.duration.text,
            mode: el.distance.value > 80000 ? 'Intercity transfer' : 'Driving',
            estimated: false,
            source: 'google-distance-matrix',
            tip: 'Driving time from Google Distance Matrix (typical traffic, not live).'
          });
        } else {
          legs.push(estimateLeg(from, to, i));
        }
      }
      const usedLive = legs.some((l) => l.source === 'google-distance-matrix');
      return res.status(200).json({
        success: true,
        provider: usedLive ? 'google-distance-matrix' : 'haversine',
        estimated: !usedLive,
        legs
      });
    } catch (err) {
      console.warn('[routes] Google Distance Matrix failed', err.message);
    }
  }

  const legs = [];
  for (let i = 0; i < points.length - 1; i++) {
    legs.push(estimateLeg(points[i], points[i + 1], i));
  }
  return res.status(200).json({
    success: true,
    provider: 'haversine',
    estimated: true,
    legs
  });
}
