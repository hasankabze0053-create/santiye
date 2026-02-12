-- Fix FK to allow joining with profiles
ALTER TABLE public.construction_offers
DROP CONSTRAINT IF EXISTS construction_offers_contractor_id_fkey;

ALTER TABLE public.construction_offers
ADD CONSTRAINT construction_offers_contractor_id_fkey
FOREIGN KEY (contractor_id) REFERENCES public.profiles(id);
