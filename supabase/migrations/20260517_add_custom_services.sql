-- Migration: Add custom_services to companies table
-- Date: 2026-05-17
-- Description: Added custom_services column to capture manual user input for concierge onboarding

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS custom_services TEXT;

-- Update RLS policies to ensure it can be updated by the owner
-- (Assuming standard policies are already in place, but ensuring it's accessible)
