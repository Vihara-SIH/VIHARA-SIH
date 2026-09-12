import React, { useState } from 'react';
import { X, Check, MapPin, Calendar, Users, Plus, Compass } from 'lucide-react';
import { useStays } from '../../context/StaysContext';
import { useTrip } from '../../context/TripContext';

export function AddToTripModal({ isOpen, onClose, onTripLinked, booking }) {
  const { allUserTrips, linkStayToSpecificTrip, createNewTripFromStay } = useStays();
  const trip = useTrip();
  const [selectedTripId, setSelectedTripId] = useState(trip?.tripId || (allUserTrips?.[0]?.tripId || null));
  const [isLinking, setIsLinking] = useState(false);

  if (!isOpen) return null;

  const targetBooking = booking;

  const handleConfirmLink = async () => {
    setIsLinking(true);
    try {
      if (selectedTripId) {
        await linkStayToSpecificTrip(selectedTripId, targetBooking);
      } else {
        await createNewTripFromStay(targetBooking);
      }
      if (onTripLinked) onTripLinked();
      onClose();
    } finally {
      setIsLinking(false);
    }
  };

  const handleCreateNewTrip = async () => {
    setIsLinking(true);
    try {
      await createNewTripFromStay(targetBooking);
      if (onTripLinked) onTripLinked();
      onClose();
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#fcf9f1] text-[#1c1c17] rounded-2xl shadow-2xl border border-[#dcc1b8] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#f1eee6] border-b border-[#dcc1b8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7c2e0c] text-white flex items-center justify-center shadow">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1c17]">
                Connect Stay to Trip Itinerary
              </h3>
              <p className="text-xs text-[#55433c]">
                Embed {targetBooking?.hotel?.name || 'this stay'} into your travel dossier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#e5e2db] text-[#55433c] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Active / Available Trips List */}
          {allUserTrips && allUserTrips.length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7c2e0c] block">
                Select from Your Saved Trips ({allUserTrips.length})
              </span>
              {allUserTrips.map((t) => {
                const isSelected = selectedTripId === (t.tripId || t.id);
                const destName = Array.isArray(t.destinations) && t.destinations.length > 0
                  ? (t.destinations[0].destinationName || t.destinations[0].name || 'India')
                  : (t.originLocation || 'Trip Itinerary');

                return (
                  <div
                    key={t.tripId || t.id}
                    onClick={() => setSelectedTripId(t.tripId || t.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#ffdbcf]/40 border-[#7c2e0c] shadow-sm'
                        : 'bg-[#f6f3eb] border-[#dcc1b8] hover:border-[#89726b]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#7c2e0c]" />
                        <span className="font-bold text-sm text-[#1c1c17]">
                          {destName}
                        </span>
                        {t.tripId === trip?.tripId && (
                          <span className="bg-[#fdc66b] text-[#281900] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Active Session
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#55433c]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {t.startDate || 'Dates set'} – {t.endDate || ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {t.numberOfTravelers || 2} Travelers
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#7c2e0c] text-white border-[#7c2e0c]'
                          : 'border-[#89726b] bg-white'
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Case 3: No existing trips found */
            <div className="p-4 bg-[#f6f3eb] rounded-xl border border-[#dcc1b8] text-center space-y-2">
              <p className="text-xs text-[#55433c]">
                No existing trips found for your account. You can create a new trip tailored to this stay!
              </p>
            </div>
          )}

          {/* Create New Trip Option */}
          <button
            onClick={handleCreateNewTrip}
            disabled={isLinking}
            className="w-full p-3.5 rounded-xl border border-dashed border-[#7c2e0c] bg-white/50 hover:bg-[#ffdbcf]/20 text-[#7c2e0c] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Create New {targetBooking?.hotel?.city || 'Goa'} Trip with This Stay</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#f1eee6] border-t border-[#dcc1b8] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLinking}
            className="px-4 py-2 rounded-full text-xs font-bold text-[#55433c] hover:bg-[#e5e2db] transition-colors"
          >
            Cancel
          </button>
          {allUserTrips && allUserTrips.length > 0 && (
            <button
              onClick={handleConfirmLink}
              disabled={isLinking}
              className="px-6 py-2 rounded-full bg-[#7c2e0c] hover:bg-[#9b4522] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
            >
              {isLinking ? 'Linking Stay...' : 'Attach to Selected Trip'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddToTripModal;
