-- deviation_requests had no base price field at all -- only
-- counter_offer_price, set when a carrier counters. A shipper's initial
-- pickup/deviation request had no way to propose a price, so a carrier
-- accepting one directly (never countering) had no price to charge.
-- Nullable: existing rows are unaffected; the request form now requires
-- it going forward.

ALTER TABLE public.deviation_requests
  ADD COLUMN IF NOT EXISTS proposed_price numeric;
