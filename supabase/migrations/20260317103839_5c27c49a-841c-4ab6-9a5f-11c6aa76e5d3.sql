
-- Create carrier_insurance table
CREATE TABLE public.carrier_insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carrier_id UUID NOT NULL,
  provider_name TEXT NOT NULL,
  policy_number TEXT,
  coverage_type TEXT NOT NULL DEFAULT 'cargo',
  coverage_limit_eur NUMERIC NOT NULL DEFAULT 0,
  expiration_date DATE NOT NULL,
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'provided',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(carrier_id)
);

-- Enable RLS
ALTER TABLE public.carrier_insurance ENABLE ROW LEVEL SECURITY;

-- Carriers can view their own insurance
CREATE POLICY "Carriers can view own insurance"
ON public.carrier_insurance FOR SELECT
USING (auth.uid() = carrier_id);

-- Anyone can view insurance (for trust transparency on routes)
CREATE POLICY "Insurance is viewable by everyone"
ON public.carrier_insurance FOR SELECT
USING (true);

-- Carriers can insert their own insurance
CREATE POLICY "Carriers can insert own insurance"
ON public.carrier_insurance FOR INSERT
WITH CHECK (auth.uid() = carrier_id);

-- Carriers can update their own insurance
CREATE POLICY "Carriers can update own insurance"
ON public.carrier_insurance FOR UPDATE
USING (auth.uid() = carrier_id);

-- Create insurance-documents storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('insurance-documents', 'insurance-documents', false);

-- Storage policies for insurance documents
CREATE POLICY "Carriers can upload insurance docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'insurance-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Carriers can view own insurance docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'insurance-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all insurance docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'insurance-documents' AND public.has_role(auth.uid(), 'admin'));
