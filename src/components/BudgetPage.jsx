import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Sparkles, Info, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

export const BudgetPage = ({ onBack, onComplete }) => {
  const {
    minimumBaseline,
    userSelectedBudget,
    setUserSelectedBudget,
    selectedDestinations,
    numberOfDays,
    selectedCategories,
    numberOfTravelers,
    travelType,
    generateTripOutputs,
    isGenerating
  } = useTrip();

  const [inputBudget, setInputBudget] = useState(userSelectedBudget || minimumBaseline);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBudgetChange = (e) => {
    const val = Number(e.target.value);
    setInputBudget(val);
    if (val < minimumBaseline) {
      setErrorMsg(`Your budget cannot be lower than the AI minimum estimate of ₹${minimumBaseline.toLocaleString('en-IN')}.`);
    } else {
      setErrorMsg('');
    }
  };

  const handleFinalizePlan = async () => {
    if (inputBudget < minimumBaseline) {
      setErrorMsg(`Your budget cannot be lower than the AI minimum estimate of ₹${minimumBaseline.toLocaleString('en-IN')}.`);
      return;
    }

    setUserSelectedBudget(inputBudget);

    try {
      if (generateTripOutputs) {
        await generateTripOutputs();
      }
      onComplete();
    } catch (err) {
      console.error('Failed to generate plan:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      {/* Glassmorphic Container with Lotus Corners */}
      <div className="relative bg-[#fafaf5]/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-[#D4AF37]/40 shadow-[0_16px_48px_rgba(10,25,47,0.12)] text-[#1a1c19] overflow-hidden">
        {/* Top Saffron Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#fed65b]" />

        <div className="relative z-10 flex flex-col gap-8">
          {/* Header */}
          <div className="text-center">
            <h1
              className="text-3xl md:text-4xl text-[#0d1c32] font-bold mb-2"
              style={{ fontFamily: 'Kalam, cursive' }}
            >
              Calculating your journey's essence...
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#735c00] font-semibold">
              AI Powered Cost Optimization & Baseline
            </p>
          </div>

          {/* AI Insight Box */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#735c00]/20 relative mt-2">
            {/* Pill */}
            <div className="absolute -top-3.5 left-6 bg-[#ffe088] text-[#0d1c32] text-xs font-bold px-3.5 py-1 rounded-full border border-[#735c00]/30 flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#735c00]" />
              AI Minimum Estimate
            </div>

            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <div
                  className="text-3xl md:text-4xl font-bold text-[#0d1c32] mb-1"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  ₹{minimumBaseline.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 text-[#735c00]" />
                  Includes essential stay, dining, tickets & transit
                </p>
              </div>

              <div className="hidden md:block w-px h-16 bg-gray-200" />

              <div className="text-xs text-gray-600 leading-relaxed md:w-1/2">
                Our AI has calculated this baseline based on your{' '}
                <span className="font-bold text-[#0d1c32]">{selectedDestinations.length} destinations</span>,{' '}
                <span className="font-bold text-[#0d1c32]">{numberOfDays} days journey</span>, and{' '}
                <span className="font-bold text-[#0d1c32]">
                  {numberOfTravelers} {numberOfTravelers === 1 ? 'traveler' : 'travelers'} ({travelType})
                </span>.
              </div>
            </div>
          </div>

          {/* User Budget Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#0d1c32]">
              Enter Your Planned Budget (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold text-[#0d1c32]">₹</span>
              <input
                type="number"
                value={inputBudget}
                onChange={handleBudgetChange}
                placeholder={minimumBaseline.toString()}
                className="w-full bg-white border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 rounded-xl pl-10 pr-4 py-4 text-xl font-bold text-[#0d1c32] text-right shadow-sm transition-all"
              />
            </div>

            {errorMsg ? (
              <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1.5 animate-shake">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                Your budget should be equal to or greater than the AI minimum baseline for a seamless experience.
              </p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Adjust Categories
            </button>

            <button
              type="button"
              onClick={handleFinalizePlan}
              disabled={isGenerating}
              className="w-full sm:w-auto bg-[#1e3b2b] text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg hover:bg-[#284f3a] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating AI Plan...
                </>
              ) : (
                <>
                  Finalize & Generate AI Itinerary
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
