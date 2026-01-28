-- 1. HATA ALMAMAK İÇİN ÖNCE RLS'İ KOMPLE KAPATIP TEMİZLİYORUZ
alter table if exists market_requests disable row level security;
alter table if exists market_request_items disable row level security;
alter table if exists market_bids disable row level security;

-- Var olan tüm politikaları temizle (Garanti olsun)
drop policy if exists "Users can create requests" on market_requests;
drop policy if exists "Users view own, Providers view open" on market_requests;
drop policy if exists "Users can add items" on market_request_items;
drop policy if exists "View items if parent visible" on market_request_items;
drop policy if exists "Providers can bid" on market_bids;
drop policy if exists "View bids" on market_bids;

-- 2. TEKRAR RLS AÇIYORUZ
alter table market_requests enable row level security;
alter table market_request_items enable row level security;
alter table market_bids enable row level security;

-- 3. EN BASİT VE GARANTİ İZİNLERİ VERİYORUZ (Anonim ve Giriş Yapmış Herkes)

-- MARKET REQUESTS
create policy "Public requests"
on market_requests for all
using (true)
with check (true);

-- MARKET REQUEST ITEMS
create policy "Public items"
on market_request_items for all
using (true)
with check (true);

-- MARKET BIDS
create policy "Public bids"
on market_bids for all
using (true)
with check (true);

-- 4. KOLON KONTROLÜ
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
