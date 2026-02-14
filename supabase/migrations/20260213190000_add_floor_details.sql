-- Add floor_details_json column to construction_offers for detailed unit configuration
ALTER TABLE public.construction_offers 
ADD COLUMN IF NOT EXISTS floor_details_json jsonb;

-- Also ensure other related columns exist (safety check)
ALTER TABLE public.construction_offers 
ADD COLUMN IF NOT EXISTS floor_count integer,
ADD COLUMN IF NOT EXISTS basement_count integer default 0,
ADD COLUMN IF NOT EXISTS is_basement_residential boolean default false,
ADD COLUMN IF NOT EXISTS total_apartments integer,
ADD COLUMN IF NOT EXISTS floor_design_type text;
