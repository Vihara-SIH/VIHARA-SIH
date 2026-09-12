import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  analyzeCategoriesForDestinations,
  CATEGORY_DEFINITIONS
} from '../services/destinationService';
import {
  calculateBudgetBaseline,
  generateAIItinerary,
  generatePlaceCards,
  generateRouteData,
  saveUserTrip,
  saveTripDestinations
} from '../services/tripService';
import {
  detectCurrentLocation,
  LocationErrorCode
} from '../services/locationService';

const TripContext = createContext();

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

export const TripProvider = ({ children }) => {
  const { user } = useAuth();

  // Location State (P1 First Step in Trip Planning)
  const [currentLocation, setCurrentLocation] = useState('Hyderabad');
  const [currentLocationName, setCurrentLocationName] = useState('Hyderabad, Telangana, India');
  const [currentLocationLatitude, setCurrentLocationLatitude] = useState(17.3850);
  const [currentLocationLongitude, setCurrentLocationLongitude] = useState(78.4867);
  const [userLocation, setUserLocation] = useState(null); // { latitude, longitude, city, state, country, formattedAddress, placeId, name }
  const [locationMode, setLocationMode] = useState('auto'); // 'auto' | 'manual'
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'detecting' | 'success' | 'denied' | 'unavailable' | 'timeout' | 'error'
  const [locationError, setLocationError] = useState(null);

  // P2: Trip Details & Preferences (Destinations as structured objects)
  const defaultInitialDestinations = [
    {
      destinationName: 'Hyderabad',
      name: 'Hyderabad',
      formattedAddress: 'Hyderabad, Telangana, India',
      placeId: 'ChIJx9Lr6tSTyzsRkJ9B9y_xVms',
      latitude: 17.3850,
      longitude: 78.4867,
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India'
    }
  ];

  const [destinations, setDestinations] = useState(defaultInitialDestinations);
  const [destinationOrder, setDestinationOrder] = useState(defaultInitialDestinations);

  // Derived selectedDestinations for backwards compatibility (array of strings or objects)
  const selectedDestinations = destinations.map(d => typeof d === 'object' ? (d.destinationName || d.name || d.id || 'Destination') : d);

  // Date Range Selection (Default 5 days from tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fiveDaysLater = new Date();
  fiveDaysLater.setDate(tomorrow.getDate() + 4);

  const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(fiveDaysLater.toISOString().split('T')[0]);
  const [numberOfDays, setNumberOfDays] = useState(5);

  // Traveling Company & Number of Travelers
  const [travelType, setTravelType] = useState('couple'); // 'solo' | 'couple' | 'family' | 'friends'
  const [numberOfTravelers, setNumberOfTravelers] = useState(2);

  // P2: Category Analysis Matrix
  const [categoryMatrix, setCategoryMatrix] = useState({});
  const [selectedCategories, setSelectedCategories] = useState(['heritage', 'historical-monuments', 'forts', 'unesco-sites']);

  // P3: Budgeting
  const [minimumBaseline, setMinimumBaseline] = useState(25000);
  const [userSelectedBudget, setUserSelectedBudget] = useState(35000);

  // P4, P5, P6 Outputs
  const [generatedItinerary, setGeneratedItinerary] = useState([]);
  const [placeCards, setPlaceCards] = useState([]);
  const [routeData, setRouteData] = useState(null);

  // State Management
  const [activeStep, setActiveStep] = useState(1); // 1 = Details/Dates, 2 = Categories, 3 = Budget, 4 = Overview
  const [isGenerating, setIsGenerating] = useState(false);
  const [tripId, setTripId] = useState(`trip-${Date.now()}`);

  // Unified location update handler (keeps currentLocation isolated)
  const updateLocationDetails = (locationObj, mode = 'auto') => {
    if (!locationObj) return;

    const lat = locationObj.currentLocationLatitude !== undefined
      ? locationObj.currentLocationLatitude
      : locationObj.latitude;
    const lng = locationObj.currentLocationLongitude !== undefined
      ? locationObj.currentLocationLongitude
      : locationObj.longitude;
    const name = locationObj.currentLocationName ||
      locationObj.formattedAddress ||
      locationObj.name ||
      [locationObj.city, locationObj.state, locationObj.country].filter(Boolean).join(', ') ||
      'Detected Location';

    const fullLocation = {
      ...locationObj,
      currentLocationName: name,
      currentLocationLatitude: lat,
      currentLocationLongitude: lng,
      latitude: lat,
      longitude: lng,
      formattedAddress: locationObj.formattedAddress || name
    };

    setUserLocation(fullLocation);
    setCurrentLocation(name);
    setCurrentLocationName(name);
    if (lat !== undefined && lat !== null) setCurrentLocationLatitude(lat);
    if (lng !== undefined && lng !== null) setCurrentLocationLongitude(lng);

    setLocationMode(mode);
    setLocationStatus('success');
    setLocationError(null);
  };

  // Option A: Automatic GPS Location Detection
  const detectLocation = async (forceRefresh = false) => {
    if (!forceRefresh && userLocation && locationStatus === 'success' && locationMode === 'auto') {
      return userLocation;
    }

    setLocationMode('auto');
    setLocationStatus('detecting');
    setLocationError(null);

    try {
      const loc = await detectCurrentLocation();
      updateLocationDetails(loc, 'auto');
      return loc;
    } catch (err) {
      console.warn('[VIHARA TripContext] Location detection notice:', err);
      let status = 'error';
      let message = err.message || 'Unable to determine your current location name. Please try again.';

      if (err.code === LocationErrorCode.PERMISSION_DENIED) {
        status = 'denied';
        message = 'Location permission is required to automatically detect your current location.';
      } else if (err.code === LocationErrorCode.POSITION_UNAVAILABLE) {
        status = 'unavailable';
        message = 'Browser cannot determine location. Please check device location settings.';
      } else if (err.code === LocationErrorCode.TIMEOUT) {
        status = 'timeout';
        message = 'Location request timed out. Please try again.';
      } else if (err.code === LocationErrorCode.GEOCODE_FAILED) {
        status = 'error';
        message = 'Unable to determine your current location name. Please try again.';
      }

      setLocationStatus(status);
      setLocationError(message);
      throw err;
    }
  };

  // Option B: User selects a Place from Google Places Autocomplete
  const setManualLocation = (placeDetails) => {
    updateLocationDetails(placeDetails, 'manual');
  };

  // Add a destination with duplicate checking (by placeId or exact name match) and persist to Firestore
  const addDestination = async (destObj) => {
    if (!destObj) {
      return { success: false, message: 'Invalid destination data.' };
    }

    const destinationName = destObj.destinationName || destObj.name || destObj.mainText || destObj.formattedAddress || 'Destination';
    const placeId = destObj.placeId || destObj.id || `loc_${destObj.latitude || 0}_${destObj.longitude || 0}`;
    const formattedAddress = destObj.formattedAddress || destObj.description || destinationName;
    const latitude = destObj.latitude !== undefined
      ? Number(destObj.latitude)
      : (destObj.currentLocationLatitude !== undefined ? Number(destObj.currentLocationLatitude) : 17.3850);
    const longitude = destObj.longitude !== undefined
      ? Number(destObj.longitude)
      : (destObj.currentLocationLongitude !== undefined ? Number(destObj.currentLocationLongitude) : 78.4867);

    const cleanDest = {
      destinationName,
      placeId,
      latitude,
      longitude,
      name: destinationName,
      formattedAddress,
      city: destObj.city || destinationName,
      state: destObj.state || '',
      country: destObj.country || 'India'
    };

    // Check for duplicate placeId or matching name
    const isDuplicate = destinations.some(d => {
      const existingPlaceId = typeof d === 'object' ? d.placeId : null;
      const existingName = typeof d === 'object' ? (d.destinationName || d.name) : d;
      if (existingPlaceId && cleanDest.placeId && existingPlaceId === cleanDest.placeId) return true;
      if (existingName && cleanDest.destinationName && existingName.toLowerCase().trim() === cleanDest.destinationName.toLowerCase().trim()) return true;
      return false;
    });

    if (isDuplicate) {
      return {
        success: false,
        duplicate: true,
        message: 'Destination already added.'
      };
    }

    const updated = [...destinations, cleanDest];
    setDestinations(updated);
    setDestinationOrder(prev => [...prev, cleanDest]);

    // Persist destination selection directly into user's existing Firestore trip document under users/{userId}/trips/{tripId}
    if (user && user.uid) {
      try {
        await saveTripDestinations(user.uid, tripId, updated);
      } catch (err) {
        console.error('Error auto-saving destination to Firestore:', err);
      }
    }

    return { success: true, destination: cleanDest };
  };

  // Remove a destination by placeId, name, or index and persist to Firestore
  const removeDestination = async (identifier) => {
    let updated = [];
    setDestinations(prev => {
      if (typeof identifier === 'number') {
        updated = prev.filter((_, idx) => idx !== identifier);
      } else {
        updated = prev.filter(d => {
          const pId = typeof d === 'object' ? (d.placeId || d.destinationName || d.name) : d;
          return pId !== identifier;
        });
      }
      return updated;
    });

    setDestinationOrder(prev => {
      if (typeof identifier === 'number') {
        return prev.filter((_, idx) => idx !== identifier);
      }
      return prev.filter(d => {
        const pId = typeof d === 'object' ? (d.placeId || d.destinationName || d.name) : d;
        return pId !== identifier;
      });
    });

    if (user && user.uid) {
      try {
        await saveTripDestinations(user.uid, tripId, updated);
      } catch (err) {
        console.error('Error syncing destination removal to Firestore:', err);
      }
    }
  };

  // Clear all destinations and persist to Firestore
  const clearDestinations = async () => {
    setDestinations([]);
    setDestinationOrder([]);
    if (user && user.uid) {
      try {
        await saveTripDestinations(user.uid, tripId, []);
      } catch (err) {
        console.error('Error syncing clear destinations to Firestore:', err);
      }
    }
  };

  // Re-calculate category availability when destinations change
  useEffect(() => {
    let isMounted = true;
    const fetchMatrix = async () => {
      const matrix = await analyzeCategoriesForDestinations(destinations);
      if (isMounted) {
        setCategoryMatrix(matrix);
        // Ensure destinationOrder includes all current destinations
        setDestinationOrder(prev => {
          const prevIds = prev.map(p => (typeof p === 'object' ? (p.placeId || p.name) : p));
          const currentIds = destinations.map(d => (typeof d === 'object' ? (d.placeId || d.name) : d));
          const filtered = prev.filter(p => currentIds.includes(typeof p === 'object' ? (p.placeId || p.name) : p));
          const added = destinations.filter(d => !prevIds.includes(typeof d === 'object' ? (d.placeId || d.name) : d));
          return [...filtered, ...added];
        });
      }
    };
    fetchMatrix();
    return () => { isMounted = false; };
  }, [destinations]);

  // Re-calculate AI minimum baseline when parameters change
  useEffect(() => {
    const baseline = calculateBudgetBaseline(
      destinations,
      numberOfDays,
      numberOfTravelers,
      selectedCategories
    );
    setMinimumBaseline(baseline);
    if (userSelectedBudget < baseline) {
      setUserSelectedBudget(Math.round(baseline * 1.2));
    }
  }, [destinations, numberOfDays, numberOfTravelers, selectedCategories]);

  // Set explicit date range with auto calculation
  const setDateRange = (start, end) => {
    setStartDate(start);
    setEndDate(end || '');
    if (start && end && start !== end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setNumberOfDays(diffDays > 0 ? diffDays : 1);
    } else if (start && end && start === end) {
      setNumberOfDays(1);
    }
  };

  // Toggle Subcategory
  const toggleSubcategory = (subId) => {
    setSelectedCategories(prev => {
      if (prev.includes(subId)) {
        return prev.filter(s => s !== subId);
      } else {
        return [...prev, subId];
      }
    });
  };

  // Toggle Main Category (Cascades only to AVAILABLE subcategories under it)
  const toggleMainCategory = (mainCatId) => {
    const category = categoryMatrix[mainCatId];
    if (!category || !category.enabled) return;

    const availableSubIds = category.subcategories
      .filter(s => s.available)
      .map(s => s.id);

    const allChecked = availableSubIds.every(id => selectedCategories.includes(id));

    setSelectedCategories(prev => {
      if (allChecked) {
        return prev.filter(id => !availableSubIds.includes(id) && id !== mainCatId);
      } else {
        const set = new Set([...prev, ...availableSubIds, mainCatId]);
        return Array.from(set);
      }
    });
  };

  // Set Traveling Company
  const setCompany = (type, customCount = null) => {
    setTravelType(type);
    if (type === 'solo') {
      setNumberOfTravelers(1);
    } else if (type === 'couple') {
      setNumberOfTravelers(2);
    } else if (customCount !== null) {
      setNumberOfTravelers(Math.max(1, parseInt(customCount, 10) || 1));
    }
  };

  // Reorder destination sequence (User editing) and sync to Firestore
  const updateDestinationSequence = async (newOrder) => {
    setDestinationOrder(newOrder);
    if (user && user.uid && Array.isArray(newOrder)) {
      try {
        await saveTripDestinations(user.uid, tripId, newOrder);
      } catch (err) {
        console.error('Error syncing destination reorder to Firestore:', err);
      }
    }
  };

  // Sync destinations to Firestore when authenticated user is present
  useEffect(() => {
    if (user && user.uid && destinations && destinations.length > 0) {
      saveTripDestinations(user.uid, tripId, destinations).catch(err => {
        console.error('Error auto-syncing trip destinations on auth change:', err);
      });
    }
  }, [user, tripId]);

  // Generate All AI outputs (P4 Itinerary, P5 Place Cards, P6 Routes)
  const generateTripOutputs = async (customDestinations = null) => {
    setIsGenerating(true);

    try {
      const activeDestinations = Array.isArray(customDestinations) && customDestinations.length > 0
        ? customDestinations
        : (destinationOrder.length > 0 ? destinationOrder : destinations);

      const tripParams = {
        tripId,
        originLocation: currentLocationName || currentLocation,
        currentLocationName,
        currentLocationLatitude,
        currentLocationLongitude,
        userLocation,
        destinations: activeDestinations,
        destinationOrder: activeDestinations,
        startDate,
        endDate,
        numberOfDays,
        travelType,
        numberOfTravelers,
        categories: selectedCategories,
        budget: userSelectedBudget,
        minimumBaseline
      };

      // 1. Generate Itinerary
      const itinerary = await generateAIItinerary(tripParams);
      setGeneratedItinerary(itinerary);

      // 2. Generate P5 Place Cards with personalized rationales
      const cards = await generatePlaceCards(itinerary, tripParams);
      setPlaceCards(cards);

      // 3. Generate P6 Routes and sequence calculations
      const routes = await generateRouteData(itinerary, tripParams);
      setRouteData(routes);

      // 4. Save to Firestore if authenticated user
      if (user && user.uid) {
        await saveUserTrip(user.uid, {
          ...tripParams,
          itinerary,
          placeCards: cards,
          routeData: routes
        });
      }

      return { itinerary, cards, routes };
    } catch (error) {
      console.error('Error generating trip plan:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset Trip State
  const resetTripState = () => {
    setTripId(`trip-${Date.now()}`);
    setDestinations(defaultInitialDestinations);
    setDestinationOrder(defaultInitialDestinations);
    setActiveStep(1);
    setGeneratedItinerary([]);
    setPlaceCards([]);
    setRouteData(null);
  };

  const value = {
    currentLocation,
    setCurrentLocation,
    currentLocationName,
    currentLocationLatitude,
    currentLocationLongitude,
    userLocation,
    setUserLocation: updateLocationDetails,
    setManualLocation,
    locationMode,
    setLocationMode,
    locationStatus,
    setLocationStatus,
    locationError,
    detectLocation,
    destinations,
    setDestinations,
    addDestination,
    removeDestination,
    clearDestinations,
    selectedDestinations,
    setSelectedDestinations: setDestinations,
    destinationOrder,
    updateDestinationSequence,
    startDate,
    endDate,
    setDateRange,
    numberOfDays,
    setNumberOfDays,
    travelType,
    numberOfTravelers,
    setCompany,
    categoryMatrix,
    selectedCategories,
    toggleSubcategory,
    toggleMainCategory,
    minimumBaseline,
    userSelectedBudget,
    setUserSelectedBudget,
    generatedItinerary,
    placeCards,
    routeData,
    activeStep,
    setActiveStep,
    isGenerating,
    generateTripOutputs,
    generateTripPlan: generateTripOutputs,
    resetTripState
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};
