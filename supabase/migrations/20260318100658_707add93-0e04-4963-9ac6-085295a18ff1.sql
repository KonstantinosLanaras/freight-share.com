
-- Fix: Restrict detailed_ratings to authenticated users only
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.detailed_ratings;

-- Create a new policy that requires authentication
CREATE POLICY "Ratings viewable by authenticated users"
ON public.detailed_ratings FOR SELECT
TO authenticated
USING (true);
