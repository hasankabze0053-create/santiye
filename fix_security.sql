-- 1. Enable RLS on Showcase Tables
ALTER TABLE public.renovation_showcase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read renovation_showcase" ON public.renovation_showcase FOR SELECT USING (true);

ALTER TABLE public.transformation_showcase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read transformation_showcase" ON public.transformation_showcase FOR SELECT USING (true);

ALTER TABLE public.market_showcase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read market_showcase" ON public.market_showcase FOR SELECT USING (true);

-- 2. Drop bad RLS on market_request_items
DROP POLICY IF EXISTS "Public items" ON public.market_request_items;

-- 3. Fix Public Bucket Allows Listing
DROP POLICY IF EXISTS "Anyone can view market images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Market Images" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view construction documents" ON storage.objects;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
