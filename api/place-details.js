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

  const googleApiKey = (process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '').trim();

  // 1. If Google API Key available and placeId is not a fallback OSM ID
  if (googleApiKey && placeId && !placeId.startsWith('osm_')) {
    try {
      const cleanPlaceId = placeId.replace(/^places\//, '');
      const googleUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(cleanPlaceId)}`;
      const googleRes = await fetch(googleUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleApiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,addressComponents,types,rating,userRatingCount,currentOpeningHours,googleMapsUri'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (googleRes.ok) {
        const r = await googleRes.json();
        const latitude = r.location?.latitude ?? r.geometry?.location?.lat;
        const longitude = r.location?.longitude ?? r.geometry?.location?.lng;
        const components = r.addressComponents || r.address_components || [];

        let city = '';
        let state = '';
        let country = '';

        for (const comp of components) {
          const types = comp.types || [];
          const text = comp.longText || comp.long_name || '';
          if (!city && (types.includes('locality') || types.includes('sublocality_level_1') || types.includes('postal_town') || types.includes('administrative_area_level_2'))) {
            city = text;
          }
          if (!state && types.includes('administrative_area_level_1')) {
            state = text;
          }
          if (!country && types.includes('country')) {
            country = text;
          }
        }

        const name = r.displayName?.text || r.name || city || 'Selected Place';
        const formattedAddress = r.formattedAddress || r.formatted_address || [name, state, country].filter(Boolean).join(', ');
        const currentLocationName = formattedAddress || `${name}, ${state || ''}, ${country || 'India'}`;

        return res.status(200).json({
          success: true,
          provider: 'google-places-new',
          place: {
            placeId: r.id || placeId,
            name,
            formattedAddress,
            currentLocationName,
            currentLocationLatitude: latitude,
            currentLocationLongitude: longitude,
            latitude,
            longitude,
            city: city || name,
            state: state || '',
            country: country || 'India',
            rating: r.rating || null,
            userRatingCount: r.userRatingCount || 0,
            types: r.types || [],
            googleMapsUri: r.googleMapsUri || null
          }
        });
      } else {
        const errText = await googleRes.text().catch(() => '');
        console.warn(`[VIHARA Place Details] Google Places (New) returned ${googleRes.status}:`, errText.slice(0, 200));
      }
    } catch (err) {
      console.warn('[VIHARA Place Details] Google Places (New) error:', err.message);
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
