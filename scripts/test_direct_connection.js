const { Client } = require('pg');

const connectionString = 'postgresql://postgres:KzCS1903.07.@db.nxsjokupnsaeemtnlexf.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Supabase requires SSL, but we might need to trust the cert
    connectionTimeoutMillis: 10000
});

async function testConnection() {
    console.log('Testing direct connection to:', connectionString.replace(/:[^:/@]+@/, ':****@')); // Hide password in log
    try {
        await client.connect();
        console.log('✅ SUCCESS: Connected directly!');
        const res = await client.query('SELECT NOW()');
        console.log('Server Time:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('❌ Direct connection failed:', err.message);
        process.exit(1);
    }
}

testConnection();
