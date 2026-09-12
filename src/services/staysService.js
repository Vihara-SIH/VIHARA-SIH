import {
  doc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase.js';
import { HOTELS_DATABASE } from '../data/staysData.js';

/**
 * Calculates dynamic VIHARA Smart Match score (0–100%) for a hotel
 * considering active trip parameters, itinerary attractions, and budget.
 *
 * @param {Object} hotel - Hotel object from staysData
 * @param {Object} [tripData={}] - Active Trip Context parameters
 * @returns {{ score: number, breakdown: { locationFit: number, budgetFit: number, routeEfficiency: number, heritageAuthenticity: number }, reasons: string[] }}
 */
export function calculateSmartMatch(hotel, tripData = {}) {
  if (!hotel) {
    return {
      score: 85,
      breakdown: { locationFit: 85, budgetFit: 85, routeEfficiency: 85, heritageAuthenticity: 85 },
      reasons: ['Curated heritage sanctuary']
    };
  }

  const {
    destinations = [],
    budget = 25000,
    numberOfDays = 4,
    numberOfTravelers = 2,
    categories = ['heritage'],
    generatedItinerary = [],
    placeCards = []
  } = tripData;

  const nights = Math.max(1, (numberOfDays || 4) - 1);
  const targetNightlyBudget = Math.max(2500, Math.round((budget * 0.45) / nights));

  // 1. Location Fit (Proximity to planned attractions)
  let locationFit = hotel.matchBreakdown?.locationFit || 90;
  const reasons = [];

  // Check if any planned attractions in placeCards match nearby attractions
  const plannedAttractionTitles = placeCards.map(p => (p.placeName || p.title || '').toLowerCase());
  const matchedNearby = hotel.nearbyAttractions?.filter(att =>
    plannedAttractionTitles.some(title => title.includes(att.name.toLowerCase()) || att.name.toLowerCase().includes(title))
  );

  if (matchedNearby && matchedNearby.length > 0) {
    locationFit = Math.min(99, locationFit + 4);
    reasons.push(`Within ${matchedNearby[0].driveTime || matchedNearby[0].distance} of your planned attraction: ${matchedNearby[0].name}`);
  } else if (hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0) {
    reasons.push(`Conveniently located near ${hotel.nearbyAttractions[0].name} (${hotel.nearbyAttractions[0].distance})`);
  }

  // 2. Budget Fit
  let budgetFit = 88;
  const hotelBaseRate = hotel.pricePerNight || 4800;
  const priceDiff = Math.abs(hotelBaseRate - targetNightlyBudget);
  if (hotelBaseRate <= targetNightlyBudget) {
    budgetFit = 95;
    reasons.push(`Fits comfortably within your allocated accommodation budget of ₹${(targetNightlyBudget * nights).toLocaleString()}`);
  } else if (priceDiff < 2000) {
    budgetFit = 90;
    reasons.push(`Close alignment with your ₹${targetNightlyBudget.toLocaleString()}/night accommodation target`);
  } else {
    budgetFit = Math.max(70, Math.round(90 - (priceDiff / 1000) * 4));
  }

  // 3. Route Efficiency
  const routeEfficiency = hotel.matchBreakdown?.routeEfficiency || 92;
  reasons.push('Central geographic base minimizing daily intra-city transfer times');

  // 4. Heritage & Category Fit
  let heritageAuthenticity = hotel.matchBreakdown?.heritageAuthenticity || 94;
  if (categories.includes('heritage') || categories.includes('forts')) {
    heritageAuthenticity = Math.min(99, heritageAuthenticity + 3);
  }

  // Overall Weighted Score
  const totalScore = Math.round(
    locationFit * 0.35 +
    budgetFit * 0.25 +
    routeEfficiency * 0.25 +
    heritageAuthenticity * 0.15
  );

  return {
    score: Math.min(99, Math.max(65, totalScore)),
    breakdown: {
      locationFit,
      budgetFit,
      routeEfficiency,
      heritageAuthenticity
    },
    reasons: reasons.slice(0, 3)
  };
}

/**
 * Searches and filters hotels matching criteria and adds live Smart Match scoring
 */
export function searchStays(searchParams = {}, tripData = {}) {
  const {
    destination = '',
    category = 'all',
    minPrice = 0,
    maxPrice = 100000,
    minRating = 0,
    minSmartMatch = 0,
    sortBy = 'recommended'
  } = searchParams;

  const destNorm = (destination || '').toLowerCase().trim();

  let results = HOTELS_DATABASE.map(hotel => {
    const smartMatch = calculateSmartMatch(hotel, tripData);
    return {
      ...hotel,
      smartMatchScore: smartMatch.score,
      smartMatchBreakdown: smartMatch.breakdown,
      smartMatchReasons: smartMatch.reasons
    };
  });

  // Filter by destination
  if (destNorm && destNorm !== 'all' && destNorm !== 'india') {
    results = results.filter(hotel => {
      const cityNorm = hotel.city.toLowerCase();
      const citySlug = hotel.citySlug.toLowerCase();
      const locNorm = hotel.location.toLowerCase();
      const nameNorm = hotel.name.toLowerCase();

      return (
        cityNorm.includes(destNorm) ||
        destNorm.includes(cityNorm) ||
        citySlug.includes(destNorm) ||
        locNorm.includes(destNorm) ||
        nameNorm.includes(destNorm)
      );
    });

    // If no exact city match in mock data, return all hotels with destination adaptive scoring
    if (results.length === 0) {
      results = HOTELS_DATABASE.map(hotel => {
        const smartMatch = calculateSmartMatch(hotel, tripData);
        return {
          ...hotel,
          smartMatchScore: smartMatch.score,
          smartMatchBreakdown: smartMatch.breakdown,
          smartMatchReasons: smartMatch.reasons
        };
      });
    }
  }

  // Filter by category
  if (category && category !== 'all') {
    results = results.filter(hotel => hotel.category === category);
  }

  // Filter by price
  results = results.filter(hotel => hotel.pricePerNight >= minPrice && hotel.pricePerNight <= maxPrice);

  // Filter by rating
  if (minRating > 0) {
    results = results.filter(hotel => hotel.rating >= minRating);
  }

  // Filter by Smart Match Score
  if (minSmartMatch > 0) {
    results = results.filter(hotel => hotel.smartMatchScore >= minSmartMatch);
  }

  // Sorting
  if (sortBy === 'smart-match' || sortBy === 'recommended') {
    results.sort((a, b) => b.smartMatchScore - a.smartMatchScore);
  } else if (sortBy === 'price-low') {
    results.sort((a, b) => a.pricePerNight - b.pricePerNight);
  } else if (sortBy === 'price-high') {
    results.sort((a, b) => b.pricePerNight - a.pricePerNight);
  } else if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  }

  return results;
}

