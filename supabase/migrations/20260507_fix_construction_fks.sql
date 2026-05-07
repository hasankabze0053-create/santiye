-- Fix FK for construction_offers.contractor_id to point to public.profiles
-- This migration ensures that Supabase/PostgREST can correctly join with the profiles table.

ALTER TABLE public.construction_offers 
DROP CONSTRAINT IF EXISTS construction_offers_contractor_id_fkey;

ALTER TABLE public.construction_offers
ADD CONSTRAINT construction_offers_contractor_id_fkey 
FOREIGN KEY (contractor_id) 
REFERENCES public.profiles(id);

-- Fix FK for construction_requests.user_id to point to public.profiles
ALTER TABLE public.construction_requests
DROP CONSTRAINT IF EXISTS construction_requests_user_id_fkey;

ALTER TABLE public.construction_requests
ADD CONSTRAINT construction_requests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id);
