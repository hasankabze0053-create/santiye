const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function executeMigration() {
    const sqlStr = `
        BEGIN;

        -- 1. Add archived_company_data column to profiles
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS archived_company_data JSONB DEFAULT NULL;

        -- 2. Update RPC function for soft deleting a user to include archiving
        CREATE OR REPLACE FUNCTION public.soft_delete_user()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
            v_user_id uuid;
            v_email text;
            v_dummy_email text;
            v_company_data jsonb;
        BEGIN
            v_user_id := auth.uid();
            IF v_user_id IS NULL THEN
                RAISE EXCEPTION 'Not authenticated';
            END IF;

            -- Get current email
            SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
            
            -- Create dummy email
            v_dummy_email := 'deleted_' || v_user_id || '_' || COALESCE(v_email, 'noemail');

            -- 1. Archive company data if it exists
            SELECT row_to_json(c)::jsonb INTO v_company_data 
            FROM public.companies c 
            WHERE c.owner_id = v_user_id LIMIT 1;

            -- 2. Update auth.users (Change email, ban user)
            UPDATE auth.users 
            SET email = v_dummy_email,
                phone = NULL,
                encrypted_password = '',
                banned_until = '2100-01-01'::timestamp
            WHERE id = v_user_id;

            -- 3. Update profiles
            UPDATE public.profiles
            SET is_deleted = true,
                deleted_at = NOW(),
                email = v_dummy_email,
                phone = NULL,
                user_type = 'individual',
                approval_status = 'pending',
                archived_company_data = COALESCE(v_company_data, archived_company_data) -- Save archive
            WHERE id = v_user_id;

            -- 4. Delete active company services
            DELETE FROM public.company_services WHERE company_id IN (SELECT id FROM public.companies WHERE owner_id = v_user_id);

            -- 5. Delete companies record to free up tax numbers
            DELETE FROM public.companies WHERE owner_id = v_user_id;
            
        END;
        $$;

        COMMIT;
    `;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query(sqlStr);
        console.log("Migration executed successfully: Added company archiving logic.");
    } catch (err) {
        console.error('SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

executeMigration();
