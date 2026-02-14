ALTER TABLE public.construction_offers
ADD COLUMN IF NOT EXISTS floor_details_json jsonb DEFAULT '{}'::jsonb;
