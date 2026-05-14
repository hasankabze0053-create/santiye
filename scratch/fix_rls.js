const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.nxsjokupnsaeemtnlexf',
  password: 'Cs1907Kz0354',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database successfully!');

    const query1 = 'ALTER TABLE construction_requests ENABLE ROW LEVEL SECURITY;';
    const query2 = `
      DO $$ 
      BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
              AND tablename = 'construction_requests' 
              AND policyname = 'Admins can update construction requests'
        ) THEN
            CREATE POLICY "Admins can update construction requests"
            ON construction_requests
            FOR UPDATE
            USING (
              EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid() AND profiles.is_admin = true
              )
            );
        END IF;
      END
      $$;
    `;

    console.log('Enabling RLS on construction_requests...');
    await client.query(query1);
    console.log('RLS Enabled successfully.');
    
    console.log('Creating Admin Update Policy...');
    await client.query(query2);
    console.log('Policy created successfully.');
    
    console.log('ALL DONE! The database is now updated with premium security.');

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await client.end();
  }
}

run();
