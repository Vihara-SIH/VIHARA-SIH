import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTrip } from './TripContext';
import {
  searchStays,
  calculateStayPricing,
  generateBookingReference,
  saveUserBooking,
  getUserBookings,
  cancelUserBooking,
  addStayToTrip
} from '../services/staysService';
import { getUserTrips, saveUserTrip } from '../services/tripService';
import { HOTELS_DATABASE } from '../data/staysData';

const StaysContext = createContext();

export const useStays = () => {
  const context = useContext(StaysContext);
  if (!context) {
    throw new Error('useStays must be used within a StaysProvider');
  }
  return context;
};

export const StaysProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const trip = useTrip();

  // Compute default dates (tomorrow to 4 nights later)
  const defaultCheckInDate = () => {
    if (trip?.startDate) return trip.startDate;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const defaultCheckOutDate = () => {
    if (trip?.endDate) return trip.endDate;
    const end = new Date();
    end.setDate(end.getDate() + 5);
    return end.toISOString().split('T')[0];
  };

  const computeNights = (start, end) => {
    if (!start || !end) return 4;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // 1. Search State
  const [searchParams, setSearchParams] = useState({
    destination: 'Goa',
    checkIn: defaultCheckInDate(),
    checkOut: defaultCheckOutDate(),
    nights: 4,
    guests: trip?.numberOfTravelers || 2,
    rooms: 1,
    category: 'all',
    minPrice: 0,
    maxPrice: 50000,
    minRating: 0,
    minSmartMatch: 0,
    sortBy: 'smart-match'
  });

  // Track if current parameters were auto-synced from Trip Planner
  const [isTripSynced, setIsTripSynced] = useState(true);

  // Split Map / List View Toggle in Results
  const [isMapView, setIsMapView] = useState(false);

  // 2. Active Stage in the Stays Journey
  // 'landing' | 'results' | 'details' | 'guest' | 'payment' | 'confirmation' | 'my-bookings'
  const [activeStage, setActiveStage] = useState('landing');

  // 3. Selected Entities
  const [selectedHotel, setSelectedHotel] = useState(HOTELS_DATABASE[0]);
  const [selectedRoom, setSelectedRoom] = useState(HOTELS_DATABASE[0]?.rooms[0] || null);

  // 4. Saved Hotels / Wishlist
  const [savedHotelIds, setSavedHotelIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vihara_saved_hotels') || '["heritage-goa-retreat"]');
    } catch {
      return ['heritage-goa-retreat'];
    }
  });

  const toggleSaveHotel = (hotelId) => {
    setSavedHotelIds(prev => {
      const exists = prev.includes(hotelId);
      const updated = exists ? prev.filter(id => id !== hotelId) : [...prev, hotelId];
      try {
        localStorage.setItem('vihara_saved_hotels', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const isHotelSaved = (hotelId) => savedHotelIds.includes(hotelId);

  // 5. User Trips in Firestore
  const [allUserTrips, setAllUserTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (user?.uid) {
        const trips = await getUserTrips(user.uid);
        setAllUserTrips(trips);
      }
    };
    fetchTrips();
  }, [user?.uid, trip?.tripId]);

  // 6. Primary Guest Details Form State
  const [guestDetails, setGuestDetails] = useState({
    firstName: userProfile?.name?.split(' ')[0] || '',
    lastName: userProfile?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || userProfile?.email || '',
    phone: '',
    countryCode: '+91',
    specialRequests: ['Quiet room', 'High floor'],
    arrivalTime: '02:00 PM - 04:00 PM',
    celebrationType: 'None',
    businessGst: ''
  });

  // 7. In-flight and active booking
  const [currentBooking, setCurrentBooking] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Dynamic Pricing Calculation
  const pricing = calculateStayPricing(
    selectedRoom || selectedHotel?.rooms[0],
    searchParams.nights,
    searchParams.rooms
  );

  // Budget Alignment Helper
  const getBudgetFitStatus = (nightlyRate) => {
    const tripTotalBudget = trip?.userSelectedBudget || 35000;
    const nights = searchParams.nights || 4;
    const targetAccBudget = Math.max(2500, Math.round((tripTotalBudget * 0.45) / nights));
    const totalStayCost = nightlyRate * nights;
    const totalAccLimit = targetAccBudget * nights;

    if (totalStayCost <= totalAccLimit) {
      return {
        status: 'within',
        badge: 'Within Budget',
        message: `Fits your ₹${totalAccLimit.toLocaleString()} accommodation budget`,
        color: 'emerald'
      };
    } else if (totalStayCost <= totalAccLimit * 1.25) {
      return {
        status: 'near',
        badge: 'Near Budget',
        message: `+₹${(totalStayCost - totalAccLimit).toLocaleString()} above target allocation`,
        color: 'amber'
      };
    } else {
      return {
        status: 'luxury',
        badge: 'Luxury Tier',
        message: 'Premium bespoke sanctuary exceeding standard allocation',
        color: 'purple'
      };
    }
  };

  // Auto-Prefill from TripContext whenever Trip data changes
  useEffect(() => {
    if (trip) {
      const tripPrimaryDest = Array.isArray(trip.selectedDestinations) && trip.selectedDestinations.length > 0
        ? (typeof trip.selectedDestinations[0] === 'object' ? (trip.selectedDestinations[0].name || trip.selectedDestinations[0].id) : trip.selectedDestinations[0])
        : 'Goa';

      const sDate = trip.startDate || defaultCheckInDate();
      const eDate = trip.endDate || defaultCheckOutDate();
      const nights = computeNights(sDate, eDate);

      setSearchParams(prev => ({
        ...prev,
        destination: tripPrimaryDest || prev.destination,
        checkIn: sDate,
        checkOut: eDate,
        nights,
        guests: trip.numberOfTravelers || prev.guests
      }));
      setIsTripSynced(true);
    }
  }, [trip?.selectedDestinations, trip?.startDate, trip?.endDate, trip?.numberOfTravelers]);

  // Auto-Prefill user profile info when Auth loads
  useEffect(() => {
    if (userProfile || user) {
      setGuestDetails(prev => ({
        ...prev,
        firstName: prev.firstName || userProfile?.name?.split(' ')[0] || 'Traveler',
        lastName: prev.lastName || userProfile?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || userProfile?.email || prev.email
      }));
    }
  }, [user, userProfile]);

  // Load user bookings from Firestore / LocalStorage
  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const bookings = await getUserBookings(user?.uid);
      setUserBookings(bookings);
    } catch (err) {
      console.warn('Error loading bookings:', err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user?.uid]);

  // Navigation / State Helpers
  const updateSearchField = (field, value) => {
    setSearchParams(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'checkIn' || field === 'checkOut') {
        updated.nights = computeNights(
          field === 'checkIn' ? value : prev.checkIn,
          field === 'checkOut' ? value : prev.checkOut
        );
      }
      return updated;
    });
  };

  const syncWithActiveTrip = () => {
    if (!trip) return;
    const tripDest = Array.isArray(trip.selectedDestinations) && trip.selectedDestinations.length > 0
      ? (typeof trip.selectedDestinations[0] === 'object' ? (trip.selectedDestinations[0].name || trip.selectedDestinations[0].id) : trip.selectedDestinations[0])
      : 'Goa';

    const nights = computeNights(trip.startDate, trip.endDate);
    setSearchParams(prev => ({
      ...prev,
      destination: tripDest,
      checkIn: trip.startDate || prev.checkIn,
      checkOut: trip.endDate || prev.checkOut,
      nights,
      guests: trip.numberOfTravelers || 2
    }));
    setIsTripSynced(true);
  };

  const navigateToStage = (stage) => {
    setActiveStage(stage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectHotelAndProceed = (hotel) => {
    setSelectedHotel(hotel);
    setSelectedRoom(hotel.rooms?.[0] || null);
    navigateToStage('details');
  };

  const selectRoomAndProceed = (room) => {
    setSelectedRoom(room);
    navigateToStage('guest');
  };

  const updateGuestInfo = (fields) => {
    setGuestDetails(prev => ({ ...prev, ...fields }));
  };

  // Safe Mock Payment Processing
  const processMockPayment = async (paymentMethod = 'UPI') => {
    setIsProcessingPayment(true);

    try {
      await new Promise(res => setTimeout(res, 1200));

      const bookingReference = generateBookingReference(searchParams.destination);

      const bookingData = {
        bookingId: bookingReference,
        referenceId: bookingReference,
        hotel: {
          id: selectedHotel?.id || 'heritage-goa-retreat',
          name: selectedHotel?.name || 'Heritage Goa Retreat & Villas',
          location: selectedHotel?.location || 'Bardez, North Goa',
          city: selectedHotel?.city || searchParams.destination,
          heroImage: selectedHotel?.heroImage,
          rating: selectedHotel?.rating || 4.9,
          badge: selectedHotel?.badge || 'Top Itinerary Fit'
        },
        room: {
          id: selectedRoom?.id || 'deluxe-portuguese-suite',
          name: selectedRoom?.name || 'Deluxe Portuguese Heritage Suite',
          tagline: selectedRoom?.tagline || 'King Bed • Garden View',
          bedType: selectedRoom?.bedType || '1 King Bed',
          mealPlan: selectedRoom?.mealPlan || 'Breakfast Included',
          cancellationPolicy: selectedRoom?.cancellationPolicy || 'Free cancellation until 24h before check-in',
          image: selectedRoom?.image || selectedHotel?.heroImage
        },
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        nights: searchParams.nights,
        guests: searchParams.guests,
        rooms: searchParams.rooms,
        guestDetails: {
          ...guestDetails,
          fullName: `${guestDetails.firstName} ${guestDetails.lastName}`.trim() || 'Traveler'
        },
        pricing,
        payment: {
          method: paymentMethod,
          status: 'paid',
          paidAmount: pricing.totalAmount,
          currency: 'INR',
          transactionId: `TXN-VAULT-${Date.now().toString().slice(-8)}`
        },
        status: 'confirmed',
        associatedTripId: trip?.tripId || null
      };

      const savedBooking = await saveUserBooking(user?.uid, bookingData);
      setCurrentBooking(savedBooking || bookingData);
      setUserBookings(prev => [savedBooking || bookingData, ...prev.filter(b => b.bookingId !== bookingReference)]);

      if (trip?.tripId) {
        await addStayToTrip(user?.uid, trip.tripId, savedBooking || bookingData);
      }

      navigateToStage('confirmation');
      return savedBooking || bookingData;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Add booked accommodation to active Trip
  const linkBookingToTrip = async (booking) => {
    const targetBooking = booking || currentBooking;
    if (!targetBooking) return false;

    const result = await addStayToTrip(user?.uid, trip?.tripId, targetBooking);
    return result;
  };

  // Link booked accommodation to a specific chosen trip from multiple trips
  const linkStayToSpecificTrip = async (targetTripId, booking) => {
    const targetBooking = booking || currentBooking;
    if (!targetBooking || !targetTripId) return false;

    const result = await addStayToTrip(user?.uid, targetTripId, targetBooking);
    return result;
  };

  // Create a brand new trip from a booked stay
  const createNewTripFromStay = async (booking) => {
    const targetBooking = booking || currentBooking;
    if (!targetBooking) return null;

    const newTripId = `trip-${Date.now()}`;
    const newTripData = {
      tripId: newTripId,
      originLocation: targetBooking.hotel?.city || 'Goa',
      destinations: [
        {
          destinationName: targetBooking.hotel?.city || 'Goa',
          name: targetBooking.hotel?.city || 'Goa',
          formattedAddress: `${targetBooking.hotel?.city || 'Goa'}, India`,
          placeId: `loc_${(targetBooking.hotel?.city || 'goa').toLowerCase()}`,
          latitude: 15.2993,
          longitude: 74.1240
        }
      ],
      startDate: targetBooking.checkIn,
      endDate: targetBooking.checkOut,
      numberOfDays: targetBooking.nights + 1,
      numberOfTravelers: targetBooking.guests,
      userSelectedBudget: targetBooking.pricing?.totalAmount ? targetBooking.pricing.totalAmount * 2 : 40000,
      accommodation: {
        bookingId: targetBooking.bookingId,
        hotelId: targetBooking.hotel?.id,
        hotelName: targetBooking.hotel?.name,
        hotelImage: targetBooking.hotel?.heroImage,
        roomName: targetBooking.room?.name,
        checkIn: targetBooking.checkIn,
        checkOut: targetBooking.checkOut,
        nights: targetBooking.nights,
        guests: targetBooking.guests,
        totalPrice: targetBooking.pricing?.totalAmount,
        status: 'confirmed'
      }
    };

    if (user?.uid) {
      await saveUserTrip(user.uid, newTripData);
    }

    setAllUserTrips(prev => [newTripData, ...prev]);
    return newTripData;
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    await cancelUserBooking(user?.uid, bookingId);
    setUserBookings(prev =>
      prev.map(b => (b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    if (currentBooking && currentBooking.bookingId === bookingId) {
      setCurrentBooking(prev => ({ ...prev, status: 'cancelled' }));
    }
  };

  // Reset Stays Flow
  const resetStaysFlow = () => {
    setActiveStage('landing');
    setSelectedHotel(HOTELS_DATABASE[0]);
    setSelectedRoom(HOTELS_DATABASE[0]?.rooms[0] || null);
    setCurrentBooking(null);
  };

  const value = {
    searchParams,
    setSearchParams,
    updateSearchField,
    isTripSynced,
    syncWithActiveTrip,
    isMapView,
    setIsMapView,
    activeStage,
    setActiveStage,
    navigateToStage,
    selectedHotel,
    setSelectedHotel,
    selectedRoom,
    setSelectedRoom,
    selectHotelAndProceed,
    selectRoomAndProceed,
    savedHotelIds,
    toggleSaveHotel,
    isHotelSaved,
    allUserTrips,
    linkStayToSpecificTrip,
    createNewTripFromStay,
    getBudgetFitStatus,
    guestDetails,
    updateGuestInfo,
    pricing,
    currentBooking,
    setCurrentBooking,
    userBookings,
    isLoadingBookings,
    isProcessingPayment,
    processMockPayment,
    linkBookingToTrip,
    handleCancelBooking,
    loadBookings,
    resetStaysFlow,
    tripContextData: trip
  };

  return <StaysContext.Provider value={value}>{children}</StaysContext.Provider>;
};
