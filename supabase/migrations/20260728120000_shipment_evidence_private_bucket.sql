-- Shipment evidence files (delivery photos, signatures) were stored in a
-- PUBLIC bucket with an unrestricted read policy -- anyone with a file
-- URL could view it, no auth check, even though the shipment_evidence
-- table's own RLS correctly restricts who can see the metadata row.
-- These files can contain a recipient's face, signature, and location.
--
-- Fix: bucket is now private. Reads are scoped to the actual shipment's
-- shipper/carrier (or an admin), using the object path's first segment,
-- which is always the shipment_id -- see DeliveryEvidenceDialog.tsx's
-- upload path (`${shipmentId}/${kind}-photo-...` / `-signature-...`).
-- The application now requests short-lived signed URLs to display these
-- files instead of relying on a public URL.

UPDATE storage.buckets SET public = false WHERE id = 'shipment-evidence';

DROP POLICY IF EXISTS "Anyone can view shipment evidence files" ON storage.objects;

CREATE POLICY "Shipment parties and admins can view evidence files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'shipment-evidence'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.shipments s
        WHERE s.id::text = (storage.foldername(name))[1]
        AND (s.shipper_id = auth.uid() OR s.carrier_id = auth.uid())
      )
    )
  );

-- Also tighten uploads: previously any authenticated user could write
-- into any shipment's folder in this bucket, not just their own. The
-- shipment_evidence table's own INSERT policy already requires the
-- carrier of that specific shipment, so this brings the storage layer
-- in line with it instead of leaving it looser.
DROP POLICY IF EXISTS "Authenticated users can upload shipment evidence files" ON storage.objects;

CREATE POLICY "Carrier can upload evidence files for own shipments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'shipment-evidence'
    AND EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id::text = (storage.foldername(name))[1]
      AND s.carrier_id = auth.uid()
    )
  );
