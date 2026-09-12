import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStays } from '../../context/StaysContext';

export function StaysSplitMapView({ hotels = [], onSelectHotel }) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const { searchParams, tripContextData } = useStays();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Determine center coordinates based on destination or first hotel
    const defaultCenter = [15.5937, 73.7438]; // Goa default
    const center = hotels.length > 0 && hotels[0].latitude
      ? [hotels[0].latitude, hotels[0].longitude]
      : defaultCenter;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 12,
      scrollWheelZoom: true
    });

    // CartoDB Positron / Heritage Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    const bounds = L.latLngBounds();

    // 1. Plot Trip Itinerary Attractions (Blue Heritage Pins) if active trip exists
    const placeCards = tripContextData?.placeCards || [];
    if (placeCards.length > 0) {
      const attractionCoords = [];
      placeCards.forEach((place, index) => {
        const lat = place.latitude || (15.5 + (index * 0.04));
        const lng = place.longitude || (73.75 + (index * 0.03));
        const latLng = [lat, lng];
        attractionCoords.push(latLng);
        bounds.extend(latLng);

        const attractionIcon = L.divIcon({
          className: 'vihara-attraction-marker',
          html: `
            <div style="
              background: #0d1c32;
              color: #fdc66b;
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-size: 11px;
              font-weight: 700;
              padding: 4px 8px;
              border-radius: 9999px;
              border: 2px solid #fdc66b;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
            ">
              <span>📍 Day ${index + 1}: ${place.placeName || place.title || 'Attraction'}</span>
            </div>
          `,
          iconSize: [120, 30],
          iconAnchor: [60, 15]
        });

        L.marker(latLng, { icon: attractionIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <div style="font-size: 10px; color: #7c2e0c; font-weight: bold; text-transform: uppercase;">Planned Trip Excursion</div>
              <div style="font-weight: bold; color: #1c1c17; font-size: 13px;">${place.placeName || place.title}</div>
              <div style="font-size: 11px; color: #55433c; margin-top: 2px;">${place.city || searchParams.destination}</div>
            </div>
          `);
      });

      // Draw dashed itinerary connecting line
      if (attractionCoords.length > 1) {
        L.polyline(attractionCoords, {
          color: '#0d1c32',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.6
        }).addTo(map);
      }
    }

    // 2. Plot Hotel Sanctuaries (Terracotta & Gold Custom Pins)
    hotels.forEach((hotel, idx) => {
      const lat = hotel.latitude || (15.58 + (idx * 0.03));
      const lng = hotel.longitude || (73.74 + (idx * 0.02));
      const latLng = [lat, lng];
      bounds.extend(latLng);

      const hotelIcon = L.divIcon({
        className: 'vihara-hotel-marker',
        html: `
          <div style="
            background: #7c2e0c;
            color: #ffffff;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 11px;
            font-weight: 700;
            padding: 5px 10px;
            border-radius: 9999px;
            border: 2px solid #fdc66b;
            box-shadow: 0 4px 14px rgba(124, 46, 12, 0.4);
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            white-space: nowrap;
          ">
            <span style="background: #fdc66b; color: #281900; font-size: 9px; padding: 1px 4px; border-radius: 4px;">${hotel.smartMatchScore || 94}%</span>
            <span>₹${(hotel.pricePerNight || 4800).toLocaleString()}</span>
          </div>
        `,
        iconSize: [110, 32],
        iconAnchor: [55, 16]
      });

      const marker = L.marker(latLng, { icon: hotelIcon }).addTo(map);

      // Popup with photo and details
      const popupContent = document.createElement('div');
      popupContent.style.width = '220px';
      popupContent.style.fontFamily = 'Plus Jakarta Sans, sans-serif';
      popupContent.innerHTML = `
        <div style="border-radius: 8px; overflow: hidden; margin-bottom: 8px;">
          <img src="${hotel.heroImage}" style="width: 100%; height: 100px; object-fit: cover;" alt="${hotel.name}" />
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 9px; font-weight: bold; color: #7c2e0c; text-transform: uppercase;">${hotel.city}</span>
          <span style="background: #fdc66b; color: #281900; font-size: 9px; font-weight: bold; padding: 1px 6px; border-radius: 999px;">${hotel.smartMatchScore}% Match</span>
        </div>
        <h4 style="font-size: 13px; font-weight: bold; color: #1c1c17; margin: 0 0 4px 0; line-height: 1.3;">${hotel.name}</h4>
        <div style="font-size: 11px; color: #55433c; margin-bottom: 8px;">★ ${hotel.rating} • ${hotel.location}</div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 13px; font-weight: bold; color: #7c2e0c;">₹${hotel.pricePerNight?.toLocaleString()}<span style="font-size: 10px; color: #55433c; font-weight: normal;">/nt</span></span>
          <button id="view-stay-btn-${hotel.id}" style="
            background: #7c2e0c;
            color: #ffffff;
            border: none;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: bold;
            cursor: pointer;
          ">View Suites</button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-stay-btn-${hotel.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectHotel) onSelectHotel(hotel);
          };
        }
      });
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [hotels, tripContextData]);

  return (
    <div className="w-full h-full min-h-[500px] lg:min-h-[640px] rounded-2xl overflow-hidden border border-[#dcc1b8] shadow-md relative bg-[#f1eee6]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] lg:min-h-[640px]" />
      <div className="absolute top-4 right-4 z-[400] bg-[#fcf9f1]/95 backdrop-blur-md p-3 rounded-xl border border-[#dcc1b8] shadow-md text-xs space-y-1.5 max-w-xs pointer-events-auto">
        <div className="font-bold text-[#7c2e0c] uppercase text-[10px] tracking-wider">
          Interactive Map Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#7c2e0c] border border-[#fdc66b]"></span>
          <span className="text-[#1c1c17]">Handpicked Luxury Sanctuary</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#0d1c32] border border-[#fdc66b]"></span>
          <span className="text-[#1c1c17]">Planned Trip Itinerary Excursion</span>
        </div>
      </div>
    </div>
  );
}

export default StaysSplitMapView;
