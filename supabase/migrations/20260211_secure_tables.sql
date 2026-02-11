-- Enable RLS for Transport Requests
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own requests
CREATE POLICY "Users can view own transport requests" 
ON public.transport_requests FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can create requests
CREATE POLICY "Users can create transport requests" 
ON public.transport_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Enable RLS for Transport Bids
ALTER TABLE public.transport_bids ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view bids on their requests OR their own bids
CREATE POLICY "Users view bids relevant to them" 
ON public.transport_bids FOR SELECT 
USING (
    provider_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.transport_requests 
        WHERE id = request_id AND user_id = auth.uid()
    )
);

-- Policy: Drivers can create bids
CREATE POLICY "Drivers can create bids" 
ON public.transport_bids FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

-- Enable RLS for _migrations (System table, usually strict)
ALTER TABLE public._migrations ENABLE ROW LEVEL SECURITY;
-- Allow authenticated users to read migration history (read-only)
CREATE POLICY "Allow read access to migrations" ON public._migrations FOR SELECT TO authenticated USING (true);
