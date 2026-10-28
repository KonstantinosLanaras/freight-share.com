-- Admin insurance review: columns + policy

ALTER TABLE public.carrier_insurance
  ADD COLUMN IF NOT EXISTS reviewed_at  timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by  uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Admins need to update status after reviewing documents
CREATE POLICY "Admins can update carrier insurance"
  ON public.carrier_insurance FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
