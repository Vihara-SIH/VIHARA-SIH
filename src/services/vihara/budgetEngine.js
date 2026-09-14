import { emptyBudgetModel } from './schemas.js';

/**
 * Structured trip budget. Does not inflate allocated budget when items are added.
 * `allocated` is what the user set; `total` is estimated spend.
 */
export function calculateBudgetBaseline(destinations = [], numberOfDays = 1, numberOfTravelers = 1, selectedCategories = []) {
  const days = Math.max(1, Number(numberOfDays) || 1);
  const travelers = Math.max(1, Number(numberOfTravelers) || 1);
  const numRooms = Math.ceil(travelers / 2);
  const destCount = Math.max(1, destinations.length);
  const categoryCount = Math.max(1, selectedCategories.length);

  const accommodation = 2800 * numRooms * days;
  const food = 1400 * travelers * days;
  const activities = categoryCount * 350 * travelers * days;
  const transportation = destCount > 1 ? (destCount - 1) * 2500 * travelers : 800 * travelers * Math.max(1, days - 1);
  const miscellaneous = Math.round((accommodation + food + activities) * 0.05);
  const total = accommodation + food + activities + transportation + miscellaneous;

  return Math.round(total / 100) * 100;
}

export function buildBudgetModel({
  destinations = [],
  numberOfDays = 1,
  numberOfTravelers = 1,
  selectedCategories = [],
  allocatedBudget = 0,
  accommodationCost = 0,
  eventCosts = 0,
  activityTicketHint = 0,
  routeEstimate = 0
} = {}) {
  const days = Math.max(1, Number(numberOfDays) || 1);
  const travelers = Math.max(1, Number(numberOfTravelers) || 1);
  const baseline = calculateBudgetBaseline(destinations, days, travelers, selectedCategories);
  const numRooms = Math.ceil(travelers / 2);

  const accommodation = Number(accommodationCost) > 0
    ? Number(accommodationCost)
    : 2800 * numRooms * days;

  const food = 1400 * travelers * days;
  const activities = Number(activityTicketHint) > 0
    ? Number(activityTicketHint)
    : Math.max(1, selectedCategories.length) * 350 * travelers * days;
  const events = Math.max(0, Number(eventCosts) || 0);
  const transportation = Number(routeEstimate) > 0
    ? Number(routeEstimate)
    : (destinations.length > 1 ? (destinations.length - 1) * 2500 * travelers : 800 * travelers * Math.max(1, days - 1));
  const miscellaneous = Math.round((accommodation + food + activities) * 0.05);
  const total = accommodation + transportation + food + activities + events + miscellaneous;
  const allocated = Math.max(0, Number(allocatedBudget) || baseline);

  const model = {
    ...emptyBudgetModel(),
    accommodation: Math.round(accommodation),
    transportation: Math.round(transportation),
    food: Math.round(food),
    activities: Math.round(activities),
    events: Math.round(events),
    miscellaneous: Math.round(miscellaneous),
    total: Math.round(total),
    perPerson: Math.round(total / travelers),
    baseline,
    allocated,
    currency: 'INR',
    source: accommodationCost || eventCosts ? 'trip-derived' : 'formula',
    notes: []
  };

  if (model.total > model.allocated && model.allocated > 0) {
    model.notes.push('Estimated trip cost exceeds allocated budget.');
  }
  return model;
}

export function parseEntryCost(entryInfo, travelers = 1) {
  if (typeof entryInfo === 'number' && Number.isFinite(entryInfo)) {
    return Math.round(entryInfo * travelers);
  }
  if (!entryInfo || typeof entryInfo !== 'string') return 0;
  if (/free/i.test(entryInfo)) return 0;

  const indian = entryInfo.match(/₹\s*(\d[\d,]*)/);
  if (indian) {
    return Math.round(Number(indian[1].replace(/,/g, '')) * travelers);
  }
  const digits = entryInfo.match(/(\d+)/);
  if (digits && !/am|pm|hours|mins/i.test(entryInfo)) {
    return Math.round(Number(digits[1]) * travelers);
  }
  return 0;
}

export function getActivityCost(act, travelers = 1) {
  if (!act || act.slotType === 'Lunch Break') return 0;
  if (act.priceVal !== undefined && act.priceVal !== null && Number.isFinite(Number(act.priceVal))) {
    return Math.round(Number(act.priceVal) * travelers);
  }
  if (act.cost !== undefined && act.cost !== null && Number.isFinite(Number(act.cost))) {
    return Math.round(Number(act.cost) * travelers);
  }
  if (act.price && /free/i.test(String(act.price))) return 0;
  if (act.entryInfo && /free/i.test(String(act.entryInfo))) return 0;
  const parsed = parseEntryCost(act.entryInfo, travelers);
  if (parsed > 0) return parsed;
  // Standard entry ticket for cultural/heritage/monument sites in India
  return Math.round(350 * travelers);
}

/**
 * Recalculate trip budget when an activity is added, removed, or modified.
 * Preserves accommodation, transport, meals, and events while updating the activities slice and totals.
 */
export function recalculateBudgetWithItinerary({
  currentBudget = null,
  itinerary = [],
  destinations = [],
  numberOfDays = 1,
  numberOfTravelers = 1,
  selectedCategories = [],
  allocatedBudget = 0,
  accommodationCost = 0,
  eventCosts = 0,
  routeEstimate = 0
} = {}) {
  const travelers = Math.max(1, Number(numberOfTravelers) || 1);
  const days = Math.max(1, Number(numberOfDays) || 1);

  // Compute total activity admissions across all scheduled activities
  let activityTotal = 0;
  for (const day of itinerary || []) {
    for (const act of day.activities || []) {
      if (act && (act.placeId || act.title) && act.slotType !== 'Lunch Break') {
        activityTotal += getActivityCost(act, travelers);
      }
    }
  }

  // Preserve existing accommodation / transport / meals / events if available
  const accommodation = Number(accommodationCost) > 0
    ? Number(accommodationCost)
    : (currentBudget?.accommodation ?? (2800 * Math.ceil(travelers / 2) * days));

  const transportation = Number(routeEstimate) > 0
    ? Number(routeEstimate)
    : (currentBudget?.transportation ?? (destinations.length > 1 ? (destinations.length - 1) * 2500 * travelers : 800 * travelers * Math.max(1, days - 1)));

  const food = currentBudget?.food ?? (1400 * travelers * days);
  const events = Number(eventCosts) > 0 ? Number(eventCosts) : (currentBudget?.events ?? 0);

  const activities = Math.max(0, activityTotal);
  const miscellaneous = Math.round((accommodation + food + activities) * 0.05);
  const total = accommodation + transportation + food + activities + events + miscellaneous;
  const baseline = currentBudget?.baseline || calculateBudgetBaseline(destinations, days, travelers, selectedCategories);
  const allocated = Math.max(0, Number(allocatedBudget || currentBudget?.allocated) || baseline);

  return {
    ...emptyBudgetModel(),
    accommodation: Math.round(accommodation),
    transportation: Math.round(transportation),
    food: Math.round(food),
    activities: Math.round(activities),
    events: Math.round(events),
    miscellaneous: Math.round(miscellaneous),
    total: Math.round(total),
    perPerson: Math.round(total / travelers),
    baseline,
    allocated,
    currency: 'INR',
    source: 'trip-derived',
    notes: total > allocated && allocated > 0 ? ['Estimated trip cost exceeds allocated budget.'] : []
  };
}
