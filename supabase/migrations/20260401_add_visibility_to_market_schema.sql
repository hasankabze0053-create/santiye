-- Add visibility to market categories
ALTER TABLE market_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add visibility and sorting to market subcategories
ALTER TABLE market_subcategories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE market_subcategories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing subcategories if needed (optional)
-- UPDATE market_subcategories SET sort_order = id * 10 WHERE sort_order = 0;
