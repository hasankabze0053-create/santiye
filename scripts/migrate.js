
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
// ⚠️ Using the Transaction Pooler (IPv4 Compatible) as provided by the user
const CONNECTION_STRING = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

async function migrate() {
    console.log('🚀 Starting Supabase Migration Automation...');
    console.log(`📂 Migrations Directory: ${MIGRATIONS_DIR}`);

    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }, // Required for Supabase connection
        connectionTimeoutMillis: 10000,
    });

    try {
        console.log('🔌 Connecting to Supabase (Transaction Pooler)...');
        await client.connect();
        console.log('✅ Connected successfully!');

        // 1. Create migrations table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // 2. Get list of applied migrations
        const { rows: appliedRows } = await client.query('SELECT name FROM _migrations');
        const appliedMigrations = new Set(appliedRows.map(row => row.name));

        // 3. Get list of migration files from disk
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Ensure chronological order

        console.log(`📝 Found ${files.length} migration files.`);

        let newMigrationsCount = 0;

        for (const file of files) {
            if (appliedMigrations.has(file)) {
                // console.log(`Correlation: ${file} already applied. Skipping.`);
                continue;
            }

            console.log(`▶️ Applying migration: ${file}...`);
            const filePath = path.join(MIGRATIONS_DIR, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`   ✅ Success: ${file}`);
                newMigrationsCount++;
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`   ❌ FAILURE: ${file}`);
                console.error(`   ⚠️ Error details: ${err.message}`);
                console.error('   🛑 Migration process stopped.');
                process.exit(1);
            }
        }

        if (newMigrationsCount === 0) {
            console.log('🎉 Database is already up to date!');
        } else {
            console.log(`🎉 Successfully applied ${newMigrationsCount} new migrations!`);
        }

    } catch (err) {
        console.error('❌ Fatal Error:', err.message);
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Connection closed.');
    }
}

migrate();
