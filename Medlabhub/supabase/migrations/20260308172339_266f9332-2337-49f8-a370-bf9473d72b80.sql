
-- Create storage bucket for instrument images
INSERT INTO storage.buckets (id, name, public)
VALUES ('instrument-images', 'instrument-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view instrument images (public bucket)
CREATE POLICY "Anyone can view instrument images"
ON storage.objects FOR SELECT
USING (bucket_id = 'instrument-images');

-- Only authenticated users can upload instrument images
CREATE POLICY "Authenticated users can upload instrument images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instrument-images');

-- Only the uploader can update their instrument images
CREATE POLICY "Uploaders can update instrument images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'instrument-images' AND auth.uid() = owner);

-- Only the uploader can delete their instrument images
CREATE POLICY "Uploaders can delete instrument images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'instrument-images' AND auth.uid() = owner);
