// KAAMSETU - Geospatial & Routing Calculations

export const EARTH_RADIUS_KM = 6371.0;

/**
 * Calculate Great-Circle Distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers (exact spherical computation).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const toRad = (degree: number) => (degree * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100; // 2 decimal places
}

/**
 * Format distance into human-friendly Indian localized string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimate transit travel time in minutes based on real distance and typical Indian urban traffic.
 * Urban two-wheeler / auto speed ~25 km/h with 3 min initial response buffer.
 */
export function calculateEstimatedEtaMinutes(
  distanceKm: number,
  averageSpeedKmH: number = 24
): number {
  if (distanceKm <= 0.1) return 1;
  const transitHours = distanceKm / averageSpeedKmH;
  const transitMinutes = Math.ceil(transitHours * 60) + 2; // +2 min traffic margin
  return Math.max(1, transitMinutes);
}

/**
 * Format ETA into readable text
 */
export function formatEta(etaMinutes: number): string {
  if (etaMinutes <= 1) return 'Arriving now';
  if (etaMinutes < 60) return `${etaMinutes} mins`;
  const hours = Math.floor(etaMinutes / 60);
  const mins = etaMinutes % 60;
  return mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`;
}

/**
 * Checks whether a GPS timestamp is considered stale (> 2 minutes old).
 */
export function isLocationStale(timestampIso: string, thresholdSeconds = 120): boolean {
  try {
    const timestamp = new Date(timestampIso).getTime();
    const now = Date.now();
    return (now - timestamp) / 1000 > thresholdSeconds;
  } catch {
    return true;
  }
}

/**
 * Checks whether GPS accuracy is poor (> 100 meters).
 */
export function isAccuracyLow(accuracyMeters?: number): boolean {
  if (accuracyMeters === undefined || accuracyMeters === null) return false;
  return accuracyMeters > 100;
}

/**
 * Indian city coordinates reference database for quick geolocation lookup & fallback
 */
export const INDIAN_CITIES = [
  { city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, pincodes: ['110001', '110020', '110034', '110085'] },
  { city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910, pincodes: ['201301', '201303', '201307'] },
  { city: 'Gurugram', state: 'Haryana', lat: 28.4595, lng: 77.0266, pincodes: ['122001', '122018', '122022'] },
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, pincodes: ['400001', '400050', '400072'] },
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, pincodes: ['560001', '560034', '560068'] },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, pincodes: ['500001', '500032', '500081'] },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, pincodes: ['411001', '411014', '411057'] },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, pincodes: ['302001', '302015', '302020'] },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, pincodes: ['226001', '226010', '226024'] },
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, pincodes: ['800001', '800013', '800020'] },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, pincodes: ['380001', '380015', '380054'] },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, pincodes: ['700001', '700029', '700091'] },
  { city: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794, pincodes: ['160017', '160022', '160036'] },
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, pincodes: ['462001', '462016', '462023'] },
  { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, pincodes: ['452001', '452010', '452016'] }
];
