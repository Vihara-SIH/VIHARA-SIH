import React, { useState } from 'react';
import { useEvents } from '../../context/EventsContext';
import { useTrip } from '../../context/TripContext';

export function EventPaymentAndConfirmation({ onBack, onNavigateToTrip }) {
  const {
    selectedEvent,
    selectedTierId,
    ticketQuantity,
    guestDetails,
    activeBooking,
    completeBooking,
    setActiveStage,
    showToast
  } = useEvents();

  const tripContext = useTrip();

  // Payment tab: 'upi' | 'card' | 'netbanking'
  const [paymentTab, setPaymentTab] = useState('upi');
  const [upiId, setUpiId] = useState('aditya.krishna@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8891');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [agreedProtocols, setAgreedProtocols] = useState(true);

  if (!selectedEvent && !activeBooking) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl">
        <p className="text-sm text-[#59413a]">No booking in progress.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#c2410c] text-white rounded-xl text-xs font-bold">
          Back to Events
        </button>
      </div>
    );
  }

  const tiers = selectedEvent?.tiers || [];
  const currentTier = tiers.find((t) => t.id === selectedTierId) || tiers[0] || {
    name: 'Standard Pass',
    price: selectedEvent?.priceStarting || 1200
  };

  const baseTotal = currentTier.price * ticketQuantity;
  const gstAndCess = Math.round(baseTotal * 0.05);
  const grandTotal = baseTotal + gstAndCess;

  const handlePay = async () => {
    if (!agreedProtocols) {
      showToast('Please accept the sanctuary etiquette protocols.');
      return;
    }

    setIsProcessing(true);
    // Simulate realistic bank gateway roundtrip
    setTimeout(async () => {
      const confirmedBooking = await completeBooking(paymentTab.toUpperCase());
      setIsProcessing(false);
    }, 1200);
  };

  // If already confirmed or just confirmed
  if (activeBooking) {
    return (
      <div className="w-full bg-[#fff8f5] text-[#1e1b19] font-['Plus_Jakarta_Sans',sans-serif] py-8">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-8 flex flex-col gap-6">
          {/* Top Confirmation Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#e7dfd5] flex flex-col gap-6">
            {/* Success Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f4ece8]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#006a63] text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#006a63] tracking-wider">
                    Reservation Formally Confirmed
                  </span>
                  <h1 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold text-[#1e1b19]">
                    Experience Formally Confirmed!
                  </h1>
                  <span className="text-xs text-[#8d7168] font-mono">
                    Booking Ref: <strong className="text-[#1e1b19]">{activeBooking.bookingReference}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => {
                    showToast('📄 Digital entry pass downloaded as PDF');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#faf2ee] hover:bg-[#eee7e3] text-xs font-bold text-[#1e1b19] flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download Pass</span>
                </button>
                <button
                  onClick={() => setActiveStage('my-events')}
                  className="px-3.5 py-2 rounded-xl bg-[#c2410c] hover:bg-[#9b2f00] text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">event_available</span>
                  <span>My Events</span>
                </button>
              </div>
            </div>

            {/* Middle Section: Digital QR Gate Pass + Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* QR Gate Pass Card */}
              <div className="md:col-span-5 bg-gradient-to-br from-[#1e1b19] to-[#33302d] text-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center gap-4 border border-white/10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#c2410c]/30 rounded-full blur-2xl"></div>

                <div className="w-full flex justify-between items-center text-[10px] uppercase tracking-wider text-[#ffdcc3]">
                  <span>VIHARA PATRON PASS</span>
                  <span>{activeBooking.tier}</span>
                </div>

                {/* Simulated Holographic QR Pass */}
                <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
                  <div className="w-full h-full border-2 border-dashed border-[#1e1b19] rounded-xl flex flex-col items-center justify-center p-2 bg-[#faf2ee]">
                    <span className="material-symbols-outlined text-4xl text-[#1e1b19]">qr_code_2</span>
                    <span className="text-[9px] font-mono text-[#1e1b19] font-bold mt-1">
                      {activeBooking.bookingReference}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{activeBooking.guestDetails?.fullName}</span>
                  <span className="text-[11px] text-[#ffdcc3]">
                    {activeBooking.quantity} Seat(s) Reserved
                  </span>
                </div>

                <span className="text-[9px] text-white/60 tracking-wider">
                  SCAN AT GATE FOR ACCESS
                </span>
              </div>

              {/* Event Details Breakdown */}
              <div className="md:col-span-7 flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-[#c2410c] uppercase tracking-wider">
                    {activeBooking.city} Heritage Experience
                  </span>
                  <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#1e1b19]">
                    {activeBooking.eventTitle}
                  </h3>
                  <span className="text-xs text-[#59413a]">{activeBooking.eventSubtitle}</span>
                </div>

                <div className="bg-[#faf2ee] p-4 rounded-xl space-y-2 text-xs border border-[#e7dfd5]">
                  <div className="flex items-center gap-2 text-[#1e1b19]">
                    <span className="material-symbols-outlined text-[#c2410c] text-[16px]">calendar_today</span>
                    <span className="font-bold">{activeBooking.date} • {activeBooking.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#59413a]">
                    <span className="material-symbols-outlined text-[#c2410c] text-[16px]">location_on</span>
                    <span>{activeBooking.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#006a63]">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span className="font-semibold">Paid via {activeBooking.paymentMethod} • ₹{activeBooking.grandTotal?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Ecosystem Sync Notice */}
                <div className="p-3 bg-[#006a63]/10 text-[#006a63] rounded-xl flex items-center gap-3 text-xs">
                  <span className="material-symbols-outlined text-[20px]">sync</span>
                  <span>
                    <strong>Ecosystem Synchronized:</strong> This event is now locked into your active Trip Itinerary.
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#f4ece8]">
              <button
                onClick={() => setActiveStage('discovery')}
                className="px-4 py-2.5 rounded-xl bg-[#faf2ee] hover:bg-[#eee7e3] text-xs font-bold text-[#1e1b19] transition-colors"
              >
                ← Explore More Events
              </button>

              <div className="flex items-center gap-2">
                {onNavigateToTrip && (
                  <button
                    onClick={() => onNavigateToTrip('trip-overview')}
                    className="px-4 py-2.5 rounded-xl bg-[#1e1b19] hover:bg-black text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">map</span>
                    <span>View in Trip Itinerary</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveStage('my-events')}
                  className="px-4 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#9b2f00] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                  <span>Go to My Events</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAYMENT CHECKOUT VIEW
  return (
    <div className="w-full bg-[#fff8f5] text-[#1e1b19] font-['Plus_Jakarta_Sans',sans-serif] py-8 pb-16">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="w-full bg-[#faf2ee] rounded-2xl p-5 shadow-sm border border-[#e7dfd5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#c2410c] tracking-wider">
              Step 4 of 4 • Final Allocation
            </span>
            <h1 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold text-[#1e1b19]">
              Secure Sanctuary Payment
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#e7dfd5] text-xs text-[#006a63] font-bold">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>256-Bit Bank Grade Encryption</span>
          </div>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Payment Method Form */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e7dfd5] flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f4ece8]">
                <h2 className="font-['Playfair_Display',serif] text-lg font-bold text-[#1e1b19]">
                  Select Payment Method
                </h2>
                <span className="text-[10px] font-bold text-[#006a63] bg-[#006a63]/10 px-2 py-0.5 rounded-full">
                  Zero Surcharge Gateway
                </span>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-[#faf2ee] p-1.5 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentTab('upi')}
                  className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentTab === 'upi' ? 'bg-white shadow-sm text-[#c2410c]' : 'text-[#59413a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                  <span>UPI Instant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('card')}
                  className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentTab === 'card' ? 'bg-white shadow-sm text-[#c2410c]' : 'text-[#59413a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">credit_card</span>
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('netbanking')}
                  className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentTab === 'netbanking' ? 'bg-white shadow-sm text-[#c2410c]' : 'text-[#59413a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">account_balance</span>
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Tab 1: UPI */}
              {paymentTab === 'upi' && (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-[#1e1b19]">Enter UPI Virtual Payment Address (VPA)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@bank"
                        className="flex-1 h-11 px-3 rounded-xl bg-[#faf2ee] border border-[#e7dfd5] text-xs text-[#1e1b19] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => showToast('✓ UPI ID Verified: Aditya Sharma')}
                        className="px-4 bg-[#1e1b19] text-white font-bold rounded-xl text-xs"
                      >
                        Verify
                      </button>
                    </div>
                  </div>

                  {/* App Chips */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#8d7168]">
                      Or instant pay with registered UPI App:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm', 'CRED Pay'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => showToast(`Triggered ${app} request for ₹${grandTotal}`)}
                          className="p-2.5 rounded-xl bg-[#faf2ee] hover:bg-[#eee7e3] border border-[#e7dfd5] flex items-center gap-2 text-xs font-bold text-[#1e1b19]"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#c2410c] text-white flex items-center justify-center text-[10px]">
                            ⚡
                          </span>
                          <span>{app}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Cards */}
              {paymentTab === 'card' && (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#1e1b19]">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="h-11 px-3 rounded-xl bg-[#faf2ee] border border-[#e7dfd5] text-xs text-[#1e1b19]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#1e1b19]">Expiry Date</label>
                      <input
                        type="text"
                        defaultValue="09 / 29"
                        className="h-11 px-3 rounded-xl bg-[#faf2ee] border border-[#e7dfd5] text-xs text-[#1e1b19]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#1e1b19]">CVV</label>
                      <input
                        type="password"
                        defaultValue="•••"
                        className="h-11 px-3 rounded-xl bg-[#faf2ee] border border-[#e7dfd5] text-xs text-[#1e1b19]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Net Banking */}
              {paymentTab === 'netbanking' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        selectedBank === bank
                          ? 'bg-[#fff8f5] border-[#c2410c] text-[#c2410c] shadow-sm'
                          : 'bg-[#faf2ee] border-[#e7dfd5] text-[#1e1b19]'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              )}

              {/* Protocol Acceptance */}
              <label className="flex items-start gap-2.5 pt-2 cursor-pointer text-xs text-[#59413a]">
                <input
                  type="checkbox"
                  checked={agreedProtocols}
                  onChange={(e) => setAgreedProtocols(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#c2410c] accent-[#c2410c] rounded"
                />
                <span>
                  I agree to the heritage sanctuary protocols (respecting acoustic ambiance, shoes removed at carpet perimeter) and VIHARA's 24-Hour Free Cancellation Policy.
                </span>
              </label>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-4 bg-[#c2410c] hover:bg-[#9b2f00] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Securing Your Sanctuary Cushions...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>Pay ₹{grandTotal.toLocaleString('en-IN')} • Authorize Reservation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Order Summary Card */}
          <div className="lg:col-span-5 sticky top-24 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e7dfd5] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f4ece8]">
                <span className="text-[10px] uppercase font-bold text-[#c2410c] tracking-wider">
                  Reservation Details
                </span>
                <span className="text-xs font-mono font-bold text-[#8d7168]">
                  CODE: VH-{selectedEvent.id.slice(4, 10).toUpperCase()}
                </span>
              </div>

              <div className="flex gap-3 items-start">
                <img
                  src={selectedEvent.heroImage}
                  alt={selectedEvent.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#e7dfd5]"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#006a63] uppercase">
                    {selectedEvent.genreLabel}
                  </span>
                  <h3 className="font-['Playfair_Display',serif] text-sm font-bold text-[#1e1b19] line-clamp-1">
                    {selectedEvent.title}
                  </h3>
                  <span className="text-xs text-[#59413a]">{selectedEvent.date}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f4ece8] space-y-2 text-xs text-[#59413a]">
                <div className="flex justify-between">
                  <span>Pass Tier</span>
                  <span className="font-bold text-[#1e1b19]">{currentTier.name} (×{ticketQuantity})</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span>₹{baseTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heritage Fund & GST (5%)</span>
                  <span>₹{gstAndCess}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1e1b19] pt-2 border-t border-[#f4ece8]">
                  <span>Total Amount</span>
                  <span className="text-[#c2410c]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventPaymentAndConfirmation;
