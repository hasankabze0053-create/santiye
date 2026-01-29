-- BU SCRIPT FIRMA KAYDI ICIN GEREKLI YETKILERI ACAR
-- Supabase SQL Editor'de çalıştır.

-- 1. COMPANIES Tablosu Yetkileri
GRANT ALL ON TABLE public.companies TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.companies TO authenticated;
-- Şimdilik anon'a kapatıyoruz (sadece giriş yapan firma kurabilir)

-- 2. COMPANY_SERVICES Tablosu Yetkileri
GRANT ALL ON TABLE public.company_services TO postgres, service_role;
GRANT SELECT, INSERT ON TABLE public.company_services TO authenticated;

-- 3. RLS Politikalarını Kontrol Et ve Yenile (Emin olmak için)

-- Companies Politikaları
DROP POLICY IF EXISTS "Companies can be created by authenticated users" ON public.companies;
CREATE POLICY "Companies can be created by authenticated users"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Company owners can select their own company" ON public.companies;
CREATE POLICY "Company owners can select their own company"
  ON public.companies FOR SELECT
  USING (true); -- Şimdilik herkes firmaları görebilsin (Vitrin için) veya auth.uid() = owner_id

DROP POLICY IF EXISTS "Company owners can update their own company" ON public.companies;
CREATE POLICY "Company owners can update their own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_id);

-- Company Services Politikaları
DROP POLICY IF EXISTS "Companies can add services" ON public.company_services;
CREATE POLICY "Companies can add services"
  ON public.company_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public can view services" ON public.company_services;
CREATE POLICY "Public can view services"
  ON public.company_services FOR SELECT
  USING (true);
