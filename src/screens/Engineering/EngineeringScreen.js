import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- CONSTANTS & MOCK DATA ---

const CATEGORIES = [
    { id: 'all', label: 'Tümü' },
    { id: 'mimar', label: 'Mimari Grup' },
    { id: 'statik', label: 'Statik' },
    { id: 'mekanik', label: 'Mekanik' },
    { id: 'elektrik', label: 'Elektrik' },
    { id: 'harita', label: 'Harita' },
    { id: 'jeoloji', label: 'Jeoloji/Zemin' },
    { id: 'isg', label: 'Yasal/İSG' },
    { id: 'teknik', label: 'Teknik Personel' },
];

const ENGINEERS = [
    // --- MEVCUT ---
    {
        id: '1',
        name: 'Koray Zengin',
        title: 'İnşaat Yüksek Mühendisi',
        badges: ['İSG UZMANI', 'ÖNERİLEN', 'DİPLOMA_OK'],
        rating: 5.0,
        reviewCount: 128,
        specialty: 'Şantiye Yönetimi & İSG',
        about: '15+ yıl şantiye tecrübesi. A sınıfı İş Güvenliği Uzmanı. Büyük ölçekli konut ve AVM projelerinde proje müdürlüğü deneyimi.',
        serviceTypes: ['online', 'onsite'],
        isOnline: true,
        isBlocked: false,
        price: '₺2.500 / Saat',
        category: 'isg',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: '2',
        name: 'Yrd. Doç. Dr. Tevfik D. Müftüoğlu',
        title: 'Akademisyen & İnşaat Mühendisi',
        badges: ['AKADEMİSYEN', 'HİDROLİK UZMANI', 'HIZLI_CEVAP'],
        rating: 4.9,
        reviewCount: 84,
        specialty: 'Su Kaynakları & Hidrolik',
        about: 'Üniversite öğretim üyesi. "Akarsu Yataklarında Sediment Taşınımı" üzerine doktora tezi. Baraj ve HES projeleri danışmanı.',
        serviceTypes: ['online'],
        isOnline: false,
        isBlocked: false,
        price: '₺3.500 / Saat',
        category: 'statik', // Örnek olarak statik altına koyduk veya özel bir akademik kategori olabilir
        image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400&auto=format&fit=crop'
    },

    // --- YENİ EKLENENLER ---

    // MİMARİ GRUP
    {
        id: 'm1',
        name: 'Selin Yılmaz',
        title: 'Yüksek Mimar',
        badges: ['DİPLOMA_OK', 'EN_ÇOK_TERCİH'],
        rating: 4.9,
        reviewCount: 215,
        specialty: 'Konut & Villa Tasarımı',
        about: 'Modern ve sürdürülebilir mimari tasarımlar. Ruhsat projeleri ve uygulama detaylarında uzman.',
        serviceTypes: ['online', 'onsite'],
        isOnline: true,
        isBlocked: false,
        price: '₺3.000 / Saat',
        category: 'mimar',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 'm2',
        name: 'Caner Erkin',
        title: 'Peyzaj Mimarı',
        badges: ['BAHÇE_UZMANI'],
        rating: 4.7,
        reviewCount: 45,
        specialty: 'Site & Park Düzenlemesi',
        about: 'Geniş ölçekli peyzaj projeleri, bitkilendirme ve sulama sistemleri tasarımı.',
        serviceTypes: ['onsite'],
        isOnline: false,
        isBlocked: false,
        price: '₺2.200 / Saat',
        category: 'mimar',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop'
    },

    // MÜHENDİSLİK GRUBU (Statik, Mekanik, Elektrik vs.)
    {
        id: 'e1',
        name: 'Murat Demir',
        title: 'Elektrik Mühendisi',
        badges: ['TRAFO_UZMANI', 'DİPLOMA_OK'],
        rating: 4.8,
        reviewCount: 92,
        specialty: 'Kuvvetli & Zayıf Akım',
        about: 'Sanayi yapıları elektrik tesisatı, trafo işletme sorumluluğu ve proje onayı.',
        serviceTypes: ['online', 'onsite'],
        isOnline: true,
        isBlocked: false,
        price: '₺2.400 / Saat',
        category: 'elektrik',
        image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 'mk1',
        name: 'Ahmet Yılmaz',
        title: 'Makine Mühendisi',
        badges: ['HVAC', 'DİPLOMA_OK'],
        rating: 4.6,
        reviewCount: 67,
        specialty: 'Isıtma Soğutma & Havalandırma',
        about: 'VRF sistemleri, yangın tesisatı ve sıhhi tesisat proje çözümleri.',
        serviceTypes: ['online'],
        isOnline: false,
        isBlocked: false,
        price: '₺2.300 / Saat',
        category: 'mekanik',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 'st1',
        name: 'Engin Kaya',
        title: 'İnşaat Mühendisi (Statik)',
        badges: ['GÜÇLENDİRME', 'DİPLOMA_OK'],
        rating: 5.0,
        reviewCount: 156,
        specialty: 'Betonarme & Çelik Yapılar',
        about: 'Deprem performans analizi, güçlendirme projeleri ve statik hesap raporları.',
        serviceTypes: ['online', 'onsite'],
        isOnline: true,
        isBlocked: false,
        price: '₺3.500 / Saat',
        category: 'statik',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 'h1',
        name: 'Zeynep Su',
        title: 'Harita Mühendisi',
        badges: ['APLİKASYON', 'HIZLI_CEVAP'],
        rating: 4.9,
        reviewCount: 34,
        specialty: 'Ölçüm & Sınır Tespiti',
        about: 'Hassas ölçüm cihazları ile arazi aplikasyonu, sınır tespiti ve kübaj hesabı.',
        serviceTypes: ['onsite'],
        isOnline: true,
        isBlocked: false,
        price: '₺2.000 / Saat',
        category: 'harita',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 'j1',
        name: 'Dr. Sedat Yerli',
        title: 'Jeoloji Mühendisi',
        badges: ['ZEMİN_ETÜDÜ', 'AKADEMİSYEN'],
        rating: 5.0,
        reviewCount: 42,
        specialty: 'Zemin Etüdü & Raporlama',
        about: 'Sondaj logları yorumlama, zemin iyileştirme önerileri ve jeoteknik rapor onayı.',
        serviceTypes: ['online', 'onsite'],
        isOnline: false,
        isBlocked: false,
        price: '₺2.800 / Saat',
        category: 'jeoloji',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
    },

    // TEKNİK PERSONEL
    {
        id: 't1',
        name: 'Mehmet Usta',
        title: 'İnşaat Teknikeri',
        badges: ['METRAJER', 'SAHA'],
        rating: 4.5,
        reviewCount: 22,
        specialty: 'Metraj & Hakediş',
        about: 'Kesin hesap, metraj çıkarma ve hakediş dosyası hazırlama konularında destek.',
        serviceTypes: ['online', 'onsite'],
        isOnline: true,
        isBlocked: false,
        price: '₺1.500 / Saat',
        category: 'teknik',
        image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=400&auto=format&fit=crop'
    },


    {
        id: '3',
        name: 'Atahan Arıcı',
        title: 'İnşaat Mühendisi',
        badges: ['SAHA_ŞEFİ', 'DİPLOMA_OK', 'HIZLI_CEVAP'],
        rating: 4.8,
        reviewCount: 56,
        specialty: 'Kaba Yapı & Saha Yönetimi',
        about: 'Büyük ölçekli şantiyelerde saha şefliği tecrübesi. Ekip yönetimi, beton döküm takibi ve hakediş kontrolünde uzman.',
        serviceTypes: ['onsite'],
        isOnline: true,
        isBlocked: false,
        price: '₺2.750 / Saat',
        category: 'statik',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop'
    }
];

