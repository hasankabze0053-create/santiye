const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

const defaults = [
    { id: 'category_chip_urban', title: 'KENTSEL DÖNÜŞÜMm', metadata: { route: 'KentselDonusum' }, is_visible: true, sort_order: 1, screen_id: 'HomeScreen' },
    { id: 'category_chip_renovation', title: 'TADİLAT', metadata: { route: 'Renovation' }, is_visible: true, sort_order: 2, screen_id: 'HomeScreen' },
    { id: 'category_chip_market', title: 'MARKET', metadata: { route: 'Market' }, is_visible: true, sort_order: 3, screen_id: 'HomeScreen' },
    { id: 'category_chip_law', title: 'HUKUK', metadata: { route: 'Hukuk' }, is_visible: true, sort_order: 4, screen_id: 'HomeScreen' }
];

async function seedChips() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        for (const item of defaults) {
            const query = `
                INSERT INTO public.screen_section_config (id, screen_id, title, sort_order, is_visible, metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO UPDATE SET 
                    title = EXCLUDED.title,
                    metadata = EXCLUDED.metadata,
                    sort_order = EXCLUDED.sort_order;
            `;
            await client.query(query, [item.id, item.screen_id, item.title, item.sort_order, item.is_visible, item.metadata]);
        }
        console.log("Successfully seeded database with all category chips.");
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

seedChips();
