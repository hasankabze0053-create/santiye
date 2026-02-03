-- Add new columns to construction_requests table to support Offer Type and Campaign details

ALTER TABLE public.construction_requests 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS offer_type text,
ADD COLUMN IF NOT EXISTS is_campaign_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS campaign_unit_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS campaign_commercial_count integer DEFAULT 0;

-- Comment on columns for clarity
COMMENT ON COLUMN public.construction_requests.description IS 'User provided details about the project or request';
COMMENT ON COLUMN public.construction_requests.offer_type IS 'anahtar_teslim or kat_karsiligi';
