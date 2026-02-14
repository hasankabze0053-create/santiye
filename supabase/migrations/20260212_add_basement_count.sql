ALTER TABLE public.construction_offers
ADD COLUMN IF NOT EXISTS basement_count INTEGER DEFAULT 1;
