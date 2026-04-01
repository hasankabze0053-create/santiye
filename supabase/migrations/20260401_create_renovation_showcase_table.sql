-- Create renovation_showcase table
CREATE TABLE IF NOT EXISTS renovation_showcase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    subtitle TEXT,
    tag TEXT,
    button_text TEXT DEFAULT 'TEKLİF AL',
    image_url TEXT,
    image_ref TEXT, -- For local assets if needed
    is_local BOOLEAN DEFAULT FALSE,
    text_offset_x INTEGER DEFAULT 0,
    text_offset_y INTEGER DEFAULT 0,
    image_scale FLOAT DEFAULT 1.0,
    tag_color TEXT DEFAULT '#D4AF37',
    title_color TEXT DEFAULT '#FFFFFF',
    subtitle_color TEXT DEFAULT '#FFFFFF',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial data
INSERT INTO renovation_showcase (title, tag, image_url, sort_order)
VALUES 
('Modern Salon\nYenileme', 'Minimalist', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop', 10),
('Lüks Mutfak\nTasarımı', 'Avant-Garde', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop', 20),
('Asansör Revizyon\n& Bakım', 'Premium', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop', 30);
