const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

const sql = `
-- 1. Add missing column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='elevator_requests' AND column_name='assigned_provider_ids') THEN
        ALTER TABLE public.elevator_requests ADD COLUMN assigned_provider_ids UUID[] DEFAULT '{}';
    END IF;
END $$;

-- 2. Add missing policies
-- Allow admins to UPDATE (assign providers)
DROP POLICY IF EXISTS "Admins can update elevator requests" ON public.elevator_requests;
CREATE POLICY "Admins can update elevator requests"
ON public.elevator_requests FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Allow users to DELETE their own requests
DROP POLICY IF EXISTS "Users can delete own elevator requests" ON public.elevator_requests;
CREATE POLICY "Users can delete own elevator requests"
ON public.elevator_requests FOR DELETE
USING (auth.uid() = user_id);

-- Allow admins to DELETE any request
DROP POLICY IF EXISTS "Admins can delete any elevator requests" ON public.elevator_requests;
CREATE POLICY "Admins can delete any elevator requests"
ON public.elevator_requests FOR DELETE
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
`;

async function fixDB() {
    console.log('Connecting to database...');
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Executing SQL...');
        await client.query(sql);
        console.log('SQL executed successfully! The database is now fixed.');
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

fixDB();
