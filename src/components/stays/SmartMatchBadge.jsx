import React, { useState } from 'react';
import { Sparkles, Info, X, CheckCircle } from 'lucide-react';

export function SmartMatchBadge({ score = 94, breakdown = null, reasons = [], showDetails = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultBreakdown = breakdown || {
    locationFit: 95,
    budgetFit: 92,
    routeEfficiency: 96,
    heritageAuthenticity: 93
  };

  const defaultReasons = reasons.length > 0 ? reasons : [
    'Conveniently located within 15 mins of your planned attractions',
    'Fits comfortably within your allocated accommodation budget',
    'Minimizes daily intra-city transfer times'
  ];

  return (
    <>
      {/* Badge Capsule */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdc66b]/25 border border-[#fdc66b]/60 text-[#765100] hover:bg-[#fdc66b]/40 transition-all font-bold text-xs shadow-sm cursor-pointer group"
        title="Click to see why this hotel matches your trip"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#b45309] group-hover:rotate-12 transition-transform" />
        <span className="tracking-tight">{score}% Smart Match</span>
        <Info className="w-3 h-3 text-[#765100]/70 opacity-70 group-hover:opacity-100" />
      </button>

      {/* Interactive Smart Match Breakdown Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#fcf9f1] border border-[#dcc1b8] rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b45309] via-[#fdc66b] to-[#765100]"></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#ffdeae] text-[#765100] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-[#b45309]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1c1c17]" style={{ fontFamily: 'Noto Serif, serif' }}>
                    VIHARA Smart Match
                  </h3>
                  <span className="text-xs text-[#55433c] font-medium">
                    Overall Compatibility Score: <strong className="text-[#b45309]">{score}%</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#55433c] leading-relaxed mb-4">
              VIHARA evaluates your active itinerary attractions, transit routes, and accommodation budget to find stays that elevate your entire journey.
            </p>

            {/* Compatibility Breakdown Bars */}
            <div className="space-y-3 bg-[#f6f3eb] p-4 rounded-xl border border-[#dcc1b8]/40 mb-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-[#1c1c17] mb-1">
                  <span>Location & Attraction Proximity</span>
                  <span className="text-[#b45309]">{defaultBreakdown.locationFit}%</span>
                </div>
                <div className="w-full bg-[#e5e2db] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#b45309] h-1.5 rounded-full" style={{ width: `${defaultBreakdown.locationFit}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[#1c1c17] mb-1">
                  <span>Budget Optimization Fit</span>
                  <span className="text-[#b45309]">{defaultBreakdown.budgetFit}%</span>
                </div>
                <div className="w-full bg-[#e5e2db] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#b45309] h-1.5 rounded-full" style={{ width: `${defaultBreakdown.budgetFit}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[#1c1c17] mb-1">
                  <span>Daily Route Efficiency</span>
                  <span className="text-[#b45309]">{defaultBreakdown.routeEfficiency}%</span>
                </div>
                <div className="w-full bg-[#e5e2db] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#b45309] h-1.5 rounded-full" style={{ width: `${defaultBreakdown.routeEfficiency}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[#1c1c17] mb-1">
                  <span>Heritage Authenticity & Quality</span>
                  <span className="text-[#b45309]">{defaultBreakdown.heritageAuthenticity}%</span>
                </div>
                <div className="w-full bg-[#e5e2db] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#b45309] h-1.5 rounded-full" style={{ width: `${defaultBreakdown.heritageAuthenticity}%` }}></div>
                </div>
              </div>
            </div>

            {/* Why this property was matched */}
            <div className="space-y-2 mb-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#765100]">
                Why this stay matches your journey:
              </h4>
              <ul className="space-y-1.5 text-xs text-[#55433c]">
                {defaultReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#b45309] shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-[#b45309] hover:bg-[#9b4522] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SmartMatchBadge;
