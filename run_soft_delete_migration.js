const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function executeMigration() {
    const sqlStr = `
        BEGIN;

        -- 1. Add columns to profiles
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

        -- 2. Create RPC function for soft deleting a user
        CREATE OR REPLACE FUNCTION public.soft_delete_user()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
            v_user_id uuid;
            v_email text;
            v_dummy_email text;
        BEGIN
            v_user_id := auth.uid();
            IF v_user_id IS NULL THEN
                RAISE EXCEPTION 'Not authenticated';
            END IF;

            -- Get current email
            SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
            
            -- Create dummy email
            v_dummy_email := 'deleted_' || v_user_id || '_' || COALESCE(v_email, 'noemail');

            -- 1. Update auth.users (Change email, ban user)
            -- Banning the user so they cannot login, changing email so they can sign up again.
            UPDATE auth.users 
            SET email = v_dummy_email,
                phone = NULL,
                encrypted_password = '',
                banned_until = '2100-01-01'::timestamp
            WHERE id = v_user_id;

            -- 2. Update profiles
            UPDATE public.profiles
            SET is_deleted = true,
                deleted_at = NOW(),
                email = v_dummy_email,
                phone = NULL,
                user_type = 'individual', -- revert to individual to be safe
                approval_status = 'pending'
            WHERE id = v_user_id;

            -- 3. Delete companies record (if any) to free up tax numbers and company data
            DELETE FROM public.companies WHERE owner_id = v_user_id;
            
            -- 4. Delete active company services
            DELETE FROM public.company_services WHERE company_id IN (SELECT id FROM public.companies WHERE owner_id = v_user_id);
            
            -- Note: We DO NOT delete messages, bids, or requests to comply with legal log retention.
            -- They will just point to a profile where is_deleted = true.
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
        console.log("Migration executed successfully: Added soft delete logic.");
    } catch (err) {
        console.error('SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

executeMigration();
