import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  analyzeCategoriesForDestinations
} from '../services/destinationService';
import {
  calculateBudgetBaseline,
  generateFullTripPlan,
  generatePlaceCards,
  generateRouteData,
  saveUserTrip,
  saveTripDestinations
} from '../services/tripService';
import {
  detectCurrentLocation,
  LocationErrorCode
} from '../services/locationService';
import { buildCanonicalTripData } from '../services/vihara/tripSnapshot';
import { compactTripForAI } from '../services/vihara/schemas';
import { validateActions, applyActionsToItinerary } from '../services/vihara/patchEngine';
import { saveTravelPreferences } from '../services/vihara/personalizationEngine';
import { buildBudgetModel, recalculateBudgetWithItinerary } from '../services/vihara/budgetEngine';

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
  const [budgetBreakdown, setBudgetBreakdown] = useState(null);
  const [linkedEvents, setLinkedEvents] = useState([]);
  const [accommodation, setAccommodation] = useState(null);
  const [transport, setTransport] = useState(null);
  const [paceByDay, setPaceByDay] = useState({});

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

  const persistTripSnapshot = async (snapshot) => {
    if (!user?.uid || !snapshot?.tripId) return;
    try {
      await saveUserTrip(user.uid, snapshot);
    } catch (err) {
      console.error('Error persisting trip snapshot:', err);
    }
  };

  const generateTripOutputs = async (customDestinations = null, extra = {}) => {
    setIsGenerating(true);

    try {
      const activeDestinations = Array.isArray(customDestinations) && customDestinations.length > 0
        ? customDestinations
        : (destinationOrder.length > 0 ? destinationOrder : destinations);

      const cats = extra.selectedCategories || selectedCategories;
      const pace = extra.paceByDay || paceByDay;
      const savedPlaceIds = (savedItems || [])
        .filter((s) => s.itemType === 'place' || !s.itemType)
        .map((s) => s.id || s.placeId)
        .filter(Boolean);

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
        categories: cats,
        selectedCategories: cats,
        budget: extra.userSelectedBudget || userSelectedBudget,
        userSelectedBudget: extra.userSelectedBudget || userSelectedBudget,
        minimumBaseline,
        savedPlaceIds,
        paceByDay: pace,
        accommodation: extra.accommodation ?? accommodation,
        linkedEvents: extra.linkedEvents ?? linkedEvents
      };

      const plan = await generateFullTripPlan(tripParams);
      setGeneratedItinerary(plan.itinerary);
      setPlaceCards(plan.placeCards);
      setRouteData(plan.routeData);
      setBudgetBreakdown(plan.budgetBreakdown);
      setTransport(plan.transport);

      const persistPayload = {
        ...tripParams,
        itinerary: plan.itinerary,
        generatedItinerary: plan.itinerary,
        placeCards: plan.placeCards,
        routeData: plan.routeData,
        budgetBreakdown: plan.budgetBreakdown,
        transport: plan.transport
      };
      await persistTripSnapshot(persistPayload);

      if (user?.uid) {
        saveTravelPreferences(user.uid, {
          preferredCategories: cats,
          typicalTravelType: travelType,
          typicalTravelerCount: numberOfTravelers,
          lastBudget: extra.userSelectedBudget || userSelectedBudget
        });
      }

      return { itinerary: plan.itinerary, cards: plan.placeCards, routes: plan.routeData, budgetBreakdown: plan.budgetBreakdown };
    } catch (error) {
      console.error('Error generating trip plan:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Wishlist / Saved Items (Places, Stays, Events)
  const [savedItems, setSavedItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vihara_saved_items') || '[]');
    } catch {
      return [];
    }
  });

  const toggleSaveItem = (item, itemType = 'place') => {
    if (!item) return;
    const itemId = item.id || item.placeId || item.name || item.title;
    setSavedItems(prev => {
      const exists = prev.some(saved => (saved.id === itemId || saved.placeId === itemId || saved.name === itemId) && saved.itemType === itemType);
      let updated;
      if (exists) {
        updated = prev.filter(saved => !((saved.id === itemId || saved.placeId === itemId || saved.name === itemId) && saved.itemType === itemType));
      } else {
        updated = [
          {
            ...item,
            id: itemId,
            itemType,
            savedAt: new Date().toISOString()
          },
          ...prev
        ];
      }
      try {
        localStorage.setItem('vihara_saved_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const isItemSaved = (itemId, itemType = 'place') => {
    return savedItems.some(saved => (saved.id === itemId || saved.placeId === itemId || saved.name === itemId) && (itemType ? saved.itemType === itemType : true));
  };

  const addActivityToTrip = async (arg1, arg2, slotType = 'Afternoon') => {
    let dayNum, activity;
    if (typeof arg1 === 'object' && arg1 !== null) {
      activity = arg1;
      dayNum = parseInt(arg2, 10) || 1;
    } else {
      dayNum = parseInt(arg1, 10) || 1;
      activity = arg2;
    }
    if (!activity) return { success: false };
    const dayIndex = Math.max(0, dayNum - 1);

    const newAct = {
      title: activity.name || activity.title,
      placeName: activity.name || activity.title,
      description: activity.description || activity.desc || 'Curated heritage exploration',
      category: activity.category || 'Heritage Discovery',
      time: slotType === 'Morning' ? '09:30 AM - 11:00 AM' : (slotType === 'Evening' ? '05:30 PM - 07:00 PM' : '02:30 PM - 04:00 PM'),
      slotType: `${slotType} Discovery`,
      image: activity.image || 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
      visitingHours: activity.visitingHours ? (typeof activity.visitingHours === 'object' ? `${activity.visitingHours.open} - ${activity.visitingHours.close}` : activity.visitingHours) : '09:00 AM - 06:00 PM',
      entryInfo: activity.entryInfo || activity.price || (activity.priceVal ? `₹${activity.priceVal}` : 'Free entry'),
      cost: activity.cost ?? activity.priceVal ?? 0,
      priceVal: activity.priceVal ?? activity.cost ?? 0,
      travelTip: activity.travelTips || activity.tips || 'Added via Near Me Geo-Discovery',
      coordinates: activity.coordinates || { lat: activity.latitude || 17.385, lng: activity.longitude || 78.4867 },
      placeId: activity.id || activity.placeId || `custom_${Date.now()}`,
      source: activity.source || 'near-me'
    };

    const baseItinerary = generatedItinerary && generatedItinerary.length > 0
      ? generatedItinerary
      : [{
          dayNumber: 1,
          date: startDate,
          city: activity.city || currentLocationName || 'India',
          state: activity.state || '',
          activities: []
        }];

    const updatedItinerary = baseItinerary.map((day, idx) => {
      if (idx === dayIndex) {
        return { ...day, activities: [...(day.activities || []), newAct] };
      }
      return day;
    });
    if (!updatedItinerary[dayIndex]) {
      updatedItinerary.push({
        dayNumber: dayNum,
        date: startDate,
        city: activity.city || currentLocationName || 'India',
        state: activity.state || '',
        activities: [newAct]
      });
    }

    const newCard = {
      id: newAct.placeId,
      dayNumber: dayNum,
      city: activity.city || currentLocationName || 'India',
      state: activity.state || '',
      placeName: newAct.title,
      category: newAct.category,
      description: newAct.description,
      image: newAct.image,
      visitingHours: newAct.visitingHours,
      entryInfo: newAct.entryInfo,
      travelTips: newAct.travelTip,
      personalizedRationale: `Integrated into Day ${dayNum} from discovery. Timing should be confirmed on-site.`
    };
    const updatedCards = [...placeCards, newCard];

    let updatedRoutes = routeData;
    try {
      updatedRoutes = await generateRouteData(updatedItinerary, {
        destinations: destinationOrder.length ? destinationOrder : destinations,
        numberOfDays,
        numberOfTravelers,
        originLocation: currentLocationName
      });
    } catch {
      updatedRoutes = routeData
        ? {
            ...routeData,
            waypoints: [
              ...(routeData.waypoints || []),
              {
                stepIndex: (routeData.waypoints?.length || 0) + 1,
                name: newAct.title,
                city: newCard.city,
                dayNumber: dayNum,
                type: newAct.category,
                coordinates: newAct.coordinates
              }
            ]
          }
        : routeData;
    }

    const updatedBudget = recalculateBudgetWithItinerary({
      currentBudget: budgetBreakdown,
      itinerary: updatedItinerary,
      destinations: destinationOrder.length ? destinationOrder : destinations,
      numberOfDays,
      numberOfTravelers,
      selectedCategories,
      allocatedBudget: userSelectedBudget,
      accommodationCost: accommodation?.totalPrice || 0,
      eventCosts: (linkedEvents || []).reduce((s, e) => s + (Number(e.grandTotal) || Number(e.priceStarting) || 0), 0)
    });

    setGeneratedItinerary(updatedItinerary);
    setPlaceCards(updatedCards);
    if (updatedRoutes) setRouteData(updatedRoutes);
    setBudgetBreakdown(updatedBudget);

    await persistTripSnapshot({
      tripId,
      destinations,
      destinationOrder,
      startDate,
      endDate,
      numberOfDays,
      travelType,
      numberOfTravelers,
      categories: selectedCategories,
      selectedCategories,
      budget: userSelectedBudget,
      itinerary: updatedItinerary,
      placeCards: updatedCards,
      routeData: updatedRoutes,
      budgetBreakdown: updatedBudget,
      linkedEvents
    });

    return { success: true, activity: newAct, budget: updatedBudget };
  };

  const removeActivity = async (placeIdOrTitle, dayNumber = null) => {
    if (!placeIdOrTitle) return { success: false };

    const targetDayNum = dayNumber != null ? parseInt(dayNumber, 10) : null;
    let removed = null;

    const updatedItinerary = (generatedItinerary || []).map((day) => {
      if (targetDayNum != null && day.dayNumber !== targetDayNum) {
        return day;
      }
      const remaining = [];
      for (const act of day.activities || []) {
        const matches = (
          (act.placeId && String(act.placeId).toLowerCase() === String(placeIdOrTitle).toLowerCase()) ||
          (act.title && String(act.title).toLowerCase() === String(placeIdOrTitle).toLowerCase()) ||
          (act.name && String(act.name).toLowerCase() === String(placeIdOrTitle).toLowerCase())
        );
        if (matches && !removed) {
          removed = act;
        } else {
          remaining.push(act);
        }
      }
      return { ...day, activities: remaining };
    });

    if (!removed) return { success: false, notFound: true };

    const updatedCards = (placeCards || []).filter((c) =>
      c.id !== removed.placeId &&
      String(c.placeName).toLowerCase() !== String(removed.title).toLowerCase()
    );

    let updatedRoutes = routeData;
    try {
      updatedRoutes = await generateRouteData(updatedItinerary, {
        destinations: destinationOrder.length ? destinationOrder : destinations,
        numberOfDays,
        numberOfTravelers,
        originLocation: currentLocationName
      });
    } catch {
      // Keep routeData if dynamic regeneration unavailable
    }

    const updatedBudget = recalculateBudgetWithItinerary({
      currentBudget: budgetBreakdown,
      itinerary: updatedItinerary,
      destinations: destinationOrder.length ? destinationOrder : destinations,
      numberOfDays,
      numberOfTravelers,
      selectedCategories,
      allocatedBudget: userSelectedBudget,
      accommodationCost: accommodation?.totalPrice || 0,
      eventCosts: (linkedEvents || []).reduce((s, e) => s + (Number(e.grandTotal) || Number(e.priceStarting) || 0), 0)
    });

    setGeneratedItinerary(updatedItinerary);
    setPlaceCards(updatedCards);
    if (updatedRoutes) setRouteData(updatedRoutes);
    setBudgetBreakdown(updatedBudget);

    await persistTripSnapshot({
      tripId,
      destinations,
      destinationOrder,
      startDate,
      endDate,
      numberOfDays,
      travelType,
      numberOfTravelers,
      categories: selectedCategories,
      selectedCategories,
      budget: userSelectedBudget,
      itinerary: updatedItinerary,
      placeCards: updatedCards,
      routeData: updatedRoutes,
      budgetBreakdown: updatedBudget,
      linkedEvents
    });

    return { success: true, removedActivity: removed, budget: updatedBudget };
  };

  const removeActivityFromTrip = removeActivity;

  const addEventToTrip = async (event, dayNumber = 2) => {
    if (!event) return { success: false };
    const dayNum = parseInt(dayNumber, 10) || Math.min(2, Math.max(1, generatedItinerary.length));
    const dayIndex = Math.max(0, dayNum - 1);

    const eventActivity = {
      title: event.title,
      placeName: event.venue || event.title,
      description: `${event.subtitle || event.description || ''}. Demo catalog cultural experience — not a live ticket.`,
      category: 'Cultural Event',
      time: event.timeSlot ? event.timeSlot.split('-')[0].trim() : '07:00 PM',
      slotType: 'Evening Cultural Anchor',
      image: event.heroImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      visitingHours: event.timeSlot || '07:00 PM - 10:30 PM',
      entryInfo: `Pass: ${event.tiers?.[0]?.name || 'Standard'} (₹${event.priceStarting || 1200})`,
      travelTip: `Venue: ${event.venue}. Catalog demo — not a live booking.`,
      coordinates: event.coordinates || { lat: 17.3616, lng: 78.4747 },
      placeId: event.id,
      source: 'catalog-event'
    };

    const updatedItinerary = (generatedItinerary || []).map((day, idx) => {
      if (idx === dayIndex) {
        return { ...day, activities: [...(day.activities || []), eventActivity] };
      }
      return day;
    });

    const eventCost = (Number(event.grandTotal) || Number(event.priceStarting) || 0) * (event.quantity || 1);
    const nextEvents = [
      {
        id: event.id,
        title: event.title,
        city: event.city,
        grandTotal: eventCost,
        date: event.date || event.dateIso,
        source: 'catalog',
        liveAvailability: false
      },
      ...linkedEvents.filter((e) => e.id !== event.id)
    ];

    const nextBudget = buildBudgetModel({
      destinations,
      numberOfDays,
      numberOfTravelers,
      selectedCategories,
      allocatedBudget: userSelectedBudget,
      accommodationCost: accommodation?.totalPrice || 0,
      eventCosts: nextEvents.reduce((s, e) => s + (Number(e.grandTotal) || 0), 0)
    });

    setGeneratedItinerary(updatedItinerary);
    setLinkedEvents(nextEvents);
    setBudgetBreakdown(nextBudget);

    await persistTripSnapshot({
      tripId,
      destinations,
      destinationOrder,
      startDate,
      endDate,
      numberOfDays,
      travelType,
      numberOfTravelers,
      categories: selectedCategories,
      selectedCategories,
      budget: userSelectedBudget,
      itinerary: updatedItinerary,
      placeCards,
      routeData,
      budgetBreakdown: nextBudget,
      linkedEvents: nextEvents
    });

    return { success: true, eventActivity };
  };

  const applyConciergeActions = async (actions = []) => {
    const compact = compactTripForAI({
      tripId,
      destinations: destinationOrder.length ? destinationOrder : destinations,
      startDate,
      endDate,
      numberOfDays,
      travelType,
      numberOfTravelers,
      selectedCategories,
      userSelectedBudget,
      generatedItinerary,
      placeCards,
      accommodation,
      linkedEvents
    });
    const { actions: valid, errors } = validateActions(actions, compact);
    if (!valid.length) {
      return { applied: [], errors, regenerated: false };
    }

    let nextCategories = selectedCategories;
    let nextBudgetAlloc = userSelectedBudget;
    let nextPace = { ...paceByDay };
    let shouldRegenerate = false;

    for (const action of valid) {
      if (action.type === 'SET_CATEGORIES') {
        nextCategories = action.categories;
        setSelectedCategories(nextCategories);
        shouldRegenerate = true;
      }
      if (action.type === 'SET_BUDGET') {
        nextBudgetAlloc = action.amount;
        setUserSelectedBudget(nextBudgetAlloc);
      }
      if (action.type === 'SET_PACE') {
        if (action.day) nextPace[action.day] = action.maxActivities;
        else {
          for (let d = 1; d <= numberOfDays; d += 1) nextPace[d] = action.maxActivities;
        }
        setPaceByDay(nextPace);
        shouldRegenerate = true;
      }
      if (action.type === 'REGENERATE_ITINERARY') shouldRegenerate = true;
    }

    const { itinerary: patched, needsRegenerate, applied } = applyActionsToItinerary(generatedItinerary, valid);
    if (needsRegenerate) shouldRegenerate = true;

    if (shouldRegenerate) {
      await generateTripOutputs(null, {
        selectedCategories: nextCategories,
        userSelectedBudget: nextBudgetAlloc,
        paceByDay: nextPace
      });
      return { applied: valid, errors, regenerated: true };
    }

    if (applied.length) {
      const cards = await generatePlaceCards(patched, {
        travelType,
        selectedCategories: nextCategories,
        categories: nextCategories
      });

      let updatedRoutes = routeData;
      try {
        updatedRoutes = await generateRouteData(patched, {
          destinations: destinationOrder.length ? destinationOrder : destinations,
          numberOfDays,
          numberOfTravelers,
          originLocation: currentLocationName
        });
      } catch {
        // Keep routeData
      }

      const updatedBudget = recalculateBudgetWithItinerary({
        currentBudget: budgetBreakdown,
        itinerary: patched,
        destinations: destinationOrder.length ? destinationOrder : destinations,
        numberOfDays,
        numberOfTravelers,
        selectedCategories: nextCategories,
        allocatedBudget: nextBudgetAlloc,
        accommodationCost: accommodation?.totalPrice || 0,
        eventCosts: (linkedEvents || []).reduce((s, e) => s + (Number(e.grandTotal) || Number(e.priceStarting) || 0), 0)
      });

      setGeneratedItinerary(patched);
      setPlaceCards(cards);
      if (updatedRoutes) setRouteData(updatedRoutes);
      setBudgetBreakdown(updatedBudget);

      await persistTripSnapshot({
        tripId,
        destinations,
        destinationOrder,
        startDate,
        endDate,
        numberOfDays,
        travelType,
        numberOfTravelers,
        categories: nextCategories,
        selectedCategories: nextCategories,
        budget: nextBudgetAlloc,
        itinerary: patched,
        placeCards: cards,
        routeData: updatedRoutes,
        budgetBreakdown: updatedBudget,
        linkedEvents
      });
    }

    return { applied: valid, errors, regenerated: false };
  };

  const linkAccommodation = (staySummary) => {
    setAccommodation(staySummary || null);
    const nextBudget = buildBudgetModel({
      destinations,
      numberOfDays,
      numberOfTravelers,
      selectedCategories,
      allocatedBudget: userSelectedBudget,
      accommodationCost: staySummary?.totalPrice || 0,
      eventCosts: linkedEvents.reduce((s, e) => s + (Number(e.grandTotal) || 0), 0)
    });
    setBudgetBreakdown(nextBudget);
  };

  // Load a saved trip into active session
  const loadTripIntoSession = (savedTrip) => {
    if (!savedTrip) return;
    if (savedTrip.tripId) setTripId(savedTrip.tripId);
    if (savedTrip.destinations) setDestinations(savedTrip.destinations);
    if (savedTrip.destinationOrder) setDestinationOrder(savedTrip.destinationOrder);
    if (savedTrip.startDate && savedTrip.endDate) {
      setDateRange(savedTrip.startDate, savedTrip.endDate);
    }
    if (savedTrip.numberOfDays) setNumberOfDays(savedTrip.numberOfDays);
    if (savedTrip.numberOfTravelers) setNumberOfTravelers(savedTrip.numberOfTravelers);
    if (savedTrip.travelType) setTravelType(savedTrip.travelType);
    if (savedTrip.budget || savedTrip.userSelectedBudget) {
      setUserSelectedBudget(savedTrip.budget?.allocatedBudget || savedTrip.userSelectedBudget || savedTrip.budget || 35000);
    }
    if (savedTrip.itinerary || savedTrip.generatedItinerary) {
      setGeneratedItinerary(savedTrip.itinerary || savedTrip.generatedItinerary);
    }
    if (savedTrip.placeCards || savedTrip.places) {
      setPlaceCards(savedTrip.placeCards || savedTrip.places);
    }
    if (savedTrip.routeData || savedTrip.routes) {
      setRouteData(savedTrip.routeData || savedTrip.routes);
    }
    if (savedTrip.budgetBreakdown) setBudgetBreakdown(savedTrip.budgetBreakdown);
    if (savedTrip.linkedEvents || savedTrip.events) setLinkedEvents(savedTrip.linkedEvents || savedTrip.events);
    if (savedTrip.accommodation) setAccommodation(savedTrip.accommodation);
    if (savedTrip.transport) setTransport(savedTrip.transport);
    if (savedTrip.selectedCategories) setSelectedCategories(savedTrip.selectedCategories);
    setActiveStep(4);
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
    setBudgetBreakdown(null);
    setLinkedEvents([]);
    setAccommodation(null);
    setTransport(null);
    setPaceByDay({});
  };

  const tripData = useMemo(() => buildCanonicalTripData({
    tripId,
    user,
    currentLocation,
    currentLocationName,
    currentLocationLatitude,
    currentLocationLongitude,
    userLocation,
    destinations,
    destinationOrder,
    startDate,
    endDate,
    numberOfDays,
    travelType,
    numberOfTravelers,
    selectedCategories,
    userSelectedBudget,
    minimumBaseline,
    generatedItinerary,
    placeCards,
    routeData,
    budgetBreakdown,
    accommodation,
    linkedEvents,
    transport,
    paceByDay
  }), [
    tripId, user, currentLocation, currentLocationName, currentLocationLatitude, currentLocationLongitude,
    userLocation, destinations, destinationOrder, startDate, endDate, numberOfDays, travelType,
    numberOfTravelers, selectedCategories, userSelectedBudget, minimumBaseline, generatedItinerary,
    placeCards, routeData, budgetBreakdown, accommodation, linkedEvents, transport, paceByDay
  ]);

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
    budgetBreakdown,
    linkedEvents,
    accommodation,
    transport,
    tripData,
    applyConciergeActions,
    linkAccommodation,
    activeStep,
    setActiveStep,
    isGenerating,
    generateTripOutputs,
    generateTripPlan: generateTripOutputs,
    resetTripState,
    savedItems,
    toggleSaveItem,
    isItemSaved,
    addActivityToTrip,
    removeActivity,
    removeActivityFromTrip,
    addEventToTrip,
    loadTripIntoSession
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};
