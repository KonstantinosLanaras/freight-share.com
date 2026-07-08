/**
 * Distance utilities for city-based proximity matching between loads and routes.
 */

const EARTH_RADIUS_KM = 6371;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

const DEFAULT_YELLOW_RADIUS_KM = 75;
const GREEN_RADIUS_KM = 25;

export type ProximityTier = 'green' | 'yellow' | null;

/**
 * green: very close (<=25km). yellow: within the carrier's own stated
 * max_deviation_km / max_destination_radius_km (falls back to 75km if unset).
 * null: beyond tolerance -- caller should hide the result.
 */
export function getProximityTier(distanceKm: number, maxRadiusKm?: number | null): ProximityTier {
  if (distanceKm <= GREEN_RADIUS_KM) return 'green';
  const limit = maxRadiusKm && maxRadiusKm > 0 ? maxRadiusKm : DEFAULT_YELLOW_RADIUS_KM;
  if (distanceKm <= limit) return 'yellow';
  return null;
}
