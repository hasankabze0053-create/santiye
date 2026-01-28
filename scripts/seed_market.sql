-- Supabase SQL Editor'de bu scripti çalıştırarak verileri yükleyin.

DO $$
DECLARE
  cat_id UUID;
  sub_id UUID;
BEGIN
  -- Mevcut verileri temizle (İsteğe bağlı, geliştirme aşamasında temizlemek iyidir)
  -- DELETE FROM market_categories; -- Dikkat: Cascade ile her şeyi siler!

  -- 1. KABA YAPI & İNŞAAT
  INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
  VALUES ('KABA YAPI & İNŞAAT', 'Demir, Çimento, Tuğla, Çatı', 'office-building', 'cat_kaba_yapi', 1)
  RETURNING id INTO cat_id;

    -- 1.1 Demir & Çelik
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Demir & Çelik', 'grid', 1)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Nervürlü İnşaat Demiri Ø12', 'Ton', '₺24.500', '{"type": ["Ø8", "Ø10", "Ø12", "Ø16"], "brand": ["İÇDAŞ", "KARDEMİR"]}'),
      (sub_id, cat_id, 'Çelik Hasır Q188', 'Adet', '₺1.450', '{"type": ["Q Tip", "R Tip"]}');

    -- 1.2 Çimento & Bağlayıcılar
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Çimento & Bağlayıcılar', 'cup', 2)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Portland Kompoze Çimento', '50kg Torba', '₺195', '{"brand": ["Nuh", "Akçansa", "Limak"]}'),
      (sub_id, cat_id, 'Beyaz Çimento', '25kg', '₺180', '{"brand": ["Çimsa"]}');

    -- 1.3 Duvar Blokları & Tuğla
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Duvar Blokları & Tuğla', 'wall', 3)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Yığma Tuğla 13.5', 'Adet', '₺6.50', '{"brand": ["Kılıçoğlu", "Işıklar"]}'),
      (sub_id, cat_id, 'Gazbeton G2 Düz', 'Adet', '₺75', '{"size": ["10cm", "15cm", "20cm"]}');

    -- 1.4 Agrega (Kum & Çakıl)
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Agrega (Kum & Çakıl)', 'truck-snowflake', 4)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Sıva Kumu (İnce)', 'Ton', '₺450', '{"origin": ["Şile", "Kemerburgaz"]}'),
      (sub_id, cat_id, 'Mıcır 1 No', 'Ton', '₺420', NULL);


  -- 2. YALITIM & ÇATI
  INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
  VALUES ('YALITIM & ÇATI', 'Mantolama, Su Yalıtımı, Çatı', 'shield-home', 'cat_yalitim_cati', 2)
  RETURNING id INTO cat_id;

    -- 2.1 Isı Yalıtımı
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Isı Yalıtımı (Mantolama)', 'temperature-celsius', 1)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Karbonlu EPS Levha (Gri)', 'Paket', '₺850', '{"thickness": ["3cm", "4cm", "5cm"]}'),
      (sub_id, cat_id, 'Folyolu Taşyünü Levha', 'Paket', '₺1.200', '{"density": ["50kg", "70kg"]}');

    -- 2.2 Su Yalıtımı
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Su Yalıtımı', 'water-off', 2)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Bitümlü Membran PP3000', 'Top (10m)', '₺950', '{"type": ["3mm", "4mm", "Arduazlı"]}'),
      (sub_id, cat_id, 'Sürme İzolasyon (Çimento)', '25kg Set', '₺650', NULL);

    -- 2.3 Çatı Kaplamaları
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Çatı Kaplamaları', 'home-roof', 3)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Marsilya Kiremit', 'Adet', '₺18', '{"material": ["Toprak", "Beton"]}'),
      (sub_id, cat_id, 'Onduline Levha', 'Adet', '₺320', '{"color": ["Kırmızı", "Yeşil", "Siyah"]}'),
      (sub_id, cat_id, 'OSB-3 Levha 11mm', 'Plaka', '₺450', NULL);


  -- 3. KURU YAPI & TAVAN
  INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
  VALUES ('KURU YAPI & TAVAN', 'Alçıpan, Profil, Taşyünü Tavan', 'view-quilt', 'cat_kuru_yapi', 3)
  RETURNING id INTO cat_id;

    -- 3.1 Alçıpan Grubu
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Alçıpan Grubu', 'layers', 1)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Standart Alçıpan (Beyaz)', 'Plaka', '₺140', '{"type": ["Beyaz", "Yeşil (Su)", "Kırmızı (Yangın)"]}'),
      (sub_id, cat_id, 'Boardex Dış Cephe Levhası', 'Plaka', '₺480', NULL);

    -- 3.2 Toz Alçı Grubu
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Toz Alçı Grubu', 'shaker-outline', 2)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Saten Perdah Alçısı', '25kg', '₺110', NULL);

    -- 3.3 Profil & Aksesuar
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Profil & Aksesuar', 'shape-outline', 3)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Tavan U Profili', '3m Boy', '₺45', NULL),
      (sub_id, cat_id, 'Duvar C Profili 75''lik', '3m Boy', '₺65', NULL);

    -- 3.4 Tavan Plakaları
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Tavan Plakaları', 'view-grid', 4)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Karolam Asma Tavan', 'Paket (m²)', '₺180', '{"pattern": ["Yıldızlı", "Kırçıllı"]}');


  -- 4. ZEMİN & DUVAR
  INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
  VALUES ('ZEMİN & DUVAR', 'Seramik, Parke, Doğal Taş', 'floor-plan', 'cat_zemin_duvar', 4)
  RETURNING id INTO cat_id;

    -- 4.1 Seramik & Porselen
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Seramik & Porselen', 'checkerboard', 1)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, '60x120 Granit Seramik', 'm²', '₺650', '{"finish": ["Mat", "Parlak", "Lappato"], "color": ["Gri", "Bej", "Antrasit"]}'),
      (sub_id, cat_id, 'Duvar Fayansı 30x90', 'm²', '₺420', '{"pattern": ["Düz", "Rölyefli"]}');

    -- 4.2 Doğal Taş & Mermer
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Doğal Taş & Mermer', 'diamond-stone', 2)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Afyon Mermer Basamak', 'Metretül', '₺950', NULL),
      (sub_id, cat_id, 'Patlatma Doğal Taş', 'm²', '₺850', NULL);

    -- 4.3 Ahşap Zemin
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order)
    VALUES (cat_id, 'Ahşap Zemin', 'wood', 3)
    RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Laminat Parke 8mm 32.Sınıf', 'm²', '₺380', '{"brand": ["Çamsan", "AGT", "Yıldız"]}'),
      (sub_id, cat_id, 'Süpürgelik 10cm', 'Metretül', '₺65', '{"color": ["Beyaz", "Antrasit", "Ahşap"]}');


  -- 5. BOYA & KİMYASAL
  INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
  VALUES ('BOYA & KİMYASAL', 'Boya, Yapıştırıcı, Silikon', 'format-paint', 'cat_boya_kimyasal', 5)
  RETURNING id INTO cat_id;

    -- 5.1 Boyalar (Items omitted for brevity, adding key ones)
    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Boyalar', 'bucket-outline', 1) RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Silikonlu İç Cephe Boyası', '15Lt', '₺2.200', '{"brand": ["Marshall", "Filli", "Jotun"]}');

    INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Yapıştırıcılar', 'sticker-plus-outline', 2) RETURNING id INTO sub_id;
      INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
      (sub_id, cat_id, 'Seramik Yapıştırıcısı C2TE', '25kg', '₺250', '{"brand": ["Kalekim", "Weber", "Yurtbay"]}');


   -- 6. SIHHİ TESİSAT
   INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
   VALUES ('SIHHİ TESİSAT', 'Boru, Vitrifiye, Batarya', 'water', 'cat_sihhi_tesisat', 6)
   RETURNING id INTO cat_id;

     INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Altyapı (Boru Grubu)', 'pipe', 1) RETURNING id INTO sub_id;
       INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
       (sub_id, cat_id, 'PPRC Temiz Su Borusu Ø20', '4m Boy', '₺45', NULL),
       (sub_id, cat_id, '100''lük Pimaş Boru', '3m Boy', '₺150', NULL);

     INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Vitrifiye & Banyo', 'toilet', 2) RETURNING id INTO sub_id;
       INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
       (sub_id, cat_id, 'Asma Klozet Seti', 'Takım', '₺4.500', '{"brand": ["Vitra", "Serel", "Kale"]}');


   -- 7. ISITMA & DOĞALGAZ
   INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
   VALUES ('ISITMA & DOĞALGAZ', 'Kombi, Radyatör, Klima', 'radiator', 'cat_isitma_dogalgaz', 7)
   RETURNING id INTO cat_id;

     INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Isıtma Sistemleri', 'fire', 1) RETURNING id INTO sub_id;
       INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
       (sub_id, cat_id, 'Tam Yoğuşmalı Kombi 24kW', 'Adet', '₺22.000', '{"brand": ["Vaillant", "DemirDöküm", "ECA"]}'),
       (sub_id, cat_id, 'Panel Radyatör 600x1200', 'Adet', '₺3.200', NULL);


   -- 8. ELEKTRİK & AKILLI EV
   INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
   VALUES ('ELEKTRİK & AKILLI EV', 'Kablo, Priz, Aydınlatma', 'lightning-bolt', 'cat_elektrik', 8)
   RETURNING id INTO cat_id;

     INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Altyapı Kablo & Boru', 'cable-data', 1) RETURNING id INTO sub_id;
       INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
       (sub_id, cat_id, 'NYM (Antigron) Kablo 3x2.5', '100m Top', '₺3.800', '{"brand": ["Öznur", "Hes", "Siemens"]}');

     INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Anahtar & Priz', 'power-socket-eu', 2) RETURNING id INTO sub_id;
       INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
       (sub_id, cat_id, 'Topraklı Priz', 'Adet', '₺85', '{"color": ["Beyaz", "Antrasit", "Ahşap"]}');


   -- 9. HIRDAVAT
   INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
   VALUES ('HIRDAVAT & NALBURİYE', 'El Aletleri, Vida, Bağlantı', 'tools', 'cat_hirdavat', 9)
   RETURNING id INTO cat_id;

     INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Elektrikli El Aletleri', 'drill', 1) RETURNING id INTO sub_id;
       INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
       (sub_id, cat_id, 'Şarjlı Vidalama Seti 18V', 'Set', '₺4.500', '{"brand": ["Bosch", "Makita", "Dewalt"]}');


   -- 10. KAPI & PENCERE
   INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
   VALUES ('KAPI & PENCERE', 'Çelik Kapı, PVC, Doğrama', 'door', 'cat_kapi_pencere', 10)
   RETURNING id INTO cat_id;

     INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Kapılar', 'door-closed', 1) RETURNING id INTO sub_id;
       INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
       (sub_id, cat_id, 'Çelik Kapı (Lüks)', 'Adet', '₺12.000', '{"type": ["Ahşap Kaplama", "Kompozit"]}');


   -- 11. İŞ GÜVENLİĞİ
   INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
   VALUES ('İŞ GÜVENLİĞİ & SAHA', 'Baret, Yelek, El Arabası', 'hard-hat', 'cat_is_guvenligi', 11)
   RETURNING id INTO cat_id;

     INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Kişisel Koruyucu (KKD)', 'account-hard-hat', 1) RETURNING id INTO sub_id;
       INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
       (sub_id, cat_id, 'Mühendis Bareti (Beyaz)', 'Adet', '₺250', '{"brand": ["3M", "Uvex"]}');


   -- 12. PEYZAJ & BAHÇE
   INSERT INTO market_categories (title, subtitle, icon_name, image_ref, sort_order)
   VALUES ('PEYZAJ & BAHÇE', 'Kilit Taşı, Çit, Sulama', 'pine-tree', 'cat_peyzaj_bahce', 12)
   RETURNING id INTO cat_id;

     INSERT INTO market_subcategories (category_id, name, icon_name, sort_order) VALUES (cat_id, 'Zemin Düzenleme', 'road-variant', 1) RETURNING id INTO sub_id;
       INSERT INTO market_products (subcategory_id, category_id, name, spec, price, options) VALUES
       (sub_id, cat_id, 'Kilit Parke Taşı (8cm)', 'm²', '₺180', '{"color": ["Gri", "Kırmızı"]}');

END $$;
