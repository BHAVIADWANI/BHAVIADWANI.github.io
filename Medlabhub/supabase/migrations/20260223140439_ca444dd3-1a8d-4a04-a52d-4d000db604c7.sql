
-- Create storage bucket for organism reference images
INSERT INTO storage.buckets (id, name, public) VALUES ('organism-images', 'organism-images', true);

-- Allow public read access
CREATE POLICY "Public read access for organism images"
ON storage.objects FOR SELECT
USING (bucket_id = 'organism-images');

-- Allow service role to insert (edge functions use service role)
CREATE POLICY "Service role insert for organism images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'organism-images');
