/**
 * Vercel Serverless Function: /api/places-autocomplete
 * Provides location autocomplete predictions using Google Places Autocomplete API.
 *
 * Security:
 * - Reads process.env.GOOGLE_MAPS_API_KEY securely on the server.
 * - Never exposes secret API keys to client-side code.
 * - Features a high-reliability fallback if Google Places API key is not configured.
 */

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Please use POST or GET.'
    });
  }

  let input = '';
  if (req.method === 'POST') {
    input = (req.body?.input || req.body?.query || '').trim();
  } else {
    input = (req.query?.input || req.query?.query || req.query?.q || '').trim();
  }

  if (!input || input.length < 2) {
    return res.status(200).json({
      success: true,
      predictions: []
    });
  }

  const googleApiKey = (process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '').trim();

  // 1. Try Google Places API (New) Autocomplete if key is available
  if (googleApiKey) {
    try {
      const googleUrl = 'https://places.googleapis.com/v1/places:autocomplete';
      const googleRes = await fetch(googleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleApiKey
        },
        body: JSON.stringify({
          input,
          languageCode: 'en'
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (googleRes.ok) {
        const googleData = await googleRes.json();
        const suggestions = Array.isArray(googleData.suggestions) ? googleData.suggestions : [];

        const predictions = suggestions
          .map((s) => {
            const p = s.placePrediction;
            if (!p) return null;
            const placeId = p.placeId || (p.place ? p.place.replace(/^places\//, '') : '');
            const description = p.text?.text || p.structuredFormat?.mainText?.text || '';
            const mainText = p.structuredFormat?.mainText?.text || description;
            const secondaryText = p.structuredFormat?.secondaryText?.text || '';
            const types = p.types || [];

            return {
              placeId,
              description,
              mainText,
              secondaryText,
              types
            };
          })
          .filter(Boolean);

        return res.status(200).json({
          success: true,
          provider: 'google-places-new',
          predictions
        });
      } else {
        const errText = await googleRes.text().catch(() => '');
        console.warn(`[VIHARA Places API] Google Places (New) Autocomplete returned ${googleRes.status}:`, errText.slice(0, 200));
      }
    } catch (err) {
      console.warn('[VIHARA Places API] Google Places (New) Autocomplete error:', err.message);
    }
  }

  // 2. High-reliability fallback using OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=6`;
    const nominatimRes = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'VIHARA-Tourism-App/1.0 (vihara-heritage-travel)'
      }
    });

    if (nominatimRes.ok) {
      const data = await nominatimRes.json();
      const predictions = (Array.isArray(data) ? data : []).map((item) => {
        const parts = (item.display_name || '').split(',');
        const mainText = parts[0]?.trim() || item.name || input;
        const secondaryText = parts.slice(1).join(',').trim();

        return {
          placeId: `osm_${item.place_id}`,
          description: item.display_name,
          mainText,
          secondaryText,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          types: [item.type || 'locality']
        };
      });

      return res.status(200).json({
        success: true,
        provider: 'nominatim',
        predictions
      });
    }
  } catch (err) {
    console.error('[VIHARA Places API] Fallback autocomplete error:', err.message);
  }

  return res.status(200).json({
    success: true,
    predictions: []
  });
}
