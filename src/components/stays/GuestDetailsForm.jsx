import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowRight,
  Lock,
  User,
  Mail,
  Phone,
  Clock,
  Gift,
  Building2
} from 'lucide-react';
import { useStays } from '../../context/StaysContext';

export function GuestDetailsForm() {
  const {
    selectedHotel,
    selectedRoom,
    guestDetails,
    updateGuestInfo,
    searchParams,
    pricing,
    navigateToStage
  } = useStays();

  const [formErrors, setFormErrors] = useState({});

  const handlePreferenceToggle = (pref) => {
    const current = guestDetails.specialRequests || [];
    if (current.includes(pref)) {
      updateGuestInfo({ specialRequests: current.filter((p) => p !== pref) });
    } else {
      updateGuestInfo({ specialRequests: [...current, pref] });
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();

    const errors = {};
    if (!guestDetails.firstName?.trim()) errors.firstName = 'Please enter your first name.';
    if (!guestDetails.lastName?.trim()) errors.lastName = 'Please enter your last name.';
    if (!guestDetails.email?.trim() || !guestDetails.email.includes('@')) {
      errors.email = 'Please provide a valid email address for confirmation.';
    }
    if (!guestDetails.phone?.trim() || guestDetails.phone.length < 8) {
      errors.phone = 'Please provide a valid phone number for concierge coordination.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    navigateToStage('payment');
  };

  const PREFERENCES_LIST = [
    'Quiet room away from elevators',
    'High floor with scenic view',
    'King bed preference',
    'Early check-in request (subject to availability)',
    'Late check-out request',
    'Eco-friendly linen preference'
  ];

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-12">
      {/* 1. Step Indicator Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#dcc1b8]/50 shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigateToStage('details')}
          className="text-xs font-bold text-gray-600 hover:text-[#b45309] flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Hotel Details</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span className="text-[#b45309]">1. Room Selected</span>
          <span>➔</span>
          <span className="text-[#b45309] font-bold underline">2. Guest Details</span>
          <span>➔</span>
          <span>3. Payment</span>
          <span>➔</span>
          <span>4. Confirmation</span>
        </div>

        <span className="text-xs font-bold text-[#765100] bg-[#fdc66b]/20 px-3 py-1 rounded-full">
          Step 2 of 4
        </span>
      </div>

      {/* 2. Main Two-Column Layout (Guest Form vs Booking Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#dcc1b8]/60 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#765100]">
                Guest Information
              </span>
              <h1 className="text-2xl font-bold text-[#1c1c17] mt-1" style={{ fontFamily: 'Noto Serif, serif' }}>
                Primary Guest Details
              </h1>
              <p className="text-xs text-[#55433c] mt-1">
                Your booking confirmation voucher and updates will be dispatched to these details.
              </p>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul"
                      value={guestDetails.firstName}
                      onChange={(e) => updateGuestInfo({ firstName: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium outline-none focus:border-[#b45309] ${
                        formErrors.firstName ? 'border-red-500 bg-red-50/20' : 'border-[#dcc1b8] bg-[#fcf9f1]'
                      }`}
                    />
                  </div>
                  {formErrors.firstName && <span className="text-[10px] text-red-600 mt-1 block">{formErrors.firstName}</span>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma"
                    value={guestDetails.lastName}
                    onChange={(e) => updateGuestInfo({ lastName: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium outline-none focus:border-[#b45309] ${
                      formErrors.lastName ? 'border-red-500 bg-red-50/20' : 'border-[#dcc1b8] bg-[#fcf9f1]'
                    }`}
                  />
                  {formErrors.lastName && <span className="text-[10px] text-red-600 mt-1 block">{formErrors.lastName}</span>}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-1">
                    Email Address * (For Confirmation)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      placeholder="traveler@example.com"
                      value={guestDetails.email}
                      onChange={(e) => updateGuestInfo({ email: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium outline-none focus:border-[#b45309] ${
                        formErrors.email ? 'border-red-500 bg-red-50/20' : 'border-[#dcc1b8] bg-[#fcf9f1]'
                      }`}
                    />
                  </div>
                  {formErrors.email && <span className="text-[10px] text-red-600 mt-1 block">{formErrors.email}</span>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-1">
                    Phone Number * (With Country Code)
                  </label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 rounded-xl border border-[#dcc1b8] bg-[#f6f3eb] text-xs font-bold text-gray-700 flex items-center">
                      +91
                    </span>
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={guestDetails.phone}
                        onChange={(e) => updateGuestInfo({ phone: e.target.value })}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium outline-none focus:border-[#b45309] ${
                          formErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-[#dcc1b8] bg-[#fcf9f1]'
                        }`}
                      />
                    </div>
                  </div>
                  {formErrors.phone && <span className="text-[10px] text-red-600 mt-1 block">{formErrors.phone}</span>}
                </div>
              </div>

              {/* Bespoke Preferences Checkboxes */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-3">
                  Bespoke Stay Preferences (Optional)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PREFERENCES_LIST.map((pref, i) => {
                    const checked = guestDetails.specialRequests?.includes(pref);
                    return (
                      <label
                        key={i}
                        onClick={() => handlePreferenceToggle(pref)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                          checked
                            ? 'bg-[#fdc66b]/20 border-[#b45309] font-semibold text-[#1c1c17]'
                            : 'bg-[#fcf9f1] border-[#dcc1b8]/40 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded text-[#b45309] focus:ring-[#b45309]"
                        />
                        <span>{pref}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Arrival Time & Celebration */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#b45309]" />
                    Estimated Arrival Time
                  </label>
                  <select
                    value={guestDetails.arrivalTime}
                    onChange={(e) => updateGuestInfo({ arrivalTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dcc1b8] bg-[#fcf9f1] text-xs font-semibold text-[#1c1c17] outline-none"
                  >
                    <option value="12:00 PM - 02:00 PM">12:00 PM – 02:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM – 04:00 PM (Standard Check-in)</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM – 06:00 PM</option>
                    <option value="06:00 PM - 09:00 PM">06:00 PM – 09:00 PM (Evening)</option>
                    <option value="After 09:00 PM">Late Night (After 09:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-1 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-[#b45309]" />
                    Special Occasion (Optional)
                  </label>
                  <select
                    value={guestDetails.celebrationType}
                    onChange={(e) => updateGuestInfo({ celebrationType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dcc1b8] bg-[#fcf9f1] text-xs font-semibold text-[#1c1c17] outline-none"
                  >
                    <option value="None">Standard Holiday Journey</option>
                    <option value="Anniversary">Anniversary Celebration</option>
                    <option value="Honeymoon">Honeymoon Romantic Escape</option>
                    <option value="Birthday">Birthday Celebration</option>
                    <option value="Family Gathering">Family Heritage Reunion</option>
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-[#b45309] hover:bg-[#9b4522] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#b45309]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Lock className="w-4 h-4 text-[#ffdeae]" />
                  <span>CONTINUE TO SECURE PAYMENT</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Dynamic Booking Breakdown */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-white rounded-3xl border border-[#dcc1b8]/70 p-6 shadow-xl space-y-5">
            {/* Suite Header Preview */}
            <div className="relative h-44 rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={selectedRoom?.image || selectedHotel.heroImage}
                alt={selectedRoom?.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#fdc66b]/90 text-[#765100] px-2 py-0.5 rounded">
                  {selectedHotel.name}
                </span>
                <h4 className="text-base font-bold mt-1" style={{ fontFamily: 'Noto Serif, serif' }}>
                  {selectedRoom?.name || 'Deluxe Heritage Suite'}
                </h4>
              </div>
            </div>

            {/* Schedule Strip */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-[#fcf9f1] rounded-2xl border border-[#dcc1b8]/40 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CHECK-IN</span>
                <span className="font-bold text-[#1c1c17]">{searchParams.checkIn}</span>
                <span className="text-[10px] text-gray-500 block">From 2:00 PM</span>
              </div>
              <div className="border-l border-gray-200 pl-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CHECK-OUT</span>
                <span className="font-bold text-[#1c1c17]">{searchParams.checkOut}</span>
                <span className="text-[10px] text-gray-500 block">Until 11:00 AM</span>
              </div>
            </div>

            {/* Price Ledger */}
            <div className="space-y-2.5 text-xs text-[#55433c]">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#765100]">
                Itemized Tariff Breakdown
              </h5>

              <div className="flex justify-between">
                <span>Nightly Tariff (₹{pricing.nightlyTariff.toLocaleString()} × {pricing.nights} nights)</span>
                <span className="font-semibold text-[#1c1c17]">₹{pricing.baseTariff.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Heritage Conservation Cess (8%)</span>
                <span className="font-semibold text-[#1c1c17]">₹{pricing.heritageCess.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Goods &amp; Services Tax (18% GST)</span>
                <span className="font-semibold text-[#1c1c17]">₹{pricing.gst.toLocaleString()}</span>
              </div>

              {pricing.memberDiscount > 0 && (
                <div className="flex justify-between text-[#b45309] font-medium">
                  <span>VIHARA Member Privilege Benefit</span>
                  <span>-₹{pricing.memberDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                    Total Amount Payable
                  </span>
                  <span className="text-[10px] text-gray-500">Includes all palace taxes &amp; fees</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#b45309]">
                    ₹{pricing.totalAmount.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">INR Net</span>
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="p-3 bg-[#fcf9f1] rounded-xl border border-[#dcc1b8]/40 text-xs text-[#55433c] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#b45309] shrink-0" />
              <span>PCI-DSS encrypted checkout with instant booking tokenization.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestDetailsForm;
