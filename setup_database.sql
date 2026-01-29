-- ⚠️ BU KODU SUPABASE SQL EDITOR'ÜNDE ÇALIŞTIRMAN GEREKİYOR ⚠️

-- 1. ENUM TİPLERİ OLUŞTURMA
-- Tipler varsa hata verebilir, o yüzden yakalamayı deniyoruz veya elle yönetiyoruz.
-- Genelde "IF NOT EXISTS" Enum için doğrudan yok, ama hata verirse sonraki adıma geçer.
DO $$ BEGIN
    CREATE TYPE user_type_enum AS ENUM ('individual', 'corporate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_type_enum AS ENUM (
      'market_seller', 
      'machine_renter', 
      'contractor', 
      'technical_office', 
      'lawyer', 
      'renovation_office', 
      'logistics_company'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE company_status_enum AS ENUM ('pending', 'active', 'rejected', 'banned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 2. profiles TABLOSU (Kullanıcılar)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  user_type user_type_enum DEFAULT 'individual',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);


-- 3. companies TABLOSU (Firmalar)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  tax_number TEXT NOT NULL,
  tax_office TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Companies are viewable by everyone." ON public.companies;
CREATE POLICY "Companies are viewable by everyone." 
  ON public.companies FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own company." ON public.companies;
CREATE POLICY "Users can insert their own company." 
  ON public.companies FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Companies can be updated by owner." ON public.companies;
CREATE POLICY "Companies can be updated by owner." 
  ON public.companies FOR UPDATE 
  USING (auth.uid() = owner_id);


-- 4. company_services TABLOSU (Hizmetler)
CREATE TABLE IF NOT EXISTS public.company_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  service_type service_type_enum NOT NULL,
  status company_status_enum DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, service_type) -- Bir firma aynı hizmeti iki kere ekleyemesin
);

-- RLS: Company Services
ALTER TABLE public.company_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Company services are viewable by everyone." ON public.company_services;
CREATE POLICY "Company services are viewable by everyone." 
  ON public.company_services FOR SELECT 
  USING (true);

-- Services tablosuna ekleme yetkisi
DROP POLICY IF EXISTS "Company owners can add services." ON public.company_services;
CREATE POLICY "Company owners can add services." 
  ON public.company_services FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id AND owner_id = auth.uid()
    )
  );


-- 5. TRİGGER (Otomatik Profil Oluşturma)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'full_name', 
    COALESCE((new.raw_user_meta_data ->> 'user_type')::user_type_enum, 'individual')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı bağla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Not: Handle New User fonksiyonu metadata içinden full_name'i alır.
-- Kayıt olurken (SignUp) options.data.full_name göndermemiz gerekir.
