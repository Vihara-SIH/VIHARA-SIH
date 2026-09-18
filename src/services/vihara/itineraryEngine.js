import { getDestinationData } from '../destinationService.js';
import { orderByProximity, clusterPlaces, estimateTravelMinutes } from './geo.js';
import { rankPlaces, selectDailyCandidates } from './placeRanker.js';
import { fetchNearbyPlaces, fetchNearbyPlacesForPillars, mergeCatalogAndLive } from './nearbyClient.js';
import { fetchWeather } from './weatherClient.js';
import { getRouteDuration } from './routeClient.js';
import { parseDurationMinutes, parseClock, formatClock, destName, placeMatchesCategories, resolveRequiredPillars, formatVisitingHours } from './schemas.js';
import { parseEntryCost, getActivityCost } from './budgetEngine.js';

const INDOOR_CATS = /heritage|spiritual|museum|fort|palace|monument|temple|ashram|unesco|gallery/i;
const OUTDOOR_CATS = /nature|adventure|beach|trek|waterfall|lake|park|hill|camp|safari|raft/i;

/**
 * Re-sort picked places based on weather conditions.
 * On rainy/stormy days, boost indoor activities; on clear days, boost outdoor.
 */
function weatherAdaptRanking(places, weather) {
  if (!weather || !weather.live || weather.source === 'unavailable') return places;
  const cond = (weather.condition || '').toLowerCase();
  const isRainy = /rain|shower|storm|thunder|drizzle/.test(cond);
  const isClear = /clear|sunny|mostly clear/.test(cond);
  if (!isRainy && !isClear) return places;

  return [...places].sort((a, b) => {
    const catA = (a.category || '') + ' ' + (a.subcategories || []).join(' ');
    const catB = (b.category || '') + ' ' + (b.subcategories || []).join(' ');
    const aIndoor = INDOOR_CATS.test(catA) ? 1 : 0;
    const bIndoor = INDOOR_CATS.test(catB) ? 1 : 0;
    const aOutdoor = OUTDOOR_CATS.test(catA) ? 1 : 0;
    const bOutdoor = OUTDOOR_CATS.test(catB) ? 1 : 0;

    if (isRainy) return bIndoor - aIndoor || aOutdoor - bOutdoor;
    if (isClear) return bOutdoor - aOutdoor || aIndoor - bIndoor;
    return 0;
  });
}

const DAY_START = 9 * 60;
const LUNCH_START = 12 * 60 + 30;
const LUNCH_END = 13 * 60 + 30;
const DAY_END = 19 * 60 + 30;
const BUFFER = 15;

function formatItineraryDate(baseStartDate, dayIndex = 0) {
  try {
    const d = baseStartDate ? new Date(baseStartDate) : new Date();
    d.setDate(d.getDate() + dayIndex);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return `Day ${dayIndex + 1}`;
  }
}

function isoDateOffset(baseStartDate, dayIndex = 0) {
  const d = baseStartDate ? new Date(baseStartDate) : new Date();
  d.setDate(d.getDate() + dayIndex);
  return d.toISOString().split('T')[0];
}

function allocateDays(destinations, totalDays) {
  const n = Math.max(1, destinations.length);
  const days = Math.max(1, totalDays);
  if (n === 1) return destinations.map((dest) => ({ dest, days }));

  const weights = destinations.map((dest) => Math.max(2, (dest.places || []).length));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => Math.max(1, Math.round((w / weightSum) * days)));
  let allocated = raw.reduce((a, b) => a + b, 0);

  while (allocated > days) {
    const idx = raw.indexOf(Math.max(...raw));
    if (raw[idx] <= 1) break;
    raw[idx] -= 1;
    allocated -= 1;
  }
  while (allocated < days) {
    const idx = raw.indexOf(Math.min(...raw));
    raw[idx] += 1;
    allocated += 1;
  }

  return destinations.map((dest, i) => ({ dest, days: raw[i] }));
}

function hoursOpenAt(place, minutes) {
  const hours = place.visitingHours || place.openingHours;
  if (!hours) return true;
  const open = parseClock(typeof hours === 'object' ? (hours.open || hours.openingTime) : String(hours).split('-')[0]);
  const close = parseClock(typeof hours === 'object' ? (hours.close || hours.closingTime) : String(hours).split('-')[1]);
  if (open == null || close == null) return true;
  return minutes + 30 >= open && minutes + 40 <= close;
}

