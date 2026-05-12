import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ⚠️ KANKA: Anahtarlar artık .env dosyasından okunuyor.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// ─── GLOBAL RETRY INTERCEPTOR ────────────────────────────
let isRefreshing = false;
let refreshPromise = null;

const customFetch = async (url, options) => {
    // 1. Orijinal isteği yap
    let response = await fetch(url, options);

    // 2. İstek başarısız olduysa ve hata "401 Unauthorized" (Süresi Dolmuş Token) ise
    // NOT: Sonsuz döngüye girmemek için auth yenileme URL'lerini ('/auth/v1/') hariç tutuyoruz.
    if (response.status === 401 && typeof url === 'string' && !url.includes('/auth/v1/')) {
        console.log('🔄 [Global Interceptor] Token süresi doldu (401), arka planda yenileniyor...');

        if (!isRefreshing) {
            isRefreshing = true;
            // Token yenileme işlemini başlat ve kilitle
            refreshPromise = supabase.auth.refreshSession().finally(() => {
                isRefreshing = false;
            });
        }

        try {
            // Diğer eşzamanlı istekler varsa, aynı yenileme işleminin bitmesini beklerler
            const { data, error } = await refreshPromise;

            if (data?.session) {
                console.log('✅ [Global Interceptor] Token başarıyla yenilendi, istek tekrarlanıyor...');
                
                // Yeni token ile başlıkları (Headers) güncelle
                const newHeaders = new Headers(options?.headers || {});
                newHeaders.set('Authorization', `Bearer ${data.session.access_token}`);

                const newOptions = {
                    ...options,
                    headers: newHeaders,
                };

                // 3. İsteği yeni token ile KULLANICI HİSSETMEDEN otomatik tekrarla
                response = await fetch(url, newOptions);
            } else if (error) {
                console.warn('❌ [Global Interceptor] Token yenileme başarısız:', error.message);
            }
        } catch (e) {
            console.warn('❌ [Global Interceptor] Beklenmeyen hata:', e);
        }
    }

    return response;
};
// ────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
    global: {
        fetch: customFetch,
    }
});
