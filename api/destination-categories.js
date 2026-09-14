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

/**
 * Known commercial/non-attraction Google Place types that should NOT be classified
 * as cultural/tourism attractions unless they explicitly carry a genuine tourism type.
 */
const NON_ATTRACTION_TYPES = new Set([
  'lodging', 'hotel', 'motel', 'guest_house', 'resort_hotel', 'bed_and_breakfast',
  'restaurant', 'cafe', 'bar', 'food', 'bakery', 'meal_takeaway', 'meal_delivery',
  'gas_station', 'car_repair', 'car_wash', 'bank', 'atm', 'accounting',
  'clothing_store', 'electronics_store', 'furniture_store', 'home_goods_store',
  'convenience_store', 'grocery_or_supermarket', 'supermarket', 'liquor_store',
  'pharmacy', 'hospital', 'doctor', 'dentist', 'veterinary_care',
  'real_estate_agency', 'travel_agency', 'insurance_agency', 'lawyer'
]);

const GENUINE_TOURISM_TYPES = new Set([
  'tourist_attraction', 'point_of_interest', 'place_of_worship', 'hindu_temple',
  'church', 'mosque', 'synagogue', 'museum', 'art_gallery', 'national_park',
  'park', 'campground', 'amusement_park', 'zoo', 'aquarium', 'natural_feature',
  'historical_landmark', 'historical_place', 'monument', 'hiking_area', 'cultural_center',
  'state_park', 'botanical_garden', 'wildlife_park', 'wildlife_refuge',
  'scenic_viewpoint', 'beach', 'rafting', 'adventure_sports_center'
]);

/**
 * Deterministic mapping rules from Google Place Types and clean name keywords
 * to existing VIHARA Category & Subcategory definitions.
 *
 * Destination-agnostic: relies strictly on place signals, not hardcoded cities/states.
 */
