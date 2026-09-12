import React from 'react';
import { X, Check, ShieldCheck, Sparkles, Coffee, Waves, Plane } from 'lucide-react';
import { useStays } from '../../context/StaysContext';

export function RoomComparisonModal({ hotel, isOpen, onClose }) {
  const { selectRoomAndProceed, selectedRoom } = useStays();

  if (!isOpen || !hotel || !hotel.rooms || hotel.rooms.length === 0) return null;

  const handleSelectRoom = (room) => {
    selectRoomAndProceed(room);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-[#fcf9f1] text-[#1c1c17] rounded-2xl shadow-2xl border border-[#dcc1b8] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#f1eee6] border-b border-[#dcc1b8] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest text-[#7c2e0c] font-bold">
                Suite Specification Comparison
              </span>
              <span className="bg-[#fdc66b] text-[#281900] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                Zero Hidden Fees
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1c1c17] mt-1">
              Compare Suites at {hotel.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#e5e2db] text-[#55433c] transition-colors"
            aria-label="Close comparison"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comparison Grid Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dcc1b8]">
                <th className="p-3 text-xs uppercase tracking-wider text-[#7c2e0c] font-bold w-1/4">
                  Feature / Amenity
                </th>
                {hotel.rooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <th key={room.id} className="p-3 text-center w-1/4">
                      <div className="space-y-1">
                        <div className="h-28 rounded-lg overflow-hidden relative shadow-sm mb-2">
                          <img
                            src={room.image || hotel.heroImage}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <span className="absolute top-2 right-2 bg-[#7c2e0c] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                              Current Choice
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#1c1c17]">
                          {room.name}
                        </h4>
                        <div className="text-xs text-[#7c2e0c] font-bold">
                          ₹{room.pricePerNight?.toLocaleString()}/night
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dcc1b8]/40 text-xs">
              {/* Floor Space */}
              <tr>
                <td className="p-3 font-semibold text-[#55433c]">Room Dimensions</td>
                {hotel.rooms.map((r) => (
                  <td key={r.id} className="p-3 text-center text-[#1c1c17] font-medium">
                    {r.size || (r.name.includes('Villa') ? '48 m² (516 sq.ft)' : r.name.includes('Grand') ? '64 m² (688 sq.ft)' : '38 m² (409 sq.ft)')}
                  </td>
                ))}
              </tr>

              {/* Bed Type */}
              <tr className="bg-[#f6f3eb]">
                <td className="p-3 font-semibold text-[#55433c]">Bed Configuration</td>
                {hotel.rooms.map((r) => (
                  <td key={r.id} className="p-3 text-center text-[#1c1c17]">
                    {r.bedType || '1 King Bed'}
                  </td>
                ))}
              </tr>

              {/* Guest Capacity */}
              <tr>
                <td className="p-3 font-semibold text-[#55433c]">Guest Capacity</td>
                {hotel.rooms.map((r) => (
                  <td key={r.id} className="p-3 text-center text-[#1c1c17]">
                    {r.maxOccupancy || 2} Guests
                  </td>
                ))}
              </tr>

              {/* View / Outlook */}
              <tr className="bg-[#f6f3eb]">
                <td className="p-3 font-semibold text-[#55433c]">Outlook / View</td>
                {hotel.rooms.map((r) => (
                  <td key={r.id} className="p-3 text-center text-[#1c1c17]">
                    {r.view || (r.name.includes('Villa') ? 'Palm & Paddy Vista' : r.name.includes('Grand') ? 'Historic Courtyard' : 'Garden Quadrangle')}
                  </td>
                ))}
              </tr>

              {/* Private Plunge Pool */}
              <tr>
                <td className="p-3 font-semibold text-[#55433c]">Private Plunge Pool</td>
                {hotel.rooms.map((r) => (
                  <td key={r.id} className="p-3 text-center">
                    {r.name.includes('Villa') || r.name.includes('Plunge') ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <Check size={14} /> Included
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Breakfast & Dining */}
              <tr className="bg-[#f6f3eb]">
                <td className="p-3 font-semibold text-[#55433c]">Dining Plan</td>
                {hotel.rooms.map((r) => (
                  <td key={r.id} className="p-3 text-center text-emerald-800 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Coffee size={13} /> {r.mealPlan || 'Farm-to-Table Breakfast'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Cancellation Terms */}
              <tr>
                <td className="p-3 font-semibold text-[#55433c]">Cancellation Guarantee</td>
                {hotel.rooms.map((r) => (
                  <td key={r.id} className="p-3 text-center text-emerald-700">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck size={13} /> {r.cancellationPolicy || 'Free cancel up to 24h prior'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Airport Transfer */}
              <tr className="bg-[#f6f3eb]">
                <td className="p-3 font-semibold text-[#55433c]">Airport Transfer</td>
                {hotel.rooms.map((r) => (
                  <td key={r.id} className="p-3 text-center">
                    {r.name.includes('Grand') || r.name.includes('Royal') ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <Plane size={14} /> Chauffeured Pickup
                      </span>
                    ) : (
                      <span className="text-gray-400">Available on request</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Select Action Row */}
              <tr>
                <td className="p-4 font-bold text-[#7c2e0c]">Select Suite</td>
                {hotel.rooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <td key={room.id} className="p-4 text-center">
                      <button
                        onClick={() => handleSelectRoom(room)}
                        className={`w-full py-2.5 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                          isSelected
                            ? 'bg-[#7c2e0c] text-white shadow-md'
                            : 'bg-[#f1eee6] text-[#7c2e0c] hover:bg-[#7c2e0c] hover:text-white border border-[#dcc1b8]'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Choose Suite'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RoomComparisonModal;
