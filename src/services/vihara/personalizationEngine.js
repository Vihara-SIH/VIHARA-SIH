import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function saveTravelPreferences(uid, prefs = {}) {
  if (!uid) return false;
  try {
    const safe = {
      preferredCategories: Array.isArray(prefs.preferredCategories) ? prefs.preferredCategories.slice(0, 20) : [],
      typicalTravelType: prefs.typicalTravelType || null,
      typicalTravelerCount: Number(prefs.typicalTravelerCount) || null,
      lastBudget: Number(prefs.lastBudget) || null,
      updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, 'users', uid), { preferences: safe }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[VIHARA preferences] persist skipped:', err.message);
    return false;
  }
}
