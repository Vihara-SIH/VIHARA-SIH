import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, MapPin, Compass, Bookmark, Menu, X, Sparkles, Building, Calendar } from 'lucide-react';

export const Navbar = ({ currentView, onNavigate }) => {
  const { isAuthenticated, userProfile, openLoginModal, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view) => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    onNavigate(view);
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fcf9f2]/95 backdrop-blur-xl shadow-[0_1px_12px_rgba(7,2,53,0.06)] border-b border-[#e5e2db] transition-all duration-300">
      <div className="h-20 w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo & Contextual Location Indicator */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left cursor-pointer border-none bg-transparent p-0"
          >
            <div className="w-10 h-10 rounded-full bg-[#fe932c] flex items-center justify-center shadow-[0_2px_10px_rgba(254,147,44,0.35)] shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[#663500] text-[22px]">temple_hindu</span>
            </div>
            <div className="flex flex-col">
              <span
                className="font-bold tracking-tight text-[#070235] text-xl leading-none"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                VIHARA
              </span>
              <span className="text-[9px] text-[#904d00] tracking-[0.16em] uppercase font-bold pt-1">
                HERITAGE &amp; INTELLIGENT DISCOVERY
              </span>
            </div>
          </button>

          <div className="h-7 w-[1px] bg-[#e5e2db] hidden xl:block" />

          {/* Active GPS Node */}
          <button
            type="button"
            onClick={() => handleNavClick('near-me')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f3ec] hover:bg-[#ebe8e1] transition-colors text-xs font-semibold text-[#1c1c18] border border-[#e5e2db] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#904d00] text-[16px]">location_on</span>
            <span>Hyderabad, TS</span>
            <span className="material-symbols-outlined text-gray-500 text-[16px]">expand_more</span>
          </button>
        </div>

        {/* Stitch Central Pill Navigation */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#f6f3ec] border border-[#e5e2db] shadow-inner">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentView === 'home'
                ? 'bg-[#070235] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#070235] hover:bg-white/60'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('near-me')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentView === 'near-me'
                ? 'bg-[#fe932c] text-[#663500] shadow-[0_2px_8px_rgba(254,147,44,0.35)]'
                : 'text-gray-600 hover:text-[#070235] hover:bg-white/60'
            }`}
          >
            Near Me
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('trip-planning')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentView === 'trip-planning'
                ? 'bg-[#070235] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#070235] hover:bg-white/60'
            }`}
          >
            Trip Planning
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('stays-travel')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentView === 'stays-travel'
                ? 'bg-[#070235] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#070235] hover:bg-white/60'
            }`}
          >
            Stays &amp; Heritage Havens
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('event-bookings')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentView === 'event-bookings'
                ? 'bg-[#070235] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#070235] hover:bg-white/60'
            }`}
          >
            Events Nearby
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('saved-items')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentView === 'saved-items'
                ? 'bg-[#070235] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#070235] hover:bg-white/60'
            }`}
          >
            Saved Gems
          </button>
        </nav>

        {/* Right Action Toolbar */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f6f3ec] text-gray-700 text-xs font-bold border border-[#e5e2db]"
          >
            <span>INR (₹)</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('saved-items')}
            className="w-9 h-9 rounded-full bg-[#f6f3ec] border border-[#e5e2db] flex items-center justify-center text-gray-700 hover:text-[#904d00] hover:bg-white transition-colors cursor-pointer"
            title="Saved Gems &amp; Travel Portfolio"
          >
            <span className="material-symbols-outlined text-[20px]">bookmark</span>
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full bg-[#070235] hover:bg-black text-white transition-all shadow-sm cursor-pointer"
              >
                <span className="text-xs font-bold truncate max-w-[110px]">
                  {userProfile?.name || 'My Journeys'}
                </span>
                <div className="w-7 h-7 rounded-full bg-[#fe932c] text-[#663500] flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userProfile?.name?.charAt(0) || 'U'
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2.5 z-50 animate-fadeIn text-sm">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-[#070235] truncate">{userProfile?.name || 'Traveler'}</p>
                    <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
                  </div>
                  <button
                    onClick={() => handleNavClick('trip-planning')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#f6f3ec] flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-[#904d00]" />
                    Plan a Journey
                  </button>
                  <button
                    onClick={() => handleNavClick('my-bookings')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#f6f3ec] flex items-center gap-2"
                  >
                    <Building className="w-4 h-4 text-[#fe932c]" />
                    My Stays &amp; Bookings
                  </button>
                  <button
                    onClick={() => handleNavClick('my-events')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#f6f3ec] flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-[#c2410c]" />
                    My Reserved Events
                  </button>
                  <button
                    onClick={() => handleNavClick('saved-items')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#f6f3ec] flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4 text-[#904d00]" />
                    Saved Gems &amp; Itineraries
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openLoginModal('login')}
              className="flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 rounded-full bg-[#070235] hover:bg-black text-white transition-all shadow-md cursor-pointer"
            >
              <span className="text-xs font-bold tracking-wide">Sign In / My Journeys</span>
              <div className="w-7 h-7 rounded-full bg-[#1e1b4b] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[16px]">person</span>
              </div>
            </button>
          )}

          {/* Mobile menu hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#fcf9f2] border-t border-[#e5e2db] px-5 py-4 space-y-2.5 shadow-lg animate-fadeIn">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="block w-full text-left py-2 text-sm font-bold text-[#070235]"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('near-me')}
            className="block w-full text-left py-2 text-sm font-bold text-[#904d00]"
          >
            Near Me (Hyperlocal Radar)
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('trip-planning')}
            className="block w-full text-left py-2 text-sm font-bold text-[#070235]"
          >
            Trip Planning
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('stays-travel')}
            className="block w-full text-left py-2 text-sm font-bold text-[#070235]"
          >
            Stays &amp; Heritage Havens
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('event-bookings')}
            className="block w-full text-left py-2 text-sm font-bold text-[#070235]"
          >
            Events Nearby
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('saved-items')}
            className="block w-full text-left py-2 text-sm font-bold text-[#070235]"
          >
            Saved Gems &amp; Portfolio
          </button>
        </div>
      )}
    </header>
  );
};
