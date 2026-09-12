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

  const googleApiKey = (process.env.GOOGLE_MAPS_API_KEY || '').trim();

  // 1. Try Google Places Autocomplete API if key is available
  if (googleApiKey) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&language=en&key=${encodeURIComponent(googleApiKey)}`;
      const googleRes = await fetch(googleUrl);
      const googleData = await googleRes.json();

      if (googleData.status === 'OK' && Array.isArray(googleData.predictions)) {
        const predictions = googleData.predictions.map((p) => ({
          placeId: p.place_id,
          description: p.description,
          mainText: p.structured_formatting?.main_text || p.description,
          secondaryText: p.structured_formatting?.secondary_text || '',
          types: p.types || []
        }));

        return res.status(200).json({
          success: true,
          provider: 'google',
          predictions
        });
      } else if (googleData.status === 'ZERO_RESULTS') {
        return res.status(200).json({
          success: true,
          provider: 'google',
          predictions: []
        });
      } else {
        console.warn('[VIHARA Places API] Google Places Autocomplete status:', googleData.status, googleData.error_message);
      }
    } catch (err) {
      console.warn('[VIHARA Places API] Google Places Autocomplete query error:', err.message);
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
