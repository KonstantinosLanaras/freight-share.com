import { z } from 'zod';

// Shared constraints
const MAX_CITY_LENGTH = 100;
const MAX_NOTES_LENGTH = 2000;
const MAX_ADDRESS_LENGTH = 500;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_MESSAGE_LENGTH = 2000;

const cityField = z.string().trim().min(1, 'City is required').max(MAX_CITY_LENGTH, `City must be under ${MAX_CITY_LENGTH} characters`);
const countryField = z.string().trim().min(1, 'Country is required').max(100);
const notesField = z.string().max(MAX_NOTES_LENGTH, `Notes must be under ${MAX_NOTES_LENGTH} characters`).optional().nullable();

// ── Load validation ──────────────────────────────────────
export const loadSchema = z.object({
  originCity: cityField,
  originCountry: countryField,
  destinationCity: cityField,
  destinationCountry: countryField,
  pickupDateStart: z.string().min(1, 'Pickup start date is required'),
  pickupDateEnd: z.string().min(1, 'Pickup end date is required'),
  deliveryDateStart: z.string().min(1, 'Delivery start date is required'),
  deliveryDateEnd: z.string().min(1, 'Delivery end date is required'),
  pallets: z.number().int().min(0).max(66, 'Maximum 66 pallets'),
  cargoType: z.string().min(1),
  price: z.number().positive('Price must be positive').max(999999, 'Price too high').optional().nullable(),
  notes: notesField,
  cargoNotes: z.string().max(MAX_NOTES_LENGTH).optional().nullable(),
  spaceValue: z.number().min(0).max(99999),
  weightKg: z.number().positive('Weight must be positive').max(44000, 'Weight exceeds maximum truck payload'),
});

// ── Route validation ─────────────────────────────────────
export const routeSchema = z.object({
  originCity: cityField,
  originCountry: countryField,
  destinationCity: cityField,
  destinationCountry: countryField,
  departureDateStart: z.string().min(1, 'Departure start date is required'),
  departureDateEnd: z.string().min(1, 'Departure end date is required'),
  availablePallets: z.number().int().min(1, 'At least 1 pallet').max(66),
  maxPayloadKg: z.number().min(0).max(44000).optional(),
  maxDeviationKm: z.number().min(0).max(9999).optional(),
  tripDescription: z.string().max(MAX_DESCRIPTION_LENGTH).optional().nullable(),
  notes: notesField,
});

// ── Message validation ───────────────────────────────────
export const messageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(MAX_MESSAGE_LENGTH, `Message must be under ${MAX_MESSAGE_LENGTH} characters`),
});

// ── Offer validation ─────────────────────────────────────
export const offerSchema = z.object({
  price: z.number().positive('Price must be positive').max(999999, 'Price too high'),
  message: z.string().max(MAX_MESSAGE_LENGTH).optional().nullable(),
});

// ── Route request validation ─────────────────────────────
export const routeRequestSchema = z.object({
  pickupAddress: z.string().trim().min(1, 'Pickup address is required').max(MAX_ADDRESS_LENGTH),
  deliveryAddress: z.string().trim().min(1, 'Delivery address is required').max(MAX_ADDRESS_LENGTH),
  goodsType: z.string().trim().min(1, 'Goods type is required').max(200),
  pallets: z.number().int().min(1).max(66),
  weightKg: z.number().min(0).max(44000),
  specialRequirements: z.string().max(MAX_NOTES_LENGTH).optional().nullable(),
  message: z.string().max(MAX_MESSAGE_LENGTH).optional().nullable(),
});
