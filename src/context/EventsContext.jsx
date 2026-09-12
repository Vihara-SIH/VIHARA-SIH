import React, { createContext, useContext, useState, useEffect } from 'react';
import { EVENTS_CATALOG } from '../data/eventsData';
import { eventService } from '../services/eventService';
import { useAuth } from './AuthContext';
import { useTrip } from './TripContext';

const EventsContext = createContext();

export function EventsProvider({ children }) {
  const { user } = useAuth();
  const tripContext = useTrip();
  const activeTrip = tripContext?.tripData || null;

  // Navigation stage: 'discovery' | 'results' | 'details' | 'tickets' | 'payment' | 'confirmation' | 'my-events'
  const [activeStage, setActiveStage] = useState('discovery');
  
  // Selected active event
  const [selectedEvent, setSelectedEvent] = useState(EVENTS_CATALOG[0]);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(activeTrip?.destination || 'Hyderabad');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedDate, setSelectedDate] = useState('Weekend (14-15 Sep)');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [maxDistance, setMaxDistance] = useState(15);
  const [onlyTripFit, setOnlyTripFit] = useState(false);
  const [sortBy, setSortBy] = useState('best_match'); // 'best_match' | 'distance' | 'price_low' | 'time'
  
  const [searchResults, setSearchResults] = useState(EVENTS_CATALOG);
  const [isSearching, setIsSearching] = useState(false);

  // Booking and ticket state
  const [selectedTierId, setSelectedTierId] = useState('tier_baithak');
  const [ticketQuantity, setTicketQuantity] = useState(2);
  const [guestDetails, setGuestDetails] = useState({
    fullName: user?.displayName || 'Aditya Sharma',
    email: user?.email || 'aditya.sharma@vihara.heritage',
    phone: '+91 98765 43210',
    specialRequests: 'Traditional front cushion seating preferred',
    syncToTrip: true
  });

  const [activeBooking, setActiveBooking] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Update selected city if active trip changes
  useEffect(() => {
    if (activeTrip?.destination) {
      setSelectedCity(activeTrip.destination);
    }
  }, [activeTrip?.destination]);

  // Load user bookings on mount or user change
  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    const bookings = await eventService.getUserBookings(user);
    setUserBookings(bookings);
  };

  const showToast = (message, duration = 3000) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };

  // Perform search
  const executeSearch = async (overrides = {}) => {
    setIsSearching(true);
    const city = overrides.city !== undefined ? overrides.city : selectedCity;
    const genre = overrides.genre !== undefined ? overrides.genre : selectedGenre;
    const query = overrides.query !== undefined ? overrides.query : searchQuery;
    const format = overrides.format !== undefined ? overrides.format : selectedFormat;
    const price = overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
    const tripFit = overrides.onlyTripFit !== undefined ? overrides.onlyTripFit : onlyTripFit;

    try {
      let results = await eventService.searchEvents({
        city,
        genre,
        query,
        format,
        maxPrice: price,
        maxDistance,
        onlyTripFit: tripFit,
        activeTrip
      });

      // Sorting
      if (sortBy === 'distance') {
        results.sort((a, b) => a.distanceKm - b.distanceKm);
      } else if (sortBy === 'price_low') {
        results.sort((a, b) => a.priceStarting - b.priceStarting);
      } else if (sortBy === 'best_match') {
        results.sort((a, b) => (b.itineraryScore || 90) - (a.itineraryScore || 90));
      }

      setSearchResults(results);
      if (overrides.navigate !== false) {
        setActiveStage('results');
      }
    } catch (err) {
      console.error('Error executing event search:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select event and navigate to details
  const selectEventAndOpen = (eventOrId) => {
    let event = eventOrId;
    if (typeof eventOrId === 'string') {
      event = EVENTS_CATALOG.find(e => e.id === eventOrId) || EVENTS_CATALOG[0];
    }
    setSelectedEvent(event);
    if (event.tiers && event.tiers.length > 0) {
      setSelectedTierId(event.tiers[0].id);
    }
    setActiveStage('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4: Proceed to ticket selection
  const proceedToTickets = (event = null, tierId = null) => {
    if (event) setSelectedEvent(event);
    if (tierId) setSelectedTierId(tierId);
    setActiveStage('tickets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 5: Proceed to checkout
  const proceedToPayment = () => {
    setActiveStage('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Complete booking
  const completeBooking = async (paymentMethod = 'UPI') => {
    const tier = (selectedEvent?.tiers || []).find(t => t.id === selectedTierId) || selectedEvent?.tiers?.[0] || { name: 'Standard Pass', price: selectedEvent?.priceStarting || 1200 };
    const baseTotal = tier.price * ticketQuantity;
    const gstAndCess = Math.round(baseTotal * 0.05);
    const grandTotal = baseTotal + gstAndCess;

    const bookingPayload = {
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventSubtitle: selectedEvent.subtitle,
      city: selectedEvent.city,
      venue: selectedEvent.venue,
      date: selectedEvent.date,
      timeSlot: selectedEvent.timeSlot,
      heroImage: selectedEvent.heroImage,
      tier: tier.name,
      tierPrice: tier.price,
      quantity: ticketQuantity,
      baseTotal,
      gstAndCess,
      grandTotal,
      paymentMethod,
      guestDetails,
      syncedWithTrip: guestDetails.syncToTrip,
      tripDayAnchor: 'Day 2 (Saturday, 14 Sep) Evening Anchor'
    };

    const newBooking = await eventService.createEventBooking(bookingPayload, user);
    setActiveBooking(newBooking);
    setUserBookings(prev => [newBooking, ...prev]);
    setActiveStage('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('🎉 Cultural Experience Formally Confirmed!');
    return newBooking;
  };

  return (
    <EventsContext.Provider
      value={{
        activeStage,
        setActiveStage,
        selectedEvent,
        setSelectedEvent,
        searchQuery,
        setSearchQuery,
        selectedCity,
        setSelectedCity,
        selectedGenre,
        setSelectedGenre,
        selectedFormat,
        setSelectedFormat,
        selectedDate,
        setSelectedDate,
        maxPrice,
        setMaxPrice,
        maxDistance,
        setMaxDistance,
        onlyTripFit,
        setOnlyTripFit,
        sortBy,
        setSortBy,
        searchResults,
        isSearching,
        selectedTierId,
        setSelectedTierId,
        ticketQuantity,
        setTicketQuantity,
        guestDetails,
        setGuestDetails,
        activeBooking,
        setActiveBooking,
        userBookings,
        toastMessage,
        showToast,
        executeSearch,
        selectEventAndOpen,
        proceedToTickets,
        proceedToPayment,
        completeBooking,
        loadBookings
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return ctx;
}

export default EventsContext;
