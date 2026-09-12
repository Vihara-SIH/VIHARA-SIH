import React, { useState } from 'react';
import { useEvents } from '../../context/EventsContext';
import { useTrip } from '../../context/TripContext';

export function EventTicketSelection({ onBack }) {
  const {
    selectedEvent,
    selectedTierId,
    setSelectedTierId,
    ticketQuantity,
    setTicketQuantity,
    guestDetails,
    setGuestDetails,
    proceedToPayment,
    showToast
  } = useEvents();

  const tripContext = useTrip();
  const activeTrip = tripContext?.tripData || null;

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  if (!selectedEvent) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl">
        <p className="text-sm text-[#59413a]">No event selected.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#c2410c] text-white rounded-xl text-xs font-bold">
          Back to Events
        </button>
      </div>
    );
  }

  const tiers = selectedEvent.tiers || [
    { id: 'tier_standard', name: 'Standard Pass', price: selectedEvent.priceStarting || 1200, desc: 'Full experience access', badge: 'Standard' }
  ];

  const currentTier = tiers.find((t) => t.id === selectedTierId) || tiers[0];

  const baseTotal = currentTier.price * ticketQuantity;
  const gstAndCess = Math.round(baseTotal * 0.05);
  const grandTotal = Math.max(0, baseTotal + gstAndCess - promoDiscount);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'VIHARA100' || promoCode.trim().toUpperCase() === 'HERITAGE') {
      setPromoDiscount(200);
      setPromoApplied(true);
      showToast('🎉 Promo code applied: ₹200 Cultural Patron Discount!');
    } else {
      showToast('Invalid promo code. Try "VIHARA100"');
    }
  };

  const handleGuestChange = (field, val) => {
    setGuestDetails((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="w-full bg-[#fff8f5] text-[#1e1b19] font-['Plus_Jakarta_Sans',sans-serif] pb-16">
      {/* Stepper Header */}
      <section className="w-full bg-[#faf2ee] py-4 border-b border-[#e7dfd5]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#59413a] hover:text-[#c2410c] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Event Details</span>
          </button>

          {/* Stepper pills */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#c2410c]">
              <span className="w-6 h-6 rounded-full bg-[#c2410c] text-white flex items-center justify-center text-xs">1</span>
              <span>Pass Tiers</span>
            </div>
            <div className="w-6 h-[2px] bg-[#c2410c]"></div>
            <div className="flex items-center gap-1.5 font-bold text-[#c2410c]">
              <span className="w-6 h-6 rounded-full bg-[#c2410c] text-white flex items-center justify-center text-xs">2</span>
              <span>Guests</span>
            </div>
            <div className="w-6 h-[2px] bg-[#c2410c]"></div>
            <div className="flex items-center gap-1.5 font-bold text-[#1e1b19]">
              <span className="w-6 h-6 rounded-full bg-[#1e1b19] text-white flex items-center justify-center text-xs">3</span>
              <span>Review</span>
            </div>
            <div className="w-6 h-[2px] bg-[#e7dfd5]"></div>
            <div className="flex items-center gap-1.5 text-[#8d7168]">
              <span className="w-6 h-6 rounded-full bg-[#eee7e3] text-[#59413a] flex items-center justify-center text-xs">4</span>
              <span className="hidden sm:inline">Checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-8 w-full flex flex-col gap-6">
        {/* Compact Event Summary Header */}
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-[#e7dfd5] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm bg-[#eee7e3]">
              <img
                src={selectedEvent.heroImage}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#ffdbd0] text-[#390c00] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {selectedEvent.genreLabel}
                </span>
                <span className="bg-[#006a63]/10 text-[#006a63] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span> Heritage Verified
                </span>
              </div>
              <h1 className="font-['Playfair_Display',serif] text-lg sm:text-xl font-bold text-[#1e1b19] truncate">
                {selectedEvent.title}
              </h1>
              <div className="flex flex-wrap items-center text-xs text-[#59413a] gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#c2410c] text-[16px]">calendar_today</span>
                  <span>{selectedEvent.date} • {selectedEvent.timeSlot}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#c2410c] text-[16px]">location_on</span>
                  <span className="truncate">{selectedEvent.venue}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 bg-[#faf2ee] px-4 py-2 rounded-xl flex items-center gap-3 border border-[#e7dfd5]">
            <span className="material-symbols-outlined text-[#006a63] text-[20px]">event_repeat</span>
            <div className="flex flex-col text-xs">
              <span className="text-[10px] uppercase font-bold text-[#006a63] tracking-wider">Itinerary Linked</span>
              <span className="font-bold text-[#1e1b19]">Synchronized to Day 2 Evening Slot</span>
            </div>
          </div>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Step 1 Tiers, Step 2 Guests, Step 3 Itinerary */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* STEP 1: CHOOSE YOUR PASS TIER */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e7dfd5] flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-[#c2410c] uppercase tracking-wider">Step 1 of 3</span>
                <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#1e1b19]">
                  1. Select Experience Tier
                </h2>
                <p className="text-xs text-[#59413a]">
                  Seating is arranged on Persian carpets and cushioned bolsters in authentic heritage fashion.
                </p>
              </div>

              {/* Tier Cards Rail */}
              <div className="flex flex-col gap-3">
                {tiers.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#fff8f5] border-[#c2410c] shadow-md ring-1 ring-[#c2410c]'
                          : 'bg-[#faf2ee] border-[#e7dfd5] hover:border-[#8d7168]'
                      }`}
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#1e1b19]">{tier.name}</h3>
                          <span className="bg-[#ffdcc3] text-[#2f1500] text-[10px] font-bold px-2 py-0.5 rounded">
                            {tier.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#59413a] leading-relaxed">{tier.desc}</p>
                        <div className="text-sm font-bold text-[#c2410c] mt-1">
                          ₹{tier.price.toLocaleString('en-IN')}{' '}
                          <span className="text-xs text-[#8d7168] font-normal">/ guest</span>
                        </div>
                      </div>

                      {/* Quantity Selector for active tier */}
                      {isSelected ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-[#e7dfd5]"
                        >
                          <button
                            type="button"
                            onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                            className="w-8 h-8 rounded-lg bg-[#faf2ee] hover:bg-[#eee7e3] text-[#1e1b19] flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold w-6 text-center text-[#1e1b19]">{ticketQuantity}</span>
                          <button
                            type="button"
                            onClick={() => setTicketQuantity(ticketQuantity + 1)}
                            className="w-8 h-8 rounded-lg bg-[#c2410c] text-white hover:bg-[#9b2f00] flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedTierId(tier.id)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#e1bfb5] text-xs font-bold text-[#1e1b19] hover:bg-[#faf2ee]"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: GUEST DETAILS */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e7dfd5] flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-[#c2410c] uppercase tracking-wider">Step 2 of 3</span>
                <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#1e1b19]">
                  2. Guest & Attendee Details
                </h2>
                <p className="text-xs text-[#59413a]">
                  Digital gate passes with holographic QR codes will be synchronized with your account and delivered via WhatsApp & Email.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1e1b19]">Full Legal Name (Lead Traveler)</label>
                  <input
                    type="text"
                    value={guestDetails.fullName}
                    onChange={(e) => handleGuestChange('fullName', e.target.value)}
                    className="h-11 px-3 rounded-xl bg-[#faf2ee] border border-[#e7dfd5] text-xs text-[#1e1b19] focus:outline-none focus:ring-2 focus:ring-[#c2410c]/30 font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1e1b19]">Email Address (For QR Delivery)</label>
                  <input
                    type="email"
                    value={guestDetails.email}
                    onChange={(e) => handleGuestChange('email', e.target.value)}
                    className="h-11 px-3 rounded-xl bg-[#faf2ee] border border-[#e7dfd5] text-xs text-[#1e1b19] focus:outline-none focus:ring-2 focus:ring-[#c2410c]/30 font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1e1b19]">WhatsApp Number (Gate Pass Delivery)</label>
                  <input
                    type="tel"
                    value={guestDetails.phone}
                    onChange={(e) => handleGuestChange('phone', e.target.value)}
                    className="h-11 px-3 rounded-xl bg-[#faf2ee] border border-[#e7dfd5] text-xs text-[#1e1b19] focus:outline-none focus:ring-2 focus:ring-[#c2410c]/30 font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1e1b19]">Seating & Tea Preference</label>
                  <select
                    value={guestDetails.specialRequests}
                    onChange={(e) => handleGuestChange('specialRequests', e.target.value)}
                    className="h-11 px-3 rounded-xl bg-[#faf2ee] border border-[#e7dfd5] text-xs text-[#1e1b19] focus:outline-none focus:ring-2 focus:ring-[#c2410c]/30 font-medium"
                  >
                    <option value="Traditional Irani Chai & Osmania Biscuits">Traditional Irani Chai & Osmania Biscuits</option>
                    <option value="Cardamom & Rose Sherbet (Caffeine-free)">Cardamom & Rose Sherbet (Caffeine-free)</option>
                    <option value="Sugar-free Sulaimani Spiced Tea">Sugar-free Sulaimani Spiced Tea</option>
                    <option value="Traditional front cushion seating preferred">Front Cushion Seating Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STEP 3: ITINERARY ALIGNMENT */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e7dfd5] flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-[#c2410c] uppercase tracking-wider">Step 3 of 3</span>
                <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#1e1b19]">
                  3. Day 2 Itinerary Alignment
                </h2>
              </div>

              <div className="p-4 bg-[#faf2ee] rounded-xl flex items-center justify-between gap-4 border border-[#e7dfd5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#006a63] text-white flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">sync</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#1e1b19]">
                      Lock as Day 2 Evening Cultural Anchor
                    </span>
                    <span className="text-[11px] text-[#59413a]">
                      Automatically adds this event into your active Trip Itinerary timeline & PDF exporter.
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={guestDetails.syncToTrip}
                  onChange={(e) => handleGuestChange('syncToTrip', e.target.checked)}
                  className="w-5 h-5 text-[#c2410c] accent-[#c2410c] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Order Summary Card */}
          <div className="lg:col-span-4 sticky top-24 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#e7dfd5] flex flex-col gap-4">
              <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#1e1b19] pb-3 border-b border-[#f4ece8]">
                Booking Summary
              </h3>

              {/* Selected Tier Breakdown */}
              <div className="space-y-2 text-xs text-[#59413a]">
                <div className="flex justify-between">
                  <span>{currentTier.name} (×{ticketQuantity})</span>
                  <span className="font-bold text-[#1e1b19]">₹{baseTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span>GST & Heritage Preservation Fund (5%)</span>
                  <span>₹{gstAndCess}</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-[#006a63] font-bold">
                    <span>Patron Privilege Discount</span>
                    <span>-₹{promoDiscount}</span>
                  </div>
                )}
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo Code (e.g. VIHARA100)"
                  className="flex-1 h-9 px-3 rounded-lg bg-[#faf2ee] border border-[#e7dfd5] text-xs uppercase text-[#1e1b19] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#1e1b19] hover:bg-black text-white text-xs font-bold rounded-lg"
                >
                  Apply
                </button>
              </form>

              {/* Grand Total */}
              <div className="pt-3 border-t border-[#f4ece8] flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8d7168] block">Total Amount</span>
                  <span className="text-2xl font-bold text-[#1e1b19]">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] text-[#006a63] font-bold">All Taxes Included</span>
              </div>

              {/* CTA */}
              <button
                onClick={proceedToPayment}
                className="w-full py-3.5 bg-[#c2410c] hover:bg-[#9b2f00] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Proceed to Secure Checkout</span>
              </button>

              <div className="text-center text-[10px] text-[#8d7168]">
                🔒 256-Bit Encrypted Sanctuary Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventTicketSelection;
