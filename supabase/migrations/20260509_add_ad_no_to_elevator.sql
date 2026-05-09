-- 20260509_add_ad_no_to_elevator.sql
-- Add ad_no column to elevator_requests

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='elevator_requests' AND column_name='ad_no') THEN
        ALTER TABLE elevator_requests ADD COLUMN ad_no BIGINT;
    END IF;
END $$;
