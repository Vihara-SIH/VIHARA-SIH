import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  Wallet,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStays } from '../../context/StaysContext';

export function SecurePayment() {
  const {
    selectedHotel,
    selectedRoom,
    guestDetails,
    searchParams,
    pricing,
    processMockPayment,
    isProcessingPayment,
    navigateToStage
  } = useStays();

  const [activePaymentTab, setActivePaymentTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallets'

  // Card form state
  const [cardDetails, setCardDetails] = useState({
    number: '4532 •••• •••• 8892',
    name: `${guestDetails?.firstName || 'RAHUL'} ${guestDetails?.lastName || 'SHARMA'}`.toUpperCase(),
    expiry: '09/28',
    cvv: '•••'
  });

  // UPI state
  const [upiId, setUpiId] = useState(`${(guestDetails?.firstName || 'traveler').toLowerCase()}@okhdfcbank`);

  const handlePay = async () => {
    await processMockPayment(activePaymentTab.toUpperCase());
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-12 relative">
      {/* Processing Overlay Simulation */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37] text-[#0d1c32] flex items-center justify-center mb-4 shadow-2xl animate-bounce">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Noto Serif, serif' }}>
            Authorizing Secure Bank Checkout
          </h3>
          <p className="text-xs text-gray-300 max-w-sm mb-6">
            Connecting with 256-bit bank vault encryption. Generating confirmed reservation voucher...
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Securing Booking Token...</span>
          </div>
        </div>
      )}

      {/* 1. Step Indicator */}
      <div className="bg-white rounded-2xl p-4 border border-[#dcc1b8]/50 shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigateToStage('guest')}
          className="text-xs font-bold text-gray-600 hover:text-[#b45309] flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Guest Details</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span className="text-[#b45309]">1. Room</span>
          <span>➔</span>
          <span className="text-[#b45309]">2. Guest Details</span>
          <span>➔</span>
          <span className="text-[#b45309] font-bold underline">3. Payment</span>
          <span>➔</span>
          <span>4. Confirmation</span>
        </div>

        <span className="text-xs font-bold text-[#765100] bg-[#fdc66b]/20 px-3 py-1 rounded-full">
          Step 3 of 4
        </span>
      </div>

      {/* 2. Main Two-Column Layout (Payment Methods vs Price Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payment Methods Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#dcc1b8]/60 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#765100]">
                Encrypted Checkout
              </span>
              <h1 className="text-2xl font-bold text-[#1c1c17] mt-1" style={{ fontFamily: 'Noto Serif, serif' }}>
                Select Payment Method
              </h1>
              <p className="text-xs text-[#55433c] mt-1">
                Safe simulated hackathon checkout. Real money will not be deducted.
              </p>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-gray-100 pb-4">
              {[
                { id: 'upi', label: 'UPI / QR', icon: QrCode },
                { id: 'card', label: 'Cards', icon: CreditCard },
                { id: 'netbanking', label: 'Net Banking', icon: Building },
                { id: 'wallets', label: 'Wallets', icon: Wallet }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activePaymentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePaymentTab(tab.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#b45309] text-white border-[#b45309] shadow-sm'
                        : 'bg-[#fcf9f1] border-[#dcc1b8]/50 text-gray-700 hover:bg-[#f6f3eb]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: UPI / Instant QR */}
            {activePaymentTab === 'upi' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-[#fcf9f1] rounded-2xl border border-[#dcc1b8]/40 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  {/* Mock QR Code */}
                  <div className="w-28 h-28 bg-white p-2 rounded-xl border border-gray-200 shadow-sm shrink-0 flex flex-col items-center justify-center">
                    <QrCode className="w-20 h-20 text-[#1c1c17]" />
                    <span className="text-[9px] font-bold text-[#b45309] uppercase">Scan to Pay</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1c1c17]">Scan QR via Any UPI App</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Google Pay, PhonePe, Paytm, BHIM, CRED, or your mobile banking app. Instant zero-fee settlement.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Google Pay', 'PhonePe', 'Paytm UPI', 'CRED'].map((app, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-700">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100]">
                    Or Enter UPI ID / VPA
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#dcc1b8] bg-[#fcf9f1] text-xs font-semibold text-[#1c1c17] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handlePay}
                      className="px-4 py-2.5 bg-[#b45309] text-white rounded-xl text-xs font-bold uppercase hover:bg-[#9b4522]"
                    >
                      Verify &amp; Pay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Credit / Debit Card */}
            {activePaymentTab === 'card' && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dcc1b8] bg-[#fcf9f1] text-xs font-semibold text-[#1c1c17] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#dcc1b8] bg-[#fcf9f1] text-xs font-semibold text-[#1c1c17] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#dcc1b8] bg-[#fcf9f1] text-xs font-semibold text-[#1c1c17] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100] mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dcc1b8] bg-[#fcf9f1] text-xs font-semibold text-[#1c1c17] outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Net Banking */}
            {activePaymentTab === 'netbanking' && (
              <div className="space-y-3 animate-fadeIn">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100]">
                  Select Direct Bank Gateway
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Other Banks'].map((bank, i) => (
                    <label key={i} className="p-3 bg-[#fcf9f1] border border-[#dcc1b8]/40 rounded-xl flex items-center gap-2 cursor-pointer hover:border-[#b45309]">
                      <input type="radio" name="bank" defaultChecked={i === 0} className="text-[#b45309]" />
                      <span className="font-semibold text-gray-800">{bank}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Digital Wallets */}
            {activePaymentTab === 'wallets' && (
              <div className="space-y-3 animate-fadeIn">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#765100]">
                  Available Wallets
                </label>
                <div className="space-y-2 text-xs">
                  {['Amazon Pay Balance', 'Paytm Wallet'].map((w, i) => (
                    <label key={i} className="p-3.5 bg-[#fcf9f1] border border-[#dcc1b8]/40 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#b45309]">
                      <div className="flex items-center gap-2">
                        <input type="radio" name="wallet" defaultChecked={i === 0} className="text-[#b45309]" />
                        <span className="font-semibold text-gray-800">{w}</span>
                      </div>
                      <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
                        Fast Linked
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Security Trust Badges Banner */}
            <div className="bg-[#f6f3eb] rounded-2xl p-4 border border-[#dcc1b8]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#55433c]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#b45309] shrink-0" />
                <div>
                  <strong className="block text-[#1c1c17]">Bank-Grade Vault Encryption</strong>
                  <span>PCI-DSS certified gateway with end-to-end tokenization.</span>
                </div>
              </div>
              <span className="text-[#765100] font-bold text-[11px] shrink-0">0% Transaction Surcharge</span>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessingPayment}
                className="w-full py-4 px-6 bg-[#b45309] hover:bg-[#9b4522] disabled:bg-gray-400 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#b45309]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Lock className="w-4 h-4" />
                <span>
                  PAY ₹{pricing.totalAmount.toLocaleString()} VIA {activePaymentTab.toUpperCase()}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-2">
                Clicking initiates secure checkout simulation. Instantly confirms reservation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Final Reservation Breakdown */}
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

            {/* Guest Summary Pill */}
            <div className="p-3 bg-[#fcf9f1] rounded-2xl border border-[#dcc1b8]/40 text-xs flex justify-between items-center">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">PRIMARY GUEST</span>
                <span className="font-bold text-[#1c1c17]">
                  {guestDetails.firstName} {guestDetails.lastName}
                </span>
              </div>
              <span className="text-gray-500">{guestDetails.email}</span>
            </div>

            {/* Price Ledger */}
            <div className="space-y-2 text-xs text-[#55433c]">
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
                  <span className="text-[10px] text-gray-500">Inclusive of all taxes</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#b45309]">
                    ₹{pricing.totalAmount.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">INR Net</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurePayment;
