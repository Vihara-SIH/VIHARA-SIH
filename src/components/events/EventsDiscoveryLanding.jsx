import React, { useState } from 'react';
import { useEvents } from '../../context/EventsContext';
import { useTrip } from '../../context/TripContext';
import { CULTURAL_GENRES, EVENTS_CATALOG, FEATURED_SPOTLIGHT } from '../../data/eventsData';

export function EventsDiscoveryLanding({ onBackToHome, onNavigateToTrip }) {
  const {
    selectedCity,
    setSelectedCity,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedDate,
    setSelectedDate,
    maxDistance,
    setMaxDistance,
    onlyTripFit,
    setOnlyTripFit,
    executeSearch,
    selectEventAndOpen,
    proceedToTickets,
    showToast
  } = useEvents();

  const tripContext = useTrip();
  const activeTrip = tripContext?.tripData || null;

  const [activeMode, setActiveMode] = useState('trip'); // 'trip' | 'local'
  const [activeRadarItem, setActiveRadarItem] = useState(null);

  const cityList = ['Hyderabad', 'Varanasi', 'Jaipur', 'Delhi', 'Goa', 'Udaipur', 'Bengaluru', 'Mumbai'];

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    executeSearch({ city, navigate: false });
    showToast(`📍 Switched event discovery radar to ${city}`);
  };

  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
    executeSearch({ genre: genreId, navigate: true });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    executeSearch({ query: searchQuery, navigate: true });
  };

  // Top 3 trip matched cards
  const tripMatchedEvents = EVENTS_CATALOG.slice(0, 3);

  return (
    <div className="w-full bg-[#fff8f5] text-[#1e1b19] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. HERO EDITORIAL SECTION */}
      <section className="w-full bg-[#fff8f5] relative overflow-hidden pb-10 pt-6">
        {/* Decorative subtle background glows */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#c2410c]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#006a63]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1320px] mx-auto px-4 sm:px-8">
          {/* Top Row: Back to Home + Mode Selector Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-3">
            <div className="flex items-center gap-3">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#e1bfb5] text-xs font-bold text-[#9b2f00] hover:bg-[#faf2ee] transition-all flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back to Home</span>
                </button>
              )}

              <div className="flex items-center gap-1 bg-[#faf2ee] p-1 rounded-full shadow-sm">
                <button
                  onClick={() => setActiveMode('trip')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeMode === 'trip'
                      ? 'bg-[#c2410c] text-white shadow-sm'
                      : 'text-[#59413a] hover:text-[#1e1b19]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#9cf2e8] animate-ping"></span>
                  <span>Trip-Aware Radar</span>
                  <span className="bg-black/20 text-[10px] px-2 py-0.5 rounded-full">
                    {selectedCity} • 14–15 Sep
                  </span>
                </button>

                <button
                  onClick={() => setActiveMode('local')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeMode === 'local'
                      ? 'bg-[#c2410c] text-white shadow-sm'
                      : 'text-[#59413a] hover:text-[#1e1b19]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">radar</span>
                  <span>Independent Explorer</span>
                </button>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs text-[#8d7168] font-medium">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006a63]"></span> Google Places & Geocode Sync
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#824500]">bolt</span> Route Gap Optimization
              </span>
            </div>
          </div>

          {/* Hero Typography & Montage Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#9b2f00] text-xs tracking-wider uppercase font-bold">
                <span className="material-symbols-outlined text-[16px]">explore</span>
                <span>VIHARA • EVENTS & CULTURAL RADAR</span>
              </div>

              <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1e1b19] tracking-tight leading-[1.1]">
                See what’s happening <br />
                <span className="relative inline-block text-[#c2410c]">
                  around you
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#006a63]" fill="none" preserveAspectRatio="none" viewBox="0 0 240 12">
                    <path d="M3 9C60 3 170 3 237 9" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5"></path>
                  </svg>
                </span>{' '}
                in India.
              </h1>

              <p className="text-[#59413a] text-base sm:text-lg max-w-xl leading-relaxed">
                Discover bespoke mehfils, heritage trails, concerts, and spontaneous cultural gatherings — intelligently synchronized with your stay locations, daily route rhythm, and travel gaps.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center -space-x-2">
                  <div className="w-9 h-9 rounded-full bg-[#eee7e3] ring-2 ring-[#fff8f5] flex items-center justify-center text-[#9b2f00] text-xs font-bold">HYD</div>
                  <div className="w-9 h-9 rounded-full bg-[#9cf2e8] ring-2 ring-[#fff8f5] flex items-center justify-center text-[#00201d] text-xs font-bold">VAR</div>
                  <div className="w-9 h-9 rounded-full bg-[#ffdcc3] ring-2 ring-[#fff8f5] flex items-center justify-center text-[#2f1500] text-xs font-bold">JAI</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#1e1b19]">38 Curated Gatherings This Weekend</span>
                  <span className="text-xs text-[#8d7168]">Across Courtyards, Historic Monuments, Baolis & Bazaars</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Montage Card */}
            <div className="lg:col-span-5 relative">
              <div
                onClick={() => selectEventAndOpen(FEATURED_SPOTLIGHT)}
                className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#eee7e3] aspect-[5/4] group cursor-pointer border border-[#e1bfb5]"
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={FEATURED_SPOTLIGHT.heroImage}
                  alt={FEATURED_SPOTLIGHT.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                {/* Live Badge Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#fff8f5]/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                  <span className="text-[11px] font-bold text-[#1e1b19] uppercase tracking-wider">Tonight’s Highlight</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="bg-[#c2410c] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1.5 inline-block">
                    {FEATURED_SPOTLIGHT.genreLabel}
                  </span>
                  <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-white mb-1 leading-snug">
                    {FEATURED_SPOTLIGHT.title}
                  </h3>
                  <p className="text-xs text-[#e9e1dd] line-clamp-1">
                    {FEATURED_SPOTLIGHT.subtitle} • Starts 6:30 PM • 0.8 km from Old City Corridor
                  </p>
                </div>
              </div>

              {/* Secondary floating card ornament */}
              <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white p-3.5 rounded-xl shadow-xl items-center gap-3 max-w-xs border border-[#e7dfd5]">
                <div className="w-10 h-10 rounded-lg bg-[#9cf2e8] flex items-center justify-center text-[#00201d]">
                  <span className="material-symbols-outlined text-[20px]">map</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#006a63] uppercase tracking-wider">Route Compatibility</span>
                  <span className="text-xs font-bold text-[#1e1b19]">Zero backtrack detour</span>
                  <span className="text-[11px] text-[#8d7168]">En route to your evening dinner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LOCATION-FIRST SEARCH & CATEGORY BAR */}
      <section className="w-full bg-[#faf2ee] py-8 relative z-20">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-7 flex flex-col gap-5 border border-[#e7dfd5]">
            {/* Top Bar: Radius + Cities */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#e9e1dd]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-[#faf2ee] px-3.5 py-1.5 rounded-xl">
                  <span className="material-symbols-outlined text-[#9b2f00] text-[20px]">location_on</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#8d7168]">Active Discovery Location</span>
                    <span className="text-sm font-bold text-[#1e1b19]">{selectedCity}, India</span>
                  </div>
                </div>

                {/* Radius Select */}
                <div className="flex items-center gap-1 bg-[#faf2ee] p-1 rounded-full text-xs font-semibold text-[#59413a]">
                  <button
                    onClick={() => setMaxDistance(5)}
                    className={`px-3 py-1 rounded-full transition-all ${
                      maxDistance === 5 ? 'bg-[#1e1b19] text-white shadow-sm' : 'hover:text-[#1e1b19]'
                    }`}
                  >
                    5 km
                  </button>
                  <button
                    onClick={() => setMaxDistance(15)}
                    className={`px-3 py-1 rounded-full transition-all ${
                      maxDistance === 15 ? 'bg-[#1e1b19] text-white shadow-sm' : 'hover:text-[#1e1b19]'
                    }`}
                  >
                    Within 15 km
                  </button>
                  <button
                    onClick={() => setMaxDistance(30)}
                    className={`px-3 py-1 rounded-full transition-all ${
                      maxDistance === 30 ? 'bg-[#1e1b19] text-white shadow-sm' : 'hover:text-[#1e1b19]'
                    }`}
                  >
                    30 km
                  </button>
                </div>
              </div>

              {/* City Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <span className="text-[11px] font-bold text-[#8d7168] uppercase mr-1">Hop To:</span>
                {cityList.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCitySelect(c)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedCity.toLowerCase() === c.toLowerCase()
                        ? 'bg-[#ffdbd0] text-[#390c00] font-bold shadow-sm'
                        : 'bg-[#f4ece8] text-[#1e1b19] hover:bg-[#eee7e3]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Search Bar */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-9 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#8d7168] text-[22px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search live Sufi mehfils, midnight food trails, royal dawats, heritage photo-walks..."
                  className="w-full h-12 pl-12 pr-4 bg-[#faf2ee] rounded-xl text-sm text-[#1e1b19] placeholder:text-[#8d7168] focus:outline-none focus:ring-2 focus:ring-[#c2410c]/40 transition-all"
                />
              </div>
              <div className="lg:col-span-3">
                <button
                  type="submit"
                  className="w-full h-12 bg-[#c2410c] hover:bg-[#9b2f00] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">radar</span>
                  <span>Explore Radar</span>
                </button>
              </div>
            </form>

            {/* Genre Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              {CULTURAL_GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleGenreSelect(g.id)}
                  className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedGenre === g.id
                      ? 'bg-[#1e1b19] text-white shadow-sm'
                      : 'bg-[#faf2ee] text-[#59413a] hover:bg-[#f4ece8] hover:text-[#1e1b19]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>

            {/* Date Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#8d7168] uppercase font-bold mr-1">When:</span>
                {['Today', 'Tomorrow', 'Weekend (14-15 Sep)', 'Next 7 Days'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                      selectedDate === d
                        ? 'bg-[#c2410c] text-white font-bold'
                        : 'bg-[#faf2ee] hover:bg-[#f4ece8] text-[#1e1b19]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 bg-[#006a63]/10 px-3 py-1 rounded-full text-[#006a63]">
                <span className="material-symbols-outlined text-[15px]">sync</span>
                <span className="font-semibold">Synchronized to Itinerary Dates (14–15 Sep)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRIP-AWARE INTELLIGENCE SECTION */}
      <section className="w-full bg-[#faf2ee] py-10" id="trip-intelligence-container">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#c2410c]/10 text-[#c2410c] px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">electric_bolt</span> TRIP INTELLIGENCE ENGINE
                </span>
                <span className="text-[#8d7168] text-xs hidden sm:inline">• Realtime Route & Schedule Matching</span>
              </div>
              <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#1e1b19]">
                Events that fit your journey
              </h2>
              <p className="text-sm text-[#59413a] max-w-2xl">
                Calculated around your confirmed itinerary for <strong className="text-[#1e1b19]">{selectedCity}</strong>, accounting for scheduled sightseeing rest gaps and city transit corridors.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-[#e7dfd5]">
              <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-0.5">
                <input
                  type="checkbox"
                  checked={onlyTripFit}
                  onChange={(e) => {
                    setOnlyTripFit(e.target.checked);
                    executeSearch({ onlyTripFit: e.target.checked, navigate: false });
                  }}
                  className="w-4 h-4 text-[#c2410c] accent-[#c2410c] rounded"
                />
                <span className="text-xs font-bold text-[#1e1b19]">Show itinerary gaps only</span>
              </label>
            </div>
          </div>

          {/* 3 Intelligent Trip-Matched Event Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tripMatchedEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group border border-[#e7dfd5]"
              >
                <div className="flex flex-col gap-3">
                  <div
                    onClick={() => selectEventAndOpen(evt)}
                    className="relative rounded-xl overflow-hidden aspect-[16/10] bg-[#eee7e3] cursor-pointer"
                  >
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={evt.heroImage}
                      alt={evt.title}
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#006a63] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      <span>{evt.badge}</span>
                    </div>
                  </div>

                  {/* Match Context Pill */}
                  <div className="bg-[#c2410c]/5 p-2 rounded-lg flex items-start gap-1.5 text-[#9b2f00] text-xs">
                    <span className="material-symbols-outlined text-[16px] text-[#c2410c] shrink-0 mt-0.5">auto_awesome</span>
                    <span><strong>Trip Fit:</strong> {evt.itinerarySlotFit}</span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#8d7168] uppercase tracking-wider">{evt.genreLabel}</span>
                    <h3
                      onClick={() => selectEventAndOpen(evt)}
                      className="font-['Playfair_Display',serif] text-lg font-bold text-[#1e1b19] group-hover:text-[#c2410c] transition-colors cursor-pointer leading-snug mt-0.5"
                    >
                      {evt.title}
                    </h3>
                    <p className="text-xs text-[#59413a] line-clamp-2 mt-1">{evt.about}</p>
                  </div>

                  {/* Logistics */}
                  <div className="flex flex-col gap-1 pt-1 text-xs text-[#59413a]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#006a63]">calendar_today</span>
                      <span className="font-semibold text-[#1e1b19]">{evt.date} • {evt.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#8d7168]">pin_drop</span>
                      <span>{evt.venue} ({evt.distanceKm} km)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#f4ece8] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#8d7168] uppercase font-bold block">Pass from</span>
                    <div className="text-base font-bold text-[#1e1b19]">
                      ₹{evt.priceStarting.toLocaleString('en-IN')}{' '}
                      <span className="text-xs text-[#8d7168] font-normal">/ guest</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectEventAndOpen(evt)}
                      className="px-3 py-1.5 rounded-lg bg-[#f4ece8] hover:bg-[#eee7e3] text-[#1e1b19] text-xs font-bold transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => proceedToTickets(evt)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#c2410c] hover:bg-[#9b2f00] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">add_circle</span>
                      <span>Book Pass</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIVE MAP RADAR SECTION */}
      <section className="w-full bg-[#fff8f5] py-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#c2410c]">Spatial Cultural Discovery</span>
              <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#1e1b19] mt-0.5">
                Live Map Radar: {selectedCity}
              </h2>
              <p className="text-sm text-[#59413a]">
                Pins indicate live cultural baithaks, food trails, and aartis relative to your location.
              </p>
            </div>
            <button
              onClick={() => executeSearch({ navigate: true })}
              className="px-4 py-2 rounded-xl bg-white border border-[#e1bfb5] text-xs font-bold text-[#9b2f00] hover:bg-[#faf2ee] transition-all flex items-center gap-1.5 shadow-sm self-start md:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
              <span>Open Interactive Full Map View</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Simulated Radar Container */}
            <div className="lg:col-span-7 bg-[#faf2ee] rounded-2xl p-4 border border-[#e7dfd5] relative overflow-hidden shadow-sm h-80 flex flex-col justify-between">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006a63] animate-ping"></span>
                  <span className="text-xs font-bold text-[#1e1b19]">
                    {EVENTS_CATALOG.length} Verified Experiences Near You
                  </span>
                </div>
                <div className="text-xs text-[#8d7168] bg-white/80 px-2 py-0.5 rounded">
                  GPS Accuracy: ±15m
                </div>
              </div>

              {/* Pin markers */}
              <div className="relative w-full h-44">
                {/* Pin 1 */}
                <div
                  onClick={() => selectEventAndOpen(EVENTS_CATALOG[0])}
                  className="absolute top-6 left-1/4 bg-[#c2410c] text-white px-2.5 py-1 rounded-full shadow-lg text-xs font-bold flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform"
                >
                  <span className="material-symbols-outlined text-[14px]">music_note</span>
                  <span>₹1,200 • Sufi Mehfil</span>
                </div>

                {/* Pin 2 */}
                <div
                  onClick={() => selectEventAndOpen(EVENTS_CATALOG[1])}
                  className="absolute bottom-8 right-1/3 bg-[#1e1b19] text-white px-2.5 py-1 rounded-full shadow-lg text-xs font-bold flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform"
                >
                  <span className="material-symbols-outlined text-[14px]">restaurant</span>
                  <span>₹1,450 • Food Trail</span>
                </div>

                {/* Hotel Marker */}
                <div className="absolute top-1/2 right-1/4 bg-[#a65900] text-white px-2.5 py-1 rounded-full shadow-md text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">hotel</span>
                  <span>Your Stay: Old City Hub</span>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur rounded-xl p-2.5 flex items-center justify-between shadow-sm z-10">
                <span className="text-xs text-[#59413a]">Location refreshed moments ago</span>
                <button
                  onClick={() => showToast('📍 Recalibrated location to your active hotel stay coordinates.')}
                  className="text-[#9b2f00] text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[15px]">my_location</span>
                  <span>Recalibrate</span>
                </button>
              </div>
            </div>

            {/* Right: Live Radar List with Distance Badges */}
            <div className="lg:col-span-5 flex flex-col gap-2.5">
              {EVENTS_CATALOG.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => selectEventAndOpen(evt)}
                  className="p-3.5 rounded-xl bg-white shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer border border-[#e7dfd5] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#006a63]/10 text-[#006a63] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[18px]">near_me</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1e1b19] group-hover:text-[#c2410c] transition-colors">
                        {evt.title}
                      </span>
                      <span className="text-[11px] text-[#8d7168]">{evt.venue}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-[#9cf2e8] text-[#00201d] text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {evt.distanceKm} km
                    </span>
                    <span className="text-xs text-[#1e1b19] block font-bold mt-1">
                      ₹{evt.priceStarting}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CULTURAL GENRE EXPLORATION GRID */}
      <section className="w-full bg-[#faf2ee] py-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col gap-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#c2410c]">Immersive Threads</span>
            <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#1e1b19] mt-0.5">
              Explore by Cultural Genre
            </h2>
            <p className="text-sm text-[#59413a] max-w-xl">
              Deep-dive into living regional arts, classical mehfils, oral storytelling, and royal epicurean customs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CULTURAL_GENRES.filter((g) => g.id !== 'all').map((genre, idx) => {
              const matchedSample = EVENTS_CATALOG.find((e) => e.genre === genre.id) || EVENTS_CATALOG[idx % EVENTS_CATALOG.length];
              return (
                <div
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre.id)}
                  className="group relative rounded-2xl overflow-hidden aspect-[16/11] shadow-sm hover:shadow-xl transition-all duration-500 bg-[#eee7e3] cursor-pointer border border-[#e1bfb5]"
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={matchedSample.heroImage}
                    alt={genre.label}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold text-[#9cf2e8] uppercase tracking-wider">
                      Cultural Collection
                    </span>
                    <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-white mt-0.5">
                      {genre.label}
                    </h3>
                    <p className="text-xs text-[#e9e1dd] line-clamp-1 mt-0.5">
                      {matchedSample.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default EventsDiscoveryLanding;
