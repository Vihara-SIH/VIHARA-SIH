import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export function HotelGalleryModal({ hotel, isOpen, onClose }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!isOpen || !hotel) return null;

  const images = hotel.gallery?.length > 0 ? hotel.gallery : [hotel.heroImage];

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-fadeIn"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-white pb-4 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
        <div>
          <h3 className="text-lg md:text-xl font-bold" style={{ fontFamily: 'Noto Serif, serif' }}>
            {hotel.name}
          </h3>
          <p className="text-xs text-white/70">{hotel.location}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/70 font-semibold">
            {activeIdx + 1} / {images.length}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[activeIdx]}
          alt={`${hotel.name} - Photo ${activeIdx + 1}`}
          className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex justify-center gap-3 overflow-x-auto py-2" onClick={(e) => e.stopPropagation()}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                activeIdx === idx ? 'border-[#D4AF37] scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default HotelGalleryModal;
