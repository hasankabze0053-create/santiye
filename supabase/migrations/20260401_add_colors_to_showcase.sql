-- Add color columns to market_showcase
ALTER TABLE market_showcase ADD COLUMN IF NOT EXISTS tag_color TEXT DEFAULT '#D4AF37';
ALTER TABLE market_showcase ADD COLUMN IF NOT EXISTS title_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE market_showcase ADD COLUMN IF NOT EXISTS subtitle_color TEXT DEFAULT '#FFFFFF';

-- Update existing records if any
UPDATE market_showcase SET tag_color = '#D4AF37', title_color = '#FFFFFF', subtitle_color = '#FFFFFF';
