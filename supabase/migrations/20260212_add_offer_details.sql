ALTER TABLE public.construction_offers
ADD COLUMN IF NOT EXISTS floor_count integer,
ADD COLUMN IF NOT EXISTS is_basement_residential boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS total_apartments integer,
ADD COLUMN IF NOT EXISTS floor_design_type text;
-- floor_design_type: 'single', 'double', 'mixed'
