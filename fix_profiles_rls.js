require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

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