/**
 * Packs activities for a single day using real Google Routes API v2 travel durations.
 */
export async function packDay(places, dest, originCoords, options = {}) {
  const ordered = orderByProximity(places, originCoords || dest.coordinates);
  const activities = [];
  let cursor = DAY_START;
  let prevCoord = originCoords || dest.coordinates;
  let lunchInserted = false;

  for (const place of ordered) {
    // Retrieve real Google Routes API v2 driving duration (with Haversine fallback)
    const travel = await getRouteDuration(prevCoord, place.coordinates || dest.coordinates, {
      travelMode: options.travelMode || 'DRIVE'
    });

    const travelMinutes = Number.isFinite(travel.durationMinutes) ? travel.durationMinutes : 15;
    let start = cursor + travelMinutes + (activities.length ? BUFFER : 0);

    if (!lunchInserted && start >= LUNCH_START && start < LUNCH_END + 40) {
      activities.push({
        time: `${formatClock(LUNCH_START)} - ${formatClock(LUNCH_END)}`,
        startTime: formatClock(LUNCH_START),
        endTime: formatClock(LUNCH_END),
        slotType: 'Culinary Immersion & Local Flavors',
        title: `Regional flavours in ${dest.name}`,
        description: `Midday break for local cuisine in ${dest.name}. Timing is a buffer, not a restaurant reservation.`,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        category: 'Culinary Heritage',
        visitingHours: '12:00 PM - 03:30 PM',
        entryInfo: 'Pay locally',
        travelTip: 'This is a scheduled meal window, not a booked table.',
        visitDurationMinutes: 60,
        travelMinutesBefore: 0,
        source: 'buffer'
      });
      lunchInserted = true;
      cursor = LUNCH_END;
      start = cursor + BUFFER;
    }

    const duration = parseDurationMinutes(place.estimatedVisitDuration, 90);
    if (!hoursOpenAt(place, start)) {
      const openHours = place.visitingHours || place.openingHours;
      const openMins = parseClock(typeof openHours === 'object' ? (openHours.open || openHours.openingTime) : String(openHours || '').split('-')[0]) ?? DAY_START;
      if (openMins > start) start = openMins;
    }

    const end = start + duration;

    // Real travel-time aware feasibility: stop if daily daylight/operating bounds are exceeded
    if (end > DAY_END && activities.length >= 2) {
      break;
    }

    const slotType = start < 12 * 60
      ? 'Morning Exploration'
      : start < 16 * 60
        ? 'Afternoon Heritage Walk'
        : 'Sunset & Cultural Promenade';

    activities.push({
      time: `${formatClock(start)} - ${formatClock(end)}`,
      startTime: formatClock(start),
      endTime: formatClock(end),
      slotType,
      title: place.name || place.title || place.placeName || 'Attraction',
      placeName: place.name || place.title || place.placeName || 'Attraction',
      description: place.description,
      image: place.image,
      category: place.category || 'Heritage',
      visitingHours: formatVisitingHours(place.visitingHours),
      regularOpeningHours: place.regularOpeningHours || null,
      currentOpeningHours: place.currentOpeningHours || null,
      entryInfo: place.entryInfo || 'Standard Entry',
      travelTip: place.travelTips || place.rankReasons?.[0] || 'Arrive with buffer time for security checks.',
      placeId: place.id || place.placeId,
      coordinates: place.coordinates || (place.latitude && place.longitude ? { lat: place.latitude, lng: place.longitude } : null),
      visitDurationMinutes: duration,
      travelMinutesBefore: travelMinutes,
      travelDistanceKmBefore: travel.distanceKm,
      travelRoute: travel,
      travelEstimate: travel,
      rankScore: place.rankScore,
      source: place.source || 'catalog'
    });

    cursor = end;
    prevCoord = place.coordinates || dest.coordinates;
  }

  return activities;
}

