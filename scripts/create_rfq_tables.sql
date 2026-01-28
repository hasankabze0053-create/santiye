-- 1. Satıcı/Hizmet Veren Profilleri (Providers)
-- Mevcut users tablosuna ek detaylar
CREATE TABLE providers (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  company_name TEXT,
  phone TEXT,
  specialties JSONB, -- Ör: ["Market", "Kiralama"]
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Talep Ana Tablosu (Requests)
-- Kullanıcının oluşturduğu talep sepeti
CREATE TABLE market_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT, -- Ör: "Şantiye Demir İhtiyacı"
  status TEXT DEFAULT 'OPEN', -- OPEN, CLOSED, COMPLETED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Talep Kalemleri (Items)
-- Sepetteki her bir satır
CREATE TABLE market_request_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES market_requests(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity TEXT, -- Ör: "10 Ton"
  details TEXT
);

-- 4. Teklifler (Bids)
-- Satıcıların verdiği fiyatlar
CREATE TABLE market_bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES market_requests(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id),
  price DECIMAL(12, 2), -- Toplam Fiyat
  currency TEXT DEFAULT 'TRY',
  notes TEXT,
  status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GÜVENLİK POLİTİKALARI (RLS)
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_bids ENABLE ROW LEVEL SECURITY;

-- Herkes her şeyi okuyabilsin (Geliştirme aşaması için gevşek politika)
-- Prodüksiyonda: "Sadece kendi talebini gör" yapılmalı.
CREATE POLICY "Public Read Providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Public Read Requests" ON market_requests FOR SELECT USING (true);
CREATE POLICY "Public Read Request Items" ON market_request_items FOR SELECT USING (true);
CREATE POLICY "Public Read Bids" ON market_bids FOR SELECT USING (true);

-- Yazma izinleri (Basit)
CREATE POLICY "Insert Providers" ON providers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Insert Requests" ON market_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Insert Items" ON market_request_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert Bids" ON market_bids FOR INSERT WITH CHECK (true);
