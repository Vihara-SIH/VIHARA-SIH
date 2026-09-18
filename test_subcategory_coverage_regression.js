/**
 * REGRESSION SUITE: Universal Subcategory Coverage, Tightened Beach Guard & Non-Leakage
 *
 * Explicitly tests:
 * 1. Goa genuine beach with type "beach" -> accepted
 * 2. Goa genuine beach with "natural_feature" + beach name -> accepted
 * 3. Jaipur "water beach (Furkan)" with tourist_attraction but NO beach/natural_feature -> rejected
 * 4. Varanasi "Varanasi Beach" with tourist_attraction but NO beach/natural_feature -> rejected
 * 5. Beach Shack restaurant -> rejected
 * 6. Waterfall -> never classified as beaches
 * 7. Fort -> never classified as beaches
 * 8. Gokarna genuine beaches -> accepted
 * 9. Multi-destination Goa + Jaipur -> beaches available ONLY for Goa
 */

import {
  classifyGooglePlace,
  CATEGORY_DEFINITIONS,
  TARGETED_DISCOVERY_QUERIES
} from './src/services/vihara/placeClassifier.js';
import {
  analyzeCategoriesForDestinations
} from './src/services/destinationService.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

async function runRegressionSuite() {
  console.log('===============================================================');
  console.log('VIHARA UNIVERSAL SUBCATEGORY DISCOVERY REGRESSION SUITE');
  console.log('===============================================================\n');

  // Test 1: Goa genuine beach with type "beach" -> accepted
  console.log('--- Test 1: Genuine beach with type "beach" ---');
  const b1 = classifyGooglePlace({
    name: 'Baga Beach',
    types: ['beach', 'point_of_interest']
  });
  assert(b1.subcategories.includes('beaches'), 'Baga Beach with type "beach" is accepted as beaches');
  assert(b1.categories.includes('nature'), 'Baga Beach categorized under nature');

  // Test 2: Goa genuine beach with "natural_feature" + beach name -> accepted
  console.log('\n--- Test 2: Genuine beach with "natural_feature" + beach name ---');
  const b2 = classifyGooglePlace({
    name: 'Calangute Beach',
    types: ['natural_feature', 'tourist_attraction', 'point_of_interest']
  });
  assert(b2.subcategories.includes('beaches'), 'Calangute Beach with natural_feature + beach name accepted as beaches');
  assert(b2.categories.includes('nature'), 'Calangute Beach categorized under nature');

  // Test 3: Jaipur "water beach (Furkan)" with tourist_attraction but NO beach/natural_feature -> rejected
  console.log('\n--- Test 3: Jaipur inland "water beach ( Furkan)" rejection ---');
  const b3 = classifyGooglePlace({
    name: 'water beach ( Furkan)',
    types: ['tourist_attraction', 'point_of_interest', 'establishment']
  });
  assert(!b3.subcategories.includes('beaches'), 'Jaipur "water beach ( Furkan)" without beach/natural_feature type is strictly REJECTED');

  // Test 4: Varanasi "Varanasi Beach" with tourist_attraction but NO beach/natural_feature -> rejected
  console.log('\n--- Test 4: Varanasi river sandbank "Varanasi Beach" rejection ---');
  const b4 = classifyGooglePlace({
    name: 'Varanasi Beach',
    types: ['tourist_attraction', 'point_of_interest', 'establishment']
  });
  assert(!b4.subcategories.includes('beaches'), 'Varanasi river sandbank "Varanasi Beach" without beach/natural_feature type is strictly REJECTED');

  // Test 5: Beach Shack restaurant -> rejected
  console.log('\n--- Test 5: Beach Shack restaurant rejection ---');
  const b5 = classifyGooglePlace({
    name: 'Beach Shack Bar and Restaurant',
    types: ['restaurant', 'food', 'point_of_interest', 'establishment']
  });
  assert(b5.categories.length === 0, 'Beach Shack Bar and Restaurant rejected from all categories');
  assert(b5.subcategories.length === 0, 'Beach Shack Bar and Restaurant rejected from all subcategories');

  // Test 6: Waterfall -> never classified as beaches
  console.log('\n--- Test 6: Waterfall never classified as beaches ---');
  const w1 = classifyGooglePlace({
    name: 'Dudhsagar Waterfalls',
    types: ['natural_feature', 'waterfall', 'tourist_attraction']
  });
  assert(w1.subcategories.includes('waterfalls'), 'Dudhsagar matches waterfalls');
  assert(!w1.subcategories.includes('beaches'), 'Dudhsagar NEVER matches beaches');

  // Test 7: Fort -> never classified as beaches
  console.log('\n--- Test 7: Fort never classified as beaches ---');
  const f1 = classifyGooglePlace({
    name: 'Fort Aguada',
    types: ['tourist_attraction', 'historical_landmark']
  });
  assert(f1.subcategories.includes('forts'), 'Fort Aguada matches forts');
  assert(!f1.subcategories.includes('beaches'), 'Fort Aguada NEVER matches beaches');

  // Test 8: Gokarna genuine beaches -> accepted
  console.log('\n--- Test 8: Gokarna genuine beaches accepted ---');
  const gok1 = classifyGooglePlace({
    name: 'Om Beach',
    types: ['natural_feature', 'beach', 'tourist_attraction']
  });
  const gok2 = classifyGooglePlace({
    name: 'Kudle Beach',
    types: ['beach', 'natural_feature']
  });
  assert(gok1.subcategories.includes('beaches'), 'Gokarna Om Beach accepted as beaches');
  assert(gok2.subcategories.includes('beaches'), 'Gokarna Kudle Beach accepted as beaches');

  // Test 9: Multi-destination Goa + Jaipur -> beaches available only for Goa
  console.log('\n--- Test 9: Multi-Destination Goa + Jaipur ---');
  const matrix = await analyzeCategoriesForDestinations(['goa', 'jaipur']);
  const beachesSub = matrix.nature?.subcategories?.find(s => s.id === 'beaches');
  assert(beachesSub && beachesSub.available, 'Beaches is available in multi-destination matrix');
  assert(beachesSub.availableIn.length === 1 && /goa/i.test(beachesSub.availableIn[0]), 'Beaches is available ONLY for Goa (availableIn: ' + JSON.stringify(beachesSub.availableIn) + ')');

  // Additional check: Canonical queries structure
  console.log('\n--- Test 10: Canonical Targeted Discovery Queries Integrity ---');
  assert(Array.isArray(TARGETED_DISCOVERY_QUERIES), 'TARGETED_DISCOVERY_QUERIES is array');
  assert(TARGETED_DISCOVERY_QUERIES.length === 6, '6 decoupled discovery queries');

  console.log('\n===============================================================');
  console.log(`REGRESSION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite();
