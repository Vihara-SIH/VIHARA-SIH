/**
 * Service for Native Browser Geolocation, Google Reverse Geocoding,
 * and Google Places Autocomplete via secure Vercel API backend.
 */

export const LocationErrorCode = {
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  GEOCODE_FAILED: 'GEOCODE_FAILED',
  AUTOCOMPLETE_FAILED: 'AUTOCOMPLETE_FAILED',
  DETAILS_FAILED: 'DETAILS_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Obtains native browser GPS coordinates via navigator.geolocation.getCurrentPosition()
 * @param {PositionOptions} [options]
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export function getCurrentBrowserCoordinates(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject({
        code: LocationErrorCode.NOT_SUPPORTED,
        message: 'Geolocation is not supported by your browser.'
      });
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000,
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!position || !position.coords) {
          reject({
            code: LocationErrorCode.POSITION_UNAVAILABLE,
            message: 'Browser cannot determine location. Please try again.'
          });
          return;
        }

        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let code = LocationErrorCode.UNKNOWN_ERROR;
        let message = 'Unable to determine your location. Please try again.';

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            code = LocationErrorCode.PERMISSION_DENIED;
            message = 'Location permission is required to automatically detect your current location.';
            break;
          case 2: // POSITION_UNAVAILABLE
            code = LocationErrorCode.POSITION_UNAVAILABLE;
            message = 'Browser cannot determine location. Please check device location settings.';
            break;
          case 3: // TIMEOUT
            code = LocationErrorCode.TIMEOUT;
            message = 'Location request timed out. Please try again.';
            break;
          default:
            code = LocationErrorCode.UNKNOWN_ERROR;
            message = error.message || 'Unable to determine your current location.';
            break;
        }

        reject({ code, message, originalError: error });
      },
      defaultOptions
    );
  });
}

/**
 * Converts latitude and longitude to a human-readable location using the secure /api/geocode backend.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{currentLocationName: string, currentLocationLatitude: number, currentLocationLongitude: number, city: string, state: string, country: string, formattedAddress: string}>}
 */
export async function reverseGeocodeCoordinates(latitude, longitude) {
  try {
    const response = await fetch('/api/geocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ latitude, longitude })
    });

    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
    }

    if (!response.ok || !data || !data.success || !data.location) {
      const errMsg = data?.error || 'Unable to determine your current location name. Please try again.';
      const err = new Error(errMsg);
      err.code = LocationErrorCode.GEOCODE_FAILED;
      throw err;
    }

    const loc = data.location;
    const formattedAddress = loc.formattedAddress || loc.currentLocationName || `${loc.city || ''}, ${loc.state || ''}`.trim();
    const currentLocationName = loc.currentLocationName || formattedAddress;

    return {
      currentLocationName,
      currentLocationLatitude: loc.currentLocationLatitude || loc.latitude,
      currentLocationLongitude: loc.currentLocationLongitude || loc.longitude,
      latitude: loc.latitude,
      longitude: loc.longitude,
      city: loc.city || '',
      state: loc.state || '',
      country: loc.country || 'India',
      formattedAddress
    };
  } catch (error) {
    if (error.code) throw error;
    const err = new Error('Unable to determine your current location name. Please try again.');
    err.code = LocationErrorCode.GEOCODE_FAILED;
    throw err;
  }
}

/**
 * Orchestrates full automatic GPS location detection:
 * 1. Requests browser coordinates
 * 2. Reverse-geocodes coordinates via secure backend API
 *
 * @returns {Promise<{currentLocationName: string, currentLocationLatitude: number, currentLocationLongitude: number, city: string, state: string, country: string, formattedAddress: string}>}
 */
export async function detectCurrentLocation() {
  const coords = await getCurrentBrowserCoordinates();
  const location = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
  return location;
}

/**
 * Fetches Google Places Autocomplete suggestions for manual location input.
 * @param {string} input - User typed query
 * @returns {Promise<Array<{placeId: string, description: string, mainText: string, secondaryText: string, latitude?: number, longitude?: number}>>}
 */
export async function fetchPlaceAutocomplete(input) {
  if (!input || input.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(`/api/places-autocomplete?input=${encodeURIComponent(input.trim())}`);
    if (!response.ok) {
      throw new Error(`Autocomplete server returned ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.predictions) ? data.predictions : [];
  } catch (err) {
    console.warn('[LocationService] Autocomplete query failed:', err.message);
    return [];
  }
}

/**
 * Fetches detailed place geometry (latitude, longitude, name, address) for a selected autocomplete place.
 * @param {Object} placeItem - Selected prediction item { placeId, description, latitude?, longitude? }
 * @returns {Promise<{currentLocationName: string, currentLocationLatitude: number, currentLocationLongitude: number, name: string, formattedAddress: string, latitude: number, longitude: number, city: string, state: string, country: string, placeId: string}>}
 */
export async function fetchPlaceDetails(placeItem) {
  if (!placeItem) {
    throw new Error('Invalid place item selected.');
  }

  const { placeId, description, latitude, longitude } = placeItem;

  try {
    const response = await fetch('/api/place-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        placeId,
        description,
        latitude,
        longitude
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.place) {
      throw new Error(data.error || 'Failed to fetch details for selected place.');
    }

    const p = data.place;
    const name = p.name || p.city || description || 'Selected Location';
    const formattedAddress = p.formattedAddress || p.currentLocationName || description || name;
    const currentLocationName = p.currentLocationName || formattedAddress;
    const lat = p.currentLocationLatitude !== undefined ? p.currentLocationLatitude : p.latitude;
    const lng = p.currentLocationLongitude !== undefined ? p.currentLocationLongitude : p.longitude;

    return {
      currentLocationName,
      currentLocationLatitude: lat,
      currentLocationLongitude: lng,
      name,
      formattedAddress,
      latitude: lat,
      longitude: lng,
      city: p.city || name,
      state: p.state || '',
      country: p.country || 'India',
      placeId: p.placeId || placeId
    };
  } catch (err) {
    console.error('[LocationService] Failed to retrieve place details:', err);
    throw err;
  }
}
