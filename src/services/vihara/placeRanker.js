import { haversineKm } from './geo.js';
import { parseDurationMinutes, placeMatchesCategories } from './schemas.js';

const TRAVELER_WEIGHTS = {
  solo: { spiritual: 8, heritage: 6, nature: 5, adventure: 4 },
  couple: { heritage: 8, spiritual: 5, nature: 6, adventure: 3 },
  family: { nature: 7, heritage: 6, spiritual: 5, adventure: 4 },
  friends: { adventure: 8, heritage: 6, nature: 6, spiritual: 3 }
};

export function scorePlace(place, tripParams = {}, extras = {}) {
  const {
    selectedCategories = [],
    travelType = 'couple',
    savedPlaceIds = [],
    originCoords = null,
    budgetPerPersonPerDay = null
  } = tripParams;

  let score = 40;
  const reasons = [];

  if (placeMatchesCategories(place, selectedCategories)) {
    score += 28;
    reasons.push('Matches your selected experience categories');
  } else {
    score -= 12;
  }

  const cat = (place.category || '').toLowerCase();
  const typeWeights = TRAVELER_WEIGHTS[travelType] || TRAVELER_WEIGHTS.couple;
  Object.entries(typeWeights).forEach(([key, w]) => {
    if (cat.includes(key) || (place.subcategories || []).some((s) => s.includes(key))) {
      score += w;
    }
  });

  const rating = Number(place.rating || extras.rating || 0);
  if (rating >= 4.5) {
    score += 10;
    reasons.push('High traveler rating');
  } else if (rating >= 4) {
    score += 6;
  }

  const reviews = Number(place.userRatingsTotal || extras.userRatingsTotal || 0);
  if (reviews > 500) score += 6;
  else if (reviews > 100) score += 3;

  const duration = parseDurationMinutes(place.estimatedVisitDuration, 90);
  if (duration >= 45 && duration <= 180) score += 6;
  else if (duration > 240) score -= 4;

  if (place.source === 'catalog') score += 4;
  if (place.source === 'google') score += 5;

  const pid = place.id || place.placeId;
  if (pid && savedPlaceIds.includes(pid)) {
    score += 14;
    reasons.push('Saved on your wishlist');
  }

  let routeProximityKm = null;
  if (originCoords && place.coordinates) {
    const km = haversineKm(originCoords, place.coordinates);
    routeProximityKm = km;
    if (km !== null && km < 3) { score += 10; reasons.push('Very close to your base'); }
    else if (km !== null && km < 8) score += 8;
    else if (km !== null && km < 20) score += 4;
    else if (km !== null && km < 40) score += 0;
    else if (km !== null) score -= 6;
  }

  // Budget-aware scoring
  const entryText = place.entryInfo || '';
  const isFree = /free/i.test(entryText);
  const entryCostMatch = entryText.match(/₹\s*(\d[\d,]*)/);
  const entryCost = entryCostMatch ? Number(entryCostMatch[1].replace(/,/g, '')) : 0;

  if (budgetPerPersonPerDay !== null && budgetPerPersonPerDay > 0) {
    if (budgetPerPersonPerDay < 3000) {
      // Low budget: strongly prefer free/cheap places
      if (isFree) { score += 8; reasons.push('Free entry — fits your budget'); }
      else if (entryCost > 0 && entryCost <= 100) score += 4;
      else if (entryCost > 500) { score -= 8; reasons.push('Expensive entry may strain budget'); }
    } else if (budgetPerPersonPerDay > 8000) {
      // High budget: slight preference for premium experiences
      if (entryCost > 300) { score += 4; reasons.push('Premium heritage experience'); }
    }
  } else {
    if (isFree) score += 3;
  }

  return {
    ...place,
    rankScore: Math.max(0, Math.min(100, Math.round(score))),
    rankReasons: reasons.slice(0, 3),
    routeProximityKm
  };
}

export function rankPlaces(places, tripParams) {
  return (places || [])
    .map((p) => scorePlace(p, tripParams))
    .sort((a, b) => b.rankScore - a.rankScore);
}

export function selectDailyCandidates(rankedPlaces, maxPerDay = 4, usedIds = new Set()) {
  const picked = [];
  for (const place of rankedPlaces) {
    const id = place.id || place.placeId;
    if (id && usedIds.has(id)) continue;
    picked.push(place);
    if (id) usedIds.add(id);
    if (picked.length >= maxPerDay) break;
  }
  return picked;
}
