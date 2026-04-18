const { Client } = require('pg');

const CONNECTION_STRING = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function deploy() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🚀 Asansör Bakım Modülü Veritabanı Kurulumu Başlatılıyor...');
        await client.connect();

        // 1. Tabloyu oluştur (eğer yoksa)
        console.log('Creating table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.elevator_requests (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
                city TEXT NOT NULL,
                district TEXT NOT NULL,
                phone TEXT NOT NULL,
                fault_type TEXT DEFAULT 'Asansör Arıza Bakım',
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // 2. RLS Aktifleştir
        console.log('Enabling RLS...');
        await client.query(`ALTER TABLE public.elevator_requests ENABLE ROW LEVEL SECURITY;`);

        // 3. Politikaları ekle (idempotent)
        console.log('Adding policies...');
        await client.query(`
            DROP POLICY IF EXISTS "Users can insert elevator requests" ON public.elevator_requests;
            CREATE POLICY "Users can insert elevator requests"
            ON public.elevator_requests FOR INSERT
            WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

            DROP POLICY IF EXISTS "Users can view own elevator requests" ON public.elevator_requests;
            CREATE POLICY "Users can view own elevator requests"
            ON public.elevator_requests FOR SELECT
            USING (auth.uid() = user_id);

            DROP POLICY IF EXISTS "Admins can view all elevator requests" ON public.elevator_requests;
            CREATE POLICY "Admins can view all elevator requests"
            ON public.elevator_requests FOR SELECT
            USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
            );
        `);

        // 4. Renovation Services tablosunda ID'yi ve başlığı düzelt
        console.log('Updating renovation_services table...');
        const res = await client.query(`
            UPDATE public.renovation_services 
            SET title = 'Asansör Bakımı', service_id = 'elevator_maintenance'
            WHERE title ILIKE '%asansör%' OR service_id = 'elevator' OR service_id = 'elevator_maintenance';
        `);
        console.log(`Updated ${res.rowCount} rows in renovation_services.`);

        // Eğer satır hiç yoksa (idempotent seed)
        if (res.rowCount === 0) {
            console.log('Inserting default elevator service row...');
            await client.query(`
                INSERT INTO public.renovation_services (service_id, title, subtitle, icon, display_order, is_active)
                VALUES ('elevator_maintenance', 'Asansör Bakımı', 'Aylık periyodik bakım ve arıza servisi', 'elevator-passenger', 40, true)
                ON CONFLICT (service_id) DO UPDATE 
                SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle;
            `);
        }

        console.log('✅ Veritabanı kurulumu BAŞARIYLA tamamlandı!');

        // 5. Doğrulama
        console.log('Verifying...');
        const verifyRes = await client.query("SELECT * FROM information_schema.tables WHERE table_name = 'elevator_requests'");
        if (verifyRes.rowCount > 0) {
            console.log('Elevator requests table exists.');
        } else {
            throw new Error('Table verification failed!');
        }

    } catch (err) {
        console.error('❌ KURULUM HATASI:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

deploy();
