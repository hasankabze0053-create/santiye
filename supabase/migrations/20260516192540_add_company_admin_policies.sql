-- Ensure RLS is active
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_services ENABLE ROW LEVEL SECURITY;

-- Admins can manage companies
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Admins can manage companies" ON public.companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admins can manage company services
DROP POLICY IF EXISTS "Admins can manage company services" ON public.company_services;
CREATE POLICY "Admins can manage company services" ON public.company_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Allow authenticated users to manage their own company services?
-- Wait, the error occurs for Admin, so we definitely need admin policies.
