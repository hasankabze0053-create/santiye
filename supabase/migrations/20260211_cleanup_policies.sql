-- Clean up redundant policies on market_requests
DROP POLICY IF EXISTS "Public requests" ON public.market_requests;
DROP POLICY IF EXISTS "Public Requests Access" ON public.market_requests;
DROP POLICY IF EXISTS "Insert Requests" ON public.market_requests;
DROP POLICY IF EXISTS "Public Read Requests" ON public.market_requests;

-- Re-apply clean, standard policies for market_requests
CREATE POLICY "Public Read Requests" ON public.market_requests FOR SELECT USING (true);
CREATE POLICY "Auth Insert Requests" ON public.market_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users Manage Own Requests" ON public.market_requests FOR ALL USING (auth.uid() = user_id);

-- Clean up redundant policies on market_bids
DROP POLICY IF EXISTS "Public bids" ON public.market_bids;
DROP POLICY IF EXISTS "Public Bids Access" ON public.market_bids;
DROP POLICY IF EXISTS "Insert Bids" ON public.market_bids;
DROP POLICY IF EXISTS "Public Read Bids" ON public.market_bids;

-- Re-apply clean, standard policies for market_bids
CREATE POLICY "Public Read Bids" ON public.market_bids FOR SELECT USING (true);
CREATE POLICY "Auth Insert Bids" ON public.market_bids FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Note: Providers might need to manage their bids, assuming 'provider_id' or 'user_id' exists. 
-- For now, allowing all authenticated to insert is safer than breaking it, but we should refine this later.
