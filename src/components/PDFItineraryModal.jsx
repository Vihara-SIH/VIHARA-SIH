import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  MapPin,
  Calendar,
  Users,
  Compass,
  CheckCircle,
  Clock,
  Sun,
  Shield,
  Phone,
  Mail
} from 'lucide-react';

export function PDFItineraryModal({
  isOpen,
  onClose,
  tripTitle,
  currentLocation,
  destinationOrder,
  startDate,
  endDate,
  numberOfDays,
  numberOfTravelers,
  travelType,
  generatedItinerary,
  placeCards,
  routeData
}) {
  const printRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${tripTitle} - VIHARA Travel Dossier</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Inter:wght@400;500;600;700&family=Kalam:wght@700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Inter', sans-serif;
              color: #1a1c19;
              background: #fdfdfc;
              padding: 24px;
              line-height: 1.5;
            }
            .page {
              background: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 32px;
              margin-bottom: 32px;
              page-break-after: always;
              max-width: 800px;
              margin-left: auto;
              margin-right: auto;
              position: relative;
            }
            .page:last-child { page-break-after: auto; }
            .cover-hero {
              height: 380px;
              border-radius: 16px;
              background-size: cover;
              background-position: center;
              position: relative;
              overflow: hidden;
              margin-bottom: 24px;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
              padding: 28px;
              color: #ffffff;
            }
            .cover-overlay {
              position: absolute;
              inset: 0;
              background: linear-gradient(to top, rgba(13,28,50,0.92) 0%, rgba(13,28,50,0.3) 60%, transparent 100%);
            }
            .gold-badge {
              background: #D4AF37;
              color: #0d1c32;
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              padding: 4px 12px;
              border-radius: 999px;
              display: inline-block;
              margin-bottom: 8px;
              position: relative;
              z-index: 2;
            }
            .route-strip {
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: #fafaf5;
              border: 1px dashed #D4AF37;
              padding: 12px 18px;
              border-radius: 10px;
              margin-bottom: 20px;
              font-weight: 600;
              font-size: 13px;
              color: #0d1c32;
            }
            .day-card {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
              margin-bottom: 24px;
            }
            .day-header {
              background: #fafaf5;
              padding: 14px 18px;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .day-title {
              font-family: 'Montserrat', sans-serif;
              font-weight: 700;
              font-size: 16px;
              color: #0d1c32;
            }
            .activity-row {
              display: flex;
              gap: 16px;
              padding: 16px;
              border-bottom: 1px solid #f3f4f6;
            }
            .activity-row:last-child { border-bottom: none; }
            .activity-img {
              width: 120px;
              height: 90px;
              border-radius: 8px;
              object-fit: cover;
              flex-shrink: 0;
            }
            .activity-body { flex: 1; }
            .time-badge {
              font-size: 11px;
              font-weight: 700;
              color: #735c00;
              text-transform: uppercase;
              margin-bottom: 4px;
              display: block;
            }
            .act-title {
              font-size: 14px;
              font-weight: 700;
              color: #0d1c32;
              margin-bottom: 4px;
            }
            .act-desc {
              font-size: 12px;
              color: #4b5563;
              line-height: 1.5;
              margin-bottom: 6px;
            }
            .act-meta {
              font-size: 11px;
              color: #6b7280;
            }
            .footer-contact {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #6b7280;
            }
            @media print {
              body { padding: 0; background: #fff; }
              .page { border: none; padding: 0; margin-bottom: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const firstDestImg = placeCards[0]?.image || 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80';

  const formatDestStr = (d) => {
    if (!d) return '';
    return typeof d === 'object' ? (d.name || d.id || '') : String(d);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#1e293b] text-[#1a1c19] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#D4AF37]/50 animate-fadeIn">
        {/* PDF Top Control Toolbar */}
        <div className="bg-[#0d1c32] text-white px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-bold text-[#D4AF37]"
              style={{ fontFamily: '"Great Vibes", cursive', lineHeight: 1 }}
            >
              V
            </span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                VIHARA Travel Dossier PDF
              </h2>
              <span className="text-[11px] text-gray-400">
                {numberOfDays} Days • {destinationOrder.map(d => formatDestStr(d).toUpperCase()).join(' ~ ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#ffe088] text-[#0d1c32] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close PDF viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Pages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0f172a]/60 space-y-8">
          <div ref={printRef} className="max-w-3xl mx-auto space-y-8">
            {/* =========================================================================
                PAGE 1: COVER BROCHURE (Styled after Sample Itinerary Page 1)
                ========================================================================= */}
            <div className="page bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-200">
              {/* Cover Hero Banner */}
              <div
                className="cover-hero relative rounded-2xl overflow-hidden bg-cover bg-center h-80 flex flex-col justify-end p-6 md:p-8 text-white"
                style={{ backgroundImage: `url('${firstDestImg}')` }}
              >
                <div className="cover-overlay absolute inset-0 bg-gradient-to-t from-[#0d1c32] via-[#0d1c32]/50 to-transparent z-0" />
                <div className="relative z-10">
                  <span className="gold-badge bg-[#D4AF37] text-[#0d1c32] font-bold text-[10px] uppercase px-3 py-1 rounded-full tracking-widest inline-block mb-2">
                    Curated Journey • {currentLocation} Origin
                  </span>
                  <h1
                    className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {tripTitle.toUpperCase()}
                  </h1>
                  <p className="text-sm font-semibold tracking-widest text-[#fed65b] uppercase">
                    {numberOfDays}D / {Math.max(1, numberOfDays - 1)}N • {destinationOrder.map(d => formatDestStr(d).toUpperCase()).join(' ~ ')}
                  </p>
                </div>
              </div>

              {/* Route Summary Ribbon */}
              <div className="route-strip flex flex-wrap items-center justify-between bg-[#fafaf5] border border-dashed border-[#D4AF37] p-4 rounded-xl text-xs font-bold text-[#0d1c32] mb-6">
                <span>📍 Origin: {currentLocation}</span>
                <span>➔</span>
                <span>{destinationOrder.map(d => formatDestStr(d).toUpperCase()).join(' ➔ ')}</span>
                <span>➔</span>
                <span>👥 {numberOfTravelers} Travelers ({travelType})</span>
              </div>

              {/* About the Journey Overview */}
              <div className="mb-6">
                <h3
                  className="text-xs font-bold uppercase tracking-wider text-[#735c00] mb-2"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  About This Journey
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Welcome to your personalized <strong>{tripTitle}</strong>. Spanning <strong>{numberOfDays} days</strong>, this itinerary takes you through the most iconic monuments, sacred heritage sanctums, authentic culinary tasting circuits, and serene sunset viewpoints across <strong>{destinationOrder.map(d => { const s = formatDestStr(d); return s.charAt(0).toUpperCase() + s.slice(1); }).join(' and ')}</strong>.
                </p>
              </div>

              {/* Footer Organizer Badge */}
              <div className="footer-contact flex justify-between items-center text-[11px] text-gray-500 pt-4 border-t border-gray-200">
                <span className="font-semibold text-[#0d1c32]">VIHARA Smart Tourism • Digital Concierge</span>
                <span>📅 Dates: {startDate} to {endDate}</span>
              </div>
            </div>

            {/* =========================================================================
                PAGE 2+: DAY-BY-DAY ITINERARY & PLACES ONLY (Clean, unmingled)
                ========================================================================= */}
            <div className="page bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold text-[#0d1c32]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Day-by-Day Journey &amp; Places
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Complete scheduled visits, visiting hours, and travel highlights
                  </p>
                </div>
                <span className="text-xs font-bold text-[#735c00] bg-[#fed65b]/20 px-3 py-1 rounded-full">
                  {numberOfDays} Days Total
                </span>
              </div>

              {/* Daily Itinerary Cards */}
              <div className="space-y-6">
                {generatedItinerary.map((day) => (
                  <div key={day.dayNumber} className="day-card border border-gray-200 rounded-xl overflow-hidden">
                    {/* Day Header with Route Dots */}
                    <div className="day-header bg-[#fafaf5] p-4 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#0d1c32] text-white flex items-center justify-center font-bold text-xs">
                          {day.dayNumber}
                        </div>
                        <div>
                          <h4 className="day-title text-sm font-bold text-[#0d1c32]">
                            Day 0{day.dayNumber}: {day.city}
                          </h4>
                          <span className="text-[11px] text-gray-500">{day.date} • {day.state}</span>
                        </div>
                      </div>
                      {day.weather && (
                        <div className="text-[11px] text-[#0d1c32] font-semibold bg-white px-2.5 py-1 rounded-full border border-gray-200">
                          ☀️ {day.weather.temp} ({day.weather.condition})
                        </div>
                      )}
                    </div>

                    {/* Activities Rows or Coverage Notice */}
                    {day.activities && day.activities.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {day.activities.map((act, actIdx) => (
                          <div key={actIdx} className="activity-row p-4 flex flex-col sm:flex-row gap-4">
                            <img
                              src={act.image}
                              alt={act.title}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80';
                              }}
                              className="activity-img w-full sm:w-28 h-24 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                            />
                            <div className="activity-body flex-1 text-xs">
                              <span className="time-badge font-bold text-[#735c00] text-[10px] uppercase block mb-1">
                                ⏰ {act.time} • {act.slotType}
                              </span>
                              <h5 className="act-title text-sm font-bold text-[#0d1c32] mb-1">{act.title}</h5>
                              <p className="act-desc text-gray-600 leading-relaxed mb-2">{act.description}</p>
                              <div className="act-meta flex flex-wrap gap-3 text-[11px] text-gray-500">
                                {act.visitingHours && <span>🕒 {act.visitingHours}</span>}
                                {act.entryInfo && <span>🎟️ {act.entryInfo}</span>}
                                {act.travelTip && <span className="text-[#735c00]">💡 {act.travelTip}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-[#fafaf5] border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                        <span className="font-bold text-[#735c00] block mb-0.5">
                          {day.coverageNotice ? 'Curated Exploration & Leisure' : 'Free Exploration Day'}
                        </span>
                        <p>{day.coverageNotice || 'No scheduled activities for this day. Reserved for leisure, independent exploration, or relaxing at your stay.'}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* End of Dossier Notes */}
              <div className="mt-8 p-4 bg-[#fafaf5] rounded-xl border border-gray-200 text-xs text-gray-600 flex justify-between items-center">
                <span>✨ Generated exclusively for you by VIHARA AI Concierge.</span>
                <span className="font-bold text-[#0d1c32]">Safe &amp; Memorable Travels! 🙏</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDFItineraryModal;
