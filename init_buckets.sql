-- Create renovation-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('renovation-images', 'renovation-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Create transformation-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('transformation-images', 'transformation-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Ensure RLS is handled (Allow public read as per pattern)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Public Access Renovation Images' 
        AND polrelid = 'storage.objects'::regclass
    ) THEN
        CREATE POLICY "Public Access Renovation Images" ON storage.objects 
        FOR SELECT USING (bucket_id = 'renovation-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Public Access Transformation Images' 
        AND polrelid = 'storage.objects'::regclass
    ) THEN
        CREATE POLICY "Public Access Transformation Images" ON storage.objects 
        FOR SELECT USING (bucket_id = 'transformation-images');
    END IF;
END $$;
