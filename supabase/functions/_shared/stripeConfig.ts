// Shared between create-shipment-payment (sets application_fee_amount at
// checkout) and release-payment (records it for display) so the two never
// drift out of sync with each other.
export const PLATFORM_FEE_PERCENTAGE = 0.02;

// Every Stripe-calling edge function goes through this instead of reading
// STRIPE_SECRET_KEY directly, so the whole app can be pointed at a Stripe
// test-mode account (e.g. during beta) by setting STRIPE_MODE=test in one
// place, without touching STRIPE_SECRET_KEY itself or any function code.
// STRIPE_MODE defaults to "live" so existing deployments that never set it
// keep behaving exactly as before.
export function getStripeSecretKey(): string {
  const mode = (Deno.env.get("STRIPE_MODE") ?? "live").trim().toLowerCase();
  const envVar = mode === "test" ? "STRIPE_TEST_API_KEY" : "STRIPE_SECRET_KEY";
  const key = Deno.env.get(envVar);
  if (!key) throw new Error(`${envVar} is not set (STRIPE_MODE=${mode})`);
  return key;
}
