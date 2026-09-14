import React, { useState, useEffect, useRef } from 'react';
import {
  LogOut,
  X,
  Send,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../services/chatService';

const SLIDES = [
  {
    id: 1,
    title: 'Amritsar Golden Temple',
    alt: 'Majestic Golden Temple at Amritsar, India at dusk',
    url: '/images/slides/amritsar-golden-temple.jpg'
  },
  {
    id: 2,
    title: 'Hawa Mahal Jaipur',
    alt: 'The iconic Hawa Mahal in Jaipur, India',
    url: '/images/slides/hawa-mahal-jaipur.jpg'
  },
  {
    id: 3,
    title: 'Munnar Tea Plantations',
    alt: 'Lush green tea plantations of Munnar, Kerala',
    url: '/images/slides/munnar-tea-plantations.jpg'
  },
  {
    id: 4,
    title: 'Himalayan Range',
    alt: 'Stunning cinematic photography of the Himalayan mountain range',
    url: '/images/slides/himalayas-mountains.jpg'
  }
];

export function Homepage({ onSelectFeature }) {
  const {
    user,
    userProfile,
    isAuthenticated,
    openLoginModal,
    logout,
    triggerAuthGate
  } = useAuth();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [logoShifted, setLogoShifted] = useState(false);
  const [glowActive, setGlowActive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Namaste! 🙏 Welcome to VIHARA. How can I assist with your journey across India today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading, chatOpen]);

  // Logo Animation effect
  useEffect(() => {
    const shiftTimer = setTimeout(() => {
      setLogoShifted(true);
    }, 600);

    const glowTimer = setTimeout(() => {
      setGlowActive(true);
    }, 2200);

    return () => {
      clearTimeout(shiftTimer);
      clearTimeout(glowTimer);
    };
  }, []);

  // Slideshow Logic: exactly 3.0 seconds per slide as in Stitch
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleCardClick = (featureId) => {
    onSelectFeature(featureId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const userText = inputMessage.trim();
    const currentHistory = [...chatMessages];
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const botReply = await sendChatMessage(userText, currentHistory);
      setChatMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error('Error in chatbot communication:', error);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Namaste! I encountered a temporary issue retrieving travel guidance. Please try again in a moment.'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="bg-primary-container text-surface m-0 p-0 overflow-hidden font-body-md relative min-h-screen">
      {/* 1. Desktop TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0d1c32]/70 backdrop-blur-xl border-b border-[#D4AF37]/30 hidden md:flex justify-between items-center px-6 md:px-12 py-3.5 max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentSlide(0)}>
          <div className="w-9 h-9 rounded-full bg-[#fe932c] flex items-center justify-center shadow-[0_2px_10px_rgba(254,147,44,0.35)] shrink-0">
            <span className="material-symbols-outlined text-[#663500] text-[20px]">temple_hindu</span>
          </div>
          <span className="font-headline-md tracking-widest text-surface uppercase font-bold" style={{ fontFamily: 'Kalam, cursive', fontSize: '1.4rem' }}>
            <span className="flex items-center gap-1">
              <span className="text-3xl text-surface" style={{ fontFamily: '"Great Vibes", cursive', lineHeight: 1, paddingRight: '0.1em' }}>
                V
              </span>
              <span>IHARA</span>
            </span>
          </span>
        </div>

        {/* Central Pill Navigation Links */}
        <nav className="flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold">
          <button
            type="button"
            onClick={() => onSelectFeature('near-me')}
            className="px-4 py-1.5 rounded-full bg-[#fe932c] text-[#663500] shadow-[0_2px_8px_rgba(254,147,44,0.35)] hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">near_me</span>
            <span>Near Me</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectFeature('trip-planning')}
            className="px-4 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Trip Planning
          </button>
          <button
            type="button"
            onClick={() => onSelectFeature('stays-travel')}
            className="px-4 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Stays &amp; Havens
          </button>
          <button
            type="button"
            onClick={() => onSelectFeature('event-bookings')}
            className="px-4 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Events Nearby
          </button>
          <button
            type="button"
            onClick={() => onSelectFeature('saved-items')}
            className="px-4 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">bookmark</span>
            <span>Saved</span>
          </button>
        </nav>

        <div className="flex gap-3 items-center">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 bg-surface/10 px-4 py-1.5 rounded-full border border-[#D4AF37]/50 backdrop-blur-md">
              <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-primary-container font-bold flex items-center justify-center text-xs">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-surface font-semibold text-sm">{userProfile?.name || 'Traveler'}</span>
              <button onClick={logout} className="ml-1 text-surface/70 hover:text-[#D4AF37] transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openLoginModal('login')}
              className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-[#D4AF37] hover:bg-[#ffe088] text-[#0d1c32] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <span>Sign In / My Journeys</span>
              <div className="w-6 h-6 rounded-full bg-[#0d1c32] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">person</span>
              </div>
            </button>
          )}
        </div>
      </header>

      {/* 2. Mobile Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/10 backdrop-blur-md border-b border-outline-variant/30 flex md:hidden justify-between items-center px-margin-mobile py-4">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-surface" data-icon="menu" style={{ fontVariationSettings: '"FILL" 0' }}>
            menu
          </span>
          <span className="font-headline-md text-headline-md-mobile tracking-widest text-surface uppercase" style={{ fontFamily: 'Kalam, cursive', fontSize: '1.25rem', lineHeight: '1.75rem' }}>
            <span className="flex items-center gap-1">
              <span className="text-2xl text-surface" style={{ fontFamily: '"Great Vibes", cursive', lineHeight: 1 }}>V</span>
              <span>IHARA</span>
            </span>
          </span>
        </div>
        {isAuthenticated ? (
          <button onClick={logout} className="text-surface font-label-caps text-label-caps">
            Logout
          </button>
        ) : (
          <button onClick={() => openLoginModal('login')} className="text-surface font-label-caps text-label-caps">
            Login
          </button>
        )}
      </header>

      {/* 3. Slideshow Background */}
      <div className="absolute inset-0 z-0 overflow-hidden" id="slideshow">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`slide ${idx === currentSlide ? 'active' : ''}`}
          >
            <div
              className="w-full h-full bg-cover bg-center ken-burns"
              data-alt={slide.alt}
              style={{ backgroundImage: `url('${slide.url}')` }}
            />
          </div>
        ))}
        <div className="absolute inset-0 overlay-gradient z-10"></div>
        <div className="absolute inset-0 saffron-tint z-10"></div>
      </div>

      {/* 4. Main Content Canvas */}
      <main className="relative z-20 flex flex-col items-center justify-center min-h-screen px-margin-mobile md:px-margin-desktop pt-24 pb-32">
        {/* Hero Text */}
        <div className="text-center mb-xl w-full max-w-4xl mx-auto pt-12">
          <div className={`flex justify-center items-center mb-6 h-24 md:h-32 ${glowActive ? 'glow-gold' : ''}`} id="vihara-logo">
            <div className="relative flex items-center justify-center">
              {/* Styled V */}
              <div
                className="z-20 text-7xl md:text-9xl lg:text-[10rem] text-surface drop-shadow-2xl"
                style={{ fontFamily: '"Great Vibes", cursive', lineHeight: 1, paddingRight: '0.05em' }}
              >
                <span className="animate-letter" style={{ display: 'inline-block', animationDelay: '0.2s' }}>
                  V
                </span>
              </div>
              {/* Overflow container for IHARA */}
              <div className="z-10 overflow-hidden flex items-center h-full -ml-2 py-4">
                <div
                  className="flex text-6xl md:text-8xl lg:text-9xl text-surface drop-shadow-2xl transform logo-flow-transition translate-x-0"
                  id="ihara-text"
                  style={{ fontFamily: 'Kalam, cursive' }}
                >
                  <span className="animate-letter inline-block transform rotate-[2deg] translate-y-0.5" style={{ animationDelay: '0.4s' }}>
                    I
                  </span>
                  <span className="animate-letter inline-block transform rotate-[-1deg] -translate-y-0.5" style={{ animationDelay: '0.6s' }}>
                    H
                  </span>
                  <span className="animate-letter inline-block transform rotate-[1.5deg] translate-y-1" style={{ animationDelay: '0.8s' }}>
                    A
                  </span>
                  <span className="animate-letter inline-block transform rotate-[-2deg] -translate-y-1" style={{ animationDelay: '1.0s' }}>
                    R
                  </span>
                  <span className="animate-letter inline-block transform rotate-[1deg] translate-y-0.5" style={{ animationDelay: '1.2s' }}>
                    A
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex items-center justify-center gap-4 mb-6 opacity-80 ${glowActive ? 'glow-gold' : ''}`} id="vihara-divider">
            <div className="h-[1px] w-16 bg-[#D4AF37]"></div>
            <svg className="transform rotate-45" fill="none" height="24" stroke="#D4AF37" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"></path>
            </svg>
            <div className="h-[1px] w-16 bg-[#D4AF37]"></div>
          </div>

          <p className="font-body-lg text-body-lg text-inverse-on-surface/90 tracking-widest uppercase font-light drop-shadow-md">
            One stop destination for all your destinations
          </p>
        </div>

        {/* Action Grid (4 Exact Stitch Action Cards) */}
        <div className="w-full max-w-3xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-md md:gap-lg">
          {/* 1. Trip Planning */}
          <div
            className="glass-btn rounded-xl p-6 flex items-center justify-between group overflow-hidden relative cursor-pointer"
            onClick={() => handleCardClick('trip-planning')}
            role="button"
            tabIndex={0}
          >
            <div className="absolute inset-0 bg-secondary-container/10 group-hover:bg-secondary-container/20 transition-colors z-0"></div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-full border border-[#D4AF37]/50 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-primary-container transition-all">
                <span className="material-symbols-outlined text-3xl" data-icon="map" style={{ fontVariationSettings: '"FILL" 0' }}>
                  map
                </span>
              </div>
              <div className="text-left">
                <h3 className="font-headline-md text-headline-md text-surface mb-1 group-hover:text-[#D4AF37] transition-colors">
                  Trip Planning
                </h3>
                <p className="font-body-md text-body-md text-surface-variant/80">
                  Plan your perfect journey
                </p>
              </div>
            </div>
            <span
              className="material-symbols-outlined text-surface/50 group-hover:text-[#D4AF37] group-hover:translate-x-2 transition-all relative z-10 text-3xl"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>

          {/* 2. Near Me */}
          <div
            className="glass-btn rounded-xl p-6 flex items-center gap-4 group relative overflow-hidden justify-between cursor-pointer"
            onClick={() => handleCardClick('near-me')}
            role="button"
            tabIndex={0}
          >
            <div className="absolute inset-0 bg-secondary-container/10 group-hover:bg-secondary-container/20 transition-colors z-0"></div>
            <div className="relative z-10 p-3 rounded-full border border-[#D4AF37]/50 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-primary-container transition-all">
              <span className="material-symbols-outlined text-2xl" data-icon="location_on" style={{ fontVariationSettings: '"FILL" 0' }}>
                location_on
              </span>
            </div>
            <div className="relative z-10 text-left">
              <h3 className="font-headline-md text-headline-md text-surface mb-1 group-hover:text-[#D4AF37] transition-colors">
                Near Me
              </h3>
              <p className="font-body-md text-body-md text-surface-variant/80">
                Most visited and loved places near me
              </p>
            </div>
            <span
              className="material-symbols-outlined text-surface/50 group-hover:text-[#D4AF37] group-hover:translate-x-2 transition-all relative z-10 text-3xl"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>

          {/* 3. Event Bookings */}
          <div
            className="glass-btn rounded-xl p-6 flex items-center gap-4 group relative overflow-hidden justify-between cursor-pointer"
            onClick={() => handleCardClick('event-bookings')}
            role="button"
            tabIndex={0}
          >
            <div className="absolute inset-0 bg-secondary-container/10 group-hover:bg-secondary-container/20 transition-colors z-0"></div>
            <div className="relative z-10 p-3 rounded-full border border-secondary-container/50 text-secondary-container">
              <span className="material-symbols-outlined text-2xl" data-icon="event" style={{ fontVariationSettings: '"FILL" 0' }}>
                event
              </span>
            </div>
            <div className="relative z-10 text-left">
              <h3 className="font-headline-md text-headline-md text-surface mb-1 group-hover:text-secondary-container transition-colors">
                Event Bookings
              </h3>
              <p className="font-body-md text-body-md text-surface-variant/80">
                Curated cultural experiences
              </p>
            </div>
            <span
              className="material-symbols-outlined text-surface/50 group-hover:text-secondary-container group-hover:translate-x-2 transition-all relative z-10 text-3xl"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>

          {/* 4. Stays & Travel */}
          <div
            className="glass-btn rounded-xl p-6 flex items-center gap-4 group relative overflow-hidden justify-between cursor-pointer"
            onClick={() => handleCardClick('stays-travel')}
            role="button"
            tabIndex={0}
          >
            <div className="absolute inset-0 bg-secondary-container/10 group-hover:bg-secondary-container/20 transition-colors z-0"></div>
            <div className="relative z-10 flex gap-2">
              <div className="p-3 rounded-full border border-[#D4AF37]/50 text-[#D4AF37]">
                <span className="material-symbols-outlined text-2xl" data-icon="hotel" style={{ fontVariationSettings: '"FILL" 0' }}>
                  hotel
                </span>
              </div>
              <div className="p-3 rounded-full border border-[#D4AF37]/50 text-[#D4AF37]">
                <span className="material-symbols-outlined text-2xl" data-icon="flight" style={{ fontVariationSettings: '"FILL" 0' }}>
                  flight
                </span>
              </div>
            </div>
            <div className="relative z-10 text-left">
              <h3 className="font-headline-md text-headline-md text-surface mb-1 group-hover:text-[#D4AF37] transition-colors">
                Stays &amp; Travel
              </h3>
              <p className="font-body-md text-body-md text-surface-variant/80">
                Luxury accommodations &amp; transit
              </p>
            </div>
            <span
              className="material-symbols-outlined text-surface/50 group-hover:text-[#D4AF37] group-hover:translate-x-2 transition-all relative z-10 text-3xl"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>
        </div>
      </main>

      {/* 5. Slideshow Controls */}
      <div className="fixed bottom-lg left-0 right-0 z-30 flex justify-center items-center gap-6 pb-safe hidden md:flex">
        <button
          id="prev-slide"
          onClick={handlePrevSlide}
          className="w-10 h-10 rounded-full border border-surface/30 flex items-center justify-center text-surface hover:bg-surface/20 hover:border-surface transition-all cursor-pointer"
          aria-label="Previous slide"
        >
          <span className="material-symbols-outlined text-sm" data-icon="chevron_left">
            chevron_left
          </span>
        </button>
        <div className="flex gap-3" id="slide-indicators">
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full cursor-pointer indicator transition-all ${idx === currentSlide ? 'bg-surface scale-125' : 'bg-surface/30'}`}
              data-index={idx}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
        <button
          id="next-slide"
          onClick={handleNextSlide}
          className="w-10 h-10 rounded-full border border-surface/30 flex items-center justify-center text-surface hover:bg-surface/20 hover:border-surface transition-all cursor-pointer"
          aria-label="Next slide"
        >
          <span className="material-symbols-outlined text-sm" data-icon="chevron_right">
            chevron_right
          </span>
        </button>
      </div>

      {/* 6. Floating AI Chatbot Badge */}
      <div
        className="fixed bottom-margin-mobile right-margin-mobile z-50 flex items-center gap-3 group cursor-pointer"
        onClick={() => setChatOpen(true)}
      >
        <div className="px-4 py-2 text-surface group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out opacity-100 translate-x-0 text-lg text-white drop-shadow-md hidden md:block">
          Connect with our chatbot for AI assistance
        </div>
        <div className="w-16 h-16 flex items-center justify-center relative shadow-lg animate-[pulse_3s_infinite] bg-transparent">
          <img
            src="/images/ai-chatbot-avatar.png"
            alt="AI Chatbot Icon"
            className="w-full h-full relative z-10 object-contain"
          />
        </div>
      </div>

      {/* 7. AI Chatbot Interactive Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setChatOpen(false)}>
          <div
            className="w-full max-w-md bg-[#0d1c32] border border-[#D4AF37]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-[#D4AF37]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0d1c32] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#fafaf5]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    VIHARA AI Concierge
                  </h3>
                  <span className="text-[11px] text-[#D4AF37]">Smart Tourism Assistant</span>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                    msg.sender === 'bot'
                      ? 'bg-white/10 text-[#fafaf5] border border-[#D4AF37]/20 self-start'
                      : 'bg-[#D4AF37] text-[#0d1c32] font-medium ml-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="bg-white/10 text-[#fafaf5] border border-[#D4AF37]/20 self-start p-3 rounded-xl text-xs flex items-center gap-2 max-w-[85%]">
                  <Loader2 size={14} className="animate-spin text-[#D4AF37]" />
                  <span className="text-gray-300 italic">VIHARA AI Concierge is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Row */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white/5 border-t border-[#D4AF37]/30 flex gap-2">
              <input
                type="text"
                disabled={isChatLoading}
                className="flex-1 bg-white/10 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-xs text-[#fafaf5] placeholder-gray-400 outline-none focus:border-[#D4AF37] disabled:opacity-50"
                placeholder={isChatLoading ? "Generating AI response..." : "Ask about temples, forts, stays, or treks..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button
                type="submit"
                disabled={isChatLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-[#D4AF37] text-[#0d1c32] rounded-lg font-bold text-xs hover:bg-[#ffe088] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;
