-- Enable RLS for security
alter table if exists market_requests enable row level security;
alter table if exists market_request_items enable row level security;
alter table if exists market_bids enable row level security;

-- 1. MARKET REQUESTS POLICIES
-- Allow any authenticated user to create a request
create policy "Users can create requests"
on market_requests for insert
to authenticated
with check (true);

-- Allow users to view their own requests OR providers to view OPEN requests
create policy "Users view own, Providers view open"
on market_requests for select
to authenticated
using (
  auth.uid() = user_id 
  or 
  status = 'OPEN' 
  or
  auth.uid() in (select provider_id from market_bids where request_id = market_requests.id)
);

-- 2. MARKET REQUEST ITEMS POLICIES
-- Allow insert if the user can insert the parent request
create policy "Users can add items"
on market_request_items for insert
to authenticated
with check (
  exists (
    select 1 from market_requests
    where id = request_id
    and user_id = auth.uid()
  )
);

-- Allow viewing if the user can view the parent request
create policy "View items if parent visible"
on market_request_items for select
to authenticated
using (
  exists (
    select 1 from market_requests
    where id = request_id
  )
);

-- 3. MARKET BIDS POLICIES
-- Allow providers to bid
create policy "Providers can bid"
on market_bids for insert
to authenticated
with check (true);

-- Allow users to view bids on their requests
create policy "View bids"
on market_bids for select
to authenticated
using (
  provider_id = auth.uid()
  or
  exists (
    select 1 from market_requests
    where id = request_id
    and user_id = auth.uid()
  )
);

-- 4. MISSING COLUMNS CHECK (Just in case)
-- Add new columns if they don't exist
do $$
begin
    if not exists (select from information_schema.columns where table_name = 'market_requests' and column_name = 'payment_method') then
        alter table market_requests add column payment_method text;
    end if;

    if not exists (select from information_schema.columns where table_name = 'market_bids' and column_name = 'payment_terms') then
        alter table market_bids add column payment_terms text;
    end if;

    if not exists (select from information_schema.columns where table_name = 'market_bids' and column_name = 'shipping_included') then
        alter table market_bids add column shipping_included boolean default false;
    end if;
end $$;