export async function discoverDestinationPlaces(destInput, tripParams) {
  const dest = await getDestinationData(destInput);
  const lat = dest.coordinates?.lat;
  const lng = dest.coordinates?.lng;

  // Resolve user's selected categories / subcategories into required parent pillars only
  const requiredPillars = resolveRequiredPillars(tripParams.selectedCategories || []);

  let live = { places: [] };
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    live = await fetchNearbyPlacesForPillars({
      latitude: lat,
      longitude: lng,
      destination: dest.name,
      pillars: requiredPillars,
      radius: 30000
    });
  }

  // Merge Live Google Places (primary) with catalog / Firestore places
  const merged = mergeCatalogAndLive(dest.places || [], live.places || [], dest);
  const matching = merged.filter((p) => placeMatchesCategories(p, tripParams.selectedCategories || []));
  const pool = (tripParams.selectedCategories && tripParams.selectedCategories.length > 0)
    ? matching
    : merged;
  const ranked = rankPlaces(pool, {
    ...tripParams,
    originCoords: dest.coordinates
  });

  const categoryCoverage = {
    requested: (tripParams.selectedCategories || []).join(', ') || 'all',
    availableCandidates: matching.length,
    requestedDays: tripParams.numberOfDays || 5,
    fullyCovered: matching.length >= (tripParams.numberOfDays || 5)
  };

  return {
    ...dest,
    places: ranked,
    categoryCoverage,
    discoverySource: live.source || (dest.places?.length ? 'catalog' : 'live'),
    liveFallback: !!live.fallback
  };
}

export async function generateIntelligentItinerary(tripData) {
  const {
    destinations = [],
    startDate,
    numberOfDays = 5,
    travelType = 'couple',
    categories = [],
    selectedCategories = categories,
    savedPlaceIds = [],
    userLocation = null,
    originLocation = 'Hyderabad'
  } = tripData;

  const activeDestinations = Array.isArray(destinations) && destinations.length > 0 ? destinations : ['hyderabad'];
  const totalDays = Math.max(1, Number(numberOfDays) || 1);
  const travelers = Math.max(1, Number(tripData.numberOfTravelers) || 1);
  const userBudget = Number(tripData.budget || tripData.userSelectedBudget) || 0;
  const budgetPerPersonPerDay = userBudget > 0 ? Math.round(userBudget / travelers / totalDays) : null;

  const destDataList = [];
  for (const dest of activeDestinations) {
    destDataList.push(await discoverDestinationPlaces(dest, {
      selectedCategories,
      travelType,
      savedPlaceIds,
      originLocation
    }));
  }

  const allocation = allocateDays(destDataList, totalDays);
  const usedIds = new Set();
  const itinerary = [];
  let dayNumber = 1;

  for (const { dest, days } of allocation) {
    const clusters = clusterPlaces(dest.places || [], 7);
    const clusterQueue = clusters.length ? clusters : [{ places: dest.places || [] }];

    for (let d = 0; d < days && dayNumber <= totalDays; d++) {
      const cluster = clusterQueue[d % clusterQueue.length];
      const rankedCluster = rankPlaces(cluster.places || dest.places || [], {
        selectedCategories,
        travelType,
        savedPlaceIds,
        originCoords: dest.coordinates,
        budgetPerPersonPerDay
      });

      // Distribute remaining candidates sensibly across remaining destination days
      const remainingCandidates = (dest.places || []).filter((p) => !usedIds.has(p.id || p.placeId)).length;
      const remainingDays = Math.max(1, days - d);
      const idealPace = Math.max(1, Math.min(3, Math.ceil(remainingCandidates / remainingDays)));
      const pace = tripData.paceByDay?.[dayNumber] || idealPace;
      const picked = selectDailyCandidates(rankedCluster, pace, usedIds);

      const dateIso = isoDateOffset(startDate, dayNumber - 1);
      const weather = await fetchWeather({
        latitude: dest.coordinates?.lat,
        longitude: dest.coordinates?.lng,
        date: dateIso,
        city: dest.name
      });

      const originCoords = dayNumber === 1 && userLocation?.latitude
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : dest.coordinates;

      // Adapt place order based on weather (indoor on rainy days, outdoor on clear)
      const weatherAdapted = weatherAdaptRanking(picked, weather);
      const activities = await packDay(weatherAdapted, dest, originCoords, { travelMode: tripData.travelMode || 'DRIVE' });

      itinerary.push({
        dayNumber,
        city: dest.name,
        state: dest.state,
        date: formatItineraryDate(startDate, dayNumber - 1),
        dateIso,
        weather,
        highlights: activities.filter((a) => a.placeId).map((a) => a.title),
        activities,
        coverageNotice: activities.length === 0
          ? `No additional ${selectedCategories.join(', ') || 'attractions'} available. Day reserved for leisure or independent exploration.`
          : null
      });
      dayNumber += 1;
    }
  }

  while (itinerary.length < totalDays) {
    const last = destDataList[destDataList.length - 1];
    const dayIdx = itinerary.length;
    const remainingCandidates = (last.places || []).filter((p) => !usedIds.has(p.id || p.placeId)).length;
    const remainingDays = Math.max(1, totalDays - dayIdx);
    const idealPace = Math.max(1, Math.min(3, Math.ceil(remainingCandidates / remainingDays)));
    const picked = selectDailyCandidates(last.places || [], idealPace, usedIds);
    const dateIso = isoDateOffset(startDate, dayIdx);
    const activities = await packDay(picked, last, last.coordinates, { travelMode: tripData.travelMode || 'DRIVE' });
    itinerary.push({
      dayNumber: dayIdx + 1,
      city: last.name,
      state: last.state,
      date: formatItineraryDate(startDate, dayIdx),
      dateIso,
      weather: await fetchWeather({
        latitude: last.coordinates?.lat,
        longitude: last.coordinates?.lng,
        date: dateIso,
        city: last.name
      }),
      highlights: picked.map((p) => p.name),
      activities,
      coverageNotice: activities.length === 0
        ? `No additional ${selectedCategories.join(', ') || 'attractions'} available. Day reserved for leisure or independent exploration.`
        : null
    });
  }

  const totalAvailableCandidates = destDataList.reduce((sum, d) => sum + (d.places?.length || 0), 0);
  const categoryCoverage = {
    requested: selectedCategories.join(', ') || 'all',
    availableCandidates: totalAvailableCandidates,
    requestedDays: totalDays,
    fullyCovered: totalAvailableCandidates >= totalDays
  };

  const finalItinerary = itinerary.slice(0, totalDays);
  finalItinerary.categoryCoverage = categoryCoverage;
  return finalItinerary;
}

