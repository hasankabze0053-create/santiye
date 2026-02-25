// src/utils/MarketCatalog.js

/**
 * Pazar Yeri için "Master Data" Material Kataloğu
 * Bu liste arama (autocomplete) işlemlerinde ve otomatik birim (unit) atamalarında kullanılır.
 * Geliştirilebilir ve ileride veritabanına taşınabilir.
 */
export const MASTER_MATERIALS = [
    // 1. KABA İNŞAAT
    { id: 'kb1', name: 'C20 Hazır Beton', category: 'Kaba İnşaat', unit: 'M3' },
    { id: 'kb2', name: 'C25 Hazır Beton', category: 'Kaba İnşaat', unit: 'M3' },
    { id: 'kb3', name: 'C30 Hazır Beton', category: 'Kaba İnşaat', unit: 'M3' },
    { id: 'kb4', name: 'C35 Hazır Beton', category: 'Kaba İnşaat', unit: 'M3' },
    { id: 'kb5', name: 'C40 Hazır Beton', category: 'Kaba İnşaat', unit: 'M3' },
    { id: 'kb6', name: 'Portland Çimento (50 kg)', category: 'Kaba İnşaat', unit: 'Torba' },
    { id: 'kb7', name: 'Beyaz Çimento (50 kg)', category: 'Kaba İnşaat', unit: 'Torba' },
    { id: 'kb8', name: '8\'lik Nervürlü İnşaat Demiri', category: 'Kaba İnşaat', unit: 'Ton' },
    { id: 'kb9', name: '10\'luk Nervürlü İnşaat Demiri', category: 'Kaba İnşaat', unit: 'Ton' },
    { id: 'kb10', name: '12\'lik Nervürlü İnşaat Demiri', category: 'Kaba İnşaat', unit: 'Ton' },
    { id: 'kb11', name: '14\'lük Nervürlü İnşaat Demiri', category: 'Kaba İnşaat', unit: 'Ton' },
    { id: 'kb12', name: '16\'lık Nervürlü İnşaat Demiri', category: 'Kaba İnşaat', unit: 'Ton' },
    { id: 'kb13', name: 'Çelik Hasır (Q131 / Q188)', category: 'Kaba İnşaat', unit: 'Adet' },
    { id: 'kb14', name: 'Bağ Teli', category: 'Kaba İnşaat', unit: 'Kg' },
    { id: 'kb15', name: '03 Kum (Yıkanmış)', category: 'Kaba İnşaat', unit: 'Ton' },
    { id: 'kb16', name: '05 Kum (Kaba Kum)', category: 'Kaba İnşaat', unit: 'Ton' },
    { id: 'kb17', name: 'Mıcır', category: 'Kaba İnşaat', unit: 'Ton' },
    { id: 'kb18', name: 'Plywood Kalıp Tahtası (18mm)', category: 'Kaba İnşaat', unit: 'Adet' },
    { id: 'kb19', name: 'Ahşap Kereste (5x10)', category: 'Kaba İnşaat', unit: 'M3' },
    { id: 'kb20', name: 'Teleskopik Dikme (Demir Direk)', category: 'Kaba İnşaat', unit: 'Adet' },

    // 2. DUVAR & BÖLME
    { id: 'dv1', name: '8.5\'luk Tuğla (19x19x8.5)', category: 'Duvar', unit: 'Adet' },
    { id: 'dv2', name: '13.5\'luk Tuğla (19x19x13.5)', category: 'Duvar', unit: 'Adet' },
    { id: 'dv3', name: 'Yığma Tuğla', category: 'Duvar', unit: 'Adet' },
    { id: 'dv4', name: 'Gazbeton (Ytong) 10cm', category: 'Duvar', unit: 'Adet' },
    { id: 'dv5', name: 'Gazbeton (Ytong) 15cm', category: 'Duvar', unit: 'Adet' },
    { id: 'dv6', name: 'Gazbeton (Ytong) 20cm', category: 'Duvar', unit: 'Adet' },
    { id: 'dv7', name: 'Bims (Ponza) Blok 15cm', category: 'Duvar', unit: 'Adet' },
    { id: 'dv8', name: 'Bims (Ponza) Blok 20cm', category: 'Duvar', unit: 'Adet' },
    { id: 'dv9', name: 'Standart Alçıpan Levha (Beyaz)', category: 'Duvar', unit: 'Adet' },
    { id: 'dv10', name: 'Suya Dayanıklı Alçıpan Levha (Yeşil)', category: 'Duvar', unit: 'Adet' },
    { id: 'dv11', name: 'Yangına Dayanıklı Alçıpan Levha (Kırmızı)', category: 'Duvar', unit: 'Adet' },
    { id: 'dv12', name: 'Alçıpan Profili (TC / TU)', category: 'Duvar', unit: 'Metre' },

    // 3. YALITIM (İZOLASYON)
    { id: 'yt1', name: 'EPS Isı Yalıtım Levhası (16 Dansite)', category: 'Yalıtım', unit: 'Paket' },
    { id: 'yt2', name: 'XPS Isı Yalıtım Levhası', category: 'Yalıtım', unit: 'Paket' },
    { id: 'yt3', name: 'Taşyünü Mantolama Levhası', category: 'Yalıtım', unit: 'Paket' },
    { id: 'yt4', name: 'Cam Yünü Çatı Şiltesi', category: 'Yalıtım', unit: 'Rulo' },
    { id: 'yt5', name: 'Su Yalıtım Membranı (Arduvazlı)', category: 'Yalıtım', unit: 'Rulo' },
    { id: 'yt6', name: 'Sürme Su İzolasyon Malzemesi (Çift Komponentli)', category: 'Yalıtım', unit: 'Teneke' },
    { id: 'yt7', name: 'Bitüm Astarı', category: 'Yalıtım', unit: 'Teneke' },
    { id: 'yt8', name: 'Mantolama Yapıştırıcısı', category: 'Yalıtım', unit: 'Torba' },
    { id: 'yt9', name: 'Dekoratif Mantolama Sıvası', category: 'Yalıtım', unit: 'Torba' },
    { id: 'yt10', name: 'Mantolama Filesi (160 gr)', category: 'Yalıtım', unit: 'Rulo' },
    { id: 'yt11', name: 'Mantolama Dübeli', category: 'Yalıtım', unit: 'Adet' },

    // 4. İNCE İNŞAAT & BOYA
    { id: 'ic1', name: 'Saten Alçı', category: 'İnce İnşaat', unit: 'Torba' },
    { id: 'ic2', name: 'Sıva Alçısı', category: 'İnce İnşaat', unit: 'Torba' },
    { id: 'ic3', name: 'Kartonpiyer Alçısı', category: 'İnce İnşaat', unit: 'Torba' },
    { id: 'ic4', name: 'Seramik ve Fayans Yapıştırıcısı', category: 'İnce İnşaat', unit: 'Torba' },
    { id: 'ic5', name: 'Fayans Derz Dolgusu (BEYAZ)', category: 'İnce İnşaat', unit: 'Torba' },
    { id: 'ic6', name: 'İç Cephe Silikonlu Plastik Boya (20 Kg)', category: 'İnce İnşaat', unit: 'Teneke' },
    { id: 'ic7', name: 'Dış Cephe Silikonlu Boya (20 Kg)', category: 'İnce İnşaat', unit: 'Teneke' },
    { id: 'ic8', name: 'Tavan Boyası (20 Kg)', category: 'İnce İnşaat', unit: 'Teneke' },
    { id: 'ic9', name: 'Sentetik Yağlı Boya', category: 'İnce İnşaat', unit: 'Teneke' },
    { id: 'ic10', name: 'Boya Astarı', category: 'İnce İnşaat', unit: 'Teneke' },

    // 5. ZEMİN & KAPLAMA
    { id: 'zm1', name: 'Yer Seramiği / Fayans (30x60)', category: 'Zemin', unit: 'm²' },
    { id: 'zm2', name: 'Yer Seramiği / Fayans (60x60)', category: 'Zemin', unit: 'm²' },
    { id: 'zm3', name: 'Granit Seramik (60x120)', category: 'Zemin', unit: 'm²' },
    { id: 'zm4', name: 'Laminat Parke (8mm 32.Sınıf)', category: 'Zemin', unit: 'm²' },
    { id: 'zm5', name: 'Laminat Parke Şiltesi (Kapron)', category: 'Zemin', unit: 'Rulo' },
    { id: 'zm6', name: 'MDF Süpürgelik (8 cm)', category: 'Zemin', unit: 'Metre' },
    { id: 'zm7', name: 'Mermer Basamak / Denizlik', category: 'Zemin', unit: 'Metre' },

    // 6. SIHHİ TESİSAT
    { id: 'ts1', name: 'PPRC Boru (PN20) 20mm', category: 'Tesisat', unit: 'Metre' },
    { id: 'ts2', name: 'PPRC Boru (PN20) 25mm', category: 'Tesisat', unit: 'Metre' },
    { id: 'ts3', name: 'PPRC Dirsek / Te / Manşon', category: 'Tesisat', unit: 'Adet' },
    { id: 'ts4', name: 'PVC Atık Su Borusu (50mm)', category: 'Tesisat', unit: 'Metre' },
    { id: 'ts5', name: 'PVC Atık Su Borusu (100mm)', category: 'Tesisat', unit: 'Metre' },
    { id: 'ts6', name: 'Küresel Vana (1/2" - 3/4")', category: 'Tesisat', unit: 'Adet' },
    { id: 'ts7', name: 'Su Sayacı', category: 'Tesisat', unit: 'Adet' },
    { id: 'ts8', name: 'Gömme Rezervuar Seti', category: 'Tesisat', unit: 'Adet' },
    { id: 'ts9', name: 'Klozet Taşı + Kapak', category: 'Tesisat', unit: 'Adet' },
    { id: 'ts10', name: 'Lavabo (Ayaklı/Tezgahüstü)', category: 'Tesisat', unit: 'Adet' },
    { id: 'ts11', name: 'Banyo / Lavabo Bataryası', category: 'Tesisat', unit: 'Adet' },
    { id: 'ts12', name: 'Duşakabin (Temperli Cam)', category: 'Tesisat', unit: 'Adet' },
    { id: 'ts13', name: 'Havlu Pan Radyatör', category: 'Tesisat', unit: 'Adet' },

    // 7. ELEKTRİK & AYDINLATMA
    { id: 'el1', name: 'NYA Elektrik Kablosu (1.5mm / 2.5mm)', category: 'Elektrik', unit: 'Top' },
    { id: 'el2', name: 'NYM Antigron Kablo (3x2.5mm)', category: 'Elektrik', unit: 'Metre' },
    { id: 'el3', name: 'Spiral Boru (Alev Yaymayan)', category: 'Elektrik', unit: 'Metre' },
    { id: 'el4', name: 'Kangalsız PVC Boru', category: 'Elektrik', unit: 'Metre' },
    { id: 'el5', name: 'Sigorta Otomatı (W Otomat)', category: 'Elektrik', unit: 'Adet' },
    { id: 'el6', name: 'Kaçak Akım Rölesi (30mA / 300mA)', category: 'Elektrik', unit: 'Adet' },
    { id: 'el7', name: 'Sigorta Kutusu / Panosu', category: 'Elektrik', unit: 'Adet' },
    { id: 'el8', name: 'Topraklama Çubuğu (Bakır)', category: 'Elektrik', unit: 'Adet' },
    { id: 'el9', name: 'Sıva Altı Anahtar / Priz (Beyaz)', category: 'Elektrik', unit: 'Adet' },
    { id: 'el10', name: 'Sıva Altı Buat / Kasa', category: 'Elektrik', unit: 'Adet' },
    { id: 'el11', name: 'LED Spot / Glop Aydınlatma', category: 'Elektrik', unit: 'Adet' },

    // 8. ÇATI SISTEMLERI
    { id: 'ct1', name: 'Marsilya Tipi Kiremit', category: 'Çatı', unit: 'Adet' },
    { id: 'ct2', name: 'Mahya Kiremit', category: 'Çatı', unit: 'Adet' },
    { id: 'ct3', name: 'OSB 3 Levha (11mm / 15mm)', category: 'Çatı', unit: 'Adet' },
    { id: 'ct4', name: 'Kumlu Membran / Shingle', category: 'Çatı', unit: 'Paket' },
    { id: 'ct5', name: 'Galvaniz Oluk Boyalı', category: 'Çatı', unit: 'Metre' },
    { id: 'ct6', name: 'Yağmur İniş Borusu (PVC)', category: 'Çatı', unit: 'Metre' },

    // 9. KAPI PENCERE & CEPHE
    { id: 'kp1', name: 'Daire Giriş Çelik Kapı', category: 'Kapı & Pencere', unit: 'Adet' },
    { id: 'kp2', name: 'Amerikan Panel İç Kapı', category: 'Kapı & Pencere', unit: 'Adet' },
    { id: 'kp3', name: 'Melamin / Ahşap Kapı', category: 'Kapı & Pencere', unit: 'Adet' },
    { id: 'kp4', name: 'PVC Pencere (Çift Cam / Isıcam)', category: 'Kapı & Pencere', unit: 'm²' },
    { id: 'kp5', name: 'Alüminyum Giydirme Cephe / Doğrama', category: 'Kapı & Pencere', unit: 'm²' },
    { id: 'kp6', name: 'Cam Balkon Sistemi', category: 'Kapı & Pencere', unit: 'm²' },

    // 10. ALTYAPI & PEYZAJ
    { id: 'ap1', name: 'Kilitli Parke Taşı (Aşık Taşı)', category: 'Altyapı', unit: 'm²' },
    { id: 'ap2', name: 'Beton Bordür Taşı', category: 'Altyapı', unit: 'Metre' },
    { id: 'ap3', name: 'Koruge Boru (Altyapı Drenaj)', category: 'Altyapı', unit: 'Metre' },
    { id: 'ap4', name: 'Pik Döküm Rögar Kapağı', category: 'Altyapı', unit: 'Adet' },
    { id: 'ap5', name: 'Peyzaj Toprağı / Bitkisel Toprak', category: 'Altyapı', unit: 'Kamyon' },
    { id: 'ap6', name: 'Rulo Çim', category: 'Altyapı', unit: 'm²' },

    // 11. HIRDAVAT & NALBURİYE
    { id: 'hr1', name: 'Beton Çivisi (5cm - 10cm)', category: 'Hırdavat', unit: 'Kutu' },
    { id: 'hr2', name: 'Sunta Vidası (Ağaç Vidası)', category: 'Hırdavat', unit: 'Paket' },
    { id: 'hr3', name: 'Plastik Dübel (8\'lik / 10\'luk)', category: 'Hırdavat', unit: 'Paket' },
    { id: 'hr4', name: 'Çelik Dübel (Gömlekli)', category: 'Hırdavat', unit: 'Adet' },
    { id: 'hr5', name: 'Şeffaf Silikon (Dış Cephe/İç Cephe)', category: 'Hırdavat', unit: 'Adet' },
    { id: 'hr6', name: 'Poliüretan Köpük', category: 'Hırdavat', unit: 'Kutu' },
    { id: 'hr7', name: 'Akrilik Mastik', category: 'Hırdavat', unit: 'Kutu' },
    { id: 'hr8', name: 'Kağıt Bant (Maskeleme Bandı)', category: 'Hırdavat', unit: 'Rulo' },
    { id: 'hr9', name: 'İzole Bant (Elektrik)', category: 'Hırdavat', unit: 'Rulo' },
    { id: 'hr10', name: 'Çivi (İnşaat Çivisi 8lik-10luk)', category: 'Hırdavat', unit: 'Kg' },
    { id: 'hr11', name: 'Metal / Ahşap Kesici Taş (Taşlama)', category: 'Hırdavat', unit: 'Adet' },

    // 12. İŞ GÜVENLİĞİ
    { id: 'ig1', name: 'İş Güvenliği Bareti', category: 'İş Güvenliği', unit: 'Adet' },
    { id: 'ig2', name: 'Reflektörlü Yelek', category: 'İş Güvenliği', unit: 'Adet' },
    { id: 'ig3', name: 'Çelik Burunlu İş Ayakkabısı', category: 'İş Güvenliği', unit: 'Çift' },
    { id: 'ig4', name: 'Poliüretan Kaplı İş Eldiveni', category: 'İş Güvenliği', unit: 'Çift' },
    { id: 'ig5', name: 'Paraşüt Tipi Emniyet Kemeri', category: 'İş Güvenliği', unit: 'Adet' },
    { id: 'ig6', name: 'Toz Maskesi (Ventilli / N95)', category: 'İş Güvenliği', unit: 'Adet' },
    { id: 'ig7', name: 'Koruyucu Gözlük', category: 'İş Güvenliği', unit: 'Adet' },

    // 13. MEKANİK & ASANSÖR
    { id: 'mk1', name: 'Yolcu Asansörü (4 Kişilik)', category: 'Mekanik', unit: 'Adet' },
    { id: 'mk2', name: 'Yolcu Asansörü (8 Kişilik)', category: 'Mekanik', unit: 'Adet' },
    { id: 'mk3', name: 'Yük Asansörü (1000 kg)', category: 'Mekanik', unit: 'Adet' },
    { id: 'mk4', name: 'Hidrofor / Pompa Sistemi', category: 'Mekanik', unit: 'Takım' },
    { id: 'mk5', name: 'Doğalgaz Kolon Tesisatı', category: 'Mekanik', unit: 'Takım' },
    { id: 'mk6', name: 'Yoğuşmalı Kombi', category: 'Mekanik', unit: 'Adet' },
    { id: 'mk7', name: 'Panel Radyatör / Petek (60x100)', category: 'Mekanik', unit: 'Adet' },
];

/**
 * Kullanıcı hatalı kelime girdiğinde veya arama yatığında (C30 vs)
 * tüm isim parçacıkları ile kıyaslayarak sonuç getirir.
 */
export const searchMaterials = (query) => {
    if (!query || query.length < 2) return [];

    const lowerQueryParts = query.toLowerCase().trim().split(' ');
    
    const matchedItems = MASTER_MATERIALS.filter(item => {
        const lowerName = item.name.toLowerCase();
        // Girilen alan her iki string'i de ('C30', 'beton') içeriyorsa öner
        return lowerQueryParts.every(part => lowerName.includes(part));
    });

    return matchedItems.slice(0, 6); // Kullanıcıyı yormamak ve max ekranda doluluk
};
