-- Insert default sections for Cost Screen (Maliyet Merkezi)
INSERT INTO public.screen_section_config (screen_id, id, title, is_visible, sort_order)
VALUES 
    ('cost_screen', 'cost_simple', 'HIZLI HESAPLAMA', true, 10),
    ('cost_screen', 'cost_detailed', 'DETAYLI ANALİZ', true, 20),
    ('cost_screen', 'cost_pos', 'POZ SORGULAMA', true, 30)
ON CONFLICT (id) DO NOTHING;
