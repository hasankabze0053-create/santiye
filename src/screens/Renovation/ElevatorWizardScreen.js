import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ElevatorService } from '../../services/ElevatorService';

const { width, height } = Dimensions.get('window');

// ─── THEME ────────────────────────────────────────────────────────────────────
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F7E5A8';
const GOLD_DARK = '#8C6A30';
const BG_DARK = '#0A0A0A';
const CARD_BG = '#141414';
const BORDER = '#252525';

// ─── TÜRKİYE İL VE İLÇE VERİSİ ───────────────────────────────────────────────
const CITIES_DISTRICTS = {
    'Adana': ['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'],
    'Adıyaman': ['Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Merkez', 'Samsat', 'Sincik', 'Tut'],
    'Afyonkarahisar': ['Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Merkez', 'Sandıklı', 'Sinanpaşa', 'Sultanhisar', 'Şuhut'],
    'Ağrı': ['Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Merkez', 'Patnos', 'Taşlıçay', 'Tutak'],
    'Aksaray': ['Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Merkez', 'Ortaköy', 'Sarıyahşi', 'Sultanhanı'],
    'Amasya': ['Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merkez', 'Merzifon', 'Suluova', 'Taşova'],
    'Ankara': ['Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kalecik', 'Kazan', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'],
    'Antalya': ['Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'],
    'Artvin': ['Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Kemalpaşa', 'Merkez', 'Murgul', 'Şavşat', 'Yusufeli'],
    'Aydın': ['Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Efeler', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Merkez', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar'],
    'Balıkesir': ['Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'],
    'Bartın': ['Arit', 'Kurucaşile', 'Merkez', 'Ulus'],
    'Batman': ['Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Merkez', 'Sason'],
    'Bayburt': ['Aydıntepe', 'Demirözü', 'Merkez'],
    'Bilecik': ['Bozüyük', 'Gölpazarı', 'İnhisar', 'Merkez', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'],
    'Bingöl': ['Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Merkez', 'Solhan', 'Yayladere', 'Yedisu'],
    'Bitlis': ['Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Merkez', 'Mutki', 'Tatvan'],
    'Bolu': ['Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Merkez', 'Mudurnu', 'Seben', 'Yeniçağa'],
    'Burdur': ['Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Merkez', 'Tefenni', 'Yeşilova'],
    'Bursa': ['Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'],
    'Çanakkale': ['Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Merkez', 'Yenice'],
    'Çankırı': ['Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Khanköy', 'Korgun', 'Kurşunlu', 'Merkez', 'Orta', 'Şabanözü', 'Yapraklı'],
    'Çorum': ['Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Merkez', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'],
    'Denizli': ['Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Merkezefendi', 'Pamukkale', 'Sarayköy', 'Serinhisar', 'Tavas'],
    'Diyarbakır': ['Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kayapınar', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir'],
    'Düzce': ['Akçakoca', 'Cumayeri', 'Çilimli', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Merkez', 'Yığılca'],
    'Edirne': ['Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Merkez', 'Süloğlu', 'Uzunköprü'],
    'Elazığ': ['Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Merkez', 'Palu', 'Sivrice'],
    'Erzincan': ['Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Merkez', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'],
    'Erzurum': ['Aşkale', 'Aziziye', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı', 'Köprüköy', 'Merkez', 'Narman', 'Oltu', 'Olur', 'Palandöken', 'Pasinler', 'Pazaryolu', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere', 'Yakutiye'],
    'Eskişehir': ['Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Tepebaşı'],
    'Gaziantep': ['Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey', 'Şehitkamil', 'Yavuzeli'],
    'Giresun': ['Alucra', 'Bulancak', 'Çamoluk', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Güce', 'Keşap', 'Merkez', 'Piraziz', 'Şebinkaharhisar', 'Tirebolu', 'Yağlıdere'],
    'Gümüşhane': ['Kelkit', 'Köse', 'Kürtün', 'Merkez', 'Şiran', 'Torul'],
    'Hakkari': ['Çukurca', 'Derecik', 'Merkez', 'Şemdinli', 'Yüksekova'],
    'Hatay': ['Altınözü', 'Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'],
    'Iğdır': ['Aralık', 'Karakoyunlu', 'Merkez', 'Tuzluca'],
    'Isparta': ['Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Merkez', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'],
    'İstanbul': ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
    'İzmir': ['Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
    'Kahramanmaraş': ['Afşin', 'Andırın', 'Çağlayancerit', 'Dulkadiroğlu', 'Ekinözü', 'Elbistan', 'Göksun', 'Nurhak', 'Onikişubat', 'Pazarcık', 'Türkoğlu'],
    'Karabük': ['Eflani', 'Eskipazar', 'Merkez', 'Ovacık', 'Safranbolu', 'Yenice'],
    'Karaman': ['Ayrancı', 'Başyayla', 'Ermenek', 'Kazımkarabekir', 'Merkez', 'Sarıveliler'],
    'Kars': ['Akyaka', 'Arpaçay', 'Digor', 'Kağızman', 'Merkez', 'Sarıkamış', 'Selim', 'Susuz'],
    'Kastamonu': ['Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Merkez', 'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya'],
    'Kayseri': ['Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Kocasinan', 'Melikgazi', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Talas', 'Tomarza', 'Yahyalı', 'Yeşilhisar'],
    'Kırıkkale': ['Bahşili', 'Balışeyh', 'Çelebi', 'Delice', 'Karakeçili', 'Keskin', 'Merkez', 'Sulakyurt', 'Yahşihan'],
    'Kırklareli': ['Babaeski', 'Demirköy', 'Kofçaz', 'Lüleburgaz', 'Merkez', 'Pehlivanköy', 'Pınarhisar', 'Vize'],
    'Kırşehir': ['Akçakent', 'Akpınar', 'Boztepe', 'Çiçekdağı', 'Kaman', 'Merkez', 'Mucur'],
    'Kilis': ['Elbeyli', 'Merkez', 'Musabeyli', 'Polateli'],
    'Kocaeli': ['Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası', 'Gebze', 'Gölcük', 'İzmit', 'Kandıra', 'Karamürsel', 'Kartepe', 'Körfez'],
    'Konya': ['Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysınır', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'],
    'Kütahya': ['Altıntaş', 'Aslanapa', 'Çavdarhisar', 'Domaniç', 'Dumlupınar', 'Emet', 'Gediz', 'Hisarcık', 'Merkez', 'Pazarlar', 'Şaphane', 'Simav', 'Tavşanlı'],
    'Malatya': ['Akçadağ', 'Arapgir', 'Arguvan', 'Battalgazi', 'Darende', 'Doğanşehir', 'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan', 'Yeşilyurt'],
    'Manisa': ['Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç', 'Köprübaşı', 'Kula', 'Merkez', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Şehzadeler', 'Turgutlu', 'Yunusemre'],
    'Mardin': ['Artuklu', 'Dargeçit', 'Derik', 'Kızıltepe', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Yeşilli'],
    'Mersin': ['Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mezitli', 'Mut', 'Silifke', 'Tarsus', 'Toroslar', 'Yenişehir'],
    'Muğla': ['Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ortaca', 'Seydikemer', 'Ula', 'Yatağan'],
    'Muş': ['Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Merkez', 'Varto'],
    'Nevşehir': ['Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Merkez', 'Ürgüp'],
    'Niğde': ['Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Merkez', 'Ulukışla'],
    'Ordu': ['Akkuş', 'Altınordu', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye'],
    'Osmaniye': ['Bahçe', 'Düziçi', 'Hasanbeyli', 'Kadirli', 'Merkez', 'Sumbas', 'Toprakkale'],
    'Rize': ['Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Merkez', 'Pazar'],
    'Sakarya': ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Mithatpaşa', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'],
    'Samsun': ['Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra', 'Canik', 'Çarşamba', 'Havza', 'İlkadım', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Tekkeköy', 'Terme', 'Vezirköprü', 'Yakakent'],
    'Siirt': ['Baykan', 'Eruh', 'Kurtalan', 'Merkez', 'Pervari', 'Şirvan', 'Tillo'],
    'Sinop': ['Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Merkez', 'Saraydüzü', 'Türkeli'],
    'Sivas': ['Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Merkez', 'Suşehri', 'Şarkışla', 'Ulaş', 'Yıldızeli', 'Zara'],
    'Şanlıurfa': ['Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti', 'Haliliye', 'Harran', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir'],
    'Şırnak': ['Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Merkez', 'Silopi', 'Uludere'],
    'Tekirdağ': ['Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Merkez', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Şarköy'],
    'Tokat': ['Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Merkez', 'Niksar', 'Pazar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'],
    'Trabzon': ['Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Ortahisar', 'Sürmene', 'Şalpazarı', 'Tonya', 'Vakfıkebir', 'Yomra'],
    'Tunceli': ['Çemişgezek', 'Hozat', 'Mazgirt', 'Merkez', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'],
    'Uşak': ['Banaz', 'Eşme', 'Karahallı', 'Merkez', 'Sivaslı', 'Ulubey'],
    'Van': ['Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Edremit', 'Erciş', 'Gevaş', 'Gürpınar', 'İpekyolu', 'Muradiye', 'Özalp', 'Saray', 'Tuşba'],
    'Yalova': ['Altınova', 'Armutlu', 'Çiftlikkoy', 'Çınarcık', 'Merkez', 'Termal'],
    'Yozgat': ['Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Merkez', 'Saraykent', 'Sarıkaya', 'Şefaatli', 'Sorgun', 'Yenifakılı', 'Yerköy'],
    'Zonguldak': ['Alaplı', 'Çaycuma', 'Devrek', 'Ereğli', 'Gökçebey', 'Kilimli', 'Kozlu', 'Merkez'],
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const getSortedCities = () => {
    const specials = ['İstanbul', 'Ankara', 'İzmir'];
    const others = Object.keys(CITIES_DISTRICTS)
        .filter(c => !specials.includes(c))
        .sort((a, b) => a.localeCompare(b, 'tr'));
    return [...specials, ...others];
};

const CITY_NAMES = getSortedCities();

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function ElevatorWizardScreen({ navigation }) {
    const [mode, setMode] = useState('type_selection'); 
    const [selectedType, setSelectedType] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [phone, setPhone] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;

    const animateTransition = (callback) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
        callback();
    };

    const handleTypeSelect = (type) => {
        animateTransition(() => {
            setSelectedType(type);
            setMode('city');
        });
    };

    const handleCitySelect = (city) => {
        animateTransition(() => {
            setSelectedCity(city);
            setSelectedDistrict(null);
            setSearchText('');
            setMode('district');
        });
    };

    const handleDistrictSelect = (district) => {
        animateTransition(() => {
            setSelectedDistrict(district);
            setSearchText('');
            setMode('phone');
        });
    };

    const handlePhoneChange = (text) => {
        const digits = text.replace(/\D/g, '').slice(0, 10);
        setPhone(digits);
    };

    const handleSubmit = async () => {
        if (!selectedCity || !selectedDistrict) {
            Alert.alert('Eksik Bilgi', 'Lütfen il ve ilçe seçiniz.');
            return;
        }
        if (phone.length < 10) {
            Alert.alert('Geçersiz Numara', 'Lütfen 10 haneli telefon numaranızı giriniz.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await ElevatorService.createRequest({
                city: selectedCity,
                district: selectedDistrict,
                phone: `+90${phone}`,
                faultType: selectedType === 'malfunction' ? 'Asansör Arıza Onarımı' : 'Asansör Periyodik Bakım',
            });

            if (result.success) {
                navigation.replace('ElevatorSuccess', { city: selectedCity, district: selectedDistrict });
            } else {
                Alert.alert('Hata', 'Talep oluşturulamadı.');
            }
        } catch (e) {
            Alert.alert('Hata', 'Beklenmedik bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatPhone = (digits) => {
        if (digits.length === 0) return '';
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0,3)} ${digits.slice(3)}`;
        if (digits.length <= 8) return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
        return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,8)} ${digits.slice(8)}`;
    };

    const filteredData = useMemo(() => {
        const sourceData = mode === 'city' ? CITY_NAMES : (CITIES_DISTRICTS[selectedCity] || []).sort((a,b) => a.localeCompare(b, 'tr'));
        if (!searchText) return sourceData;
        const normSearch = searchText.toLocaleLowerCase('tr').trim();
        return sourceData.filter(item => item.toLocaleLowerCase('tr').includes(normSearch));
    }, [mode, selectedCity, searchText]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
            <LinearGradient colors={[BG_DARK, '#0D0D0D', BG_DARK]} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => {
                        if (mode === 'phone') setMode('district');
                        else if (mode === 'district') setMode('city');
                        else if (mode === 'city') setMode('type_selection');
                        else navigation.goBack();
                    }}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <View style={styles.headerIconRow}>
                            <MaterialCommunityIcons name="elevator-passenger" size={18} color={GOLD} />
                            <Text allowFontScaling={false} style={styles.headerTag}>ASANSÖR ARIZA BAKIM</Text>
                        </View>
                        <Text allowFontScaling={false} style={styles.headerTitle}>Talep Formu</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* TYPE SELECTION VIEW */}
                {mode === 'type_selection' && (
                    <Animated.View style={[styles.typeContainer, { opacity: fadeAnim }]}>
                        <Text allowFontScaling={false} style={styles.typePrompt}>Ne için talep oluşturuyorsunuz?</Text>
                        
                        <TouchableOpacity 
                            style={[styles.typeCard, selectedType === 'malfunction' && styles.typeCardActive]} 
                            onPress={() => handleTypeSelect('malfunction')}
                            activeOpacity={0.7}
                        >
                            <LinearGradient 
                                colors={selectedType === 'malfunction' ? [GOLD_DARK, '#1A1A1A'] : ['#141414', '#0A0A0A']} 
                                style={StyleSheet.absoluteFillObject} 
                            />
                            <View style={styles.typeIconBox}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={32} color={GOLD} />
                            </View>
                            <View style={styles.typeContent}>
                                <Text allowFontScaling={false} style={styles.typeTitle}>Asansör Arıza Onarımı</Text>
                                <Text allowFontScaling={false} style={styles.typeDesc}>Asansörünüzde teknik bir sorun varsa hızlı müdahale için seçin.</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={BORDER} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.typeCard, selectedType === 'maintenance' && styles.typeCardActive]} 
                            onPress={() => handleTypeSelect('maintenance')}
                            activeOpacity={0.7}
                        >
                            <LinearGradient 
                                colors={selectedType === 'maintenance' ? [GOLD_DARK, '#1A1A1A'] : ['#141414', '#0A0A0A']} 
                                style={StyleSheet.absoluteFillObject} 
                            />
                            <View style={styles.typeIconBox}>
                                <MaterialCommunityIcons name="shield-check-outline" size={32} color={GOLD} />
                            </View>
                            <View style={styles.typeContent}>
                                <Text allowFontScaling={false} style={styles.typeTitle}>Asansör Periyodik Bakım</Text>
                                <Text allowFontScaling={false} style={styles.typeDesc}>Güvenli kullanım için düzenli kontrol ve yağlama hizmeti.</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={BORDER} />
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* DUAL TOGGLE */}
                {mode !== 'type_selection' && (
                    <View style={styles.toggleRow}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.toggleBtn, mode === 'city' && styles.toggleBtnActive]}
                        onPress={() => { animateTransition(() => setMode('city')); setSearchText(''); }}
                    >
                        <MaterialCommunityIcons name="map-marker" size={16} color={mode === 'city' ? '#000' : GOLD} />
                        <View style={styles.toggleLabelCol}>
                            <Text allowFontScaling={false} style={[styles.toggleLabel, mode === 'city' && styles.toggleLabelActive]}>İl Seçimi</Text>
                            <Text allowFontScaling={false} style={[styles.toggleVal, mode === 'city' && styles.toggleValActive]} numberOfLines={1}>
                                {selectedCity || 'Seçiniz'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={!selectedCity}
                        style={[styles.toggleBtn, (mode === 'district' || mode === 'phone') && styles.toggleBtnActive, !selectedCity && { opacity: 0.4 }]}
                        onPress={() => { animateTransition(() => setMode('district')); setSearchText(''); }}
                    >
                        <MaterialCommunityIcons name="city-variant" size={16} color={(mode === 'district' || mode === 'phone') ? '#000' : GOLD} />
                        <View style={styles.toggleLabelCol}>
                            <Text allowFontScaling={false} style={[styles.toggleLabel, (mode === 'district' || mode === 'phone') && styles.toggleLabelActive]}>İlçe Seçimi</Text>
                            <Text allowFontScaling={false} style={[styles.toggleVal, (mode === 'district' || mode === 'phone') && styles.toggleValActive]} numberOfLines={1}>
                                {selectedDistrict || 'Seçiniz'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                )}

                {mode !== 'type_selection' && (
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                            
                            {mode !== 'phone' ? (
                            <>
                                {/* SEARCH BAR */}
                                <View style={styles.searchContainer}>
                                    <View style={styles.searchBox}>
                                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
                                        <Ionicons name="search" size={18} color={GOLD} style={{ marginLeft: 12 }} />
                                        <TextInput
                                            allowFontScaling={false}
                                            style={styles.searchInput}
                                            placeholder={`${mode === 'city' ? 'İl' : 'İlçe'} ara...`}
                                            placeholderTextColor="#555"
                                            value={searchText}
                                            onChangeText={setSearchText}
                                            autoCorrect={false}
                                            clearButtonMode="while-editing"
                                        />
                                        {searchText.length > 0 && (
                                            <TouchableOpacity onPress={() => setSearchText('')}>
                                                <Ionicons name="close-circle" size={18} color="#555" style={{ marginRight: 12 }} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                    <View style={styles.listContainer}>
                                        {filteredData.map((item) => {
                                            const isSelected = (mode === 'city' ? selectedCity : selectedDistrict) === item;
                                            return (
                                                <TouchableOpacity
                                                    key={item}
                                                    style={[styles.listItem, isSelected && styles.listItemActive]}
                                                    onPress={() => mode === 'city' ? handleCitySelect(item) : handleDistrictSelect(item)}
                                                    activeOpacity={0.6}
                                                >
                                                    <Text allowFontScaling={false} style={[styles.listItemText, isSelected && styles.listItemTextActive]}>
                                                        {item}
                                                    </Text>
                                                    {isSelected ? (
                                                        <MaterialCommunityIcons name="check-circle" size={20} color={GOLD} />
                                                    ) : (
                                                        <MaterialCommunityIcons name="chevron-right" size={18} color="#333" />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                        {filteredData.length === 0 && (
                                            <View style={styles.emptyResults}>
                                                <Text allowFontScaling={false} style={styles.emptyText}>Sonuç bulunamadı.</Text>
                                            </View>
                                        )}
                                    </View>
                                </ScrollView>
                            </>
                        ) : (
                            /* PHONE INPUT VIEW */
                            <View style={styles.phoneModeContainer}>
                                <BlurView intensity={10} tint="dark" style={styles.phoneBlurCard}>
                                    <MaterialCommunityIcons name="phone-check" size={48} color={GOLD} style={{ marginBottom: 20 }} />
                                    <View style={styles.phoneHeaderRow}>
                                        <Text allowFontScaling={false} style={styles.phoneTitle}>Son Bir Adım!</Text>
                                        <TouchableOpacity style={styles.doneBtn} onPress={Keyboard.dismiss}>
                                            <Text allowFontScaling={false} style={styles.doneBtnText}>Kapat</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text allowFontScaling={false} style={styles.phoneSub}>Lütfen size ulaşabileceğimiz iletişim numaranızı giriniz.</Text>
                                    
                                    <View style={styles.phoneInputRow}>
                                        <View style={styles.phonePrefixBox}>
                                            <Text allowFontScaling={false} style={styles.phonePrefixText}>TR +90</Text>
                                        </View>
                                        <TextInput
                                            allowFontScaling={false}
                                            style={styles.phoneMainInput}
                                            placeholder="5XX XXX XX XX"
                                            placeholderTextColor="#333"
                                            keyboardType="numeric"
                                            autoFocus={true}
                                            value={formatPhone(phone)}
                                            onChangeText={handlePhoneChange}
                                            maxLength={13}
                                            returnKeyType="done"
                                            onSubmitEditing={Keyboard.dismiss}
                                        />
                                    </View>

                                    <TouchableOpacity 
                                        style={[styles.phoneSubmitBtn, (phone.length < 10 || isLoading) && { opacity: 0.5 }]} 
                                        onPress={handleSubmit} 
                                        disabled={phone.length < 10 || isLoading}
                                    >
                                        <LinearGradient colors={[GOLD_DARK, GOLD, GOLD_LIGHT, GOLD, GOLD_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.phoneSubmitGrad}>
                                            {isLoading ? <ActivityIndicator size="small" color="#000" /> : <Text allowFontScaling={false} style={styles.phoneSubmitText}>TALEP OLUŞTUR</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    
                                    <View style={styles.selectionSummary}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={14} color={GOLD} />
                                        <Text allowFontScaling={false} style={styles.summaryText}>{selectedCity} / {selectedDistrict}</Text>
                                    </View>
                                </BlurView>
                            </View>
                        )}
                        </Animated.View>
                    </KeyboardAvoidingView>
                )}
            </SafeAreaView>
        </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_DARK },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#141414', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerTag: { color: GOLD, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
    headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },

    toggleRow: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 12, gap: 10 },
    toggleBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#111', borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
    toggleBtnActive: { borderColor: GOLD, backgroundColor: GOLD },
    toggleLabelCol: { flex: 1 },
    toggleLabel: { color: '#666', fontSize: 9, fontWeight: '600' },
    toggleLabelActive: { color: '#000' },
    toggleVal: { color: GOLD, fontSize: 13, fontWeight: '700' },
    toggleValActive: { color: '#000' },

    searchContainer: { paddingHorizontal: 20, marginBottom: 12 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161616', height: 46, borderRadius: 12, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
    searchInput: { flex: 1, color: '#FFF', fontSize: 14, paddingHorizontal: 12 },

    scrollContent: { paddingBottom: 60 },
    listContainer: { paddingHorizontal: 20 },
    listItem: { flexDirection: 'row', alignItems: 'center', height: 52, borderBottomWidth: 1, borderBottomColor: '#1A1A1A', paddingHorizontal: 4 },
    listItemActive: { borderBottomColor: GOLD },
    listItemText: { flex: 1, color: '#999', fontSize: 14, fontWeight: '500' },
    listItemTextActive: { color: GOLD, fontWeight: '800' },

    emptyResults: { alignItems: 'center', marginTop: 40 },
    emptyText: { color: '#444', fontSize: 13 },

    // Phone Mode
    phoneModeContainer: { flex: 1, padding: 24, justifyContent: 'center' },
    phoneBlurCard: { borderRadius: 24, padding: 30, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: BORDER },
    phoneHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' },
    phoneTitle: { color: '#FFF', fontSize: 24, fontWeight: '800' },
    doneBtn: { position: 'absolute', right: 0 },
    doneBtnText: { color: GOLD, fontSize: 14, fontWeight: '600' },
    phoneSub: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: 30 },
    phoneInputRow: { flexDirection: 'row', alignItems: 'center', height: 60, backgroundColor: '#000', borderRadius: 14, borderWidth: 1.5, borderColor: GOLD, overflow: 'hidden', marginBottom: 20 },
    phonePrefixBox: { paddingHorizontal: 18, borderRightWidth: 1, borderRightColor: '#222' },
    phonePrefixText: { color: GOLD, fontSize: 16, fontWeight: '800' },
    phoneMainInput: { flex: 1, color: '#FFF', fontSize: 20, fontWeight: '600', paddingHorizontal: 18, letterSpacing: 2 },
    phoneSubmitBtn: { width: '100%', borderRadius: 14, overflow: 'hidden', elevation: 12, shadowColor: GOLD, shadowOpacity: 0.5, shadowRadius: 20 },
    phoneSubmitGrad: { height: 64, justifyContent: 'center', alignItems: 'center' },
    phoneSubmitText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 },
    selectionSummary: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24, opacity: 0.5 },
    summaryText: { color: '#FFF', fontSize: 12, fontWeight: '500' },

    // Type Selection
    typeContainer: { flex: 1, padding: 20, paddingTop: 40 },
    typePrompt: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 30, textAlign: 'center' },
    typeCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#141414', 
        borderRadius: 20, 
        padding: 20, 
        marginBottom: 16, 
        borderWidth: 1.5, 
        borderColor: BORDER,
        overflow: 'hidden'
    },
    typeCardActive: { borderColor: GOLD },
    typeIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    typeContent: { flex: 1 },
    typeTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
    typeDesc: { color: '#888', fontSize: 13, lineHeight: 18 },
});
