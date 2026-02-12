-- Add more role flags for remaining provider types
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_seller boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_engineer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_architect boolean DEFAULT false;

-- Comment on columns
COMMENT ON COLUMN public.profiles.is_seller IS 'Indicates if the user is a verified marketplace seller';
COMMENT ON COLUMN public.profiles.is_engineer IS 'Indicates if the user is a verified engineer';
COMMENT ON COLUMN public.profiles.is_architect IS 'Indicates if the user is a verified architect';
