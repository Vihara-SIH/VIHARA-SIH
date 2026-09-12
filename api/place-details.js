/**
 * Vercel Serverless Function: /api/place-details
 * Fetches exact latitude, longitude, place name, and formatted address for a selected Google Place ID.
 *
 * Security:
 * - Reads process.env.GOOGLE_MAPS_API_KEY securely on the server.
 * - Never exposes secret API keys to client-side code.
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

  let placeId = '';
  let description = '';
  let lat = null;
  let lng = null;

  if (req.method === 'POST') {
    const body = req.body || {};
    placeId = (body.placeId || body.place_id || '').trim();
    description = (body.description || body.name || '').trim();
    lat = body.latitude !== undefined ? body.latitude : body.lat;
    lng = body.longitude !== undefined ? body.longitude : body.lng;
  } else {
    placeId = (req.query?.placeId || req.query?.place_id || '').trim();
    description = (req.query?.description || req.query?.name || '').trim();
    lat = req.query?.latitude || req.query?.lat;
    lng = req.query?.longitude || req.query?.lng;
  }

  if (!placeId && !description && (lat === undefined || lng === undefined)) {
    return res.status(400).json({
      success: false,
      error: 'A valid placeId or location description is required.'
    });
  }

  const googleApiKey = (process.env.GOOGLE_MAPS_API_KEY || '').trim();

  // 1. If Google API Key available and placeId is not a fallback OSM ID
  if (googleApiKey && placeId && !placeId.startsWith('osm_')) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,formatted_address,geometry,address_components,place_id&key=${encodeURIComponent(googleApiKey)}`;
      const googleRes = await fetch(googleUrl);
      const googleData = await googleRes.json();

      if (googleData.status === 'OK' && googleData.result) {
        const r = googleData.result;
        const latitude = r.geometry?.location?.lat;
        const longitude = r.geometry?.location?.lng;
        const components = r.address_components || [];

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

        const name = r.name || city || 'Selected Place';
        const formattedAddress = r.formatted_address || [name, state, country].filter(Boolean).join(', ');
        const currentLocationName = formattedAddress || `${name}, ${state || ''}, ${country || 'India'}`;

        return res.status(200).json({
          success: true,
          provider: 'google',
          place: {
            placeId: r.place_id || placeId,
            name,
            formattedAddress,
            currentLocationName,
            currentLocationLatitude: latitude,
            currentLocationLongitude: longitude,
            latitude,
            longitude,
            city: city || name,
            state: state || '',
            country: country || 'India'
          }
        });
      } else {
        console.warn('[VIHARA Place Details] Google Place Details status:', googleData.status, googleData.error_message);
      }
    } catch (err) {
      console.warn('[VIHARA Place Details] Google Place Details error:', err.message);
    }
  }

  // 2. Direct coordinates fallback (e.g. from Nominatim autocomplete item)
  if (lat !== null && lat !== undefined && lng !== null && lng !== undefined && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const name = description ? description.split(',')[0].trim() : 'Selected Location';
    const formattedAddress = description || name;

    return res.status(200).json({
      success: true,
      provider: 'nominatim',
      place: {
        placeId: placeId || `loc_${latNum}_${lngNum}`,
        name,
        formattedAddress,
        currentLocationName: formattedAddress,
        currentLocationLatitude: latNum,
        currentLocationLongitude: lngNum,
        latitude: latNum,
        longitude: lngNum,
        city: name,
        state: '',
        country: 'India'
      }
    });
  }

  // 3. Fallback Nominatim search for description / place name
  if (description) {
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(description)}&addressdetails=1&limit=1`;
      const searchRes = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'VIHARA-Tourism-App/1.0 (vihara-heritage-travel)'
        }
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (Array.isArray(searchData) && searchData.length > 0) {
          const item = searchData[0];
          const latNum = parseFloat(item.lat);
          const lngNum = parseFloat(item.lon);
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.municipality || description.split(',')[0].trim();
          const state = addr.state || '';
          const country = addr.country || 'India';
          const formattedAddress = item.display_name || [city, state, country].filter(Boolean).join(', ');

          return res.status(200).json({
            success: true,
            provider: 'nominatim',
            place: {
              placeId: placeId || `osm_${item.place_id}`,
              name: city,
              formattedAddress,
              currentLocationName: formattedAddress,
              currentLocationLatitude: latNum,
              currentLocationLongitude: lngNum,
              latitude: latNum,
              longitude: lngNum,
              city,
              state,
              country
            }
          });
        }
      }
    } catch (err) {
      console.error('[VIHARA Place Details] Fallback search error:', err.message);
    }
  }

  return res.status(404).json({
    success: false,
    error: 'Unable to retrieve location details for the selected place. Please try another search.'
  });
}
