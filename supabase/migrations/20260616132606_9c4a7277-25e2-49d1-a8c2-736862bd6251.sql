CREATE TYPE public.route_offer_type AS ENUM ('direct', 'alternative');

ALTER TABLE public.route_requests
  ADD COLUMN IF NOT EXISTS offer_type public.route_offer_type NOT NULL DEFAULT 'direct',
  ADD COLUMN IF NOT EXISTS offer_price numeric,
  ADD COLUMN IF NOT EXISTS proposed_pickup_city text,
  ADD COLUMN IF NOT EXISTS proposed_pickup_country text,
  ADD COLUMN IF NOT EXISTS proposed_dropoff_city text,
  ADD COLUMN IF NOT EXISTS proposed_dropoff_country text,
  ADD COLUMN IF NOT EXISTS pallets_requested integer,
  ADD COLUMN IF NOT EXISTS shipper_message text;