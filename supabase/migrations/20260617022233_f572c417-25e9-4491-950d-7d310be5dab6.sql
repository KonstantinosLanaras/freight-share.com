
-- Evidence storage: path = <case_id>/<file>
CREATE POLICY "Parties or admins can read evidence files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'resolution-evidence'
    AND EXISTS (
      SELECT 1 FROM public.resolution_cases c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (auth.uid() IN (c.shipper_id, c.carrier_id) OR public.has_role(auth.uid(),'admin'))
    )
  );

CREATE POLICY "Parties or admins can upload evidence files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resolution-evidence'
    AND EXISTS (
      SELECT 1 FROM public.resolution_cases c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (auth.uid() IN (c.shipper_id, c.carrier_id) OR public.has_role(auth.uid(),'admin'))
    )
  );

CREATE POLICY "Parties or admins can delete evidence files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'resolution-evidence'
    AND EXISTS (
      SELECT 1 FROM public.resolution_cases c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (auth.uid() IN (c.shipper_id, c.carrier_id) OR public.has_role(auth.uid(),'admin'))
    )
  );
