import React from 'react';
import { useTrip } from '../context/TripContext';
import { CATEGORY_DEFINITIONS } from '../services/destinationService';
import { Check, ArrowRight, ArrowLeft, Info, Sparkles } from 'lucide-react';

export const TripPlanningPage2 = ({ onBack, onNext }) => {
  const {
    categoryMatrix,
    selectedCategories,
    toggleSubcategory,
    toggleMainCategory,
    selectedDestinations
  } = useTrip();

  const handleNextClick = () => {
    if (!selectedCategories || selectedCategories.length === 0) {
      alert('Please select at least one experience or category for your journey.');
      return;
    }
    onNext();
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4">
      {/* Header & Subtitle */}
      <div className="text-center mb-10">
        <p className="text-2xl md:text-3xl text-[#735c00] italic font-['Kalam'] mb-2">
          Discover your path...
        </p>
        <h1
          className="text-3xl md:text-5xl font-bold text-[#0d1c32] tracking-tight"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          What calls to your spirit?
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-2 max-w-2xl mx-auto">
          Categories and experiences are dynamically verified against your selected destinations (
          <span className="font-semibold text-[#0d1c32] capitalize">
            {selectedDestinations.map(d => typeof d === 'object' ? (d.name || d.id || '') : d).join(', ')}
          </span>
          ).
        </p>
      </div>

      {/* 4-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Object.values(CATEGORY_DEFINITIONS).map((catDef) => {
          const matrixCat = categoryMatrix[catDef.id] || {
            enabled: true,
            subcategories: catDef.subcategories.map((s) => ({
              ...s,
              available: true,
              availableIn: selectedDestinations,
              statusText: `Available in: ${selectedDestinations.join(', ')}`
            }))
          };

          const isMainEnabled = matrixCat.enabled;
          const availableSubs = matrixCat.subcategories.filter((s) => s.available);
          const allAvailableSelected =
            availableSubs.length > 0 &&
            availableSubs.every((s) => selectedCategories.includes(s.id));
          const someAvailableSelected =
            availableSubs.some((s) => selectedCategories.includes(s.id)) && !allAvailableSelected;

          return (
            <div
              key={catDef.id}
              className={`flex flex-col bg-white/90 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${
                isMainEnabled
                  ? 'border-[#D4AF37]/30 hover:border-[#D4AF37]/80 hover:shadow-md'
                  : 'border-gray-200 opacity-60 bg-gray-50/80'
              }`}
            >
              {/* Category Header with Main Checkbox */}
              <div
                onClick={() => isMainEnabled && toggleMainCategory(catDef.id)}
                className={`p-5 border-b border-gray-100 flex justify-between items-center cursor-pointer transition-colors ${
                  allAvailableSelected
                    ? 'bg-[#ffe088]/20'
                    : isMainEnabled
                    ? 'bg-[#fafaf5] hover:bg-gray-100/60'
                    : 'bg-gray-100 cursor-not-allowed'
                }`}
              >
                <div>
                  <h2
                    className="text-2xl text-[#0d1c32] font-bold"
                    style={{ fontFamily: 'Kalam, cursive' }}
                  >
                    {catDef.name}
                  </h2>
                  <span className="text-[11px] text-gray-500 font-semibold block uppercase tracking-wider">
                    {isMainEnabled ? `${availableSubs.length} Available` : 'Unavailable'}
                  </span>
                </div>

                {/* Main Category Checkbox */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                    !isMainEnabled
                      ? 'border border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed'
                      : allAvailableSelected
                      ? 'bg-[#0d1c32] text-white shadow-sm'
                      : someAvailableSelected
                      ? 'bg-[#D4AF37] text-white'
                      : 'border-2 border-gray-300 bg-white hover:border-[#D4AF37]'
                  }`}
                >
                  {allAvailableSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  {someAvailableSelected && <div className="w-2.5 h-0.5 bg-white rounded-full" />}
                </div>
              </div>

              {/* Subcategories List with Individual Checkboxes */}
              <div className="p-5 flex flex-col gap-3.5 flex-grow">
                {matrixCat.subcategories.map((sub) => {
                  const isAvailable = sub.available;
                  const isChecked = selectedCategories.includes(sub.id);

                  return (
                    <div
                      key={sub.id}
                      onClick={() => isAvailable && toggleSubcategory(sub.id)}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        !isAvailable
                          ? 'border-dashed border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-50'
                          : isChecked
                          ? 'border-[#D4AF37] bg-[#ffe088]/15 shadow-sm cursor-pointer'
                          : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex-1">
                        <span
                          className={`text-sm font-semibold block ${
                            isChecked ? 'text-[#0d1c32]' : isAvailable ? 'text-gray-700' : 'text-gray-400'
                          }`}
                        >
                          {sub.name}
                        </span>
                        <span
                          className={`text-[10px] block mt-0.5 ${
                            isAvailable ? 'text-[#735c00] font-medium' : 'text-gray-400 italic'
                          }`}
                        >
                          {sub.statusText}
                        </span>
                      </div>

                      {/* Subcategory Checkbox */}
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                          !isAvailable
                            ? 'border border-gray-200 bg-gray-100 text-gray-300'
                            : isChecked
                            ? 'bg-[#0d1c32] text-white'
                            : 'border border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && isAvailable && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center max-w-4xl mx-auto pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Details
        </button>

        <button
          type="button"
          onClick={handleNextClick}
          className="px-8 py-3.5 rounded-xl bg-[#D4AF37] text-[#0d1c32] font-bold text-xs uppercase tracking-wider hover:bg-[#ffe088] transition-colors flex items-center gap-2 shadow-md"
        >
          Proceed to AI Budgeting
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
