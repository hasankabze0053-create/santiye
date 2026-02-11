
-- Add new columns to construction_offers for detailed pricing
ALTER TABLE public.construction_offers 
ADD COLUMN IF NOT EXISTS total_area numeric,
ADD COLUMN IF NOT EXISTS unit_price numeric,
ADD COLUMN IF NOT EXISTS unit_breakdown jsonb, -- Stores array of {type, count, area}
ADD COLUMN IF NOT EXISTS campaign_policy text default 'standard'; -- 'standard', 'included', 'excluded'

-- Add is_campaign_active to construction_requests
ALTER TABLE public.construction_requests
ADD COLUMN IF NOT EXISTS is_campaign_active boolean default false;
