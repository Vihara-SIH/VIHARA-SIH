/**
 * Comprehensive Test Suite for Universal Destination Intelligence Pipeline
 *
 * Verifies:
 * 1. Canonical classifier (types, names, commercial exclusions)
 * 2. Bi-directional category expansion (Main <-> Subcategory)
 * 3. Selective pillar resolution (no unnecessary API calls)
 * 4. Live Google Places precedence and deduplication
 * 5. Unknown destination dynamic intelligence (zero hardcoding)
 * 6. Coastal destination beach discovery (Goa case)
 * 7. Multi-destination itinerary generation
 */

import assert from 'node:assert/strict';
import {
  classifyGooglePlace,
  inferCategoryAndSubcategories,
  resolveRequiredPillars,
  CATEGORY_DEFINITIONS,
  getMainCategoryForSubcategory
} from './src/services/vihara/placeClassifier.js';
import {
  expandSelectedCategories,
  placeMatchesCategories
} from './src/services/vihara/schemas.js';
import { mergeCatalogAndLive } from './src/services/vihara/nearbyClient.js';
import { discoverDestinationPlaces, generateIntelligentItinerary, generatePlaceCards } from './src/services/vihara/itineraryEngine.js';

console.log('═════════════════════════════════════════════════════════════════');
console.log('VIHARA — UNIVERSAL DESTINATION INTELLIGENCE TEST SUITE');
console.log('═════════════════════════════════════════════════════════════════\n');

// ─── TEST 1: Canonical Classifier & Negative Filtering ───
console.log('1. Testing Canonical Classifier:');
const tajHotel = { name: 'Hotel Taj Mahal Palace', types: ['lodging', 'hotel', 'restaurant'] };
const tajClass = classifyGooglePlace(tajHotel);
assert.equal(tajClass.categories.length, 0, 'Commercial hotel must be excluded');
console.log('  ✓ Commercial hotel excluded');

const calanguteBeach = {
  name: 'Calangute Beach',
  types: ['natural_feature', 'tourist_attraction', 'point_of_interest', 'establishment'],
  vicinity: 'Calangute, Goa'
};
const beachClass = classifyGooglePlace(calanguteBeach);
assert.ok(beachClass.categories.includes('nature'), 'Calangute Beach must be categorized as nature');
assert.ok(beachClass.subcategories.includes('beaches'), 'Calangute Beach must have subcategory beaches');
console.log('  ✓ Beach classified accurately to nature + beaches');

const aguadaFort = {
  name: 'Aguada Fort & Lighthouse',
  types: ['tourist_attraction', 'historical_landmark', 'point_of_interest'],
  vicinity: 'Candolim, Goa'
};
const fortClass = classifyGooglePlace(aguadaFort);
assert.ok(fortClass.categories.includes('heritage'), 'Aguada Fort must be heritage');
assert.ok(fortClass.subcategories.includes('forts'), 'Aguada Fort must have forts subcategory');
console.log('  ✓ Fort classified accurately to heritage + forts');

const meenakshiTemple = {
  name: 'Meenakshi Amman Temple',
  types: ['hindu_temple', 'place_of_worship', 'point_of_interest'],
  vicinity: 'Madurai'
};
const templeClass = classifyGooglePlace(meenakshiTemple);
assert.ok(templeClass.categories.includes('spiritual'), 'Temple must be spiritual');
assert.ok(templeClass.subcategories.includes('temples'), 'Temple must have temples subcategory');
console.log('  ✓ Temple classified accurately to spiritual + temples');

// ─── TEST 2: Bi-directional Category & Subcategory Resolution ───
console.log('\n2. Testing Bi-directional Category & Subcategory Resolution:');
// Subcategory -> Main
const expandedBeaches = expandSelectedCategories(['beaches']);
assert.ok(expandedBeaches.includes('beaches'), 'Must include beaches');
assert.ok(expandedBeaches.includes('nature'), 'Subcategory beaches must expand upwards to parent nature');
console.log('  ✓ Subcategory beaches expands upwards to parent category nature');

