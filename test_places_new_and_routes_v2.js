/**
 * Comprehensive Test Suite for Google Routes API v2 & Places API (New) Migration
 * Tests A through P covering all requirements
 */

import assert from 'node:assert';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

console.log('═══════════════════════════════════════════════════════════════════════');
console.log('VIHARA — GOOGLE ROUTES V2 & PLACES API (NEW) COMPREHENSIVE TEST SUITE');
console.log('═══════════════════════════════════════════════════════════════════════\n');

// Mock request/response helpers
function createMockReqRes(body = {}, query = {}, method = 'POST') {
  let responseData = null;
  let statusCode = 200;
  const headers = {};

  const req = {
    method,
    body,
    query,
    headers: {}
  };

  const res = {
    setHeader: (k, v) => { headers[k] = v; return res; },
    status: (code) => { statusCode = code; return res; },
    json: (data) => { responseData = data; return res; },
    end: () => res
  };

  return {
    req,
    res,
    getStatus: () => statusCode,
    getData: () => responseData
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST A: Routes API v2 Success
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST A: Routes API v2 Success');
{
  const routesHandler = (await import('./api/routes.js')).default;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_MAPS_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = 'test-key-routes-v2';

  globalThis.fetch = async (url, options) => {
    if (String(url).includes('computeRoutes')) {
      return {
        ok: true,
        json: async () => ({
          routes: [
            {
              duration: '1200s',
              distanceMeters: 8200,
              polyline: { encodedPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' },
              legs: [
                {
                  duration: '1200s',
                  distanceMeters: 8200,
                  polyline: { encodedPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' }
                }
              ]
            }
          ]
        })
      };
    }
    return originalFetch(url, options);
  };

  const { req, res, getData, getStatus } = createMockReqRes({
    origin: { name: 'Charminar', lat: 17.3616, lng: 78.4747 },
    destination: { name: 'Golconda Fort', lat: 17.3833, lng: 78.4011 },
    travelMode: 'DRIVE'
  });

  await routesHandler(req, res);
  const data = getData();

  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.provider, 'google-routes-v2');
  assert.strictEqual(data.fallback, false);
  assert.strictEqual(data.durationMinutes, 20);
  assert.strictEqual(data.distanceKm, 8.2);
  assert.ok(data.polyline);
  console.log('  ✓ Routes API v2 successfully computes route with provider=google-routes-v2, fallback=false\n');

  globalThis.fetch = originalFetch;
  process.env.GOOGLE_MAPS_API_KEY = originalKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST B: Routes Fallback
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST B: Routes Fallback');
{
  const routesHandler = (await import('./api/routes.js')).default;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_MAPS_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = 'test-key-routes-fallback';

  globalThis.fetch = async (url) => {
    if (String(url).includes('computeRoutes')) {
      throw new Error('Google Routes Network Timeout');
    }
    return originalFetch(url);
  };

  const { routeServerCache } = await import('./api/routes.js');
  routeServerCache.clear();

  const { req, res, getData } = createMockReqRes({
    waypoints: [
      { name: 'Amber Palace', latitude: 26.9855, longitude: 75.8513 },
      { name: 'Hawa Mahal', latitude: 26.9239, longitude: 75.8267 }
    ]
  });

  await routesHandler(req, res);
  const data = getData();

  assert.strictEqual(data.success, true);
  assert.strictEqual(data.provider, 'haversine-fallback');
  assert.strictEqual(data.fallback, true);
  assert.strictEqual(data.estimated, true);
  assert.ok(data.distanceKm > 0);
  console.log('  ✓ Failure triggers haversine-fallback with provider=haversine-fallback, fallback=true\n');

  globalThis.fetch = originalFetch;
  process.env.GOOGLE_MAPS_API_KEY = originalKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST C: Places Nearby (New) Success
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST C: Places Nearby (New) Success');
{
  const placesNearbyHandler = (await import('./api/places-nearby.js')).default;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_MAPS_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = 'test-key-places-nearby-new';

  let calledNewApi = false;

  globalThis.fetch = async (url, options) => {
    if (String(url).includes('places.googleapis.com/v1/places:searchText')) {
      calledNewApi = true;
      return {
        ok: true,
        json: async () => ({
          places: [
            {
              id: 'ChIJW2nR7mC_yzsRH5qX6M04f8g',
              displayName: { text: 'Charminar' },
              formattedAddress: 'Charminar Rd, Hyderabad, Telangana 500002',
              location: { latitude: 17.3616, longitude: 78.4747 },
              types: ['tourist_attraction', 'historical_landmark'],
              rating: 4.6,
              userRatingCount: 154000,
              currentOpeningHours: { openNow: true },
              googleMapsUri: 'https://maps.google.com/?cid=123'
            }
          ]
        })
      };
    }
    return originalFetch(url, options);
  };

  const { req, res, getData, getStatus } = createMockReqRes({
    latitude: 17.3616,
    longitude: 78.4747,
    category: 'heritage',
    destination: 'Hyderabad'
  });

  await placesNearbyHandler(req, res);
  const data = getData();

  assert.strictEqual(calledNewApi, true, 'Must call places.googleapis.com/v1/places:searchText');
  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.provider, 'google-places-new');
  assert.strictEqual(data.fallback, false);
  assert.strictEqual(data.places.length, 1);
  assert.strictEqual(data.places[0].name, 'Charminar');
  assert.strictEqual(data.places[0].placeId, 'ChIJW2nR7mC_yzsRH5qX6M04f8g');
  assert.strictEqual(data.places[0].latitude, 17.3616);
  assert.strictEqual(data.places[0].longitude, 78.4747);
  assert.strictEqual(data.places[0].rating, 4.6);
  console.log('  ✓ Places Nearby (New) returns normalized places with provider=google-places-new\n');

  globalThis.fetch = originalFetch;
  process.env.GOOGLE_MAPS_API_KEY = originalKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST D: Places Autocomplete (New) Success
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST D: Places Autocomplete (New) Success');
{
  const autocompleteHandler = (await import('./api/places-autocomplete.js')).default;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_MAPS_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = 'test-key-autocomplete-new';

  let calledAutocompleteNew = false;

  globalThis.fetch = async (url, options) => {
    if (String(url).includes('places.googleapis.com/v1/places:autocomplete')) {
      calledAutocompleteNew = true;
      return {
        ok: true,
        json: async () => ({
          suggestions: [
            {
              placePrediction: {
                placeId: 'ChIJW2nR7mC_yzsRH5qX6M04f8g',
                place: 'places/ChIJW2nR7mC_yzsRH5qX6M04f8g',
                text: { text: 'Charminar, Hyderabad, Telangana, India' },
                structuredFormat: {
                  mainText: { text: 'Charminar' },
                  secondaryText: { text: 'Hyderabad, Telangana, India' }
                },
                types: ['tourist_attraction', 'point_of_interest']
              }
            }
          ]
        })
      };
    }
    return originalFetch(url, options);
  };

  const { req, res, getData, getStatus } = createMockReqRes({ input: 'Charminar' });
  await autocompleteHandler(req, res);
  const data = getData();

  assert.strictEqual(calledAutocompleteNew, true);
  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.provider, 'google-places-new');
  assert.strictEqual(data.predictions.length, 1);
  assert.strictEqual(data.predictions[0].placeId, 'ChIJW2nR7mC_yzsRH5qX6M04f8g');
  assert.strictEqual(data.predictions[0].mainText, 'Charminar');
  console.log('  ✓ Places Autocomplete (New) returns normalized predictions with provider=google-places-new\n');

  globalThis.fetch = originalFetch;
  process.env.GOOGLE_MAPS_API_KEY = originalKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST E: Place Details (New) Success
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST E: Place Details (New) Success');
{
  const placeDetailsHandler = (await import('./api/place-details.js')).default;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_MAPS_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = 'test-key-place-details-new';

  let calledDetailsNew = false;

  globalThis.fetch = async (url, options) => {
    if (String(url).includes('places.googleapis.com/v1/places/')) {
      calledDetailsNew = true;
      return {
        ok: true,
        json: async () => ({
          id: 'ChIJW2nR7mC_yzsRH5qX6M04f8g',
          displayName: { text: 'Charminar' },
          formattedAddress: 'Charminar Rd, Hyderabad, Telangana 500002, India',
          location: { latitude: 17.3616, longitude: 78.4747 },
          addressComponents: [
            { longText: 'Hyderabad', types: ['locality'] },
            { longText: 'Telangana', types: ['administrative_area_level_1'] },
            { longText: 'India', types: ['country'] }
          ],
          types: ['tourist_attraction', 'historical_landmark'],
          rating: 4.6,
          userRatingCount: 154000,
          googleMapsUri: 'https://maps.google.com/?cid=123'
        })
      };
    }
    return originalFetch(url, options);
  };

  const { req, res, getData, getStatus } = createMockReqRes({}, { placeId: 'ChIJW2nR7mC_yzsRH5qX6M04f8g' }, 'GET');
  await placeDetailsHandler(req, res);
  const data = getData();

  assert.strictEqual(calledDetailsNew, true);
  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.provider, 'google-places-new');
  assert.strictEqual(data.place.name, 'Charminar');
  assert.strictEqual(data.place.city, 'Hyderabad');
  assert.strictEqual(data.place.state, 'Telangana');
  assert.strictEqual(data.place.latitude, 17.3616);
  assert.strictEqual(data.place.longitude, 78.4747);
  console.log('  ✓ Place Details (New) returns normalized place with provider=google-places-new\n');

  globalThis.fetch = originalFetch;
  process.env.GOOGLE_MAPS_API_KEY = originalKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST F: Geocoding Success
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST F: Geocoding Success');
{
  const geocodeHandler = (await import('./api/geocode.js')).default;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_MAPS_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = 'test-key-geocode';

  globalThis.fetch = async (url, options) => {
    if (String(url).includes('maps.googleapis.com/maps/api/geocode/json')) {
      return {
        ok: true,
        json: async () => ({
          status: 'OK',
          results: [
            {
              formatted_address: 'Charminar, Hyderabad, Telangana 500002, India',
              geometry: { location: { lat: 17.3616, lng: 78.4747 } },
              address_components: [
                { long_name: 'Hyderabad', types: ['locality'] },
                { long_name: 'Telangana', types: ['administrative_area_level_1'] },
                { long_name: 'India', types: ['country'] }
              ]
            }
          ]
        })
      };
    }
    return originalFetch(url, options);
  };

  const { req, res, getData, getStatus } = createMockReqRes({ latitude: 17.3616, longitude: 78.4747 });
  await geocodeHandler(req, res);
  const data = getData();

  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.provider, 'google');
  assert.strictEqual(data.location.city, 'Hyderabad');
  assert.strictEqual(data.location.state, 'Telangana');
  console.log('  ✓ Geocoding API returns normalized location with provider=google\n');

  globalThis.fetch = originalFetch;
  process.env.GOOGLE_MAPS_API_KEY = originalKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST G: Category Discovery Using Google Places (New)
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST G: Category Discovery Using Google Places (New)');
{
  const destCategoriesHandler = (await import('./api/destination-categories.js')).default;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_MAPS_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = 'test-key-categories-new';

  let calledNewPlacesTextSearch = false;

  globalThis.fetch = async (url, options) => {
    if (String(url).includes('places.googleapis.com/v1/places:searchText')) {
      calledNewPlacesTextSearch = true;
      const body = JSON.parse(options?.body || '{}');
      const q = body.textQuery || '';

      if (/temple|fort/i.test(q)) {
        return {
          ok: true,
          json: async () => ({
            places: [
              {
                id: 'pl_charminar',
                displayName: { text: 'Charminar Fort' },
                formattedAddress: 'Hyderabad',
                types: ['tourist_attraction', 'historical_landmark'],
                location: { latitude: 17.3616, longitude: 78.4747 }
              },
              {
                id: 'pl_birla_mandir',
                displayName: { text: 'Birla Mandir Temple' },
                formattedAddress: 'Hyderabad',
                types: ['hindu_temple', 'place_of_worship'],
                location: { latitude: 17.4062, longitude: 78.4691 }
              }
            ]
          })
        };
      }

      return {
        ok: true,
        json: async () => ({
          places: [
            {
              id: 'pl_hussain_sagar',
              displayName: { text: 'Hussain Sagar Lake' },
              formattedAddress: 'Hyderabad',
              types: ['natural_feature', 'park'],
              location: { latitude: 17.4239, longitude: 78.4738 }
            }
          ]
        })
      };
    }
    return originalFetch(url, options);
  };

  const { req, res, getData, getStatus } = createMockReqRes({
    destination: 'Hyderabad Dynamic Test',
    latitude: 17.3850,
    longitude: 78.4867
  });

  await destCategoriesHandler(req, res);
  const data = getData();

  assert.strictEqual(calledNewPlacesTextSearch, true);
  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.provider, 'google-places-new');
  assert.strictEqual(data.fallback, false);
  assert.ok(data.availableCategories.includes('heritage'), 'Heritage must be detected');
  assert.ok(data.availableCategories.includes('spiritual'), 'Spiritual must be detected');
  assert.ok(data.availableCategories.includes('nature'), 'Nature must be detected');
  console.log('  ✓ Category discovery uses Places API (New) with live evidence and provider=google-places-new\n');

  globalThis.fetch = originalFetch;
  process.env.GOOGLE_MAPS_API_KEY = originalKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST H: Unknown Destination Fallback
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST H: Unknown Destination Fallback');
{
  const destCategoriesHandler = (await import('./api/destination-categories.js')).default;
  const originalKey = process.env.GOOGLE_MAPS_API_KEY;
  delete process.env.GOOGLE_MAPS_API_KEY;

  const { req, res, getData, getStatus } = createMockReqRes({
    destination: 'NonExistentPlaceXYZ999',
    latitude: 25.1234,
    longitude: 75.1234
  });

  await destCategoriesHandler(req, res);
  const data = getData();

  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.fallback, true);
  console.log('  ✓ Unknown destination gracefully falls back without throwing\n');

  process.env.GOOGLE_MAPS_API_KEY = originalKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST I: Multiple Destinations & Intercity Route Legs
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST I: Multiple Destinations & Intercity Route Legs');
{
  const { generateRouteData } = await import('./src/services/vihara/tripEngine.js');
  const multiDestPlan = {
    days: [
      {
        day: 1,
        destination: 'Hyderabad',
        activities: [
          { title: 'Charminar', coordinates: { lat: 17.3616, lng: 78.4747 }, city: 'Hyderabad' }
        ]
      },
      {
        day: 2,
        destination: 'Goa',
        activities: [
          { title: 'Basilica of Bom Jesus', coordinates: { lat: 15.5009, lng: 73.9116 }, city: 'Goa' }
        ]
      }
    ]
  };

  const routeData = await generateRouteData(multiDestPlan, {
    destinations: ['Hyderabad', 'Goa'],
    originLocation: 'Hyderabad'
  });

  assert.ok(routeData);
  assert.ok(routeData.legs.length >= 1);
  const intercityLeg = routeData.legs[0];
  assert.ok(intercityLeg.distanceKm > 80 || intercityLeg.legType === 'intercity');
  console.log(`  ✓ Multi-destination trip identifies intercity leg (${intercityLeg.distanceKm} km, ${intercityLeg.mode})\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST J: Near Me Live Places Normalization
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST J: Near Me Live Places Normalization');
{
  const placesNearbyHandler = (await import('./api/places-nearby.js')).default;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GOOGLE_MAPS_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = 'test-near-me-key';

  globalThis.fetch = async (url) => {
    if (String(url).includes('places:searchText')) {
      return {
        ok: true,
        json: async () => ({
          places: [
            {
              id: 'pl_amber_fort',
              displayName: { text: 'Amber Palace' },
              formattedAddress: 'Amer, Jaipur, Rajasthan 302001',
              location: { latitude: 26.9855, longitude: 75.8513 },
              types: ['tourist_attraction', 'historical_landmark'],
              rating: 4.7,
              userRatingCount: 89000,
              currentOpeningHours: { openNow: true }
            }
          ]
        })
      };
    }
    return originalFetch(url);
  };

  const { req, res, getData } = createMockReqRes({
    latitude: 26.9855,
    longitude: 75.8513,
    category: 'heritage',
    destination: 'Jaipur'
  });

  await placesNearbyHandler(req, res);
  const data = getData();

  assert.strictEqual(data.success, true);
  assert.strictEqual(data.places[0].name, 'Amber Palace');
  assert.strictEqual(data.places[0].openingHours.open_now, true);
  assert.strictEqual(data.places[0].coordinates.lat, 26.9855);
  console.log('  ✓ Near Me places normalize properly for frontend rendering\n');

  globalThis.fetch = originalFetch;
  process.env.GOOGLE_MAPS_API_KEY = originalKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST K: Itinerary Uses Live Route Duration
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST K: Itinerary Uses Live Route Duration');
{
  const { packDay } = await import('./src/services/vihara/itineraryEngine.js');
  const originalFetch = globalThis.fetch;

  // Mock /api/routes to return 35 mins driving
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('/api/routes') || String(url).includes('computeRoutes')) {
      return {
        ok: true,
        json: async () => ({
          success: true,
          provider: 'google-routes-v2',
          durationMinutes: 35,
          durationSeconds: 2100,
          distanceKm: 14.5,
          distanceMeters: 14500,
          distance: '14.5 km',
          duration: '35 mins',
          fallback: false
        })
      };
    }
    return originalFetch(url, options);
  };

  const testPlaces = [
    {
      id: 'p1',
      name: 'Charminar',
      estimatedVisitDuration: '90 mins',
      coordinates: { lat: 17.3616, lng: 78.4747 },
      category: 'Heritage'
    },
    {
      id: 'p2',
      name: 'Golconda Fort',
      estimatedVisitDuration: '90 mins',
      coordinates: { lat: 17.3833, lng: 78.4011 },
      category: 'Heritage'
    }
  ];

  const activities = await packDay(testPlaces, { name: 'Hyderabad', coordinates: { lat: 17.385, lng: 78.486 } }, { lat: 17.385, lng: 78.486 });

  assert.ok(activities.length >= 2);
  const act2 = activities.find(a => a.placeId === 'p2');
  assert.ok(act2, 'Activity 2 must be scheduled');
  assert.strictEqual(act2.travelMinutesBefore, 35, 'Must reflect 35-min route duration');
  console.log(`  ✓ Itinerary packDay scheduled Activity 2 with real route travel duration (${act2.travelMinutesBefore} mins)\n`);

  globalThis.fetch = originalFetch;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST L: AI Concierge Modification Recalculates Route
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST L: AI Concierge Modification Recalculates Route');
{
  const { applyActionsToItinerary } = await import('./src/services/vihara/patchEngine.js');
  const { generateRouteData } = await import('./src/services/vihara/tripEngine.js');

  const baseItinerary = [
    {
      day: 1,
      destination: 'Hyderabad',
      activities: [
        { placeId: 'charminar', title: 'Charminar', coordinates: { lat: 17.3616, lng: 78.4747 } },
        { placeId: 'salar_jung', title: 'Salar Jung Museum', coordinates: { lat: 17.3713, lng: 78.4803 } }
      ]
    }
  ];

  const patchAction = [
    {
      type: 'REPLACE_ACTIVITY',
      day: 1,
      targetTitle: 'Salar Jung Museum',
      replacementPlace: {
        id: 'chowmahalla',
        name: 'Chowmahalla Palace',
        coordinates: { lat: 17.3578, lng: 78.4717 }
      }
    }
  ];

  const { itinerary: patched } = applyActionsToItinerary(baseItinerary, patchAction);
  const recalculated = await generateRouteData(patched, {
    destinations: ['Hyderabad'],
    originLocation: 'Hyderabad'
  });

  assert.ok(recalculated);
  const destinationTitles = patched[0].activities.map(a => a.title);
  assert.ok(destinationTitles.includes('Chowmahalla Palace'));
  assert.ok(!destinationTitles.includes('Salar Jung Museum'));
  console.log('  ✓ AI Concierge patch updated itinerary and triggered route recalculation\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST M: No Client-Side API Key Exposure
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST M: Security Check - No Client-Side API Key Exposure');
{
  const srcDir = path.resolve(process.cwd(), 'src');
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        scan(full);
      } else if (/\.(js|jsx|ts|tsx)$/.test(ent.name)) {
        const content = fs.readFileSync(full, 'utf-8');
        assert.ok(!content.includes('GOOGLE_MAPS_API_KEY'), `Key leak in ${ent.name}`);
        assert.ok(!content.includes('VITE_GOOGLE_MAPS_API_KEY'), `Key leak in ${ent.name}`);
        assert.ok(!content.includes('GOOGLE_PLACES_API_KEY'), `Key leak in ${ent.name}`);
      }
    }
  }
  scan(srcDir);
  console.log('  ✓ Zero Google Maps / Places API keys in src/ frontend code\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST N: Existing Fallback Behavior Intact
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST N: Existing Fallback Behavior Intact');
{
  const routesHandler = (await import('./api/routes.js')).default;
  const placesNearbyHandler = (await import('./api/places-nearby.js')).default;
  const autocompleteHandler = (await import('./api/places-autocomplete.js')).default;
  const geocodeHandler = (await import('./api/geocode.js')).default;

  const originalKey = process.env.GOOGLE_MAPS_API_KEY;
  delete process.env.GOOGLE_MAPS_API_KEY;
  delete process.env.GOOGLE_PLACES_API_KEY;

  // 1. Routes without key
  const rRes = createMockReqRes({
    origin: { lat: 17.3616, lng: 78.4747 },
    destination: { lat: 17.3833, lng: 78.4011 }
  });
  await routesHandler(rRes.req, rRes.res);
  assert.strictEqual(rRes.getData().fallback, true);

  // 2. Nearby without key (falls back to Nominatim)
  const nRes = createMockReqRes({ latitude: 17.3616, longitude: 78.4747 });
  await placesNearbyHandler(nRes.req, nRes.res);
  assert.ok(nRes.getData().fallback === true || nRes.getData().provider === 'nominatim');

  // 3. Autocomplete without key (falls back to Nominatim)
  const aRes = createMockReqRes({ input: 'Jaipur' });
  await autocompleteHandler(aRes.req, aRes.res);
  assert.ok(aRes.getData().provider === 'nominatim' || aRes.getData().predictions);

  // 4. Geocode without key (falls back to Nominatim)
  const gRes = createMockReqRes({ latitude: 17.3616, longitude: 78.4747 });
  await geocodeHandler(gRes.req, gRes.res);
  assert.strictEqual(gRes.getData().provider, 'nominatim');

  console.log('  ✓ All endpoints gracefully fall back when Google API key is omitted\n');
  process.env.GOOGLE_MAPS_API_KEY = originalKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST O: Production Build
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST O: Production Build');
{
  try {
    execSync('npx vite build', { cwd: process.cwd(), stdio: 'pipe', timeout: 120000 });
    console.log('  ✓ Production build completed with zero errors\n');
  } catch (err) {
    console.error('  ✗ Build failed:', err.stderr?.toString().slice(0, 500) || err.message);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST P: Lint
// ─────────────────────────────────────────────────────────────────────────────
console.log('TEST P: Lint');
{
  try {
    execSync('npx oxlint', { cwd: process.cwd(), stdio: 'pipe', timeout: 60000 });
    console.log('  ✓ Lint passed with zero errors\n');
  } catch (err) {
    const output = err.stdout?.toString() || err.stderr?.toString() || '';
    if (/Found 0 errors/i.test(output) || err.status === 0) {
      console.log('  ✓ Lint passed with zero errors\n');
    } else {
      console.error('  ✗ Lint failed:', output.slice(0, 500));
      process.exit(1);
    }
  }
}

console.log('═══════════════════════════════════════════════════════════════════════');
console.log('ALL TESTS A THROUGH P PASSED SUCCESSFULLY!');
console.log('═══════════════════════════════════════════════════════════════════════\n');
