-- Update sort order for Urban Transformation Screen sections
UPDATE screen_section_config
SET sort_order = 10
WHERE id = 'urban_construction_quotes';

UPDATE screen_section_config
SET sort_order = 20
WHERE id = 'urban_expert_qa';
