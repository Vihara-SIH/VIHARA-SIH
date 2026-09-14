import { applyCors, rateLimit } from './_lib/http.js';

function mapsKey() {
  return (process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '').trim();
}

const CATEGORY_HINTS = {
  heritage: { type: 'tourist_attraction', keyword: 'heritage fort palace monument' },
  spiritual: { type: 'place_of_worship', keyword: 'temple church mosque' },
  nature: { type: 'park', keyword: 'lake garden waterfall beach' },
  adventure: { type: 'tourist_attraction', keyword: 'trek adventure viewpoint' },
  forts: { type: 'tourist_attraction', keyword: 'fort' },
  temples: { type: 'hindu_temple', keyword: 'temple' },
  beaches: { type: 'natural_feature', keyword: 'beach' }
};

export default async function handler(req, res) {
  applyCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const limited = rateLimit(req, { max: 30 });
  if (!limited.ok) {
    return res.status(429).json({ success: false, error: 'Too many place searches. Please wait a moment.' });
  }

  const src = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const lat = parseFloat(src.latitude ?? src.lat);
  const lng = parseFloat(src.longitude ?? src.lng);
  const radius = Math.min(30000, Math.max(1000, parseInt(src.radius, 10) || 12000));
  const category = String(src.category || src.placeType || 'heritage').toLowerCase();
  const destination = String(src.destination || '').trim();

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ success: false, error: 'latitude and longitude are required.' });
  }

  const hint = CATEGORY_HINTS[category] || CATEGORY_HINTS.heritage;
  const key = mapsKey();

  if (key) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${encodeURIComponent(hint.type)}&keyword=${encodeURIComponent(hint.keyword)}&key=${encodeURIComponent(key)}`;
      const googleRes = await fetch(url);
      const googleData = await googleRes.json();
      if (googleData.status === 'OK' || googleData.status === 'ZERO_RESULTS') {
        const places = (googleData.results || []).slice(0, 12).map((p) => ({
          placeId: p.place_id,
          place_id: p.place_id,
          name: p.name,
          vicinity: p.vicinity,
          types: p.types,
          rating: p.rating,
          user_ratings_total: p.user_ratings_total,
          geometry: p.geometry,
          latitude: p.geometry?.location?.lat,
          longitude: p.geometry?.location?.lng,
          openingHours: p.opening_hours,
          source: 'google'
        }));
        return res.status(200).json({
          success: true,
          provider: 'google',
          estimated: false,
          fallback: false,
          places
        });
      }
      console.warn('[places-nearby] Google status', googleData.status, googleData.error_message);
    } catch (err) {
      console.warn('[places-nearby] Google error', err.message);
    }
  }

  try {
    const q = `${hint.keyword} ${destination || ''}`.trim();
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8&addressdetails=1`;
    const nomRes = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'VIHARA-Tourism-App/1.0 (vihara-heritage-travel)' }
    });
    if (nomRes.ok) {
      const data = await nomRes.json();
      const places = (Array.isArray(data) ? data : []).map((item) => ({
        placeId: `osm_${item.place_id}`,
        name: item.display_name?.split(',')[0] || item.name,
        vicinity: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        types: [item.type],
        source: 'nominatim'
      }));
      return res.status(200).json({
        success: true,
        provider: 'nominatim',
        estimated: false,
        fallback: true,
        places
      });
    }
  } catch (err) {
    console.error('[places-nearby] Nominatim error', err.message);
  }

  return res.status(200).json({
    success: true,
    provider: 'none',
    fallback: true,
    estimated: false,
    places: [],
    error: 'No nearby provider available'
  });
}
