ALTER TABLE public.shipments
  ALTER COLUMN load_id DROP NOT NULL,
  ALTER COLUMN offer_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS route_request_id uuid REFERENCES public.route_requests(id),
  ADD COLUMN IF NOT EXISTS deviation_request_id uuid REFERENCES public.deviation_requests(id);

ALTER TABLE public.shipments
  ADD CONSTRAINT shipments_exactly_one_source CHECK (
    (CASE WHEN load_id IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN route_request_id IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN deviation_request_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  );

ALTER TABLE public.shipments
  ADD CONSTRAINT shipments_offer_requires_load CHECK ((load_id IS NULL) = (offer_id IS NULL));

ALTER TABLE public.deviation_requests
  ADD COLUMN IF NOT EXISTS cargo_type text,
  ADD COLUMN IF NOT EXISTS weight_kg numeric,
  ADD COLUMN IF NOT EXISTS proposed_price numeric;