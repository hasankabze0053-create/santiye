-- Global Foreign Key Fix Migration
-- This migration updates all tables that reference auth.users to reference public.profiles instead.
-- This ensures that Supabase/PostgREST can correctly perform joins between these tables and profiles.

BEGIN;

-- 1. COMPANIES
ALTER TABLE public.companies 
DROP CONSTRAINT IF EXISTS companies_owner_id_fkey;
ALTER TABLE public.companies
ADD CONSTRAINT companies_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. ELEVATOR REQUESTS
ALTER TABLE public.elevator_requests
DROP CONSTRAINT IF EXISTS elevator_requests_user_id_fkey;
ALTER TABLE public.elevator_requests
ADD CONSTRAINT elevator_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. LEGAL ANALYSES
ALTER TABLE public.legal_analyses
DROP CONSTRAINT IF EXISTS legal_analyses_user_id_fkey;
ALTER TABLE public.legal_analyses
ADD CONSTRAINT legal_analyses_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. TRANSFORMATION CHATS & MESSAGES
ALTER TABLE public.transformation_chats
DROP CONSTRAINT IF EXISTS transformation_chats_user_id_fkey;
ALTER TABLE public.transformation_chats
ADD CONSTRAINT transformation_chats_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.transformation_messages
DROP CONSTRAINT IF EXISTS transformation_messages_sender_id_fkey;
ALTER TABLE public.transformation_messages
ADD CONSTRAINT transformation_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 5. MARKETPLACE (RFQ) TABLES
-- First fix providers if it exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'providers') THEN
        ALTER TABLE public.providers 
        DROP CONSTRAINT IF EXISTS providers_id_fkey;
        ALTER TABLE public.providers
        ADD CONSTRAINT providers_id_fkey 
        FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Then market_requests
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'market_requests') THEN
        ALTER TABLE public.market_requests 
        DROP CONSTRAINT IF EXISTS market_requests_user_id_fkey;
        ALTER TABLE public.market_requests
        ADD CONSTRAINT market_requests_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

COMMIT;