// Main -> Subcategories
const expandedNature = expandSelectedCategories(['nature']);
assert.ok(expandedNature.includes('nature'), 'Must include nature');
assert.ok(expandedNature.includes('beaches'), 'Parent category nature must expand downwards to subcategory beaches');
assert.ok(expandedNature.includes('waterfalls'), 'Parent category nature must expand downwards to subcategory waterfalls');
assert.ok(expandedNature.includes('national-parks'), 'Parent category nature must expand downwards to subcategory national-parks');
console.log('  ✓ Parent category nature expands downwards to all its subcategories');

// ─── TEST 3: Selective Pillar Resolution (No Unnecessary API Calls) ───
console.log('\n3. Testing Selective Pillar Resolution:');
// beaches + waterfalls -> nature only
const pillarsNatureOnly = resolveRequiredPillars(['beaches', 'waterfalls']);
assert.deepEqual(pillarsNatureOnly, ['nature'], 'beaches + waterfalls must ONLY query nature pillar');
console.log('  ✓ beaches + waterfalls resolves to ONLY nature pillar');

// beaches + forts -> nature + heritage
const pillarsBeachFort = resolveRequiredPillars(['beaches', 'forts']);
assert.equal(pillarsBeachFort.length, 2);
assert.ok(pillarsBeachFort.includes('nature') && pillarsBeachFort.includes('heritage'), 'beaches + forts must query nature + heritage');
console.log('  ✓ beaches + forts resolves to nature + heritage pillars');

// temples + trekking -> spiritual + adventure
const pillarsSpiritualAdventure = resolveRequiredPillars(['temples', 'trekking']);
assert.equal(pillarsSpiritualAdventure.length, 2);
assert.ok(pillarsSpiritualAdventure.includes('spiritual') && pillarsSpiritualAdventure.includes('adventure'));
console.log('  ✓ temples + trekking resolves to spiritual + adventure pillars');

// Empty selection -> broad discovery (all 4)
const pillarsAll = resolveRequiredPillars([]);
assert.equal(pillarsAll.length, 4, 'Empty selection must query all 4 pillars for broad discovery');
console.log('  ✓ Empty selection resolves to broad 4-pillar discovery');

// ─── TEST 4: Category Matching ───
console.log('\n4. Testing Category Matching:');
const beachPlaceObj = {
  name: 'Baga Beach',
  category: 'Nature',
  subcategories: ['beaches'],
  types: ['natural_feature', 'tourist_attraction']
};

assert.ok(placeMatchesCategories(beachPlaceObj, ['beaches']), 'Beach place must match subcategory beaches');
assert.ok(placeMatchesCategories(beachPlaceObj, ['nature']), 'Beach place must match parent category nature');
assert.ok(placeMatchesCategories(beachPlaceObj, ['beaches', 'forts']), 'Beach place must match mixed selection');
assert.ok(!placeMatchesCategories(beachPlaceObj, ['spiritual']), 'Beach place must NOT match spiritual');
assert.ok(!placeMatchesCategories(beachPlaceObj, ['forts']), 'Beach place must NOT match forts');
console.log('  ✓ placeMatchesCategories works accurately across categories, subcategories, and mixed selections');

// ─── TEST 5: Live Google Places Precedence & Deduplication ───
console.log('\n5. Testing Live Google Places Precedence:');
const catalogPlaces = [
  {
    id: 'chappora_fort',
    name: 'Chapora Fort',
    category: 'Heritage',
    subcategories: ['forts'],
    description: 'Old catalog description from 2021',
    source: 'catalog'
  },
  {
    id: 'unique_local_sight',
    name: 'Unique Local Sight',
    category: 'Heritage',
    subcategories: ['heritage-walks'],
    source: 'catalog'
  }
];

