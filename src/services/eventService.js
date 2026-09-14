import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';
import { EVENTS_CATALOG } from '../data/eventsData.js';
import { calculateItineraryFit as scoreEventFit } from './vihara/eventEngine.js';

const LOCAL_STORAGE_KEY = 'vihara_event_bookings_v1';

export const eventService = {
  /**
   * Search and filter cultural events
   */
  async searchEvents({ query: searchTerm = '', city = '', genre = 'all', format = 'all', maxPrice = 10000, maxDistance = 25, onlyTripFit = false, activeTrip = null }) {
    // Artificial small latency for realistic UI state handling
    await new Promise(res => setTimeout(res, 50));

    let results = [...EVENTS_CATALOG];

    // Filter by city if provided
    if (city && city.trim() && city.toLowerCase() !== 'all') {
      const normCity = city.trim().toLowerCase();
      const cityMatches = results.filter(e => e.cityNormalized.includes(normCity) || normCity.includes(e.cityNormalized));
      if (cityMatches.length > 0) {
        results = cityMatches;
      }
    }

    // Filter by genre
    if (genre && genre !== 'all') {
      results = results.filter(e => e.genre === genre);
    }

    // Filter by format
    if (format && format !== 'all') {
      results = results.filter(e => e.format === format);
    }

    // Filter by price
    if (maxPrice) {
      results = results.filter(e => e.priceStarting <= maxPrice);
    }

    // Filter by search term
    if (searchTerm && searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      results = results.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.genreLabel.toLowerCase().includes(q) ||
        e.about.toLowerCase().includes(q)
      );
    }

    // If trip alignment requested, calculate dynamic scores
    if (activeTrip) {
      results = results.map(evt => {
        const fitInfo = this.calculateItineraryFit(evt, activeTrip);
        return {
          ...evt,
          itineraryScore: fitInfo.score,
          itinerarySlotFit: fitInfo.slotNote,
          isRecommendedForTrip: fitInfo.isRecommended
        };
      });

      if (onlyTripFit) {
        results = results.filter(e => e.isRecommendedForTrip);
      }
    }

    return results;
  },

  /**
   * Get single event by ID
   */
  async getEventById(id) {
    await new Promise(res => setTimeout(res, 30));
    return EVENTS_CATALOG.find(e => e.id === id) || EVENTS_CATALOG[0];
  },

  /**
   * Calculate itinerary compatibility
   */
  calculateItineraryFit(event, trip) {
    return scoreEventFit(event, trip);
  },

  /**
   * Save event booking to Firestore and localStorage
   */
  async createEventBooking(bookingData, user = null) {
    const bookingId = `VIH-EVT-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullBooking = {
      ...bookingData,
      id: bookingId,
      bookingReference: bookingId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      userId: user?.uid || 'guest_user',
      userEmail: user?.email || bookingData.guestDetails?.email || 'guest@vihara.heritage'
    };

    // 1. Save to storage
    try {
      if (typeof localStorage !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        existing.unshift(fullBooking);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
      } else {
        if (!globalThis.__vihara_event_memory) globalThis.__vihara_event_memory = [];
        globalThis.__vihara_event_memory.unshift(fullBooking);
      }
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    // 2. Save to Firestore if user is authenticated and DB is available
    if (db && user?.uid) {
      try {
        await addDoc(collection(db, 'eventBookings'), {
          ...fullBooking,
          firestoreCreatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore event booking sync fallback to local storage:', err);
      }
    }

    return fullBooking;
  },

  /**
   * Retrieve all bookings for user
   */
  async getUserBookings(user = null) {
    let localBookings = [];
    try {
      if (typeof localStorage !== 'undefined') {
        localBookings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      } else {
        localBookings = globalThis.__vihara_event_memory || [];
      }
    } catch (e) {
      localBookings = [];
    }

    if (!db || !user?.uid) {
      return localBookings;
    }

    try {
      const q = query(collection(db, 'eventBookings'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const remoteBookings = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Merge avoiding duplicate IDs
      const mergedMap = new Map();
      [...remoteBookings, ...localBookings].forEach(b => mergedMap.set(b.id || b.bookingReference, b));
      return Array.from(mergedMap.values());
    } catch (err) {
      console.warn('Firestore read error, using local bookings:', err);
      return localBookings;
    }
  },

  /**
   * Cancel an event booking
   */
  async cancelBooking(bookingId) {
    try {
      if (typeof localStorage !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        const updated = existing.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
      if (globalThis.__vihara_event_memory) {
        globalThis.__vihara_event_memory = globalThis.__vihara_event_memory.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
};

export default eventService;