export function classifyGooglePlace(place) {
  const types = Array.isArray(place.types) ? place.types : [];
  const name = String(place.name || '').toLowerCase();
  const vicinity = String(place.vicinity || '').toLowerCase();

  // 1. Guard against non-attraction commercial places (e.g., Hotel Taj Mahal, Temple View Cafe)
  const isCommercialType = types.some(t => NON_ATTRACTION_TYPES.has(t));
  const hasGenuineTourismType = types.some(t => GENUINE_TOURISM_TYPES.has(t));

  if (isCommercialType && !hasGenuineTourismType) {
    // Commercial place with no tourism indicator -> ignore
    return { categories: [], subcategories: [] };
  }

  // Commercial name patterns like "hotel ...", "... restaurant", "... cafe" when not a palace/museum hotel
  const isExplicitCommercialName = /\b(hotel|resort|restaurant|cafe|dhaba|bhojanalaya|sweets|bakery|homestay|guest house|petrol pump|atm|store|shop)\b/i.test(name);
  if (isExplicitCommercialName && !types.includes('tourist_attraction') && !types.includes('museum') && !types.includes('historical_landmark')) {
    // Treat purely as hospitality, not an attraction
    return { categories: [], subcategories: [] };
  }

  const matchedSubcategories = new Set();
  const matchedCategories = new Set();

  // ─── 1. SPIRITUAL ───
  // Temples
  if (
    types.includes('hindu_temple') ||
    /\b(temple|mandir|kovil|gudi|devasthanam|devalayam|shrine|basadi|stupa)\b/i.test(name)
  ) {
    matchedSubcategories.add('temples');
    matchedCategories.add('spiritual');
  }

  // Ashrams
  if (/\b(ashram|matha|mutt|hermitage|peetham|dhyanalinga|adheenam)\b/i.test(name)) {
    matchedSubcategories.add('ashrams');
    matchedCategories.add('spiritual');
  }

  // Pilgrimage Sites
  if (
    types.includes('place_of_worship') ||
    types.includes('church') ||
    types.includes('mosque') ||
    types.includes('synagogue') ||
    /\b(dargah|gurudwara|gurdwara|monastery|pagoda|cathedral|basilica|masjid|pilgrim|holy|sacred|sanctuary|tirtha)\b/i.test(name)
  ) {
    matchedSubcategories.add('pilgrimage-sites');
    matchedCategories.add('spiritual');
  }

  // Spiritual Towns / Sacred Confluences
  if (/\b(dham|kshetra|sangam|prayag|har ki pauri|dashashwamedh|assi ghat|manikarnika)\b/i.test(name)) {
    matchedSubcategories.add('spiritual-towns');
    matchedCategories.add('spiritual');
  }

  // Yoga & Meditation
  if (/\b(yoga|meditation|dhyan|dhyana|vipassana|spiritual retreat|sound healing)\b/i.test(name)) {
    matchedSubcategories.add('yoga-meditation');
    matchedCategories.add('spiritual');
  }

  // ─── 2. HERITAGE ───
  // Forts
  if (/\b(fort|gadh|garh|qila|kila|kot|durg|citadel|bastion)\b/i.test(name)) {
    matchedSubcategories.add('forts');
    matchedCategories.add('heritage');
  }

  // Palaces
  if (/\b(palace|mahal|haveli|mansion|durbar|rajwada|royal court)\b/i.test(name)) {
    matchedSubcategories.add('palaces');
    matchedCategories.add('heritage');
  }

  // Historical Monuments
  if (
    types.includes('museum') ||
    types.includes('historical_landmark') ||
    types.includes('historical_place') ||
    types.includes('monument') ||
    types.includes('archaeological_site') ||
    types.includes('cultural_center') ||
    /\b(monument|memorial|tomb|minar|ruins|caves|stepwell|bawdi|baoli|pillar|gate|darwaza|chhatri|cenotaph|archaeological|clock tower|heritage site|historical)\b/i.test(name)
  ) {
    matchedSubcategories.add('historical-monuments');
    matchedCategories.add('heritage');
  }

  // UNESCO Sites & Ancient Wonders
  if (
    /\b(unesco|world heritage|group of monuments|ancient ruins|hampi|ajanta|ellora|elephanta|qutb|khajuraho|mahabalipuram|konark|fatehpur sikri|pattadakal|rani ki vav|nalanda|sanchi)\b/i.test(name)
  ) {
    matchedSubcategories.add('unesco-sites');
    matchedCategories.add('heritage');
  }

  // Heritage Walks / Historic Quarters
  if (
    /\b(heritage walk|bazaar|old town|chowk|street|lane|market|bazar|latin quarter|fontainhas|jew town)\b/i.test(name) ||
    (types.includes('tourist_attraction') && /\b(historic|heritage|old city|quarter)\b/i.test(name))
  ) {
    matchedSubcategories.add('heritage-walks');
    matchedCategories.add('heritage');
  }

  // ─── 3. NATURE ───
  // Hills & Valleys
  if (
    types.includes('scenic_viewpoint') ||
    /\b(hill|hills|valley|valleys|peak|ridge|cliff|pass|mountain pass|ghats|view point|viewpoint|sunset point|sunrise point)\b/i.test(name)
  ) {
    matchedSubcategories.add('hills-valleys');
    matchedCategories.add('nature');
  }

  // Waterfalls
  if (
    types.includes('waterfall') ||
    /\b(waterfall|waterfalls|falls|water fall|cascade|cataract)\b/i.test(name)
  ) {
    matchedSubcategories.add('waterfalls');
    matchedCategories.add('nature');
  }

  // Beaches & Coastal Shorelines
  if (
    types.includes('beach') ||
    /\b(beach|beaches|coast|shore|cove|promenade|sea shore|bay)\b/i.test(name) ||
    (types.includes('natural_feature') && /\b(sea|ocean|coast|beach|creek)\b/i.test(name))
  ) {
    matchedSubcategories.add('beaches');
    matchedCategories.add('nature');
  }

  // National Parks & Wildlife Sanctuaries
  if (
    types.includes('national_park') ||
    types.includes('state_park') ||
    types.includes('wildlife_park') ||
    types.includes('wildlife_refuge') ||
    types.includes('botanical_garden') ||
    types.includes('zoo') ||
    types.includes('aquarium') ||
    /\b(national park|wildlife sanctuary|tiger reserve|bird sanctuary|deer park|safari park|biosphere|reserve forest|nature reserve|botanical garden)\b/i.test(name) ||
    (types.includes('park') && /\b(national|wildlife|sanctuary|reserve|forest)\b/i.test(name))
  ) {
    matchedSubcategories.add('national-parks');
    matchedCategories.add('nature');
  }

  // Lakes & Water Bodies
  if (
    /\b(lake|lakes|talab|sagar|dam|backwaters|backwater|reservoir|pond|river|canal)\b/i.test(name) ||
    (types.includes('natural_feature') && /\b(lake|river|water|island)\b/i.test(name))
  ) {
    matchedSubcategories.add('lakes');
    matchedCategories.add('nature');
  }

  // ─── 4. ADVENTURE ───
  // Trekking & Hiking
  if (
    types.includes('hiking_area') ||
    /\b(trek|trekking|trail|hiking|hike|summit|peak climb|base camp|rock climbing)\b/i.test(name)
  ) {
    matchedSubcategories.add('trekking');
    matchedCategories.add('adventure');
  }

  // Camping & Glamping
  if (
    types.includes('campground') ||
    /\b(camp|camping|glamping|tent|campsite)\b/i.test(name)
  ) {
    matchedSubcategories.add('camping');
    matchedCategories.add('adventure');
  }

  // River Rafting & Water Sports
  if (
    types.includes('rafting') ||
    types.includes('adventure_sports_center') ||
    /\b(rafting|river rafting|kayak|kayaking|water sports|boating|boat club|canoeing|scuba|snorkeling|surfing|jet ski)\b/i.test(name)
  ) {
    matchedSubcategories.add('river-rafting');
    matchedCategories.add('adventure');
  }

  // Paragliding & Aerial Activities
  if (
    /\b(paragliding|parasailing|zipline|skydive|skydiving|ropeway|cable car|bungee|hot air balloon)\b/i.test(name)
  ) {
    matchedSubcategories.add('paragliding');
    matchedCategories.add('adventure');
  }

  // Wildlife Safari
  if (
    /\b(safari|jungle safari|jeep safari|wildlife tour|tiger safari|elephant safari)\b/i.test(name) ||
    (types.includes('zoo') && /\b(safari)\b/i.test(name))
  ) {
    matchedSubcategories.add('wildlife-safari');
    matchedCategories.add('adventure');
  }

  return {
    categories: Array.from(matchedCategories),
    subcategories: Array.from(matchedSubcategories)
  };
}

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
