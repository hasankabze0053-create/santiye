-- 1. Enable RLS (if not enabled)
ALTER TABLE market_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_bids ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Requests" ON market_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON market_requests;
DROP POLICY IF EXISTS "Public Read Request Items" ON market_request_items;
DROP POLICY IF EXISTS "Users can insert request items" ON market_request_items;
DROP POLICY IF EXISTS "Public Read Bids" ON market_bids;
DROP POLICY IF EXISTS "Users can insert bids" ON market_bids;

-- 3. Create permissive policies for Development (or specific strict ones)

-- Market Requests
-- Allow everyone to read requests (or restrict to providers/owners)
CREATE POLICY "Public Read Requests" ON market_requests
FOR SELECT USING (true);

-- Allow authenticated users to create requests
CREATE POLICY "Users can insert own requests" ON market_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Market Request Items
-- Allow everyone to read items
CREATE POLICY "Public Read Request Items" ON market_request_items
FOR SELECT USING (true);

-- Allow users to insert items linked to their requests
-- Note: Simplified check. Ideally check if request_id belongs to user.
CREATE POLICY "Users can insert request items" ON market_request_items
FOR INSERT WITH CHECK (true); 

-- Market Bids
CREATE POLICY "Public Read Bids" ON market_bids
FOR SELECT USING (true);

CREATE POLICY "Users can insert bids" ON market_bids
FOR INSERT WITH CHECK (auth.uid() = provider_id);
