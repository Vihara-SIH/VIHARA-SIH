import React, { useState } from 'react';
import {
  Bookmark,
  MapPin,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  Trash2,
  ExternalLink,
  Download,
  Share2,
  Sparkles,
  Hotel,
  Tag,
  ArrowLeft,
  Navigation
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { useStays } from '../../context/StaysContext';
import { useEvents } from '../../context/EventsContext';

export function SavedItemsPortal({ onBack, onNavigateToTrip, onNavigateToStays, onNavigateToEvents }) {
  const trip = useTrip();
  const stays = useStays();
  const events = useEvents();
  const { userProfile, user } = useAuth();

  const [activeTab, setActiveTab] = useState('places'); // 'places' | 'trips' | 'stays' | 'events'
  const [searchQuery, setSearchQuery] = useState('');

  const savedPlaces = trip.savedItems?.filter(i => i.itemType === 'place' || !i.itemType) || [];
  const savedTrips = stays?.allUserTrips || [];
  const bookedStays = stays?.userBookings || [];
  const bookedEvents = events?.userBookings || [];

  const filteredPlaces = savedPlaces.filter(p =>
    !searchQuery.trim() ||
    (p.name || p.placeName || p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-4 space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button
            onClick={onBack}
            className="mb-3 px-3.5 py-1.5 rounded-full bg-[#fafaf5] border border-gray-200 text-[11px] font-bold text-[#0d1c32] uppercase hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#735c00]" />
            Back to Home
          </button>

          <span className="text-xs uppercase tracking-widest text-[#735c00] font-bold">
            Personal Heritage Sanctuary • Saved Dossier
          </span>

          <h1
            className="text-3xl md:text-4xl font-bold text-[#0d1c32] tracking-tight mt-1"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Saved Items &amp; Travel Portfolio
          </h1>
          <p className="text-xs text-gray-600 mt-1 max-w-xl">
            Access all your saved heritage destinations, custom multi-day trip itineraries, luxury hotel reservations, and cultural event passes.
          </p>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 bg-[#fafaf5] p-3 rounded-2xl border border-gray-200">
          <div className="w-10 h-10 rounded-full bg-[#0d1c32] text-white flex items-center justify-center font-bold text-sm">
            {userProfile?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0d1c32]">{userProfile?.name || 'Traveler'}</h4>
            <p className="text-[11px] text-gray-500">{user?.email || 'Logged in traveler'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 text-sm font-semibold">
          {[
            { id: 'places', label: `Saved Places (${savedPlaces.length})` },
            { id: 'trips', label: `My Trips (${savedTrips.length})` },
            { id: 'stays', label: `Booked Stays (${bookedStays.length})` },
            { id: 'events', label: `Cultural Passes (${bookedEvents.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#D4AF37] text-[#735c00] font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB 1: SAVED PLACES */}
      {activeTab === 'places' && (
        <div className="space-y-6 animate-fadeIn">
          {filteredPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map((spot) => (
                <div
                  key={spot.id || spot.placeId || spot.name}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:border-[#D4AF37] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full bg-gray-100">
                      <img
                        src={spot.image || 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80'}
                        alt={spot.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#0d1c32]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                        {spot.category || 'Heritage'}
                      </div>
                      <button
                        onClick={() => trip.toggleSaveItem(spot, 'place')}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow hover:bg-white transition-all cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-bold text-[#0d1c32]">{spot.name || spot.title}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2">{spot.desc || spot.description}</p>
                      <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span>📍 {spot.city}, {spot.state}</span>
                        <span className="font-bold text-[#735c00]">🎟️ {spot.price || spot.entryInfo || 'Free'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#fafaf5] border-t border-gray-100 flex items-center justify-between">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${spot.coordinates?.lat || 17.385},${spot.coordinates?.lng || 78.4867}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-gray-700 hover:text-[#735c00] flex items-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#735c00]" />
                      <span>Directions</span>
                    </a>

                    <button
                      onClick={() => {
                        trip.addActivityToTrip(1, spot, 'Afternoon');
                        if (onNavigateToTrip) onNavigateToTrip();
                      }}
                      className="px-3 py-1.5 bg-[#0d1c32] hover:bg-black text-white rounded-xl text-[11px] font-bold uppercase transition-all"
                    >
                      Add to Trip →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3 max-w-md mx-auto">
              <Bookmark className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-[#0d1c32]">No Saved Places Yet</h3>
              <p className="text-xs text-gray-500">
                Explore the Near Me Explorer or Trip Planning to bookmark verified monuments, sanctums, and secret spots.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY TRIPS */}
      {activeTab === 'trips' && (
        <div className="space-y-6 animate-fadeIn">
          {savedTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedTrips.map((t) => {
                const destName = Array.isArray(t.destinations) && t.destinations.length > 0
                  ? (t.destinations[0].destinationName || t.destinations[0].name || 'India')
                  : (t.originLocation || 'Trip Odyssey');

                return (
                  <div
                    key={t.tripId || t.id}
                    className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:border-[#D4AF37] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#735c00] bg-[#fed65b]/20 px-2.5 py-0.5 rounded-full">
                          {t.numberOfDays || 4} Days Itinerary
                        </span>
                        <span className="text-xs font-bold text-gray-500 font-mono">
                          {t.tripId || t.id}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#0d1c32]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        The {destName} Odyssey
                      </h3>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#735c00]" />
                          {t.startDate || 'Upcoming'} – {t.endDate || ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#735c00]" />
                          {t.numberOfTravelers || 2} Travelers
                        </span>
                        <span className="font-bold text-[#0d1c32]">
                          Budget: ₹{(t.budget?.allocatedBudget || t.userSelectedBudget || 35000).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          trip.loadTripIntoSession(t);
                          if (onNavigateToTrip) onNavigateToTrip();
                        }}
                        className="px-5 py-2.5 bg-[#0d1c32] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Open &amp; Edit Itinerary</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3 max-w-md mx-auto">
              <Compass className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-[#0d1c32]">No Saved Trips Found</h3>
              <p className="text-xs text-gray-500">
                Create a customized trip with our AI Trip Planner to save multi-day routes and budgets.
              </p>
              <button
                onClick={onNavigateToTrip}
                className="px-5 py-2.5 bg-[#0d1c32] text-white rounded-xl text-xs font-bold uppercase"
              >
                Plan a New Trip
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOOKED STAYS */}
      {activeTab === 'stays' && (
        <div className="space-y-6 animate-fadeIn">
          {bookedStays.length > 0 ? (
            <div className="space-y-4">
              {bookedStays.map((booking) => (
                <div
                  key={booking.bookingId}
                  className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={booking.room?.image || booking.hotel?.heroImage}
                      alt={booking.hotel?.name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#b45309]">{booking.bookingId}</span>
                        <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">
                          ✓ {booking.status?.toUpperCase() || 'CONFIRMED'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0d1c32] mt-0.5">{booking.hotel?.name}</h3>
                      <p className="text-xs text-gray-500">{booking.room?.name} • {booking.nights} Nights ({booking.checkIn} to {booking.checkOut})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block uppercase">Total Tariff</span>
                      <span className="text-base font-bold text-[#0d1c32]">₹{booking.pricing?.totalAmount?.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={onNavigateToStays}
                      className="px-4 py-2 bg-[#0d1c32] text-white rounded-xl text-xs font-bold uppercase"
                    >
                      Manage Stay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3 max-w-md mx-auto">
              <Hotel className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-[#0d1c32]">No Hotel Bookings Yet</h3>
              <p className="text-xs text-gray-500">
                Discover matched luxury palace retreats and havelis aligned with your active trip.
              </p>
              <button
                onClick={onNavigateToStays}
                className="px-5 py-2.5 bg-[#b45309] text-white rounded-xl text-xs font-bold uppercase"
              >
                Browse Stays &amp; Travel
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CULTURAL PASSES */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-fadeIn">
          {bookedEvents.length > 0 ? (
            <div className="space-y-4">
              {bookedEvents.map((evBooking) => (
                <div
                  key={evBooking.bookingReference || evBooking.id}
                  className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={evBooking.heroImage}
                      alt={evBooking.eventTitle}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#735c00]">{evBooking.bookingReference}</span>
                        <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">
                          ✓ RESERVED
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0d1c32] mt-0.5">{evBooking.eventTitle}</h3>
                      <p className="text-xs text-gray-500">{evBooking.venue} • {evBooking.date} • Pass: {evBooking.tier} (x{evBooking.quantity})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block uppercase">Pass Amount</span>
                      <span className="text-base font-bold text-[#0d1c32]">₹{(evBooking.grandTotal || evBooking.baseTotal || 2400).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={onNavigateToEvents}
                      className="px-4 py-2 bg-[#0d1c32] text-white rounded-xl text-xs font-bold uppercase"
                    >
                      View Passes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3 max-w-md mx-auto">
              <Sparkles className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-[#0d1c32]">No Event Passes Reserved</h3>
              <p className="text-xs text-gray-500">
                Experience Sufi baithaks, classical mehfils, and temple festivals across India.
              </p>
              <button
                onClick={onNavigateToEvents}
                className="px-5 py-2.5 bg-[#0d1c32] text-white rounded-xl text-xs font-bold uppercase"
              >
                Explore Cultural Events
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SavedItemsPortal;
