-- Ensure RLS is active
ALTER TABLE public.renovation_services ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can view active services
DROP POLICY IF EXISTS "Anyone can view active services" ON public.renovation_services;
CREATE POLICY "Anyone can view active services" ON public.renovation_services
    FOR SELECT USING (true);

-- 2. Admins can update
DROP POLICY IF EXISTS "Admins can update services" ON public.renovation_services;
CREATE POLICY "Admins can update services" ON public.renovation_services
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 3. Admins can insert/delete
DROP POLICY IF EXISTS "Admins can manage services" ON public.renovation_services;
CREATE POLICY "Admins can manage services" ON public.renovation_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