/**
 * Calculates itemized tariff breakdown consistently across all booking stages
 */
export function calculateStayPricing(room, nights = 1, roomsCount = 1) {
  const safeNights = Math.max(1, Number(nights) || 1);
  const safeRooms = Math.max(1, Number(roomsCount) || 1);
  const nightlyTariff = room ? (room.pricePerNight || 4800) : 4800;

  const baseTariff = nightlyTariff * safeNights * safeRooms;
  const heritageCess = Math.round(baseTariff * 0.08); // 8% Heritage Conservation Cess
  const gst = Math.round(baseTariff * 0.18); // 18% GST
  const memberDiscount = safeNights >= 3 ? 800 : (safeNights >= 2 ? 400 : 0);
  const roundOff = 0;
  const totalAmount = baseTariff + heritageCess + gst - memberDiscount + roundOff;

  return {
    nightlyTariff,
    nights: safeNights,
    roomsCount: safeRooms,
    baseTariff,
    heritageCess,
    gst,
    memberDiscount,
    roundOff,
    totalAmount
  };
}

/**
 * Generates a unique, professional booking reference ID
 */
export function generateBookingReference(destination = 'GOA') {
  const destPrefix = (destination || 'IND').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'GOA');
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `VIH-${destPrefix}-${randomNum}`;
}

