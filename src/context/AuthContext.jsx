import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle as googleSignInService,
  sendPasswordReset as resetPasswordService,
  logoutUser,
  getUserProfile
} from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal & Navigation Auth Gates
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [authGateMessage, setAuthGateMessage] = useState('');
  const [pendingTargetView, setPendingTargetView] = useState(null);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile || {
            name: firebaseUser.displayName || 'Traveler',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || '',
            provider: firebaseUser.providerData[0]?.providerId || 'password'
          });
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openLoginModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthGateMessage('');
  };

  const triggerAuthGate = (targetView, customMessage) => {
    setPendingTargetView(targetView);
    setAuthGateMessage(
      customMessage || 'Sign in to access your personalized itineraries, place cards, and trip routes.'
    );
    openLoginModal('login');
  };

  const signUp = async (fullName, email, password, confirmPassword) => {
    const result = await signUpWithEmail(fullName, email, password, confirmPassword);
    setUser(result.user);
    setUserProfile(result.profile);
    closeAuthModal();
    return result;
  };

  const signIn = async (email, password) => {
    const result = await signInWithEmail(email, password);
    setUser(result.user);
    setUserProfile(result.profile);
    closeAuthModal();
    return result;
  };

  const signInWithGoogle = async () => {
    const result = await googleSignInService();
    setUser(result.user);
    setUserProfile(result.profile);
    closeAuthModal();
    return result;
  };

  const sendPasswordReset = async (email) => {
    return await resetPasswordService(email);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    isAuthenticated: !!user,
    loading,
    isAuthModalOpen,
    authModalMode,
    authGateMessage,
    pendingTargetView,
    setAuthModalMode,
    openLoginModal,
    closeAuthModal,
    triggerAuthGate,
    setPendingTargetView,
    signUp,
    signIn,
    signInWithGoogle,
    sendPasswordReset,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
