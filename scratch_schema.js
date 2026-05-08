const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function checkSchema() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        
        const reqRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'construction_requests';
        `);
        console.log("construction_requests Columns:", reqRes.rows.map(r => r.column_name).join(', '));
        
        const routeRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE '%rout%';
        `);
        console.log("Routing tables:", routeRes.rows.map(r => r.table_name).join(', '));
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}
checkSchema();
