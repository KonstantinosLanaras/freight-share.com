-- Generalizes shipments so a shipment can originate from a load+offer
-- (the only path that could create one until now), a direct route
-- request, or a mid-route deviation/pickup request. Previously
-- accepting a route_request or deviation_request only flipped a status
-- flag -- no shipment, no payment trigger, no CMR/invoice, since
-- load_id/offer_id were NOT NULL and neither of those flows has a load.

ALTER TABLE public.shipments
  ALTER COLUMN load_id DROP NOT NULL,
  ALTER COLUMN offer_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS route_request_id uuid REFERENCES public.route_requests(id),
  ADD COLUMN IF NOT EXISTS deviation_request_id uuid REFERENCES public.deviation_requests(id);

-- Exactly one source per shipment.
ALTER TABLE public.shipments
  ADD CONSTRAINT shipments_exactly_one_source CHECK (
    (CASE WHEN load_id IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN route_request_id IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN deviation_request_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  );

-- offer_id only makes sense alongside a load_id.
ALTER TABLE public.shipments
  ADD CONSTRAINT shipments_offer_requires_load CHECK ((load_id IS NULL) = (offer_id IS NULL));

-- deviation_requests never captured cargo type/weight (it's a pickup
-- add-on, not a full load posting) -- needed so a shipment sourced from
-- one can still show a meaningful CMR goods description. Nullable: existing
-- rows and the request form itself are unaffected until/unless the form
-- is updated to collect them.
ALTER TABLE public.deviation_requests
  ADD COLUMN IF NOT EXISTS cargo_type text,
  ADD COLUMN IF NOT EXISTS weight_kg numeric;
