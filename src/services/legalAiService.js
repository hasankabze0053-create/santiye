/**
 * legalAiService.js
 * SantiyePro — Hukuki Karar Motoru
 * Gerçek Gemini API entegrasyonu hazır; şimdilik akıllı mock çalışır.
 */

const MOCK_RESPONSES = {
  default: {
    kategori: 'Sözleşme & Hakediş',
    aciliyet_skoru: 7,
    kisa_ozet: 'Sözleşmedeki cezai şart oranı yasal sınırı aşıyor ve hakediş ödeme takvimi belirsiz bırakılmış. Acilen avukat incelemesi gerekiyor.',
    kritik_riskler: [
      'Cezai şart oranı (%25) yasal sınırın üzerinde (TBK Md. 182)',
      'Hakediş ödeme takvimi tek taraflı değiştirilebilir nitelikte',
      'Taşeron fesih maddesinde yüklenici aleyhine tek yönlü hüküm',
      'Eksik iş tespiti için bağımsız keşif hükmü bulunmuyor',
    ],
    kanun_maddeleri: [
      { kanun: 'Türk Borçlar Kanunu', no: null, madde: '182', konu: 'Cezai Şart Üst Sınırı' },
      { kanun: 'Türk Borçlar Kanunu', no: null, madde: '470', konu: 'İstisna Sözleşmesi (Eser)' },
      { kanun: 'İş Sağlığı & Güvenliği Kanunu', no: '6331', madde: '4', konu: 'İşveren Yükümlülükleri' },
    ],
    gereken_belgeler: [
      'İmzalı sözleşmenin tamamı (sayfa 2–5 eksik)',
      'Hakediş raporları (son 3 dönem)',
      'SGK hizmet dökümü ve prim ödeme belgeleri',
      'Metraj cetveli ve iş programı',
    ],
    onerilen_aksiyonlar: [
      '48 saat içinde noter kanalıyla ihtarname gönderin',
      'Sözleşmedeki cezai şart maddesini inşaat hukuku uzmanına inceletin',
      'Tüm yazışmaları kayıt altına alın; sözlü anlaşmalar geçersiz sayılabilir',
      'Hakediş tahsilatını durdurmak yerine ihtirazi kayıtla alın',
    ],
    taraflar: { yuklenici: 'Kullanıcı Şirketi', taseron: 'Tespit edilemedi', idare: 'Belirtilmemiş' },
    sos_modu: false,
    avukat_kategorisi: ['inşaat_hukuku', 'sozlesme'],
  },
  sos: {
    kategori: 'İş Kazası & SGK',
    aciliyet_skoru: 10,
    kisa_ozet: 'ACİL: Şantiyede iş kazası veya baskın tespit edildi. Derhal hukuki koruma altına alınmalısınız.',
    kritik_riskler: [
      'İş kazası 3 iş günü içinde SGK\'ya bildirilmezse ağır idari para cezası',
      'Kaza anı tutanağı hazırlanmadan şantiyeyi terk etmeyin',
      'Sosyal medya ve basına açıklama yapmayın — hukuki süreç zarar görebilir',
      'Yaralı işçinin beyanı resmi kayıt altına alınmalı',
    ],
    kanun_maddeleri: [
      { kanun: 'SGK Kanunu', no: '5510', madde: '21', konu: 'İş Kazası Bildirimi (3 gün)' },
      { kanun: 'İş Sağlığı & Güvenliği Kanunu', no: '6331', madde: '13', konu: 'Çalışanın Hakları' },
      { kanun: 'İş Sağlığı & Güvenliği Kanunu', no: '6331', madde: '26', konu: 'İdari Para Cezaları' },
      { kanun: 'Türk Ceza Kanunu', no: '5237', madde: '85', konu: 'Taksirle Yaralama/Öldürme' },
    ],
    gereken_belgeler: [
      'Kaza anı tutanağı (VİYOLAN ZAMANDA düzenlenmiş)',
      'İşçinin SGK sigortalılık belgesi',
      'Şantiye Güvenlik Planı (İSG Belgesi)',
      'Fotoğraflı kaza yeri tespiti',
      'Tanık ifadeleri (yazılı)',
    ],
    onerilen_aksiyonlar: [
      'Şu an avukat ile görüşün — bu mesajı avukatınıza iletin',
      'SGK\'ya 3 iş günü içinde kaza bildirimi yapın (e-Devlet)',
      'Kaza yerini değiştirmeyin, fotoğraf ve video alın',
      'Yaralıya ilk yardım yapın, 112\'yi arayın',
    ],
    taraflar: { yuklenici: 'Kullanıcı Şirketi', taseron: 'Tespit edilemedi', idare: 'SGK' },
    sos_modu: true,
    avukat_kategorisi: ['is_kazasi', 'sgk'],
  },
  hakedeş: {
    kategori: 'Sözleşme & Hakediş',
    aciliyet_skoru: 8,
    kisa_ozet: 'Hakediş ödemesi gecikiyor ve haksız kesintiler yapılıyor. Yasal faiz işletme hakkınız mevcut.',
    kritik_riskler: [
      'Hakediş gecikmesi için yasal faiz hakkı doğuyor (TBK Md. 120)',
      'Haksız kesintiler için yazılı itiraz yapılmadan kabul etmiş sayılırsınız',
      'Ödeme yapılmadan işi durdurmak sözleşme ihlaline yol açabilir',
    ],
    kanun_maddeleri: [
      { kanun: 'Türk Borçlar Kanunu', no: null, madde: '120', konu: 'Temerrüt Faizi' },
      { kanun: 'Türk Borçlar Kanunu', no: null, madde: '112', konu: 'Borca Aykırılık' },
    ],
    gereken_belgeler: [
      'Hakediş belgesi ve imzalı suretleri',
      'Kesinti yapılan kalemlerin dökümü',
      'Yazışma kayıtları (e-posta, WhatsApp)',
    ],
    onerilen_aksiyonlar: [
      'İhtirazi kayıtla (kabul etmiyorum şerhiyle) imzalayın',
      'Resmi yazılı itiraz belgesi gönderin (3 iş günü içinde)',
      'Arabuluculuk başvurusu yapın (dava öncesi zorunlu)',
    ],
    taraflar: { yuklenici: 'Kullanıcı Şirketi', taseron: 'Tespit edilemedi', idare: 'İşveren/Müteahhit' },
    sos_modu: false,
    avukat_kategorisi: ['inşaat_hukuku', 'sozlesme'],
  },
};

/**
 * Girdi metnini analiz eder, AI benzeri keyword tespiti yapar.
 * Gerçek entegrasyonda burası Supabase Edge Function çağrısına dönüşür.
 */
export async function analyzeLegalCase({ text, userId }) {
  // Simüle edilmiş API gecikmesi (premium UX için)
  await new Promise(resolve => setTimeout(resolve, 3200));

  const lowerText = text.toLowerCase();

  // SOS tespiti
  const sosKeywords = ['kaza', 'yaralı', 'ölüm', 'baskın', 'ambulans', 'hastane', 'acil', 'acelen', 'kapatıldık', 'mühürlendi'];
  if (sosKeywords.some(k => lowerText.includes(k))) {
    return { success: true, data: MOCK_RESPONSES.sos };
  }

  // Hakediş tespiti
  const hakedesKeywords = ['hakediş', 'ödeme', 'para yatmadı', 'kesinti', 'ücret', 'tahsilat'];
  if (hakedesKeywords.some(k => lowerText.includes(k))) {
    return { success: true, data: MOCK_RESPONSES.hakedeş };
  }

  // Default analiz
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
