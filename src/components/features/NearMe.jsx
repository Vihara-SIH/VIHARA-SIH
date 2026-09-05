import React from 'react';
import { MapPin, Navigation, Star, ArrowLeft } from 'lucide-react';

export function NearMe({ onBack }) {
  const nearbySpots = [
    { name: 'Humayun’s Tomb', dist: '2.4 km', category: 'Heritage', rating: 4.8, desc: 'Magnificent Mughal garden tomb precursor to the Taj Mahal.' },
    { name: 'Lotus Temple', dist: '5.1 km', category: 'Spiritual', rating: 4.7, desc: 'Iconic Baháʼí House of Worship with petal architecture.' },
    { name: 'Qutub Minar Complex', dist: '8.2 km', category: 'Heritage', rating: 4.9, desc: '73-meter tall fluted red sandstone minaret and Iron Pillar.' },
    { name: 'Hauz Khas Village & Lake', dist: '6.7 km', category: 'Nature & Culture', rating: 4.6, desc: 'Medieval water reservoir, madrasa ruins, and bohemian cafes.' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-6">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#0d1c32] uppercase hover:bg-gray-100 transition-colors flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-[#735c00] font-bold">
          Geo-Location Discovery
        </span>
        <h1
          className="text-3xl md:text-4xl font-bold text-[#0d1c32] mt-1"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Near Me Explorer
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Discover verified heritage sites, holy sanctums, and scenic spots around your current location.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {nearbySpots.map((spot, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#735c00] bg-[#ffe088]/20 px-2.5 py-0.5 rounded-full">
                  {spot.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-[#0d1c32]">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" /> {spot.rating}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0d1c32] mb-1">{spot.name}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{spot.desc}</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mt-4 pt-3 border-t border-gray-100">
              <Navigation className="w-3.5 h-3.5 text-[#735c00]" />
              <span>{spot.dist} away from current location</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NearMe;
