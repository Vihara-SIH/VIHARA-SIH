import React, { useState } from 'react';
import { useEvents } from '../../context/EventsContext';
import { CULTURAL_GENRES, EVENT_FORMATS } from '../../data/eventsData';

export function EventSearchResults({ onBack }) {
  const {
    searchResults,
    isSearching,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedGenre,
    setSelectedGenre,
    selectedFormat,
    setSelectedFormat,
    maxPrice,
    setMaxPrice,
    maxDistance,
    setMaxDistance,
    onlyTripFit,
    setOnlyTripFit,
    sortBy,
    setSortBy,
    executeSearch,
    selectEventAndOpen,
    proceedToTickets,
    showToast
  } = useEvents();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'split'
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [matchModalEvent, setMatchModalEvent] = useState(null);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    executeSearch({ query: searchQuery, navigate: false });
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    executeSearch({ navigate: false });
  };

  return (
    <div className="w-full bg-[#fff8f5] text-[#1e1b19] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* WHY THIS MATCH MODAL */}
      {matchModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-6 flex flex-col gap-4 relative border border-[#e7dfd5]">
            <button
              onClick={() => setMatchModalEvent(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#eee7e3] flex items-center justify-center text-[#59413a] hover:text-[#1e1b19] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-1.5 text-[#c2410c]">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              <span className="text-xs uppercase tracking-wider font-bold">VIHARA Trip Intelligence Engine</span>
            </div>

            <div>
              <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#1e1b19]">
                {matchModalEvent.title}
              </h3>
              <p className="text-xs text-[#59413a] mt-0.5">
                Matched against: <strong className="text-[#1e1b19]">{selectedCity} Cultural Journey • Day 2</strong>
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#faf2ee] rounded-xl">
              <div className="flex items-center gap-2">
                <span className="font-['Playfair_Display',serif] text-2xl font-bold text-[#c2410c]">
                  {matchModalEvent.itineraryScore || 98}%
                </span>
                <span className="text-xs text-[#59413a]">Overall Compatibility</span>
              </div>
              <span className="bg-[#c2410c]/10 text-[#c2410c] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Optimal Transit Slot
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Cultural Genre Alignment</span>
                  <span className="text-[#c2410c]">98% (+30%)</span>
                </div>
                <div className="w-full h-1.5 bg-[#eee7e3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#c2410c] rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Itinerary Free Time Window (Post-Sightseeing)</span>
                  <span className="text-[#c2410c]">95% (+25%)</span>
                </div>
                <div className="w-full h-1.5 bg-[#eee7e3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#c2410c] rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Stay & Route Proximity ({matchModalEvent.distanceKm} km)</span>
                  <span className="text-[#006a63]">96% (+25%)</span>
                </div>
                <div className="w-full h-1.5 bg-[#eee7e3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#006a63] rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#ffdbd0]/30 rounded-xl flex items-start gap-2 text-xs text-[#1e1b19]">
              <span className="material-symbols-outlined text-[#c2410c] text-[18px] shrink-0 mt-0.5">navigation</span>
              <p>
                <strong>Zero-backtrack corridor:</strong> {matchModalEvent.itinerarySlotFit || 'Fits smoothly into your itinerary rhythm with direct transit options.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMatchModalEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#59413a] hover:bg-[#eee7e3] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  proceedToTickets(matchModalEvent);
                  setMatchModalEvent(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#c2410c] hover:bg-[#9b2f00] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Select Tickets</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP CONTROL CONSOLE */}
      <section className="sticky top-20 z-40 bg-[#fff8f5]/95 backdrop-blur-md shadow-sm border-b border-[#e7dfd5] py-3">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col gap-3">
          {/* Row 1: Back + Search + Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-1 flex items-center">
              <button
                onClick={onBack}
                className="px-3 py-2 rounded-xl bg-white border border-[#e1bfb5] text-xs font-bold text-[#9b2f00] hover:bg-[#faf2ee] transition-all flex items-center gap-1 shadow-sm w-full justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span className="hidden sm:inline">Hub</span>
              </button>
            </div>

            {/* Search input */}
            <form onSubmit={handleSearchSubmit} className="lg:col-span-6 relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#8d7168] text-[20px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artists, Sufi mehfils, baithaks, venues, food trails..."
                className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#faf2ee] text-xs sm:text-sm text-[#1e1b19] focus:outline-none focus:ring-2 focus:ring-[#c2410c]/30 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[#8d7168] hover:text-[#1e1b19]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </form>

            {/* Location & Radius Selector */}
            <div className="lg:col-span-3 flex items-center bg-[#faf2ee] rounded-xl h-11 px-3 gap-2 border border-[#e7dfd5]">
              <span className="material-symbols-outlined text-[#c2410c] text-[18px]">location_on</span>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#8d7168] leading-none">Location & Radius</span>
                <span className="text-xs text-[#1e1b19] font-bold truncate">{selectedCity} • Within {maxDistance} km</span>
              </div>
            </div>

            {/* Filter Drawer Toggle */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <button
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  showFilterDrawer ? 'bg-[#1e1b19] text-white' : 'bg-white border border-[#e1bfb5] text-[#1e1b19] hover:bg-[#faf2ee]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Filters {onlyTripFit ? '(1 active)' : ''}</span>
              </button>
            </div>
          </div>

          {/* Sub-bar: Results count, Sort, View Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-[#59413a]">
              <span className="font-bold text-[#1e1b19]">{searchResults.length} experiences</span> found in {selectedCity}
              <span>•</span>
              <span className="inline-flex items-center gap-1 bg-[#006a63]/10 text-[#006a63] px-2.5 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006a63]"></span>
                Trip Synchronized
              </span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-[#e7dfd5] text-xs">
                <span className="text-[10px] uppercase font-bold text-[#8d7168]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#1e1b19] focus:outline-none cursor-pointer"
                >
                  <option value="best_match">Best Trip Match</option>
                  <option value="distance">Distance: Closest</option>
                  <option value="price_low">Price: Low to High</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="bg-[#eee7e3] p-0.5 rounded-xl flex items-center">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    viewMode === 'list' ? 'bg-white text-[#1e1b19] shadow-sm' : 'text-[#59413a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">view_agenda</span>
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    viewMode === 'split' ? 'bg-white text-[#1e1b19] shadow-sm' : 'text-[#59413a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">map</span>
                  <span className="hidden sm:inline">Split Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER DRAWER (Collapsible) */}
      {showFilterDrawer && (
        <section className="w-full bg-[#faf2ee] border-b border-[#e7dfd5] py-4 transition-all">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Genre */}
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-[#1e1b19] uppercase tracking-wider text-[11px]">Cultural Genre</span>
              <select
                value={selectedGenre}
                onChange={(e) => {
                  setSelectedGenre(e.target.value);
                  executeSearch({ genre: e.target.value, navigate: false });
                }}
                className="h-9 px-2.5 rounded-lg bg-white border border-[#e7dfd5] font-medium text-[#1e1b19]"
              >
                {CULTURAL_GENRES.map((g) => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
            </div>

            {/* Format */}
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-[#1e1b19] uppercase tracking-wider text-[11px]">Experience Format</span>
              <select
                value={selectedFormat}
                onChange={(e) => {
                  setSelectedFormat(e.target.value);
                  executeSearch({ format: e.target.value, navigate: false });
                }}
                className="h-9 px-2.5 rounded-lg bg-white border border-[#e7dfd5] font-medium text-[#1e1b19]"
              >
                <option value="all">All Formats</option>
                {EVENT_FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Max Price */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-bold text-[#1e1b19] text-[11px]">
                <span className="uppercase tracking-wider">Max Pass Price</span>
                <span className="text-[#c2410c]">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="350"
                max="5000"
                step="250"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  executeSearch({ maxPrice: Number(e.target.value), navigate: false });
                }}
                className="accent-[#c2410c]"
              />
            </div>

            {/* Trip Gap Only */}
            <div className="flex items-center gap-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyTripFit}
                  onChange={(e) => {
                    setOnlyTripFit(e.target.checked);
                    executeSearch({ onlyTripFit: e.target.checked, navigate: false });
                  }}
                  className="w-4 h-4 text-[#c2410c] accent-[#c2410c] rounded"
                />
                <span className="font-bold text-[#1e1b19]">Only show events fitting itinerary gaps</span>
              </label>
            </div>
          </div>
        </section>
      )}

      {/* RESULTS LIST & CARDS */}
      <section className="w-full max-w-[1320px] mx-auto px-4 sm:px-8 py-8">
        {searchResults.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#e7dfd5] p-8 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-[#8d7168] mb-2">event_busy</span>
            <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#1e1b19]">No events match current filters</h3>
            <p className="text-xs text-[#59413a] mt-1 max-w-sm mx-auto">
              Try adjusting your search query, increasing distance radius, or clearing category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
                setSelectedFormat('all');
                setOnlyTripFit(false);
                executeSearch({ query: '', genre: 'all', format: 'all', onlyTripFit: false, navigate: false });
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#c2410c] text-white text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((evt) => (
              <div
                key={evt.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between border border-[#e7dfd5]"
              >
                <div>
                  {/* Card Image */}
                  <div
                    onClick={() => selectEventAndOpen(evt)}
                    className="relative h-52 w-full overflow-hidden bg-[#eee7e3] cursor-pointer"
                  >
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={evt.heroImage}
                      alt={evt.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Compatibility Badge */}
                    <div className="absolute top-3 left-3 bg-[#c2410c] text-white text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-md">
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      <span>{evt.itineraryScore || 96}% VIHARA Match</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMatchModalEvent(evt);
                      }}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[#1e1b19] hover:bg-[#c2410c] hover:text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-md transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">info</span>
                      <span>Why this match?</span>
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#ffdcc3] block mb-0.5">
                        {evt.genreLabel}
                      </span>
                      <h3 className="font-['Playfair_Display',serif] text-base sm:text-lg font-bold text-white line-clamp-1">
                        {evt.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#59413a]">
                      <span className="material-symbols-outlined text-[16px] text-[#006a63]">location_on</span>
                      <span className="truncate">{evt.venue}</span>
                      <span className="text-[#8d7168]">•</span>
                      <span className="text-[#c2410c] font-bold shrink-0">{evt.distanceKm} km</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#59413a]">
                      <span className="material-symbols-outlined text-[16px] text-[#006a63]">schedule</span>
                      <span>{evt.date} • {evt.timeSlot}</span>
                    </div>

                    <div className="bg-[#faf2ee] p-2 rounded-lg text-xs text-[#59413a] mt-1 line-clamp-2">
                      {evt.about}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-3 border-t border-[#f4ece8] flex items-center justify-between">
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
                      Details
                    </button>
                    <button
                      onClick={() => proceedToTickets(evt)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#c2410c] hover:bg-[#9b2f00] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default EventSearchResults;
