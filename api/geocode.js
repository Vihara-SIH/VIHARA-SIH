/**
 * Vercel Serverless Function: /api/geocode
 * Handles reverse-geocoding of latitude and longitude into human-readable city, state, country, and formatted address.
 *
 * Security:
 * - Reads process.env.GOOGLE_MAPS_API_KEY securely on the server.
 * - Never exposes secret API keys to client-side code.
 * - Provides reliable fallback reverse-geocoding if Google Maps API key is not configured.
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

  // Extract latitude and longitude from request body (POST) or query string (GET)
  let latitude = null;
  let longitude = null;

  if (req.method === 'POST') {
    const body = req.body || {};
    latitude = body.latitude !== undefined ? body.latitude : body.lat;
    longitude = body.longitude !== undefined ? body.longitude : body.lng;
  } else {
    latitude = req.query?.latitude || req.query?.lat;
    longitude = req.query?.longitude || req.query?.lng;
  }

  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);

  if (
    isNaN(latNum) ||
    isNaN(lngNum) ||
    latNum < -90 ||
    latNum > 90 ||
    lngNum < -180 ||
    lngNum > 180
  ) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.'
    });
  }

  const googleApiKey = (process.env.GOOGLE_MAPS_API_KEY || '').trim();

  // 1. Try Google Maps Geocoding API if key is available
  if (googleApiKey) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latNum},${lngNum}&key=${encodeURIComponent(googleApiKey)}`;
      const googleRes = await fetch(googleUrl);
      const googleData = await googleRes.json();

      if (googleData.status === 'OK' && Array.isArray(googleData.results) && googleData.results.length > 0) {
        const result = googleData.results[0];
        const components = result.address_components || [];

        let city = '';
        let state = '';
        let country = '';

        for (const comp of components) {
          const types = comp.types || [];
          if (!city && (types.includes('locality') || types.includes('sublocality_level_1') || types.includes('postal_town') || types.includes('administrative_area_level_2'))) {
            city = comp.long_name;
          }
          if (!state && types.includes('administrative_area_level_1')) {
            state = comp.long_name;
          }
          if (!country && types.includes('country')) {
            country = comp.long_name;
          }
        }

        // If locality was missing in deep components, find any reasonable name
        if (!city && state) city = state;

        const formattedAddress = result.formatted_address || [city, state, country].filter(Boolean).join(', ');
        const currentLocationName = formattedAddress || `${city || 'Detected Area'}, ${state || ''}, ${country || 'India'}`;

        return res.status(200).json({
          success: true,
          provider: 'google',
          location: {
            currentLocationName,
            currentLocationLatitude: latNum,
            currentLocationLongitude: lngNum,
            latitude: latNum,
            longitude: lngNum,
            city: city || 'Unknown City',
            state: state || '',
            country: country || 'India',
            formattedAddress: currentLocationName
          }
        });
      } else {
        console.warn('[VIHARA Geocode API] Google Geocoding returned non-OK status:', googleData.status);
      }
    } catch (err) {
      console.warn('[VIHARA Geocode API] Error querying Google Geocoding API:', err.message);
    }
  }

  // 2. High-reliability fallback using OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lngNum}&zoom=18&addressdetails=1`;
    const nominatimRes = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'VIHARA-Tourism-App/1.0 (vihara-heritage-travel)'
      }
    });

    if (nominatimRes.ok) {
      const data = await nominatimRes.json();
      const addr = data.address || {};

      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.suburb ||
        addr.county ||
        addr.state_district ||
        'Detected Location';

      const state = addr.state || '';
      const country = addr.country || 'India';

      // Clean formatted address
      const parts = [city, state, country].filter(Boolean);
      const cleanFormatted = parts.length > 0 ? parts.join(', ') : (data.display_name || 'Detected Location');

      return res.status(200).json({
        success: true,
        provider: 'nominatim',
        location: {
          currentLocationName: cleanFormatted,
          currentLocationLatitude: latNum,
          currentLocationLongitude: lngNum,
          latitude: latNum,
          longitude: lngNum,
          city,
          state,
          country,
          formattedAddress: cleanFormatted
        }
      });
    }
  } catch (err) {
    console.error('[VIHARA Geocode API] Nominatim fallback failed:', err.message);
  }

  // Fallback response with coordinates
  return res.status(500).json({
    success: false,
    error: 'Unable to determine your current location name. Please try again.'
  });
}
