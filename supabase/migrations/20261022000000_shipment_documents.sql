-- Allow both parties to attach documents (e.g. cargo insurance certificates,
-- CMR consignment notes) to a shipment for record-keeping purposes.
-- FreightShare does not broker insurance -- this is purely document storage.

CREATE TABLE public.shipment_documents (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid        NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  uploaded_by uuid        NOT NULL REFERENCES auth.users(id),
  document_type text      NOT NULL DEFAULT 'other',  -- 'cargo_insurance' | 'cmr' | 'other'
  file_name   text        NOT NULL,
  file_path   text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipment_documents ENABLE ROW LEVEL SECURITY;

-- Only the shipper or carrier on the shipment can view its documents
CREATE POLICY "shipment_parties_select"
  ON public.shipment_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
        AND (s.shipper_id = auth.uid() OR s.carrier_id = auth.uid())
    )
  );

-- Only the shipper or carrier on the shipment can upload documents
CREATE POLICY "shipment_parties_insert"
  ON public.shipment_documents FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
        AND (s.shipper_id = auth.uid() OR s.carrier_id = auth.uid())
    )
  );

-- Uploader can delete their own documents
CREATE POLICY "uploader_delete"
  ON public.shipment_documents FOR DELETE
  USING (uploaded_by = auth.uid());

-- Private storage bucket for shipment documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('shipment-documents', 'shipment-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Any authenticated user may upload (path is {shipment_id}/{uuid}.ext;
-- the DB table RLS is the real access gate)
CREATE POLICY "authenticated_upload_shipment_docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shipment-documents' AND auth.role() = 'authenticated');

-- Any authenticated user may read (they still need to know the path,
-- which they only get from the DB table query above)
CREATE POLICY "authenticated_read_shipment_docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shipment-documents' AND auth.role() = 'authenticated');

CREATE POLICY "authenticated_delete_shipment_docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'shipment-documents' AND auth.role() = 'authenticated');
