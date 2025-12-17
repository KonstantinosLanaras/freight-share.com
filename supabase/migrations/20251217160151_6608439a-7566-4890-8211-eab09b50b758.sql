-- Create verification status enum
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- Add verification fields to profiles
ALTER TABLE public.profiles
ADD COLUMN country text,
ADD COLUMN legal_company_name text,
ADD COLUMN vat_number text,
ADD COLUMN registered_address text,
ADD COLUMN billing_address text,
ADD COLUMN verification_status public.verification_status DEFAULT 'unverified',
ADD COLUMN terms_accepted_at timestamp with time zone,
ADD COLUMN terms_version text;

-- Create carrier verifications table for document uploads
CREATE TABLE public.carrier_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('insurance', 'license', 'registration')),
  document_url text NOT NULL,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  status public.verification_status DEFAULT 'pending',
  rejection_reason text,
  UNIQUE(carrier_id)
);

-- Enable RLS on carrier_verifications
ALTER TABLE public.carrier_verifications ENABLE ROW LEVEL SECURITY;

-- Carriers can view their own verification
CREATE POLICY "Carriers can view own verification"
ON public.carrier_verifications FOR SELECT
USING (auth.uid() = carrier_id);

-- Carriers can insert their own verification
CREATE POLICY "Carriers can submit verification"
ON public.carrier_verifications FOR INSERT
WITH CHECK (auth.uid() = carrier_id);

-- Carriers can update their own pending verification
CREATE POLICY "Carriers can update pending verification"
ON public.carrier_verifications FOR UPDATE
USING (auth.uid() = carrier_id AND status = 'pending');

-- Admins can view all verifications
CREATE POLICY "Admins can view all verifications"
ON public.carrier_verifications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update verifications
CREATE POLICY "Admins can update verifications"
ON public.carrier_verifications FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-documents', 'verification-documents', false);

-- Storage policies for verification documents
CREATE POLICY "Carriers can upload verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Carriers can view own verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND public.has_role(auth.uid(), 'admin')
);