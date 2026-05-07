-- 🚀 ULTIMATE GLOBAL FOREIGN KEY FIX 🚀
-- Bu migration, veritabanındaki tüm "auth.users" referanslarını "public.profiles" tablosuna yönlendirir.
-- Bu sayede uygulama genelindeki tüm Join (ilişkili tablo çekme) hataları çözülür.

BEGIN;

-- 1. COMPANIES (Firmalar)
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_owner_id_fkey;
ALTER TABLE public.companies ADD CONSTRAINT companies_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. ELEVATOR REQUESTS (Asansör Talepleri)
ALTER TABLE public.elevator_requests DROP CONSTRAINT IF EXISTS elevator_requests_user_id_fkey;
ALTER TABLE public.elevator_requests ADD CONSTRAINT elevator_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. LEGAL ANALYSES (Hukuki Analizler)
ALTER TABLE public.legal_analyses DROP CONSTRAINT IF EXISTS legal_analyses_user_id_fkey;
ALTER TABLE public.legal_analyses ADD CONSTRAINT legal_analyses_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. TRANSFORMATION (Kentsel Dönüşüm Chat)
ALTER TABLE public.transformation_chats DROP CONSTRAINT IF EXISTS transformation_chats_user_id_fkey;
ALTER TABLE public.transformation_chats ADD CONSTRAINT transformation_chats_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.transformation_messages DROP CONSTRAINT IF EXISTS transformation_messages_sender_id_fkey;
ALTER TABLE public.transformation_messages ADD CONSTRAINT transformation_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 5. LOGISTICS (Nakliye)
ALTER TABLE public.transport_requests DROP CONSTRAINT IF EXISTS transport_requests_user_id_fkey;
ALTER TABLE public.transport_requests ADD CONSTRAINT transport_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 6. MARKETPLACE (RFQ / Pazar Yeri)
-- Providers tablosu
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_id_fkey;
ALTER TABLE public.providers ADD CONSTRAINT providers_id_fkey 
FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Market Requests
ALTER TABLE public.market_requests DROP CONSTRAINT IF EXISTS market_requests_user_id_fkey;
ALTER TABLE public.market_requests ADD CONSTRAINT market_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Market Bids (Doğrudan profiles'a bağlayalım ki join kolay olsun)
ALTER TABLE public.market_bids DROP CONSTRAINT IF EXISTS market_bids_provider_id_fkey;
ALTER TABLE public.market_bids ADD CONSTRAINT market_bids_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 7. MESSAGES (Genel Mesajlaşma)
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 8. CONSTRUCTION (İnşaat - Zaten yapmıştık ama garanti olsun)
ALTER TABLE public.construction_requests DROP CONSTRAINT IF EXISTS construction_requests_user_id_fkey;
ALTER TABLE public.construction_requests ADD CONSTRAINT construction_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.construction_offers DROP CONSTRAINT IF EXISTS construction_offers_contractor_id_fkey;
ALTER TABLE public.construction_offers ADD CONSTRAINT construction_offers_contractor_id_fkey 
FOREIGN KEY (contractor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

COMMIT;
