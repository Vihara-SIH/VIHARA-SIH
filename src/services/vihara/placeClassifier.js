/**
 * CANONICAL UNIVERSAL PLACE CLASSIFIER FOR VIHARA
 *
 * Single source of truth for:
 * 1. Category and subcategory hierarchy
 * 2. Deterministic Google Place classification (types, keywords, vicinity)
 * 3. Commercial non-attraction filtering
 * 4. Bi-directional category <-> subcategory resolution
 * 5. Dynamic pillar resolution for Google Places API queries
 */

export const CATEGORY_DEFINITIONS = {
  spiritual: {
    id: 'spiritual',
    name: 'Spiritual',
    tagline: 'Temples, Sanctums & Inner Peace',
    subcategories: [
      { id: 'temples', name: 'Temples' },
      { id: 'ashrams', name: 'Ashrams' },
      { id: 'pilgrimage-sites', name: 'Pilgrimage Sites' },
      { id: 'spiritual-towns', name: 'Spiritual Towns' },
      { id: 'yoga-meditation', name: 'Yoga & Meditation' }
    ]
  },
  adventure: {
    id: 'adventure',
    name: 'Adventure',
    tagline: 'Thrills, Summits & Expeditions',
    subcategories: [
      { id: 'trekking', name: 'Trekking' },
      { id: 'camping', name: 'Camping' },
      { id: 'river-rafting', name: 'River Rafting' },
      { id: 'paragliding', name: 'Paragliding' },
      { id: 'wildlife-safari', name: 'Wildlife Safari' }
    ]
  },
  heritage: {
    id: 'heritage',
    name: 'Heritage',
    tagline: 'Forts, Palaces & Royal Legacies',
    subcategories: [
      { id: 'forts', name: 'Forts' },
      { id: 'palaces', name: 'Palaces' },
      { id: 'historical-monuments', name: 'Historical Monuments' },
      { id: 'unesco-sites', name: 'UNESCO Sites' },
      { id: 'heritage-walks', name: 'Heritage Walks' }
    ]
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    tagline: 'Lakes, Valleys, Coasts & Wilderness',
    subcategories: [
      { id: 'hills-valleys', name: 'Hills & Valleys' },
      { id: 'waterfalls', name: 'Waterfalls' },
      { id: 'beaches', name: 'Beaches' },
      { id: 'national-parks', name: 'National Parks' },
      { id: 'lakes', name: 'Lakes' }
    ]
  }
};

export const ALL_PILLARS = ['spiritual', 'heritage', 'nature', 'adventure'];

/**
 * Canonical targeted discovery queries for Google Places (New).
 * Decouples competing landforms (beaches, waterfalls/lakes, parks/hills)
 * so subcategories never exhaust each other's result quota.
 */
export const TARGETED_DISCOVERY_QUERIES = [
  { cat: 'spiritual', queryHint: 'temple ashram pilgrimage shrine place of worship' },
  { cat: 'heritage', queryHint: 'fort palace monument heritage museum unesco site' },
  { cat: 'nature', subcat: 'beaches', queryHint: 'beach beaches coast shoreline' },
  { cat: 'nature', subcat: 'waterfalls-lakes', queryHint: 'waterfall falls lake lakes' },
  { cat: 'nature', subcat: 'parks-hills', queryHint: 'national park wildlife sanctuary reserve valley hill' },
  { cat: 'adventure', queryHint: 'trekking camping rafting paragliding safari adventure' }
];


/**
 * Reverse mapping from subcategory ID to parent category ID
 */
const SUBCAT_TO_PARENT_MAP = new Map();
for (const [parentId, def] of Object.entries(CATEGORY_DEFINITIONS)) {
  for (const sub of def.subcategories) {
    SUBCAT_TO_PARENT_MAP.set(sub.id, parentId);
  }
}

export function getMainCategoryForSubcategory(subId) {
  return SUBCAT_TO_PARENT_MAP.get(String(subId || '').toLowerCase().trim()) || null;
}

export function isMainCategory(id) {
  return Object.prototype.hasOwnProperty.call(CATEGORY_DEFINITIONS, String(id || '').toLowerCase().trim());
}

export function isSubcategory(id) {
  return SUBCAT_TO_PARENT_MAP.has(String(id || '').toLowerCase().trim());
}

/**
 * Resolves any mix of selected categories/subcategories into the unique parent pillars
 * required for Google Places querying.
 *
 * Examples:
 * - ['beaches', 'waterfalls'] -> ['nature']
 * - ['beaches', 'forts'] -> ['nature', 'heritage']
 * - ['nature', 'spiritual'] -> ['nature', 'spiritual']
 * - [] or null -> ['spiritual', 'heritage', 'nature', 'adventure']
 */
