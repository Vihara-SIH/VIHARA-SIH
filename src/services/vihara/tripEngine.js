import { destName } from './schemas.js';
import { generateIntelligentItinerary, generatePlaceCards, estimateActivityTickets } from './itineraryEngine.js';
import { fetchRouteLegs } from './routeClient.js';
import { buildBudgetModel } from './budgetEngine.js';
import { getDestinationData } from '../destinationService.js';

export async function generateRouteData(itinerary, tripParams = {}) {
  const originName = tripParams.originLocation || tripParams.currentLocationName || 'Origin';
  const originCoordinates =
    tripParams.userLocation?.latitude !== undefined
      ? { lat: Number(tripParams.userLocation.latitude), lng: Number(tripParams.userLocation.longitude) }
      : null;

  const waypoints = [];
  if (originCoordinates) {
    waypoints.push({
      stepIndex: 0,
      name: originName,
      type: 'Origin / Start',
      coordinates: originCoordinates
    });
  }

  let step = waypoints.length;
  for (const day of itinerary || []) {
    for (const act of day.activities || []) {
      if (!act.placeId) continue;
      waypoints.push({
        stepIndex: step++,
        name: act.title,
        type: act.category,
        city: day.city,
        dayNumber: day.dayNumber,
        coordinates: act.coordinates || null
      });
    }
  }

  const missingCoords = waypoints.filter((w) => !w.coordinates);
  if (missingCoords.length) {
    const destCache = {};
    for (const wp of missingCoords) {
      const key = (wp.city || '').toLowerCase();
      if (!destCache[key] && key) destCache[key] = await getDestinationData(wp.city);
      const dest = destCache[key];
      wp.coordinates = dest?.coordinates || { lat: 20.5937, lng: 78.9629 };
    }
  }

  const routed = await fetchRouteLegs(waypoints.filter((w) => w.coordinates));
  const legs = (routed.legs || []).map((leg, i) => {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const isDifferentCity = from?.city && to?.city && from.city !== to.city;
    return {
      legIndex: i + 1,
      from: leg.from || from?.name,
      to: leg.to || to?.name,
      mode: leg.mode || (isDifferentCity ? 'Intercity transfer' : 'Local transit'),
      distance: leg.distance,
      duration: leg.duration,
      distanceKm: leg.distanceKm,
      durationMinutes: leg.durationMinutes,
      estimated: leg.estimated ?? routed.estimated,
      source: leg.source || routed.source,
      tip: leg.tip || (routed.estimated
        ? 'Approximate travel time. Not a live traffic route.'
        : 'Live distance from routing provider.')
    };
  });

  const totalKm = legs.reduce((acc, leg) => acc + (Number(leg.distanceKm) || 0), 0);
  const totalMin = legs.reduce((acc, leg) => acc + (Number(leg.durationMinutes) || 0), 0);

  return {
    origin: originName,
    waypoints,
    legs,
    totalDistance: totalKm ? `${Math.round(totalKm)} km` : 'See leg estimates',
    totalTransitTime: totalMin ? `Approx. ${Math.round(totalMin / 60)} h ${totalMin % 60} m` : 'See leg estimates',
    estimated: routed.estimated,
    source: routed.source
  };
}

export function transportSummary(routeData, destinations = []) {
  const dests = destinations.map(destName).filter(Boolean);
  if (dests.length <= 1) {
    return {
      mode: 'local',
      label: 'Local cabs / metro / walk between sights',
      note: 'No intercity booking is offered. Times are estimates.',
      liveAvailability: false
    };
  }
  return {
    mode: 'intercity',
    label: `${dests[0]} → ${dests.slice(1).join(' → ')}`,
    note: 'Compare official rail/flight operators for tickets. VIHARA does not sell transport.',
    liveAvailability: false,
    estimatedLegs: (routeData?.legs || []).filter((l) => (l.distanceKm || 0) > 80)
  };
}

export async function generateTripPlan(tripParams) {
  const itinerary = await generateIntelligentItinerary(tripParams);
  const placeCards = generatePlaceCards(itinerary, tripParams);
  const routeData = await generateRouteData(itinerary, tripParams);
  const activityTickets = estimateActivityTickets(itinerary, tripParams.numberOfTravelers || 1);

  const intercityKm = (routeData.legs || [])
    .filter((l) => (l.distanceKm || 0) > 80)
    .reduce((a, l) => a + (l.distanceKm || 0), 0);
  const routeEstimate = intercityKm > 0 ? Math.round(intercityKm * 3 * (tripParams.numberOfTravelers || 1)) : 0;

  const budgetBreakdown = buildBudgetModel({
    destinations: tripParams.destinations || [],
    numberOfDays: tripParams.numberOfDays,
    numberOfTravelers: tripParams.numberOfTravelers,
    selectedCategories: tripParams.selectedCategories || tripParams.categories || [],
    allocatedBudget: tripParams.budget || tripParams.userSelectedBudget,
    accommodationCost: tripParams.accommodation?.totalPrice || 0,
    eventCosts: (tripParams.linkedEvents || []).reduce((s, e) => s + (Number(e.grandTotal) || Number(e.priceStarting) || 0), 0),
    activityTicketHint: activityTickets,
    routeEstimate
  });

  return {
    itinerary,
    placeCards,
    routeData,
    budgetBreakdown,
    transport: transportSummary(routeData, tripParams.destinations)
  };
}
