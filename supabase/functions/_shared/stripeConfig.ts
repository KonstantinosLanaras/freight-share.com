// Shared between create-shipment-payment (sets application_fee_amount at
// checkout) and release-payment (records it for display) so the two never
// drift out of sync with each other.
export const PLATFORM_FEE_PERCENTAGE = 0.02;
