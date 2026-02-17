-- Add rejection_reason column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
