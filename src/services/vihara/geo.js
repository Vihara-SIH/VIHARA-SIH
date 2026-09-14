export function toRad(deg) {
  return (Number(deg) * Math.PI) / 180;
}

export function haversineKm(a, b) {
  if (!a || !b) return null;
  const lat1 = Number(a.lat ?? a.latitude);
  const lng1 = Number(a.lng ?? a.longitude);
  const lat2 = Number(b.lat ?? b.latitude);
  const lng2 = Number(b.lng ?? b.longitude);
  if (![lat1, lng1, lat2, lng2].every((n) => Number.isFinite(n))) return null;

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** Urban-biased drive-time estimate. Labeled as estimate, not live routing. */
export function estimateTravelMinutes(from, to) {
  const km = haversineKm(from, to);
  if (km === null) return { minutes: 20, km: null, source: 'fallback', estimated: true };
  const speedKmh = km < 8 ? 22 : km < 40 ? 32 : km < 200 ? 55 : 70;
  const minutes = Math.max(8, Math.round((km / speedKmh) * 60) + 5);
  return { minutes, km: Math.round(km * 10) / 10, source: 'haversine', estimated: true };
}

export function samePlace(a, b, maxKm = 0.25) {
  if (!a || !b) return false;
  const n1 = (a.name || a.placeName || '').toLowerCase().trim();
  const n2 = (b.name || b.placeName || '').toLowerCase().trim();
  if (n1 && n2 && (n1 === n2 || n1.includes(n2) || n2.includes(n1))) return true;
  const km = haversineKm(a.coordinates || a, b.coordinates || b);
  return km !== null && km <= maxKm;
}

/**
 * Greedy nearest-neighbor order starting from origin (or first place).
 */
export function orderByProximity(places, origin = null) {
  if (!Array.isArray(places) || places.length <= 1) return [...(places || [])];
  const remaining = [...places];
  const ordered = [];
  let current = origin;

  if (!current) {
    const first = remaining.shift();
    ordered.push(first);
    current = first.coordinates || first;
  }

  while (remaining.length) {
    let bestIdx = 0;
    let bestKm = Infinity;
    remaining.forEach((p, i) => {
      const km = haversineKm(current, p.coordinates || p) ?? 9999;
      if (km < bestKm) {
        bestKm = km;
        bestIdx = i;
      }
    });
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    current = next.coordinates || next;
  }
  return ordered;
}

export function clusterPlaces(places, maxClusterKm = 6) {
  const clusters = [];
  for (const place of places || []) {
    const coord = place.coordinates || place;
    let assigned = false;
    for (const cluster of clusters) {
      const km = haversineKm(cluster.centroid, coord);
      if (km !== null && km <= maxClusterKm) {
        cluster.places.push(place);
        const n = cluster.places.length;
        cluster.centroid = {
          lat: (cluster.centroid.lat * (n - 1) + Number(coord.lat ?? coord.latitude)) / n,
          lng: (cluster.centroid.lng * (n - 1) + Number(coord.lng ?? coord.longitude)) / n
        };
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      clusters.push({
        centroid: {
          lat: Number(coord.lat ?? coord.latitude) || 0,
          lng: Number(coord.lng ?? coord.longitude) || 0
        },
        places: [place]
      });
    }
  }
  clusters.sort((a, b) => b.places.length - a.places.length);
  return clusters;
}

/**
 * Standard Google Encoded Polyline Algorithm Format decoder.
 * Converts encoded polyline string into an array of [latitude, longitude] coordinates for map renderers.
 */
export function decodePolyline(encoded) {
  if (!encoded || typeof encoded !== 'string') return [];
  const poly = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }
  return poly;
}
