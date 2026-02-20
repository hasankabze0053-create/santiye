-- Migration: Add company_name to profiles table
-- Date: 2026-02-20

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Update RLS policies if necessary (profiles are usually read-only for public or self-manage)
-- The existing policies usually allow SELECT for all, so new columns are automatically covered.
