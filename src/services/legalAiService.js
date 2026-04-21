/**
 * legalAiService.js
 * SantiyePro — Hukuki Karar Motoru
 * Gerçek Gemini API entegrasyonu hazır; şimdilik akıllı mock çalışır.
 */

const MOCK_RESPONSES = {
  default: {
    kategori: 'Genel Analiz',
    aciliyet_skoru: 5,
    kisa_ozet: 'Vaka inceleniyor. Net bir hukuki analiz için lütfen durumunuzu daha detaylı açıklayın.',
    kritik_riskler: [
      'Belirsiz sözleşme hükümleri hak kaybına yol açabilir',
      'Yazılı bildirim eksikliği ispat sürecini zorlaştırabilir',
    ],
    kanun_maddeleri: [
      { kanun: 'Türk Borçlar Kanunu', no: null, madde: 'Genel Hükümler', konu: 'Sözleşme Serbestisi' },
    ],
    gereken_belgeler: [
      'İmzalı sözleşme metni',
      'Varsa ilgili yazışmalar',
    ],
    onerilen_aksiyonlar: [
      'Durumu tüm detaylarıyla kayıt altına alın',
      'Kesin bir hukuki yol haritası için sistem üzerinden avukatınıza bağlanın',
    ],
    taraflar: { yuklenici: 'Belirtilmedi', taseron: 'Belirtilmedi', idare: 'Belirtilmedi' },
    sos_modu: false,
    avukat_kategorisi: ['inşaat_hukuku'],
    yetersiz_bilgi: true, // Mock her zaman daha fazla detay isteyebilir
  },
  sos: {
    kategori: 'Acil Durum / İş Kazası',
    aciliyet_skoru: 10,
    kisa_ozet: 'KRİTİK: Acil müdahale gerektiren bir durum tespit edildi.',
    kritik_riskler: [
      'Yasal bildirim sürelerinin kaçırılması riski',
      'Olay yeri koruma ve delil tespiti eksikliği',
    ],
    kanun_maddeleri: [
      { kanun: 'İSG Kanunu', no: '6331', madde: 'Genel', konu: 'İş Kazası Bildirimi' },
    ],
    gereken_belgeler: [
      'Olay anı tutanakları',
      'Resmi kurum bildirim evrakları',
    ],
    onerilen_aksiyonlar: [
      'Derhal bir hukuk uzmanı ile görüşün',
      'Resmi makamlar dışındaki taraflara beyan vermeyin',
    ],
    taraflar: { yuklenici: 'Belirtilmedi', taseron: 'Belirtilmedi', idare: 'İlgili Kurumlar' },
    sos_modu: true,
    avukat_kategorisi: ['is_kazasi', 'sgk'],
  }
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_CONFIG } from "../lib/aiConfig";

/**
 * Girdi metnini (ve varsa dosyayı) analiz eder. 
 */
