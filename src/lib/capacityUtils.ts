// Capacity conversion utilities
// EPE = Euro Pallet Equivalent (standard 1.2m x 0.8m pallet)
// LDM = Linear Loading Metre (length of trailer floor required)

// Standard euro pallet dimensions
const EURO_PALLET_LENGTH_M = 1.2;
const EURO_PALLET_WIDTH_M = 0.8;
const STANDARD_TRAILER_WIDTH_M = 2.4;

// EPE to LDM conversion: 2 pallets fit side by side in a standard trailer
// So 1 EPE = 0.4m LDM (2 pallets per row, each row is 0.8m deep)
const EPE_TO_LDM = 0.4;

/**
 * Convert EPE (Euro Pallet Equivalents) to LDM (Linear Loading Metres)
 * Standard assumption: 2 pallets fit side by side in a 2.4m wide trailer
 */
export function epeToLdm(epe: number): number {
  return Math.round(epe * EPE_TO_LDM * 100) / 100;
}

/**
 * Convert LDM to EPE
 */
export function ldmToEpe(ldm: number): number {
  return Math.round(ldm / EPE_TO_LDM * 100) / 100;
}

/**
 * Convert dimensions (in cm) to LDM
 * Assumes optimal loading orientation
 */
export function dimensionsToLdm(lengthCm: number, widthCm: number): number {
  const lengthM = lengthCm / 100;
  const widthM = widthCm / 100;
  
  // Calculate how many items fit across the trailer width
  const itemsAcross = Math.floor(STANDARD_TRAILER_WIDTH_M / widthM) || 1;
  
  // LDM is the length needed per "row" of items
  const ldm = lengthM / itemsAcross;
  
  return Math.round(ldm * 100) / 100;
}

/**
 * Calculate LDM based on space type and value
 */
export function calculateLdm(
  spaceType: 'epe' | 'ldm' | 'dimensions',
  spaceValue: number,
  dimensions?: { lengthCm: number; widthCm: number }
): number {
  switch (spaceType) {
    case 'epe':
      return epeToLdm(spaceValue);
    case 'ldm':
      return spaceValue;
    case 'dimensions':
      if (dimensions) {
        return dimensionsToLdm(dimensions.lengthCm, dimensions.widthCm);
      }
      return 0;
    default:
      return 0;
  }
}

/**
 * Check if a load can be matched to a route based on capacity constraints
 */
export function canMatch(
  loadLdm: number,
  loadWeightKg: number,
  availableLdm: number,
  availablePayloadKg: number
): boolean {
  return loadLdm <= availableLdm && loadWeightKg <= availablePayloadKg;
}

/**
 * Format capacity display for UI
 */
export function formatCapacity(spaceType: string, spaceValue: number): string {
  switch (spaceType) {
    case 'epe':
      return `${spaceValue} EPE`;
    case 'ldm':
      return `${spaceValue} LDM`;
    case 'dimensions':
      return `${spaceValue} LDM (est.)`;
    default:
      return `${spaceValue}`;
  }
}
