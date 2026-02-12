-- Add is_contractor to profiles if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_contractor') THEN
        ALTER TABLE public.profiles ADD COLUMN is_contractor boolean DEFAULT false;
    END IF;
END $$;

-- 1. Construction Requests Table
CREATE TABLE IF NOT EXISTS public.construction_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    city text DEFAULT 'İstanbul',
    district text,
    neighborhood text,
    ada text,
    parsel text,
    pafta text,
    full_address text,
    description text,
    offer_type text, -- 'anahtar_teslim', 'kat_karsiligi'
    is_campaign_active boolean DEFAULT false,
    campaign_unit_count int DEFAULT 0,
    campaign_commercial_count int DEFAULT 0,
    deed_image_url text,
    document_urls text[],
    status text DEFAULT 'pending', -- pending, active, completed, archived
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Construction Offers Table (Bids)
CREATE TABLE IF NOT EXISTS public.construction_offers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id uuid REFERENCES public.construction_requests(id) NOT NULL,
    contractor_id uuid REFERENCES auth.users(id) NOT NULL,
    price_estimate numeric,
    offer_details text,
    total_area numeric,
    unit_price numeric,
    unit_breakdown jsonb, -- Array of unit types/counts
    campaign_policy text, -- 'included', 'excluded'
    status text DEFAULT 'pending', -- pending, accepted, rejected
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.construction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_offers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own requests" ON public.construction_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.construction_requests;
DROP POLICY IF EXISTS "Contractors can view all pending/active requests" ON public.construction_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.construction_requests;

DROP POLICY IF EXISTS "Contractors can create offers" ON public.construction_offers;
DROP POLICY IF EXISTS "Contractors can view their own offers" ON public.construction_offers;
DROP POLICY IF EXISTS "Users can view offers for their requests" ON public.construction_offers;

-- Policies for requests
CREATE POLICY "Users can create their own requests"
ON public.construction_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
ON public.construction_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Contractors can view all pending/active requests"
ON public.construction_requests FOR SELECT
TO authenticated
USING (
    (SELECT is_contractor FROM public.profiles WHERE id = auth.uid()) = true 
    AND status IN ('pending', 'active')
);

CREATE POLICY "Admins can view all requests"
ON public.construction_requests FOR SELECT
TO authenticated
USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Policies for offers
CREATE POLICY "Contractors can create offers"
ON public.construction_offers FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT is_contractor FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Contractors can view their own offers"
ON public.construction_offers FOR SELECT
TO authenticated
USING (auth.uid() = contractor_id);

CREATE POLICY "Users can view offers for their requests"
ON public.construction_offers FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.construction_requests 
        WHERE id = construction_offers.request_id 
        AND user_id = auth.uid()
    )
);
