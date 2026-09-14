import { CATEGORY_DEFINITIONS } from '../destinationService.js';

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
  for (const id of selected) {
    set.add(id);
    const main = CATEGORY_DEFINITIONS[id];
    if (main) {
      main.subcategories.forEach((s) => set.add(s.id));
    }
  }
  return Array.from(set);
}

export function placeMatchesCategories(place, selectedCategories = []) {
  if (!selectedCategories.length) return true;
  const expanded = expandSelectedCategories(selectedCategories);
  const subs = place.subcategories || [];
  if (subs.some((s) => expanded.includes(s))) return true;
  const cat = (place.category || '').toLowerCase();
  if (expanded.includes(cat)) return true;
  if (expanded.includes('heritage') && /heritage|fort|palace|monument|unesco/i.test(cat + (place.name || ''))) return true;
  if (expanded.includes('spiritual') && /spiritual|temple|ashram|pilgrim/i.test(cat + (place.name || ''))) return true;
  if (expanded.includes('nature') && /nature|beach|lake|park|waterfall|hill/i.test(cat + (place.name || ''))) return true;
  if (expanded.includes('adventure') && /adventure|trek|raft|safari|camp/i.test(cat + (place.name || ''))) return true;
  return false;
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
    activities: (day.activities || []).map((a) => ({
      placeId: a.placeId || null,
      title: a.title || a.placeName,
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
    allowedCategoryIds: Object.keys(CATEGORY_DEFINITIONS).concat(
      Object.values(CATEGORY_DEFINITIONS).flatMap((c) => c.subcategories.map((s) => s.id))
    )
  };
}
