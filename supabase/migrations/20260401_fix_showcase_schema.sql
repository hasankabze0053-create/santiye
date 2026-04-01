-- Add is_local column
ALTER TABLE market_showcase ADD COLUMN IF NOT EXISTS is_local BOOLEAN DEFAULT FALSE;

-- Update existing records to be local
UPDATE market_showcase SET is_local = TRUE WHERE image_ref IS NOT NULL;
