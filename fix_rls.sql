-- BU SCRIPT RLS POLİTİKALARINI VE YETKİLERİ DÜZELTİR
-- Supabase SQL Editor'de çalıştır.

-- 1. Yetkileri Garantiye Al (Authenticated kullanıcılar ekleme/okuma yapabilsin)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;

-- 2. Mevcut Politikaları Temizle (Çakışma olmasın)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- 3. Politikaları Yeniden ve Daha Net Şekilde Oluştur

-- OKUMA: Herkes okuyabilir
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

-- EKLEME: Sadece giriş yapmış kullanıcı, kendi ID'si ile ekleyebilir
-- (auth.uid() kullanıcının o anki token'ından gelir)
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- GÜNCELLEME: Sadece kendi profilini güncelleyebilir
CREATE POLICY "Users can update their own profile." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 4. Trigger'ın da çalıştığından emin olalım (Opsiyonel yeniden tanımlama yapmıyorum, sadece policy odaklı)
-- Not: Trigger "SECURITY DEFINER" olduğu için RLS'den etkilenmez, ama Client'tan elle ekleme RLS'ye takılıyordu.
-- Bu script ile Client'tan ekleme (fallback) açılmış olacak.
