-- route_requests had no counter-offer mechanism at all -- a carrier could
-- only Accept or Reject, unlike deviation_requests which already supports
-- countering with a price and reason. Mirrors deviation_requests' columns;
-- reuses the existing 'in_discussion' status value (already present in
-- route_request_status and already treated as "Countered" by the shipper-
-- side UI in OffersShipper.tsx) rather than adding a new enum value.
ALTER TABLE public.route_requests
  ADD COLUMN IF NOT EXISTS counter_offer_price numeric,
  ADD COLUMN IF NOT EXISTS counter_offer_conditions text;

-- route_requests has no dedicated "carrier response" column (unlike
-- deviation_requests.carrier_response) -- its equivalent is the
-- route_request_messages thread, which the carrier already writes
-- system messages into on accept/reject. A rejection reason therefore
-- needs no schema change here: it's recorded as the message content
-- instead of a fixed string, same mechanism already in place.
