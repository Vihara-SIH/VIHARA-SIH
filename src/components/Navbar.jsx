import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, MapPin, Compass, Bookmark, Menu, X } from 'lucide-react';

export const Navbar = ({ currentView, onNavigate }) => {
  const { isAuthenticated, userProfile, openLoginModal, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view) => {
    setIsMobileMenuOpen(false);
    onNavigate(view);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#fafaf5]/90 backdrop-blur-md border-b border-[#735c00]/20 shadow-sm transition-all duration-300">
      {/* Top Motif Border */}
      <div
        className="h-1 w-full"
        style={{
          background: 'repeating-linear-gradient(45deg, #0d1c32, #0d1c32 10px, #D4AF37 10px, #D4AF37 20px)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span
            className="text-3xl md:text-4xl text-[#0d1c32] font-bold tracking-tight"
            style={{ fontFamily: 'Kalam, cursive' }}
          >
            <span
              className="text-4xl md:text-5xl text-[#0d1c32] pr-1"
              style={{ fontFamily: '"Great Vibes", cursive' }}
            >
              V
            </span>
            IHARA
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#44474d]">
          <button
            onClick={() => handleNavClick('home')}
            className={`hover:text-[#735c00] transition-colors ${
              currentView === 'home' ? 'text-[#735c00] font-semibold border-b-2 border-[#735c00] pb-0.5' : ''
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => handleNavClick('trip-planning')}
            className={`hover:text-[#735c00] transition-colors ${
              currentView === 'trip-planning' ? 'text-[#735c00] font-semibold border-b-2 border-[#735c00] pb-0.5' : ''
            }`}
          >
            Trip Planning
          </button>
          <button
            onClick={() => handleNavClick('near-me')}
            className={`hover:text-[#735c00] transition-colors ${
              currentView === 'near-me' ? 'text-[#735c00] font-semibold border-b-2 border-[#735c00] pb-0.5' : ''
            }`}
          >
            Near Me
          </button>
          <button
            onClick={() => handleNavClick('event-bookings')}
            className={`hover:text-[#735c00] transition-colors ${
              currentView === 'event-bookings' ? 'text-[#735c00] font-semibold border-b-2 border-[#735c00] pb-0.5' : ''
            }`}
          >
            Experiences
          </button>
          <button
            onClick={() => handleNavClick('stays-travel')}
            className={`hover:text-[#735c00] transition-colors ${
              currentView === 'stays-travel' ? 'text-[#735c00] font-semibold border-b-2 border-[#735c00] pb-0.5' : ''
            }`}
          >
            Stays & Travel
          </button>
        </nav>

        {/* User Account / Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-white border border-[#D4AF37]/50 shadow-sm hover:border-[#D4AF37] transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-[#0d1c32] text-white flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userProfile?.name?.charAt(0) || 'U'
                  )}
                </div>
                <span className="text-xs font-semibold text-[#0d1c32] max-w-[100px] truncate hidden sm:inline-block">
                  {userProfile?.name || 'Traveler'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn text-sm">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-semibold text-[#0d1c32] truncate">{userProfile?.name || 'Traveler'}</p>
                    <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleNavClick('trip-planning');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#fafaf5] flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-[#735c00]" />
                    Plan a Journey
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleNavClick('my-bookings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#fafaf5] flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4 text-[#b45309]" />
                    My Bookings
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openLoginModal('login')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#0d1c32] hover:text-[#735c00] transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => openLoginModal('signup')}
                className="px-4 py-1.5 rounded-full bg-[#D4AF37] text-[#0d1c32] text-xs font-bold uppercase tracking-wider hover:bg-[#ffe088] shadow-sm transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-gray-700 hover:bg-gray-200"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#fafaf5] border-t border-gray-200 px-4 py-4 space-y-3">
          <button
            onClick={() => handleNavClick('home')}
            className="block w-full text-left py-2 text-sm font-medium text-gray-800"
          >
            Explore
          </button>
          <button
            onClick={() => handleNavClick('trip-planning')}
            className="block w-full text-left py-2 text-sm font-medium text-gray-800"
          >
            Trip Planning
          </button>
          <button
            onClick={() => handleNavClick('near-me')}
            className="block w-full text-left py-2 text-sm font-medium text-gray-800"
          >
            Near Me
          </button>
          <button
            onClick={() => handleNavClick('event-bookings')}
            className="block w-full text-left py-2 text-sm font-medium text-gray-800"
          >
            Experiences
          </button>
          <button
            onClick={() => handleNavClick('stays-travel')}
            className="block w-full text-left py-2 text-sm font-medium text-gray-800"
          >
            Stays & Travel
          </button>
        </div>
      )}
    </header>
  );
};
