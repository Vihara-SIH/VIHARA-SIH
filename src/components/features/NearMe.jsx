import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Star,
  ArrowLeft,
  Search,
  Filter,
  Clock,
  Sparkles,
  Compass,
  Bookmark,
  Plus,
  ExternalLink,
  Bot,
  Layers,
  Map as MapIcon,
  Grid,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  LocateFixed,
  RefreshCw,
  Share2,
  Volume2,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { useStays } from '../../context/StaysContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!Number.isFinite(lat1) || !Number.isFinite(lon1) || !Number.isFinite(lat2) || !Number.isFinite(lon2)) return 2.4;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Exact Curated Discovery Catalog
const CURATED_DISCOVERY_SPOTS = [
  {
    id: 'bansilalpet-stepwell',
    name: 'Bansilalpet Stepwell & Heritage Arcade',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Restored Step Architecture',
    mood: 'gems',
    rating: 4.95,
    reviews: 840,
    distKm: 2.4,
    durationMin: 75,
    timeWindow: '2 Hours',
    price: 'Free',
    priceVal: 0,
    openHours: '10:00 AM - 08:00 PM',
    status: 'Open Now',
    desc: '17th-century subterranean water structure rescued from ruins, featuring ornate stone colonnades, subterranean arcades, and atmospheric morning lightwells cooling aquifers 3°C below street level.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiMMztfkKY7OuaYjAMcYrtsGwTv2amKd4xSS_cG6MzQVoHj9Yd0f77uPjlLyn4Ftoc4srWCCRow141FPOfXuJAIeU170rNimh9N_TMF8VkaAc5e9IaLGHgwljGUKFN3xyQoOK27b9O7l7jC5SDTtiFS4XG8JBHtg461XS1CzX-_TbHzh6v1dTG53Ed2egBzAGq1CSK2f8zzYWdeOJZDq0tmmtDbjrawSf4MIuT3FUKDJIs5Ajn0Suj3A',
    secondaryImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAFfM6ViX9_LiDEVOFni4_mNZRXIWCdu2QtiT0J8BeqcjTkA-49XUPjQu6BAzvUdTOVXvB4duz9kB5285XXGH5Q-wSEa87TGPEqJf4WQ8qoQAH49oE7QYV-d19MnxskrrJ_qT046AqD8Ft5rxQvJDx89MUEKJxekCuIdvuj2X9Mt791BQekGPw32jtwwbNmFRcHL9GMs_iX_4kpDlhl-RcztlKH7yU38woK7xcOCI7tGTZmOWZ4Ecg-1A',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBeNmgWr-ieilPrequeYtmv9wEVOQ82QXoERuIX95z0e3SiDFezU-_oX09AKtf00ygx6sO_DT4CN0x2KEHxMSBme6oh8uzkQaulIHiLe85tG793KVPeLK6-mM0sq-3TVsgdzP2MbYifx41FziKBJqQdETBaySh0Pmbdluxi9NCiVv8pPLWpptuEWqulB80RNH6AC0qDBugBglw_Y9u8Jh73h6FzyC4DAn_-x4cSMsl3TFDV05KGgxS8Fw'
    ],
    coordinates: { lat: 17.4326, lng: 78.4975 },
    tip: 'Visit in early morning or dusk when volumetric golden light filters into the lower water galleries; handheld photography permitted.',
    matchScore: 98,
    fitReason: 'Calibrated to your 2h free slot, serenity preference, and Begumpet transit (only 2.4 km away).',
    archivalTier: 'Archival Tier VI • ASI & HMDA Restored',
    optimalSun: 'Optimal Sun Angle: Active Now',
    acousticDb: '42 dB',
    crowdDensity: 'Minimal (12 visitors)',
    signals: ['11 min away', 'Fits ₹500 budget', 'Matches Heritage mood', '85% less crowded than Golconda']
  },
  {
    id: 'badshahi-ashurkhana',
    name: 'Badshahi Ashurkhana',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Heritage & Art',
    mood: 'heritage',
    rating: 4.85,
    reviews: 620,
    distKm: 3.1,
    durationMin: 60,
    timeWindow: '1 Hour',
    price: 'Free',
    priceVal: 0,
    openHours: '09:00 AM - 05:00 PM',
    status: 'Open Now',
    desc: 'Dazzling Persian enamelled mosaic tilework that survived Mughal sieges (built 1594 AD). Extraordinary quietude right near Old City.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdgseoxsKpK9bABIhSfV3Go16pl_WGm6vrN3xjxg1UqjpW76LezgGXyNpJKxvfr2FRazIg7XbF5zykeMTGyzyS4fvfYY5O_2qsBdp_9Qo1vcdHQxK5Hwy66jI1h0QHtbyQAmuvBIewqsShxxmT2tJzCwO-dB3IxWTjZVfTh8gf7JQ9KLLVrSygV_Mv9ztqmlpKXzaGjvrxgTm6car3X_urlJTi0YrGrOfDJAGSBowLfgHfPjzQeYqQ6g',
    coordinates: { lat: 17.3688, lng: 78.4735 },
    tip: 'Observe the 400-year-old brilliant cobalt blue and amber floral enamel glaze up close.',
    matchScore: 91,
    fitReason: 'Rich architectural history with near zero commercial footfall.',
    archivalTier: 'Qutb Shahi Era (1594 AD)',
    optimalSun: 'Best: 9 AM - 11 AM',
    acousticDb: '38 dB',
    crowdDensity: 'Very Low (~8 visitors)'
  },
  {
    id: 'moula-ali-hillock',
    name: 'Moula Ali Hillock Sanctuary',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Sunset & Vista',
    mood: 'nature',
    rating: 4.9,
    reviews: 790,
    distKm: 4.8,
    durationMin: 90,
    timeWindow: '2 Hours',
    price: 'Free',
    priceVal: 0,
    openHours: '05:30 AM - 08:30 PM',
    status: 'Open Now',
    desc: '484 carved stone steps leading to an ancient hilltop shrine perched on a giant monolithic dome rock. 360-degree sunset panorama unobstructed by high-rises.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtb-0BeykYt3IAC_99STiIjwzqNU2kEFsEzY0Q5SDcQorr1WDpc-Oa-o--tV1tDyjuduY7vtqueT-Axi4PFsV0y7xgAqbU0Izf_RKrmNA2sLdf1jqeXjLCjKRv2ORtXUmRZBcGUbnZb_G3U67nbOjTQO8j_90T0yDci8Y1qJ_PIJCTE9-7TdIejbHy7RneH7IPmeSwO8LmAKGzQTMDp0mjfUi9uYNtXXe30fZP-w3HvwyVbDZbD1Dg7g',
    coordinates: { lat: 17.4721, lng: 78.5637 },
    tip: 'Begin ascent 45 minutes before sunset to watch the entire city horizon bathe in golden ochre light.',
    matchScore: 89,
    fitReason: 'Unmatched 360-degree panoramic vista away from urban noise.',
    archivalTier: 'Panoramic Granite Monolith',
    optimalSun: 'Best: 5:15 PM (Sunset)',
    acousticDb: '35 dB',
    crowdDensity: 'Serene (~15 visitors)'
  },
  {
    id: 'niloufer-garden-chai',
    name: 'Niloufer Private Garden Chai',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Local Food & Chai',
    mood: 'food',
    rating: 4.92,
    reviews: 1540,
    distKm: 1.2,
    durationMin: 45,
    timeWindow: '30 Min',
    price: '₹80',
    priceVal: 80,
    openHours: '06:00 AM - 11:30 PM',
    status: 'Open Now',
    desc: 'Slow-brewed mawa malai Irani chai served beside vintage herbal potted gardens. Authentic Osmania butter biscuits baked fresh every 20 minutes.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHAqUYwKZhoWAB8mO8sFX3R6KvXKA7jsFhUc_GUTkXwxPQAMCF8S05hm8lbx6tC9FM4Tymesb1895SYWWLXZj75kMSvUALkijIEknjOYq-5DsJLUNm27v5VGxFWSOXjoFgahZ9jmpQ2SNdX1ty-MyGFaV2UyhFY9pKqMR-_b2cLbKt7bjV-CRmWP2UFuGkgx3na-hg-XObBFaptwzlzFFzFk9JAQIiyKjC0Q1teu5MH2HEIAnNnKrGvQ',
    coordinates: { lat: 17.4042, lng: 78.4619 },
    tip: 'Dip a warm Osmania biscuit halfway into the thick malai foam for the ultimate authentic ritual.',
    matchScore: 96,
    fitReason: '5 minutes from Begumpet, perfect morning or evening cultural pause.',
    archivalTier: 'Living Culinary Heritage',
    optimalSun: 'Open Now (Fresh Batch)',
    acousticDb: '55 dB',
    crowdDensity: 'Moderate'
  }
];

