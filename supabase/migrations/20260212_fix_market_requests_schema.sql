-- Idempotent Market Schema Fix

-- 1. Ensure market_requests exists
CREATE TABLE IF NOT EXISTS public.market_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    title text,
    status text DEFAULT 'OPEN',
    location text,
    delivery_time text,
    notes text,
    payment_method text,
    image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ensure market_request_items exists
CREATE TABLE IF NOT EXISTS public.market_request_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id uuid REFERENCES public.market_requests(id) ON DELETE CASCADE,
    product_name text,
    quantity text,
    details text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ensure market_bids exists
CREATE TABLE IF NOT EXISTS public.market_bids (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id uuid REFERENCES public.market_requests(id) ON DELETE CASCADE,
    provider_id uuid REFERENCES public.profiles(id), -- Provider IS a user profile
    price text,
    currency text DEFAULT 'TL',
    notes text,
    payment_terms text,
    shipping_included boolean DEFAULT false,
    pump_fee text,
    shipping_cost text,
    shipping_type text,
    delivery_date text,
    stock_status text,
    validity_duration text,
    status text DEFAULT 'PENDING',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS (Safe to run multiple times)
ALTER TABLE public.market_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_bids ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to avoid conflict, then recreate
DROP POLICY IF EXISTS "Public Read Requests" ON public.market_requests;
DROP POLICY IF EXISTS "Users can insert requests" ON public.market_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.market_requests;
DROP POLICY IF EXISTS "Users can delete own requests" ON public.market_requests;

DROP POLICY IF EXISTS "Public Read Items" ON public.market_request_items;
DROP POLICY IF EXISTS "Users can insert items" ON public.market_request_items;

DROP POLICY IF EXISTS "Public Read Bids" ON public.market_bids;
DROP POLICY IF EXISTS "Providers can insert bids" ON public.market_bids;
DROP POLICY IF EXISTS "Providers can update own bids" ON public.market_bids;

-- 6. Recreate Policies
CREATE POLICY "Public Read Requests" ON public.market_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert requests" ON public.market_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON public.market_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own requests" ON public.market_requests FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public Read Items" ON public.market_request_items FOR SELECT USING (true);
CREATE POLICY "Users can insert items" ON public.market_request_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.market_requests WHERE id = request_id AND user_id = auth.uid())
);

CREATE POLICY "Public Read Bids" ON public.market_bids FOR SELECT USING (true);
CREATE POLICY "Providers can insert bids" ON public.market_bids FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own bids" ON public.market_bids FOR UPDATE USING (auth.uid() = provider_id);
