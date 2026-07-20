-- Stripe Connect account tracking for carrier payouts.
-- account_id: the carrier's Stripe Express connected account (acct_...).
-- onboarded: true once Stripe reports charges_enabled AND payouts_enabled
-- for that account (checked via check-connect-status, not assumed).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_onboarded boolean NOT NULL DEFAULT false;

-- These are written exclusively by service-role edge functions
-- (create-connect-account, check-connect-status). The existing
-- "Users can update own profile" RLS policy is row-level, not
-- column-level, so without this a user could set their own
-- stripe_connect_onboarded to true directly, or point
-- stripe_connect_account_id at an account they don't control.
REVOKE UPDATE (stripe_connect_account_id, stripe_connect_onboarded) ON public.profiles FROM authenticated;
