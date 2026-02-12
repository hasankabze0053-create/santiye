-- Insert new sections for Construction Requests in Cost Screen
INSERT INTO public.screen_section_config (screen_id, id, title, is_visible, sort_order)
VALUES 
    ('cost_screen', 'cost_requests_user', 'TALEPLERİM', true, 40),
    ('cost_requests_contractor', 'cost_requests_contractor', 'MÜTEAHHİT PANELİ', true, 50)
ON CONFLICT (id) DO NOTHING;
