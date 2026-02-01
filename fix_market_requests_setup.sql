-- 1. Create Tables for Requests
CREATE TABLE IF NOT EXISTS public.market_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT,
    status TEXT DEFAULT 'OPEN', -- OPEN, CLOSED, COMPLETED
    location TEXT,
    delivery_time TEXT,
    notes TEXT,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.market_request_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.market_requests(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.market_bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.market_requests(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.profiles(id), -- Changed to link with profiles for easier joining
    price DECIMAL(12, 2),
    currency TEXT DEFAULT 'TRY',
    notes TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix for existing tables (Run this to update the relationship)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'market_bids_provider_id_fkey') THEN
        ALTER TABLE public.market_bids DROP CONSTRAINT market_bids_provider_id_fkey;
        ALTER TABLE public.market_bids ADD CONSTRAINT market_bids_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 2. Enable RLS
ALTER TABLE public.market_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_bids ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Requests: Users can see their own requests
DROP POLICY IF EXISTS "Users can view own requests" ON public.market_requests;
CREATE POLICY "Users can view own requests" ON public.market_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Requests: Users can create their own requests
DROP POLICY IF EXISTS "Users can create requests" ON public.market_requests;
CREATE POLICY "Users can create requests" ON public.market_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Items: Users can see items of their own requests
DROP POLICY IF EXISTS "Users can view own request items" ON public.market_request_items;
CREATE POLICY "Users can view own request items" ON public.market_request_items
    FOR SELECT USING (
        EXISTS ( SELECT 1 FROM public.market_requests WHERE id = request_id AND user_id = auth.uid() )
    );

-- Items: Users can create items for their own requests
DROP POLICY IF EXISTS "Users can create request items" ON public.market_request_items;
CREATE POLICY "Users can create request items" ON public.market_request_items
    FOR INSERT WITH CHECK (
        EXISTS ( SELECT 1 FROM public.market_requests WHERE id = request_id AND user_id = auth.uid() )
    );

-- 4. Grants
GRANT ALL ON TABLE public.market_requests TO postgres, service_role;
GRANT ALL ON TABLE public.market_request_items TO postgres, service_role;
GRANT ALL ON TABLE public.market_bids TO postgres, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.market_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.market_request_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.market_bids TO authenticated;
