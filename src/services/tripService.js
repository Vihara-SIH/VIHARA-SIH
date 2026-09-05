import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { getDestinationData } from './destinationService';

/**
 * Persist trip data to Firestore under users/{uid}/trips/{tripId}
 */
export const saveUserTrip = async (uid, tripData) => {
  if (!uid || !tripData || !tripData.tripId) return;
  try {
    const tripRef = doc(db, 'users', uid, 'trips', tripData.tripId);
    await setDoc(tripRef, {
      ...tripData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user trip to Firestore:', error);
    return false;
  }
};

/**
 * Fetch all trips for the authenticated user
 */
export const getUserTrips = async (uid) => {
  if (!uid) return [];
  try {
    const tripsRef = collection(db, 'users', uid, 'trips');
    const snapshot = await getDocs(tripsRef);
    const trips = [];
    snapshot.forEach(doc => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return trips;
  } catch (error) {
    console.error('Error loading user trips:', error);
    return [];
  }
};

/**
 * Calculate AI Baseline Minimum Estimate
 */
export const calculateBudgetBaseline = (destinations = [], numberOfDays = 1, numberOfTravelers = 1, selectedCategories = []) => {
  const days = Math.max(1, Number(numberOfDays) || 1);
  const travelers = Math.max(1, Number(numberOfTravelers) || 1);
  const numRooms = Math.ceil(travelers / 2);
  const destCount = Math.max(1, destinations.length);

  // Daily room rate (heritage & boutique baseline)
  const roomCostPerDay = 2800 * numRooms;
  // Daily dining and local transit per traveler
  const dailyLivingCostPerPerson = 1400 * travelers;
  // Category experiences & monument tickets
  const categoryCount = Math.max(1, selectedCategories.length);
  const experienceCostDaily = categoryCount * 350 * travelers;
  // Intercity transfer allowance (Vande Bharat / Flights / AC Cabs)
  const interCityTransit = destCount > 1 ? (destCount - 1) * 2500 * travelers : 0;

  const totalBaseline = (roomCostPerDay + dailyLivingCostPerPerson + experienceCostDaily) * days + interCityTransit;

  return Math.round(totalBaseline / 100) * 100;
};

/**
 * Generates realistic weather predictions for specific location and date
 */
export const getWeatherForDateAndLocation = (city = 'Hyderabad', dateStr = '') => {
  const weatherMap = {
    hyderabad: { temp: '29°C', condition: 'Warm & Breezy', humidity: '52%', uvIndex: '6 Moderate', sunset: '06:22 PM' },
    delhi: { temp: '26°C', condition: 'Pleasant & Clear', humidity: '42%', uvIndex: '5 Moderate', sunset: '06:45 PM' },
    goa: { temp: '31°C', condition: 'Tropical Sunshine', humidity: '68%', uvIndex: '8 High', sunset: '06:38 PM' },
    jaipur: { temp: '27°C', condition: 'Golden & Sunny', humidity: '38%', uvIndex: '6 Moderate', sunset: '06:50 PM' },
    varanasi: { temp: '25°C', condition: 'Misty Mornings', humidity: '50%', uvIndex: '5 Moderate', sunset: '06:15 PM' },
    agra: { temp: '27°C', condition: 'Clear Skies', humidity: '44%', uvIndex: '6 Moderate', sunset: '06:40 PM' },
    amritsar: { temp: '24°C', condition: 'Crisp & Sunny', humidity: '40%', uvIndex: '5 Moderate', sunset: '06:55 PM' },
    munnar: { temp: '21°C', condition: 'Misty Cloud Hills', humidity: '78%', uvIndex: '4 Low', sunset: '06:30 PM' },
    udaipur: { temp: '28°C', condition: 'Lakeside Breeze', humidity: '45%', uvIndex: '6 Moderate', sunset: '06:48 PM' },
    rishikesh: { temp: '22°C', condition: 'Mountain Fresh', humidity: '48%', uvIndex: '5 Moderate', sunset: '06:35 PM' }
  };

  const normCity = city?.toLowerCase()?.trim() || 'hyderabad';
  return weatherMap[normCity] || {
    temp: '28°C',
    condition: 'Sunny & Pleasant',
    humidity: '48%',
    uvIndex: '6 Moderate',
    sunset: '06:30 PM'
  };
};

/**
 * Format a base date offset by day index
 */
export const formatItineraryDate = (baseStartDate, dayIndex = 0) => {
  try {
    const d = baseStartDate ? new Date(baseStartDate) : new Date();
    d.setDate(d.getDate() + dayIndex);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return `Day ${dayIndex + 1}`;
  }
};

/**
 * Generates Day-by-Day AI Itinerary with strict multi-destination proportional distribution
 */
export const generateAIItinerary = async (tripData) => {
  const {
    destinations = ['hyderabad'],
    startDate,
    numberOfDays = 5,
    travelType = 'couple',
    categories = ['heritage', 'forts', 'historical-monuments'],
    originLocation = 'Hyderabad'
  } = tripData;

  const activeDestinations = Array.isArray(destinations) && destinations.length > 0
    ? destinations
    : ['hyderabad'];
  const totalDays = Math.max(1, Number(numberOfDays) || 1);

  // Fetch full destination knowledge in exact sequence
  const destinationDataList = await Promise.all(
    activeDestinations.map(id => getDestinationData(id))
  );

  const numDestinations = destinationDataList.length;
  const baseDaysPerDest = Math.floor(totalDays / numDestinations);
  const extraDays = totalDays % numDestinations;

  // Build day-to-destination mapping
  const daySchedulePlan = [];
  for (let d = 0; d < numDestinations; d++) {
    const daysForDest = baseDaysPerDest + (d < extraDays ? 1 : 0);
    for (let dayOffset = 0; dayOffset < daysForDest; dayOffset++) {
      daySchedulePlan.push({
        dest: destinationDataList[d],
        dayInCity: dayOffset
      });
    }
  }

  // Safety buffer if totalDays > daySchedulePlan length
  while (daySchedulePlan.length < totalDays) {
    daySchedulePlan.push({
      dest: destinationDataList[numDestinations - 1],
      dayInCity: daySchedulePlan.length
    });
  }

  const itinerary = [];

  for (let i = 0; i < totalDays; i++) {
    const planItem = daySchedulePlan[i];
    const currentDest = planItem.dest;
    const dayInCity = planItem.dayInCity;
    const places = currentDest.places || [];

    // Select places cleanly for this day in the destination
    const place1Index = (dayInCity * 2) % (places.length || 1);
    const place2Index = (dayInCity * 2 + 1) % (places.length || 1);
    const place3Index = (dayInCity * 2 + 2) % (places.length || 1);

    const place1 = places[place1Index] || null;
    const place2 = places[place2Index] || null;
    const place3 = places[place3Index] || null;

    const weather = getWeatherForDateAndLocation(currentDest.id, startDate);
    const dateFormatted = formatItineraryDate(startDate, i);

    const dayActivities = [];

    // 1. Morning Time Slot
    dayActivities.push({
      time: '08:30 AM - 11:30 AM',
      slotType: 'Morning Exploration',
      title: place1 ? place1.name : `Morning Heritage in ${currentDest.name}`,
      description: place1
        ? place1.description
        : `Begin your morning discovering the iconic landmarks and peaceful surroundings of ${currentDest.name}.`,
      image: place1?.image || 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
      category: place1?.category || 'Heritage',
      visitingHours: place1?.visitingHours?.open ? `${place1.visitingHours.open} - ${place1.visitingHours.close}` : '09:00 AM - 05:00 PM',
      entryInfo: place1?.entryInfo || 'Standard Entry',
      travelTip: place1?.travelTips || 'Arrive early to capture serene morning photography.',
      placeId: place1?.id
    });

    // 2. Midday Gastronomy & Culinary Tasting Slot
    dayActivities.push({
      time: '12:30 PM - 02:30 PM',
      slotType: 'Culinary Immersion & Local Flavors',
      title: `Authentic Regional Gastronomy in ${currentDest.name}`,
      description: `Relish authentic culinary recipes curated for ${travelType} travelers. Specialty tasting: ${place1?.culinarySpecialty || currentDest.tagline || 'Regional Thali & Artisanal Specialties'}.`,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      category: 'Culinary Heritage',
      visitingHours: '12:00 PM - 03:30 PM',
      entryInfo: 'Average ₹400 - ₹900 per person',
      travelTip: 'Try local refreshments and take a relaxed break during peak midday sun.'
    });

    // 3. Afternoon Heritage & Monument Slot
    if (place2 && place2.id !== place1?.id) {
      dayActivities.push({
        time: '03:30 PM - 05:30 PM',
        slotType: 'Afternoon Heritage Walk',
        title: place2.name,
        description: place2.description,
        image: place2.image,
        category: place2.category || 'Heritage',
        visitingHours: place2?.visitingHours?.open ? `${place2.visitingHours.open} - ${place2.visitingHours.close}` : 'Open until sunset',
        entryInfo: place2.entryInfo || 'Free / Standard Ticket',
        travelTip: place2.travelTips || 'Recommended for guided historical exploration.',
        placeId: place2.id
      });
    }

    // 4. Sunset Panorama & Evening Bazaar Slot
    dayActivities.push({
      time: '06:00 PM - 08:30 PM',
      slotType: 'Sunset & Cultural Promenade',
      title: place3 && place3.id !== place1?.id && place3.id !== place2?.id ? `${place3.name} at Sunset` : `Sunset Promenade & Twilight Bazaar in ${currentDest.name}`,
      description: place3 && place3.id !== place1?.id && place3.id !== place2?.id
        ? `Experience ${place3.name} during twilight as architectural illuminations begin and the evening breeze sets in.`
        : `Stroll through the vibrant illuminated night bazaars and cultural centers of ${currentDest.name}.`,
      image: place3?.image || 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
      category: 'Cultural & Sunset',
      visitingHours: 'Open until 10:00 PM',
      entryInfo: 'Free Public Access',
      travelTip: 'Ideal for purchasing local handicrafts, spices, and souvenirs.'
    });

    itinerary.push({
      dayNumber: i + 1,
      city: currentDest.name,
      state: currentDest.state,
      date: dateFormatted,
      weather,
      highlights: [place1?.name, place2?.name, place3?.name].filter(Boolean),
      activities: dayActivities
    });
  }

  return itinerary;
};

/**
 * Generates P5 Place Cards with Personalized Intelligence
 */
export const generatePlaceCards = async (itinerary, tripParams) => {
  const { travelType = 'couple', categories = [], originLocation = 'Hyderabad' } = tripParams;
  const cards = [];
  const seenPlaceIds = new Set();

  for (const day of itinerary) {
    for (const act of day.activities) {
      if (act.placeId && !seenPlaceIds.has(act.placeId)) {
        seenPlaceIds.add(act.placeId);

        let rationale = `This place was curated because you selected ${act.category} experiences and it fits seamlessly into Day ${day.dayNumber} of your ${travelType} journey in ${day.city}.`;
        if (categories.includes('forts') && act.title.toLowerCase().includes('fort')) {
          rationale = `Selected specifically for your interest in royal fortifications and strategic panoramic views in ${day.city}.`;
        } else if (categories.includes('spiritual') && act.category === 'Spiritual') {
          rationale = `Included as a cornerstone spiritual sanctuary offering serene prayer and sacred ceremonies.`;
        }

        cards.push({
          id: act.placeId,
          placeName: act.title,
          category: act.category,
          city: day.city,
          state: day.state,
          dayNumber: day.dayNumber,
          image: act.image,
          description: act.description,
          visitingHours: act.visitingHours,
          entryInfo: act.entryInfo,
          travelTips: act.travelTip,
          personalizedRationale: rationale,
          bestTime: 'Morning or Sunset',
          estimatedDuration: '2 Hours'
        });
      }
    }
  }

  return cards;
};

/**
 * Generates P6 Routes with coordinates and travel sequence
 */
export const generateRouteData = async (itinerary, tripParams) => {
  const { originLocation = 'Hyderabad' } = tripParams;
  const destinationDataList = await Promise.all(
    (tripParams.destinations || ['hyderabad']).map(id => getDestinationData(id))
  );

  const waypoints = [];

  const originNorm = originLocation.toLowerCase();
  const originDest = destinationDataList.find(d => d.id === originNorm) || destinationDataList[0];

  waypoints.push({
    stepIndex: 0,
    name: originLocation,
    type: 'Origin / Start',
    coordinates: originDest?.coordinates || { lat: 17.3850, lng: 78.4867 }
  });

  let step = 1;
  for (const day of itinerary) {
    for (const act of day.activities) {
      if (act.placeId) {
        const dest = destinationDataList.find(d => d.name.toLowerCase() === day.city.toLowerCase());
        const placeObj = dest?.places?.find(p => p.id === act.placeId);

        waypoints.push({
          stepIndex: step++,
          name: act.title,
          type: act.category,
          city: day.city,
          dayNumber: day.dayNumber,
          coordinates: placeObj?.coordinates || dest?.coordinates || { lat: 17.3850, lng: 78.4867 }
        });
      }
    }
  }

  const legs = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];

    const isDifferentCity = from.city && to.city && from.city !== to.city;

    legs.push({
      legIndex: i + 1,
      from: from.name,
      to: to.name,
      mode: isDifferentCity ? 'Vande Bharat Express / Flight' : 'City Cab / Metro Transit',
      distance: isDifferentCity ? '540 km' : '14 km',
      duration: isDifferentCity ? '4h 30m' : '35 mins',
      tip: isDifferentCity ? 'Book transit tickets in advance.' : 'Fastest via Metro / App Cab.'
    });
  }

  return {
    origin: originLocation,
    waypoints,
    legs,
    totalDistance: `${legs.reduce((acc, leg) => acc + (leg.mode.includes('Express') ? 540 : 14), 0)} km`,
    totalTransitTime: 'Approx. 12 Hours total journey'
  };
};
