-- Storage RLS policies for tree-photos bucket
-- These policies allow authenticated users to upload and everyone to read

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tree-photos');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tree-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tree-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all files in tree-photos bucket
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tree-photos');

