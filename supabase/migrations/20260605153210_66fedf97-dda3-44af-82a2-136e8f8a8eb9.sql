
-- 1. Profiles: restrict public read
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2. Carrier insurance: drop public read
DROP POLICY IF EXISTS "Insurance is viewable by everyone" ON public.carrier_insurance;
-- Allow admins to view all
CREATE POLICY "Admins can view all insurance"
  ON public.carrier_insurance FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Detailed ratings: restrict to authenticated
DROP POLICY IF EXISTS "Ratings viewable by authenticated users" ON public.detailed_ratings;
CREATE POLICY "Ratings viewable by authenticated users"
  ON public.detailed_ratings FOR SELECT
  TO authenticated
  USING (true);

-- 4. Storage: itinerary-images INSERT scoped to own folder
DROP POLICY IF EXISTS "Authenticated users can upload itinerary images" ON storage.objects;
CREATE POLICY "Users can upload own itinerary images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'itinerary-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 5. Storage: DELETE policies per-owner
CREATE POLICY "Users can delete own itinerary images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'itinerary-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Carriers can delete own insurance docs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'insurance-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Carriers can update own insurance docs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'insurance-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Carriers can delete own verification documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Carriers can update own verification documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
