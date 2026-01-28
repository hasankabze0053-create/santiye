-- 1. Nakliye Talepleri (Transport Requests)
CREATE TABLE transport_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  
  -- Rota
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  distance TEXT, -- Ör: 45 km
  duration TEXT, -- Ör: 50 dk
  
  -- Yük Detayları
  load_type TEXT, -- Ör: Paletli, Dökme
  weight TEXT, -- Ör: 500 kg
  load_details TEXT, -- Ör: Vinç gerekir
  
  -- Araç
  vehicle_type TEXT, -- Ör: Kamyonet, Tır
  
  status TEXT DEFAULT 'OPEN', -- OPEN, ASSIGNED, COMPLETED, CANCELLED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Nakliye Teklifleri (Transport Bids)
CREATE TABLE transport_bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES transport_requests(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id),
  
  price DECIMAL(12, 2),
  notes TEXT,
  
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GÜVENLİK (RLS)
ALTER TABLE transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_bids ENABLE ROW LEVEL SECURITY;

-- Politikalar
CREATE POLICY "Public Read Transport Requests" ON transport_requests FOR SELECT USING (true);
CREATE POLICY "Insert Transport Requests" ON transport_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public Read Transport Bids" ON transport_bids FOR SELECT USING (true);
CREATE POLICY "Insert Transport Bids" ON transport_bids FOR INSERT WITH CHECK (true);
