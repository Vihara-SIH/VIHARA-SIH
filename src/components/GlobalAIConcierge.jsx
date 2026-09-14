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
import { useEvents } from '../context/EventsContext';
import { sendChatMessage } from '../services/chatService';
import { compactTripForAI } from '../services/vihara/schemas';

export function GlobalAIConcierge({ currentView = 'home' }) {
  const { isAuthenticated, userProfile, user } = useAuth();
  const trip = useTrip();
  const stays = useStays();
  const events = useEvents();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! 🙏 I am your VIHARA AI Concierge. I have full context of your itinerary, budget, luxury stays, and cultural events. How may I assist your journey?'
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
    const dest = stays?.searchParams?.destination || events?.selectedCity || trip?.selectedDestinations?.[0] || 'Hyderabad';
    const hotelName = stays?.selectedHotel?.name || 'Taj Falaknuma Palace';
    const eventName = events?.selectedEvent?.title || 'Sacred Echoes: Sufi Mehfil';

    if (currentView === 'event-bookings') {
      return [
        `How does ${eventName} fit my Day 2 itinerary?`,
        `What is the dress code and protocol for ${eventName}?`,
        `How far is ${events?.selectedEvent?.venue || 'Chowmahalla Palace'} from my stay?`,
        `Recommend cultural food trails and mehfils in ${dest}`
      ];
    }

    if (currentView === 'stays-travel') {
      return [
        `Is ${hotelName} within my accommodation budget?`,
        `How far is ${hotelName} from my planned sights?`,
        `Explain my Smart Match calculation for ${hotelName}`,
        `What are the best boutique stays in ${dest}?`
      ];
    }

    if (currentView === 'near-me') {
      return [
        `Find secret alleys and artisan bakeries near me`,
        `Which spots within 5km fit into my remaining 2 hours?`,
        `What is the best time to visit heritage monuments nearby?`,
        `How much will adding this spot increase my trip budget?`
      ];
    }

    if (currentView === 'saved-items') {
      return [
        `Summarize my saved places and suggest an optimal route`,
        `Which of my saved spots are closest to my booked stay?`,
        `Help me create a new 3-day itinerary with my saved gems`,
        `Check opening hours and ticket rules for my wishlist`
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
      `What cultural events are happening this weekend in ${dest}?`,
      `How does VIHARA Smart Match optimize routes and stays?`,
      `Show me palace hotels and live Sufi baithaks`
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
    const contextTrip = trip?.tripData
      ? compactTripForAI(trip.tripData)
      : null;

    try {
      const result = await sendChatMessage(textToSend.trim(), messages, {
        tripContext: contextTrip,
        returnFull: true
      });
      const reply = typeof result === 'string' ? result : result.reply;
      const actions = typeof result === 'object' ? (result.actions || []) : [];
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
      if (actions.length && trip?.applyConciergeActions) {
        const outcome = await trip.applyConciergeActions(actions);
        if (outcome?.applied?.length) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: outcome.regenerated
                ? 'I updated your itinerary from that request. Open Trip Overview to review the new day plan.'
                : `Applied ${outcome.applied.length} itinerary change(s).`
            }
          ]);
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Namaste! 🙏 I could not complete that change just now. Your trip data is still on this device.`
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
