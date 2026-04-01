
-- Fix organism-images storage bucket: restrict INSERT to service_role only
DROP POLICY IF EXISTS "Service role insert for organism images" ON storage.objects;

CREATE POLICY "Service role insert for organism images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'organism-images');

-- Restrict UPDATE and DELETE to service_role
DROP POLICY IF EXISTS "Service role update for organism images" ON storage.objects;
CREATE POLICY "Service role update for organism images"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'organism-images');

DROP POLICY IF EXISTS "Service role delete for organism images" ON storage.objects;
CREATE POLICY "Service role delete for organism images"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'organism-images');
