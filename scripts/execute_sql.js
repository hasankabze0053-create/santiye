const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function executeSql(sqlFile) {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log(`Executing SQL from: ${sqlFile}`);
        const sql = fs.readFileSync(sqlFile, 'utf8');
        await client.connect();
        
        // Split by semicolon and run each statement if needed, or just run the whole thing
        // Supabase migrations usually have multiple statements.
        await client.query(sql);
        
        console.log('✅ SQL execution successful!');
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
        if (err.where) console.error('Where:', err.where);
        process.exit(1);
    } finally {
        await client.end();
    }
}

const targetFile = process.argv[2];
if (!targetFile) {
    console.error('Usage: node execute_sql.js <path_to_sql_file>');
    process.exit(1);
}

executeSql(path.resolve(targetFile));
