-- Add floor_details column to construction_offers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'construction_offers' AND column_name = 'floor_details') THEN
        ALTER TABLE public.construction_offers ADD COLUMN floor_details JSONB;
    END IF;
END $$;
