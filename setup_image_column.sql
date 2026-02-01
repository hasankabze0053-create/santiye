-- Add image_url column to market_requests table
ALTER TABLE public.market_requests
ADD COLUMN IF NOT EXISTS image_url TEXT;
