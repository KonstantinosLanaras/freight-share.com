
CREATE TABLE public.early_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('carrier','shipper')),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  challenge TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.early_access_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.early_access_requests TO authenticated;
GRANT ALL ON public.early_access_requests TO service_role;

ALTER TABLE public.early_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an early access request"
ON public.early_access_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view early access requests"
ON public.early_access_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update early access requests"
ON public.early_access_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete early access requests"
ON public.early_access_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_early_access_requests_updated_at
BEFORE UPDATE ON public.early_access_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_early_access_requests_created_at ON public.early_access_requests(created_at DESC);
CREATE INDEX idx_early_access_requests_status ON public.early_access_requests(status);
