import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  Sparkles,
  Check,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  Info,
  Building,
  Image as ImageIcon,
  CheckCircle2,
  PhoneCall,
  BedDouble,
  Maximize2,
  Utensils,
  Heart,
  Share2,
  SlidersHorizontal,
  Coffee,
  Waves,
  Sun,
  VolumeX,
  Compass
} from 'lucide-react';
import { useStays } from '../../context/StaysContext';
import { SmartMatchBadge } from './SmartMatchBadge';
import { HotelGalleryModal } from './HotelGalleryModal';
import { RoomComparisonModal } from './RoomComparisonModal';

export function HotelDetails() {
  const {
    selectedHotel,
    selectedRoom,
    setSelectedRoom,
    selectRoomAndProceed,
    searchParams,
    navigateToStage,
    pricing,
    toggleSaveHotel,
    isHotelSaved
  } = useStays();

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  if (!selectedHotel) {
    return (
      <div className="text-center py-12">
        <button
          onClick={() => navigateToStage('results')}
          className="px-6 py-2.5 bg-[#7c2e0c] text-white rounded-full text-xs font-bold uppercase"
        >
          Return to Stays Results
        </button>
      </div>
    );
  }

  const isSaved = isHotelSaved(selectedHotel.id);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleContinue = () => {
    if (!selectedRoom && selectedHotel.rooms?.length > 0) {
      setSelectedRoom(selectedHotel.rooms[0]);
    }
    navigateToStage('guest');
  };

  const galleryImages = selectedHotel.gallery?.length > 0
    ? selectedHotel.gallery
    : [selectedHotel.heroImage];

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-12">
      {/* Lightbox Photo Gallery Modal */}
      <HotelGalleryModal
        hotel={selectedHotel}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />

      {/* Room Specification Comparison Modal */}
      <RoomComparisonModal
        hotel={selectedHotel}
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
      />

      {/* 1. Breadcrumbs & Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#55433c]">
          <button
            type="button"
            onClick={() => navigateToStage('results')}
            className="hover:text-[#7c2e0c] font-bold flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Stays</span>
          </button>
          <span>/</span>
          <span>{selectedHotel.city}</span>
          <span>/</span>
          <span className="font-bold text-[#1c1c17] truncate max-w-[200px] sm:max-w-none">
            {selectedHotel.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggleSaveHotel(selectedHotel.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all ${
              isSaved
                ? 'bg-[#ffdbcf] text-[#7c2e0c] border-[#7c2e0c]'
                : 'bg-[#fcf9f1] text-[#55433c] border-[#dcc1b8] hover:border-[#89726b]'
            }`}
          >
            <Heart size={14} className={isSaved ? 'fill-[#7c2e0c] text-[#7c2e0c]' : ''} />
            <span>{isSaved ? 'Saved in Wishlist' : 'Save to Itinerary'}</span>
          </button>

          <SmartMatchBadge
            score={selectedHotel.baseSmartMatchScore || selectedHotel.smartMatchScore || 94}
            breakdown={selectedHotel.matchBreakdown || selectedHotel.smartMatchBreakdown}
          />
        </div>
      </div>

      {/* 2. Hotel Title & Rating Row */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#281900] bg-[#fdc66b] px-3 py-0.5 rounded-full">
            VIHARA Certified Heritage
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7c2e0c] bg-[#ffdbcf] px-3 py-0.5 rounded-full">
            {selectedHotel.categoryLabel || 'Portuguese Haveli'}
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-[#1c1c17] pl-1">
            <Star className="w-4 h-4 fill-[#fdc66b] text-[#fdc66b]" />
            <span>{selectedHotel.rating}</span>
            <span className="text-gray-400 font-normal">({selectedHotel.reviewCount || '1,248 verified stays'})</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-4xl font-serif font-bold text-[#1c1c17]">
          {selectedHotel.name}
        </h1>

        <p className="text-xs md:text-sm text-[#55433c] flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#7c2e0c] shrink-0" />
          <span>{selectedHotel.address || selectedHotel.location}</span>
          <span className="text-gray-300">•</span>
          <span className="text-[#7c2e0c] font-bold">Estate Est. {selectedHotel.estYear || '1884'}</span>
        </p>
      </div>

      {/* 3. High-Definition Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden shadow-md">
        {/* Large Hero Image */}
        <div
          onClick={() => setGalleryOpen(true)}
          className="md:col-span-2 relative h-72 md:h-[420px] overflow-hidden bg-gray-100 cursor-pointer group"
        >
          <img
            src={galleryImages[0]}
            alt={selectedHotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <span className="text-[10px] uppercase tracking-widest text-[#fdc66b] font-bold block">
              Exterior Courtyard &amp; Veranda
            </span>
            <p className="text-sm font-serif font-bold text-white drop-shadow">
              Warm colonial architecture under twilight skies
            </p>
          </div>
        </div>

        {/* 2x2 Thumbnail Grid on Desktop */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {galleryImages.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              onClick={() => setGalleryOpen(true)}
              className="relative h-36 md:h-[204px] overflow-hidden bg-gray-100 cursor-pointer group"
            >
              <img
                src={img}
                alt={`${selectedHotel.name} - ${idx + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {idx === 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>View All Photos</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two-Column Layout (Details & Suites vs Sticky Pricing Ledger) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Story, Amenities, Proximity & Suite Cards */}
        <div className="lg:col-span-8 space-y-8">
          {/* About Property & Heritage Story */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#dcc1b8] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#1c1c17]">
              {selectedHotel.tagline || 'Aristocratic Portuguese Haveli Embraced by Palm Groves'}
            </h2>
            <p className="text-xs md:text-sm text-[#55433c] leading-relaxed">
              {selectedHotel.description}
            </p>
            {selectedHotel.heritageStory && (
              <div className="p-4 bg-[#fcf9f1] rounded-2xl border border-[#dcc1b8]/60 text-xs text-[#55433c] leading-relaxed">
                <strong className="text-[#7c2e0c] block mb-1 uppercase tracking-wider font-bold">
                  Heritage Provenance &amp; Architecture
                </strong>
                {selectedHotel.heritageStory}
              </div>
            )}
          </div>

          {/* Key Sanctuary Highlights & Amenities */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#dcc1b8] shadow-sm space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#1c1c17]">
              Bespoke Sanctuary Amenities &amp; Services
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedHotel.amenities?.map((am, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-[#fcf9f1] border border-[#dcc1b8]/50 text-xs font-semibold text-[#1c1c17]">
                  <CheckCircle2 className="w-4 h-4 text-[#7c2e0c] shrink-0" />
                  <span>{am.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proximity to Planned Trip Attractions */}
          <div className="bg-[#f6f3eb] p-6 md:p-8 rounded-3xl border border-[#dcc1b8] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7c2e0c]" />
              <h3 className="text-sm font-bold text-[#1c1c17] uppercase tracking-wider">
                Transit Topography &amp; Itinerary Alignment
              </h3>
            </div>
            <p className="text-xs text-[#55433c]">
              This property was matched with your daily excursion route to minimize transit friction and optimize relaxed travel:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {selectedHotel.nearbyAttractions?.map((att, i) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-[#dcc1b8] flex flex-col justify-between text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold text-[#1c1c17]">
                    <span>{att.name}</span>
                    <span className="text-[#7c2e0c]">{att.distance}</span>
                  </div>
                  <span className="text-gray-400 text-[11px]">{att.driveTime} via scenic route</span>
                </div>
              ))}
            </div>
          </div>

          {/* ROOM SUITES SELECTION SECTION */}
          <div className="space-y-4 pt-4" id="room-inventory">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#7c2e0c]">
                  Step 1 of 3
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1c1c17]">
                  Select Your Sanctuary Suite
                </h2>
                <p className="text-xs text-[#55433c]">All rates include artisanal breakfast and zero hidden resort fees.</p>
              </div>

              {/* Compare Suites CTA */}
              <button
                type="button"
                onClick={() => setCompareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f1eee6] hover:bg-[#ffdbcf] text-[#7c2e0c] border border-[#dcc1b8] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto"
              >
                <SlidersHorizontal size={15} />
                <span>Compare All Features</span>
              </button>
            </div>

            <div className="space-y-4">
              {selectedHotel.rooms?.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => handleRoomSelect(room)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer bg-white shadow-sm flex flex-col md:flex-row gap-6 ${
                      isSelected
                        ? 'border-2 border-[#7c2e0c] ring-2 ring-[#7c2e0c]/20 shadow-md'
                        : 'border-[#dcc1b8] hover:border-[#7c2e0c]/60'
                    }`}
                  >
                    {/* Suite Photo */}
                    <div className="w-full md:w-56 h-44 rounded-2xl overflow-hidden bg-gray-100 shrink-0 relative">
                      <img
                        src={room.image || selectedHotel.heroImage}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 left-2 bg-[#7c2e0c] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          Selected Choice
                        </div>
                      )}
                    </div>

                    {/* Suite Info */}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-serif font-bold text-[#1c1c17]">
                            {room.name}
                          </h3>
                        </div>

                        <p className="text-xs text-[#765100] font-semibold mb-2">
                          {room.tagline}
                        </p>

                        <p className="text-xs text-[#55433c] leading-relaxed mb-3">
                          {room.description}
                        </p>

                        {/* Room Quick Specs */}
                        <div className="flex flex-wrap gap-3 text-[11px] text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-3.5 h-3.5 text-[#7c2e0c]" />
                            {room.bedType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5 text-[#7c2e0c]" />
                            {room.roomSize}
                          </span>
                          <span className="flex items-center gap-1">
                            <Utensils className="w-3.5 h-3.5 text-[#7c2e0c]" />
                            {room.mealPlan}
                          </span>
                        </div>

                        {/* Inclusions */}
                        <div className="flex flex-wrap gap-1.5">
                          {room.features?.map((f, fi) => (
                            <span key={fi} className="text-[10px] bg-[#fcf9f1] border border-[#dcc1b8]/50 px-2 py-0.5 rounded text-[#55433c]">
                              ✓ {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tariff & Select Action */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Nightly tariff</span>
                          <span className="text-xl font-bold text-[#7c2e0c]">
                            ₹{room.pricePerNight.toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectRoomAndProceed(room);
                          }}
                          className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#7c2e0c] text-white shadow-md'
                              : 'bg-[#f6f3eb] text-[#1c1c17] hover:bg-[#ffdbcf]'
                          }`}
                        >
                          <span>{isSelected ? '✓ Reserved' : 'Select Room'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GUEST REVIEWS SECTION (Stitch Parity) */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#dcc1b8] shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7c2e0c]">
                  Unfiltered Experiences
                </span>
                <h3 className="text-xl font-serif font-bold text-[#1c1c17]">
                  Guest Reviews &amp; Peaceful Stays
                </h3>
              </div>
              <div className="flex items-center gap-3 bg-[#fcf9f1] p-3 rounded-2xl border border-[#dcc1b8]">
                <div className="text-center">
                  <span className="text-2xl font-bold text-[#7c2e0c] block leading-none">4.8</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Out of 5.0</span>
                </div>
                <div className="text-xs text-[#55433c]">
                  <strong className="text-[#281900] block font-bold">Exceptional Sanctuary Rating</strong>
                  <span>Based on {selectedHotel.reviewCount || '1,248 verified heritage guest stays'}</span>
                </div>
              </div>
            </div>

            {/* Category Rating Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[#1c1c17] font-semibold">
                  <span>Cleanliness &amp; Linen Care</span>
                  <span>4.9 / 5</span>
                </div>
                <div className="w-full bg-[#f1eee6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#7c2e0c] h-full rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[#1c1c17] font-semibold">
                  <span>Location &amp; Commute Flow</span>
                  <span>4.8 / 5</span>
                </div>
                <div className="w-full bg-[#f1eee6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#7c2e0c] h-full rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[#1c1c17] font-semibold">
                  <span>Heritage Butler &amp; Service</span>
                  <span>4.8 / 5</span>
                </div>
                <div className="w-full bg-[#f1eee6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#7c2e0c] h-full rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[#1c1c17] font-semibold">
                  <span>Acoustic Calm &amp; Serenity</span>
                  <span>4.7 / 5</span>
                </div>
                <div className="w-full bg-[#f1eee6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#7c2e0c] h-full rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>

            {/* Verified Traveler Review Quotes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#fcf9f1] p-4 rounded-2xl border border-[#dcc1b8]/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1c1c17]">Sunil Mathur</span>
                  <span className="text-[10px] text-[#765100] uppercase font-bold">Verified Stay</span>
                </div>
                <p className="text-[#55433c] italic leading-relaxed">
                  “The sheer tranquility of sitting in the balcão veranda at dusk with fresh kokum coolers is unparalleled. Perfectly situated for morning runs to Chapora without the North Goa club noise.”
                </p>
              </div>

              <div className="bg-[#fcf9f1] p-4 rounded-2xl border border-[#dcc1b8]/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1c1c17]">Ananya Roy</span>
                  <span className="text-[10px] text-[#765100] uppercase font-bold">Verified Stay</span>
                </div>
                <p className="text-[#55433c] italic leading-relaxed">
                  “Exceptional attention to heritage detail. The azulejo murals, terracotta pottery, and quiet pool surrounded by palms felt like stepping into 19th-century Portuguese Goa.”
                </p>
              </div>
            </div>
          </div>

          {/* SANCTUARY GUIDELINES & POLICIES */}
          <div className="bg-[#f6f3eb] p-6 rounded-3xl border border-[#dcc1b8] space-y-3 text-xs text-[#55433c]">
            <span className="font-bold uppercase tracking-widest text-[#7c2e0c] text-[10px] block">
              Sanctuary Guidelines &amp; Policies
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[#1c1c17]">
              <div>
                <strong className="block font-bold">Check-in / Check-out</strong>
                <span className="text-[#55433c]">Check-in: 2:00 PM<br />Check-out: 11:00 AM</span>
              </div>
              <div>
                <strong className="block font-bold">Cancellation Terms</strong>
                <span className="text-[#55433c]">Free cancellation until 24h prior to arrival</span>
              </div>
              <div>
                <strong className="block font-bold">Quiet Hours</strong>
                <span className="text-[#55433c]">10:00 PM – 7:00 AM to preserve serenity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Itemized Price Ledger & Action */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white rounded-3xl border border-[#dcc1b8] p-6 shadow-xl space-y-5">
            {/* Selected Suite Preview */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#dcc1b8]">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={selectedRoom?.image || selectedHotel.heroImage}
                  alt="Suite preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#765100]">
                  Active Reservation
                </span>
                <h4 className="text-xs font-bold text-[#1c1c17] truncate">
                  {selectedRoom?.name || selectedHotel.rooms[0]?.name}
                </h4>
                <p className="text-[11px] text-gray-500">{searchParams.nights} Nights • {searchParams.guests} Guests</p>
              </div>
            </div>

            {/* Check-in / Check-out strip */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-[#fcf9f1] rounded-2xl border border-[#dcc1b8] text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CHECK-IN</span>
                <span className="font-bold text-[#1c1c17]">{searchParams.checkIn}</span>
                <span className="text-[10px] text-gray-500 block">From 2:00 PM</span>
              </div>
              <div className="border-l border-[#dcc1b8] pl-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CHECK-OUT</span>
                <span className="font-bold text-[#1c1c17]">{searchParams.checkOut}</span>
                <span className="text-[10px] text-gray-500 block">Until 11:00 AM</span>
              </div>
            </div>

            {/* Itemized Price Ledger */}
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
                <div className="flex justify-between text-[#7c2e0c] font-medium">
                  <span>VIHARA Member Privilege Benefit</span>
                  <span>-₹{pricing.memberDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#dcc1b8] flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                    Total Amount Payable
                  </span>
                  <span className="text-[10px] text-gray-500">Includes all heritage taxes &amp; fees</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#7c2e0c]">
                    ₹{pricing.totalAmount.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">INR Net</span>
                </div>
              </div>
            </div>

            {/* Free Cancellation Guarantee Tag */}
            <div className="p-3 bg-[#fdc66b]/20 rounded-xl border border-[#fdc66b]/50 text-xs text-[#765100] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7c2e0c] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Free Cancellation Guarantee</strong>
                <span>Full refund if cancelled up to 24 hours prior to check-in date.</span>
              </div>
            </div>

            {/* Primary Continue CTA */}
            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-4 px-6 bg-[#7c2e0c] hover:bg-[#9b4522] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#7c2e0c]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>CONTINUE TO GUEST DETAILS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 24/7 Concierge Support Call */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-[#7c2e0c]" />
                <span>Palace Concierge</span>
              </div>
              <span className="font-bold text-[#765100]">+91 800-VIHARA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelDetails;
