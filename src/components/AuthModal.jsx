import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    authGateMessage,
    signIn,
    signUp,
    signInWithGoogle,
    sendPasswordReset
  } = useAuth();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const resetFormState = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleModeSwitch = (mode) => {
    resetFormState();
    setAuthModalMode(mode);
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Success will close modal via context
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await signUp(fullName, email, password, confirmPassword);
    } catch (err) {
      setError(err.message || 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google Sign-In was cancelled.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const msg = await sendPasswordReset(email);
      setSuccessMessage(msg || 'Password reset link sent! Please check your email inbox.');
    } catch (err) {
      setError(err.message || 'Unable to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-[#fafaf5] rounded-2xl shadow-2xl border border-[#D4AF37]/40 overflow-hidden text-[#1a1c19]">
        {/* Top Heritage Accent Bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: 'repeating-linear-gradient(45deg, #0d1c32, #0d1c32 10px, #D4AF37 10px, #D4AF37 20px)'
          }}
        />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-500 hover:text-black hover:bg-gray-200/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <span
              className="text-3xl font-bold tracking-widest text-[#0d1c32]"
              style={{ fontFamily: 'Kalam, cursive' }}
            >
              VIHARA
            </span>
            <p className="text-xs uppercase tracking-widest text-[#735c00] font-semibold mt-1">
              Heritage & Modernity
            </p>
          </div>

          {/* Auth Gate Notification if redirected */}
          {authGateMessage && (
            <div className="mb-5 p-3 rounded-lg bg-[#ffe088]/20 border border-[#D4AF37]/50 text-xs text-[#735c00] flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#735c00]" />
              <span>{authGateMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {authModalMode === 'login' && (
            <div>
              <h2 className="text-xl font-bold text-[#0d1c32] mb-1 text-center font-['Montserrat']">
                Welcome Back
              </h2>
              <p className="text-xs text-gray-600 text-center mb-6">
                Sign in to manage your journeys and saved itineraries
              </p>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('forgot')}
                      className="text-xs text-[#735c00] hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-[#0d1c32] text-white font-semibold text-xs tracking-wider uppercase hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <span className="relative px-3 bg-[#fafaf5] text-[11px] text-gray-500 uppercase font-medium">
                  Or continue with
                </span>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Switch to Sign Up */}
              <div className="mt-6 text-center text-xs text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signup')}
                  className="text-[#735c00] font-bold hover:underline"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* SIGN UP VIEW */}
          {authModalMode === 'signup' && (
            <div>
              <h2 className="text-xl font-bold text-[#0d1c32] mb-1 text-center font-['Montserrat']">
                Create Account
              </h2>
              <p className="text-xs text-gray-600 text-center mb-6">
                Join VIHARA for personalized heritage tourism and AI itineraries
              </p>

              <form onSubmit={handleEmailSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-[#D4AF37] text-[#0d1c32] font-bold text-xs tracking-wider uppercase hover:bg-[#ffe088] transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-4"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <span className="relative px-3 bg-[#fafaf5] text-[11px] text-gray-500 uppercase font-medium">
                  Or
                </span>
              </div>

              {/* Google Sign-Up */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Switch to Sign In */}
              <div className="mt-5 text-center text-xs text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="text-[#735c00] font-bold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {authModalMode === 'forgot' && (
            <div>
              <h2 className="text-xl font-bold text-[#0d1c32] mb-1 text-center font-['Montserrat']">
                Reset Password
              </h2>
              <p className="text-xs text-gray-600 text-center mb-6">
                Enter your registered email address and we'll send you a password reset link.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-[#0d1c32] text-white font-semibold text-xs tracking-wider uppercase hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {loading ? 'Sending Link...' : 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-gray-600">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="text-[#735c00] font-bold hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
