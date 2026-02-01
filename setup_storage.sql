-- Supabase Storage Setup Script
-- Bu scripti SQL Editor'de calistirarak dosya yukleme alanini acabilirsin.

-- 1. 'market-images' adinda herkese acik bir kova (bucket) olustur
INSERT INTO storage.buckets (id, name, public)
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politika: Giris yapmis kullanicilar resim yukleyebilir
-- Eski politika varsa once silelim (Hata vermemesi icin)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'market-images');

-- 3. Politika: Herkes resimleri gorebilir (Public Access)
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;

CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'market-images');

-- 4. Politika: Kullanici kendi yukledigi resmi silebilir (Opsiyonel)
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'market-images' AND auth.uid() = owner);
