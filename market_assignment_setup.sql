-- =========================================================================
-- MARKET SİPARİŞİ / TALEBİ YÖNLENDİRME (ASSIGNMENT) GÜNCELLEMESİ
-- Lütfen bu kodu Supabase Dashboard -> SQL Editor alanında çalıştırınız.
-- =========================================================================

-- 1. market_requests tablosuna assigned_provider_ids dizisini (Array) ekle
ALTER TABLE public.market_requests 
ADD COLUMN IF NOT EXISTS assigned_provider_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- 2. Eski Select politikalarını temizle
DROP POLICY IF EXISTS "Users view own, Providers view open" ON public.market_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.market_requests;
DROP POLICY IF EXISTS "Users view own, Providers view assigned" ON public.market_requests;

-- 3. Yepyeni ve ultra güvenli RLS politikasını Uygula
CREATE POLICY "Users view own, Providers view assigned"
ON public.market_requests 
FOR SELECT 
TO authenticated
USING (
  -- Kural 1: Siparişi veren kişi her zaman tam erişime sahiptir
  auth.uid() = user_id 
  
  OR 
  
  -- Kural 2: Admin sizin (Yöneticiler) tarafından özel olarak seçilmiş / yönlendirilmiş tedarikçiler görebilir
  auth.uid() = ANY(assigned_provider_ids)
  
  OR
  
  -- Kural 3: Geçmiş döneme uyumluluk (zaten aktif bir teklif süreci varsa görebilmeye devam etsin)
  auth.uid() IN (SELECT provider_id FROM market_bids WHERE request_id = market_requests.id)
  
  OR
  
  -- Kural 4: Uygulama sahibinin (Admin'in) tüm listeye istisnasız erişimi vardır. 
  -- ('is_admin' tablosundan doğrulama yapar)
  auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true)
);

-- Ek Güvenlik: Adminlerin update yetkisini RLS ile açalım (Eğer zaten kapalıysa)
DROP POLICY IF EXISTS "Admins can update market requests" ON public.market_requests;
CREATE POLICY "Admins can update market requests"
ON public.market_requests
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true)
);

-- Sona Erdi. Başarılı!
