-- 1. Fix existing data: Replace literal '\n' string with a space (since titles will wrap naturally or we can use code logic)
UPDATE public.renovation_services
SET title = REPLACE(title, '\n', ' ')
WHERE title LIKE '%\n%';

-- 2. Update the seed-like insert for future-proofing (if someone re-runs it)
-- Note: In SQL, literal '\n' is just two characters. We want them to be spaces.
UPDATE public.renovation_services SET title = 'Anahtar Teslim Tadilat' WHERE service_id = 'turnkey';
UPDATE public.renovation_services SET title = 'Asansör Bakımı' WHERE service_id = 'elevator_maintenance';
UPDATE public.renovation_services SET title = 'Mutfak & Banyo Yenileme' WHERE service_id = 'kitchen';
UPDATE public.renovation_services SET title = 'Akıllı Ev & Tesisat Dönüşümü' WHERE service_id = 'smart';