export function generatePlaceCards(itinerary, tripParams = {}) {
  const { travelType = 'couple', categories = [], selectedCategories = categories } = tripParams;
  const cards = [];
  const seen = new Set();

  for (const day of itinerary || []) {
    for (const act of day.activities || []) {
      if (!act.placeId || seen.has(act.placeId)) continue;
      seen.add(act.placeId);
      const cats = (selectedCategories || []).slice(0, 3).join(', ') || act.category;
      cards.push({
        id: act.placeId,
        placeName: act.title,
        category: act.category,
        city: day.city,
        state: day.state,
        dayNumber: day.dayNumber,
        image: act.image,
        description: act.description,
        visitingHours: formatVisitingHours(act.visitingHours),
        regularOpeningHours: act.regularOpeningHours || null,
        entryInfo: act.entryInfo,
        travelTips: act.travelTip,
        personalizedRationale: act.rankScore
          ? `Selected for Day ${day.dayNumber} because it scored ${act.rankScore}/100 for your ${travelType} trip focusing on ${cats}.`
          : `Curated for Day ${day.dayNumber} of your ${travelType} journey in ${day.city}, aligned with ${cats}.`,
        bestTime: act.startTime || 'Morning or Sunset',
        estimatedDuration: act.visitDurationMinutes ? `${act.visitDurationMinutes} mins` : '2 Hours',
        source: act.source,
        coordinates: act.coordinates
      });
    }
  }
  return cards;
}

export function estimateActivityTickets(itinerary, travelers = 1) {
  let sum = 0;
  for (const day of itinerary || []) {
    for (const act of day.activities || []) {
      if (act && (act.placeId || act.title) && act.slotType !== 'Lunch Break') {
        sum += getActivityCost(act, travelers);
      }
    }
  }
  return sum;
}

export { formatItineraryDate };
