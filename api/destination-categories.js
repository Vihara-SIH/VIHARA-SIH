import { applyCors, rateLimit } from './_lib/http.js';
import { DESTINATION_CATALOG, CATEGORY_DEFINITIONS } from '../src/services/destinationService.js';

function mapsKey() {
  return (process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '').trim();
}

// In-memory server-side cache for category discovery (12-hour TTL)
const categoryCache = new Map();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function getCacheKey(lat, lng, destName) {
  return `${Number(lat).toFixed(2)}_${Number(lng).toFixed(2)}_${(destName || '').toLowerCase().trim()}`;
}

/**
 * Deterministic mapping rules from Google Place Types and name keywords
 * to existing VIHARA Category & Subcategory definitions.
 */
export function classifyGooglePlace(place) {
  const types = Array.isArray(place.types) ? place.types : [];
  const typeStr = types.join(' ').toLowerCase();
  const name = String(place.name || '').toLowerCase();
  const vicinity = String(place.vicinity || '').toLowerCase();
  const combinedText = `${name} ${vicinity} ${typeStr}`;

  const matchedSubcategories = new Set();
  const matchedCategories = new Set();

  // ─── 1. SPIRITUAL ───
  // Temples
  if (
    types.includes('hindu_temple') ||
    /\b(temple|mandir|kovil|gudi|devasthanam|devalayam|shrine|basadi)\b/i.test(name)
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
    /\b(dargah|gurudwara|gurdwara|monastery|pagoda|church|cathedral|basilica|mosque|masjid|ghat|pilgrim|holy|sacred|sanctuary|tirtha)\b/i.test(name)
  ) {
    matchedSubcategories.add('pilgrimage-sites');
    matchedCategories.add('spiritual');
  }

  // Spiritual Towns
  if (/\b(dham|kshetra|ghat|kund|sangam|prayag|holy town)\b/i.test(combinedText)) {
    matchedSubcategories.add('spiritual-towns');
    matchedCategories.add('spiritual');
  }

  // Yoga & Meditation
  if (/\b(yoga|meditation|dhyan|dhyana|vipassana|spiritual retreat|sound healing|wellness center)\b/i.test(combinedText)) {
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
    /\b(monument|memorial|tomb|minar|ruins|caves|stepwell|bawdi|baoli|stupa|pillar|gate|darwaza|chhatri|cenotaph|archaeological|clock tower|heritage site|historical)\b/i.test(name)
  ) {
    matchedSubcategories.add('historical-monuments');
    matchedCategories.add('heritage');
  }

  // UNESCO Sites
  if (
    /\b(unesco|world heritage|group of monuments|ancient ruins|hampi|ajanta|ellora|elephanta|qutb|khajuraho|mahabalipuram|konark|fatehpur sikri|pattadakal|rani ki vav)\b/i.test(combinedText)
  ) {
    matchedSubcategories.add('unesco-sites');
    matchedCategories.add('heritage');
  }

  // Heritage Walks
  if (
    /\b(heritage walk|bazaar|old town|walk|chowk|street|lane|market|bazar|laad bazaar|chandni chowk)\b/i.test(combinedText) ||
    (types.includes('tourist_attraction') && /\b(historic|heritage|old city|quarter)\b/i.test(combinedText))
  ) {
    matchedSubcategories.add('heritage-walks');
    matchedCategories.add('heritage');
  }

  // ─── 3. NATURE ───
  // Hills & Valleys
  if (/\b(hill|hills|valley|valleys|peak|ridge|cliff|pass|mountain pass|ghats|view point|viewpoint|sunset point|sunrise point)\b/i.test(name)) {
    matchedSubcategories.add('hills-valleys');
    matchedCategories.add('nature');
  }

  // Waterfalls
  if (/\b(waterfall|waterfalls|falls|water fall|cascade|cataract)\b/i.test(name)) {
    matchedSubcategories.add('waterfalls');
    matchedCategories.add('nature');
  }

  // Beaches
  if (
    /\b(beach|beaches|coast|shore|cove|promenade|sea shore|bay)\b/i.test(name) ||
    (types.includes('natural_feature') && /\b(sea|ocean|coast|beach|creek)\b/i.test(combinedText))
  ) {
    matchedSubcategories.add('beaches');
    matchedCategories.add('nature');
  }

  // National Parks
  if (
    types.includes('zoo') ||
    types.includes('aquarium') ||
    /\b(national park|wildlife|sanctuary|biosphere|reserve forest|tiger reserve|bird sanctuary|deer park|safari park|botanical garden)\b/i.test(combinedText) ||
    (types.includes('park') && /\b(national|wildlife|sanctuary|nature reserve|forest)\b/i.test(name))
  ) {
    matchedSubcategories.add('national-parks');
    matchedCategories.add('nature');
  }

  // Lakes
  if (
    /\b(lake|lakes|talab|sagar|dam|backwaters|backwater|reservoir|pond|river|canal)\b/i.test(name) ||
    (types.includes('natural_feature') && /\b(lake|river|water|island)\b/i.test(name))
  ) {
    matchedSubcategories.add('lakes');
    matchedCategories.add('nature');
  }

  // ─── 4. ADVENTURE ───
  // Trekking
  if (/\b(trek|trekking|trail|hiking|hike|summit|peak climb|base camp|rock climbing)\b/i.test(combinedText)) {
    matchedSubcategories.add('trekking');
    matchedCategories.add('adventure');
  }

  // Camping
  if (
    types.includes('campground') ||
    /\b(camp|camping|glamping|tent|campsite)\b/i.test(combinedText)
  ) {
    matchedSubcategories.add('camping');
    matchedCategories.add('adventure');
  }

  // River Rafting & Water Sports
  if (/\b(rafting|river rafting|kayak|kayaking|water sports|boating|boat club|canoeing|scuba|snorkeling|surfing|jet ski)\b/i.test(combinedText)) {
    matchedSubcategories.add('river-rafting');
    matchedCategories.add('adventure');
  }

  // Paragliding & Aerial
  if (/\b(paragliding|parasailing|zipline|skydive|skydiving|ropeway|cable car|bungee|hot air balloon)\b/i.test(combinedText)) {
    matchedSubcategories.add('paragliding');
    matchedCategories.add('adventure');
  }

  // Wildlife Safari
  if (
    /\b(safari|jungle safari|jeep safari|wildlife tour|tiger safari|elephant safari)\b/i.test(combinedText) ||
    (types.includes('zoo') && /\b(safari)\b/i.test(combinedText))
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
  const radius = Math.min(35000, Math.max(3000, parseInt(src.radius, 10) || 20000));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ success: false, error: 'Valid latitude and longitude coordinates are required.' });
  }

  // Check in-memory cache
  const cacheKey = getCacheKey(lat, lng, destination);
  const cached = categoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({
      ...cached.data,
      cached: true
    });
  }

  const key = mapsKey();

  // If Google API Key is present, query Google Places API (New)
  if (key) {
    try {
      const url = 'https://places.googleapis.com/v1/places:searchText';
      const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating'
      };

      const q1 = `temple church mosque shrine ashram fort palace monument heritage museum unesco in ${destination || 'area'}`.trim();
      const q2 = `park lake waterfall beach valley hill mountain trek camp camping adventure wildlife safari in ${destination || 'area'}`.trim();

      const [res1, res2] = await Promise.all([
        fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            textQuery: q1,
            locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius } },
            maxResultCount: 15
          }),
          signal: AbortSignal.timeout(8000)
        }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            textQuery: q2,
            locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius } },
            maxResultCount: 15
          }),
          signal: AbortSignal.timeout(8000)
        }).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      const placesRaw = [];
      const normalizeP = (p) => ({
        place_id: p.id,
        name: p.displayName?.text || p.name || '',
        vicinity: p.formattedAddress || '',
        types: p.types || [],
        rating: p.rating || null,
        geometry: { location: { lat: p.location?.latitude, lng: p.location?.longitude } }
      });

      if (Array.isArray(res1?.places)) placesRaw.push(...res1.places.map(normalizeP));
      if (Array.isArray(res2?.places)) placesRaw.push(...res2.places.map(normalizeP));

      // Deduplicate places by place_id or name
      const seen = new Set();
      const uniquePlaces = [];
      for (const p of placesRaw) {
        const id = p.place_id || (p.name || '').toLowerCase();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        uniquePlaces.push(p);
      }

      // Collect evidence and map places to categories
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

      const availableCategories = ['spiritual', 'heritage', 'nature', 'adventure'].filter(
        c => categoryEvidence[c].length > 0
      );
      const unavailableCategories = ['spiritual', 'heritage', 'nature', 'adventure'].filter(
        c => categoryEvidence[c].length === 0
      );

      // Development logging (NO API keys logged)
      console.log(`[VIHARA Categories] Destination: "${destination || 'Selected Location'}" (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      console.log(`[VIHARA Categories] Google Places queries executed: 2`);
      console.log(`[VIHARA Categories] Places returned: ${uniquePlaces.length}`);
      console.log(`[VIHARA Categories] Detected categories: [${availableCategories.join(', ')}] | Subcategories: [${Array.from(detectedSubcategories).join(', ')}]`);

      const responsePayload = {
        success: true,
        destination: {
          name: destination || 'Selected Location',
          latitude: lat,
          longitude: lng,
          placeId: placeId || null
        },
        availableCategories,
        unavailableCategories,
        subcategories: Array.from(detectedSubcategories),
        categoryEvidence,
        placesCount: uniquePlaces.length,
        provider: 'google-places-new',
        source: 'google-places-nearby',
        fallback: false
      };

      // Store in memory cache
      categoryCache.set(cacheKey, {
        timestamp: Date.now(),
        data: responsePayload
      });

      return res.status(200).json(responsePayload);
    } catch (err) {
      console.warn('[VIHARA Categories API] Google Nearby search error:', err.message);
    }
  }

  // ─── FALLBACK SYSTEM (When Google Places is unavailable or fails) ───
  // Clearly distinguished as fallback data; never falsely labeled as real-time Google verified.
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

    // Construct evidence from catalog places
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

    const responsePayload = {
      success: true,
      destination: {
        name: catalogEntry.name || destination,
        latitude: lat,
        longitude: lng,
        placeId: placeId || simpleKey
      },
      availableCategories: availCats,
      unavailableCategories: ['spiritual', 'heritage', 'nature', 'adventure'].filter(c => !availCats.includes(c)),
      subcategories: catalogSubs,
      categoryEvidence: catEvidence,
      placesCount: (catalogEntry.places || []).length,
      provider: 'catalog-fallback',
      source: 'catalog-fallback',
      fallback: true
    };

    return res.status(200).json(responsePayload);
  }

  // Dynamic destination with zero Google API access and no catalog entry:
  // Must NOT invent hardcoded categories! Return empty with fallback flag.
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
    error: 'Google Places API unavailable and destination not in knowledge catalog'
  });
}
