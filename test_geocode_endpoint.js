import geocodeHandler from './api/geocode.js';

async function runTests() {
  console.log('--- Starting Reverse Geocode API Tests ---\n');

  const testCases = [
    {
      name: 'Test 1: Hyderabad Coordinates (POST)',
      req: {
        method: 'POST',
        body: { latitude: 17.3850, longitude: 78.4867 }
      }
    },
    {
      name: 'Test 2: New Delhi Coordinates (POST)',
      req: {
        method: 'POST',
        body: { latitude: 28.6139, longitude: 77.2090 }
      }
    },
    {
      name: 'Test 3: Goa Coordinates (GET)',
      req: {
        method: 'GET',
        query: { lat: 15.2993, lng: 74.1240 }
      }
    },
    {
      name: 'Test 4: Invalid Coordinates Validation',
      req: {
        method: 'POST',
        body: { latitude: 999, longitude: 999 }
      }
    }
  ];

  for (const tc of testCases) {
    console.log(`▶ Running: ${tc.name}`);
    let responseData = null;
    let statusCode = 200;

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
      end: () => res
    };

    try {
      await geocodeHandler(tc.req, res);
      console.log(`Status: ${statusCode}`);
      console.log(`Response:`, JSON.stringify(responseData, null, 2));
      console.log('✓ Test Case Finished\n');
    } catch (err) {
      console.error(`✗ Test failed with error:`, err);
    }
  }
}

runTests();
