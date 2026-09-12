import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyCn1g-yxlp0dB0EPQYgDMd20uanbgc7Hts",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "vihara-6c19b.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "vihara-6c19b",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "vihara-6c19b.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "295767723541",
  appId: env.VITE_FIREBASE_APP_ID || "1:295767723541:web:5b68baadd4288178a2481c",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-T8B1HJWLL1"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// Connect to local Firebase Functions Emulator during development or on localhost
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1');

if (env.DEV || isLocalhost || env.VITE_USE_FUNCTIONS_EMULATOR === 'true') {
  if (!functions._emulatorConnected) {
    try {
      const emulatorPort = parseInt(env.VITE_FIREBASE_FUNCTIONS_PORT || '5001', 10);
      connectFunctionsEmulator(functions, '127.0.0.1', emulatorPort);
      functions._emulatorConnected = true;
      console.log(`[Firebase] Functions connected to local emulator at 127.0.0.1:${emulatorPort}`);
    } catch (e) {
      console.warn('[Firebase] Functions emulator connection note:', e.message);
    }
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;


