require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

const defaults = [
    { 
        id: 'highlight_card_urban', 
        screen_id: 'HomeScreen',
        title: 'URBAN Highlight Card',
        sort_order: 1,
        is_visible: true,
        metadata: { 
            type: 'urban', 
            linkedModule: 'KentselDonusum', 
            title1: 'KENTSEL', 
            title2: 'DÖNÜŞÜM', 
            description: 'Arsa veya binanız için müteahhitlerden teklif toplayın.', 
            buttonText: 'Teklif Al', 
            pills: [], 
            themeColors: { title: '#FFFFFF', pillsBorder: '#B8820F', pillsText: '#B8820F', buttonGradientStart: '#B8820F', buttonGradientEnd: '#8C6200' }, 
            textAlignment: 'flex-start', 
            textPositionVertical: 'center', 
            scale: 1, 
            translateX: 20 
        } 
    },
    { 
        id: 'highlight_card_renovation', 
        screen_id: 'HomeScreen',
        title: 'RENOVATION Highlight Card',
        sort_order: 2,
        is_visible: true,
        metadata: { 
            type: 'renovation', 
            linkedModule: 'Renovation', 
            title1: 'TADİLAT / MİMARİ', 
            title2: 'DÖNÜŞÜM', 
            description: 'Evinizin ruhunu mimari dokunuşlarla baştan yaratın.', 
            buttonText: 'Hizmet Al', 
            pills: ['Ev', 'Dükkan', 'Ofis', 'Bakım'], 
            themeColors: { title: '#FFFFFF', pillsBorder: '#B8820F', pillsText: '#B8820F', buttonGradientStart: '#B8820F', buttonGradientEnd: '#8C6200' }, 
            textAlignment: 'flex-start', 
            textPositionVertical: 'center', 
            scale: 1, 
            translateX: 20 
        } 
    },
    { 
        id: 'highlight_card_market', 
        screen_id: 'HomeScreen',
        title: 'MARKET Highlight Card',
        sort_order: 3,
        is_visible: true,
        metadata: { 
            type: 'market', 
            linkedModule: 'Market', 
            title1: 'İNŞAAT', 
            title2: 'MARKETİ', 
            description: 'İnşaat malzemeleri ve yapı ürünlerinde ihtiyacınıza özel; tedarikçilerden rekabetçi teklifler alın.', 
            buttonText: 'Talep Oluştur', 
            pills: ['Beton', 'Demir', 'Seramik', 'Tesisat'], 
            themeColors: { title: '#FFFFFF', pillsBorder: '#B8820F', pillsText: '#B8820F', buttonGradientStart: '#B8820F', buttonGradientEnd: '#8C6200' }, 
            textAlignment: 'flex-start', 
            textPositionVertical: 'center', 
            scale: 1, 
            translateX: 20 
        } 
    },
    { 
        id: 'highlight_card_law', 
        screen_id: 'HomeScreen',
        title: 'LAW Highlight Card',
        sort_order: 4,
        is_visible: true,
        metadata: { 
            type: 'law', 
            linkedModule: 'Hukuk', 
            title1: 'HUKUK', 
            title2: 'DANIŞMANLIĞI', 
            description: 'İnşaat süreçleriniz için yapay zekâ destekli ön analiz ile doğru hukuk hizmetine ulaşın.', 
            buttonText: 'Danışmanlık Al', 
            pills: ['Sözleşme', 'Tapu', 'İmar', 'Uyuşmazlık'], 
            themeColors: { title: '#FFFFFF', pillsBorder: '#B8820F', pillsText: '#B8820F', buttonGradientStart: '#B8820F', buttonGradientEnd: '#8C6200' }, 
            textAlignment: 'flex-start', 
            textPositionVertical: 'center', 
            scale: 1, 
            translateX: 20 
        } 
    }
];

async function seedData() {
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
                    metadata = EXCLUDED.metadata,
                    title = EXCLUDED.title,
                    sort_order = EXCLUDED.sort_order;
            `;
            await client.query(query, [item.id, item.screen_id, item.title, item.sort_order, item.is_visible, item.metadata]);
        }
        console.log("Successfully seeded database with all initial highlight cards.");
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

seedData();
