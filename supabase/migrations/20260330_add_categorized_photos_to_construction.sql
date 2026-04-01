-- Add categorized photo columns to construction_requests
ALTER TABLE public.construction_requests 
ADD COLUMN IF NOT EXISTS current_situation_urls text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS inspiration_urls text[] DEFAULT '{}';

-- Optional: Update description parsing if needed (not strictly required if we save them explicitly)
COMMENT ON COLUMN public.construction_requests.current_situation_urls IS 'Mevcut durum fotoğrafları';
COMMENT ON COLUMN public.construction_requests.inspiration_urls IS 'İlham alınan referans fotoğrafları';
