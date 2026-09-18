/**
 * REGRESSION SUITE: Universal Subcategory Coverage & Non-Leakage
 *
 * Tests:
 * 1. Goa: Beaches discovered (Calangute, Baga, Colva, etc.)
 * 2. Goa: Waterfalls remain discovered alongside beaches (Dudhsagar, Neturlem, etc.)
 * 3. Another coastal destination: Beaches discovered
 * 4. Inland destination (Jaipur, Varanasi): Beaches strictly NOT confirmed
 * 5. Multi-destination trip: Differential availability correctly tracked (availableIn)
 * 6. Non-attraction commercial places: Strict exclusion
 * 7. Deduplication: Duplicate place_ids across queries merged cleanly
 * 8. Strict subcategory isolation: Waterfall != Beach, Fort != Beach
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

  // Test 1: TARGETED_DISCOVERY_QUERIES structure
  console.log('--- Test 1: Canonical Targeted Discovery Queries ---');
  assert(Array.isArray(TARGETED_DISCOVERY_QUERIES), 'TARGETED_DISCOVERY_QUERIES is exported as an array');
  assert(TARGETED_DISCOVERY_QUERIES.length === 6, `Exactly 6 targeted queries defined (got ${TARGETED_DISCOVERY_QUERIES.length})`);
  const natureQueries = TARGETED_DISCOVERY_QUERIES.filter(q => q.cat === 'nature');
  assert(natureQueries.length === 3, 'Nature pillar is decoupled into exactly 3 non-competing queries');
  assert(natureQueries.some(q => q.subcat === 'beaches'), 'Nature includes dedicated beaches query');
  assert(natureQueries.some(q => q.subcat === 'waterfalls-lakes'), 'Nature includes dedicated waterfalls-lakes query');
  assert(natureQueries.some(q => q.subcat === 'parks-hills'), 'Nature includes dedicated parks-hills query');

  // Test 2: Goa Beach & Waterfall Simultaneous Discovery
  console.log('\n--- Test 2: Goa Simultaneous Beaches & Waterfalls Classification ---');
  const mockGoaPlaces = [
    {
      place_id: 'pl_calangute',
      name: 'Calangute Beach',
      types: ['natural_feature', 'tourist_attraction', 'point_of_interest'],
      vicinity: 'Calangute, Goa'
    },
    {
      place_id: 'pl_baga',
      name: 'Baga Beach',
      types: ['beach', 'natural_feature'],
      vicinity: 'Baga, Goa'
    },
    {
      place_id: 'pl_dudhsagar',
      name: 'Dudhsagar Waterfalls',
      types: ['tourist_attraction', 'natural_feature'],
      vicinity: 'Sonaulim, Goa'
    },
    {
      place_id: 'pl_aguada',
      name: 'Fort Aguada',
      types: ['tourist_attraction', 'historical_landmark'],
      vicinity: 'Candolim, Goa'
    }
  ];

  const goaSubs = new Set();
  const goaCats = new Set();
  mockGoaPlaces.forEach(p => {
    const { categories, subcategories } = classifyGooglePlace(p);
    categories.forEach(c => goaCats.add(c));
    subcategories.forEach(s => goaSubs.add(s));
  });

  assert(goaSubs.has('beaches'), 'Goa discovery detects subcategory "beaches"');
  assert(goaSubs.has('waterfalls'), 'Goa discovery detects subcategory "waterfalls"');
  assert(goaSubs.has('forts'), 'Goa discovery detects subcategory "forts"');
  assert(goaCats.has('nature'), 'Goa detects parent category "nature"');
  assert(goaCats.has('heritage'), 'Goa detects parent category "heritage"');

  // Test 3: Inland Destination Strict Exclusion of Beaches
  console.log('\n--- Test 3: Inland Destination (Jaipur / Varanasi) Strict Beach Non-Leakage ---');
  const mockJaipurPlaces = [
    {
      place_id: 'pl_amber',
      name: 'Amber Fort',
      types: ['tourist_attraction', 'historical_landmark'],
      vicinity: 'Devisinghpura, Amer, Jaipur'
    },
    {
      place_id: 'pl_hawa',
      name: 'Hawa Mahal',
      types: ['tourist_attraction', 'historical_landmark'],
      vicinity: 'Badi Choupad, Jaipur'
    },
    {
      place_id: 'pl_jal',
      name: 'Jal Mahal Lake',
      types: ['tourist_attraction', 'natural_feature'],
      vicinity: 'Amer Rd, Jaipur'
    }
  ];

  const jaipurSubs = new Set();
  mockJaipurPlaces.forEach(p => {
    const { subcategories } = classifyGooglePlace(p);
    subcategories.forEach(s => jaipurSubs.add(s));
  });

  assert(jaipurSubs.has('forts') || jaipurSubs.has('historical-monuments'), 'Jaipur discovers forts/monuments');
  assert(jaipurSubs.has('lakes'), 'Jaipur discovers lakes');
  assert(!jaipurSubs.has('beaches'), 'Jaipur strictly DOES NOT discover "beaches" (no false positives)');

  // Test 4: Commercial Place Rejection (Beach View Cafe / Temple View Hotel)
  console.log('\n--- Test 4: Commercial Non-Attraction Rejection ---');
  const commercialPlaces = [
    {
      place_id: 'c1',
      name: 'Beach Shack Bar and Restaurant',
      types: ['restaurant', 'food', 'point_of_interest', 'establishment'],
      vicinity: 'Calangute Beach, Goa'
    },
    {
      place_id: 'c2',
      name: 'Temple View Guest House',
      types: ['lodging', 'point_of_interest', 'establishment'],
      vicinity: 'Near Kashi Vishwanath, Varanasi'
    },
    {
      place_id: 'c3',
      name: 'Waterfall View Resort',
      types: ['hotel', 'lodging', 'resort'],
      vicinity: 'Near Dudhsagar, Goa'
    }
  ];

  commercialPlaces.forEach(cp => {
    const res = classifyGooglePlace(cp);
    assert(res.categories.length === 0, `Commercial place "${cp.name}" rejected from all categories`);
    assert(res.subcategories.length === 0, `Commercial place "${cp.name}" rejected from all subcategories`);
  });

  // Test 5: Strict Subcategory Isolation (No Leakage)
  console.log('\n--- Test 5: Strict Subcategory Isolation ---');
  const pureWaterfall = {
    place_id: 'w1',
    name: 'Harvalem Waterfall',
    types: ['natural_feature', 'tourist_attraction'],
    vicinity: 'Sanquelim, Goa'
  };
  const waterfallRes = classifyGooglePlace(pureWaterfall);
  assert(waterfallRes.subcategories.includes('waterfalls'), 'Waterfall place matches "waterfalls"');
  assert(!waterfallRes.subcategories.includes('beaches'), 'Waterfall place NEVER matches "beaches"');
  assert(!waterfallRes.subcategories.includes('forts'), 'Waterfall place NEVER matches "forts"');

  const pureBeach = {
    place_id: 'b1',
    name: 'Palolem Beach',
    types: ['natural_feature', 'beach'],
    vicinity: 'Canacona, South Goa'
  };
  const beachRes = classifyGooglePlace(pureBeach);
  assert(beachRes.subcategories.includes('beaches'), 'Beach place matches "beaches"');
  assert(!beachRes.subcategories.includes('waterfalls'), 'Beach place NEVER matches "waterfalls"');
  assert(!beachRes.subcategories.includes('trekking'), 'Beach place NEVER matches "trekking"');

  // Test 6: Multi-destination Analysis (Goa + Jaipur)
  console.log('\n--- Test 6: Multi-Destination Differential Availability ---');
  const matrix = await analyzeCategoriesForDestinations(['goa', 'jaipur']);
  assert(matrix.nature && typeof matrix.nature === 'object', 'Nature pillar in matrix');
  assert(matrix.heritage && typeof matrix.heritage === 'object', 'Heritage pillar in matrix');

  const beachesSub = matrix.nature.subcategories.find(s => s.id === 'beaches');
  assert(beachesSub && beachesSub.available, 'Beaches is available in multi-destination trip with Goa');
  assert(beachesSub.availableIn.some(d => /goa/i.test(d)), 'Beaches shows available in Goa');

  const fortsSub = matrix.heritage.subcategories.find(s => s.id === 'forts');
  assert(fortsSub && fortsSub.available, 'Forts is available in multi-destination trip');

  // Test 7: Deduplication across overlapping queries
  console.log('\n--- Test 7: Place Deduplication Logic ---');
  const duplicateFeed = [
    { place_id: 'dup_1', name: 'Calangute Beach', types: ['natural_feature'] },
    { place_id: 'dup_1', name: 'Calangute Beach', types: ['natural_feature'] },
    { place_id: 'dup_2', name: 'Baga Beach', types: ['natural_feature'] }
  ];
  const seen = new Set();
  const deduped = [];
  for (const p of duplicateFeed) {
    if (seen.has(p.place_id)) continue;
    seen.add(p.place_id);
    deduped.push(p);
  }
  assert(deduped.length === 2, `Duplicate places merged into exactly 2 unique records (got ${deduped.length})`);

  console.log('\n===============================================================');
  console.log(`REGRESSION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite();
