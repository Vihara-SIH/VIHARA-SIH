import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Search,
  ChevronDown,
  X,
  Navigation,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle,
  Edit3,
  Building2,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { getAllAvailableDestinations } from '../services/destinationService';
import {
  fetchPlaceAutocomplete,
  fetchPlaceDetails
} from '../services/locationService';

export function TripPlanningPage1({ onNext }) {
  const {
    currentLocation,
    setCurrentLocation,
    currentLocationName,
    currentLocationLatitude,
    currentLocationLongitude,
    userLocation,
    setUserLocation,
    setManualLocation,
    locationMode,
    setLocationMode,
    locationStatus,
    locationError,
    detectLocation,
    destinations = [],
    setDestinations,
    addDestination,
    removeDestination,
    clearDestinations,
    selectedDestinations,
    startDate,
    endDate,
    setDateRange,
    numberOfDays,
    travelType,
    numberOfTravelers,
    setCompany
  } = useTrip();

  // Manual Autocomplete Search State for Current Location
  const [manualQuery, setManualQuery] = useState('');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placesDropdownOpen, setPlacesDropdownOpen] = useState(false);
  const [autocompleteError, setAutocompleteError] = useState(null);
  const [manualSelectionRequired, setManualSelectionRequired] = useState(false);
  const manualSearchRef = useRef(null);
  const manualInputRef = useRef(null);

  // Google Places Autocomplete Search State for Destinations
  const [destQuery, setDestQuery] = useState('');
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [destError, setDestError] = useState(null);
  const [destDuplicateAlert, setDestDuplicateAlert] = useState(null);
  const destSearchContainerRef = useRef(null);
  const destSearchInputRef = useRef(null);

  // Calendar State
  const [rangeStart, setRangeStart] = useState(startDate || '');
  const [rangeEnd, setRangeEnd] = useState(endDate || '');
  const [hoverDate, setHoverDate] = useState(null);

  // View Month / Year
  const initialDate = startDate ? new Date(startDate) : new Date();
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());

  // 1. Automatically initiate current-location detection as FIRST step on mount if in auto mode and not yet detected
  useEffect(() => {
    if (!userLocation && locationStatus === 'idle' && locationMode === 'auto') {
      detectLocation().catch((err) => {
        console.log('[TripPlanningPage1] Initial location detection notice:', err?.message);
      });
    }
  }, [userLocation, locationStatus, locationMode, detectLocation]);

  // Debounced Google Places Autocomplete Query for Current Location
  useEffect(() => {
    if (!manualQuery || manualQuery.trim().length < 2) {
      setAutocompleteSuggestions([]);
      setPlacesDropdownOpen(false);
      setIsSearchingPlaces(false);
      return;
    }

    let isMounted = true;
    setIsSearchingPlaces(true);
    setAutocompleteError(null);

    const debounceTimer = setTimeout(async () => {
      try {
        const predictions = await fetchPlaceAutocomplete(manualQuery);
        if (isMounted) {
          setAutocompleteSuggestions(predictions);
          setPlacesDropdownOpen(true);
          setIsSearchingPlaces(false);
        }
      } catch (err) {
        if (isMounted) {
          setAutocompleteError('Unable to fetch location suggestions. Please try again.');
          setIsSearchingPlaces(false);
        }
      }
    }, 280);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [manualQuery]);

  // Debounced Google Places Autocomplete Query for Destinations
  useEffect(() => {
    if (!destQuery || destQuery.trim().length < 2) {
      setDestSuggestions([]);
      setDestDropdownOpen(false);
      setIsSearchingDest(false);
      return;
    }

    let isMounted = true;
    setIsSearchingDest(true);
    setDestError(null);
    setDestDuplicateAlert(null);

    const debounceTimer = setTimeout(async () => {
      try {
        const predictions = await fetchPlaceAutocomplete(destQuery);
        if (isMounted) {
          setDestSuggestions(predictions);
          setDestDropdownOpen(true);
          setIsSearchingDest(false);
        }
      } catch (err) {
        if (isMounted) {
          setDestError('Unable to fetch destination suggestions. Please try again.');
          setIsSearchingDest(false);
        }
      }
    }, 280);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [destQuery]);

  // Close current location places dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (manualSearchRef.current && !manualSearchRef.current.contains(e.target)) {
        setPlacesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close destination dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (destSearchContainerRef.current && !destSearchContainerRef.current.contains(e.target)) {
        setDestDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync dates with context
  useEffect(() => {
    if (startDate) setRangeStart(startDate);
    if (endDate) setRangeEnd(endDate);
  }, [startDate, endDate]);

  // Handle Selection of Google Places Suggestion for Current Location
  const handleSelectPlaceSuggestion = async (suggestion) => {
    setIsSearchingPlaces(true);
    setPlacesDropdownOpen(false);
    setManualSelectionRequired(false);

    try {
      const placeDetails = await fetchPlaceDetails(suggestion);
      setManualLocation(placeDetails);
      setManualQuery(placeDetails.currentLocationName);
    } catch (err) {
      console.error('[TripPlanningPage1] Error retrieving place details:', err);
      // Fallback with prediction data
      setManualLocation({
        name: suggestion.mainText,
        formattedAddress: suggestion.description,
        currentLocationName: suggestion.description,
        currentLocationLatitude: suggestion.latitude || 17.3850,
        currentLocationLongitude: suggestion.longitude || 78.4867,
        placeId: suggestion.placeId
      });
      setManualQuery(suggestion.description);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  // Handle Selection of Google Places Suggestion for Destination
  const handleSelectDestinationSuggestion = async (suggestion) => {
    setIsSearchingDest(true);
    setDestDropdownOpen(false);
    setDestDuplicateAlert(null);

    try {
      const placeDetails = await fetchPlaceDetails(suggestion);
      const result = await addDestination({
        ...placeDetails,
        destinationName: placeDetails.name || suggestion.mainText || suggestion.description || 'Destination'
      });
      if (result && result.duplicate) {
        setDestDuplicateAlert('Destination already added.');
      }
      setDestQuery('');
      setDestSuggestions([]);
    } catch (err) {
      console.error('[TripPlanningPage1] Error retrieving destination details:', err);
      const fallbackDest = {
        destinationName: suggestion.mainText || suggestion.description || 'Destination',
        name: suggestion.mainText || suggestion.description || 'Destination',
        formattedAddress: suggestion.description,
        placeId: suggestion.placeId,
        latitude: suggestion.latitude || 20.5937,
        longitude: suggestion.longitude || 78.9629
      };
      const result = await addDestination(fallbackDest);
      if (result && result.duplicate) {
        setDestDuplicateAlert('Destination already added.');
      }
      setDestQuery('');
      setDestSuggestions([]);
    } finally {
      setIsSearchingDest(false);
    }
  };

  // "+ Add another destination" button handler
  const handleAddAnotherDestination = () => {
    setDestDuplicateAlert(null);
    setDestQuery('');
    setDestDropdownOpen(false);
    setTimeout(() => {
      destSearchInputRef.current?.focus();
    }, 100);
  };

  // Remove destination handler
  const handleRemoveDestination = (identifier) => {
    removeDestination(identifier);
    setDestDuplicateAlert(null);
  };

  // Switch to Option A: Current Location (GPS)
  const handleSwitchToAutoLocation = () => {
    setLocationMode('auto');
    setManualSelectionRequired(false);
    detectLocation(true).catch(() => {});
  };

  // Switch to Option B: Manual Location (Google Places)
  const handleSwitchToManualLocation = () => {
    setLocationMode('manual');
    setManualQuery('');
    setAutocompleteSuggestions([]);
    setPlacesDropdownOpen(false);
    setTimeout(() => {
      manualInputRef.current?.focus();
    }, 100);
  };

  // Next Step validation
  const handleProceedNext = () => {
    if (locationMode === 'manual' && (!userLocation || !userLocation.currentLocationName)) {
      setManualSelectionRequired(true);
      manualInputRef.current?.focus();
      return;
    }
    if (!destinations || destinations.length === 0) {
      setDestDuplicateAlert('Please select at least one destination to continue.');
      destSearchInputRef.current?.focus();
      return;
    }
    onNext();
  };

  // Calendar helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Interactive Date click handler
  const handleDayClick = (day) => {
    const clickedDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(clickedDateStr);
      setRangeEnd('');
      setDateRange(clickedDateStr, '');
    } else if (rangeStart && !rangeEnd) {
      if (clickedDateStr < rangeStart) {
        setRangeStart(clickedDateStr);
        setRangeEnd('');
        setDateRange(clickedDateStr, '');
      } else {
        setRangeEnd(clickedDateStr);
        setDateRange(rangeStart, clickedDateStr);
      }
    }
  };

  // Direct Date input change handlers
  const handleStartDateInputChange = (val) => {
    setRangeStart(val);
    if (val && rangeEnd && val <= rangeEnd) {
      setDateRange(val, rangeEnd);
    } else if (val) {
      setRangeEnd('');
      setDateRange(val, '');
    }
  };

  const handleEndDateInputChange = (val) => {
    setRangeEnd(val);
    if (rangeStart && val && rangeStart <= val) {
      setDateRange(rangeStart, val);
    }
  };

  // Quick Preset Helper
  const applyDurationPreset = (days) => {
    const startD = rangeStart ? new Date(rangeStart) : new Date();
    const endD = new Date(startD);
    endD.setDate(endD.getDate() + (days - 1));

    const startStr = startD.toISOString().split('T')[0];
    const endStr = endD.toISOString().split('T')[0];

    setRangeStart(startStr);
    setRangeEnd(endStr);
    setDateRange(startStr, endStr);
  };

  // Check if a day is in selected range
  const isDateSelected = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const isStart = dateStr === rangeStart;
    const isEnd = dateStr === rangeEnd;
    const inBetween = rangeStart && rangeEnd && dateStr > rangeStart && dateStr < rangeEnd;
    const inHoverRange = rangeStart && !rangeEnd && hoverDate && dateStr > rangeStart && dateStr <= hoverDate;

    return { isStart, isEnd, inBetween, inHoverRange };
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-[#e8e8e3] p-6 md:p-10 shadow-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-[#735c00] font-bold">
          Step 1 of 3 • Trip Foundation
        </span>
        <h1
          className="text-3xl md:text-4xl font-bold text-[#0d1c32] mt-1 tracking-tight"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Design Your Journey
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-2">
          Verify your starting location, choose your destinations, select your trip date range on the calendar, and specify your traveling company.
        </p>
      </div>

      {/* 1. Starting Location Selection (Option A: GPS vs Option B: Google Places Manual) */}
      <div className="mb-8 relative z-30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#0d1c32] flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0d1c32] text-[#D4AF37] flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Your Starting Location</span>
          </label>

          {/* Option A vs Option B Segmented Switch */}
          <div className="flex items-center bg-[#fafaf5] p-1 rounded-xl border border-gray-200 self-start sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={handleSwitchToAutoLocation}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                locationMode === 'auto'
                  ? 'bg-[#0d1c32] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#0d1c32]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Use Current Location</span>
            </button>
            <button
              type="button"
              onClick={handleSwitchToManualLocation}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                locationMode === 'manual'
                  ? 'bg-[#0d1c32] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#0d1c32]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Enter Manually</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* OPTION A: AUTOMATIC GPS LOCATION DETECTION FLOW               */}
        {/* ------------------------------------------------------------- */}
        {locationMode === 'auto' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Case A1: Detecting State */}
            {locationStatus === 'detecting' && (
              <div className="p-4 bg-[#fafaf5] border border-[#D4AF37]/50 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#fed65b]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#735c00]">
                    <Loader2 className="w-5 h-5 animate-spin text-[#735c00]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0d1c32] flex items-center gap-1.5">
                      <span>Detecting your location...</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Requesting browser GPS permission &amp; querying Google Geocoding API
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Case A2: Detected Location Success State */}
            {locationStatus === 'success' && (
              <div className="p-4 bg-gradient-to-r from-[#fafaf5] to-white border border-[#D4AF37]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-[#D4AF37] transition-all">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0d1c32] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#735c00]">
                        📍 Current Location
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        GPS Verified
                      </span>
                    </div>
                    <div className="text-sm md:text-base font-bold text-[#0d1c32] mt-0.5">
                      {currentLocationName || currentLocation || 'Hyderabad, Telangana, India'}
                    </div>
                    {currentLocationLatitude && currentLocationLongitude && (
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {Number(currentLocationLatitude).toFixed(4)}° N, {Number(currentLocationLongitude).toFixed(4)}° E
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleSwitchToManualLocation}
                    className="px-3 py-1.5 bg-white hover:bg-gray-50 text-[#0d1c32] border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => detectLocation(true)}
                    title="Re-detect GPS location"
                    className="p-1.5 bg-[#fed65b]/20 hover:bg-[#fed65b]/40 text-[#735c00] border border-[#D4AF37]/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Case A3: Denied Permission State */}
            {locationStatus === 'denied' && (
              <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-amber-900">
                      Location Permission Denied
                    </div>
                    <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                      Location permission is required to automatically detect your current location. You can retry with permission or search your starting city below.
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => detectLocation(true)}
                    className="px-3.5 py-1.5 bg-[#0d1c32] text-white hover:bg-black rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Try Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchToManualLocation}
                    className="px-3.5 py-1.5 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Enter Location Manually
                  </button>
                </div>
              </div>
            )}

            {/* Case A4: Error / Timeout / Unavailable */}
            {(locationStatus === 'unavailable' || locationStatus === 'timeout' || locationStatus === 'error') && (
              <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 text-red-700 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-red-900">
                      {locationStatus === 'timeout'
                        ? 'Location Request Timed Out'
                        : locationStatus === 'unavailable'
                        ? 'Position Unavailable'
                        : 'Location Detection Notice'}
                    </div>
                    <div className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                      {locationError || 'Unable to determine your current location name. Please try again.'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => detectLocation(true)}
                    className="px-3.5 py-1.5 bg-[#0d1c32] text-white hover:bg-black rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Try Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchToManualLocation}
                    className="px-3.5 py-1.5 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Enter Location Manually
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* OPTION B: MANUAL GOOGLE PLACES AUTOCOMPLETE FLOW              */}
        {/* ------------------------------------------------------------- */}
        {locationMode === 'manual' && (
          <div className="space-y-3 animate-fadeIn" ref={manualSearchRef}>
            {/* Selected Place Confirmation Card */}
            {userLocation?.currentLocationName && (
              <div className="p-4 bg-gradient-to-r from-emerald-50/70 to-white border border-emerald-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        📍 Selected Starting Location
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Google Places Verified
                      </span>
                    </div>
                    <div className="text-sm md:text-base font-bold text-emerald-950 mt-0.5">
                      {userLocation.currentLocationName}
                    </div>
                    {currentLocationLatitude && currentLocationLongitude && (
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {Number(currentLocationLatitude).toFixed(4)}° N, {Number(currentLocationLongitude).toFixed(4)}° E
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setManualQuery('');
                    setTimeout(() => manualInputRef.current?.focus(), 100);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-[#0d1c32] border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1 self-end sm:self-auto shadow-sm cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-gray-500" />
                  <span>Search Another</span>
                </button>
              </div>
            )}

            {/* Google Places Autocomplete Input with Dynamic Dropdown */}
            <div className="relative">
              <div className="relative flex items-center">
                <MapPin className="absolute left-4 w-4 h-4 text-[#735c00]" />
                <input
                  ref={manualInputRef}
                  type="text"
                  className={`w-full pl-11 pr-24 py-3 bg-[#fafaf5] border rounded-xl text-sm font-medium text-[#0d1c32] focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-400 ${
                    manualSelectionRequired && (!userLocation || !userLocation.currentLocationName)
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-gray-200'
                  }`}
                  placeholder="Search city, town, or landmark (e.g. Mumbai, Varanasi, Jaipur, Taj Mahal)..."
                  value={manualQuery}
                  onChange={(e) => {
                    setManualQuery(e.target.value);
                    if (manualSelectionRequired) setManualSelectionRequired(false);
                    if (!placesDropdownOpen && e.target.value.trim().length >= 2) {
                      setPlacesDropdownOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (autocompleteSuggestions.length > 0) {
                      setPlacesDropdownOpen(true);
                    }
                  }}
                />
                <div className="absolute right-3 flex items-center gap-1.5">
                  {isSearchingPlaces && (
                    <Loader2 className="w-4 h-4 text-[#735c00] animate-spin" />
                  )}
                  {manualQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setManualQuery('');
                        setAutocompleteSuggestions([]);
                        setPlacesDropdownOpen(false);
                        manualInputRef.current?.focus();
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Google Places Suggestions Dropdown */}
              {placesDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn max-h-64 overflow-y-auto">
                  <div className="p-2.5 border-b border-gray-100 bg-[#fafaf5] flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3">
                    <span className="flex items-center gap-1 text-[#735c00]">
                      <Sparkles className="w-3 h-3" />
                      Google Places Suggestions
                    </span>
                    <span className="text-gray-400">Click to Select</span>
                  </div>

                  {autocompleteSuggestions.length > 0 ? (
                    <div className="p-1 space-y-1 bg-white">
                      {autocompleteSuggestions.map((item) => (
                        <div
                          key={item.placeId || item.description}
                          onClick={() => handleSelectPlaceSuggestion(item)}
                          className="places-suggestion-item flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#fed65b]/20 cursor-pointer transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#0d1c32] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#735c00] transition-colors">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#0d1c32] truncate">
                              {item.mainText}
                            </div>
                            {item.secondaryText && (
                              <div className="text-[11px] text-gray-500 truncate">
                                {item.secondaryText}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500 bg-white">
                      {isSearchingPlaces
                        ? 'Searching Google Places...'
                        : `No matching places found for "${manualQuery}". Try typing a city, town, or landmark name.`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {manualSelectionRequired && (!userLocation || !userLocation.currentLocationName) && (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1 pl-1 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Please select a location suggestion from the dropdown to continue.</span>
              </p>
            )}

            <p className="text-[11px] text-gray-500 flex items-center gap-1.5 pl-1">
              <Sparkles className="w-3 h-3 text-[#735c00]" />
              <span>Select a suggestion from Google Places to calculate accurate distances, transit routes, and itineraries.</span>
            </p>
          </div>
        )}
      </div>

      {/* 2. Google Places Destination Selection ("Where do you want to go?") */}
      <div className="mb-8 relative z-20" ref={destSearchContainerRef}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#0d1c32] flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0d1c32] text-[#D4AF37] flex items-center justify-center text-[10px] font-bold">2</span>
            <span>Where do you want to go?</span>
          </label>
          <span className="text-xs font-bold text-[#735c00] bg-[#fed65b]/20 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
            {destinations.length} {destinations.length === 1 ? 'destination' : 'destinations'} selected
          </span>
        </div>

        {/* Selected Destinations Cards List */}
        {destinations.length > 0 && (
          <div className="space-y-2 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
              Selected Destinations
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {destinations.map((dest, idx) => {
                const destName = typeof dest === 'object' ? (dest.name || dest.destinationName) : dest;
                const destAddress = typeof dest === 'object' ? (dest.formattedAddress || dest.state || 'India') : 'India';
                const destLat = typeof dest === 'object' && dest.latitude !== undefined ? Number(dest.latitude) : null;
                const destLng = typeof dest === 'object' && dest.longitude !== undefined ? Number(dest.longitude) : null;
                const destKey = typeof dest === 'object' ? (dest.placeId || `${destName}_${idx}`) : `${dest}_${idx}`;

                return (
                  <div
                    key={destKey}
                    className="p-3.5 bg-gradient-to-r from-[#fafaf5] to-white border border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-2xl flex items-center justify-between gap-3 shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#0d1c32] text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0d1c32] truncate flex items-center gap-1.5">
                          <span className="truncate">{destName}</span>
                          <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                            Verified
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          {destAddress}
                        </div>
                        {destLat !== null && destLng !== null && (
                          <div className="text-[9px] text-gray-400 font-mono">
                            {destLat.toFixed(3)}° N, {destLng.toFixed(3)}° E
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDestination(dest.placeId || idx)}
                      title={`Remove ${destName}`}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Duplicate or Validation Warning Alert */}
        {destDuplicateAlert && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900 flex items-center justify-between gap-2 mb-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{destDuplicateAlert}</span>
            </div>
            <button
              type="button"
              onClick={() => setDestDuplicateAlert(null)}
              className="text-amber-700 hover:text-amber-900 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Google Places Autocomplete Destination Search Input */}
        <div className="relative mb-3">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-[#735c00]" />
            <input
              ref={destSearchInputRef}
              type="text"
              className="w-full pl-11 pr-24 py-3 bg-[#fafaf5] border border-gray-200 focus:border-[#D4AF37] rounded-xl text-sm font-medium text-[#0d1c32] focus:outline-none transition-all placeholder:text-gray-400 shadow-sm"
              placeholder="Search for a city or destination (e.g. Warangal, Vijayawada, Jaipur, Goa)..."
              value={destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                if (destDuplicateAlert) setDestDuplicateAlert(null);
                if (!destDropdownOpen && e.target.value.trim().length >= 2) {
                  setDestDropdownOpen(true);
                }
              }}
              onFocus={() => {
                if (destSuggestions.length > 0) {
                  setDestDropdownOpen(true);
                }
              }}
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              {isSearchingDest && (
                <Loader2 className="w-4 h-4 text-[#735c00] animate-spin" />
              )}
              {destQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setDestQuery('');
                    setDestSuggestions([]);
                    setDestDropdownOpen(false);
                    destSearchInputRef.current?.focus();
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Google Places Suggestions Dropdown */}
          {destDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn max-h-64 overflow-y-auto">
              <div className="p-2.5 border-b border-gray-100 bg-[#fafaf5] flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3">
                <span className="flex items-center gap-1 text-[#735c00]">
                  <Sparkles className="w-3 h-3" />
                  Google Places Suggestions
                </span>
                <span className="text-gray-400">Click to Select</span>
              </div>

              {destSuggestions.length > 0 ? (
                <div className="p-1 space-y-1 bg-white">
                  {destSuggestions.map((item) => (
                    <div
                      key={item.placeId || item.description}
                      onClick={() => handleSelectDestinationSuggestion(item)}
                      className="dest-suggestion-item flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#fed65b]/20 cursor-pointer transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#0d1c32] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#735c00] transition-colors">
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#0d1c32] truncate">
                          {item.mainText}
                        </div>
                        {item.secondaryText && (
                          <div className="text-[11px] text-gray-500 truncate">
                            {item.secondaryText}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-gray-500 bg-white">
                  {isSearchingDest
                    ? 'Searching Google Places...'
                    : `No matching destinations found for "${destQuery}". Try typing another city or tourist place.`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* "+ Add another destination" button and helper note */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleAddAnotherDestination}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#fafaf5] hover:bg-[#fed65b]/25 text-[#735c00] border border-[#D4AF37]/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span>Add another destination</span>
          </button>

          <span className="text-[11px] text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#735c00]" />
            <span>Select places to map custom multi-city heritage routes.</span>
          </span>
        </div>
      </div>

      {/* 3. Interactive Calendar Date Range Picker with Synchronized Direct Pickers */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#0d1c32]">
            3. Trip Dates (Select Start Date &amp; End Date)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#735c00] bg-[#fed65b]/30 px-3 py-1 rounded-full flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {numberOfDays} Days Trip
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 mr-1">
            <Clock className="w-3 h-3" /> Quick Durations:
          </span>
          {[
            { days: 3, label: '3 Days' },
            { days: 5, label: '5 Days' },
            { days: 7, label: '7 Days' },
            { days: 10, label: '10 Days' }
          ].map((preset) => (
            <button
              key={preset.days}
              type="button"
              onClick={() => applyDurationPreset(preset.days)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                numberOfDays === preset.days
                  ? 'bg-[#0d1c32] text-white border-[#0d1c32]'
                  : 'bg-[#fafaf5] text-gray-700 border-gray-200 hover:bg-white hover:border-[#D4AF37]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#fafaf5] p-5 rounded-2xl border border-gray-200">
          {/* Calendar Month View */}
          <div className="md:col-span-7">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-[#0d1c32]">
                {monthNames[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-2 uppercase">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar Grid with Range Highlighting */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const { isStart, isEnd, inBetween, inHoverRange } = isDateSelected(day);
                const isHighlighted = inBetween || inHoverRange;

                let cellClass = 'h-8 flex items-center justify-center cursor-pointer text-xs transition-all relative font-medium ';

                if (isStart && isEnd) {
                  cellClass += 'bg-[#D4AF37] text-[#0d1c32] font-bold rounded-xl shadow-md z-10';
                } else if (isStart) {
                  cellClass += 'bg-[#D4AF37] text-[#0d1c32] font-bold rounded-l-xl shadow-sm z-10';
                } else if (isEnd) {
                  cellClass += 'bg-[#D4AF37] text-[#0d1c32] font-bold rounded-r-xl shadow-sm z-10';
                } else if (isHighlighted) {
                  cellClass += 'bg-[#fed65b]/35 text-[#0d1c32] font-semibold';
                } else {
                  cellClass += 'text-gray-700 hover:bg-gray-200 rounded-lg';
                }

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => {
                      if (rangeStart && !rangeEnd) {
                        const hoverStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        setHoverDate(hoverStr);
                      }
                    }}
                    className={cellClass}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Date Pickers & Summary Cards */}
          <div className="md:col-span-5 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-200 md:pl-6 pt-4 md:pt-0">
            <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full bg-[#fafaf5] border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0d1c32] outline-none focus:border-[#D4AF37]"
                value={rangeStart}
                onChange={(e) => handleStartDateInputChange(e.target.value)}
              />
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full bg-[#fafaf5] border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0d1c32] outline-none focus:border-[#D4AF37]"
                value={rangeEnd || rangeStart}
                onChange={(e) => handleEndDateInputChange(e.target.value)}
              />
            </div>

            <div className="text-[11px] text-gray-500 leading-relaxed bg-[#fed65b]/10 p-2.5 rounded-lg border border-[#fed65b]/20">
              💡 Tip: Click start date on the calendar or type above. All dates between start &amp; end are automatically highlighted.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Traveling Company */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#0d1c32] mb-3">
          4. Traveling Company
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { type: 'solo', label: 'Solo', count: 1, desc: '1 Traveler' },
            { type: 'couple', label: 'Couple', count: 2, desc: '2 Travelers' },
            { type: 'family', label: 'Family', count: 4, desc: '4+ Travelers' },
            { type: 'friends', label: 'Friends', count: 4, desc: 'Group of Friends' }
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setCompany(item.type, item.count)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                travelType === item.type
                  ? 'border-[#D4AF37] bg-[#fed65b]/20 text-[#0d1c32] shadow-sm'
                  : 'border-gray-200 bg-[#fafaf5] hover:bg-white'
              }`}
            >
              <div className="text-xs font-bold text-[#0d1c32]">{item.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>

        {(travelType === 'family' || travelType === 'friends') && (
          <div className="mt-4 p-4 bg-[#fafaf5] rounded-xl border border-gray-200 flex items-center justify-between animate-fadeIn">
            <span className="text-xs font-bold text-[#0d1c32]">Exact Number of Travelers:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCompany(travelType, Math.max(1, numberOfTravelers - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-gray-300 font-bold text-sm flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                -
              </button>
              <span className="text-sm font-bold text-[#0d1c32] w-6 text-center">{numberOfTravelers}</span>
              <button
                type="button"
                onClick={() => setCompany(travelType, numberOfTravelers + 1)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-300 font-bold text-sm flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={handleProceedNext}
        disabled={destinations.length === 0 || !rangeStart}
        className="w-full py-4 bg-[#0d1c32] text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>
          Continue to Categories ({destinations.length} {destinations.length === 1 ? 'Destination' : 'Destinations'} Selected)
        </span>
        <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
      </button>
    </div>
  );
}

export default TripPlanningPage1;
