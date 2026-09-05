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
  saveUserTrip
} from '../services/tripService';

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

  // P2: Trip Details & Preferences - Default origin location is Hyderabad
  const [currentLocation, setCurrentLocation] = useState('Hyderabad');
  const [selectedDestinations, setSelectedDestinations] = useState(['hyderabad', 'goa']);
  const [destinationOrder, setDestinationOrder] = useState(['hyderabad', 'goa']);

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

  // Re-calculate category availability when selected destinations change
  useEffect(() => {
    let isMounted = true;
    const fetchMatrix = async () => {
      const matrix = await analyzeCategoriesForDestinations(selectedDestinations);
      if (isMounted) {
        setCategoryMatrix(matrix);
        // Ensure destinationOrder includes all selected destinations
        setDestinationOrder(prev => {
          const filtered = prev.filter(d => selectedDestinations.includes(d));
          const added = selectedDestinations.filter(d => !filtered.includes(d));
          return [...filtered, ...added];
        });
      }
    };
    fetchMatrix();
    return () => { isMounted = false; };
  }, [selectedDestinations]);

  // Re-calculate AI minimum baseline when parameters change
  useEffect(() => {
    const baseline = calculateBudgetBaseline(
      selectedDestinations,
      numberOfDays,
      numberOfTravelers,
      selectedCategories
    );
    setMinimumBaseline(baseline);
    if (userSelectedBudget < baseline) {
      setUserSelectedBudget(Math.round(baseline * 1.2));
    }
  }, [selectedDestinations, numberOfDays, numberOfTravelers, selectedCategories]);

  // Toggle Destination Checkbox (Supports multiple selection)
  const toggleDestination = (destId) => {
    const norm = destId.toLowerCase().trim();
    setSelectedDestinations(prev => {
      if (prev.includes(norm)) {
        if (prev.length === 1) return prev; // At least one destination required
        return prev.filter(d => d !== norm);
      } else {
        return [...prev, norm];
      }
    });
  };

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

  // Reorder destination sequence (User editing)
  const updateDestinationSequence = (newOrder) => {
    setDestinationOrder(newOrder);
  };

  // Generate All AI outputs (P4 Itinerary, P5 Place Cards, P6 Routes)
  const generateTripOutputs = async (customDestinations = null) => {
    setIsGenerating(true);

    try {
      const activeDestinations = Array.isArray(customDestinations) && customDestinations.length > 0
        ? customDestinations
        : (destinationOrder.length > 0 ? destinationOrder : selectedDestinations);

      const tripParams = {
        tripId,
        originLocation: currentLocation,
        destinations: activeDestinations,
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
    setSelectedDestinations(['hyderabad', 'goa']);
    setDestinationOrder(['hyderabad', 'goa']);
    setActiveStep(1);
    setGeneratedItinerary([]);
    setPlaceCards([]);
    setRouteData(null);
  };

  const value = {
    currentLocation,
    setCurrentLocation,
    selectedDestinations,
    setSelectedDestinations,
    toggleDestination,
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
