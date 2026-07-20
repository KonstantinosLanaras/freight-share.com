/**
 * Matching utilities for load-route compatibility checks
 * Enforces cargo-vehicle compatibility, capacity, and weight constraints
 */

import { checkCompatibility, type CargoType, type VehicleType } from './cargoVehicleCompatibility';

export interface LoadMatchingCriteria {
  cargoType: CargoType;
  pallets: number;
  weightKg: number;
  spaceLdm?: number;
}

export interface RouteMatchingCriteria {
  vehicleType: VehicleType | null;
  availablePallets: number;
  maxPayloadKg: number;
  spaceLdm?: number;
}

export interface MatchResult {
  isMatch: boolean;
  isCompatible: boolean;
  compatibilityNote?: string;
  hasCapacity: boolean;
  capacityNote?: string;
  hasWeight: boolean;
  weightNote?: string;
  reasons: string[];
}

/**
 * Check if a load can be matched to a route
 * Enforces STRICT cargo-vehicle compatibility + capacity + weight
 */
export function checkLoadRouteMatch(
  load: LoadMatchingCriteria,
  route: RouteMatchingCriteria
): MatchResult {
  const reasons: string[] = [];
  
  // 1. Check cargo-vehicle compatibility (STRICT)
  let isCompatible = true;
  let compatibilityNote: string | undefined;
  
  if (route.vehicleType) {
    const compatibility = checkCompatibility(load.cargoType, route.vehicleType);
    isCompatible = compatibility.compatible;
    compatibilityNote = compatibility.note;
    
    if (!isCompatible) {
      reasons.push(`Cargo type "${load.cargoType}" is not compatible with vehicle type "${route.vehicleType}"`);
    }
  }
  
  // 2. Check capacity constraints. Pallets and LDM are two different units
  // for declaring the same thing, and a route/load declared in one doesn't
  // populate the other's raw count (e.g. an LDM-only route stores
  // availablePallets as 0) -- so LDM, which is always computed for both
  // sides regardless of how capacity was declared, is the real apples-to-
  // apples comparison and takes priority. Raw pallet count is only used as
  // a fallback when LDM isn't available on either side.
  let hasCapacity = true;
  let capacityNote: string | undefined;

  if (load.spaceLdm != null && route.spaceLdm != null) {
    if (load.spaceLdm > route.spaceLdm) {
      hasCapacity = false;
      capacityNote = `Load requires ${load.spaceLdm.toFixed(1)} LDM but route only has ${route.spaceLdm.toFixed(1)} available`;
      reasons.push(capacityNote);
    }
  } else if (load.pallets > route.availablePallets) {
    hasCapacity = false;
    capacityNote = `Load requires ${load.pallets} pallets but route only has ${route.availablePallets} available`;
    reasons.push(capacityNote);
  }
  
  // 3. Check weight constraints
  let hasWeight = true;
  let weightNote: string | undefined;
  
  if (route.maxPayloadKg > 0 && load.weightKg > route.maxPayloadKg) {
    hasWeight = false;
    weightNote = `Load weight ${load.weightKg}kg exceeds route max payload ${route.maxPayloadKg}kg`;
    reasons.push(weightNote);
  }
  
  // Final match result - ALL constraints must be satisfied
  const isMatch = isCompatible && hasCapacity && hasWeight;
  
  return {
    isMatch,
    isCompatible,
    compatibilityNote,
    hasCapacity,
    capacityNote,
    hasWeight,
    weightNote,
    reasons,
  };
}

/**
 * Get human-readable match status for UI
 */
export function getMatchStatusLabel(result: MatchResult): {
  status: 'match' | 'incompatible' | 'insufficient';
  label: string;
  description: string;
} {
  if (result.isMatch) {
    return {
      status: 'match',
      label: 'Compatible',
      description: 'This route can carry this load',
    };
  }
  
  if (!result.isCompatible) {
    return {
      status: 'incompatible',
      label: 'Incompatible',
      description: result.compatibilityNote || 'Cargo type not compatible with vehicle',
    };
  }
  
  return {
    status: 'insufficient',
    label: 'Insufficient Capacity',
    description: result.capacityNote || result.weightNote || 'Route cannot accommodate this load',
  };
}
