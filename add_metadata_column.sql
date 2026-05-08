ALTER TABLE public.screen_section_config
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
