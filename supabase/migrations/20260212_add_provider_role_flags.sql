-- Add role flags for other provider types
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_lawyer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_transporter boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_real_estate_agent boolean DEFAULT false;

-- Comment on columns
COMMENT ON COLUMN public.profiles.is_lawyer IS 'Indicates if the user is a verified lawyer';
COMMENT ON COLUMN public.profiles.is_transporter IS 'Indicates if the user is a verified logistics provider';
COMMENT ON COLUMN public.profiles.is_real_estate_agent IS 'Indicates if the user is a verified real estate agent';