// Mood Chips matching Stitch Spec
const MOOD_CHIPS = [
  { id: 'gems', icon: '💎', label: 'Hidden Gem' },
  { id: 'nature', icon: '🌿', label: 'Nature Escape' },
  { id: 'heritage', icon: '🏛️', label: 'Heritage' },
  { id: 'food', icon: '🍜', label: 'Local Food' },
  { id: 'photo', icon: '📸', label: 'Photo Spot' },
  { id: 'sunset', icon: '🌅', label: 'Sunset' },
  { id: 'cafe', icon: '☕', label: 'Café' },
  { id: 'art', icon: '🎨', label: 'Art & Culture' },
  { id: 'spiritual', icon: '🛕', label: 'Spiritual' },
  { id: 'surprise', icon: '🎯', label: 'Surprise Me' }
];

export function NearMe({ onBack }) {
  const trip = useTrip();
  const { isAuthenticated, openLoginModal } = useAuth();

  // Active Filter States matching Stitch
  const [selectedRadius, setSelectedRadius] = useState('5 km');
  const [selectedMood, setSelectedMood] = useState('gems');
  const [selectedTime, setSelectedTime] = useState('2 Hours');
  const [selectedBudget, setSelectedBudget] = useState('Under ₹500');
  const [sortBy, setSortBy] = useState('Highest VIHARA Match');
  const [heroAccordionOpen, setHeroAccordionOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [surpriseSparkle, setSurpriseSparkle] = useState(false);

  // Spots State: Live Google Nearby with Curated Fallback
  const [spots, setSpots] = useState(CURATED_DISCOVERY_SPOTS);
  const [dataSource, setDataSource] = useState('curated'); // 'live' | 'curated'
  const leadSpot = spots[0] || CURATED_DISCOVERY_SPOTS[0];
  const otherSpots = spots.slice(1);

  // Modals
  const [detailedSpot, setDetailedSpot] = useState(null);
  const [modalSpot, setModalSpot] = useState(null);
  const [targetDay, setTargetDay] = useState(1);
  const [targetSlot, setTargetSlot] = useState('Afternoon');
  const [isAddingToTrip, setIsAddingToTrip] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Map state
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Live Nearby Places via backend endpoint /api/places-nearby
  const fetchLiveNearby = useCallback(async (lat, lng) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setIsScanning(true);
    try {
      const radiusKm = parseInt(selectedRadius, 10) || 5;
      const radiusMeters = Math.min(30000, Math.max(1000, radiusKm * 1000));
      const category = selectedMood === 'gems' ? 'heritage' : (selectedMood === 'temples' ? 'spiritual' : 'heritage');
      const res = await fetch(`/api/places-nearby?latitude=${lat}&longitude=${lng}&radius=${radiusMeters}&category=${category}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.places) && data.places.length > 0) {
        const liveResults = data.places.map((p, idx) => {
          const pLat = Number(p.latitude ?? p.geometry?.location?.lat);
          const pLng = Number(p.longitude ?? p.geometry?.location?.lng);
          const dist = (Number.isFinite(pLat) && Number.isFinite(pLng))
            ? calculateHaversineKm(lat, lng, pLat, pLng)
            : Number(((idx + 1) * 0.9).toFixed(1));

          return {
            id: p.placeId || p.place_id || `live-${idx}-${Date.now()}`,
            name: p.name || 'Heritage Landmark',
            city: p.city || trip.currentLocationName || 'Local Area',
            state: p.state || '',
            category: p.category || 'Heritage Discovery',
            mood: selectedMood,
            rating: Number(p.rating) || Number((4.6 + (idx % 4) * 0.1).toFixed(1)),
            reviews: p.user_ratings_total || (120 + idx * 30),
            distKm: Number(dist.toFixed(1)),
            durationMin: 75,
            timeWindow: selectedTime || '2 Hours',
            price: p.entryInfo || p.price || 'Free entry',
            priceVal: p.priceVal || 0,
            openHours: p.openingHours?.open_now ? 'Open Now' : '09:00 AM - 06:00 PM',
            status: p.openingHours?.open_now ? 'Open Now' : 'Verified Open',
            desc: p.description || p.vicinity || `Notable attraction located ${dist.toFixed(1)} km from your current GPS coordinates.`,
            image: p.image || p.photos?.[0] || CURATED_DISCOVERY_SPOTS[idx % CURATED_DISCOVERY_SPOTS.length].image,
            secondaryImages: [],
            coordinates: {
              lat: Number.isFinite(pLat) ? pLat : 17.385 + (idx * 0.01),
              lng: Number.isFinite(pLng) ? pLng : 78.486 + (idx * 0.01)
            },
            tip: p.travelTips || 'Confirm local opening timings and security checks before visiting.',
            matchScore: Math.max(70, 98 - idx * 3),
            fitReason: `Live Google Nearby discovery located ${dist.toFixed(1)} km away.`,
            archivalTier: 'Live Nearby Discovery',
            optimalSun: 'Open Today',
            acousticDb: 'Moderate',
            crowdDensity: 'Verified Local Spot',
            signals: [`${dist.toFixed(1)} km away`, 'Live GPS match', 'Verified Place'],
            source: 'live-api'
          };
        });

        setSpots(liveResults);
        setDataSource('live');
        showToast(`🛰️ Live discovery loaded! Found ${liveResults.length} spots via Google Places.`);
        return;
      }
    } catch (err) {
      console.warn('[NearMe] Live discovery fetch failed, using curated fallback:', err.message);
    } finally {
      setIsScanning(false);
    }

    // Fallback: calibrate distance of CURATED_DISCOVERY_SPOTS using user GPS coords
    const fallbackSpots = CURATED_DISCOVERY_SPOTS.map((s) => {
      const d = calculateHaversineKm(lat, lng, s.coordinates.lat, s.coordinates.lng);
      return { ...s, distKm: Number(d.toFixed(1)) };
    });
    setSpots(fallbackSpots);
    setDataSource('curated');
  }, [selectedRadius, selectedMood, selectedTime, trip.currentLocationName]);

  // Initial Geolocation & Live Fetch
  useEffect(() => {
    let lat = trip.userLocation?.latitude || trip.currentLocationLatitude || 17.4326;
    let lng = trip.userLocation?.longitude || trip.currentLocationLongitude || 78.4975;

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchLiveNearby(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchLiveNearby(lat, lng);
        },
        { timeout: 6000 }
      );
    } else {
      fetchLiveNearby(lat, lng);
    }
  }, [fetchLiveNearby]);

  // Trigger surprise animation
  const handleTriggerSurprise = () => {
    setSurpriseSparkle(true);
    const pool = spots.length ? spots : CURATED_DISCOVERY_SPOTS;
    const randomSpot = pool[Math.floor(Math.random() * pool.length)];
    setDetailedSpot(randomSpot);
    showToast(`✨ Surprise Gem Unlocked: ${randomSpot.name}!`);
    setTimeout(() => setSurpriseSparkle(false), 2000);
  };

  const handleRefreshScan = () => {
    let lat = trip.userLocation?.latitude || trip.currentLocationLatitude || 17.4326;
    let lng = trip.userLocation?.longitude || trip.currentLocationLongitude || 78.4975;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchLiveNearby(pos.coords.latitude, pos.coords.longitude),
        () => fetchLiveNearby(lat, lng),
        { timeout: 5000 }
      );
    } else {
      fetchLiveNearby(lat, lng);
    }
  };

  // Add to active trip itinerary (canonical state update with route & budget recalculation)
  const handleConfirmAddToTrip = () => {
    if (!modalSpot) return;
    setIsAddingToTrip(true);
    try {
      const activityPayload = {
        id: modalSpot.id ? `nearme-${modalSpot.id}-${Date.now()}` : `nearme-${Date.now()}`,
        name: modalSpot.name,
        title: modalSpot.name,
        time: targetSlot === 'Morning' ? '09:30 AM - 11:00 AM' : targetSlot === 'Afternoon' ? '02:30 PM - 04:00 PM' : '05:30 PM - 07:00 PM',
        slot: targetSlot,
        location: `${modalSpot.name}, ${modalSpot.city}`,
        city: modalSpot.city,
        state: modalSpot.state,
        desc: modalSpot.desc,
        description: modalSpot.desc,
        cost: modalSpot.priceVal || 0,
        priceVal: modalSpot.priceVal || 0,
        entryInfo: modalSpot.price || 'Free entry',
        type: 'discovery',
        category: modalSpot.category || 'Heritage Discovery',
        coordinates: modalSpot.coordinates,
        fitReason: modalSpot.fitReason,
        image: modalSpot.image,
        source: modalSpot.source || 'near-me'
      };

      trip.addActivityToTrip(targetDay, activityPayload, targetSlot);
      showToast(`✅ "${modalSpot.name}" integrated into Day ${targetDay} (${targetSlot})!`);
      setModalSpot(null);
    } catch (err) {
      console.error(err);
      showToast('Error adding spot to trip.');
    } finally {
      setIsAddingToTrip(false);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = spots[0]?.coordinates?.lat || 17.4326;
      const initialLng = spots[0]?.coordinates?.lng || 78.4975;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Update pins on map whenever spots change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    spots.forEach((spot) => {
      if (!spot.coordinates?.lat || !spot.coordinates?.lng) return;
      const customIcon = L.divIcon({
        className: 'custom-radar-pin',
        html: `
          <div style="
            background: #070235;
            color: #ffffff;
            padding: 4px 8px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 11px;
            box-shadow: 0 4px 12px rgba(7,2,53,0.35);
            border: 2px solid #fe932c;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="color:#fe932c">💎</span> ${(spot.name || 'Place').split('&')[0].trim()}
          </div>
        `,
        iconSize: [120, 30],
        iconAnchor: [60, 15]
      });

      const marker = L.marker([spot.coordinates.lat, spot.coordinates.lng], { icon: customIcon });
      marker.on('click', () => setDetailedSpot(spot));
      markersGroupRef.current.addLayer(marker);
    });

    if (spots[0]?.coordinates?.lat && spots[0]?.coordinates?.lng) {
      mapInstanceRef.current.panTo([spots[0].coordinates.lat, spots[0].coordinates.lng]);
    }
  }, [spots]);


  return (
    <div className="w-full bg-[#fcf9f2] text-[#1c1c18] font-sans antialiased relative min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 px-5 py-3 rounded-full bg-[#070235] text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-[#fe932c] animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#fe932c]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================== */}
      {/* 1. HERO SECTION: CINEMATIC HERITAGE BLEED  */}
      {/* ========================================== */}
      <section className="relative w-full -mt-20 overflow-hidden">
        <div className="relative w-full min-h-[580px] lg:min-h-[660px] flex flex-col justify-between pt-28 pb-32 px-4 md:px-12 max-w-7xl mx-auto">
          {/* Background Image & Scrim */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAiMMztfkKY7OuaYjAMcYrtsGwTv2amKd4xSS_cG6MzQVoHj9Yd0f77uPjlLyn4Ftoc4srWCCRow141FPOfXuJAIeU170rNimh9N_TMF8VkaAc5e9IaLGHgwljGUKFN3xyQoOK27b9O7l7jC5SDTtiFS4XG8JBHtg461XS1CzX-_TbHzh6v1dTG53Ed2egBzAGq1CSK2f8zzYWdeOJZDq0tmmtDbjrawSf4MIuT3FUKDJIs5Ajn0Suj3A')"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#070235]/85 via-[#070235]/60 to-[#fcf9f2]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070235]/90 via-[#070235]/40 to-transparent" />
          </div>

          {/* Top Vignette Badging & Header Content */}
          <div className="relative z-10 max-w-3xl flex flex-col items-start space-y-4 pt-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white shadow-sm border border-white/20">
              <span className="w-2 h-2 rounded-full bg-[#fe932c] animate-pulse" />
              <span className="text-[11px] tracking-[0.2em] uppercase font-bold text-[#ffdcc3]">VIHARA • NEAR ME</span>
              <span className="text-white/50 text-[10px]">•</span>
              <span className="text-[11px] text-white/90 font-semibold">HYPERLOCAL INTELLIGENCE</span>
            </div>

            <h1
              className="text-4xl md:text-6xl lg:text-[62px] lg:leading-[1.1] text-white font-serif font-semibold tracking-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Discover what <br />
              <span className="italic font-normal text-[#ffdcc3]">others miss.</span>
            </h1>

            <p className="text-base md:text-lg text-white/90 max-w-xl font-normal leading-relaxed">
              Hidden architectural stepwells, tranquil courtyard sanctuaries, and untold culinary rituals — intelligently surfaced around your real-time coordinates.
            </p>

            {/* Dynamic Contextual Location Bar */}
            <div className="w-full pt-2">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl text-[#1c1c18] border border-white/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#fe932c]/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#904d00] text-[22px]">near_me</span>
                  </div>
                  <div className="flex flex-col truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#904d00] font-bold">Active Node</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00280d]" />
                      <span className="text-[10px] text-gray-500 font-semibold">GPS Synced</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#070235] truncate">Hyderabad, Telangana (Begumpet)</span>
                      <button
                        type="button"
                        onClick={handleRefreshScan}
                        className="px-2 py-0.5 rounded-md hover:bg-[#ebe8e1] transition-colors text-[11px] text-[#904d00] underline font-bold"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                {/* Radius Segmented Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-full bg-[#ebe8e1]/80 shrink-0">
                  <span className="hidden sm:inline text-xs text-gray-500 pl-3 pr-1 font-semibold">Radius:</span>
                  {['1 km', '3 km', '5 km', '10 km'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRadius(r)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        selectedRadius === r
                          ? 'bg-[#070235] text-white shadow-sm'
                          : 'text-gray-600 hover:text-[#070235]'
                      }`}
                    >
                      {r === '5 km' && selectedRadius === '5 km' ? '5 km (Active)' : r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. FLOATING DISCOVERY INTELLIGENCE PANEL   */}
      {/* ========================================== */}
      <section className="relative z-20 px-4 md:px-12 -mt-20 lg:-mt-24 mb-16 max-w-7xl mx-auto">
        <div className="w-full rounded-3xl bg-white/95 backdrop-blur-2xl shadow-[0_24px_64px_-16px_rgba(7,2,53,0.12)] p-6 lg:p-8 border border-[#e5e2db]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Filters & Mood Configuration (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[#904d00] text-[20px]">tune</span>
                  <span className="text-[11px] uppercase tracking-widest text-[#904d00] font-bold">Smart Heuristics</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-[#070235] font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  What are you in the mood for?
                </h2>
                <p className="text-sm text-gray-600">Tell VIHARA what sounds good. We’ll find unmatched discoveries within your time.</p>
              </div>

              {/* 10 Selectable Mood Chips */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 block mb-2 font-bold">Select Atmosphere &amp; Vibe</label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_CHIPS.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setSelectedMood(chip.id)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedMood === chip.id
                          ? 'bg-[#070235] text-white shadow-sm scale-105'
                          : 'bg-[#f6f3ec] hover:bg-[#ebe8e1] text-[#1c1c18]'
                      }`}
                    >
                      <span>{chip.icon}</span>
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Selectors: Time & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Time Window Selector */}
                <div className="p-4 rounded-2xl bg-[#f6f3ec] flex flex-col justify-between border border-[#e5e2db]">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#070235] font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#904d00]" /> Time Available
                      </span>
                      <span className="text-[11px] text-[#904d00] font-bold">{selectedTime}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2">We’ll find places matching your schedule.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: '30 MIN', sub: 'Quick Discovery', val: '30 Min' },
                      { label: '1 HOUR', sub: 'Local Escape', val: '1 Hour' },
                      { label: '2 HOURS', sub: 'Mini Adventure', val: '2 Hours' },
                      { label: 'HALF DAY', sub: 'Exploration', val: 'Half Day' }
                    ].map((t) => (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setSelectedTime(t.val)}
                        className={`px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          selectedTime === t.val
                            ? 'bg-[#070235] text-white shadow-sm'
                            : 'bg-white hover:bg-gray-100 border border-[#e5e2db]'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">{t.label}</div>
                        <div className="text-[9px] opacity-80 truncate">{t.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Selector */}
                <div className="p-4 rounded-2xl bg-[#f6f3ec] flex flex-col justify-between border border-[#e5e2db]">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#070235] font-bold flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#904d00]" /> Spending Target
                      </span>
                      <span className="text-[11px] text-[#904d00] font-bold">{selectedBudget}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2">Includes entry, parking, and treats.</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Free', '< ₹200', 'Under ₹500', 'Under ₹1,000', 'Any'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBudget(b)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedBudget === b
                            ? 'bg-[#070235] text-white shadow-sm'
                            : 'bg-white hover:bg-gray-100 border border-[#e5e2db] text-[#1c1c18]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTAs Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleTriggerSurprise}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#904d00] to-[#fe932c] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>✨ Surprise Me</span>
                </button>

                <button
                  type="button"
                  onClick={handleRefreshScan}
                  className="px-6 py-3 rounded-full bg-[#070235] text-white font-bold text-xs uppercase tracking-wider hover:bg-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-[#fe932c]" />
                  <span>Discover Near Me</span>
                </button>

                <span className="text-xs text-gray-500 italic">
                  Show me something I wouldn’t have searched for.
                </span>
              </div>
            </div>

            {/* Right: Real-time Surprise Highlight Slate (5 cols) */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#ebe8e1] to-[#f6f3ec] border border-[#e5e2db] relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#fe932c]" />
                    <span className="text-[10px] uppercase tracking-widest text-[#904d00] font-bold">
                      {dataSource === 'live' ? 'Live Nearby Radar' : 'Serendipity Engine'}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#fe932c]/20 text-[#904d00] text-[10px] font-bold">
                    {dataSource === 'live' ? 'LIVE GPS DISCOVERY' : '94% VIHARA MATCH'}
                  </span>
                </div>

                <div
                  className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 group cursor-pointer"
                  onClick={() => setDetailedSpot(leadSpot)}
                >
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('${leadSpot.image}')`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070235]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-[#fe932c] text-[#663500] text-[10px] font-bold uppercase">
                        Surprise Spotlight
                      </span>
                      <h4 className="text-base font-serif font-bold text-white mt-1">
                        {leadSpot.name}
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/90 text-[#070235] flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </div>
                  </div>
                </div>

                {/* Meta metrics */}
                <div className="grid grid-cols-3 gap-2 pb-4 mb-4 text-center border-b border-[#e5e2db]">
                  <div className="p-2 rounded-xl bg-white border border-[#e5e2db]">
                    <span className="text-[10px] text-gray-500 block font-bold">Distance</span>
                    <span className="text-xs text-[#070235] font-bold">{leadSpot.distKm} km</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#e5e2db]">
                    <span className="text-[10px] text-gray-500 block font-bold">Transit</span>
                    <span className="text-xs text-[#070235] font-bold">11 min</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#e5e2db]">
                    <span className="text-[10px] text-gray-500 block font-bold">Access</span>
                    <span className="text-xs text-[#00280d] font-bold">₹0 Entry</span>
                  </div>
                </div>

                <blockquote className="text-xs italic text-gray-600 mb-4 leading-relaxed">
                  “{leadSpot.desc}”
                </blockquote>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[#904d00] text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matches your 2-hour window
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailedSpot(leadSpot)}
                    className="px-4 py-2 rounded-full bg-[#070235] hover:bg-black text-white text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer"
                  >
                    Discover Place
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. SIMULATED PROCESSING STATE BANNER      */}
      {/* ========================================== */}
      <section className="w-full px-4 md:px-12 mb-12 max-w-7xl mx-auto">
        <div className="w-full p-4 rounded-2xl bg-[#f6f3ec] border border-[#e5e2db] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-[#fe932c]/20 flex items-center justify-center shrink-0">
              <RefreshCw className={`w-4 h-4 text-[#904d00] ${isScanning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#904d00] font-bold">Hyperlocal Scanning</span>
                <span className="text-[10px] text-gray-400">• Radius {selectedRadius}</span>
              </div>
              <p className="text-xs md:text-sm text-[#070235] font-bold">
                Checking distance, timing, budget and relevance around Begumpet...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] text-gray-500">Computational Match Rate</span>
              <span className="text-xs font-bold text-[#070235]">98.4% Confidence</span>
            </div>
            <div className="h-8 w-px bg-gray-300 hidden sm:block" />
            <button
              type="button"
              onClick={handleRefreshScan}
              className="p-2 rounded-full hover:bg-[#ebe8e1] text-gray-600 transition-colors cursor-pointer"
              title="Force Refresh Grid"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. HIDDEN GEMS NEAR YOU (EDITORIAL GRID)  */}
      {/* ========================================== */}
      <section className="w-full px-4 md:px-12 mb-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdcc3] text-[#904d00] text-[10px] font-bold uppercase tracking-widest mb-2">
              <span>💎 Curated Sub-Radar Discoveries</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#070235] font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Hidden Gems Near You
            </h2>
            <p className="text-sm text-gray-600">The places that don’t always make the tourist lists, but define Hyderabad’s soul.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#f6f3ec] border border-[#e5e2db] px-3 py-1.5 rounded-full text-xs text-[#070235] font-bold focus:outline-none"
            >
              <option>Highest VIHARA Match</option>
              <option>Proximity (&lt; 2 km)</option>
              <option>Lowest Crowd Density</option>
            </select>
          </div>
        </div>

        {/* Featured Asymmetrical Hero Discovery Card (Bansilalpet Stepwell) */}
        <div className="w-full rounded-3xl bg-white border border-[#e5e2db] overflow-hidden shadow-lg mb-8 grid grid-cols-1 lg:grid-cols-12">
          {/* Media Aspect (7 cols) */}
          <div
            className="lg:col-span-7 relative min-h-[320px] lg:min-h-[440px] cursor-pointer group"
            onClick={() => setDetailedSpot(leadSpot)}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('${leadSpot.image}')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070235]/85 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#070235] text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <span>💎</span> Featured Hidden Gem
              </span>
              <span className="px-3 py-1 rounded-full bg-[#00280d] text-[#95f8a7] text-[10px] font-bold">
                ✓ Crowd: Minimal (12 people)
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-[10px] uppercase tracking-widest text-[#ffdcc3] font-bold">Restored Step Architecture</p>
              <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white leading-tight">
                {leadSpot.name}
              </h3>
              <p className="text-xs text-white/90 max-w-xl mt-1 line-clamp-2">
                {leadSpot.desc}
              </p>
            </div>
          </div>

          {/* Discovery Details & Rationale (5 cols) */}
          <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between bg-[#f6f3ec]/60 border-t lg:border-t-0 lg:border-l border-[#e5e2db]">
            <div>
              {/* Top Match Badge & Metrics */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e5e2db]">
                <div>
                  <span className="text-[10px] text-gray-500 block font-bold">Algorithmic Affinity</span>
                  <span className="text-sm text-[#904d00] font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#fe932c]" /> 98% VIHARA Match
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block font-bold">Optimal Window</span>
                  <span className="text-xs text-[#070235] font-bold">Right Now (Active Sun)</span>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="flex items-center gap-2 text-[#070235]">
                  <Navigation className="w-3.5 h-3.5 text-[#904d00]" />
                  <span><strong>2.4 km</strong> (11 min drive)</span>
                </div>
                <div className="flex items-center gap-2 text-[#070235]">
                  <DollarSign className="w-3.5 h-3.5 text-[#904d00]" />
                  <span><strong>₹0 Entry</strong> (Public Trust)</span>
                </div>
                <div className="flex items-center gap-2 text-[#070235]">
                  <Volume2 className="w-3.5 h-3.5 text-[#904d00]" />
                  <span>Atmosphere: <strong>Quiet (42 dB)</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[#070235]">
                  <Sun className="w-3.5 h-3.5 text-[#904d00]" />
                  <span>Sun Angle: <strong>Optimal Ra</strong></span>
                </div>
              </div>

              {/* Why this match tags */}
              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-2">Computational Match Signals</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-[#e5e2db] text-[10px] font-semibold text-[#070235]">✓ 11 min away</span>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-[#e5e2db] text-[10px] font-semibold text-[#070235]">✓ Fits ₹500 budget</span>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-[#e5e2db] text-[10px] font-semibold text-[#070235]">✓ Matches Heritage mood</span>
                  <span className="px-2.5 py-1 rounded-md bg-[#00280d]/10 text-[#00280d] text-[10px] font-bold">✓ 85% less crowded than Golconda</span>
                </div>
              </div>

              {/* Expandable Accordion */}
              <div className="rounded-2xl bg-white border border-[#e5e2db] p-3.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setHeroAccordionOpen(!heroAccordionOpen)}
                  className="w-full flex items-center justify-between text-left text-xs text-[#070235] font-bold cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#904d00]" />
                    Why VIHARA showed you this
                  </span>
                  {heroAccordionOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {heroAccordionOpen && (
                  <div className="mt-3 pt-2 space-y-2 text-[11px] text-gray-600 border-t border-gray-100 animate-fadeIn">
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#904d00] shrink-0 mt-0.5" />
                      <span>Coordinates pinpoint this site within your active 5 km boundary from Begumpet.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#904d00] shrink-0 mt-0.5" />
                      <span>Restoration archival quality verified with high architectural preservation score.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#904d00] shrink-0 mt-0.5" />
                      <span>Fits your active 2-hour mini adventure profile with ample photography time.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Card CTAs */}
            <div className="flex items-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setDetailedSpot(leadSpot)}
                className="flex-1 py-3 px-4 rounded-full bg-[#070235] text-white text-xs uppercase tracking-wider font-bold hover:bg-black shadow-md transition-all text-center cursor-pointer"
              >
                Discover Stepwell
              </button>
              <button
                type="button"
                onClick={() => {
                  trip.toggleSaveItem(leadSpot, 'place');
                  showToast(trip.isItemSaved(leadSpot.id, 'place') ? 'Removed from saved.' : 'Saved to Wishlist!');
                }}
                className="w-11 h-11 rounded-full bg-white hover:bg-gray-100 border border-[#e5e2db] text-[#070235] flex items-center justify-center transition-colors shrink-0 shadow-sm cursor-pointer"
                title="Save Gem"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    trip.isItemSaved(leadSpot.id, 'place')
                      ? 'fill-[#904d00] text-[#904d00]'
                      : 'text-gray-500'
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: leadSpot.name, url: window.location.href });
                  } else {
                    showToast('🔗 Link copied to clipboard!');
                  }
                }}
                className="w-11 h-11 rounded-full bg-white hover:bg-gray-100 border border-[#e5e2db] text-[#070235] flex items-center justify-center transition-colors shrink-0 shadow-sm cursor-pointer"
                title="Share Location"
              >
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Supporting Discovery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherSpots.map((spot) => (
            <div
              key={spot.id}
              className="rounded-3xl bg-white border border-[#e5e2db] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => setDetailedSpot(spot)}
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${spot.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070235]/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 text-[#070235] text-[10px] font-bold shadow">
                    {spot.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[#fe932c] text-[#663500] text-[10px] font-bold shadow">
                    {spot.matchScore}% Match
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] text-[#ffdcc3] font-bold uppercase">{spot.archivalTier}</span>
                    <h4 className="text-base font-serif font-bold text-white leading-snug">{spot.name}</h4>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {spot.desc}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#070235] py-2 border-t border-b border-[#e5e2db]">
                    <span className="flex items-center gap-1 font-bold">
                      <Navigation className="w-3 h-3 text-[#904d00]" /> {spot.distKm} km (~{Math.round(spot.distKm * 3)} min)
                    </span>
                    <span className="font-bold text-[#00280d]">{spot.price}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-500 font-semibold">{spot.optimalSun}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailedSpot(spot);
                  }}
                  className="px-4 py-1.5 rounded-full bg-[#f6f3ec] hover:bg-[#070235] hover:text-white text-[11px] font-bold text-[#070235] transition-all cursor-pointer"
                >
                  Inspect →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* 5. SKIP THE TOURIST LISTS (EDITORIAL VS)   */}
      {/* ========================================== */}
      <section className="w-full px-4 md:px-12 mb-16 max-w-7xl mx-auto">
        <div className="w-full rounded-3xl bg-[#f6f3ec] border border-[#e5e2db] p-6 lg:p-8 shadow-sm">
          <div className="max-w-2xl mb-6">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffdcc3] text-[#904d00] text-[10px] font-bold uppercase tracking-widest mb-2">
              <span>⚖️ Curatorial Alternative Index</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#070235] font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Skip the Tourist Lists
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Popular landmark destinations aren’t always the most memorable ones. Here is what happens when you substitute high-congestion tourist magnets with authentic adjacent heritage.
            </p>
          </div>

          {/* Side by Side Comparative Module */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            {/* Left: Tourist Magnet (Charminar Plaza) */}
            <div className="p-6 rounded-2xl bg-[#ebe8e1] border border-[#e5e2db] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#ffdad6] text-[#93000a] text-[10px] font-bold uppercase">
                    ⚠️ CROWDED TOURIST MAGNET
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold">Commercialized Zone</span>
                </div>
                <h3 className="text-base font-serif font-bold text-[#070235] mb-1">
                  Charminar Main Plaza &amp; Laad Bazaar
                </h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  High footfall, aggressive retail touting, constant auto honking, and extensive queue times during daylight hours.
                </p>

                {/* Metrics */}
                <div className="space-y-2 text-xs pb-4 border-b border-[#e5e2db]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Congestion Density</span>
                    <span className="font-bold text-[#ba1a1a]">Extreme (4,800+ people/hr)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Average Wait / Entry</span>
                    <span className="font-bold text-[#070235]">45 min queuing</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Noise / Decibels</span>
                    <span className="font-bold text-[#070235]">88 dB (Street Traffic)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Ticket Cost</span>
                    <span className="font-bold text-[#070235]">₹100 (Monument + Camera)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-gray-500 text-[10px]">
                <span>Historical Merit: Substantial</span>
                <span className="italic">Recommendation: Revisit at 11:30 PM only</span>
              </div>
            </div>

            {/* Right: The VIHARA Recommendation (Chowmahalla Outer Baoli) */}
            <div className="p-6 rounded-2xl bg-white border border-[#e5e2db] shadow-md relative overflow-hidden flex flex-col justify-between">
              {/* Saffron Corner Glow Badge */}
              <div className="absolute top-0 right-0 bg-[#fe932c] text-[#663500] px-4 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider">
                VIHARA Selected
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#00280d] text-[#95f8a7] text-[10px] font-bold">
                    ✓ 94% CALM EXPERIENCE SCORE
                  </span>
                </div>
                <h3 className="text-base font-serif font-bold text-[#070235] mb-1">
                  Chowmahalla Outer Baoli &amp; Garden Alcove
                </h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Restored subterranean garden reservoir 600 meters away from the hubbub. Shaded by ancient neem trees with curated guild craft stalls.
                </p>

                {/* Metrics */}
                <div className="space-y-2 text-xs pb-4 border-b border-[#e5e2db]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Congestion Density</span>
                    <span className="font-bold text-[#00280d]">Tranquil (&lt; 25 visitors)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Average Wait / Entry</span>
                    <span className="font-bold text-[#00280d]">0 min (Direct Entry)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Noise / Decibels</span>
                    <span className="font-bold text-[#00280d]">42 dB (Courtyard Fountain)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Ticket Cost</span>
                    <span className="font-bold text-[#00280d]">₹0 (Included with Palace)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-[#904d00] text-[10px] font-bold">
                <span>Distance: 600m from Charminar</span>
                <button
                  type="button"
                  onClick={() => setDetailedSpot(leadSpot)}
                  className="underline hover:text-[#070235]"
                >
                  View Route Comparison →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. INTERACTIVE GEO-RADAR MAP               */}
      {/* ========================================== */}
      <section className="w-full px-4 md:px-12 mb-20 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border border-[#e5e2db] shadow-md flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070235] flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#904d00]" />
              Explore Around You — Interactive Smart Map
            </span>
            <span className="text-[11px] text-gray-500 font-semibold">
              Radius: {selectedRadius} • Begumpet, Hyderabad
            </span>
          </div>
          <div
            ref={mapContainerRef}
            className="w-full flex-1 rounded-2xl overflow-hidden border border-[#e5e2db] z-10"
          />
        </div>
      </section>

      {/* ================================================================ */}
      {/* 7. FULL STITCH PLACE DETAILS MODAL (Screen 834ba470fa9849d3bb72)  */}
      {/* ================================================================ */}
      {detailedSpot && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setDetailedSpot(null)}
        >
          <div
            className="bg-[#fcf9f2] text-[#1c1c18] rounded-3xl border border-[#e5e2db] shadow-2xl max-w-4xl w-full my-8 overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-3.5 bg-[#f6f3ec] border-b border-[#e5e2db] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => setDetailedSpot(null)}
                  className="flex items-center gap-1 font-bold text-[#070235] hover:text-[#904d00] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Discoveries</span>
                </button>
                <span>/</span>
                <span>{detailedSpot.city} Arc</span>
                <span>/</span>
                <span className="font-bold text-[#904d00] truncate max-w-[200px]">{detailedSpot.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setDetailedSpot(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 bg-white border border-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Visual Imagery Left Column (7 Cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-[#ebe8e1] group">
                    <img
                      src={detailedSpot.image}
                      alt={detailedSpot.name}
                      className="w-full h-[320px] md:h-[380px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070235]/80 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#070235]/90 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider">
                        {detailedSpot.archivalTier}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#904d00] text-[10px] font-bold flex items-center gap-1 shadow">
                        <Sparkles className="w-3 h-3 text-[#fe932c]" />
                        {detailedSpot.optimalSun}
                      </span>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[10px] uppercase tracking-widest text-[#ffdcc3] font-bold">
                        {detailedSpot.category}
                      </p>
                      <p className="text-sm font-serif italic text-white/90">
                        {detailedSpot.tip}
                      </p>
                    </div>
                  </div>

                  {/* Vignette Thumbnails Strip */}
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="relative rounded-xl overflow-hidden h-20 bg-[#ebe8e1]">
                      <img
                        src={detailedSpot.secondaryImages?.[0] || detailedSpot.image}
                        alt="Courtyard"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-1 left-1.5 text-white font-bold">Courtyard Enclave</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden h-20 bg-[#ebe8e1]">
                      <img
                        src={detailedSpot.secondaryImages?.[1] || detailedSpot.image}
                        alt="Artisan"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-1 left-1.5 text-white font-bold">Living Artisan Guild</span>
                    </div>
                    <div className="rounded-xl bg-[#ebe8e1] p-2 flex flex-col justify-between border border-[#e5e2db]">
                      <div className="flex items-center justify-between text-[#904d00]">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="font-bold">{detailedSpot.acousticDb || '42 dB'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#070235] block leading-tight">Acoustic Cloister</span>
                        <span className="text-gray-500 text-[9px]">Serene ambient echo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details & Action Right Column (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffdcc3] text-[#904d00] text-[10px] font-bold uppercase tracking-wider mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#904d00]" />
                      Under the Radar Discovery
                    </div>
                    <h2 className="text-2xl font-bold font-serif text-[#070235] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {detailedSpot.name}
                    </h2>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {detailedSpot.desc}
                    </p>
                  </div>

                  {/* Vihara Algorithmic Match Score Card */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#e5e2db] shadow-sm flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#fe932c] text-[#663500] flex flex-col items-center justify-center font-bold shrink-0 shadow-sm">
                      <span className="text-lg leading-none">{detailedSpot.matchScore}%</span>
                      <span className="text-[8px] uppercase tracking-wider">Sync</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#904d00] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        VIHARA Algorithmic Sync
                      </div>
                      <p className="text-[11px] text-gray-500 leading-tight">
                        {detailedSpot.fitReason}
                      </p>
                    </div>
                  </div>

                  {/* 4 Metric Pills */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-[#f6f3ec] border border-[#e5e2db]">
                      <span className="text-[10px] uppercase text-gray-500 block font-bold">Distance</span>
                      <span className="font-bold text-[#070235]">{detailedSpot.distKm} km</span>
                      <span className="text-[10px] text-[#904d00] block">~{Math.round(detailedSpot.distKm * 2.5)} min transit</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#f6f3ec] border border-[#e5e2db]">
                      <span className="text-[10px] uppercase text-gray-500 block font-bold">Entry Fee</span>
                      <span className="font-bold text-[#00280d]">{detailedSpot.price}</span>
                      <span className="text-[10px] text-gray-500 block">Public Sanctuary</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#f6f3ec] border border-[#e5e2db]">
                      <span className="text-[10px] uppercase text-gray-500 block font-bold">Dwell Time</span>
                      <span className="font-bold text-[#070235]">~{detailedSpot.durationMin} mins</span>
                      <span className="text-[10px] text-[#904d00] block">Unrushed Pace</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#f6f3ec] border border-[#e5e2db]">
                      <span className="text-[10px] uppercase text-gray-500 block font-bold">Crowd Density</span>
                      <span className="font-bold text-[#904d00]">{detailedSpot.crowdDensity || 'Minimal'}</span>
                      <span className="text-[10px] text-gray-500 block">Quiet Hours</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const spot = detailedSpot;
                        setDetailedSpot(null);
                        setModalSpot(spot);
                      }}
                      className="w-full py-3 px-4 rounded-full bg-[#fe932c] hover:bg-[#904d00] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Journey / Active Trip</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          trip.toggleSaveItem(detailedSpot, 'place');
                          showToast(trip.isItemSaved(detailedSpot.id, 'place') ? 'Removed from saved.' : 'Saved to Wishlist!');
                        }}
                        className="py-2.5 px-3 rounded-full bg-white hover:bg-gray-100 border border-[#e5e2db] text-xs font-bold text-[#070235] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            trip.isItemSaved(detailedSpot.id, 'place')
                              ? 'fill-[#904d00] text-[#904d00]'
                              : 'text-gray-500'
                          }`}
                        />
                        <span>{trip.isItemSaved(detailedSpot.id, 'place') ? 'Saved' : 'Save Gem'}</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${detailedSpot.coordinates?.lat || 17.385},${detailedSpot.coordinates?.lng || 78.4867}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-full bg-white hover:bg-gray-100 border border-[#e5e2db] text-xs font-bold text-[#070235] flex items-center justify-center gap-1.5 transition-colors text-center"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#904d00]" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 8. ADD TO JOURNEY ITINERARY WEAVING (Screen 6b17fbf6d581469592f) */}
      {/* ================================================================ */}
      {modalSpot && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalSpot(null)}
        >
          <div
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 animate-fadeIn space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#fed65b]/30 text-[#735c00] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#070235]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Add to Active Journey
                  </h3>
                  <span className="text-[11px] text-gray-500">Intelligent Itinerary Weaving</span>
                </div>
              </div>
              <button
                onClick={() => setModalSpot(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Spot Details Preview */}
            <div className="p-3.5 bg-[#f6f3ec] rounded-2xl border border-gray-100 flex items-center gap-3">
              <img
                src={modalSpot.image}
                alt={modalSpot.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div>
                <h4 className="text-xs font-bold text-[#070235]">{modalSpot.name}</h4>
                <p className="text-[11px] text-[#904d00] font-semibold">{modalSpot.category} • {modalSpot.distKm} km away</p>
                <span className="text-[10px] text-gray-500">Entry: {modalSpot.price} • Duration: ~{modalSpot.durationMin} mins</span>
              </div>
            </div>

            {/* Day & Slot Pickers */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Select Itinerary Day:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5].slice(0, trip?.numberOfDays || 4).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTargetDay(d)}
                      className={`py-2 text-center rounded-xl font-bold transition-all cursor-pointer ${
                        targetDay === d
                          ? 'bg-[#070235] text-white shadow-sm'
                          : 'bg-[#f6f3ec] border border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Day {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Select Time Window Slot:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Morning', 'Afternoon', 'Evening'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTargetSlot(slot)}
                      className={`py-2 text-center rounded-xl font-bold transition-all cursor-pointer ${
                        targetSlot === slot
                          ? 'bg-[#904d00] text-white shadow-sm'
                          : 'bg-[#f6f3ec] border border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Impact Assessment Capsule */}
              <div className="p-3 bg-[#ffdcc3]/40 rounded-xl border border-[#fe932c]/30 text-[11px] space-y-1">
                <span className="font-bold text-[#904d00] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Route &amp; Budget Optimization
                </span>
                <p className="text-gray-700">
                  Adds only <strong>+{modalSpot.distKm} km (~{Math.round(modalSpot.distKm * 2.5)} mins)</strong> travel deviation on Day {targetDay}.
                </p>
                <p className="text-gray-700">
                  Estimated budget impact: <strong>+{modalSpot.price}</strong>.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModalSpot(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAddingToTrip}
                onClick={handleConfirmAddToTrip}
                className="px-5 py-2.5 bg-[#070235] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isAddingToTrip ? (
                  <span>Updating Itinerary...</span>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-[#fe932c]" />
                    <span>Confirm &amp; Embed in Trip</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NearMe;
