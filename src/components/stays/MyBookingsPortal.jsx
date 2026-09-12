import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Building,
  BookmarkPlus,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  Heart,
  Star,
  Compass,
  RotateCcw
} from 'lucide-react';
import { useStays } from '../../context/StaysContext';
import { generateBookingVoucherPDFBlob } from '../../services/pdfService';
import { HOTELS_DATABASE } from '../../data/staysData';
import { AddToTripModal } from './AddToTripModal';

export function MyBookingsPortal() {
  const {
    userBookings,
    isLoadingBookings,
    handleCancelBooking,
    linkBookingToTrip,
    navigateToStage,
    selectHotelAndProceed,
    savedHotelIds,
    toggleSaveHotel,
    isHotelSaved
  } = useStays();

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'cancelled' | 'saved'
  const [selectedVoucherModal, setSelectedVoucherModal] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [addToTripBooking, setAddToTripBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [linkedToast, setLinkedToast] = useState('');

  // Filter bookings by status
  const upcomingBookings = userBookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed');
  const completedBookings = userBookings.filter((b) => b.status === 'completed');
  const cancelledBookings = userBookings.filter((b) => b.status === 'cancelled');
  const savedHotels = HOTELS_DATABASE.filter((h) => isHotelSaved(h.id));

  const displayedBookings =
    activeTab === 'upcoming'
      ? upcomingBookings
      : activeTab === 'completed'
      ? completedBookings
      : cancelledBookings;

  const handleDownloadPDF = async (booking) => {
    try {
      const pdfBlob = await generateBookingVoucherPDFBlob(booking);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VIHARA_Reservation_${booking.bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF voucher:', err);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setIsCancelling(true);
    try {
      await handleCancelBooking(cancelModalBooking.bookingId);
      setCancelModalBooking(null);
      setLinkedToast('Booking cancelled and refund processed.');
      setTimeout(() => setLinkedToast(''), 4000);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBookAgain = (hotelId) => {
    const target = HOTELS_DATABASE.find((h) => h.id === hotelId) || HOTELS_DATABASE[0];
    selectHotelAndProceed(target);
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {linkedToast && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-[#0d1c32] text-white border border-[#fdc66b] rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#fdc66b]" />
          <span>{linkedToast}</span>
        </div>
      )}

      {/* Add To Trip Selector Modal */}
      {addToTripBooking && (
        <AddToTripModal
          isOpen={!!addToTripBooking}
          onClose={() => setAddToTripBooking(null)}
          onTripLinked={() => {
            setLinkedToast(`Stay linked to trip!`);
            setTimeout(() => setLinkedToast(''), 4000);
          }}
          booking={addToTripBooking}
        />
      )}

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#dcc1b8]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#765100]">
            Reservations Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1c1c17] mt-0.5">
            My Stays, Bookings &amp; Saved Wishlist
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigateToStage('landing')}
          className="px-6 py-2.5 bg-[#7c2e0c] hover:bg-[#9b4522] text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Explore More Stays</span>
        </button>
      </div>

      {/* 2. Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#dcc1b8] pb-3 text-xs font-bold">
        {[
          { id: 'upcoming', label: `Upcoming Stays (${upcomingBookings.length})` },
          { id: 'completed', label: `Completed (${completedBookings.length})` },
          { id: 'cancelled', label: `Cancelled (${cancelledBookings.length})` },
          { id: 'saved', label: `Saved Wishlist (${savedHotels.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-5 rounded-full transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#7c2e0c] text-white shadow-sm font-bold'
                : 'bg-white border border-[#dcc1b8] text-[#55433c] hover:bg-[#f6f3eb]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Conditional Content: Saved Wishlist Tab */}
      {activeTab === 'saved' ? (
        savedHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-3xl border border-[#dcc1b8] overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={hotel.heroImage}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSaveHotel(hotel.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-[#fdc66b] hover:text-white transition-colors"
                      aria-label="Unsave"
                    >
                      <Heart size={16} className="fill-[#fdc66b]" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-[#1c1c17]/80 text-white px-2.5 py-0.5 rounded text-[10px] font-bold uppercase">
                      {hotel.city}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base text-[#1c1c17] truncate">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <Star size={13} className="fill-[#fdc66b] text-[#fdc66b]" />
                        <span>{hotel.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#55433c] line-clamp-2">
                      {hotel.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-100 mt-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Tariff from</span>
                    <span className="text-base font-bold text-[#7c2e0c]">
                      ₹{hotel.pricePerNight?.toLocaleString()}/night
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectHotelAndProceed(hotel)}
                    className="px-5 py-2 bg-[#7c2e0c] hover:bg-[#9b4522] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Book Stay
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#fcf9f1] rounded-3xl p-12 text-center border border-[#dcc1b8] space-y-4">
            <Heart className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-[#1c1c17]">
              No Saved Wishlist Stays
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Heart any luxury property while browsing results to save it directly to your itinerary wishlist.
            </p>
            <button
              type="button"
              onClick={() => navigateToStage('results')}
              className="px-6 py-2.5 bg-[#7c2e0c] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Browse Stays
            </button>
          </div>
        )
      ) : (
        /* Bookings List (Upcoming, Completed, Cancelled) */
        displayedBookings.length > 0 ? (
          <div className="space-y-4">
            {displayedBookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="bg-white rounded-3xl border border-[#dcc1b8] p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Hotel & Suite Info */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={booking.room?.image || booking.hotel?.heroImage}
                      alt={booking.hotel?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-[#fcf9f1] border border-[#dcc1b8] text-[#7c2e0c] px-2 py-0.5 rounded">
                        {booking.bookingId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : booking.status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {booking.status === 'confirmed' ? '✓ Confirmed' : booking.status}
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-[#1c1c17]">
                      {booking.hotel?.name}
                    </h3>

                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#7c2e0c]" />
                      <span>{booking.hotel?.location || booking.hotel?.city}</span>
                    </p>

                    <p className="text-xs text-[#765100] font-semibold">{booking.room?.name}</p>
                  </div>
                </div>

                {/* Schedule & Price Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs w-full lg:w-auto lg:border-l lg:border-[#dcc1b8] lg:pl-6">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">DATES</span>
                    <span className="font-bold text-[#1c1c17]">{booking.checkIn}</span>
                    <span className="text-[10px] text-gray-500 block">to {booking.checkOut}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">OCCUPANCY</span>
                    <span className="font-bold text-[#1c1c17]">{booking.guests} Guests</span>
                    <span className="text-[10px] text-gray-500 block">{booking.nights} Nights</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">TOTAL TARIFF</span>
                    <span className="font-bold text-[#7c2e0c] text-sm">
                      ₹{booking.pricing?.totalAmount?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-800 block font-semibold">Paid via {booking.payment?.method || 'UPI'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedVoucherModal(booking)}
                    className="flex-1 lg:flex-none px-4 py-2 rounded-full bg-[#fcf9f1] hover:bg-[#f6f3eb] border border-[#dcc1b8] text-xs font-bold text-[#1c1c17] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#7c2e0c]" />
                    <span>View Voucher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPDF(booking)}
                    className="flex-1 lg:flex-none px-4 py-2 rounded-full bg-white hover:bg-gray-50 border border-[#dcc1b8] text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>Download PDF</span>
                  </button>

                  {booking.status === 'confirmed' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setAddToTripBooking(booking)}
                        className="flex-1 lg:flex-none px-4 py-2 rounded-full bg-[#ffdbcf] hover:bg-[#ffcebe] text-xs font-bold text-[#7c2e0c] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5 text-[#7c2e0c]" />
                        <span>Sync to Trip</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCancelModalBooking(booking)}
                        className="flex-1 lg:flex-none px-4 py-1.5 text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBookAgain(booking.hotel?.id)}
                      className="flex-1 lg:flex-none px-4 py-2 rounded-full bg-[#7c2e0c] hover:bg-[#9b4522] text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Book Again</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#fcf9f1] rounded-3xl p-12 text-center border border-[#dcc1b8] space-y-4">
            <Building className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-[#1c1c17]">
              No {activeTab === 'upcoming' ? 'Upcoming' : activeTab === 'completed' ? 'Completed' : 'Cancelled'} Bookings
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Explore our curated heritage retreats and havelis across India to start your royal journey.
            </p>
            <button
              type="button"
              onClick={() => navigateToStage('landing')}
              className="px-6 py-2.5 bg-[#7c2e0c] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Find Stays
            </button>
          </div>
        )
      )}

      {/* 4. Voucher Modal Dialog */}
      {selectedVoucherModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedVoucherModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl border border-[#dcc1b8] shadow-2xl p-6 md:p-8 space-y-5 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="font-mono text-xs font-bold text-[#7c2e0c]">
                {selectedVoucherModal.bookingId}
              </span>
              <button
                onClick={() => setSelectedVoucherModal(null)}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#765100]">
                Official Sanctuary Reservation Voucher
              </span>
              <h3 className="text-xl font-serif font-bold text-[#1c1c17] mt-1">
                {selectedVoucherModal.hotel?.name}
              </h3>
              <p className="text-xs text-gray-500">{selectedVoucherModal.hotel?.location}</p>
            </div>

            <div className="p-4 bg-[#fcf9f1] rounded-2xl border border-[#dcc1b8] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Reserved Suite:</span>
                <span className="font-bold text-[#1c1c17]">{selectedVoucherModal.room?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dates:</span>
                <span className="font-bold text-[#1c1c17]">
                  {selectedVoucherModal.checkIn} – {selectedVoucherModal.checkOut} ({selectedVoucherModal.nights} Nights)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lead Guest:</span>
                <span className="font-bold text-[#1c1c17]">{selectedVoucherModal.guestDetails?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Paid:</span>
                <span className="font-bold text-[#7c2e0c]">₹{selectedVoucherModal.pricing?.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadPDF(selectedVoucherModal)}
              className="w-full py-3 bg-[#7c2e0c] hover:bg-[#9b4522] text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Voucher</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Cancellation Confirmation Dialog */}
      {cancelModalBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setCancelModalBooking(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-red-200 shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">Cancel Booking?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to cancel your stay at{' '}
                <strong>{cancelModalBooking.hotel?.name}</strong>?
              </p>
            </div>

            <div className="p-3 bg-red-50 rounded-xl text-[11px] text-red-800">
              {cancelModalBooking.room?.cancellationPolicy || 'Eligible for instant full refund of ₹' + cancelModalBooking.pricing?.totalAmount?.toLocaleString() + ' to source payment method.'}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="py-2.5 rounded-full border border-gray-200 font-bold text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookingsPortal;
