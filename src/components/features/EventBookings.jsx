import React from 'react';
import { Calendar, MapPin, Tag, ArrowLeft } from 'lucide-react';

export function EventBookings({ onBack }) {
  const events = [
    { title: 'Ganga Aarti Spiritual Ceremony', city: 'Varanasi', date: 'Daily at Sunset', price: 'Free Entry / VIP Seating ₹500', desc: 'Mesmerizing evening ritual of brass lamps and Vedic chants on Dashashwamedh Ghat.' },
    { title: 'Surajkund International Crafts Mela', city: 'Delhi NCR', date: 'Feb 01 - 15', price: '₹120 Entry', desc: 'Grand showcase of Indian regional handicrafts, folk dances, and traditional artisans.' },
    { title: 'Jaipur Literature & Heritage Festival', city: 'Jaipur', date: 'Jan 28 - Feb 02', price: '₹350 Delegate Pass', desc: 'The world’s largest free literary festival hosted at the historic Diggi Palace.' },
    { title: 'Sunburn Festival & Goa Beach Fiesta', city: 'Goa', date: 'Dec 28 - 31', price: '₹2,500 Pass', desc: 'Asia’s premier music and beach carnival along the Arabian coastline.' }
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
          Cultural Festivities
        </span>
        <h1
          className="text-3xl md:text-4xl font-bold text-[#0d1c32] mt-1"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Curated Cultural Experiences
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Reserve access to spiritual aartis, traditional craft fairs, and authentic musical festivals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#735c00]">
                  <MapPin className="w-3.5 h-3.5" /> {evt.city}
                </span>
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {evt.date}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0d1c32] mb-1">{evt.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{evt.desc}</p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs">
              <span className="font-bold text-[#0d1c32]">{evt.price}</span>
              <button
                onClick={() => alert(`Selected ${evt.title} for booking.`)}
                className="px-4 py-1.5 rounded-lg bg-[#0d1c32] text-white text-xs font-bold uppercase hover:bg-black transition-colors"
              >
                Reserve Seat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventBookings;
