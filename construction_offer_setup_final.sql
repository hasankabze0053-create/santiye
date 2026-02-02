-- ==========================================
-- 1. TABLOLAR (TABLES)
-- ==========================================

-- Construction Requests (Talepler)
create table if not exists public.construction_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  city text not null default 'İstanbul',
  district text not null,
  neighborhood text not null,
  ada text not null,
  parsel text not null,
  pafta text,
  full_address text not null,
  deed_image_url text,
  status text not null default 'pending', -- pending, offers_received, completed, cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Construction Offers (Teklifler)
create table if not exists public.construction_offers (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.construction_requests not null,
  contractor_id uuid references auth.users not null,
  offer_details text not null,
  price_estimate numeric,
  status text not null default 'pending', -- pending, accepted, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. GÜVENLİK POLİTİKALARI (RLS)
-- ==========================================

-- Önce varolan politikaları temizleyelim (Çakışma olmasın)
drop policy if exists "Users can view own requests" on public.construction_requests;
drop policy if exists "Users can insert own requests" on public.construction_requests;
drop policy if exists "Authenticated users can view open requests" on public.construction_requests;
drop policy if exists "Contractors can view own offers" on public.construction_offers;
drop policy if exists "Authenticated users can insert offers" on public.construction_offers;
drop policy if exists "Users can view offers for their requests" on public.construction_offers;

-- Tablolarda RLS Aktifleştir
alter table public.construction_requests enable row level security;
alter table public.construction_offers enable row level security;

-- A) REQUESTS POLICIES
-- 1. Kullanıcı kendi oluşturduğu talebi görebilir
create policy "Users can view own requests"
  on public.construction_requests for select
  using (auth.uid() = user_id);

-- 2. Kullanıcı yeni talep ekleyebilir
create policy "Users can insert own requests"
  on public.construction_requests for insert
  with check (auth.uid() = user_id);

-- 3. MÜTEAHHİTLER (Giriş yapmış herkes) açık talepleri görebilir
-- (Bu sayede Müteahhit Panelinde gözükür)
create policy "Authenticated users can view open requests"
  on public.construction_requests for select
  using (
    auth.role() = 'authenticated' 
    and (status = 'pending' or status = 'offers_received')
  );

-- B) OFFERS POLICIES
-- 1. Müteahhit kendi verdiği teklifi görür
create policy "Contractors can view own offers"
  on public.construction_offers for select
  using (auth.uid() = contractor_id);

-- 2. Müteahhit (Giriş yapmış herkes) teklif verebilir
create policy "Authenticated users can insert offers"
  on public.construction_offers for insert
  with check (auth.role() = 'authenticated');

-- 3. Talep sahibi, kendine gelen teklifleri görebilir
create policy "Users can view offers for their requests"
  on public.construction_offers for select
  using (
    exists (
      select 1 from public.construction_requests
      where public.construction_requests.id = public.construction_offers.request_id
      and public.construction_requests.user_id = auth.uid()
    )
  );
