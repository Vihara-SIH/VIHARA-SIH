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
  Clock
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { getAllAvailableDestinations } from '../services/destinationService';

export function TripPlanningPage1({ onNext }) {
  const {
    currentLocation,
    setCurrentLocation,
    selectedDestinations,
    toggleDestination,
    setSelectedDestinations,
    startDate,
    endDate,
    setDateRange,
    numberOfDays,
    travelType,
    numberOfTravelers,
    setCompany
  } = useTrip();

  // Search & Dropdown state for destinations
  const [destSearch, setDestSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Calendar State
  const [rangeStart, setRangeStart] = useState(startDate || '');
  const [rangeEnd, setRangeEnd] = useState(endDate || '');
  const [hoverDate, setHoverDate] = useState(null);

  // View Month / Year
  const initialDate = startDate ? new Date(startDate) : new Date();
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());

  const allDestinations = useMemo(() => getAllAvailableDestinations(), []);

  // Filter destinations based on search query
  const filteredDestinations = useMemo(() => {
    if (!destSearch.trim()) return allDestinations;
    const q = destSearch.toLowerCase().trim();
    return allDestinations.filter(
      d => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
    );
  }, [allDestinations, destSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with context if context changes
  useEffect(() => {
    if (startDate) setRangeStart(startDate);
    if (endDate) setRangeEnd(endDate);
  }, [startDate, endDate]);

  // Detect location handler (Defaults to Hyderabad)
  const handleDetectLocation = () => {
    setCurrentLocation('Hyderabad, Telangana');
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
      // 1st click: Start date selected, clear end date
      setRangeStart(clickedDateStr);
      setRangeEnd('');
      setDateRange(clickedDateStr, '');
    } else if (rangeStart && !rangeEnd) {
      // 2nd click: End date selected
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

  // Direct Date input change handler
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

  // Quick Preset Helper (e.g. 3, 5, 7, 10 days)
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

  // Format date helper (e.g. "Mon, 31 Aug, 2026")
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Select date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
          Choose your destinations, select your trip date range on the calendar, and specify your traveling company.
        </p>
      </div>

      {/* 1. Starting Location */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#0d1c32] mb-2">
          1. Your Starting Location
        </label>
        <div className="relative flex items-center">
          <MapPin className="absolute left-4 w-4 h-4 text-[#735c00]" />
          <input
            type="text"
            className="w-full pl-11 pr-28 py-3 bg-[#fafaf5] border border-gray-200 rounded-xl text-sm font-medium text-[#0d1c32] focus:outline-none focus:border-[#D4AF37] transition-all"
            placeholder="Enter city or origin..."
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
          />
          <button
            type="button"
            onClick={handleDetectLocation}
            className="absolute right-2 px-3 py-1.5 bg-[#fed65b]/30 hover:bg-[#fed65b]/50 text-[#735c00] rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Detect</span>
          </button>
        </div>
      </div>

      {/* 2. Scalable Searchable Multi-Select Destination Dropdown */}
      <div className="mb-8" ref={dropdownRef}>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#0d1c32]">
            2. Select Destinations (Check All That Apply)
          </label>
          <span className="text-xs font-bold text-[#735c00] bg-[#fed65b]/20 px-2.5 py-0.5 rounded-full">
            {selectedDestinations.length} selected
          </span>
        </div>

        {/* Selected Destination Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedDestinations.map((destId) => {
            const destObj = allDestinations.find(d => d.id === destId);
            return (
              <span
                key={destId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1c32] text-white text-xs font-semibold rounded-xl shadow-sm animate-fadeIn"
              >
                <span>{destObj ? destObj.name : destId}</span>
                {destObj && <span className="text-[10px] text-gray-400">({destObj.state})</span>}
                {selectedDestinations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => toggleDestination(destId)}
                    className="p-0.5 hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            );
          })}
        </div>

        {/* Dropdown Trigger */}
        <div className="relative">
          <div
            className="w-full px-4 py-3 bg-[#fafaf5] border border-gray-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#D4AF37] transition-colors"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-xs font-medium text-gray-700">
              {selectedDestinations.length > 0
                ? `Selected: ${selectedDestinations.map(d => allDestinations.find(x => x.id === d)?.name || d).join(', ')}`
                : 'Click to choose destinations...'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Searchable Dropdown List with Checkboxes */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 overflow-hidden animate-fadeIn">
              {/* Search Bar inside dropdown */}
              <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-[#fafaf5]">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full bg-transparent text-xs text-[#0d1c32] placeholder-gray-400 outline-none"
                  placeholder="Search cities, states (e.g. Hyderabad, Goa, Jaipur, Varanasi)..."
                  value={destSearch}
                  onChange={(e) => setDestSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Destination Checkbox Items */}
              <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                {filteredDestinations.length > 0 ? (
                  filteredDestinations.map((dest) => {
                    const isChecked = selectedDestinations.includes(dest.id);
                    return (
                      <div
                        key={dest.id}
                        onClick={() => toggleDestination(dest.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                          isChecked ? 'bg-[#fed65b]/20 font-semibold' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-[#0d1c32] border-[#0d1c32] text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0d1c32]">{dest.name}</div>
                            <div className="text-[10px] text-gray-500">{dest.tagline || dest.state}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                          {dest.state}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No destinations match "{destSearch}"
                  </div>
                )}
              </div>
            </div>
          )}
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
              {/* Empty slots before first day */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {/* Month Days */}
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
        onClick={onNext}
        disabled={selectedDestinations.length === 0 || !rangeStart}
        className="w-full py-4 bg-[#0d1c32] text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Select Categories ({selectedDestinations.length} Destinations Selected)</span>
        <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
      </button>
    </div>
  );
}

export default TripPlanningPage1;
