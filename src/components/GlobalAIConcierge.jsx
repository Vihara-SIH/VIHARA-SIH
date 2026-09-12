import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  MapPin,
  Calendar,
  Hotel,
  Compass,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { useStays } from '../context/StaysContext';
import { sendChatMessage } from '../services/chatService';

export function GlobalAIConcierge({ currentView = 'home' }) {
  const { isAuthenticated, userProfile, user } = useAuth();
  const trip = useTrip();
  const stays = useStays();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! 🙏 I am your VIHARA AI Concierge. I have full context of your itinerary, budget, and luxury stays. How may I assist your journey?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Context-aware dynamic suggestions
  const getDynamicPromptSuggestions = () => {
    const dest = stays?.searchParams?.destination || trip?.selectedDestinations?.[0] || 'Goa';
    const hotelName = stays?.selectedHotel?.name || 'Heritage Goa Retreat';

    if (currentView === 'stays-travel') {
      return [
        `Is ${hotelName} within my accommodation budget?`,
        `How far is ${hotelName} from my planned sights?`,
        `Explain my Smart Match calculation for ${hotelName}`,
        `What are the best boutique stays in ${dest}?`
      ];
    }

    if (currentView === 'trip-planning') {
      return [
        `Suggest the optimal 4-day route for ${dest}`,
        `Recommend top heritage forts and viewpoints in ${dest}`,
        `How should I allocate my ₹${(trip?.userSelectedBudget || 35000).toLocaleString()} budget?`,
        `Find stays near my Day 1 itinerary attractions`
      ];
    }

    return [
      `Help me plan a luxury heritage trip to ${dest}`,
      `What is the best season to visit ${dest}?`,
      `How does VIHARA Smart Match optimize routes?`,
      `Show me Portuguese havelis and palace hotels`
    ];
  };

  const handleSendMessage = async (customPrompt = null) => {
    const textToSend = typeof customPrompt === 'string' ? customPrompt : inputMessage;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const userMsg = { sender: 'user', text: textToSend.trim() };
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setIsLoading(true);

    // Build rich ecosystem context
    const tripDest = trip?.selectedDestinations?.join(', ') || 'Goa';
    const tripBudget = trip?.userSelectedBudget || 35000;
    const tripAttractions = trip?.placeCards?.map(p => p.placeName || p.title).join(', ') || 'Vagator Beach, Fort Aguada, Panjim';
    const hotel = stays?.selectedHotel;
    const booking = stays?.currentBooking;

    const contextPrefix = `[Ecosystem Context]
Current Page: ${currentView}
Active Trip: Destination=${tripDest}, Dates=${trip?.startDate || '15 Oct'} to ${trip?.endDate || '19 Oct'}, Travelers=${trip?.numberOfTravelers || 2}, Total Budget=₹${tripBudget}, Planned Sights=[${tripAttractions}]
Active Stays Context: Destination=${stays?.searchParams?.destination || tripDest}, Selected Stay=${hotel?.name || 'Heritage Goa Retreat & Villas'} (₹${hotel?.pricePerNight || 4800}/night, Smart Match: ${hotel?.smartMatchScore || 94}%), Selected Room=${stays?.selectedRoom?.name || 'Deluxe Suite'}
Latest Booking: Reference=${booking?.bookingId || 'None yet'}, Hotel=${booking?.hotel?.name || 'None'}
User Question: ${textToSend.trim()}`;

    try {
      const reply = await sendChatMessage(contextPrefix, messages);
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Namaste! 🙏 Based on your ${tripDest} itinerary, ${hotel?.name || 'your selected sanctuary'} offers exceptional route efficiency and fits within your accommodation budget. How else may I assist with your bookings or daily route planning?`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Bubble */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="group flex items-center gap-2.5 bg-[#0d1c32] hover:bg-[#142844] text-[#fafaf5] px-4 py-3 rounded-full border-2 border-[#D4AF37] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-105 cursor-pointer"
          aria-label="Open AI Concierge"
        >
          <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0d1c32] flex items-center justify-center font-bold shadow animate-[pulse_3s_infinite]">
            <Sparkles size={16} />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold font-serif text-[#fafaf5] tracking-wide leading-tight">
              AI Concierge
            </span>
            <span className="text-[10px] text-[#D4AF37] font-sans">
              Trip & Stay Aware
            </span>
          </div>
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-md bg-[#0d1c32] text-[#fafaf5] border-2 border-[#D4AF37] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[560px] animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="p-4 bg-white/5 border-b border-[#D4AF37]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0d1c32] flex items-center justify-center font-bold shadow">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#fafaf5] font-serif">
                  VIHARA AI Concierge
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-[#D4AF37]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active Context: {stays?.searchParams?.destination || trip?.selectedDestinations?.[0] || 'Goa'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Context Capsule Bar */}
          <div className="px-4 py-2 bg-black/20 border-b border-[#D4AF37]/20 flex items-center justify-between text-[11px] text-gray-300">
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              <Hotel size={12} className="text-[#D4AF37] shrink-0" />
              <span className="truncate">{stays?.selectedHotel?.name || 'Heritage Goa Retreat'}</span>
            </span>
            <span className="text-[#D4AF37] font-bold">
              {stays?.selectedHotel?.smartMatchScore || 94}% Smart Match
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                  msg.sender === 'bot'
                    ? 'bg-white/10 text-[#fafaf5] border border-[#D4AF37]/20 self-start'
                    : 'bg-[#D4AF37] text-[#0d1c32] font-semibold ml-auto shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white/10 text-[#fafaf5] border border-[#D4AF37]/20 self-start p-3 rounded-2xl text-xs flex items-center gap-2 max-w-[85%]">
                <Loader2 size={14} className="animate-spin text-[#D4AF37]" />
                <span className="text-gray-300 italic">Concierge is calculating route & stay alignment...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Suggestion Chips */}
          <div className="px-3 py-2 bg-white/5 border-t border-[#D4AF37]/20 overflow-x-auto flex gap-1.5 no-scrollbar">
            {getDynamicPromptSuggestions().map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="shrink-0 bg-white/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white/5 border-t border-[#D4AF37]/30 flex gap-2"
          >
            <input
              type="text"
              disabled={isLoading}
              className="flex-1 bg-white/10 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-[#fafaf5] placeholder-gray-400 outline-none focus:border-[#D4AF37] disabled:opacity-50"
              placeholder="Ask about stays, routes, or budget..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#ffe088] text-[#0d1c32] rounded-xl font-bold text-xs transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow"
              aria-label="Send"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default GlobalAIConcierge;
