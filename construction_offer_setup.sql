-- Önce eski politikaları temizleyelim (Hata almamak için)
drop policy if exists "Users can view own requests" on public.construction_requests;
drop policy if exists "Users can insert own requests" on public.construction_requests;
drop policy if exists "Contractors can view own offers" on public.construction_offers;
drop policy if exists "Users can view offers for their requests" on public.construction_offers;
drop policy if exists "Everyone can view pending requests" on public.construction_requests;

-- Varolan tablolar dursun, RLS'leri güncelleyeceğiz.

-- 1. CONSTRUCTION REQUESTS POLICIES
alter table public.construction_requests enable row level security;

-- (A) Kendi talebini görme (Taleplerim ekranı için)
create policy "Users can view own requests"
  on public.construction_requests for select
  using (auth.uid() = user_id);

-- (B) Yeni talep oluşturma
create policy "Users can insert own requests"
  on public.construction_requests for insert
  with check (auth.uid() = user_id);

-- (C) Müteahhitlerin açık talepleri görmesi (Müteahhit Paneli için)
-- Status 'pending' veya 'offers_received' ise herkes (giriş yapmış kullanıcılar) görebilir.
create policy "Authenticated users can view open requests"
  on public.construction_requests for select
  using (
    auth.role() = 'authenticated' 
    and (status = 'pending' or status = 'offers_received')
  );

-- 2. CONSTRUCTION OFFERS POLICIES
alter table public.construction_offers enable row level security;

-- (A) Müteahhit kendi verdiği teklifi görür
create policy "Contractors can view own offers"
  on public.construction_offers for select
  using (auth.uid() = contractor_id);

-- (B) Müteahhit teklif verebilir
create policy "Authenticated users can insert offers"
  on public.construction_offers for insert
  with check (auth.role() = 'authenticated'); -- İleride contractor rolü kontrolü eklenebilir.

-- (C) Kullanıcı (talep sahibi), kendi talebine gelen teklifleri görebilir
create policy "Users can view offers for their requests"
  on public.construction_offers for select
  using (
    exists (
      select 1 from public.construction_requests
      where public.construction_requests.id = public.construction_offers.request_id
      and public.construction_requests.user_id = auth.uid()
    )
  );
