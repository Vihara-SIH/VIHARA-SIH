import React, { useState } from 'react';
import { useEvents } from '../../context/EventsContext';
import { useTrip } from '../../context/TripContext';

export function EventDetails({ onBack }) {
  const { selectedEvent, proceedToTickets, showToast } = useEvents();
  const tripContext = useTrip();
  const activeTrip = tripContext?.tripData || null;

  const [isSaved, setIsSaved] = useState(false);
  const [showWeightBreakdown, setShowWeightBreakdown] = useState(false);

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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Experience link copied to clipboard!');
    } else {
      showToast('🔗 Link ready to share.');
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    showToast(isSaved ? 'Removed from trip wishlist' : '❤️ Saved to your Trip Wishlist!');
  };

  return (
    <div className="w-full bg-[#fff8f5] text-[#1e1b19] font-['Plus_Jakarta_Sans',sans-serif] pb-24">
      {/* Breadcrumb & Context Tag */}
      <section className="w-full bg-[#fff8f5] py-3 border-b border-[#e7dfd5]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[#59413a]">
            <button onClick={onBack} className="hover:text-[#c2410c] transition-colors flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Search</span>
            </button>
            <span className="text-[#8d7168]/50">/</span>
            <span>Events</span>
            <span className="text-[#8d7168]/50">/</span>
            <span>{selectedEvent.city}</span>
            <span className="text-[#8d7168]/50">/</span>
            <span className="text-[#c2410c] font-bold truncate max-w-[200px]">{selectedEvent.title}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#faf2ee] px-3 py-1 rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-[#006a63]"></span>
            <span className="text-[#1e1b19] font-bold">{selectedEvent.city} Cultural Journey</span>
            <span className="text-[#8d7168]">·</span>
            <span className="text-[#59413a]">Day 2 Evening Anchor</span>
          </div>
        </div>
      </section>

      {/* Top Title & Hero Bento */}
      <section className="w-full bg-[#fff8f5] py-6">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8">
          {/* Top Title & Social Actions */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="bg-[#c2410c]/10 text-[#c2410c] px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  {selectedEvent.genreLabel} • {selectedEvent.subtitle}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#006a63] bg-[#006a63]/10 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">verified</span> Heritage Verified
                </span>
              </div>
              <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e1b19] tracking-tight leading-tight">
                {selectedEvent.title}
              </h1>
              <p className="text-[#59413a] text-sm sm:text-base leading-relaxed">
                {selectedEvent.about}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleToggleSave}
                className="flex items-center gap-2 bg-white border border-[#e1bfb5] px-4 py-2 rounded-xl text-[#1e1b19] hover:bg-[#faf2ee] transition-all shadow-sm text-xs font-bold"
              >
                <span className="material-symbols-outlined text-[#c2410c] text-[18px]">
                  {isSaved ? 'favorite' : 'favorite_border'}
                </span>
                <span>{isSaved ? 'Saved' : 'Save Wishlist'}</span>
              </button>

              <button
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center bg-white border border-[#e1bfb5] rounded-xl text-[#1e1b19] hover:bg-[#faf2ee] transition-colors shadow-sm"
                title="Share Event"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
              </button>
            </div>
          </div>

          {/* Hero Gallery Bento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-[380px] sm:h-[460px] rounded-2xl overflow-hidden shadow-md border border-[#e7dfd5]">
            <div className="md:col-span-8 relative h-full group overflow-hidden bg-[#eee7e3]">
              <img
                src={selectedEvent.heroImage}
                alt={selectedEvent.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#ffdcc3] bg-[#c2410c]/80 px-2 py-0.5 rounded">
                    {selectedEvent.venue}
                  </span>
                  <p className="font-['Playfair_Display',serif] text-lg font-bold text-white mt-1">
                    Live Acoustic Baithak under Starlight
                  </p>
                </div>
                <span className="bg-white/90 text-[#1e1b19] text-xs px-3 py-1 rounded-full backdrop-blur-md hidden sm:flex items-center gap-1 shadow font-bold">
                  <span className="material-symbols-outlined text-[15px] text-[#c2410c]">audiotrack</span> Natural Acoustics
                </span>
              </div>
            </div>

            <div className="md:col-span-4 grid grid-rows-2 gap-3 h-full hidden md:grid">
              {(selectedEvent.gallery || [selectedEvent.heroImage]).slice(0, 2).map((imgUrl, i) => (
                <div key={i} className="relative overflow-hidden group bg-[#eee7e3]">
                  <img
                    src={imgUrl}
                    alt="Gallery item"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metadata Strip */}
          <div className="mt-4 bg-[#faf2ee] rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm border border-[#e7dfd5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c2410c]/10 flex items-center justify-center text-[#c2410c] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8d7168] uppercase font-bold tracking-wider block">Date & Time</span>
                <span className="text-xs sm:text-sm font-bold text-[#1e1b19] block">{selectedEvent.date}</span>
                <span className="text-xs text-[#59413a]">{selectedEvent.timeSlot}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c2410c]/10 flex items-center justify-center text-[#c2410c] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8d7168] uppercase font-bold tracking-wider block">Sanctuary Venue</span>
                <span className="text-xs sm:text-sm font-bold text-[#1e1b19] block truncate">{selectedEvent.venue}</span>
                <span className="text-xs text-[#59413a]">{selectedEvent.city}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#006a63]/10 flex items-center justify-center text-[#006a63] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">hotel_class</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8d7168] uppercase font-bold tracking-wider block">Connoisseur Rating</span>
                <span className="text-xs sm:text-sm font-bold text-[#1e1b19] flex items-center gap-1">
                  {selectedEvent.rating} <span className="text-[#a65900] text-xs">★★★★★</span>
                </span>
                <span className="text-xs text-[#59413a]">{selectedEvent.reviewsCount} verified reviews</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#a65900]/10 flex items-center justify-center text-[#a65900] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8d7168] uppercase font-bold tracking-wider block">Access Pass</span>
                <span className="text-xs sm:text-sm font-bold text-[#1e1b19] block">
                  ₹{selectedEvent.priceStarting} <span className="text-xs font-normal text-[#8d7168]">/ guest</span>
                </span>
                <span className="text-xs text-[#006a63] font-semibold">Includes Dastarkhan & Tea</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 96% VEHARA MATCH INTELLIGENCE MODULE */}
      <section className="w-full bg-[#faf2ee] py-8">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e7dfd5]">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#f4ece8]">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#c2410c] text-white flex flex-col items-center justify-center flex-shrink-0 shadow-md">
                  <span className="font-['Playfair_Display',serif] text-2xl font-bold leading-none">
                    {selectedEvent.itineraryScore || 98}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold mt-0.5">Match</span>
                </div>
                <div>
                  <span className="bg-[#c2410c]/10 text-[#c2410c] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
                    Calibrated for Your {selectedEvent.city} Journey
                  </span>
                  <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#1e1b19]">
                    Why this gathering is quintessential for your stay
                  </h2>
                  <p className="text-xs text-[#59413a]">
                    Synthesized by VIHARA Intelligence against your cultural preferences, route logistics, and scheduled pacing.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWeightBreakdown(!showWeightBreakdown)}
                className="flex items-center gap-1.5 text-[#c2410c] text-xs font-bold bg-[#faf2ee] px-4 py-2 rounded-xl hover:bg-[#f4ece8] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">insights</span>
                <span>{showWeightBreakdown ? 'Hide Factor Breakdown' : 'How we calculated this match'}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {showWeightBreakdown ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>

            {/* 5 Calibrated Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-5 text-xs">
              <div className="bg-[#faf2ee] rounded-xl p-3 flex flex-col justify-between border border-[#e7dfd5]">
                <div className="flex items-center gap-1.5 font-bold text-[#1e1b19] mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#006a63]/10 text-[#006a63] flex items-center justify-center text-xs">✓</span>
                  <span>Interest Affinity</span>
                </div>
                <p className="text-[#59413a] text-[11px]">Matches your tagged {selectedEvent.genreLabel} profile.</p>
                <span className="text-[#006a63] font-bold mt-2">+30 pts</span>
              </div>

              <div className="bg-[#faf2ee] rounded-xl p-3 flex flex-col justify-between border border-[#e7dfd5]">
                <div className="flex items-center gap-1.5 font-bold text-[#1e1b19] mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#006a63]/10 text-[#006a63] flex items-center justify-center text-xs">✓</span>
                  <span>Schedule Gap</span>
                </div>
                <p className="text-[#59413a] text-[11px]">Fills your open evening slot post sightseeing.</p>
                <span className="text-[#006a63] font-bold mt-2">+25 pts</span>
              </div>

              <div className="bg-[#faf2ee] rounded-xl p-3 flex flex-col justify-between border border-[#e7dfd5]">
                <div className="flex items-center gap-1.5 font-bold text-[#1e1b19] mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#006a63]/10 text-[#006a63] flex items-center justify-center text-xs">✓</span>
                  <span>Route Geometry</span>
                </div>
                <p className="text-[#59413a] text-[11px]">Only {selectedEvent.distanceKm} km from central stay corridor.</p>
                <span className="text-[#006a63] font-bold mt-2">+20 pts</span>
              </div>

              <div className="bg-[#faf2ee] rounded-xl p-3 flex flex-col justify-between border border-[#e7dfd5]">
                <div className="flex items-center gap-1.5 font-bold text-[#1e1b19] mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#006a63]/10 text-[#006a63] flex items-center justify-center text-xs">✓</span>
                  <span>Daily Budget Fit</span>
                </div>
                <p className="text-[#59413a] text-[11px]">₹{selectedEvent.priceStarting} comfortably within budget.</p>
                <span className="text-[#006a63] font-bold mt-2">+15 pts</span>
              </div>

              <div className="bg-[#faf2ee] rounded-xl p-3 flex flex-col justify-between border border-[#e7dfd5]">
                <div className="flex items-center gap-1.5 font-bold text-[#1e1b19] mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#006a63]/10 text-[#006a63] flex items-center justify-center text-xs">✓</span>
                  <span>Acoustic Certified</span>
                </div>
                <p className="text-[#59413a] text-[11px]">Intimate seating certified by Heritage Trust.</p>
                <span className="text-[#006a63] font-bold mt-2">+8 pts</span>
              </div>
            </div>

            {/* Collapsible details */}
            {showWeightBreakdown && (
              <div className="mt-4 p-4 bg-[#fff8f5] rounded-xl border border-[#e1bfb5] text-xs">
                <h4 className="font-bold text-[#1e1b19] mb-1">Match Scoring Calibration</h4>
                <p className="text-[#59413a]">
                  This rating combines geographic distance from your itinerary, timing overlap with confirmed trips, and category weighting calculated through the AI Concierge.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Details & Schedule Grid */}
      <section className="w-full max-w-[1320px] mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Description, Schedule, Protocols, Curator */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* About Gathering */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e7dfd5]">
            <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#1e1b19] mb-2">
              About this Gathering
            </h3>
            <p className="text-xs sm:text-sm text-[#59413a] leading-relaxed mb-4">
              {selectedEvent.about}
            </p>

            <div className="bg-[#faf2ee] p-4 rounded-xl border border-[#e7dfd5]">
              <h4 className="text-xs font-bold text-[#1e1b19] uppercase tracking-wider mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#c2410c]">history_edu</span>
                <span>Cultural & Historical Significance</span>
              </h4>
              <p className="text-xs text-[#59413a] leading-relaxed">
                {selectedEvent.culturalSignificance}
              </p>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e7dfd5]">
            <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#1e1b19] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c2410c] text-[20px]">schedule</span>
              <span>Evening Schedule & Order of Events</span>
            </h3>

            <div className="space-y-4">
              {(selectedEvent.schedule || []).map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative pb-3 border-b border-[#f4ece8] last:border-none last:pb-0">
                  <div className="w-16 shrink-0 text-xs font-bold text-[#c2410c] bg-[#c2410c]/10 px-2 py-1 rounded text-center">
                    {step.time}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-[#1e1b19]">{step.title}</span>
                    <span className="text-xs text-[#59413a] mt-0.5">{step.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions & Protocols */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e7dfd5] grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-[#1e1b19] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006a63] text-[18px]">check_circle</span>
                <span>What's Included</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#59413a]">
                {(selectedEvent.inclusions || []).map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#006a63] font-bold">✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#1e1b19] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#a65900] text-[18px]">info</span>
                <span>House Protocols & Etiquette</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#59413a]">
                {(selectedEvent.protocols || []).map((pro, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#a65900] font-bold">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Curator Spotlight */}
          {selectedEvent.curator && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e7dfd5] flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <img
                src={selectedEvent.curator.avatar}
                alt={selectedEvent.curator.name}
                className="w-16 h-16 rounded-2xl object-cover border border-[#e7dfd5] shrink-0"
              />
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-[#c2410c] tracking-wider">
                  Curator & Master Performer
                </span>
                <h4 className="font-['Playfair_Display',serif] text-base sm:text-lg font-bold text-[#1e1b19] mt-0.5">
                  {selectedEvent.curator.name}
                </h4>
                <span className="text-xs font-semibold text-[#006a63] mb-1">{selectedEvent.curator.title}</span>
                <p className="text-xs text-[#59413a] leading-relaxed">{selectedEvent.curator.bio}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Experience Tiers Preview & Booking Card */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#e7dfd5] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f4ece8]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8d7168] block">Starting from</span>
                <div className="text-2xl font-bold text-[#1e1b19]">
                  ₹{selectedEvent.priceStarting.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-[#8d7168]">/ guest</span>
                </div>
              </div>
              <span className="bg-[#006a63]/10 text-[#006a63] text-xs font-bold px-2.5 py-1 rounded-full">
                Selling Fast
              </span>
            </div>

            {/* Tiers List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1e1b19] block uppercase tracking-wider">
                Available Experience Tiers:
              </span>
              {(selectedEvent.tiers || []).map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => proceedToTickets(selectedEvent, tier.id)}
                  className="p-3 rounded-xl border border-[#e7dfd5] hover:border-[#c2410c] hover:bg-[#faf2ee] transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#1e1b19] group-hover:text-[#c2410c]">
                      {tier.name}
                    </span>
                    <span className="text-[11px] text-[#8d7168]">{tier.badge}</span>
                  </div>
                  <span className="text-xs font-bold text-[#1e1b19]">
                    ₹{tier.price}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => proceedToTickets(selectedEvent)}
              className="w-full py-3.5 bg-[#c2410c] hover:bg-[#9b2f00] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
              <span>Select Experience Tier & Reserve</span>
            </button>

            <div className="text-center text-[11px] text-[#8d7168]">
              🔒 Instant Confirmation • Syncs with Trip Itinerary
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Booking Bar (Mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e7dfd5] p-4 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-[#8d7168] uppercase font-bold block">From</span>
          <span className="text-lg font-bold text-[#1e1b19]">₹{selectedEvent.priceStarting}</span>
        </div>
        <button
          onClick={() => proceedToTickets(selectedEvent)}
          className="px-5 py-2.5 bg-[#c2410c] text-white text-xs font-bold rounded-xl shadow-md"
        >
          Select Tickets
        </button>
      </div>
    </div>
  );
}

export default EventDetails;
