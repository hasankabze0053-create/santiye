-- Create transformation_showcase table
CREATE TABLE IF NOT EXISTS transformation_showcase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    subtitle TEXT,
    tag TEXT,
    button_text TEXT DEFAULT 'DETAYLAR',
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
INSERT INTO transformation_showcase (title, subtitle, tag, image_ref, is_local, sort_order)
VALUES 
('DEVLET DESTEĞİYLE', 'Evinizi yerinde, güvenle ve devlet desteğiyle yenileyin.', 'KENTSEL DÖNÜŞÜM', 'urban_transformation_hero', TRUE, 10);
