/**
 * Event fit scoring against unified tripData.
 * Catalog events remain DEMO inventory — never claimed as live ticketing.
 */
export function calculateItineraryFit(event, trip) {
  if (!event) {
    return { score: 0, slotNote: 'No event', isRecommended: false, reasons: [] };
  }
  if (!trip) {
    return {
      score: 70,
      slotNote: 'Demo catalog event — no active trip context',
      isRecommended: false,
      reasons: ['Catalog demo'],
      source: 'catalog'
    };
  }

  const destNames = [
    ...(trip.metadata?.destinationNames || []),
    ...(trip.destinations || []).map((d) => (typeof d === 'object' ? (d.destinationName || d.name) : d))
  ].map((n) => String(n || '').toLowerCase());

  const city = String(event.cityNormalized || event.city || '').toLowerCase();
  const isCityMatch = destNames.some((n) => n && (city.includes(n) || n.includes(city)));

  let dateFit = false;
  const eventIso = event.dateIso ? new Date(event.dateIso) : null;
  if (eventIso && trip.startDate && trip.endDate) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    dateFit = eventIso >= start && eventIso <= end;
  }

  const eveningSlot = /pm|evening/i.test(event.timeSlot || '');
  const budget = trip.userSelectedBudget || trip.budgetBreakdown?.allocated || 0;
  const price = Number(event.priceStarting || 0);
  const travelers = trip.numberOfTravelers || 1;
  const budgetFit = !budget || price * travelers <= budget * 0.2;

  let score = 50;
  const reasons = [];
  if (isCityMatch) {
    score += 25;
    reasons.push('Same city as your itinerary');
  }
  if (dateFit) {
    score += 15;
    reasons.push('Falls within trip dates');
  }
  if (eveningSlot) {
    score += 5;
    reasons.push('Evening window');
  }
  if (budgetFit) {
    score += 5;
  } else {
    score -= 8;
    reasons.push('May strain allocated budget');
  }

  return {
    score: Math.max(0, Math.min(99, score)),
    slotNote: isCityMatch
      ? `Fits an evening window in ${event.city} during your trip`
      : 'Demo catalog listing — destination may not match this trip',
    isRecommended: isCityMatch && score >= 70,
    reasons,
    source: 'catalog',
    liveAvailability: false
  };
}
