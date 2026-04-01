-- Create market_showcase table
CREATE TABLE IF NOT EXISTS market_showcase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    subtitle TEXT,
    tag TEXT,
    button_text TEXT DEFAULT 'Şimdi En Uygun Fiyatı Öğren',
    image_url TEXT,
    image_ref TEXT, -- For existing local assets
    text_offset_x INTEGER DEFAULT 0,
    text_offset_y INTEGER DEFAULT 0,
    image_scale FLOAT DEFAULT 1.0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial data (mapping from static MarketService)
INSERT INTO market_showcase (title, subtitle, tag, image_ref, sort_order)
VALUES 
('', '', 'EN İYİ FİYAT', 'showcase_concrete', 10),
('EN UYGUN DUVAR ELEMANI', '', 'ÜCRETSİZ TESLİMAT', 'showcase_brick', 20),
('SERAMİKTE %30 NET İNDİRİM', '', 'BÜYÜK FIRSAT', 'showcase_ceramic', 30);
