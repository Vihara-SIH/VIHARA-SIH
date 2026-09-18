import {
  CATEGORY_DEFINITIONS,
  getMainCategoryForSubcategory,
  resolveRequiredPillars,
  isMainCategory,
  isSubcategory,
  classifyGooglePlace
} from './placeClassifier.js';

export {
  CATEGORY_DEFINITIONS,
  getMainCategoryForSubcategory,
  resolveRequiredPillars,
  isMainCategory,
  isSubcategory,
  classifyGooglePlace
};

export const ALLOWED_AI_ACTIONS = [
  'REMOVE_ACTIVITY',
  'ADD_ACTIVITY',
  'MOVE_ACTIVITY',
  'REPLACE_ACTIVITY',
  'SET_CATEGORIES',
  'SET_BUDGET',
  'SET_PACE',
  'REGENERATE_ITINERARY'
];

export function destName(d) {
  if (!d) return '';
  if (typeof d === 'string') return d;
  return d.destinationName || d.name || d.city || d.id || '';
}

export function destId(d) {
  const name = destName(d).toLowerCase().split(',')[0].trim();
  return name.replace(/\s+/g, '-');
}

export function parseDurationMinutes(value, fallback = 90) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(30, Math.round(value));
  const text = String(value).toLowerCase();
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*h/);
  const minMatch = text.match(/(\d+)\s*m/);
  if (hourMatch && minMatch) return Math.round(Number(hourMatch[1]) * 60 + Number(minMatch[1]));
  if (hourMatch) return Math.round(Number(hourMatch[1]) * 60);
  if (minMatch) return Number(minMatch[1]);
  const n = parseFloat(text);
  if (Number.isFinite(n) && n < 12) return Math.round(n * 60);
  return fallback;
}

export function parseClock(text) {
  if (!text) return null;
  const raw = String(text).trim();
  const m = raw.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] || 0);
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  if (!ap && h <= 7) h += 12;
  return h * 60 + min;
}

