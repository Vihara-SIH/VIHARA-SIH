import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Star,
  RefreshCw,
  Building,
  Castle,
  Waves,
  Trees,
  SlidersHorizontal
} from 'lucide-react';
import { useStays } from '../../context/StaysContext';
import { DESTINATIONS } from '../../data/destinations';
import { HOTELS_DATABASE } from '../../data/staysData';
import { SmartMatchBadge } from './SmartMatchBadge';

export function StaysLanding() {
  const {
    searchParams,
    updateSearchField,
    navigateToStage,
    selectHotelAndProceed,
    isTripSynced,
    syncWithActiveTrip,
    tripContextData
  } = useStays();

  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);

  // Popular destination quick cards
  const POPULAR_DESTINATIONS = [
    { name: 'Goa', state: 'Goa', count: '4 Curated Sanctuaries', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80', tag: 'Portuguese Havelis' },
    { name: 'Hyderabad', state: 'Telangana', count: '1 Royal Nizam Palace', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', tag: 'Nizam Grandeur' },
    { name: 'Jaipur', state: 'Rajasthan', count: '1 Rajput Palace', img: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80', tag: 'Maharaja Heritage' },
    { name: 'Udaipur', state: 'Rajasthan', count: '1 Lake Sanctuary', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', tag: 'Floating Palaces' },
    { name: 'Delhi', state: 'Delhi', count: '1 Colonial Art Deco Hotel', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', tag: 'Imperial Heritage' }
  ];

  const THEMES = [
    { id: 'heritage', title: 'Heritage Havelis', desc: 'Restored colonial manors with carved teakwood and inner courtyards.', icon: Building },
    { id: 'palace', title: 'Royal Palaces', desc: 'Authentic residences of Maharajas with royal banquets and liveried service.', icon: Castle },
    { id: 'coastal', title: 'Coastal Villas', desc: 'Private beach access, ocean balcãos, and fresh coastal seafood.', icon: Waves },
    { id: 'nature', title: 'Plantation & Tea Estates', desc: 'Misty mountain bungalows surrounded by lush spice gardens.', icon: Trees }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigateToStage('results');
  };

  const handleSelectQuickDest = (destName) => {
    updateSearchField('destination', destName);
    navigateToStage('results');
  };

  const handleSelectTheme = (categoryId) => {
    updateSearchField('category', categoryId);
    navigateToStage('results');
  };

  return (
    <div className="w-full space-y-12 animate-fadeIn pb-12">
      {/* 1. Trip Sync Notification Banner (If active trip exists) */}
      {tripContextData?.selectedDestinations?.length > 0 && (
        <div className="bg-[#fdc66b]/20 border border-[#fdc66b]/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#b45309] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#ffdeae]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1c1c17] uppercase tracking-wider">
                Trip Planner Synchronization Active
              </h4>
              <p className="text-xs text-[#55433c] mt-0.5">
                Stays search is automatically prefilled with your active trip: <strong className="text-[#1c1c17]">{searchParams.destination}</strong> ({searchParams.nights} Nights, {searchParams.guests} Travelers).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={syncWithActiveTrip}
            className="px-4 py-2 rounded-xl bg-white border border-[#dcc1b8] text-xs font-bold text-[#765100] uppercase hover:bg-[#f6f3eb] transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#b45309]" />
            <span>Re-Sync Trip Data</span>
          </button>
        </div>
      )}

      {/* 2. Hero Search Canvas */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#f6f3eb] to-[#fcf9f1] border border-[#dcc1b8]/60 p-6 md:p-12 shadow-sm overflow-hidden text-center">
        {/* Decorative Background Motifs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#ffdeae]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#ffdbcf]/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto space-y-3 mb-8">
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#765100] bg-[#fdc66b]/30 px-3 py-1 rounded-full border border-[#fdc66b]/40">
            VIHARA STAYS • Royal Hospitality Collection
          </span>
          <h1
            className="text-3xl md:text-5xl font-bold text-[#1c1c17] tracking-tight"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Find your perfect stay
          </h1>
          <p className="text-sm md:text-base text-[#55433c] max-w-xl mx-auto leading-relaxed">
            Handpicked heritage retreats, luxury havelis, and boutique stays intelligently matched to your cultural itinerary and travel routes.
          </p>
        </div>

        {/* 3. Luxury Sandstone Search Widget */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border border-[#dcc1b8]/70 max-w-5xl mx-auto text-left grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
        >
          {/* Destination Field */}
          <div className="md:col-span-4 p-3 rounded-xl bg-[#fcf9f1] border border-[#dcc1b8]/40 hover:border-[#b45309]/50 transition-colors">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#765100] mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#b45309]" />
              WHERE TO?
            </label>
            <select
              value={searchParams.destination}
              onChange={(e) => updateSearchField('destination', e.target.value)}
              className="w-full bg-transparent font-bold text-sm text-[#1c1c17] outline-none cursor-pointer"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}, {d.state}
                </option>
              ))}
            </select>
          </div>

          {/* Check-In & Check-Out Dates */}
          <div className="md:col-span-4 grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#fcf9f1] border border-[#dcc1b8]/40 hover:border-[#b45309]/50 transition-colors">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#765100] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#b45309]" />
                CHECK-IN
              </label>
              <input
                type="date"
                value={searchParams.checkIn}
                onChange={(e) => updateSearchField('checkIn', e.target.value)}
                className="w-full bg-transparent font-semibold text-xs text-[#1c1c17] outline-none"
              />
            </div>
            <div className="border-l border-[#dcc1b8]/50 pl-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#765100] mb-1">
                CHECK-OUT
              </label>
              <input
                type="date"
                value={searchParams.checkOut}
                min={searchParams.checkIn}
                onChange={(e) => updateSearchField('checkOut', e.target.value)}
                className="w-full bg-transparent font-semibold text-xs text-[#1c1c17] outline-none"
              />
            </div>
          </div>

          {/* Guests & Rooms */}
          <div className="md:col-span-2 p-3 rounded-xl bg-[#fcf9f1] border border-[#dcc1b8]/40 hover:border-[#b45309]/50 transition-colors relative">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#765100] mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#b45309]" />
              GUESTS & ROOMS
            </label>
            <button
              type="button"
              onClick={() => setGuestDropdownOpen(!guestDropdownOpen)}
              className="w-full text-left font-bold text-xs text-[#1c1c17] flex justify-between items-center"
            >
              <span>{searchParams.guests} Guests, {searchParams.rooms} Room</span>
            </button>

            {guestDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-[#dcc1b8] p-4 z-30 text-xs space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Guests</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSearchField('guests', Math.max(1, searchParams.guests - 1))}
                      className="w-6 h-6 rounded-full bg-gray-100 font-bold flex items-center justify-center hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="font-bold w-4 text-center">{searchParams.guests}</span>
                    <button
                      type="button"
                      onClick={() => updateSearchField('guests', searchParams.guests + 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 font-bold flex items-center justify-center hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-700">Rooms</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSearchField('rooms', Math.max(1, searchParams.rooms - 1))}
                      className="w-6 h-6 rounded-full bg-gray-100 font-bold flex items-center justify-center hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="font-bold w-4 text-center">{searchParams.rooms}</span>
                    <button
                      type="button"
                      onClick={() => updateSearchField('rooms', searchParams.rooms + 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 font-bold flex items-center justify-center hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setGuestDropdownOpen(false)}
                  className="w-full py-1.5 bg-[#b45309] text-white rounded-lg text-xs font-bold uppercase"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Submit Search CTA Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-[#b45309] hover:bg-[#9b4522] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#b45309]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Search className="w-4 h-4 text-[#ffdeae] group-hover:scale-110 transition-transform" />
              <span>SEARCH STAYS</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Popular Heritage Destinations Showcase */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#765100]">
              Heritage Gateways
            </span>
            <h2 className="text-2xl font-bold text-[#1c1c17]" style={{ fontFamily: 'Noto Serif, serif' }}>
              Explore popular destinations
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigateToStage('results')}
            className="text-xs font-bold text-[#b45309] hover:underline flex items-center gap-1"
          >
            <span>View all stays</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {POPULAR_DESTINATIONS.map((dest, i) => (
            <div
              key={i}
              onClick={() => handleSelectQuickDest(dest.name)}
              className="group relative h-72 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-[#dcc1b8]/40"
            >
              <img
                src={dest.img}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#765100]">
                {dest.tag}
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Noto Serif, serif' }}>
                  {dest.name}
                </h3>
                <p className="text-xs text-white/80 mt-0.5">{dest.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Curated Themes ("Stay Your Way") */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#765100]">
            Bespoke Architecture
          </span>
          <h2 className="text-2xl font-bold text-[#1c1c17]" style={{ fontFamily: 'Noto Serif, serif' }}>
            Stay your way
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {THEMES.map((theme) => {
            const Icon = theme.icon;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className="p-6 rounded-2xl bg-white border border-[#dcc1b8]/50 hover:border-[#b45309] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#ffdeae]/40 text-[#765100] flex items-center justify-center mb-4 group-hover:bg-[#b45309] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1c1c17] mb-2" style={{ fontFamily: 'Noto Serif, serif' }}>
                    {theme.title}
                  </h3>
                  <p className="text-xs text-[#55433c] leading-relaxed">
                    {theme.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#b45309]">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. VIHARA Smart Match Guarantee Banner */}
      <div className="bg-[#1c1c17] text-[#fcf9f1] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#fdc66b] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#fdc66b]" />
            VIHARA Smart Match Intelligence
          </span>
          <h2
            className="text-2xl md:text-4xl font-bold text-white leading-tight"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            VIHARA understands your entire journey — not just your hotel room.
          </h2>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-2xl">
            Unlike generic booking websites, VIHARA calculates proximity to your planned monuments, evaluates your daily transit routes, and stays within your allocated budget to recommend sanctuaries that elevate your entire trip.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="font-bold text-[#fdc66b] block mb-1">📍 Attraction Proximity</span>
              <p className="text-gray-300 text-[11px]">Direct distance to your scheduled daily sightseeing spots.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="font-bold text-[#fdc66b] block mb-1">💰 Budget Fit</span>
              <p className="text-gray-300 text-[11px]">Optimal room rate aligned with your total trip allowance.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="font-bold text-[#fdc66b] block mb-1">🚗 Route Efficiency</span>
              <p className="text-gray-300 text-[11px]">Minimizes intra-city driving hours across your itinerary.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Featured Residencies (Goa Retreat & Royal Haveli Previews) */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#765100]">
            Sanctuary Highlights
          </span>
          <h2 className="text-2xl font-bold text-[#1c1c17]" style={{ fontFamily: 'Noto Serif, serif' }}>
            Featured Residencies
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOTELS_DATABASE.slice(0, 3).map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => selectHotelAndProceed(hotel)}
              className="bg-white rounded-3xl border border-[#dcc1b8]/50 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#b45309] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  <img
                    src={hotel.heroImage}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <SmartMatchBadge score={hotel.baseSmartMatchScore} breakdown={hotel.matchBreakdown} />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#1c1c17] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                    <span>{hotel.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#765100] block mb-1">
                    {hotel.categoryLabel} • {hotel.city}
                  </span>
                  <h3 className="text-lg font-bold text-[#1c1c17] mb-2 group-hover:text-[#b45309] transition-colors" style={{ fontFamily: 'Noto Serif, serif' }}>
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-[#55433c] leading-relaxed mb-4 line-clamp-2">
                    {hotel.description}
                  </p>

                  <div className="space-y-1 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    {hotel.nearbyAttractions?.[0] && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-[#b45309]" />
                        <span>{hotel.nearbyAttractions[0].distance} from {hotel.nearbyAttractions[0].name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#fcf9f1] border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Starting from</span>
                  <span className="text-base font-bold text-[#1c1c17]">
                    ₹{hotel.pricePerNight.toLocaleString()}
                    <span className="text-xs font-normal text-gray-500"> / night</span>
                  </span>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 bg-[#b45309] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#9b4522] transition-colors"
                >
                  View Rooms
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StaysLanding;
