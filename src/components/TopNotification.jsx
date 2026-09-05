import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function TopNotification() {
  const { authGateMessage, closeAuthModal, openLoginModal } = useAuth();

  if (!authGateMessage) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-fadeIn">
      <div className="bg-[#0d1c32] text-[#fafaf5] px-5 py-3 rounded-2xl shadow-xl border border-[#D4AF37] flex items-center justify-between gap-4 max-w-xl w-full pointer-events-auto text-xs">
        <div className="flex items-center gap-2.5 font-medium">
          <AlertCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          <span>{authGateMessage}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openLoginModal('login')}
            className="px-3 py-1 bg-[#D4AF37] text-[#0d1c32] rounded-lg font-bold uppercase tracking-wider hover:bg-[#ffe088] transition-colors whitespace-nowrap"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopNotification;
