import geocodeHandler from './api/geocode.js';
import placesAutocompleteHandler from './api/places-autocomplete.js';
import placeDetailsHandler from './api/place-details.js';

function createMockRes() {
  let statusCode = 200;
  let responseData = null;
  const res = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    end: () => res,
    getStatusCode: () => statusCode,
    getData: () => responseData
  };
  return res;
}

async function runTests() {
  console.log('=== TESTING VIHARA GOOGLE API SERVERLESS ENDPOINTS ===\n');

  // 1. Reverse Geocode Test
  console.log('1. Testing /api/geocode (Hyderabad 17.3850, 78.4867)...');
  const res1 = createMockRes();
  await geocodeHandler({ method: 'POST', body: { latitude: 17.3850, longitude: 78.4867 } }, res1);
  console.log('Status:', res1.getStatusCode());
  console.log('Data:', JSON.stringify(res1.getData(), null, 2));

  // 2. Autocomplete Test
  console.log('\n2. Testing /api/places-autocomplete (Input: "Jaipur")...');
  const res2 = createMockRes();
  await placesAutocompleteHandler({ method: 'GET', query: { input: 'Jaipur' } }, res2);
  console.log('Status:', res2.getStatusCode());
  console.log('Data:', JSON.stringify(res2.getData(), null, 2));

  // 3. Place Details Test
  console.log('\n3. Testing /api/place-details (Place: "Jaipur")...');
  const predictions = res2.getData()?.predictions || [];
  const selectedPrediction = predictions[0] || { placeId: 'ChIJpd-pLSq0bTkR3NqgqW2sFzE', description: 'Jaipur, Rajasthan, India' };

  const res3 = createMockRes();
  await placeDetailsHandler({ method: 'POST', body: selectedPrediction }, res3);
  console.log('Status:', res3.getStatusCode());
  console.log('Data:', JSON.stringify(res3.getData(), null, 2));

  console.log('\n=== ALL ENDPOINT TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(console.error);
