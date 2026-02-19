-- Create market_ai_requests table
create table if not exists public.market_ai_requests (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) not null,
    original_text text not null,
    parsed_data jsonb default '{}'::jsonb,
    status text default 'pending', -- pending, matched, completed
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create market_ai_matches table
create table if not exists public.market_ai_matches (
    id uuid default gen_random_uuid() primary key,
    request_id uuid references public.market_ai_requests(id) on delete cascade not null,
    seller_id uuid references public.profiles(id) not null,
    match_score integer default 0,
    match_reasons jsonb default '[]'::jsonb,
    is_viewed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.market_ai_requests enable row level security;
alter table public.market_ai_matches enable row level security;

-- Policies for market_ai_requests
create policy "Users can insert their own requests"
on public.market_ai_requests for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view their own requests"
on public.market_ai_requests for select
to authenticated
using (auth.uid() = user_id);

-- Policies for market_ai_matches
-- Sellers can view matches where they are the seller
create policy "Sellers can view their matches"
on public.market_ai_matches for select
to authenticated
using (auth.uid() = seller_id);

-- Buyers can view matches for their requests
create policy "Buyers can view matches for their requests"
on public.market_ai_matches for select
to authenticated
using (
    exists (
        select 1 from public.market_ai_requests
        where market_ai_requests.id = market_ai_matches.request_id
        and market_ai_requests.user_id = auth.uid()
    )
);

-- Indexes for performance
create index if not exists market_ai_requests_user_id_idx on public.market_ai_requests(user_id);
create index if not exists market_ai_matches_request_id_idx on public.market_ai_matches(request_id);
create index if not exists market_ai_matches_seller_id_idx on public.market_ai_matches(seller_id);
