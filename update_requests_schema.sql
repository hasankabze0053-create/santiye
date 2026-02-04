-- Add new columns to construction_requests table to support Offer Type and Campaign details

ALTER TABLE public.construction_requests 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS offer_type text,
ADD COLUMN IF NOT EXISTS is_campaign_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS campaign_unit_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS campaign_commercial_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS document_urls text[]; -- Array of text for multiple image URLs

-- Comment on columns for clarity
COMMENT ON COLUMN public.construction_requests.description IS 'User provided details about the project or request';
COMMENT ON COLUMN public.construction_requests.offer_type IS 'anahtar_teslim or kat_karsiligi';
COMMENT ON COLUMN public.construction_requests.document_urls IS 'Array of public URLs for uploaded documents/images';
