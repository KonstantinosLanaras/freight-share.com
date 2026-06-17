
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS vat_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS preferred_cargo_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS shipment_frequency text,
  ADD COLUMN IF NOT EXISTS fleet_description text,
  ADD COLUMN IF NOT EXISTS operating_countries text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS vehicle_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS max_pallet_capacity int,
  ADD COLUMN IF NOT EXISTS operator_licence text,
  ADD COLUMN IF NOT EXISTS cmr_insurance boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cmr_expiry date,
  ADD COLUMN IF NOT EXISTS route_flexibility_default boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_doc_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS admin_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_bio_length;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_length CHECK (bio IS NULL OR char_length(bio) <= 200);
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_fleet_desc_length;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_fleet_desc_length CHECK (fleet_description IS NULL OR char_length(fleet_description) <= 200);
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_vat_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_vat_status_check CHECK (vat_status IN ('unverified','pending','verified'));
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_insurance_doc_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_insurance_doc_status_check CHECK (insurance_doc_status IN ('none','uploaded','pending','verified'));

DROP POLICY IF EXISTS "Authenticated users can view basic profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view basic profiles"
ON public.profiles FOR SELECT TO authenticated
USING (is_suspended = false OR id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.users_share_shipment(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shipments s
    WHERE (s.shipper_id = _a AND s.carrier_id = _b)
       OR (s.shipper_id = _b AND s.carrier_id = _a)
  );
$$;

CREATE OR REPLACE FUNCTION public.profile_completion_pct(_user_id uuid)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (
    (CASE WHEN p.company_name IS NOT NULL AND p.company_name <> '' THEN 1 ELSE 0 END) +
    (CASE WHEN p.logo_url IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN p.bio IS NOT NULL AND p.bio <> '' THEN 1 ELSE 0 END) +
    (CASE WHEN p.country IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN p.contact_email IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN p.vat_number IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN array_length(p.preferred_cargo_types,1) IS NOT NULL THEN 1 ELSE 0 END)
  ) * 100 / 7
  FROM public.profiles p WHERE p.id = _user_id;
$$;

DROP POLICY IF EXISTS "Auth can read company logos" ON storage.objects;
CREATE POLICY "Auth can read company logos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Auth upload own company logo" ON storage.objects;
CREATE POLICY "Auth upload own company logo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Auth update own company logo" ON storage.objects;
CREATE POLICY "Auth update own company logo"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Auth delete own company logo" ON storage.objects;
CREATE POLICY "Auth delete own company logo"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