import { useNavigation } from '@react-navigation/native';

export default function EngineeringScreen() {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState('all');

    // --- EXPERT MODE STATE (NEW) ---
    const [isExpertMode, setIsExpertMode] = useState(false);
    const [addServiceModalVisible, setAddServiceModalVisible] = useState(false);
    const [engineers, setEngineers] = useState(ENGINEERS);
    const [newService, setNewService] = useState({ name: '', title: '', specialty: '', price: '', categoryId: '' });


    const handleContact = (engineer) => {
        if (engineer.isBlocked) {
            Alert.alert("Hizmet Alınamaz", "Bu uzman hakkında yapılan şikayetler nedeniyle hizmet alımı geçici olarak durdurulmuştur.");
            return;
        }
        Alert.alert("Randevu Talebi", `${engineer.name} ile görüşme talebiniz iletildi. Asistanımız sizi arayacaktır.`);
    };

    const handleAskQuestion = (engineer) => {
        Alert.alert("Soru Sor", `Dosya/Fotoğraf yükleyip ${engineer.name} kullanıcısına soru sormak için mesaj paneline yönlendiriliyorsunuz. (Ücret: 250₺/Soru)`);
    }

    // Expert Mode: Add Service Logic
    const handleAddService = () => {
        if (!newService.name || !newService.title || !newService.categoryId || !newService.price) {
            Alert.alert("Eksik Bilgi", "Lütfen tüm bilgileri eksiksiz doldurunuz.");
            return;
        }

        const newEngineerProfile = {
            id: Date.now().toString(),
            name: newService.name,
            title: newService.title,
            badges: ['YENİ', 'DİPLOMA_OK'],
            rating: 5.0,
            reviewCount: 0,
            specialty: newService.specialty,
            about: 'Yeni katılan uzman.',
            serviceTypes: ['online', 'onsite'],
            isOnline: true,
            isBlocked: false,
            price: `₺${newService.price} / Saat`,
            category: newService.categoryId,
            image: 'https://via.placeholder.com/150/FFD700/000000?text=Uzman'
        };

        setEngineers([newEngineerProfile, ...engineers]);
        setAddServiceModalVisible(false);
        setNewService({ name: '', title: '', specialty: '', price: '', categoryId: '' });
        Alert.alert("Başarılı", "Uzman profiliniz oluşturuldu ve listeye eklendi.");
    };

    const filteredEngineers = selectedCategory === 'all'
        ? engineers
        : engineers.filter(e => e.category === selectedCategory);

    // Badge Rendering Helper
    const renderBadge = (badge, idx) => {
        let bg = '#333';
        let text = '#ccc';
        let icon = null;
        let borderColor = 'transparent';

        if (badge === 'RİSKLİ PROFİL') {
            bg = '#4a1111'; text = '#ff4444'; borderColor = '#ff4444';
        } else if (badge === 'ÖNERİLEN' || badge === 'EN_ÇOK_TERCİH') {
            bg = '#FFD700'; text = '#000'; icon = 'trophy';
        } else if (badge === 'DİPLOMA_OK') {
            bg = '#1a3b1a'; text = '#4CAF50'; icon = 'school'; borderColor = '#4CAF50';
            badge = 'DİPLOMASI DOĞRULANMIŞ';
        } else if (badge === 'HIZLI_CEVAP') {
            bg = '#003366'; text = '#4da6ff'; icon = 'rocket';
            badge = 'HIZLI CEVAP';
        } else if (badge === 'İSG UZMANI') {
            bg = '#333'; text = '#FFD700'; icon = 'hard-hat';
        }

        return (
            <View key={idx} style={[styles.badge, { backgroundColor: bg, borderColor }, borderColor !== 'transparent' && { borderWidth: 1 }]}>
                {icon && <Ionicons name={icon} size={10} color={text} style={{ marginRight: 4 }} />}
                <Text style={[styles.badgeText, { color: text }]}>{badge}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#1a1a1a']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>PROJE DANIŞMANLIK MERKEZİ</Text>
                    <TouchableOpacity
                        style={{
                            width: 40, height: 40, borderRadius: 12,
                            backgroundColor: '#3b5998',
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 1, borderColor: '#4a6fa5'
                        }}
                        onPress={() => navigation.navigate('ProviderDashboard')}
                    >
                        <FontAwesome5
                            name="briefcase"
                            size={18}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>



                {/* Smart Filter Bar */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.filterChip, selectedCategory === cat.id && styles.filterChipActive]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <Text style={[styles.filterText, selectedCategory === cat.id && styles.filterTextActive]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>



                    <Text style={styles.subHeader}>Alanında uzman kadromuzdan online veya şantiyede danışmanlık alın.</Text>

                    {filteredEngineers.map((eng) => (
                        <View key={eng.id} style={[styles.card, eng.isBlocked && styles.cardBlocked]}>

                            {/* Header: Image & Badges */}
                            <View style={styles.cardHeader}>
                                <Image source={{ uri: eng.image }} style={[styles.avatar, eng.isBlocked && styles.avatarBlocked]} />
                                <View style={styles.headerInfo}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name}>{eng.name}</Text>
                                        {eng.isOnline && <View style={styles.onlineBadge} />}
                                    </View>
                                    <Text style={styles.title}>{eng.title}</Text>

                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={14} color="#FFD700" />
                                        <Text style={styles.rating}>{eng.rating}</Text>
                                        <Text style={styles.review}>({eng.reviewCount} Değerlendirme)</Text>
                                    </View>

                                    <View style={styles.badgeRow}>
                                        {eng.badges.map((badge, idx) => renderBadge(badge, idx))}
                                    </View>
                                </View>
                            </View>

                            {/* Body: Specialty & About */}
                            <View style={styles.cardBody}>
                                <Text style={styles.specialtyLabel}>UZMANLIK: <Text style={styles.specialtyValue}>{eng.specialty}</Text></Text>
                                <Text style={styles.about} numberOfLines={3}>{eng.about}</Text>

                                {/* Service Types Icons */}
                                <View style={styles.serviceTypesRow}>
                                    {eng.serviceTypes.includes('online') && (
                                        <View style={styles.serviceTypeItem}>
                                            <Ionicons name="videocam" size={12} color="#4da6ff" />
                                            <Text style={styles.serviceTypeText}>Online Görüşme</Text>
                                        </View>
                                    )}
                                    {eng.serviceTypes.includes('onsite') && (
                                        <View style={styles.serviceTypeItem}>
                                            <FontAwesome5 name="hard-hat" size={10} color="#FFD700" />
                                            <Text style={styles.serviceTypeText}>Şantiye Ziyareti</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Footer: Action */}
                            <View style={styles.cardFooter}>
                                <View>
                                    <Text style={styles.priceLabel}>Danışmanlık Ücreti</Text>
                                    <Text style={[styles.priceValue, eng.isBlocked && styles.priceBlocked]}>{eng.price}</Text>
                                </View>

                                <View style={styles.actionButtonsContainer}>
                                    {/* Soru Sor Button (Small) */}
                                    {!eng.isBlocked &&
                                        <TouchableOpacity
                                            style={styles.askButton}
                                            onPress={() => handleAskQuestion(eng)}
                                        >
                                            <MaterialCommunityIcons name="message-text-outline" size={18} color="#FFD700" />
                                        </TouchableOpacity>
                                    }

                                    {/* Randevu Button */}
                                    <TouchableOpacity
                                        style={[styles.actionButton, eng.isBlocked && styles.actionButtonBlocked]}
                                        onPress={() => handleContact(eng)}
                                        disabled={eng.isBlocked}
                                    >
                                        <Text style={[styles.actionText, eng.isBlocked && styles.actionTextBlocked]}>
                                            {eng.isBlocked ? 'Erişim Kısıtlı' : 'Randevu'}
                                        </Text>
                                        {!eng.isBlocked && <Ionicons name="calendar" size={16} color="#000" style={{ marginLeft: 5 }} />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                    ))}

                    {filteredEngineers.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Bu kategoride henüz uzman bulunmamaktadır.</Text>
                        </View>
                    )}

                </ScrollView>

                {/* ADD SERVICE MODAL (EXPERT) */}
                <Modal
                    visible={addServiceModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setAddServiceModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>UZMAN PROFİLİ OLUŞTUR</Text>
                                <TouchableOpacity onPress={() => setAddServiceModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ padding: 10 }}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Uzmanlık Alanı Seçin</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                        {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[styles.categoryChip, newService.categoryId === cat.id && styles.categoryChipActive]}
                                                onPress={() => setNewService({ ...newService, categoryId: cat.id })}
                                            >
                                                <Text style={[styles.categoryChipText, newService.categoryId === cat.id && styles.categoryChipTextActive]}>{cat.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Ad Soyad</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Mimar Sinan"
                                        placeholderTextColor="#666"
                                        value={newService.name}
                                        onChangeText={(t) => setNewService({ ...newService, name: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Unvan</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Yüksek Mimar, İnşaat Müh."
                                        placeholderTextColor="#666"
                                        value={newService.title}
                                        onChangeText={(t) => setNewService({ ...newService, title: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Uzmanlık Detayı</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Konut Projeleri, Çelik Yapılar"
                                        placeholderTextColor="#666"
                                        value={newService.specialty}
                                        onChangeText={(t) => setNewService({ ...newService, specialty: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Saatlik Danışmanlık Ücreti (₺)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="2500"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                        value={newService.price}
                                        onChangeText={(t) => setNewService({ ...newService, price: t })}
                                    />
                                </View>

                                <TouchableOpacity style={styles.submitBtn} onPress={handleAddService}>
                                    <Text style={styles.submitBtnText}>HİZMET PROFİLİNİ YAYINLA</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
    headerTitle: { color: '#FFD700', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
    subHeader: { color: '#888', paddingHorizontal: 20, marginBottom: 15, marginTop: 5, fontSize: 13 },
    scrollContent: { paddingBottom: 40 },

    // Filter Chips
    filterContainer: { marginBottom: 10 },
    filterScroll: { paddingHorizontal: 20, paddingBottom: 10 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: '#333',
        marginRight: 8
    },
    filterChipActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    filterText: { color: '#888', fontSize: 13, fontWeight: '500' },
    filterTextActive: { color: '#000', fontWeight: 'bold' },

    card: {
        backgroundColor: '#1E1E1E',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardBlocked: {
        borderColor: '#4d1a1a',
        backgroundColor: '#1a0d0d', // Dark red tint
        opacity: 0.8
    },

    cardHeader: { flexDirection: 'row', marginBottom: 15 },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#FFD700' },
    avatarBlocked: { borderColor: '#555', grayscale: 1 },
    headerInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },

    nameRow: { flexDirection: 'row', alignItems: 'center' },
    name: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    onlineBadge: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', marginLeft: 8, borderWidth: 1, borderColor: '#000' },

    title: { color: '#aaa', fontSize: 13, marginBottom: 4 },

    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    rating: { color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginHorizontal: 4 },
    review: { color: '#666', fontSize: 12 },

    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },

    cardBody: { backgroundColor: '#111', padding: 12, borderRadius: 8, marginBottom: 15 },
    specialtyLabel: { color: '#666', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
    specialtyValue: { color: '#ddd' },
    about: { color: '#999', fontSize: 13, lineHeight: 18 },

    serviceTypesRow: { flexDirection: 'row', marginTop: 10, gap: 12 },
    serviceTypeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    serviceTypeText: { color: '#888', fontSize: 11 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#333' },
    priceLabel: { color: '#666', fontSize: 11 },
    priceValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    priceBlocked: { color: '#888', textDecorationLine: 'line-through' },

    actionButtonsContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },

    askButton: {
        width: 36, height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#444'
    },

    actionButton: { flexDirection: 'row', backgroundColor: '#FFD700', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    actionButtonBlocked: { backgroundColor: '#333' },
    actionText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
    actionTextBlocked: { color: '#666' },

    emptyContainer: { alignItems: 'center', padding: 20 },
    emptyText: { color: '#555', fontStyle: 'italic' },

    // Provider Promo Styles
    providerPromoCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        marginTop: 10,
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.5)',
        overflow: 'hidden'
    },
    promoContent: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
    promoIconBox: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)'
    },
    promoTitle: { color: '#FFD700', fontSize: 16, fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
    promoDesc: { color: '#ccc', fontSize: 12, lineHeight: 16 },

    // Expert Mode Styles
    headerBtn: {
        padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12,
        borderWidth: 1, borderColor: '#333'
    },
    expertBanner: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FFD700', paddingHorizontal: 20, paddingVertical: 10
    },
    expertBannerText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
    addServiceBtnHeader: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#000',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6
    },
    addServiceTextHeader: { color: '#fff', fontWeight: 'bold', fontSize: 11 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

    formGroup: { marginBottom: 15 },
    label: { color: '#aaa', marginBottom: 6, fontSize: 12 },
    input: { backgroundColor: '#1E1E1E', color: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#333' },

    categoryChip: { padding: 8, borderRadius: 8, backgroundColor: '#222', marginRight: 8, borderWidth: 1, borderColor: '#333' },
    categoryChipActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    categoryChipText: { color: '#888', fontSize: 11 },
    categoryChipTextActive: { color: '#000', fontWeight: 'bold' },

    submitBtn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
