-- Consolidated Schema Migration to replace manual SQL scripts

-- 1. MARKETPLACE SCHEMA
CREATE TABLE IF NOT EXISTS public.market_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    image_ref text,
    icon text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.market_subcategories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid REFERENCES public.market_categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    icon text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.market_products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subcategory_id uuid REFERENCES public.market_subcategories(id) ON DELETE SET NULL,
    name text NOT NULL,
    price text, -- stored as text to include currency symbol if needed, or numeric
    spec text,
    options jsonb DEFAULT '{}'::jsonb, -- e.g. {"color": ["red", "blue"], "size": ["M", "L"]}
    image_url text,
    is_local boolean DEFAULT false,
    tag text,
    subtitle text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Market (Public Read)
ALTER TABLE public.market_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Categories" ON public.market_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Subcategories" ON public.market_subcategories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.market_products FOR SELECT USING (true);

-- 2. CONSTRUCTION REQUESTS SCHEMA (Ensuring existence)
CREATE TABLE IF NOT EXISTS public.construction_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    city text,
    district text,
    neighborhood text,
    ada text,
    parsel text,
    pafta text,
    full_address text,
    offer_type text, -- 'anahtar_teslim', 'kat_karsiligi'
    is_campaign_active boolean DEFAULT false,
    status text DEFAULT 'pending', -- pending, active, completed, archived
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.construction_offers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id uuid REFERENCES public.construction_requests(id) ON DELETE CASCADE,
    contractor_id uuid REFERENCES auth.users(id) NOT NULL,
    price_estimate numeric,
    offer_details text,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Construction (Basic safety, full policies in other migrations)
ALTER TABLE public.construction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_offers ENABLE ROW LEVEL SECURITY;

-- 3. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('construction-documents', 'construction-documents', false) -- Private by default
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage (Simplified)
CREATE POLICY "Public Access Market Images" ON storage.objects FOR SELECT
USING (bucket_id = 'market-images');

-- 5. COMPANY SCHEMA (Recovered from usage in AuthService.js)
CREATE TABLE IF NOT EXISTS public.companies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid REFERENCES auth.users(id) NOT NULL,
    company_name text NOT NULL,
    tax_number text,
    tax_office text,
    phone text,
    address text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.company_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    service_type text NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Public Read Company Services" ON public.company_services FOR SELECT USING (true);