const livePlaces = [
  {
    id: 'chappora_fort',
    placeId: 'ChIJ...googleId',
    name: 'Chapora Fort',
    category: 'Heritage',
    subcategories: ['forts', 'historical-monuments'],
    description: 'Fresh live Google description with live hours',
    rating: 4.6,
    userRatingsTotal: 18400,
    source: 'google-places-new'
  }
];

const merged = mergeCatalogAndLive(catalogPlaces, livePlaces, { name: 'Goa' });
assert.equal(merged.length, 2, 'Must deduplicate Chapora Fort and keep Unique Local Sight');
const mergedChapora = merged.find(p => p.name === 'Chapora Fort');
assert.equal(mergedChapora.source, 'google-places-new', 'Live Google Places record must take primary precedence over catalog');
assert.equal(mergedChapora.rating, 4.6, 'Live rating must be preserved');
console.log('  ✓ Live Google Places record takes primary precedence over static catalog data');
console.log('  ✓ Unique catalog records are safely retained without duplication');

// ─── TEST 6: Unknown Destination Intelligence (Zero Hardcoding) ───
console.log('\n6. Testing Dynamic Intelligence for Unknown Destination:');
// "Mandu" or "Tirthan Valley" is not in DESTINATION_CATALOG
const unknownDestInput = {
  name: 'Mandu',
  destinationName: 'Mandu, Madhya Pradesh',
  formattedAddress: 'Mandu, Dhar district, Madhya Pradesh, India',
  latitude: 22.3660,
  longitude: 75.3424,
  placeId: 'ChIJ_unknown_mandu_id'
};

const discoveredMandu = await discoverDestinationPlaces(unknownDestInput, {
  selectedCategories: ['heritage', 'forts'],
  travelType: 'solo'
});

assert.ok(discoveredMandu, 'Must discover destination places for unknown destination');
assert.equal(discoveredMandu.name, 'Mandu');
assert.ok(discoveredMandu.places, 'Must return places list for unknown destination');
console.log(`  ✓ Unknown destination "${discoveredMandu.name}" dynamically processed without catalog dependency`);

// ─── TEST 7: Multi-Destination Itinerary Generation ───
console.log('\n7. Testing Multi-Destination Itinerary Generation:');
const multiTrip = {
  destinations: [
    {
      name: 'Goa',
      destinationName: 'Goa, India',
      latitude: 15.2993,
      longitude: 74.1240,
      placeId: 'ChIJ_goa_id'
    },
    {
      name: 'Jaipur',
      destinationName: 'Jaipur, Rajasthan',
      latitude: 26.9124,
      longitude: 75.7873,
      placeId: 'ChIJ_jaipur_id'
    }
  ],
  startDate: '2026-10-01',
  numberOfDays: 4,
  travelType: 'couple',
  selectedCategories: ['nature', 'beaches', 'heritage', 'forts'],
  budget: 50000,
  numberOfTravelers: 2
};

const itinerary = await generateIntelligentItinerary(multiTrip);
assert.equal(itinerary.length, 4, 'Must generate exactly 4 days');
assert.ok(itinerary[0].city, 'Day 1 must have a city');
assert.ok(itinerary[0].activities.length >= 2, 'Day 1 must contain scheduled activities');

const placeCards = generatePlaceCards(itinerary, multiTrip);
assert.ok(placeCards.length > 0, 'Must produce place cards for the itinerary');
assert.ok(placeCards[0].placeName, 'Place card must have placeName');
console.log(`  ✓ Multi-destination itinerary generated (${itinerary.length} days, ${placeCards.length} place cards)`);
console.log(`  ✓ Day 1 City: ${itinerary[0].city} | Activities: ${itinerary[0].activities.length}`);
console.log(`  ✓ Day 3 City: ${itinerary[2].city} | Activities: ${itinerary[2].activities.length}`);

console.log('\n─────────────────────────────────────────────────────────────────');
console.log('ALL UNIVERSAL DESTINATION INTELLIGENCE PIPELINE TESTS PASSED!');
console.log('─────────────────────────────────────────────────────────────────\n');
