import { applyCors, rateLimit } from './_lib/http.js';
import { DESTINATION_CATALOG, CATEGORY_DEFINITIONS } from '../src/services/destinationService.js';

function mapsKey() {
  return (process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '').trim();
}

// In-memory server-side cache for category discovery (12-hour TTL)
const categoryCache = new Map();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function getCacheKey(lat, lng, destName, radius) {
  return `${Number(lat).toFixed(2)}_${Number(lng).toFixed(2)}_${(destName || '').toLowerCase().trim()}_${radius || 25000}`;
}

import {
  classifyGooglePlace,
  NON_ATTRACTION_TYPES,
  GENUINE_TOURISM_TYPES
} from '../src/services/vihara/placeClassifier.js';

export { classifyGooglePlace, NON_ATTRACTION_TYPES, GENUINE_TOURISM_TYPES };


export default async function handler(req, res) {
  applyCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const limited = rateLimit(req, { max: 40 });
  if (!limited.ok) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded for category discovery. Please wait a moment.' });
  }

  const src = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const lat = parseFloat(src.latitude ?? src.lat);
  const lng = parseFloat(src.longitude ?? src.lng);
  const destination = String(src.destination || src.name || '').trim();
  const placeId = String(src.placeId || src.place_id || '').trim();

  // Intelligent radius calculation:
  // Default: 25,000m for cities/towns.
  // Large regions or states can request up to 50,000m (Google Places API circle maximum).
  const requestedRadius = parseInt(src.radius, 10);
  const radius = Math.min(50000, Math.max(3000, Number.isFinite(requestedRadius) ? requestedRadius : 25000));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ success: false, error: 'Valid latitude and longitude coordinates are required.' });
  }

  // Check in-memory cache
  const cacheKey = getCacheKey(lat, lng, destination, radius);
  const cached = categoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({
      ...cached.data,
      cached: true
    });
  }

  const key = mapsKey();

  // If Google API Key is present, query Google Places API (New) with 4 targeted queries
  if (key) {
    try {
      const url = 'https://places.googleapis.com/v1/places:searchText';
      const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating'
      };

      const locationBias = {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius
        }
      };

      // 4 Targeted pillar queries ensuring fair discovery for each category
      const queries = [
        { cat: 'spiritual', query: `temple ashram pilgrimage shrine place of worship in ${destination || 'area'}` },
        { cat: 'heritage', query: `fort palace monument heritage museum unesco site in ${destination || 'area'}` },
        { cat: 'nature', query: `park lake waterfall beach valley hill mountain in ${destination || 'area'}` },
        { cat: 'adventure', query: `trekking camping rafting paragliding safari adventure in ${destination || 'area'}` }
      ];

      const queryPromises = queries.map(q =>
        fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            textQuery: q.query,
            locationBias,
            maxResultCount: 10
          }),
          signal: AbortSignal.timeout(8000)
        })
          .then(async r => {
            if (r.ok) {
              const data = await r.json();
              return { ok: true, places: Array.isArray(data.places) ? data.places : [] };
            }
            const errText = await r.text().catch(() => '');
            return { ok: false, error: `Status ${r.status}: ${errText.slice(0, 100)}` };
          })
          .catch(err => ({ ok: false, error: err.message }))
      );

      const results = await Promise.all(queryPromises);

      // Check if any query succeeded or if all encountered an infrastructure/network/quota error
      const anySuccess = results.some(r => r.ok);
      const allErrors = results.every(r => !r.ok);

      if (allErrors) {
        // Genuine infrastructure/API failure -> TEMPORARILY_UNAVAILABLE
        console.warn(`[VIHARA Categories API] Google Places (New) queries all failed for "${destination}":`, results[0]?.error);
        return deliverFallbackResponse(res, lat, lng, destination, placeId, 'TEMPORARILY_UNAVAILABLE', results[0]?.error);
      }

      // Collect and normalize all returned places
      const placesRaw = [];
      const normalizeP = (p) => ({
        place_id: p.id,
        name: p.displayName?.text || p.name || '',
        vicinity: p.formattedAddress || '',
        types: p.types || [],
        rating: p.rating || null,
        geometry: { location: { lat: p.location?.latitude, lng: p.location?.longitude } }
      });

      for (const resItem of results) {
        if (resItem.ok && Array.isArray(resItem.places)) {
          placesRaw.push(...resItem.places.map(normalizeP));
        }
      }

      // Deduplicate places by Google place_id (or normalized name)
      const seen = new Set();
      const uniquePlaces = [];
      for (const p of placesRaw) {
        const id = p.place_id || (p.name || '').toLowerCase();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        uniquePlaces.push(p);
      }

      // Collect deterministic evidence for each category
      const categoryEvidence = {
        spiritual: [],
        heritage: [],
        nature: [],
        adventure: []
      };
      const detectedSubcategories = new Set();
      const detectedCategories = new Set();

      for (const place of uniquePlaces) {
        const { categories, subcategories } = classifyGooglePlace(place);
        for (const catId of categories) {
          detectedCategories.add(catId);
          if (categoryEvidence[catId]) {
            categoryEvidence[catId].push({
              name: place.name,
              placeId: place.place_id,
              types: place.types || [],
              rating: place.rating,
              vicinity: place.vicinity,
              matchedSubcategories: subcategories
            });
          }
        }
        for (const subId of subcategories) {
          detectedSubcategories.add(subId);
        }
      }

      // Status distinction: CONFIRMED_AVAILABLE vs NOT_CONFIRMED
      const categoryStatus = {};
      const allTopCategories = ['spiritual', 'heritage', 'nature', 'adventure'];
      const availableCategories = [];
      const unavailableCategories = [];

      for (const catId of allTopCategories) {
        const evCount = categoryEvidence[catId].length;
        if (evCount > 0) {
          categoryStatus[catId] = 'CONFIRMED_AVAILABLE';
          availableCategories.push(catId);
        } else {
          categoryStatus[catId] = 'NOT_CONFIRMED';
          unavailableCategories.push(catId);
        }
      }

      // Development logging (NO sensitive keys logged)
      console.log(`[VIHARA Categories] Destination: "${destination || 'Selected Location'}" (${lat.toFixed(4)}, ${lng.toFixed(4)}) radius=${radius}m`);
      console.log(`[VIHARA Categories] Google Places queries executed: 4 | Unique places: ${uniquePlaces.length}`);
      console.log(`[VIHARA Categories] Confirmed: [${availableCategories.join(', ')}] | Not Confirmed: [${unavailableCategories.join(', ')}]`);

      const responsePayload = {
        success: true,
        destination: {
          name: destination || 'Selected Location',
          latitude: lat,
          longitude: lng,
          placeId: placeId || null,
          radius
        },
        availableCategories,
        unavailableCategories,
        categoryStatus,
        subcategories: Array.from(detectedSubcategories),
        categoryEvidence,
        placesCount: uniquePlaces.length,
        provider: 'google-places-new',
        source: 'google-places-new',
        fallback: false
      };

      // Store in memory cache
      categoryCache.set(cacheKey, {
        timestamp: Date.now(),
        data: responsePayload
      });

      return res.status(200).json(responsePayload);
    } catch (err) {
      console.warn('[VIHARA Categories API] Google Places exception:', err.message);
      return deliverFallbackResponse(res, lat, lng, destination, placeId, 'TEMPORARILY_UNAVAILABLE', err.message);
    }
  }

  // ─── FALLBACK SYSTEM (When Google Maps Key is absent) ───
  return deliverFallbackResponse(res, lat, lng, destination, placeId, 'TEMPORARILY_UNAVAILABLE', 'API key not configured');
}

