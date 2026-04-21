-- 20260420_create_legal_analyses.sql
-- Hukuki analiz geçmişini saklamak için tablo oluşturma

CREATE TABLE IF NOT EXISTS public.legal_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    kategori TEXT,
    case_title TEXT,
    aciliyet_skoru INTEGER,
    full_data JSONB NOT NULL, -- AI'nın döndüğü tüm JSON verisi
    search_text TEXT -- Kullanıcının girdiği orijinal metin (isteğe bağlı)
);

-- RLS Ayarları
ALTER TABLE public.legal_analyses ENABLE ROW LEVEL SECURITY;

-- Politikalar: Herkes sadece kendi analizini görebilir, ekleyebilir ve silebilir
CREATE POLICY "Users can view their own legal analyses" 
ON public.legal_analyses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own legal analyses" 
ON public.legal_analyses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legal analyses" 
ON public.legal_analyses FOR DELETE 
USING (auth.uid() = user_id);

-- Performans için index
CREATE INDEX IF NOT EXISTS idx_legal_analyses_user_id ON public.legal_analyses(user_id);
