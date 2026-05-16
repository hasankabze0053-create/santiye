const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function executeFile() {

    const sqlStr = `
        BEGIN;

        -- Create the admin_audit_logs table
        CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
            target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
            action_type TEXT NOT NULL,
            details JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

        -- Create policy for Admins to INSERT
        DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
        CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            );

        -- Create policy for Admins to SELECT (View)
        DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
        CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            );

        COMMIT;
    `;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(sqlStr);
        console.log("Policies:", res.rows);
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

executeFile();
