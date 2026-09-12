import React, { useState } from 'react';
import {
  ArrowLeft,
  SlidersHorizontal,
  MapPin,
  Star,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Check,
  Building,
  Waves,
  Eye,
  Calendar,
  Users,
  Heart,
  Map,
  List,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useStays } from '../../context/StaysContext';
import { searchStays } from '../../services/staysService';
import { HOTEL_CATEGORIES } from '../../data/staysData';
import { SmartMatchBadge } from './SmartMatchBadge';
import { StaysSplitMapView } from './StaysSplitMapView';

export function HotelResults() {
  const {
    searchParams,
    updateSearchField,
    navigateToStage,
    selectHotelAndProceed,
    tripContextData,
    isMapView,
    setIsMapView,
    toggleSaveHotel,
    isHotelSaved,
    getBudgetFitStatus
  } = useStays();

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Compute live search results with Smart Match ranking
  const hotels = searchStays(searchParams, tripContextData);

  // Top 3 Spotlight recommendations from Stitch
  const spotlightHotels = hotels.slice(0, 3);

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* 1. Top Search Summary Modifier Bar */}
      <div className="bg-[#fcf9f1] rounded-2xl p-4 md:p-5 border border-[#dcc1b8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => navigateToStage('landing')}
            className="p-2 rounded-xl bg-[#f1eee6] hover:bg-[#ebe8e0] text-[#1c1c17] border border-[#dcc1b8] transition-colors flex items-center gap-1 font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Search</span>
          </button>

          <div className="h-4 w-[1px] bg-[#dcc1b8] hidden sm:block"></div>

          <div className="flex items-center gap-1.5 font-bold text-[#7c2e0c]">
            <MapPin className="w-4 h-4 text-[#7c2e0c]" />
            <span className="text-sm text-[#1c1c17]">{searchParams.destination}, India</span>
          </div>

          <span className="text-gray-400">•</span>

          <div className="flex items-center gap-1.5 text-[#55433c] font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#765100]" />
            <span>{searchParams.checkIn} – {searchParams.checkOut} ({searchParams.nights} Nights)</span>
          </div>

          <span className="text-gray-400">•</span>

          <div className="flex items-center gap-1.5 text-[#55433c] font-medium">
            <Users className="w-3.5 h-3.5 text-[#765100]" />
            <span>{searchParams.guests} Guests, {searchParams.rooms} Room</span>
          </div>
        </div>

        {/* View Toggle & Sorting Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* List vs Split Map View Toggle */}
          <div className="inline-flex items-center p-1 bg-[#f1eee6] rounded-full border border-[#dcc1b8]">
            <button
              type="button"
              onClick={() => setIsMapView(false)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                !isMapView
                  ? 'bg-white text-[#7c2e0c] shadow-sm'
                  : 'text-[#55433c] hover:text-[#1c1c17]'
              }`}
            >
              <List size={14} />
              <span>List View</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMapView(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isMapView
                  ? 'bg-white text-[#7c2e0c] shadow-sm'
                  : 'text-[#55433c] hover:text-[#1c1c17]'
              }`}
            >
              <Map size={14} />
              <span>Split Map</span>
            </button>
          </div>

          {/* Mobile Filter Trigger */}
          <button
            type="button"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden px-3.5 py-2 rounded-xl bg-[#f1eee6] border border-[#dcc1b8] text-xs font-bold text-[#1c1c17] flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7c2e0c]" />
            <span>Filters</span>
          </button>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={searchParams.sortBy}
              onChange={(e) => updateSearchField('sortBy', e.target.value)}
              className="bg-white border border-[#dcc1b8] rounded-full px-3 py-1.5 font-bold text-xs text-[#1c1c17] outline-none cursor-pointer shadow-sm"
            >
              <option value="smart-match">Sort by: Smart Match (Itinerary Sync)</option>
              <option value="price-low">Tariff: Low to High</option>
              <option value="price-high">Tariff: High to Low</option>
              <option value="rating">Guest Rating: 4.5+ Exceptional</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Route Sync Notification Banner */}
      <div className="bg-[#f6f3eb] rounded-2xl p-4 border border-[#dcc1b8] flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#fdc66b] text-[#281900] flex items-center justify-center shrink-0 font-bold">
            <Sparkles className="w-4 h-4 text-[#7c2e0c]" />
          </div>
          <div className="text-xs text-[#55433c]">
            <strong className="text-[#7c2e0c] uppercase font-bold text-[10px] tracking-wider block">
              Synced to {searchParams.destination} Heritage Trail
            </strong>
            <span>
              {hotels.length} luxury sanctums aligned with your scheduled itinerary & transit flow.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMapView(!isMapView)}
          className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#7c2e0c] hover:underline"
        >
          <Map size={14} />
          <span>{isMapView ? 'Hide Route Map' : 'Open Full Route Map'}</span>
        </button>
      </div>

      {/* 3. Hero Recommended for Your Journey Carousel (Stitch Reference) */}
      {!isMapView && spotlightHotels.length > 0 && (
        <section className="bg-[#f1eee6] rounded-2xl p-5 md:p-6 border border-[#dcc1b8] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#dcc1b8]">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#7c2e0c] font-bold">
                Bespoke Algorithmic Alignment
              </span>
              <h3 className="text-lg font-serif font-bold text-[#1c1c17]">
                Recommended for Your {searchParams.destination} Journey
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#55433c]">
              <span className="w-2 h-2 rounded-full bg-[#fdc66b]"></span>
              <span>Optimized for {searchParams.checkIn} – {searchParams.checkOut} Route Flow</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {spotlightHotels.map((hotel) => {
              const saved = isHotelSaved(hotel.id);
              const budgetFit = getBudgetFitStatus(hotel.pricePerNight);

              return (
                <article
                  key={hotel.id}
                  onClick={() => selectHotelAndProceed(hotel)}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#dcc1b8] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden">
                      <img
                        src={hotel.heroImage}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-[#fdc66b] text-[#281900] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        {hotel.smartMatchScore}% Itinerary Match
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveHotel(hotel.id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-[#fdc66b] transition-colors"
                        aria-label="Save hotel"
                      >
                        <Heart size={16} className={saved ? 'fill-[#fdc66b] text-[#fdc66b]' : 'text-white'} />
                      </button>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[10px] uppercase tracking-widest text-[#fdc66b] font-bold block">
                          {hotel.location}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-white truncate">
                          {hotel.name}
                        </h4>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="p-2.5 bg-[#fcf9f1] rounded-xl space-y-1 text-xs text-[#55433c] border border-[#dcc1b8]/50">
                        {hotel.nearbyAttractions?.[0] && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                            <span>{hotel.nearbyAttractions[0].driveTime} from {hotel.nearbyAttractions[0].name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-[#7c2e0c] font-medium">
                          <Clock size={13} className="shrink-0" />
                          <span>Saves ~34 min daily route transit</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-1 font-bold text-[#1c1c17]">
                          <Star size={14} className="fill-[#fdc66b] text-[#fdc66b]" />
                          <span>{hotel.rating}</span>
                          <span className="text-gray-400 font-normal">({hotel.reviewCount} reviews)</span>
                        </div>
                        <span className="bg-[#f1eee6] text-[#7c2e0c] text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                          {hotel.categoryLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 mt-2">
                    <div>
                      <div className="text-base font-bold text-[#7c2e0c]">
                        ₹{hotel.pricePerNight?.toLocaleString()}
                        <span className="text-xs text-gray-500 font-normal">/night</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block">
                        Total ₹{(hotel.pricePerNight * searchParams.nights).toLocaleString()} + taxes
                      </span>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-[#7c2e0c] group-hover:bg-[#9b4522] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                      View Rooms
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Main Two-Column Layout (Filters + Results Grid / Split Map) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <div className={`md:col-span-3 space-y-6 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className="bg-[#fcf9f1] rounded-2xl p-5 border border-[#dcc1b8] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#dcc1b8]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1c1c17] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#7c2e0c]" />
                Filter Properties
              </span>
              <button
                type="button"
                onClick={() => {
                  updateSearchField('category', 'all');
                  updateSearchField('maxPrice', 50000);
                  updateSearchField('minRating', 0);
                  updateSearchField('minSmartMatch', 0);
                }}
                className="text-[11px] text-[#7c2e0c] font-bold hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Smart Match Threshold Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-2">
                Min Smart Match Score
              </label>
              <div className="space-y-1.5">
                {[
                  { label: 'All Match Scores', val: 0 },
                  { label: '90%+ Top Route Fit', val: 90 },
                  { label: '85%+ High Alignment', val: 85 }
                ].map((item) => (
                  <label key={item.val} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="smartMatch"
                      checked={searchParams.minSmartMatch === item.val}
                      onChange={() => updateSearchField('minSmartMatch', item.val)}
                      className="text-[#7c2e0c] focus:ring-[#7c2e0c]"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-2">
                Property Architecture
              </label>
              <div className="space-y-1.5">
                {HOTEL_CATEGORIES.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={searchParams.category === cat.id}
                      onChange={() => updateSearchField('category', cat.id)}
                      className="text-[#7c2e0c] focus:ring-[#7c2e0c]"
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Per Night Slider */}
            <div>
              <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-2">
                <span>Max Nightly Tariff</span>
                <span className="text-[#7c2e0c] font-bold">₹{searchParams.maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={3000}
                max={50000}
                step={1000}
                value={searchParams.maxPrice}
                onChange={(e) => updateSearchField('maxPrice', Number(e.target.value))}
                className="w-full accent-[#7c2e0c] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>₹3,000</span>
                <span>₹50,000+</span>
              </div>
            </div>

            {/* Guest Rating Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-2">
                Minimum Guest Rating
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { label: 'Any', val: 0 },
                  { label: '4.5+ ★', val: 4.5 },
                  { label: '4.8+ ★', val: 4.8 }
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => updateSearchField('minRating', r.val)}
                    className={`py-1.5 px-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      searchParams.minRating === r.val
                        ? 'bg-[#7c2e0c] text-white border-[#7c2e0c]'
                        : 'bg-white border-[#dcc1b8] text-gray-700 hover:bg-[#f6f3eb]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area: Split Map View OR Hotel Results List */}
        <div className="md:col-span-9 space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1c1c17]">
              Handpicked Sanctuaries in {searchParams.destination}
            </h2>
            <span className="text-xs text-gray-500">
              Showing <strong className="text-[#1c1c17]">{hotels.length}</strong> available properties
            </span>
          </div>

          {/* Conditional View: Split Map vs List View */}
          {isMapView ? (
            <div className="space-y-6">
              <StaysSplitMapView
                hotels={hotels}
                onSelectHotel={(hotel) => selectHotelAndProceed(hotel)}
              />

              {/* Compact Carousel below map */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    onClick={() => selectHotelAndProceed(hotel)}
                    className="bg-white p-3 rounded-2xl border border-[#dcc1b8] shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-3 items-center"
                  >
                    <img
                      src={hotel.heroImage}
                      alt={hotel.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold text-[#7c2e0c] truncate">
                          {hotel.city}
                        </span>
                        <span className="bg-[#fdc66b] text-[#281900] text-[9px] font-bold px-1.5 py-0.2 rounded">
                          {hotel.smartMatchScore}%
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-xs text-[#1c1c17] truncate">
                        {hotel.name}
                      </h4>
                      <div className="text-[11px] font-bold text-[#7c2e0c] mt-1">
                        ₹{hotel.pricePerNight?.toLocaleString()}/night
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Results Cards List */
            hotels.length > 0 ? (
              <div className="space-y-6">
                {hotels.map((hotel) => {
                  const saved = isHotelSaved(hotel.id);
                  const budgetFit = getBudgetFitStatus(hotel.pricePerNight);

                  return (
                    <div
                      key={hotel.id}
                      onClick={() => selectHotelAndProceed(hotel)}
                      className="bg-white rounded-3xl border border-[#dcc1b8] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#7c2e0c] transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 group"
                    >
                      {/* Photo Column */}
                      <div className="lg:col-span-5 relative h-64 lg:h-auto overflow-hidden bg-gray-100">
                        <img
                          src={hotel.heroImage}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <SmartMatchBadge score={hotel.smartMatchScore} breakdown={hotel.smartMatchBreakdown} />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveHotel(hotel.id);
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-[#fdc66b] transition-colors shadow-sm"
                          aria-label="Save hotel"
                        >
                          <Heart size={16} className={saved ? 'fill-[#fdc66b] text-[#fdc66b]' : 'text-white'} />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-[#1c1c17]/85 backdrop-blur-sm text-white px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {hotel.categoryLabel}
                        </div>
                      </div>

                      {/* Details Column */}
                      <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#765100] bg-[#fdc66b]/30 px-2.5 py-0.5 rounded-full">
                              {hotel.badge}
                            </span>
                            {/* Budget Fit Badge */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              budgetFit.status === 'within'
                                ? 'bg-emerald-100 text-emerald-800'
                                : budgetFit.status === 'near'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-purple-100 text-purple-900'
                            }`}>
                              {budgetFit.badge}
                            </span>
                          </div>

                          <h3 className="text-xl font-serif font-bold text-[#1c1c17] mb-1 group-hover:text-[#7c2e0c] transition-colors">
                            {hotel.name}
                          </h3>

                          <p className="text-xs text-[#55433c] mb-2 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#7c2e0c] shrink-0" />
                            <span>{hotel.location}</span>
                            <span className="text-gray-400">•</span>
                            <Star className="w-3.5 h-3.5 fill-[#fdc66b] text-[#fdc66b]" />
                            <span className="font-bold text-[#1c1c17]">{hotel.rating}</span>
                            <span className="text-gray-400 font-normal">({hotel.reviewCount} verified reviews)</span>
                          </p>

                          <p className="text-xs text-[#55433c] leading-relaxed line-clamp-2 mb-3">
                            {hotel.description}
                          </p>

                          {/* Nearby Itinerary Attractions Proximity Pill */}
                          {hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-[11px] text-[#55433c] bg-[#fcf9f1] p-2.5 rounded-xl border border-[#dcc1b8]/50">
                              {hotel.nearbyAttractions.slice(0, 2).map((att, idx) => (
                                <span key={idx} className="flex items-center gap-1 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#7c2e0c]"></span>
                                  <strong>{att.name}:</strong> {att.distance} ({att.driveTime})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer Tariff & CTA */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Tariff per night</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-bold text-[#7c2e0c]">
                                ₹{hotel.pricePerNight.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500 font-normal">/night</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block">
                              Total ₹{(hotel.pricePerNight * searchParams.nights).toLocaleString()} for {searchParams.nights} nights
                            </span>
                          </div>

                          <button
                            type="button"
                            className="px-6 py-2.5 bg-[#7c2e0c] hover:bg-[#9b4522] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md group-hover:shadow-lg cursor-pointer"
                          >
                            <span>View Suites</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#fcf9f1] rounded-3xl p-12 text-center border border-[#dcc1b8] space-y-4">
                <Building className="w-12 h-12 text-gray-400 mx-auto" />
                <h3 className="text-lg font-serif font-bold text-[#1c1c17]">
                  No Stays Found Matching Filters
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Try widening your price range or clearing the architecture category filter to explore all curated properties in {searchParams.destination}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    updateSearchField('category', 'all');
                    updateSearchField('maxPrice', 50000);
                    updateSearchField('minRating', 0);
                    updateSearchField('minSmartMatch', 0);
                  }}
                  className="px-6 py-2 bg-[#7c2e0c] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default HotelResults;
