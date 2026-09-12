import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import {
  formatDestinationForFirestore,
  saveTripDestinations,
  saveUserTrip
} from './src/services/tripService.js';
import { auth, db } from './src/services/firebase.js';

async function runTests() {
  console.log('🧪 Starting Destination Firestore Integration Tests...\n');

  // Test 1: Verify formatDestinationForFirestore output format
  console.log('Test 1: formatDestinationForFirestore output format');
  const sampleInput1 = {
    destinationName: 'Delhi',
    name: 'Delhi',
    placeId: 'ChIJLbZ-NFv9DDkRzk0gTkm3wlI',
    latitude: 28.6139,
    longitude: 77.2090,
    formattedAddress: 'Delhi, India',
    city: 'Delhi',
    state: 'Delhi'
  };

  const formatted1 = formatDestinationForFirestore(sampleInput1);
  console.log('Formatted Destination 1:', formatted1);

  if (
    formatted1.destinationName === 'Delhi' &&
    formatted1.placeId === 'ChIJLbZ-NFv9DDkRzk0gTkm3wlI' &&
    formatted1.latitude === 28.6139 &&
    formatted1.longitude === 77.2090
  ) {
    console.log('✅ Test 1 Passed: Destination accurately formatted with required fields.');
  } else {
    console.error('❌ Test 1 Failed:', formatted1);
    process.exit(1);
  }

  // Authenticate test user to satisfy Firestore Security Rules for users/{uid}/trips/{tripId}
  console.log('\nAuthenticating test user for Firestore write access...');
  const testEmail = `test_traveler_${Date.now()}@vihara-test.com`;
  const testPassword = 'TestPassword123!';
  let testUser = null;

  try {
    const cred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    testUser = cred.user;
    console.log(`✅ Authenticated test user: ${testUser.uid} (${testEmail})`);
  } catch (authErr) {
    console.warn('Could not create test user, attempting sign in...', authErr.message);
    const cred = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    testUser = cred.user;
  }

  const testUid = testUser.uid;
  const testTripId = `trip_auto_test_${Date.now()}`;

  // Test 2: Save Multiple Destinations to Firestore: users/{userId}/trips/{tripId}
  console.log('\nTest 2: Save Multiple Destinations to Firestore users/{userId}/trips/{tripId}');
  const sampleDestinations = [
    {
      destinationName: 'Delhi',
      name: 'Delhi',
      placeId: 'ChIJLbZ-NFv9DDkRzk0gTkm3wlI',
      latitude: 28.6139,
      longitude: 77.2090
    },
    {
      destinationName: 'Goa',
      name: 'Goa',
      placeId: 'ChIJ4236QnBuvzsR0gB_0t3e404',
      latitude: 15.2993,
      longitude: 74.1240
    }
  ];

  console.log(`Writing destinations to users/${testUid}/trips/${testTripId}...`);
  const saveSuccess = await saveTripDestinations(testUid, testTripId, sampleDestinations);

  if (!saveSuccess) {
    console.error('❌ Test 2 Failed: saveTripDestinations returned false');
    process.exit(1);
  }
  console.log('✅ saveTripDestinations returned true');

  // Fetch document back from Firestore to verify actual written structure
  const tripDocRef = doc(db, 'users', testUid, 'trips', testTripId);
  const docSnap = await getDoc(tripDocRef);

  if (!docSnap.exists()) {
    console.error('❌ Test 2 Failed: Trip document was not found in Firestore!');
    process.exit(1);
  }

  const data = docSnap.data();
  console.log('Retrieved Firestore Trip Document:', JSON.stringify(data, null, 2));

  if (!Array.isArray(data.destinations) || data.destinations.length !== 2) {
    console.error('❌ Test 2 Failed: destinations array missing or length mismatch');
    process.exit(1);
  }

  const d1 = data.destinations[0];
  const d2 = data.destinations[1];

  if (
    d1.destinationName === 'Delhi' &&
    d1.placeId === 'ChIJLbZ-NFv9DDkRzk0gTkm3wlI' &&
    d1.latitude === 28.6139 &&
    d1.longitude === 77.2090 &&
    d2.destinationName === 'Goa' &&
    d2.placeId === 'ChIJ4236QnBuvzsR0gB_0t3e404' &&
    d2.latitude === 15.2993 &&
    d2.longitude === 74.1240
  ) {
    console.log('✅ Test 2 Passed: Firestore contains exact destinations array with all 4 fields for every destination!');
  } else {
    console.error('❌ Test 2 Failed: Saved destination fields did not match expected structure', data.destinations);
    process.exit(1);
  }

  // Test 3: Test update / merge with existing document (adding a 3rd destination)
  console.log('\nTest 3: Update existing trip document with an additional destination (Jaipur)');
  const updatedDestinations = [
    ...sampleDestinations,
    {
      destinationName: 'Jaipur',
      name: 'Jaipur',
      placeId: 'ChIJgeByq0W1bTkR_b7u4v9iK-8',
      latitude: 26.9124,
      longitude: 75.7873
    }
  ];

  await saveTripDestinations(testUid, testTripId, updatedDestinations);

  const updatedSnap = await getDoc(tripDocRef);
  const updatedData = updatedSnap.data();

  if (
    updatedData.destinations.length === 3 &&
    updatedData.destinations[2].destinationName === 'Jaipur' &&
    updatedData.destinations[2].placeId === 'ChIJgeByq0W1bTkR_b7u4v9iK-8' &&
    updatedData.destinations[2].latitude === 26.9124 &&
    updatedData.destinations[2].longitude === 75.7873
  ) {
    console.log('✅ Test 3 Passed: Successfully merged 3rd destination into existing Firestore trip document without overwriting or duplicating.');
  } else {
    console.error('❌ Test 3 Failed:', updatedData);
    process.exit(1);
  }

  // Test 4: Verify full saveUserTrip integration preserves destinations array format
  console.log('\nTest 4: saveUserTrip full itinerary integration with destinations array');
  const fullTripId = `trip_full_${Date.now()}`;
  const fullTripData = {
    tripId: fullTripId,
    destinations: updatedDestinations,
    startDate: '2026-10-01',
    endDate: '2026-10-06',
    numberOfDays: 5,
    travelType: 'couple',
    budget: 45000
  };

  await saveUserTrip(testUid, fullTripData);
  const fullTripDocRef = doc(db, 'users', testUid, 'trips', fullTripId);
  const fullSnap = await getDoc(fullTripDocRef);
  const fullSavedData = fullSnap.data();

  if (
    fullSavedData.destinations &&
    fullSavedData.destinations.length === 3 &&
    fullSavedData.destinations[0].destinationName === 'Delhi' &&
    fullSavedData.destinations[0].latitude === 28.6139 &&
    fullSavedData.destinations[0].longitude === 77.2090
  ) {
    console.log('✅ Test 4 Passed: saveUserTrip saved destinations with all required fields.');
  } else {
    console.error('❌ Test 4 Failed:', fullSavedData);
    process.exit(1);
  }

  // Clean up test documents and test user
  try {
    await deleteDoc(tripDocRef);
    await deleteDoc(fullTripDocRef);
    await deleteUser(testUser);
    console.log('\n🧹 Cleaned up test Firestore documents & test user.');
  } catch (e) {
    console.warn('Cleanup warning:', e.message);
  }

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('💥 Test error:', err);
  process.exit(1);
});
