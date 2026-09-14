import { destName } from './schemas.js';

export function buildCanonicalTripData({
  tripId,
  user = null,
  currentLocation,
  currentLocationName,
  currentLocationLatitude,
  currentLocationLongitude,
  userLocation,
  destinations,
  destinationOrder,
  startDate,
  endDate,
  numberOfDays,
  travelType,
  numberOfTravelers,
  selectedCategories,
  userSelectedBudget,
  minimumBaseline,
  generatedItinerary,
  placeCards,
  routeData,
  budgetBreakdown,
  accommodation,
  linkedEvents,
  transport,
  preferences,
  paceByDay
}) {
  const dests = destinationOrder?.length ? destinationOrder : destinations;
  return {
    tripId,
    user: user
      ? { uid: user.uid, email: user.email, name: user.displayName }
      : null,
    origin: {
      name: currentLocationName || currentLocation,
      latitude: currentLocationLatitude,
      longitude: currentLocationLongitude,
      details: userLocation
    },
    destinations: dests || [],
    destinationOrder: dests || [],
    dates: { startDate, endDate },
    startDate,
    endDate,
    numberOfDays,
    travelers: numberOfTravelers,
    numberOfTravelers,
    travelType,
    companions: travelType,
    selectedCategories,
    categories: selectedCategories,
    budget: budgetBreakdown || {
      allocated: userSelectedBudget,
      baseline: minimumBaseline,
      allocatedBudget: userSelectedBudget
    },
    budgetBreakdown: budgetBreakdown || null,
    userSelectedBudget,
    minimumBaseline,
    itinerary: generatedItinerary,
    generatedItinerary,
    placeCards,
    places: placeCards,
    routes: routeData,
    routeData,
    accommodation: accommodation || null,
    events: linkedEvents || [],
    linkedEvents: linkedEvents || [],
    transport: transport || null,
    preferences: preferences || {},
    paceByDay: paceByDay || {},
    metadata: {
      destinationNames: (dests || []).map(destName),
      updatedAt: new Date().toISOString()
    }
  };
}
