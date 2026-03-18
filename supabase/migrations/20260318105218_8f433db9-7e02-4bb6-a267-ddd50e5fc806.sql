-- Allow shippers to update offers on their loads (for counter-offers)
CREATE POLICY "Load owners can update offers on their loads"
ON public.offers
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM loads
    WHERE loads.id = offers.load_id
    AND loads.shipper_id = auth.uid()
  )
);

-- Allow shippers to delete offers on their loads (for rejections)
CREATE POLICY "Load owners can delete offers on their loads"
ON public.offers
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM loads
    WHERE loads.id = offers.load_id
    AND loads.shipper_id = auth.uid()
  )
);