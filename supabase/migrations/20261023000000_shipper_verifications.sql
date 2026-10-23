-- Shipper verification document uploads.
-- The verification-documents bucket and its storage policies already exist
-- (created in the carrier_verifications migration) — shippers share the same
-- bucket, isolated by user-id folder prefix.

CREATE TABLE public.shipper_verifications (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type  text        NOT NULL CHECK (document_type IN ('registration', 'vat_certificate', 'trade_license', 'other')),
  document_url   text        NOT NULL,
  submitted_at   timestamptz NOT NULL DEFAULT now(),
  reviewed_at    timestamptz,
  reviewed_by    uuid        REFERENCES auth.users(id),
  status         public.verification_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  UNIQUE(shipper_id)
);

ALTER TABLE public.shipper_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shippers_view_own"
  ON public.shipper_verifications FOR SELECT
  USING (auth.uid() = shipper_id);

CREATE POLICY "shippers_insert_own"
  ON public.shipper_verifications FOR INSERT
  WITH CHECK (auth.uid() = shipper_id);

CREATE POLICY "shippers_update_pending"
  ON public.shipper_verifications FOR UPDATE
  USING (auth.uid() = shipper_id AND status = 'pending');

CREATE POLICY "admins_view_shipper_verifications"
  ON public.shipper_verifications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_update_shipper_verifications"
  ON public.shipper_verifications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