/**
 * Delivers labeled fallback data when Google Places API is unavailable or fails.
 * Explicitly marks status as TEMPORARILY_UNAVAILABLE instead of asserting the category does not exist.
 */
function deliverFallbackResponse(res, lat, lng, destination, placeId, status = 'TEMPORARILY_UNAVAILABLE', errorMsg = '') {
  console.warn(`[VIHARA Categories API] Falling back to catalog/static metadata for "${destination}"`);

  const simpleKey = (destination || '').toLowerCase().split(',')[0].trim();
  const catalogEntry = DESTINATION_CATALOG[simpleKey];

  if (catalogEntry && Array.isArray(catalogEntry.subcategories)) {
    const catalogSubs = catalogEntry.subcategories;
    const catEvidence = {
      spiritual: [],
      heritage: [],
      nature: [],
      adventure: []
    };

    (catalogEntry.places || []).forEach(p => {
      const mainCat = (p.category || '').toLowerCase();
      if (catEvidence[mainCat]) {
        catEvidence[mainCat].push({
          name: p.name,
          placeId: p.id,
          types: p.subcategories || [],
          matchedSubcategories: p.subcategories || []
        });
      }
    });

    const availCats = ['spiritual', 'heritage', 'nature', 'adventure'].filter(c => {
      const def = CATEGORY_DEFINITIONS[c];
      return def?.subcategories.some(s => catalogSubs.includes(s.id));
    });

    const categoryStatus = {};
    for (const c of ['spiritual', 'heritage', 'nature', 'adventure']) {
      categoryStatus[c] = availCats.includes(c) ? 'CONFIRMED_AVAILABLE' : status;
    }

    return res.status(200).json({
      success: true,
      destination: {
        name: catalogEntry.name || destination,
        latitude: lat,
        longitude: lng,
        placeId: placeId || simpleKey
      },
      availableCategories: availCats,
      unavailableCategories: ['spiritual', 'heritage', 'nature', 'adventure'].filter(c => !availCats.includes(c)),
      categoryStatus,
      subcategories: catalogSubs,
      categoryEvidence: catEvidence,
      placesCount: (catalogEntry.places || []).length,
      provider: 'catalog-fallback',
      source: 'catalog-fallback',
      fallback: true,
      error: errorMsg || undefined
    });
  }

  // Dynamic destination with zero Google API access and no catalog entry
  const categoryStatus = {};
  for (const c of ['spiritual', 'heritage', 'nature', 'adventure']) {
    categoryStatus[c] = status;
  }

  return res.status(200).json({
    success: true,
    destination: {
      name: destination || 'Selected Location',
      latitude: lat,
      longitude: lng,
      placeId: placeId || null
    },
    availableCategories: [],
    unavailableCategories: ['spiritual', 'heritage', 'nature', 'adventure'],
    categoryStatus,
    subcategories: [],
    categoryEvidence: {
      spiritual: [],
      heritage: [],
      nature: [],
      adventure: []
    },
    placesCount: 0,
    provider: 'none',
    source: 'fallback-empty',
    fallback: true,
    error: errorMsg || 'Google Places API unavailable and destination not in knowledge catalog'
  });
}
