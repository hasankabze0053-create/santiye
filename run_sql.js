require('dotenv').config({ path: '.env' });
const { Client } = require('pg');
const fs = require('fs');

const connectionString = process.env.SUPABASE_DB_URL;

async function executeFile() {

    const sqlStr = `
        BEGIN;

        CREATE TABLE IF NOT EXISTS public.provider_projects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            photos TEXT[] DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.provider_projects ENABLE ROW LEVEL SECURITY;

        -- Create Policies
        DROP POLICY IF EXISTS "Anyone can view provider projects" ON public.provider_projects;
        CREATE POLICY "Anyone can view provider projects" 
            ON public.provider_projects FOR SELECT 
            USING (true);

        DROP POLICY IF EXISTS "Providers can insert their own projects" ON public.provider_projects;
        CREATE POLICY "Providers can insert their own projects" 
            ON public.provider_projects FOR INSERT 
            WITH CHECK (auth.uid() = provider_id);

        DROP POLICY IF EXISTS "Providers can update their own projects" ON public.provider_projects;
        CREATE POLICY "Providers can update their own projects" 
            ON public.provider_projects FOR UPDATE 
            USING (auth.uid() = provider_id) 
            WITH CHECK (auth.uid() = provider_id);

        DROP POLICY IF EXISTS "Providers can delete their own projects" ON public.provider_projects;
        CREATE POLICY "Providers can delete their own projects" 
            ON public.provider_projects FOR DELETE 
            USING (auth.uid() = provider_id);

        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_provider_projects_provider_id ON public.provider_projects(provider_id);

        COMMIT;
    `;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(sqlStr);
        console.log("Migration successful");
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

executeFile();