export function resolveRequiredPillars(selectedCategories = []) {
  if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
    return [...ALL_PILLARS];
  }

  const pillars = new Set();
  for (const raw of selectedCategories) {
    const item = String(raw || '').toLowerCase().trim();
    if (!item) continue;

    if (isMainCategory(item)) {
      pillars.add(item);
    } else {
      const parent = getMainCategoryForSubcategory(item);
      if (parent) {
        pillars.add(parent);
      }
    }
  }

  return pillars.size > 0 ? Array.from(pillars) : [...ALL_PILLARS];
}

/**
 * Known commercial/non-attraction Google Place types that should NOT be classified
 * as cultural/tourism attractions unless they explicitly carry a genuine tourism type.
 */
export const NON_ATTRACTION_TYPES = new Set([
  'lodging', 'hotel', 'motel', 'guest_house', 'resort_hotel', 'bed_and_breakfast',
  'restaurant', 'cafe', 'bar', 'food', 'bakery', 'meal_takeaway', 'meal_delivery',
  'gas_station', 'car_repair', 'car_wash', 'bank', 'atm', 'accounting',
  'clothing_store', 'electronics_store', 'furniture_store', 'home_goods_store',
  'convenience_store', 'grocery_or_supermarket', 'supermarket', 'liquor_store',
  'pharmacy', 'hospital', 'doctor', 'dentist', 'veterinary_care',
  'real_estate_agency', 'travel_agency', 'insurance_agency', 'lawyer'
]);

export const GENUINE_TOURISM_TYPES = new Set([
  'tourist_attraction', 'point_of_interest', 'place_of_worship', 'hindu_temple',
  'church', 'mosque', 'synagogue', 'museum', 'art_gallery', 'national_park',
  'park', 'campground', 'amusement_park', 'zoo', 'aquarium', 'natural_feature',
  'historical_landmark', 'historical_place', 'monument', 'hiking_area', 'cultural_center',
  'state_park', 'botanical_garden', 'wildlife_park', 'wildlife_refuge',
  'scenic_viewpoint', 'beach', 'rafting', 'adventure_sports_center'
]);

/**
 * Deterministic mapping rules from Google Place Types and clean name keywords
 * to existing canonical VIHARA Category & Subcategory definitions.
 *
 * Destination-agnostic: relies strictly on place signals, not hardcoded cities/states.
 */
export function classifyGooglePlace(place) {
  const types = Array.isArray(place.types) ? place.types : [];
  const name = String(place.name || place.displayName?.text || '').toLowerCase();
  const vicinity = String(place.vicinity || place.formattedAddress || '').toLowerCase();

  // 1. Guard against non-attraction commercial places (e.g., Hotel Taj Mahal, Temple View Cafe)
  const isCommercialType = types.some((t) => NON_ATTRACTION_TYPES.has(t));
  const hasGenuineTourismType = types.some((t) => GENUINE_TOURISM_TYPES.has(t));

  if (isCommercialType && !hasGenuineTourismType) {
    return { categories: [], subcategories: [] };
  }

  // Commercial name patterns like "hotel ...", "... restaurant", "... cafe" when not a palace/museum hotel
  const isExplicitCommercialName = /\b(hotel|resort|restaurant|cafe|dhaba|bhojanalaya|sweets|bakery|homestay|guest house|petrol pump|atm|store|shop)\b/i.test(name);
  if (isExplicitCommercialName && !types.includes('tourist_attraction') && !types.includes('museum') && !types.includes('historical_landmark')) {
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
  const hasBeachType = types.includes('beach');
  const hasNaturalFeature = types.includes('natural_feature');
  const hasBeachName = /\b(beach|beaches|coast|shore|cove|bay)\b/i.test(name);

  if (hasBeachType || (hasNaturalFeature && hasBeachName)) {
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

/**
 * Normalizes category and subcategories for any Google Place or raw place object.
 * Returns { category: string, subcategories: string[] }
 */
export function inferCategoryAndSubcategories(rawPlace = {}, dest = {}) {
  const classification = classifyGooglePlace(rawPlace);
  let category = 'Heritage';
  let subcategories = [];

  if (classification.categories.length > 0) {
    const primaryPillar = classification.categories[0];
    category = primaryPillar.charAt(0).toUpperCase() + primaryPillar.slice(1);
    subcategories = classification.subcategories;
  } else if (rawPlace.category) {
    category = rawPlace.category;
    subcategories = Array.isArray(rawPlace.subcategories) ? rawPlace.subcategories : [];
  } else {
    // Secondary fallback based on types
    const types = Array.isArray(rawPlace.types) ? rawPlace.types : [];
    const t = types.join(' ').toLowerCase();
    if (/temple|church|mosque|hindu|place_of_worship/.test(t)) {
      category = 'Spiritual';
      subcategories = ['temples'];
    } else if (/park|natural|zoo|camp|beach|waterfall/.test(t)) {
      category = 'Nature';
      subcategories = ['national-parks'];
    } else {
      category = dest?.places?.[0]?.category || 'Heritage';
      subcategories = ['historical-monuments'];
    }
  }

  return { category, subcategories };
}