export function formatClock(mins) {
  const wrapped = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  let h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`;
}

export function expandSelectedCategories(selected = []) {
  const set = new Set();
  for (const raw of selected || []) {
    const id = String(raw || '').toLowerCase().trim();
    if (!id) continue;
    set.add(id);

    // 1. If it's a main category, expand downwards to include all its subcategories
    const main = CATEGORY_DEFINITIONS[id];
    if (main && Array.isArray(main.subcategories)) {
      main.subcategories.forEach((s) => set.add(s.id));
    }

    // 2. If it's a subcategory, expand upwards to include its parent main category
    const parentId = getMainCategoryForSubcategory(id);
    if (parentId) {
      set.add(parentId);
    }
  }
  return Array.from(set);
}

export function formatVisitingHours(visitingHours) {
  if (!visitingHours) return 'Hours unavailable';

  const cleanString = (str) =>
    String(str || '')
      .replace(/\b(undefined|null|NaN)\b/gi, '')
      .replace(/\s+-\s*$/, '')
      .replace(/^\s*-\s+/, '')
      .trim();

  if (typeof visitingHours === 'string') {
    const cleaned = cleanString(visitingHours);
    if (!cleaned) return 'Hours unavailable';
    if (/24\s*hours?\s*open|open\s*24\s*hours?/i.test(cleaned)) {
      return 'Open 24 hours';
    }
    return cleaned;
  }

  if (typeof visitingHours === 'object') {
    const openRaw = visitingHours.open || visitingHours.openingTime || visitingHours.start;
    const closeRaw = visitingHours.close || visitingHours.closingTime || visitingHours.end;

    const open = cleanString(openRaw);
    const close = cleanString(closeRaw);

    if (
      visitingHours.is24Hours ||
      /24\s*hours?\s*open|open\s*24\s*hours?/i.test(open) ||
      /24\s*hours?\s*open|open\s*24\s*hours?/i.test(close)
    ) {
      return 'Open 24 hours';
    }

    if (open && close) {
      return `${open} - ${close}`;
    }
    if (open && !close) {
      return open;
    }
    if (!open && close) {
      return `Until ${close}`;
    }
  }

  return 'Hours unavailable';
}

export function placeMatchesCategories(place, selectedCategories = []) {
  if (!place) return false;
  if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) return true;

  const cleanedSelected = selectedCategories
    .map((c) => String(c || '').toLowerCase().trim())
    .filter(Boolean);

  if (cleanedSelected.length === 0) return true;

  const placeCat = String(place.category || '').toLowerCase().trim();
  const placeSubs = (Array.isArray(place.subcategories) ? place.subcategories : [])
    .map((s) => String(s || '').toLowerCase().trim());
  const placeTypes = (Array.isArray(place.types) ? place.types : [])
    .map((t) => String(t || '').toLowerCase().trim());
  const placeName = String(place.name || place.title || place.placeName || '').toLowerCase();
  const placeDesc = String(place.description || '').toLowerCase();
  const placeText = `${placeCat} ${placeName} ${placeDesc} ${placeTypes.join(' ')}`;

  return cleanedSelected.some((sel) => {
    // ─── CASE 1: PARENT PILLAR SELECTION (Broad) ───
    if (isMainCategory(sel)) {
      if (placeCat === sel) return true;
      if (placeSubs.some((sub) => getMainCategoryForSubcategory(sub) === sel)) return true;

      // If place is explicitly classified under a different main category (e.g. 'heritage' vs 'nature'),
      // and none of its subcategories belong to this pillar, do not let descriptive keywords leak it across pillars
      if (placeCat && isMainCategory(placeCat) && placeCat !== sel) {
        return false;
      }

      if (sel === 'heritage' && /heritage|fort|palace|monument|unesco|historical|museum|tomb|haveli|citadel|bastion/i.test(placeText)) return true;
      if (sel === 'spiritual' && /spiritual|temple|ashram|pilgrim|church|mosque|shrine|dham|ghat|mandir|basilica|cathedral/i.test(placeText)) return true;
      if (sel === 'nature' && /nature|beach|lake|park|waterfall|hill|valley|coast|viewpoint|sanctuary|reserve/i.test(placeText)) return true;
      if (sel === 'adventure' && /adventure|trek|raft|safari|camp|paragliding|kayak|hike/i.test(placeText)) return true;

      return false;
    }

    // ─── CASE 2: STRICT SUBCATEGORY SELECTION (Strict Downward Filtering) ───
    const parentPillar = getMainCategoryForSubcategory(sel);
    const isConflictingPillar = parentPillar && placeCat && placeCat !== parentPillar && isMainCategory(placeCat);

    // If place belongs to a conflicting pillar and is explicitly typed/named as that conflicting structure, reject
    if (isConflictingPillar && /\b(fort|qila|palace|mahal|temple|mandir|church|mosque|museum)\b/i.test(placeName)) {
      return false;
    }

    switch (sel) {
      case 'beaches': {
        const hasBeachType = placeTypes.includes('beach') || (placeTypes.includes('natural_feature') && /\b(beach|coast|shore)\b/i.test(placeName));
        const hasBeachName = /\b(beach|beaches|coast|shore|cove|promenade|bay)\b/i.test(placeName) && !/\b(fort|qila|citadel)\b/i.test(placeName);
        if (hasBeachType || hasBeachName) return true;
        if (!isConflictingPillar && placeSubs.includes('beaches')) {
          if (!/\b(fort|qila|waterfall|temple|museum)\b/i.test(placeName)) return true;
        }
        return false;
      }

      case 'waterfalls': {
        const hasWaterfallType = placeTypes.includes('waterfall');
        const hasWaterfallName = /\b(waterfall|waterfalls|falls|water fall|cascade|cataract)\b/i.test(placeName);
        if (hasWaterfallType || hasWaterfallName) return true;
        if (!isConflictingPillar && placeSubs.includes('waterfalls')) {
          if (!/\b(fort|qila|beach|temple|museum)\b/i.test(placeName)) return true;
        }
        return false;
      }

      case 'forts': {
        const hasFortName = /\b(fort|gadh|garh|qila|kila|kot|durg|citadel|bastion)\b/i.test(placeName);
        if (hasFortName) return true;
        if (!isConflictingPillar && placeSubs.includes('forts')) {
          if (!/\b(beach|waterfall|temple)\b/i.test(placeName)) return true;
        }
        return false;
      }

      case 'palaces': {
        const hasPalaceName = /\b(palace|mahal|haveli|mansion|durbar|rajwada)\b/i.test(placeName);
        if (hasPalaceName) return true;
        if (!isConflictingPillar && placeSubs.includes('palaces')) return true;
        return false;
      }

      case 'historical-monuments': {
        const hasMonType = placeTypes.some((t) => ['historical_landmark', 'monument', 'museum', 'archaeological_site'].includes(t));
        const hasMonName = /\b(monument|memorial|tomb|minar|ruins|caves|stepwell|bawdi|baoli|gate|darwaza|archaeological|museum)\b/i.test(placeName);
        if (hasMonType || hasMonName) return true;
        if (!isConflictingPillar && placeSubs.includes('historical-monuments')) return true;
        return false;
      }

      case 'unesco-sites': {
        const hasUnescoName = /\b(unesco|world heritage|ancient ruins|group of monuments)\b/i.test(placeText);
        if (hasUnescoName) return true;
        if (!isConflictingPillar && placeSubs.includes('unesco-sites')) return true;
        return false;
      }

      case 'temples': {
        const hasTempleType = placeTypes.includes('hindu_temple');
        const hasTempleName = /\b(temple|mandir|kovil|gudi|devasthanam|devalayam|shrine|basadi|stupa)\b/i.test(placeName);
        if (hasTempleType || hasTempleName) return true;
        if (!isConflictingPillar && placeSubs.includes('temples')) {
          if (!/\b(beach|waterfall|fort)\b/i.test(placeName)) return true;
        }
        return false;
      }

      case 'pilgrimage-sites': {
        const hasPilgrimType = placeTypes.some((t) => ['place_of_worship', 'church', 'mosque', 'synagogue'].includes(t));
        const hasPilgrimName = /\b(dargah|gurudwara|gurdwara|monastery|pagoda|cathedral|basilica|masjid|pilgrim|holy|sacred|shrine)\b/i.test(placeName);
        if (hasPilgrimType || hasPilgrimName) return true;
        if (!isConflictingPillar && placeSubs.includes('pilgrimage-sites')) return true;
        return false;
      }

      case 'lakes': {
        const hasLakeName = /\b(lake|lakes|talab|sagar|dam|backwaters|backwater|reservoir|pond|river|canal)\b/i.test(placeName);
        if (hasLakeName) return true;
        if (!isConflictingPillar && placeSubs.includes('lakes')) return true;
        return false;
      }

      case 'national-parks': {
        const hasParkType = placeTypes.some((t) => ['national_park', 'state_park', 'wildlife_park', 'wildlife_refuge', 'zoo'].includes(t));
        const hasParkName = /\b(national park|wildlife sanctuary|tiger reserve|bird sanctuary|deer park|safari park|biosphere|nature reserve)\b/i.test(placeName);
        if (hasParkType || hasParkName) return true;
        if (!isConflictingPillar && placeSubs.includes('national-parks')) return true;
        return false;
      }

      case 'hills-valleys': {
        const hasHillType = placeTypes.includes('scenic_viewpoint');
        const hasHillName = /\b(hill|hills|valley|valleys|peak|ridge|cliff|pass|mountain pass|view point|viewpoint|sunset point)\b/i.test(placeName);
        if (hasHillType || hasHillName) return true;
        if (!isConflictingPillar && placeSubs.includes('hills-valleys')) return true;
        return false;
      }

      case 'trekking': {
        const hasTrekType = placeTypes.includes('hiking_area');
        const hasTrekName = /\b(trek|trekking|trail|hiking|hike|summit)\b/i.test(placeName);
        if (hasTrekType || hasTrekName) return true;
        if (!isConflictingPillar && placeSubs.includes('trekking')) return true;
        return false;
      }

      default: {
        if (!isConflictingPillar && placeSubs.includes(sel)) return true;
        const normalizedSelWord = sel.replace(/-/g, ' ');
        const regex = new RegExp(`\\b${normalizedSelWord}\\b`, 'i');
        if (regex.test(placeName) || regex.test(placeTypes.join(' '))) return true;
        return false;
      }
    }
  });
}

export function emptyBudgetModel() {
  return {
    accommodation: 0,
    transportation: 0,
    food: 0,
    activities: 0,
    events: 0,
    miscellaneous: 0,
    total: 0,
    perPerson: 0,
    baseline: 0,
    allocated: 0,
    currency: 'INR',
    source: 'formula',
    notes: []
  };
}

export function compactTripForAI(trip = {}) {
  const dests = (trip.destinations || trip.destinationOrder || []).map((d) => ({
    name: destName(d),
    placeId: typeof d === 'object' ? d.placeId : undefined,
    lat: typeof d === 'object' ? d.latitude : undefined,
    lng: typeof d === 'object' ? d.longitude : undefined
  }));

  const itinerary = (trip.itinerary || trip.generatedItinerary || []).map((day) => ({
    dayNumber: day.dayNumber,
    city: day.city,
    date: day.date,
    activities: (day.activities || []).map((a, actIdx) => ({
      position: actIdx + 1,
      placeId: a.placeId || a.id || null,
      title: a.title || a.placeName || a.name,
      time: a.time,
      category: a.category,
      slotType: a.slotType
    }))
  }));

  return {
    tripId: trip.tripId,
    origin: trip.origin || trip.currentLocationName || trip.currentLocation,
    destinations: dests,
    startDate: trip.startDate,
    endDate: trip.endDate,
    numberOfDays: trip.numberOfDays,
    travelType: trip.travelType,
    numberOfTravelers: trip.numberOfTravelers,
    selectedCategories: trip.selectedCategories || trip.categories || [],
    budget: trip.budgetBreakdown || {
      allocated: trip.userSelectedBudget || trip.budget,
      baseline: trip.minimumBaseline
    },
    itinerary,
    accommodation: trip.accommodation || null,
    events: trip.linkedEvents || [],
    allowedPlaceIds: itinerary.flatMap((d) => d.activities.map((a) => a.placeId).filter(Boolean)),
    allowedPlaceTitles: itinerary.flatMap((d) => d.activities.map((a) => a.title).filter(Boolean)),
    allowedCategoryIds: Object.keys(CATEGORY_DEFINITIONS).concat(
      Object.values(CATEGORY_DEFINITIONS).flatMap((c) => c.subcategories.map((s) => s.id))
    )
  };
}
