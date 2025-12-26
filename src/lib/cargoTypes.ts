/**
 * Unified cargo type taxonomy used across the platform
 * This is the single source of truth for cargo types
 */

export const CARGO_TYPES = [
  { value: 'general', label: 'General Goods' },
  { value: 'fragile', label: 'Fragile' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'hazardous', label: 'Hazardous Materials' },
  { value: 'oversized', label: 'Oversized' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'other', label: 'Other' },
] as const;

export type CargoTypeValue = typeof CARGO_TYPES[number]['value'];

export const getCargoTypeLabel = (value: string): string => {
  const found = CARGO_TYPES.find(t => t.value === value);
  return found ? found.label : value;
};

export const isValidCargoType = (value: string): value is CargoTypeValue => {
  return CARGO_TYPES.some(t => t.value === value);
};
