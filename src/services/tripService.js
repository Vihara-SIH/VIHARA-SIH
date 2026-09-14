import {
  doc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase.js';
import { calculateBudgetBaseline as computeBudgetBaseline } from './vihara/budgetEngine.js';
import { generateTripPlan, generateRouteData as buildRouteData } from './vihara/tripEngine.js';
import {
  generateIntelligentItinerary,
  generatePlaceCards as buildPlaceCards,
  formatItineraryDate as formatDayDate
} from './vihara/itineraryEngine.js';
import { fallbackWeather } from './vihara/weatherClient.js';

export const formatDestinationForFirestore = (dest) => {
  if (!dest) return null;
  if (typeof dest === 'string') {
    return {
      destinationName: dest,
      placeId: `loc_${dest.toLowerCase().replace(/\s+/g, '_')}`,
      latitude: 17.3850,
      longitude: 78.4867
    };
  }

  const destinationName = dest.destinationName || dest.name || dest.mainText || dest.formattedAddress || 'Destination';
  const placeId = dest.placeId || dest.id || `loc_${dest.latitude || 0}_${dest.longitude || 0}`;
  const latitude = dest.latitude !== undefined
    ? Number(dest.latitude)
    : (dest.currentLocationLatitude !== undefined ? Number(dest.currentLocationLatitude) : 0);
  const longitude = dest.longitude !== undefined
    ? Number(dest.longitude)
    : (dest.currentLocationLongitude !== undefined ? Number(dest.currentLocationLongitude) : 0);

  return { destinationName, placeId, latitude, longitude };
};

export const saveTripDestinations = async (uid, tripId, destinations = []) => {
  if (!uid || !tripId) return false;
  try {
    const formatted = Array.isArray(destinations)
      ? destinations.map(formatDestinationForFirestore).filter(Boolean)
      : [];

    const tripRef = doc(db, 'users', uid, 'trips', tripId);
    await setDoc(tripRef, {
      tripId,
      destinations: formatted,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving trip destinations to Firestore:', error);
    return false;
  }
};

export const saveUserTrip = async (uid, tripData) => {
  if (!uid || !tripData || !tripData.tripId) return false;
  try {
    const tripRef = doc(db, 'users', uid, 'trips', tripData.tripId);
    const dataToSave = { ...tripData };

    if (Array.isArray(dataToSave.destinations)) {
      dataToSave.destinations = dataToSave.destinations.map(formatDestinationForFirestore).filter(Boolean);
    }
    if (Array.isArray(dataToSave.destinationOrder)) {
      dataToSave.destinationOrder = dataToSave.destinationOrder.map(formatDestinationForFirestore).filter(Boolean);
    }

    await setDoc(tripRef, {
      ...dataToSave,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user trip to Firestore:', error);
    return false;
  }
};

export const getUserTrips = async (uid) => {
  if (!uid) return [];
  try {
    const tripsRef = collection(db, 'users', uid, 'trips');
    const snapshot = await getDocs(tripsRef);
    const trips = [];
    snapshot.forEach((snap) => {
      trips.push({ id: snap.id, ...snap.data() });
    });
    return trips;
  } catch (error) {
    console.error('Error loading user trips:', error);
    return [];
  }
};

export const calculateBudgetBaseline = (
  destinations = [],
  numberOfDays = 1,
  numberOfTravelers = 1,
  selectedCategories = []
) => computeBudgetBaseline(destinations, numberOfDays, numberOfTravelers, selectedCategories);

/** Sync stub only. Live weather is fetched via /api/weather during itinerary generation. */
export const getWeatherForDateAndLocation = () => fallbackWeather();

export const formatItineraryDate = formatDayDate;

export const generateAIItinerary = async (tripData) => generateIntelligentItinerary(tripData);

export const generatePlaceCards = async (itinerary, tripParams) => buildPlaceCards(itinerary, tripParams);

export const generateRouteData = async (itinerary, tripParams) => buildRouteData(itinerary, tripParams);

export const generateFullTripPlan = async (tripParams) => generateTripPlan(tripParams);
