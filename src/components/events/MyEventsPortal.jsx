import React, { useState } from 'react';
import { useEvents } from '../../context/EventsContext';

export function MyEventsPortal({ onBackToExplore }) {
  const { userBookings, setActiveStage, showToast } = useEvents();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [selectedQrPass, setSelectedQrPass] = useState(null);

  const upcomingBookings = userBookings.filter((b) => b.status !== 'cancelled');
  const pastBookings = []; // Can hold past trips

  return (
    <div className="w-full bg-[#fff8f5] text-[#1e1b19] font-['Plus_Jakarta_Sans',sans-serif] py-8 pb-16">
      {/* QR PASS MODAL */}
      {selectedQrPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1e1b19] to-[#2f312e] text-white max-w-sm w-full rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 relative border border-white/10">
            <button
              onClick={() => setSelectedQrPass(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-[#ffdcc3] tracking-widest">
                VIHARA PATRON ENTRY PASS
              </span>
              <h3 className="font-['Playfair_Display',serif] text-base font-bold text-white">
                {selectedQrPass.eventTitle}
              </h3>
              <span className="text-xs text-[#ffdcc3]">{selectedQrPass.tier} (×{selectedQrPass.quantity})</span>
            </div>

            {/* QR Card */}
            <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center">
              <div className="w-full h-full border-2 border-dashed border-[#1e1b19] rounded-xl flex flex-col items-center justify-center p-2 bg-[#faf2ee]">
                <span className="material-symbols-outlined text-5xl text-[#1e1b19]">qr_code_2</span>
                <span className="text-[10px] font-mono font-bold text-[#1e1b19] mt-1">
                  {selectedQrPass.bookingReference}
                </span>
              </div>
            </div>

            <div className="text-xs text-white/80 space-y-1">
              <div><strong>Lead Guest:</strong> {selectedQrPass.guestDetails?.fullName}</div>
              <div><strong>Time:</strong> {selectedQrPass.timeSlot}</div>
              <div><strong>Venue:</strong> {selectedQrPass.venue}</div>
            </div>

            <button
              onClick={() => {
                showToast('📄 Pass saved to device');
                setSelectedQrPass(null);
              }}
              className="w-full py-2.5 bg-[#c2410c] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#9b2f00]"
            >
              Save Pass to Phone
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e7dfd5]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#c2410c] tracking-wider">
              Patron Reservations
            </span>
            <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#1e1b19]">
              My Reserved Cultural Experiences
            </h1>
            <p className="text-xs text-[#59413a] mt-0.5">
              Gate passes, itinerary time slots, and spatial coordinates for your confirmed events.
            </p>
          </div>

          <button
            onClick={() => setActiveStage('discovery')}
            className="px-4 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#9b2f00] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Explore More Events</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#e7dfd5] pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-2 px-3 border-b-2 transition-all ${
              activeTab === 'upcoming'
                ? 'border-[#c2410c] text-[#c2410c]'
                : 'border-transparent text-[#59413a] hover:text-[#1e1b19]'
            }`}
          >
            Upcoming Experiences ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-2 px-3 border-b-2 transition-all ${
              activeTab === 'past'
                ? 'border-[#c2410c] text-[#c2410c]'
                : 'border-transparent text-[#59413a] hover:text-[#1e1b19]'
            }`}
          >
            Past Gatherings (0)
          </button>
        </div>

        {/* Upcoming List */}
        {activeTab === 'upcoming' && (
          <div>
            {upcomingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#e7dfd5] shadow-sm flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-[#8d7168]">event_available</span>
                <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#1e1b19]">
                  No upcoming reservations yet
                </h3>
                <p className="text-xs text-[#59413a] max-w-sm">
                  Discover live Sufi mehfils, midnight culinary trails, and temple aartis near your upcoming destinations.
                </p>
                <button
                  onClick={() => setActiveStage('discovery')}
                  className="mt-2 px-4 py-2 bg-[#c2410c] text-white text-xs font-bold rounded-xl shadow"
                >
                  Explore Events Radar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-[#e7dfd5] flex flex-col justify-between gap-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex gap-3">
                          <img
                            src={booking.heroImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'}
                            alt={booking.eventTitle}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#e7dfd5]"
                          />
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-[#c2410c] tracking-wider">
                              {booking.city}
                            </span>
                            <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#1e1b19]">
                              {booking.eventTitle}
                            </h3>
                            <span className="text-xs text-[#59413a]">{booking.venue}</span>
                          </div>
                        </div>

                        <span className="bg-[#006a63]/10 text-[#006a63] text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                          Confirmed
                        </span>
                      </div>

                      <div className="bg-[#faf2ee] p-3 rounded-xl space-y-1 text-xs text-[#59413a]">
                        <div className="flex justify-between">
                          <span className="font-semibold text-[#1e1b19]">Date & Time:</span>
                          <span>{booking.date} • {booking.timeSlot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-[#1e1b19]">Tier & Guests:</span>
                          <span>{booking.tier} (×{booking.quantity})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-[#1e1b19]">Booking Ref:</span>
                          <span className="font-mono font-bold text-[#1e1b19]">{booking.bookingReference}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#f4ece8] text-xs">
                      <span className="font-bold text-[#1e1b19]">
                        ₹{booking.grandTotal?.toLocaleString('en-IN')}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedQrPass(booking)}
                          className="px-3 py-1.5 rounded-xl bg-[#faf2ee] hover:bg-[#eee7e3] text-xs font-bold text-[#1e1b19] flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
                          <span>View Pass</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Past Tab */}
        {activeTab === 'past' && (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#e7dfd5] text-xs text-[#59413a]">
            No past events recorded.
          </div>
        )}
      </div>
    </div>
  );
}

export default MyEventsPortal;
