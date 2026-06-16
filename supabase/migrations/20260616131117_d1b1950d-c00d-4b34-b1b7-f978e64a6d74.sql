
-- 1. Profiles: restrict SELECT to self or admin
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile or admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- 2. Safe public view of profiles for cross-user lookups
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT id, full_name, company_name, verification_status, avatar_url, country
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 3. detailed_ratings: restrict SELECT to shipment parties
DROP POLICY IF EXISTS "Ratings viewable by authenticated users" ON public.detailed_ratings;

CREATE POLICY "Shipment parties can view detailed ratings"
ON public.detailed_ratings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shipments s
    WHERE s.id = detailed_ratings.shipment_id
      AND (s.shipper_id = auth.uid() OR s.carrier_id = auth.uid())
  )
);

-- 4. user_roles: remove public "view others" policy
DROP POLICY IF EXISTS "Users can view others roles" ON public.user_roles;

-- 5. Revoke EXECUTE on SECURITY DEFINER functions from anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_matching_loads_for_route(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_matching_routes_for_load(text, text, text, text, date, date, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_matching_loads_for_route(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_matching_routes_for_load(text, text, text, text, date, date, integer) TO authenticated;

-- 6. itinerary-images bucket: drop broad public LIST policy, keep per-object public read
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND cmd='SELECT'
      AND qual LIKE '%itinerary-images%'
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Allow public read of individual itinerary images by exact name (no listing)
CREATE POLICY "Public read itinerary images by name"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'itinerary-images');
