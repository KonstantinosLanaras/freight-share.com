-- Stores the Stripe Customer ID for shippers so payment methods can be
-- saved across sessions and reused at checkout without re-entering card
-- details each time.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Only the service-role key (edge functions) may write this column.
-- Authenticated users cannot set their own stripe_customer_id directly.
REVOKE UPDATE (stripe_customer_id) ON public.profiles FROM authenticated;
