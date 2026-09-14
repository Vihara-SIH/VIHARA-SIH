import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Sun,
  Cloud,
  Navigation,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  Tag,
  Check,
  ChevronDown,
  ArrowUpDown,
  Compass,
  DollarSign,
  Download,
  Share2,
  Printer,
  FileText,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building,
  Hotel
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useStays } from '../context/StaysContext';
import { sendItineraryWebhook } from '../services/webhookService';
import { generateItineraryPDFBlob } from '../services/pdfService';
import { PDFItineraryModal } from './PDFItineraryModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function TripOverviewPage({ onPlanNewTrip, onBookStay }) {
  const stays = useStays();
  const {
    currentLocation,
    selectedDestinations,
    destinationOrder,
    updateDestinationSequence,
    startDate,
    endDate,
    numberOfDays,
    travelType,
    numberOfTravelers,
    selectedCategories,
    userSelectedBudget,
    minimumBaseline,
    generatedItinerary,
    placeCards,
    routeData,
    generateTripOutputs,
    isGenerating
  } = useTrip();

  const { user, userProfile } = useAuth();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendingStatusText, setSendingStatusText] = useState('');
  const [emailFeedback, setEmailFeedback] = useState(null); // { type: 'success' | 'error', message: string } | null

  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'places' | 'routes' | 'budget'
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [tempDestOrder, setTempDestOrder] = useState([...destinationOrder]);
  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState(null);

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);

  // Initialize Trip Outputs on Mount if empty
  useEffect(() => {
    if (generatedItinerary.length === 0 && !isGenerating) {
      generateTripOutputs();
    }
  }, []);

  // Update tempDestOrder when destinationOrder changes
  useEffect(() => {
    setTempDestOrder([...destinationOrder]);
  }, [destinationOrder]);

  // Leaflet Map Initialization & Updates
  useEffect(() => {
    if (activeTab === 'routes' && mapContainerRef.current) {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Filter waypoints based on day filter
      let activeWaypoints = routeData?.waypoints || [];
      if (selectedDayFilter !== 'all') {
        const dayNum = parseInt(selectedDayFilter, 10);
        activeWaypoints = activeWaypoints.filter(
          w => w.stepIndex === 0 || w.dayNumber === dayNum
        );
      }

      if (activeWaypoints.length > 0) {
        const latLngs = [];

        activeWaypoints.forEach((wp) => {
          if (wp.coordinates && wp.coordinates.lat && wp.coordinates.lng) {
            const latLng = [wp.coordinates.lat, wp.coordinates.lng];
            latLngs.push(latLng);

            const customMarkerIcon = L.divIcon({
              className: 'custom-gold-marker',
              html: `
                <div style="
                  background: #0d1c32;
                  color: #D4AF37;
                  border: 2px solid #D4AF37;
                  border-radius: 50%;
                  width: 32px;
                  height: 32px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 800;
                  font-size: 11px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                ">
                  ${wp.stepIndex === 0 ? 'Start' : wp.stepIndex}
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });

            const marker = L.marker(latLng, { icon: customMarkerIcon }).addTo(map);
            marker.bindPopup(`
              <div style="font-family: 'Inter', sans-serif; padding: 4px;">
                <h4 style="margin: 0 0 4px 0; color: #0d1c32; font-size: 13px; font-weight: 700;">${wp.name}</h4>
                <p style="margin: 0; color: #735c00; font-size: 11px;">${wp.type || 'Attraction'}</p>
                ${wp.city ? `<span style="font-size: 10px; color: #666;">${wp.city} • Day ${wp.dayNumber}</span>` : ''}
              </div>
            `);
          }
        });

        // Draw connecting polyline
        if (latLngs.length > 1) {
          L.polyline(latLngs, {
            color: '#735c00',
            weight: 4,
            opacity: 0.85,
            dashArray: '6, 6',
            lineJoin: 'round'
          }).addTo(map);

          map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
        } else if (latLngs.length === 1) {
          map.setView(latLngs[0], 11);
        }

        setTimeout(() => {
          map.invalidateSize();
        }, 250);
      }

      leafletMapRef.current = map;
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [activeTab, routeData, selectedDayFilter]);

  // Handle reorder destination apply with explicit tempDestOrder argument
  const handleApplyNewOrder = async () => {
    updateDestinationSequence(tempDestOrder);
    setShowReorderModal(false);
    await generateTripOutputs(tempDestOrder);
  };

  const moveDestination = (index, direction) => {
    const newArr = [...tempDestOrder];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newArr.length) return;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setTempDestOrder(newArr);
  };

  // Helper to get clean display name
  const formatDestName = (d) => typeof d === 'object' ? (d.name || d.id || 'Destination') : d;

  // Capitalize helpers
  const tripTitle = `${destinationOrder.map(d => {
    const s = formatDestName(d);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' & ')} Odyssey`;

  // Send Itinerary PDF to Logged-in User Email via n8n Webhook
  const handleSendItineraryEmail = async () => {
    const targetEmail = user?.email || userProfile?.email;
    if (!targetEmail) {
      setEmailFeedback({
        type: 'error',
        message: 'No authenticated email address found. Please ensure you are logged in.'
      });
      return;
    }

    if (!generatedItinerary || generatedItinerary.length === 0) {
      setEmailFeedback({
        type: 'error',
        message: 'No itinerary details available to send. Please wait for the itinerary to generate.'
      });
      return;
    }

    setIsSendingEmail(true);
    setSendingStatusText('Preparing your itinerary...');
    setEmailFeedback(null);

    const tripData = {
      tripTitle,
      currentLocation,
      destinations: destinationOrder,
      destinationOrder,
      startDate,
      endDate,
      numberOfDays,
      travelType,
      numberOfTravelers,
      selectedCategories,
      budget: {
        allocatedBudget: userSelectedBudget,
        minimumBaseline
      },
      generatedItinerary,
      dayWiseItinerary: generatedItinerary,
      places: placeCards,
      placeCards,
      routes: routeData,
      routeData
    };

    try {
      // Step 1: Generate itinerary PDF Blob reusing the exact same itinerary dossier structure
      const pdfBlob = await generateItineraryPDFBlob(tripData);

      // Step 2: Update status to sending
      setSendingStatusText('Sending your itinerary...');

      const primaryDest = destinationOrder[0]
        ? destinationOrder[0].charAt(0).toUpperCase() + destinationOrder[0].slice(1)
        : 'Trip';
      const filename = `VIHARA_Itinerary_${primaryDest}.pdf`;

      const result = await sendItineraryWebhook(targetEmail, pdfBlob, {
        filename,
        destination: destinationOrder.join(', '),
        numberOfDays,
        itinerary: tripData
      });

      if (result.success) {
        setEmailFeedback({
          type: 'success',
          message: 'Your itinerary PDF has been sent to your email successfully! 📧'
        });
      } else {
        setEmailFeedback({
          type: 'error',
          message: result.message || 'Unable to send your itinerary right now. Please try again.'
        });
      }
    } catch (_err) {
      setEmailFeedback({
        type: 'error',
        message: 'Unable to send your itinerary right now. Please try again.'
      });
    } finally {
      setIsSendingEmail(false);
      setSendingStatusText('');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 space-y-6">
      {/* 1. Trip Hero Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-[#735c00] font-bold">
              Curated AI Journey • {currentLocation} Origin
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold text-[#0d1c32] tracking-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            The {tripTitle}
          </h1>

          {/* Quick Badges */}
          <div className="flex flex-wrap gap-2.5 mt-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fafaf5] border border-gray-200 rounded-full font-medium text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-[#735c00]" />
              {numberOfDays} Days ({startDate} to {endDate})
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fafaf5] border border-gray-200 rounded-full font-medium text-gray-700">
              <Users className="w-3.5 h-3.5 text-[#735c00]" />
              {numberOfTravelers} Travelers ({travelType})
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fed65b]/20 text-[#735c00] rounded-full font-bold uppercase">
              <Tag className="w-3.5 h-3.5" />
              {selectedCategories.slice(0, 3).join(', ')}
            </span>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Open Dedicated Standalone PDF Dossier */}
          <button
            type="button"
            onClick={() => setShowPdfModal(true)}
            className="px-5 py-3 bg-[#D4AF37] hover:bg-[#ffe088] text-[#0d1c32] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            title="Open dedicated standalone PDF itinerary dossier"
          >
            <FileText className="w-4 h-4" />
            <span>Open PDF Itinerary</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReorderModal(true)}
            className="px-4 py-3 bg-white border border-gray-200 hover:border-[#D4AF37] text-[#0d1c32] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#735c00]" />
            <span>Change Order of Destinations</span>
          </button>

          <button
            type="button"
            onClick={onPlanNewTrip}
            className="px-4 py-3 bg-[#0d1c32] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Plan New Trip</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs (P4 Itinerary, P5 Place Cards, P6 Routes, Budget) */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 text-sm font-semibold">
          {[
            { id: 'itinerary', label: 'Itinerary (P4)' },
            { id: 'places', label: `Place Cards (${placeCards.length}) (P5)` },
            { id: 'routes', label: 'Routes & Map (P6)' },
            { id: 'stays', label: 'Accommodation & Stays' },
            { id: 'budget', label: 'Budget Breakdown' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
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

      {/* =========================================================================
          TAB 1: ITINERARY (P4) with Focused Place Visits & Route Connectors
          ========================================================================= */}
      {activeTab === 'itinerary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Main Itinerary Days */}
          <div className="lg:col-span-8 space-y-6">
            {generatedItinerary.map((day) => (
              <div
                key={day.dayNumber}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:border-[#D4AF37] transition-all"
              >
                {/* Day Header with Live Weather */}
                <div className="bg-[#fafaf5] p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0d1c32] text-white flex items-center justify-center font-bold text-xs">
                      {day.dayNumber}
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold text-[#0d1c32]"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Day {day.dayNumber}: {day.city} Exploration
                      </h3>
                      <p className="text-xs text-gray-500">
                        {day.date} • {day.state}
                      </p>
                    </div>
                  </div>

                  {/* Weather Capsule */}
                  {day.weather && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-700 shadow-sm self-start sm:self-auto">
                      <Sun className="w-4 h-4 text-[#D4AF37]" />
                      <span className="font-bold text-[#0d1c32]">{day.weather.temp}</span>
                      <span className="text-gray-400">|</span>
                      <span>{day.weather.condition}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-[11px] text-gray-500">💧 {day.weather.humidity}</span>
                    </div>
                  )}
                </div>

                {/* Day Activities List */}
                <div className="p-5 space-y-4">
                  {day.activities.map((act, actIdx) => (
                    <div
                      key={actIdx}
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-[#fafaf5] border border-gray-100 hover:border-[#D4AF37]/50 transition-all"
                    >
                      {/* Photo Thumbnail */}
                      <div className="w-full sm:w-36 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
                        <img
                          src={act.image}
                          alt={act.title}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-[#0d1c32]/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {act.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#735c00] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {act.time}
                            </span>
                            <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                              {act.slotType}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#0d1c32] mb-1">{act.title}</h4>
                          <p className="text-xs text-gray-600 leading-relaxed mb-2">{act.description}</p>
                        </div>

                        {/* Travel Tip & Visiting Info */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-2 border-t border-gray-200/60">
                          {act.visitingHours && (
                            <span>⏰ <strong>Hours:</strong> {act.visitingHours}</span>
                          )}
                          {act.entryInfo && (
                            <span>🎟️ <strong>Entry:</strong> {act.entryInfo}</span>
                          )}
                          {act.travelTip && (
                            <span className="text-[#735c00]">💡 {act.travelTip}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Bottom Option: Send Itinerary to Email */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fafaf5] border border-gray-200 text-[#735c00] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#735c00]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0d1c32]">
                    Send Itinerary to Inbox
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {user?.email || userProfile?.email ? (
                      <span>Email the complete itinerary directly to <strong className="text-gray-700">{user?.email || userProfile?.email}</strong></span>
                    ) : (
                      <span>Receive the complete day-by-day plan directly in your email</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSendingEmail || generatedItinerary.length === 0}
                onClick={handleSendItineraryEmail}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#0d1c32] hover:bg-black disabled:bg-gray-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                    <span>{sendingStatusText || 'Preparing your itinerary...'}</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Send it to my Email</span>
                  </>
                )}
              </button>
            </div>

            {/* Email Status Message Alert */}
            {emailFeedback && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fadeIn ${
                  emailFeedback.type === 'success'
                    ? 'bg-[#fafaf5] border-[#D4AF37] text-[#0d1c32]'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {emailFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-[#735c00] flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{emailFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailFeedback(null)}
                  className="text-gray-400 hover:text-gray-700 text-xs font-bold p-1 cursor-pointer"
                  aria-label="Close notification"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar: Itinerary Intelligence & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-[#0d1c32]">Destination Sequence</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Current travel progression across destinations:
                <strong className="block text-[#0d1c32] mt-1 text-sm">
                  {destinationOrder.map(d => formatDestName(d).toUpperCase()).join(' ➔ ')}
                </strong>
              </p>

              <button
                type="button"
                onClick={() => setShowReorderModal(true)}
                className="w-full py-2.5 border border-[#D4AF37] bg-[#fed65b]/10 hover:bg-[#fed65b]/25 text-[#735c00] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Change Order of Destinations
              </button>
            </div>

            {/* Matched Luxury Stays Quick Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#dcc1b8]/70 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#765100]">
                  Smart Match Stays
                </span>
                <span className="text-[10px] font-bold text-[#b45309] bg-[#fdc66b]/25 px-2 py-0.5 rounded-full">
                  94% Match
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#1c1c17]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Curated Stays in {destinationOrder[0] ? formatDestName(destinationOrder[0]) : 'Goa'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Matched to your daily {destinationOrder[0] ? formatDestName(destinationOrder[0]) : 'Goa'} itinerary attractions and ₹{userSelectedBudget.toLocaleString()} budget.
              </p>
              <button
                type="button"
                onClick={onBookStay}
                className="w-full py-2.5 bg-[#b45309] hover:bg-[#9b4522] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Find Matched Stays</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Standalone PDF Opener Box */}
            <div className="bg-[#0d1c32] text-white p-6 rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block mb-1">
                Downloadable Travel Dossier
              </span>
              <h3 className="text-base font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Open Standalone PDF
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Generate an uncluttered, multi-page PDF brochure featuring your places, schedule, photos, and route map.
              </p>
              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="w-full py-3 bg-[#D4AF37] text-[#0d1c32] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#ffe088] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Open &amp; Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PLACE CARDS (P5) with Personalized "Why this place was included"
          ========================================================================= */}
      {activeTab === 'places' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-[#0d1c32]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Curated Itinerary Places
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Detailed intelligence for all attractions included in your itinerary with personalized rationale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placeCards.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:border-[#D4AF37] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image with Tag Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={place.image}
                      alt={place.placeName}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#0d1c32]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      Day {place.dayNumber} • {place.city}
                    </div>
                    <div className="absolute top-3 right-3 bg-[#D4AF37] text-[#0d1c32] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-sm">
                      {place.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#0d1c32] mb-1">{place.placeName}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">{place.description}</p>

                    {/* Personalized "Why This Place Was Included" Box */}
                    <div className="p-3 bg-[#fed65b]/15 rounded-xl border border-[#fed65b]/30 mb-4">
                      <span className="text-[10px] font-bold uppercase text-[#735c00] flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3" />
                        Why This Place Was Included
                      </span>
                      <p className="text-xs text-[#1a1c19] italic leading-relaxed">
                        "{place.personalizedRationale}"
                      </p>
                    </div>

                    {/* Quick Metadata */}
                    <div className="space-y-1 text-[11px] text-gray-500">
                      <div>⏰ <strong>Hours:</strong> {place.visitingHours}</div>
                      <div>🎟️ <strong>Entry:</strong> {place.entryInfo}</div>
                      <div>💡 <strong>Tip:</strong> {place.travelTips}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Trigger */}
                <div className="p-4 bg-[#fafaf5] border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">{place.city}, {place.state}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPlaceDetail(place)}
                    className="text-[#735c00] font-bold hover:underline cursor-pointer"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ROUTES & MAP (P6) with Interactive Leaflet Map & Transfers
          ========================================================================= */}
      {activeTab === 'routes' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Day Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-shrink-0">
              Filter By Day:
            </span>
            <button
              type="button"
              onClick={() => setSelectedDayFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedDayFilter === 'all'
                  ? 'bg-[#0d1c32] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Days Route
            </button>
            {generatedItinerary.map((day) => (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setSelectedDayFilter(String(day.dayNumber))}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  selectedDayFilter === String(day.dayNumber)
                    ? 'bg-[#0d1c32] text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Day {day.dayNumber} ({day.city})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Leaflet Map */}
            <div className="lg:col-span-7 bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0d1c32] flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#735c00]" />
                  Interactive Travel Route Visualizer
                </span>
                <span className="text-[11px] text-gray-500 font-semibold">
                  Total: {routeData?.totalDistance || '1,240 km'}
                </span>
              </div>
              <div
                ref={mapContainerRef}
                className="w-full h-[460px] rounded-2xl overflow-hidden border border-gray-200 z-10"
              />
            </div>

            {/* Travel Sequence & Transfers */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d1c32] mb-3">
                  Travel Sequence &amp; Transfers
                </h3>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {routeData?.legs?.map((leg, i) => (
                    <div key={i} className="p-3.5 bg-[#fafaf5] rounded-2xl border border-gray-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#0d1c32] mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0d1c32] flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          {leg.from}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span>{leg.to}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-200/50">
                        <span className="font-semibold text-[#735c00]">{leg.mode}</span>
                        <span>{leg.distance} • {leg.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ACCOMMODATION & STAYS
          ========================================================================= */}
      {activeTab === 'stays' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0d1c32]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Trip Accommodation &amp; Heritage Stays
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Luxury havelis and retreats matched specifically for your {numberOfDays}-day {destinationOrder.map(formatDestName).join(' & ')} journey.
              </p>
            </div>

            <button
              type="button"
              onClick={onBookStay}
              className="px-5 py-2.5 bg-[#b45309] hover:bg-[#9b4522] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <span>Explore All Stays</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* If a confirmed booking exists for this user */}
          {stays?.currentBooking || stays?.userBookings?.length > 0 ? (
            <div className="bg-white rounded-3xl border border-[#dcc1b8]/70 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#b45309]" />
                <span className="text-xs font-bold text-[#765100] uppercase tracking-wider">
                  Linked Sanctuary Reservation
                </span>
              </div>

              {(() => {
                const booking = stays.currentBooking || stays.userBookings[0];
                return (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 bg-[#fcf9f1] rounded-2xl border border-[#dcc1b8]/40">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={booking.room?.image || booking.hotel?.heroImage}
                          alt={booking.hotel?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[#b45309]">
                            {booking.bookingId}
                          </span>
                          <span className="text-[10px] bg-green-50 border border-green-200 text-green-700 font-bold px-2 py-0.5 rounded-full">
                            ✓ Confirmed
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#1c1c17] mt-0.5" style={{ fontFamily: 'Noto Serif, serif' }}>
                          {booking.hotel?.name}
                        </h3>
                        <p className="text-xs text-gray-500">{booking.room?.name} • {booking.nights} Nights</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Tariff</span>
                        <span className="text-base font-bold text-[#b45309]">
                          ₹{booking.pricing?.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={onBookStay}
                        className="px-4 py-2 bg-[#0d1c32] hover:bg-black text-white rounded-xl text-xs font-bold uppercase transition-colors"
                      >
                        View Stays
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-[#dcc1b8]/60 shadow-sm text-center space-y-4">
              <Building className="w-12 h-12 text-[#b45309] mx-auto opacity-70" />
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-[#1c1c17]" style={{ fontFamily: 'Noto Serif, serif' }}>
                  No Accommodation Booked Yet for This Trip
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  VIHARA Smart Match has found luxury havelis in {destinationOrder[0] ? formatDestName(destinationOrder[0]) : 'Goa'} matching your planned itinerary spots and ₹{userSelectedBudget.toLocaleString()} budget.
                </p>
              </div>
              <button
                type="button"
                onClick={onBookStay}
                className="px-6 py-3 bg-[#b45309] hover:bg-[#9b4522] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Find &amp; Book Matched Stays
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: BUDGET BREAKDOWN (P3)
          ========================================================================= */}
      {activeTab === 'budget' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm max-w-2xl mx-auto animate-fadeIn">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#735c00]">
              Financial Optimization
            </span>
            <h2 className="text-2xl font-bold text-[#0d1c32] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Trip Budget Summary
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3.5 bg-[#fafaf5] rounded-xl border border-gray-100">
              <span className="text-gray-600">AI Minimum Baseline:</span>
              <span className="font-bold text-[#0d1c32]">₹{minimumBaseline.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-[#fed65b]/20 rounded-xl border border-[#fed65b]/40">
              <span className="text-[#735c00] font-bold">Your Allocated Budget:</span>
              <span className="font-bold text-lg text-[#0d1c32]">₹{userSelectedBudget.toLocaleString()}</span>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2.5 text-gray-600">
              <div className="flex justify-between">
                <span>Estimated Stays &amp; Boutique Hotels ({Math.ceil(numberOfTravelers / 2)} Room(s)):</span>
                <span className="font-semibold text-[#0d1c32]">₹{(numberOfDays * 2800 * Math.ceil(numberOfTravelers / 2)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Dining &amp; Culinary Tastings ({numberOfTravelers} Person(s)):</span>
                <span className="font-semibold text-[#0d1c32]">₹{(numberOfDays * 1400 * numberOfTravelers).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Intercity Transit &amp; Monument Entry Passes:</span>
                <span className="font-semibold text-[#0d1c32]">₹{(selectedCategories.length * 350 * numberOfTravelers * numberOfDays).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Place Intelligence Modal */}
      {selectedPlaceDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPlaceDetail(null)}
        >
          <div
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 w-full">
              <img
                src={selectedPlaceDetail.image}
                alt={selectedPlaceDetail.placeName}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80';
                }}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedPlaceDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-3">
              <span className="text-[10px] font-bold uppercase text-[#735c00] bg-[#fed65b]/25 px-2.5 py-0.5 rounded-full">
                {selectedPlaceDetail.category}
              </span>
              <h3 className="text-xl font-bold text-[#0d1c32]">{selectedPlaceDetail.placeName}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{selectedPlaceDetail.description}</p>
              <div className="p-3 bg-[#fafaf5] rounded-xl border border-gray-100 text-xs space-y-1 text-gray-600">
                <div>⏰ <strong>Visiting Hours:</strong> {selectedPlaceDetail.visitingHours}</div>
                <div>🎟️ <strong>Entry Fee:</strong> {selectedPlaceDetail.entryInfo}</div>
                <div>💡 <strong>Traveler Tips:</strong> {selectedPlaceDetail.travelTips}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Destination Order Reorder Modal */}
      {showReorderModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowReorderModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#0d1c32] mb-1">Change Order of Destinations</h3>
            <p className="text-xs text-gray-500 mb-4">
              Shift cities up or down to customize the route sequence. The itinerary, days, and map will regenerate in that exact sequence.
            </p>

            <div className="space-y-2 mb-6">
              {tempDestOrder.map((dest, i) => (
                <div
                  key={typeof dest === 'object' ? (dest.placeId || `${dest.name}_${i}`) : `${dest}_${i}`}
                  className="flex items-center justify-between p-3 bg-[#fafaf5] rounded-xl border border-gray-200 text-xs font-bold text-[#0d1c32]"
                >
                  <span>{i + 1}. {formatDestName(dest).toUpperCase()}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => moveDestination(i, -1)}
                      className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={i === tempDestOrder.length - 1}
                      onClick={() => moveDestination(i, 1)}
                      className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReorderModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyNewOrder}
                className="px-5 py-2 bg-[#0d1c32] text-white rounded-xl text-xs font-bold uppercase hover:bg-black cursor-pointer shadow-sm"
              >
                Apply &amp; Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone PDF Itinerary Dossier Modal */}
      <PDFItineraryModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        tripTitle={tripTitle}
        currentLocation={currentLocation}
        destinationOrder={destinationOrder}
        startDate={startDate}
        endDate={endDate}
        numberOfDays={numberOfDays}
        numberOfTravelers={numberOfTravelers}
        travelType={travelType}
        generatedItinerary={generatedItinerary}
        placeCards={placeCards}
        routeData={routeData}
      />
    </div>
  );
}

export default TripOverviewPage;
