-- Migration to insert missing sections for Urban Transformation Screen

INSERT INTO public.screen_section_config (id, screen_id, title, sort_order, is_visible)
VALUES 
    ('urban_construction_quotes', 'UrbanTransformationScreen', 'İnşaat Teklifleri', 20, true),
    ('urban_process_steps', 'UrbanTransformationScreen', 'Dönüşüm Adımları', 30, true)
ON CONFLICT (id) DO NOTHING;
