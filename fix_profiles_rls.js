const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function executeFile() {
    const sqlStr = `
        -- Allow Admins to update all profiles
        DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
        CREATE POLICY "Admins can update all profiles" ON public.profiles
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            );
    `;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query(sqlStr);
        console.log("Admin policy added to profiles successfully.");
    } catch (err) {
        console.error('SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

executeFile();
