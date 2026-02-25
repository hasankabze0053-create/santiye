-- 20260225_add_form_values_to_ai_requests.sql

-- 1. Create the market_ai_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.market_ai_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
    original_text TEXT NOT NULL,
    parsed_data JSONB, -- Holds category, urgency, location, ai_notes
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add RLS Policies for market_ai_requests
ALTER TABLE public.market_ai_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own requests
CREATE POLICY "Users can insert their own AI requests"
    ON public.market_ai_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to view their own requests
CREATE POLICY "Users can view their own AI requests"
    ON public.market_ai_requests FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own requests
CREATE POLICY "Users can update their own AI requests"
    ON public.market_ai_requests FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. Create the market_ai_matches table for storing AI recommendations
CREATE TABLE IF NOT EXISTS public.market_ai_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.market_ai_requests(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL,
    match_reasons JSONB, -- e.g., ["High Stock", "Area Expert", "Fast Delivery"]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Add RLS Policies for market_ai_matches
ALTER TABLE public.market_ai_matches ENABLE ROW LEVEL SECURITY;

-- Allow users to view matches for their requests
CREATE POLICY "Users can view matches for their requests"
    ON public.market_ai_matches FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.market_ai_requests r 
            WHERE r.id = market_ai_matches.request_id AND (r.user_id = auth.uid() OR r.user_id IS NULL)
        )
    );

-- Allow system (authenticated users) to insert matches
CREATE POLICY "Authenticated users can insert AI matches"
    ON public.market_ai_matches FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
