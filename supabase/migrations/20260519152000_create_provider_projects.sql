CREATE TABLE IF NOT EXISTS public.provider_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.provider_projects ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Anyone can view provider projects" 
    ON public.provider_projects FOR SELECT 
    USING (true);

CREATE POLICY "Providers can insert their own projects" 
    ON public.provider_projects FOR INSERT 
    WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their own projects" 
    ON public.provider_projects FOR UPDATE 
    USING (auth.uid() = provider_id) 
    WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can delete their own projects" 
    ON public.provider_projects FOR DELETE 
    USING (auth.uid() = provider_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_provider_projects_provider_id ON public.provider_projects(provider_id);
