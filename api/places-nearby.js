import { applyCors, rateLimit } from './_lib/http.js';

function mapsKey() {
  return (process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '').trim();
}

const CATEGORY_HINTS = {
  heritage: { type: 'tourist_attraction', keyword: 'heritage' },
  spiritual: { type: 'place_of_worship', keyword: 'temple' },
  nature: { type: 'natural_feature', keyword: 'nature' },
  adventure: { type: 'tourist_attraction', keyword: 'adventure' },
  forts: { type: 'tourist_attraction', keyword: 'fort' },
  temples: { type: 'hindu_temple', keyword: 'temple' },
  beaches: { type: 'natural_feature', keyword: 'beach' },
  waterfalls: { type: 'natural_feature', keyword: 'waterfall' },
  lakes: { type: 'natural_feature', keyword: 'lake' },
  palaces: { type: 'tourist_attraction', keyword: 'palace' }
};

function extractVisitingHours(p) {
  const reg = p.regularOpeningHours || p.currentOpeningHours;
  const periods = reg?.periods;
  const desc = (reg?.weekdayDescriptions || []).join(' ');

  if (/open\s*24\s*hours|24\s*hours\s*open/i.test(desc)) {
    return { open: 'Open 24 hours', close: '' };
  }

  if (Array.isArray(periods) && periods.length > 0) {
    const p0 = periods[0];
    if (p0.open && !p0.close && periods.length === 1) {
      return { open: 'Open 24 hours', close: '' };
    }

    const formatTime = (t) => {
      const h = Number(t.hour ?? 9);
      const m = String(t.minute ?? 0).padStart(2, '0');
      const ap = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${m} ${ap}`;
    };

    if (p0.open && p0.close) {
      return {
        open: formatTime(p0.open),
        close: formatTime(p0.close)
      };
    }
    if (p0.open && !p0.close) {
      return {
        open: formatTime(p0.open),
        close: ''
      };
    }
  }
  return null;
}

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
      const q = destination ? `${hint.keyword} in ${destination}` : hint.keyword;
      const url = 'https://places.googleapis.com/v1/places:searchText';
      const googleRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount,places.currentOpeningHours,places.regularOpeningHours,places.googleMapsUri,places.priceLevel'
        },
        body: JSON.stringify({
          textQuery: q,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius
            }
          },
          maxResultCount: 12
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (googleRes.ok) {
        const googleData = await googleRes.json();
        const rawList = Array.isArray(googleData.places) ? googleData.places : [];
        if (rawList.length > 0) {
          const places = rawList.slice(0, 12).map((p) => {
            const pLat = p.location?.latitude;
            const pLng = p.location?.longitude;
            const name = p.displayName?.text || p.name || 'Attraction';
            const vicinity = p.formattedAddress || '';
            const hours = extractVisitingHours(p);
            return {
              placeId: p.id,
              place_id: p.id,
              id: p.id,
              name,
              title: name,
              vicinity,
              formattedAddress: vicinity,
              types: p.types || [],
              rating: p.rating || null,
              user_ratings_total: p.userRatingCount || 0,
              userRatingCount: p.userRatingCount || 0,
              geometry: { location: { lat: pLat, lng: pLng } },
              latitude: pLat,
              longitude: pLng,
              coordinates: Number.isFinite(pLat) && Number.isFinite(pLng) ? { lat: pLat, lng: pLng } : null,
              openingHours: p.currentOpeningHours ? { open_now: !!p.currentOpeningHours.openNow } : null,
              visitingHours: hours,
              regularOpeningHours: p.regularOpeningHours || null,
              googleMapsUri: p.googleMapsUri || null,
              priceLevel: p.priceLevel || null,
              source: 'google-places-new',
              provider: 'google-places-new'
            };
          });

          return res.status(200).json({
            success: true,
            provider: 'google-places-new',
            estimated: false,
            fallback: false,
            places
          });
        }
      } else {
        const errText = await googleRes.text().catch(() => '');
        console.warn(`[places-nearby] Google Places (New) returned ${googleRes.status}:`, errText.slice(0, 200));
      }
    } catch (err) {
      console.warn('[places-nearby] Google Places (New) error:', err.message);
    }
  }

  try {
    const nomKeyword = hint.keyword || 'attraction';
    const q = destination ? `${nomKeyword} in ${destination}` : nomKeyword;
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
