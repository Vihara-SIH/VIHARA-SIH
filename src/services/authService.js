import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

/**
 * Validates basic email regex pattern
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Maps raw Firebase Auth errors to user-friendly messages required by specification
 */
export const mapAuthErrorToMessage = (errorCode, defaultMessage = 'An error occurred during authentication.') => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in.';
    case 'auth/user-not-found':
      return 'No account found. Please sign up first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Google Sign-In window was closed. Please try again.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet.';
    default:
      return defaultMessage;
  }
};

/**
 * Creates a new user profile document in Firestore: users/{firebaseUID}
 */
export const createUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  const profileData = {
    name: data.name || 'Traveler',
    email: data.email || '',
    photoURL: data.photoURL || '',
    provider: data.provider || 'password',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(userRef, profileData, { merge: true });
  return profileData;
};

/**
 * Retrieves a user profile document from Firestore: users/{firebaseUID}
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return { uid, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
};

/**
 * Email & Password Sign Up
 */
export const signUpWithEmail = async (fullName, email, password, confirmPassword) => {
  // 1. Check all required fields
  if (!fullName?.trim() || !email?.trim() || !password || !confirmPassword) {
    throw new Error('Please fill in all required fields.');
  }

  // 2. Validate email format
  if (!isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  // 3. Check password match
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  if (password.length < 6) {
    throw new Error('Password should be at least 6 characters long.');
  }

  try {
    // 4. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // 5. Create user profile in Firestore: users/{firebaseUID}
    const profile = await createUserProfile(user.uid, {
      name: fullName.trim(),
      email: user.email,
      photoURL: user.photoURL || '',
      provider: 'password'
    });

    return { user, profile };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists. Please sign in.');
    }
    throw new Error(mapAuthErrorToMessage(error.code, error.message));
  }
};

/**
 * Email & Password Sign In
 */
export const signInWithEmail = async (email, password) => {
  // 1. Validate required fields
  if (!email?.trim() || !password) {
    throw new Error('Please fill in all required fields.');
  }

  if (!isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // Fetch user profile from Firestore: users/{currentUser.uid}
    let profile = await getUserProfile(user.uid);
    if (!profile) {
      // Fallback create profile if missing
      profile = await createUserProfile(user.uid, {
        name: user.displayName || 'Traveler',
        email: user.email,
        photoURL: user.photoURL || '',
        provider: 'password'
      });
    }

    return { user, profile };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found. Please sign up first.');
    }
    if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/invalid-login-credentials'
    ) {
      throw new Error('Invalid email or password. Please try again.');
    }
    throw new Error(mapAuthErrorToMessage(error.code, error.message));
  }
};

/**
 * Google Sign-In
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if Firestore document users/{UID} exists
    let profile = await getUserProfile(user.uid);

    if (!profile) {
      // New Google User: create document
      profile = await createUserProfile(user.uid, {
        name: user.displayName || 'Traveler',
        email: user.email || '',
        photoURL: user.photoURL || '',
        provider: 'google'
      });
    } else {
      // Existing Google user: update last active timestamp
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Could not update last login timestamp:', e);
      }
    }

    return { user, profile };
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In was cancelled.');
    }
    throw new Error(mapAuthErrorToMessage(error.code, error.message));
  }
};

/**
 * Forgot Password - Send password reset email
 */
export const sendPasswordReset = async (email) => {
  if (!email?.trim()) {
    throw new Error('Please enter your registered email address.');
  }

  if (!isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    return 'Password reset link sent! Please check your email inbox.';
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up.');
    }
    throw new Error(mapAuthErrorToMessage(error.code, error.message));
  }
};

/**
 * Sign Out
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
