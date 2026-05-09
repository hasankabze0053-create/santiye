-- 20260509_add_ad_no_and_constraints.sql
-- Add ad_no columns and unique constraint

DO $$ 
BEGIN 
    -- 1. Construction Requests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='construction_requests' AND column_name='ad_no') THEN
        ALTER TABLE construction_requests ADD COLUMN ad_no BIGSERIAL;
    END IF;
    
    -- 2. Market Requests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='market_requests' AND column_name='ad_no') THEN
        ALTER TABLE market_requests ADD COLUMN ad_no BIGINT;
    END IF;

    -- 3. Transport Requests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_requests' AND column_name='ad_no') THEN
        ALTER TABLE transport_requests ADD COLUMN ad_no BIGINT;
    END IF;

    -- 4. Unique Constraint for Construction
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_ad_no') THEN
        ALTER TABLE construction_requests ADD CONSTRAINT unique_ad_no UNIQUE (ad_no);
    END IF;
END $$;
