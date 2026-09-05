import React from 'react';
import { Hotel, Plane, Train, ArrowLeft, Star } from 'lucide-react';

export function StaysAndTravel({ onBack }) {
  const stays = [
    { name: 'The Imperial New Delhi', type: 'Heritage 5-Star Hotel', city: 'Connaught Place, Delhi', rate: '₹14,500/night', rating: 4.9, desc: 'Iconic Art Deco architecture surrounded by lush royal palm gardens.' },
    { name: 'Taj Falaknuma Palace', type: 'Royal Nizam Palace', city: 'Engine Bowli, Hyderabad', rate: '₹32,000/night', rating: 5.0, desc: 'Opulent palace perched 2,000 feet above Hyderabad with horse-drawn carriage entry.' },
    { name: 'Taj Fort Aguada Resort & Spa', type: 'Luxury Coastal Resort', city: 'Sinquerim, Goa', rate: '₹18,000/night', rating: 4.8, desc: 'Portuguese ramparts overlooking the Arabian sea with private villa pavilions.' }
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
          Royal Hospitality & Transit
        </span>
        <h1
          className="text-3xl md:text-4xl font-bold text-[#0d1c32] mt-1"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Stays & Luxury Travel
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Verified heritage palace retreats, boutique havelis, and Vande Bharat express reservations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stays.map((stay, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#735c00] bg-[#ffe088]/20 px-2.5 py-0.5 rounded-full">
                  {stay.type}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-[#0d1c32]">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" /> {stay.rating}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#0d1c32] mb-1">{stay.name}</h3>
              <span className="text-xs text-gray-500 block mb-2">{stay.city}</span>
              <p className="text-xs text-gray-600 leading-relaxed">{stay.desc}</p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs">
              <span className="font-bold text-[#0d1c32]">{stay.rate}</span>
              <button
                onClick={() => alert(`Inquiring for ${stay.name}`)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0d1c32] text-white text-xs font-bold uppercase hover:bg-black transition-colors"
              >
                Inquire
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StaysAndTravel;