/**
 * Persists a new booking to Firestore under users/{uid}/bookings/{bookingId}
 */
export async function saveUserBooking(uid, bookingData) {
  if (!bookingData || !bookingData.bookingId) return null;

  const cleanData = {
    ...bookingData,
    status: bookingData.status || 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: serverTimestamp()
  };

  if (uid) {
    try {
      const bookingRef = doc(db, 'users', uid, 'bookings', bookingData.bookingId);
      await setDoc(bookingRef, cleanData, { merge: true });
      console.log('[VIHARA Stays] Booking saved to Firestore:', bookingData.bookingId);
    } catch (err) {
      console.warn('[VIHARA Stays] Error saving booking to Firestore:', err);
    }
  }

  // Also cache locally in localStorage for persistent offline recovery
  try {
    const localKey = `vihara_bookings_${uid || 'guest'}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    const updated = [cleanData, ...existing.filter(b => b.bookingId !== bookingData.bookingId)];
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {
    // Ignore localStorage errors
  }

  return cleanData;
}

/**
 * Fetches all saved bookings for an authenticated user
 */
export async function getUserBookings(uid) {
  const bookings = [];

  // Try Firestore first
  if (uid) {
    try {
      const bookingsRef = collection(db, 'users', uid, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      snapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
    } catch (err) {
      console.warn('[VIHARA Stays] Firestore load notice:', err);
    }
  }

  // Also merge with localStorage
  try {
    const localKey = `vihara_bookings_${uid || 'guest'}`;
    const localBookings = JSON.parse(localStorage.getItem(localKey) || '[]');
    for (const lb of localBookings) {
      if (!bookings.some(b => b.bookingId === lb.bookingId || b.id === lb.bookingId)) {
        bookings.push(lb);
      }
    }
  } catch (e) {}

  return bookings;
}

/**
 * Cancels a user booking in Firestore and localStorage
 */
export async function cancelUserBooking(uid, bookingId) {
  if (!bookingId) return false;

  if (uid) {
    try {
      const bookingRef = doc(db, 'users', uid, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('[VIHARA Stays] Error cancelling in Firestore:', err);
    }
  }

  try {
    const localKey = `vihara_bookings_${uid || 'guest'}`;
    const localBookings = JSON.parse(localStorage.getItem(localKey) || '[]');
    const updated = localBookings.map(b =>
      b.bookingId === bookingId ? { ...b, status: 'cancelled', cancelledAt: new Date().toISOString() } : b
    );
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {}

  return true;
}

/**
 * Links accommodation booking directly to the user's trip in Firestore
 */
export async function addStayToTrip(uid, tripId, bookingData) {
  if (!bookingData) return false;

  const accommodationSummary = {
    bookingId: bookingData.bookingId,
    hotelId: bookingData.hotel?.id || bookingData.hotelId,
    hotelName: bookingData.hotel?.name || bookingData.hotelName,
    hotelImage: bookingData.hotel?.heroImage || bookingData.hotelImage,
    roomName: bookingData.room?.name || bookingData.roomName,
    checkIn: bookingData.checkIn,
    checkOut: bookingData.checkOut,
    nights: bookingData.nights,
    guests: bookingData.guests,
    totalPrice: bookingData.pricing?.totalAmount || bookingData.totalPrice,
    status: 'confirmed',
    linkedAt: new Date().toISOString()
  };

  if (uid && tripId) {
    try {
      const tripRef = doc(db, 'users', uid, 'trips', tripId);
      await setDoc(tripRef, {
        accommodation: accommodationSummary,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('[VIHARA Stays] Linked stay to trip:', tripId);
    } catch (err) {
      console.warn('[VIHARA Stays] Error linking stay to trip in Firestore:', err);
    }
  }

  return accommodationSummary;
}
