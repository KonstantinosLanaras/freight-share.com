// Cargo-vehicle compatibility helper functions

export type VehicleType = 
  | 'standard_truck'
  | 'refrigerated_truck'
  | 'flatbed'
  | 'box_truck'
  | 'curtain_sider'
  | 'tanker'
  | 'livestock_carrier'
  | 'car_transporter';

export type CargoType = 
  | 'general'
  | 'fragile'
  | 'refrigerated'
  | 'hazardous'
  | 'oversized'
  | 'livestock'
  | 'vehicles'
  | 'other';

export const vehicleTypeLabels: Record<VehicleType, string> = {
  standard_truck: 'Standard Truck',
  refrigerated_truck: 'Refrigerated Truck',
  flatbed: 'Flatbed',
  box_truck: 'Box Truck',
  curtain_sider: 'Curtain Sider',
  tanker: 'Tanker',
  livestock_carrier: 'Livestock Carrier',
  car_transporter: 'Car Transporter',
};

export const cargoTypeLabels: Record<CargoType, string> = {
  general: 'General',
  fragile: 'Fragile',
  refrigerated: 'Refrigerated',
  hazardous: 'Hazardous',
  oversized: 'Oversized',
  livestock: 'Livestock',
  vehicles: 'Vehicles',
  other: 'Other',
};

// Local compatibility matrix for quick client-side checks
const compatibilityMatrix: Record<CargoType, Record<VehicleType, { compatible: boolean; note?: string }>> = {
  general: {
    standard_truck: { compatible: true },
    refrigerated_truck: { compatible: true },
    flatbed: { compatible: true },
    box_truck: { compatible: true },
    curtain_sider: { compatible: true },
    tanker: { compatible: false, note: 'Not suitable for general cargo' },
    livestock_carrier: { compatible: false, note: 'Not suitable for general cargo' },
    car_transporter: { compatible: false, note: 'Not suitable for general cargo' },
  },
  fragile: {
    standard_truck: { compatible: true },
    refrigerated_truck: { compatible: true },
    flatbed: { compatible: false, note: 'Fragile items need enclosed transport' },
    box_truck: { compatible: true, note: 'Ideal for fragile items' },
    curtain_sider: { compatible: true },
    tanker: { compatible: false, note: 'Not suitable for fragile cargo' },
    livestock_carrier: { compatible: false, note: 'Not suitable for fragile cargo' },
    car_transporter: { compatible: false, note: 'Not suitable for fragile cargo' },
  },
  refrigerated: {
    standard_truck: { compatible: false, note: 'Requires temperature control' },
    refrigerated_truck: { compatible: true, note: 'Required for refrigerated cargo' },
    flatbed: { compatible: false, note: 'Requires temperature control' },
    box_truck: { compatible: false, note: 'Requires temperature control' },
    curtain_sider: { compatible: false, note: 'Requires temperature control' },
    tanker: { compatible: false, note: 'Requires temperature control' },
    livestock_carrier: { compatible: false, note: 'Requires temperature control' },
    car_transporter: { compatible: false, note: 'Requires temperature control' },
  },
  hazardous: {
    standard_truck: { compatible: true, note: 'ADR certification required' },
    refrigerated_truck: { compatible: false, note: 'Not certified for hazmat' },
    flatbed: { compatible: true, note: 'ADR certification required' },
    box_truck: { compatible: true, note: 'ADR certification required' },
    curtain_sider: { compatible: true, note: 'ADR certification required' },
    tanker: { compatible: true, note: 'Often used for hazardous liquids' },
    livestock_carrier: { compatible: false, note: 'Not suitable for hazardous cargo' },
    car_transporter: { compatible: false, note: 'Not suitable for hazardous cargo' },
  },
  oversized: {
    standard_truck: { compatible: false, note: 'Insufficient for oversized cargo' },
    refrigerated_truck: { compatible: false, note: 'Insufficient for oversized cargo' },
    flatbed: { compatible: true, note: 'Ideal for oversized cargo' },
    box_truck: { compatible: false, note: 'Insufficient for oversized cargo' },
    curtain_sider: { compatible: true, note: 'Can accommodate some oversized cargo' },
    tanker: { compatible: false, note: 'Not suitable for oversized cargo' },
    livestock_carrier: { compatible: false, note: 'Not suitable for oversized cargo' },
    car_transporter: { compatible: false, note: 'Not suitable for oversized cargo' },
  },
  livestock: {
    standard_truck: { compatible: false, note: 'Not suitable for livestock' },
    refrigerated_truck: { compatible: false, note: 'Not suitable for livestock' },
    flatbed: { compatible: false, note: 'Not suitable for livestock' },
    box_truck: { compatible: false, note: 'Not suitable for livestock' },
    curtain_sider: { compatible: false, note: 'Not suitable for livestock' },
    tanker: { compatible: false, note: 'Not suitable for livestock' },
    livestock_carrier: { compatible: true, note: 'Required for livestock transport' },
    car_transporter: { compatible: false, note: 'Not suitable for livestock' },
  },
  vehicles: {
    standard_truck: { compatible: false, note: 'Not suitable for vehicle transport' },
    refrigerated_truck: { compatible: false, note: 'Not suitable for vehicle transport' },
    flatbed: { compatible: true, note: 'Can carry some vehicles' },
    box_truck: { compatible: false, note: 'Not suitable for vehicle transport' },
    curtain_sider: { compatible: false, note: 'Not suitable for vehicle transport' },
    tanker: { compatible: false, note: 'Not suitable for vehicle transport' },
    livestock_carrier: { compatible: false, note: 'Not suitable for vehicle transport' },
    car_transporter: { compatible: true, note: 'Required for vehicle transport' },
  },
  other: {
    standard_truck: { compatible: true },
    refrigerated_truck: { compatible: true },
    flatbed: { compatible: true },
    box_truck: { compatible: true },
    curtain_sider: { compatible: true },
    tanker: { compatible: false, note: 'Contact carrier for special requirements' },
    livestock_carrier: { compatible: false, note: 'Contact carrier for special requirements' },
    car_transporter: { compatible: false, note: 'Contact carrier for special requirements' },
  },
};

export function checkCompatibility(cargoType: CargoType, vehicleType: VehicleType): { compatible: boolean; note?: string } {
  return compatibilityMatrix[cargoType]?.[vehicleType] || { compatible: false, note: 'Unknown combination' };
}

export function getCompatibleVehicles(cargoType: CargoType): VehicleType[] {
  const cargo = compatibilityMatrix[cargoType];
  if (!cargo) return [];
  return (Object.keys(cargo) as VehicleType[]).filter(vehicle => cargo[vehicle].compatible);
}

export function getCompatibleCargo(vehicleType: VehicleType): CargoType[] {
  return (Object.keys(compatibilityMatrix) as CargoType[]).filter(
    cargo => compatibilityMatrix[cargo][vehicleType]?.compatible
  );
}
