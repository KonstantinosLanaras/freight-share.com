export type UserRole = 'shipper' | 'carrier' | 'admin';

export type ShipmentStatus = 
  | 'posted' 
  | 'accepted' 
  | 'paid' 
  | 'picked_up' 
  | 'delivered' 
  | 'completed';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'completed' 
  | 'refunded';

export type CargoType = 
  | 'general' 
  | 'fragile' 
  | 'perishable' 
  | 'hazardous' 
  | 'oversized' 
  | 'livestock';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  phone?: string;
  rating?: number;
  totalRatings?: number;
  createdAt: Date;
}

export interface Load {
  id: string;
  shipperId: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  pickupDateStart: Date;
  pickupDateEnd: Date;
  deliveryDateStart: Date;
  deliveryDateEnd: Date;
  pallets: number;
  cargoType: CargoType;
  fixedPrice?: number;
  openToOffers: boolean;
  notes?: string;
  status: ShipmentStatus;
  createdAt: Date;
}

export interface Route {
  id: string;
  carrierId: string;
  stops: RouteStop[];
  departureStart: Date;
  departureEnd: Date;
  createdAt: Date;
}

export interface RouteStop {
  id: string;
  city: string;
  country: string;
  availablePallets: number;
  order: number;
}

export interface Offer {
  id: string;
  loadId: string;
  carrierId: string;
  routeId?: string;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Shipment {
  id: string;
  loadId: string;
  offerId: string;
  shipperId: string;
  carrierId: string;
  status: ShipmentStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  price: number;
  timestamps: ShipmentTimestamp[];
  createdAt: Date;
}

export interface ShipmentTimestamp {
  status: ShipmentStatus;
  timestamp: Date;
  note?: string;
}

export interface Message {
  id: string;
  shipmentId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export interface Rating {
  id: string;
  shipmentId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}
