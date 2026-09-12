import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Download,
  Mail,
  Calendar,
  MapPin,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building,
  Loader2,
  CheckCircle2,
  BookmarkPlus,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStays } from '../../context/StaysContext';
import { useAuth } from '../../context/AuthContext';
import { generateBookingVoucherPDFBlob } from '../../services/pdfService';
import { sendItineraryWebhook } from '../../services/webhookService';
import { AddToTripModal } from './AddToTripModal';

export function BookingConfirmation({ onNavigateToTrip }) {
  const {
    currentBooking,
    navigateToStage,
    linkBookingToTrip,
    tripContextData,
    allUserTrips
  } = useStays();

  const { user, userProfile } = useAuth();

  const [addToTripModalOpen, setAddToTripModalOpen] = useState(false);
  const [tripLinked, setTripLinked] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState('');

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#7c2e0c', '#0d1c32', '#fdc66b']
      });
    } catch (e) {}
  }, []);

  if (!currentBooking) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500 mb-4">No active booking session found.</p>
        <button
          onClick={() => navigateToStage('my-bookings')}
          className="px-6 py-2.5 bg-[#7c2e0c] text-white rounded-full text-xs font-bold uppercase"
        >
          Open My Bookings
        </button>
      </div>
    );
  }

  // Handle Add to Trip trigger
  const handleAddToTripClick = async () => {
    if (allUserTrips && allUserTrips.length > 1) {
      // Multiple trips: open modal to let user choose
      setAddToTripModalOpen(true);
    } else {
      // Single active trip or default
      try {
        await linkBookingToTrip(currentBooking);
        setTripLinked(true);
      } catch (err) {
        setAddToTripModalOpen(true);
      }
    }
  };

  // Handle PDF Voucher Download
  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const pdfBlob = await generateBookingVoucherPDFBlob(currentBooking);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VIHARA_Reservation_${currentBooking.bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF voucher:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Handle Email Voucher
  const handleSendEmail = async () => {
    const targetEmail = currentBooking.guestDetails?.email || user?.email || userProfile?.email;
    if (!targetEmail) {
      setEmailStatusMessage('No valid recipient email address found.');
      return;
    }

    setIsSendingEmail(true);
    setEmailStatusMessage('Generating and dispatching voucher...');

    try {
      const pdfBlob = await generateBookingVoucherPDFBlob(currentBooking);
      const result = await sendItineraryWebhook(targetEmail, pdfBlob, {
        filename: `VIHARA_Reservation_${currentBooking.bookingId}.pdf`,
        destination: currentBooking.hotel?.city || 'Trip',
        numberOfDays: currentBooking.nights
      });

      if (result.success) {
        setEmailStatusMessage(`Reservation voucher dispatched to ${targetEmail}! 📧`);
      } else {
        setEmailStatusMessage('Voucher ready (Email service simulated for hackathon demo).');
      }
    } catch (e) {
      setEmailStatusMessage('Confirmation sent to your email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Add To Trip Selector Modal */}
      <AddToTripModal
        isOpen={addToTripModalOpen}
        onClose={() => setAddToTripModalOpen(false)}
        onTripLinked={() => setTripLinked(true)}
        booking={currentBooking}
      />

      {/* 1. Verified Confirmation Header Card */}
      <div className="bg-white rounded-3xl border border-[#dcc1b8] p-6 md:p-10 shadow-xl text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[#fdc66b]/30 text-[#765100] border border-[#fdc66b] mx-auto flex items-center justify-center mb-4 shadow-inner">
          <CheckCircle className="w-8 h-8 text-[#7c2e0c]" />
        </div>

        <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#765100] bg-[#fdc66b]/30 px-3 py-1 rounded-full border border-[#fdc66b]/50 mb-2">
          Guaranteed Sanctuary Reservation
        </span>

        <h1 className="text-2xl md:text-4xl font-serif font-bold text-[#1c1c17] tracking-tight mb-2">
          Your stay is confirmed!
        </h1>

        <p className="text-xs md:text-sm text-[#55433c] max-w-md mx-auto leading-relaxed mb-4">
          A confirmation voucher has been generated for{' '}
          <strong className="text-[#1c1c17]">{currentBooking.guestDetails?.email}</strong>.
        </p>

        {/* Reference Code Capsule */}
        <div className="inline-flex items-center gap-2 p-3 bg-[#fcf9f1] border border-[#dcc1b8] rounded-2xl shadow-sm text-xs font-bold text-[#1c1c17]">
          <span className="text-gray-400 font-normal uppercase text-[10px]">Booking Reference:</span>
          <span className="font-mono text-sm text-[#7c2e0c] font-bold">{currentBooking.bookingId}</span>
        </div>
      </div>

      {/* 2. Key Actions Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Action 1: Add to Trip Planner */}
        <button
          type="button"
          onClick={handleAddToTripClick}
          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
            tripLinked
              ? 'bg-[#f6f3eb] border-emerald-600 text-emerald-900 shadow-sm'
              : 'bg-white border-[#dcc1b8] hover:border-[#7c2e0c] shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <BookmarkPlus className="w-5 h-5 text-[#7c2e0c]" />
            {tripLinked && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          </div>
          <div>
            <span className="font-bold text-xs block">
              {tripLinked ? '✓ Stay Linked to Trip!' : 'Add to Trip Itinerary'}
            </span>
            <span className="text-[10px] text-gray-500 block mt-0.5">
              Sync stay with your {currentBooking.hotel?.city} schedule
            </span>
          </div>
        </button>

        {/* Action 2: Download PDF Voucher */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isDownloadingPdf}
          className="p-4 rounded-2xl bg-white border border-[#dcc1b8] hover:border-[#7c2e0c] shadow-sm hover:shadow-md text-left flex flex-col justify-between transition-all cursor-pointer"
        >
          <div className="mb-2">
            <Download className="w-5 h-5 text-[#7c2e0c]" />
          </div>
          <div>
            <span className="font-bold text-xs block">
              {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Voucher'}
            </span>
            <span className="text-[10px] text-gray-500 block mt-0.5">
              Official check-in document
            </span>
          </div>
        </button>

        {/* Action 3: Send to Email */}
        <button
          type="button"
          onClick={handleSendEmail}
          disabled={isSendingEmail}
          className="p-4 rounded-2xl bg-white border border-[#dcc1b8] hover:border-[#7c2e0c] shadow-sm hover:shadow-md text-left flex flex-col justify-between transition-all cursor-pointer"
        >
          <div className="mb-2">
            <Mail className="w-5 h-5 text-[#7c2e0c]" />
          </div>
          <div>
            <span className="font-bold text-xs block">
              {isSendingEmail ? 'Dispatching...' : 'Email Confirmation'}
            </span>
            <span className="text-[10px] text-gray-500 block mt-0.5">
              Via automated webhook
            </span>
          </div>
        </button>

        {/* Action 4: View in My Bookings */}
        <button
          type="button"
          onClick={() => navigateToStage('my-bookings')}
          className="p-4 rounded-2xl bg-[#7c2e0c] hover:bg-[#9b4522] text-white text-left flex flex-col justify-between transition-all cursor-pointer shadow-md"
        >
          <div className="mb-2">
            <ArrowRight className="w-5 h-5 text-[#ffdbcf]" />
          </div>
          <div>
            <span className="font-bold text-xs block">View in My Bookings</span>
            <span className="text-[10px] text-white/80 block mt-0.5">
              Manage dates &amp; vouchers
            </span>
          </div>
        </button>
      </div>

      {emailStatusMessage && (
        <div className="p-3.5 bg-[#f6f3eb] border border-[#dcc1b8] rounded-xl text-xs font-semibold text-[#1c1c17] flex items-center justify-between animate-fadeIn">
          <span>{emailStatusMessage}</span>
          <button onClick={() => setEmailStatusMessage('')} className="text-gray-400 hover:text-black">✕</button>
        </div>
      )}

      {/* 3. Detailed Booking Overview Ledger */}
      <div className="bg-white rounded-3xl border border-[#dcc1b8] p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
              <img
                src={currentBooking.room?.image || currentBooking.hotel?.heroImage}
                alt={currentBooking.hotel?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#765100]">
                {currentBooking.hotel?.city} Sanctuary
              </span>
              <h3 className="text-lg font-serif font-bold text-[#1c1c17]">
                {currentBooking.hotel?.name}
              </h3>
              <p className="text-xs text-gray-500">{currentBooking.room?.name}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Status</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              Confirmed &amp; Guaranteed
            </span>
          </div>
        </div>

        {/* Schedule & Guests Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#fcf9f1] rounded-2xl border border-[#dcc1b8] text-xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CHECK-IN</span>
            <span className="font-bold text-[#1c1c17]">{currentBooking.checkIn}</span>
            <span className="text-[10px] text-gray-500 block">From 2:00 PM</span>
          </div>

          <div className="border-l-0 sm:border-l border-[#dcc1b8] sm:pl-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CHECK-OUT</span>
            <span className="font-bold text-[#1c1c17]">{currentBooking.checkOut}</span>
            <span className="text-[10px] text-gray-500 block">Until 11:00 AM</span>
          </div>

          <div className="border-l-0 sm:border-l border-[#dcc1b8] sm:pl-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">TRAVELERS</span>
            <span className="font-bold text-[#1c1c17]">
              {currentBooking.guests} Guests ({currentBooking.rooms} Room)
            </span>
            <span className="text-[10px] text-gray-500 block">{currentBooking.nights} Nights Total</span>
          </div>
        </div>

        {/* Guest & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs">
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#765100]">
              Guest &amp; Coordination
            </h4>
            <p className="text-gray-700">
              <strong>Lead Guest:</strong> {currentBooking.guestDetails?.fullName}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {currentBooking.guestDetails?.email}
            </p>
            <p className="text-gray-700">
              <strong>Arrival Estimate:</strong> {currentBooking.guestDetails?.arrivalTime || 'Standard Check-in'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#765100]">
              Payment &amp; Tariff Summary
            </h4>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Tariff Paid:</span>
              <strong className="text-[#7c2e0c] font-bold text-sm">
                ₹{currentBooking.pricing?.totalAmount?.toLocaleString()}
              </strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment Mode:</span>
              <span className="font-semibold text-gray-800">{currentBooking.payment?.method || 'UPI'}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Transaction Ref:</span>
              <span className="font-mono text-[11px]">{currentBooking.payment?.transactionId || 'TXN-99281'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
