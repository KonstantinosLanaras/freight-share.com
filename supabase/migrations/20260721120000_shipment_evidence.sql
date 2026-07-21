-- Minimal proof-of-delivery capture: a photo, a signature (delivery only),
-- a condition note, and a geo stamp, tied immutably to the shipment.
-- One row per (shipment, kind) -- pickup and delivery are captured once
-- each and never edited afterward.

CREATE TABLE public.shipment_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('pickup', 'delivery')),
  photo_url text,
  signature_url text,
  signer_name text,
  condition text NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'damaged')),
  condition_notes text,
  lat numeric,
  lng numeric,
  captured_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shipment_id, kind)
);

ALTER TABLE public.shipment_evidence ENABLE ROW LEVEL SECURITY;

-- Immutable by design: only SELECT and INSERT policies exist. No UPDATE or
-- DELETE policy is defined for any role, so once captured, evidence for a
-- shipment cannot be altered by either party -- that's the whole point of
-- proof-of-delivery evidence.

CREATE POLICY "Shipment parties can view evidence"
  ON public.shipment_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id AND (s.shipper_id = auth.uid() OR s.carrier_id = auth.uid())
    )
  );

CREATE POLICY "Carrier can record evidence for own shipments"
  ON public.shipment_evidence FOR INSERT
  WITH CHECK (
    captured_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_id AND s.carrier_id = auth.uid())
  );

-- Storage bucket for the photo/signature files themselves, matching the
-- existing itinerary-images bucket convention (public bucket, any
-- authenticated user can upload; access control lives on the metadata row
-- in shipment_evidence, not on the file itself).
INSERT INTO storage.buckets (id, name, public) VALUES ('shipment-evidence', 'shipment-evidence', true);

CREATE POLICY "Anyone can view shipment evidence files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shipment-evidence');

CREATE POLICY "Authenticated users can upload shipment evidence files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shipment-evidence' AND auth.role() = 'authenticated');