export async function analyzeLegalCase({ text, userId, fileData }) {
  if (!AI_CONFIG.GEMINI_API_KEY || AI_CONFIG.GEMINI_API_KEY === 'BURAYA_API_ANAHTARINI_YAPISTIR') {
    return runMockAnalysis(text);
  }

  try {
    const genAI = new GoogleGenerativeAI(AI_CONFIG.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: AI_CONFIG.MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });

    const promptText = `
      Sen Türkiye'de uzman bir inşaat hukuku danışmanısın. Kullanıcının ilettiği vakayı analiz et.
      
      KRİTİK TALİMATLAR:
      1. ASLA UYDURMA (HALLUCINATION): Kullanıcının metninde veya ilettiği dosyada geçmeyen hiçbir madde numarası, gün sayısı, miktar veya özel şartı kendin uydurma.
      2. BELGE ANALİZİ: Eğer bir belge (PDF veya Görsel) iletildiyse, öncelikle bu belgedeki ibareleri ve maddeleri baz al.
      3. YETERSIZ GİRDİ KONTROLÜ: Eğer metin ve belge içeriği analiz için yetersizse, "yetersiz_bilgi" alanını true yap ve eksik kısımları sor.
      4. YASAL UYARI: Her analizin içine bunun bir "Ön Bilgilendirme" olduğu notunu düş.

      KULLANICI METNİ: "${text}"

      JSON ŞEMASI:
      {
        "kategori": "vaka kategorisi",
        "caseTitle": "Vakaya özel kısa başlık",
        "aciliyet_skoru": 0-10,
        "kisa_ozet": "Vakanın özeti",
        "kritik_riskler": ["Gerçek riskler"],
        "kanun_maddeleri": [{"kanun": "Kanun", "madde": "No", "konu": "Özet"}],
        "gereken_belgeler": ["Eksik evraklar"],
        "onerilen_aksiyonlar": ["Genel adımlar"],
        "yetersiz_bilgi": true/false,
        "avukat_kategorisi": ["inşaat_hukuku", "sozlesme", "is_kazasi", "sgk", "imar", "ceza"],
        "disclaimer": "Bu bir yapay zeka ön analizidir. Avukata danışmalısınız."
      }
    `;

    const contentParts = [promptText];
    
    // Eğer dosya verisi varsa, Gemini'ye input olarak ekle
    if (fileData?.data && fileData?.mimeType) {
      contentParts.push({
        inlineData: {
          data: fileData.data,
          mimeType: fileData.mimeType
        }
      });
    }

    const result = await model.generateContent(contentParts);
    const response = await result.response;
    let jsonText = response.text();
    
    // Gemini bazen yanıtı ```json ... ``` içine koyabiliyor, onu temizleyelim
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(jsonText);

    return { success: true, data };

  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    // Hata durumunda güvenli mock verisine dön
    return runMockAnalysis(text);
  }
}

/**
 * Fallback Mock Mantığı
 */
async function runMockAnalysis(text) {
  // Simüle edilmiş gecikme (Premium UX)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const lowerText = text.toLowerCase();
  const sosKeywords = ['kaza', 'yaralı', 'ölüm', 'baskın', 'ambulans', 'hastane', 'acil', 'acelen', 'kapatıldık', 'mühürlendi'];
  
  if (sosKeywords.some(k => lowerText.includes(k))) {
    return { success: true, data: MOCK_RESPONSES.sos };
  }

  const hakedesKeywords = ['hakediş', 'ödeme', 'para yatmadı', 'kesinti', 'ücret', 'tahsilat'];
  if (hakedesKeywords.some(k => lowerText.includes(k))) {
    return { success: true, data: MOCK_RESPONSES.hakedeş };
  }

  return { success: true, data: MOCK_RESPONSES.default };
}

/**
 * Avukat eşleşmesi: gerçekte Supabase lawyer_matching tablosundan çekilir.
 */
export const MOCK_LAWYERS = [
  {
    id: 'l1',
    name: 'Av. Selin Çelik',
    title: 'İnşaat & Sözleşme Hukuku',
    experience: 12,
    rating: 4.9,
    successRate: 91,
    caseCount: 47,
    badge: 'ŞANTİYE UZMANI',
    badgeColor: '#D4AF37',
    avatar: '👩‍⚖️',
  },
  {
    id: 'l2',
    name: 'Av. Kadir Ermert',
    title: 'İş Hukuku & SGK',
    experience: 9,
    rating: 4.7,
    successRate: 88,
    caseCount: 31,
    badge: 'SGK UZMANI',
    badgeColor: '#60A5FA',
    avatar: '👨‍⚖️',
  },
  {
    id: 'l3',
    name: 'Av. Melek Arslan',
    title: 'İmar & Kentsel Dönüşüm',
    experience: 15,
    rating: 4.8,
    successRate: 94,
    caseCount: 62,
    badge: 'TÜRKİYE GENELİ',
    badgeColor: '#A78BFA',
    avatar: '👩‍⚖️',
  },
];
