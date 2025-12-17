import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- CONSTANTS & MOCK DATA ---

const LAW_CATEGORIES = [
    { id: 'all', label: 'Tümü' },
    { id: 'insaat', label: 'İnşaat Hukuku', icon: 'building' },
    { id: 'sozlesme', label: 'Sözleşmeler', icon: 'file-contract' },
    { id: 'imar', label: 'İmar Mevzuatı', icon: 'map-signs' },
    { id: 'is', label: 'İş Hukuku', icon: 'briefcase' },
    { id: 'kentsel', label: 'Kentsel Dönüşüm', icon: 'city' },
    { id: 'tazminat', label: 'Tazminat', icon: 'balance-scale' },
];

const LAWYERS_DATA = [
    {
        id: '1',
        name: 'Av. Mert Yılmaz',
        title: 'İnşaat Hukuku Uzmanı',
        rating: 4.9,
        reviewCount: 42,
        badges: ['ARABULUCU', 'HIZLI CEVAP'],
        specialtyTitle: 'Kat Karşılığı & Taşeron Sözleşmeleri',
        description: 'Müteahhit ve arsa sahibi uyuşmazlıkları, FIDIC sözleşmeleri ve şantiye hukuki süreç yönetiminde uzman.',
        price: '₺3.000 / Saat',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
        verified: true,
        online: true,
        onsite: true,
        category: 'insaat'
    },
    {
        id: '2',
        name: 'Av. Selin Demir',
        title: 'Kentsel Dönüşüm Danışmanı',
        rating: 5.0,
        reviewCount: 28,
        badges: ['RİSKLİ YAPI', 'TECRÜBELİ'],
        specialtyTitle: '6306 Sayılı Kanun Uygulamaları',
        description: 'Riskli yapı tespiti, yıkım kararları, kira yardımı ve kentsel dönüşüm sürecindeki tüm hukuki itirazlar.',
        price: '₺2.500 / Saat',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
        verified: true,
        online: true,
        onsite: false,
        category: 'kentsel'
    },
    {
        id: '3',
        name: 'Av. Caner Erkin',
        title: 'İş Hukuku & SGK',
        rating: 4.7,
        reviewCount: 15,
        badges: ['İŞ KAZASI', 'SGK'],
        specialtyTitle: 'Şantiye İş Kazaları & Tazminat',
        description: 'İş kazası tespit tutanakları, rücu davaları ve işçi alacakları konusunda işveren vekilliği.',
        price: '₺2.000 / Saat',
        image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400&auto=format&fit=crop',
        verified: true,
        online: true,
        onsite: true,
        category: 'is'
    },
    {
        id: '4',
        name: 'Av. Zeynep Kaya',
        title: 'İmar Hukuku Uzmanı',
        rating: 4.8,
        reviewCount: 34,
        badges: ['İMAR PLANI', 'RUHSAT'],
        specialtyTitle: 'İmar Barışı & Ruhsat İptali',
        description: 'Plan tadilatı, imar uygulamaları (18. madde) ve belediye encümen kararlarına itiraz süreçleri.',
        price: '₺2.750 / Saat',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
        verified: true,
        online: false,
        onsite: true,
        category: 'imar'
    }
];

export default function LawScreen() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // --- LAWYER MODE STATE (NEW) ---
    const [isLawyerMode, setIsLawyerMode] = useState(false);
    const [addProfileModalVisible, setAddProfileModalVisible] = useState(false);
    const [lawyers, setLawyers] = useState(LAWYERS_DATA);
    const [newLawyer, setNewLawyer] = useState({ name: '', title: '', specialtyTitle: '', price: '', category: '' });

    // Filter Lawyers
    const filteredLawyers = lawyers.filter(lawyer => {
        const matchesCategory = selectedCategory === 'all' || lawyer.category === selectedCategory;
        const matchesSearch = lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lawyer.specialtyTitle.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const handleAppointment = (name) => {
        Alert.alert("Randevu Oluştur", name + " ile hukuki danışmanlık randevusu başlatılıyor.");
    };

    const handleAskQuestion = (name) => {
        Alert.alert("Soru Sor", name + " kişisine dava/dosya konusunu yazıp gönderebilirsiniz.");
    };

    // Lawyer Mode: Add Profile Logic
    const handleAddLawyer = () => {
        if (!newLawyer.name || !newLawyer.title || !newLawyer.category || !newLawyer.price) {
            Alert.alert("Eksik Bilgi", "Lütfen tüm bilgileri eksiksiz doldurunuz.");
            return;
        }

        const newLawyerProfile = {
            id: Date.now().toString(),
            name: newLawyer.name,
            title: newLawyer.title,
            rating: 5.0,
            reviewCount: 0,
            badges: ['YENİ', 'BARO ONAYLI'],
            specialtyTitle: newLawyer.specialtyTitle || 'Genel Hukuk',
            description: 'Yeni katılan hukuk uzmanı.',
            price: `₺${newLawyer.price} / Saat`,
            image: 'https://via.placeholder.com/150/FF4444/FFFFFF?text=Avukat',
            verified: true,
            online: true,
            onsite: true,
            category: newLawyer.category
        };

        setLawyers([newLawyerProfile, ...lawyers]);
        setAddProfileModalVisible(false);
        setNewLawyer({ name: '', title: '', specialtyTitle: '', price: '', category: '' });
        Alert.alert("Başarılı", "Avukat profiliniz oluşturuldu ve listeye eklendi.");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1a1110', '#000000']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>

                {/* NEW HEADER: HUKUKİ ÇÖZÜM MERKEZİ */}
                <View style={styles.header}>
                    <Text style={styles.centerTitle}>HUKUKİ ÇÖZÜM MERKEZİ</Text>
                    <TouchableOpacity
                        style={[
                            styles.headerBtn,
                            isLawyerMode && { backgroundColor: '#ff4444', borderColor: '#ff4444' }
                        ]}
                        onPress={() => setIsLawyerMode(!isLawyerMode)}
                    >
                        <FontAwesome5
                            name="balance-scale"
                            size={18}
                            color={isLawyerMode ? "#fff" : "#ff4444"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Lawyer Banner */}
                {isLawyerMode && (
                    <View style={styles.lawyerBanner}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesome5 name="gavel" size={16} color="#000" style={{ marginRight: 8 }} />
                            <Text style={styles.lawyerBannerText}>AVUKAT / UZMAN MODU</Text>
                        </View>
                        <TouchableOpacity style={styles.addProfileBtnHeader} onPress={() => setAddProfileModalVisible(true)}>
                            <Ionicons name="add-circle" size={18} color="#fff" />
                            <Text style={styles.addProfileTextHeader}>PROFİL OLUŞTUR</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* HIZLI ARAÇLAR */}
                    <Text style={styles.sectionTitle}>HIZLI HUKUKİ ARAÇLAR</Text>
                    <View style={styles.toolsGrid}>
                        <TouchableOpacity style={styles.toolCard}>
                            <View style={styles.toolIconCircle}>
                                <FontAwesome5 name="file-contract" size={20} color="#3b82f6" />
                            </View>
                            <Text style={styles.toolTitle}>Sözleşme Kontrolü</Text>
                            <Text style={styles.toolDesc}>Riskli maddeleri tespit et</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolCard}>
                            <View style={styles.toolIconCircle}>
                                <MaterialCommunityIcons name="alert-decagram" size={22} color="#ef4444" />
                            </View>
                            <Text style={styles.toolTitle}>Risk Analizi</Text>
                            <Text style={styles.toolDesc}>İflas, fesih durumlarını sor</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolCard}>
                            <View style={styles.toolIconCircle}>
                                <MaterialCommunityIcons name="chat-question" size={22} color="#fbbf24" />
                            </View>
                            <Text style={styles.toolTitle}>Alo Avukat</Text>
                            <Text style={styles.toolDesc}>Uzmanına sesli/yazılı danış</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolCard}>
                            <View style={styles.toolIconCircle}>
                                <FontAwesome5 name="pen-fancy" size={18} color="#22c55e" />
                            </View>
                            <Text style={styles.toolTitle}>Dilekçe Asistanı</Text>
                            <Text style={styles.toolDesc}>Otomatik ihtarname hazırla</Text>
                        </TouchableOpacity>
                    </View>

                    {/* UZMAN EŞLEŞTİRME */}
                    <Text style={styles.sectionTitle}>UZMAN EŞLEŞTİRME</Text>
                    <View style={styles.aiMatchBox}>
                        <Text style={styles.aiPrompt}>Hukuki sorununuzu anlatın, yapay zeka sizi en doğru uzmana yönlendirsin.</Text>
                        <TextInput
                            style={styles.aiInput}
                            placeholder="Örn: Müteahhit ek süre istiyor ama sözleşmede cezai şart var..."
                            placeholderTextColor="#666"
                            multiline
                        />
                        <TouchableOpacity style={styles.findExpertBtn}>
                            <Text style={styles.findExpertBtnText}>UZMANI BUL</Text>
                            <Ionicons name="search" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Categories Title */}
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>KATEGORİLER & AVUKATLAR</Text>

                    {/* FILTER CHIPS (Moved inside ScrollView) */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 20 }}
                    >
                        {LAW_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.filterChip, selectedCategory === cat.id && styles.filterChipActive]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                {selectedCategory === cat.id && <FontAwesome5 name={cat.icon} size={12} color="#fff" style={{ marginRight: 6 }} />}
                                <Text style={[styles.filterText, selectedCategory === cat.id && styles.filterTextActive]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* SEARCH INPUT */}
                    <View style={styles.searchBarContainer}>
                        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Avukat veya konu ara (Örn: Sözleşme)..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* LAWYERS LIST */}
                    {filteredLawyers.map((lawyer) => (
                        <View key={lawyer.id} style={styles.expertCard}>
                            <View style={styles.cardHeader}>
                                {/* Avatar */}
                                <View>
                                    <Image source={{ uri: lawyer.image }} style={styles.avatar} />
                                    {lawyer.online && (
                                        <View style={styles.statusDotOnline} />
                                    )}
                                </View>

                                {/* Name & Title */}
                                <View style={{ flex: 1, marginLeft: 15 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.expertName}>{lawyer.name}</Text>
                                        {lawyer.verified && <MaterialCommunityIcons name="gavel" size={16} color="#ff4444" style={{ marginLeft: 6 }} />}
                                    </View>
                                    <Text style={styles.expertTitle}>{lawyer.title}</Text>

                                    {/* Rating */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <Ionicons name="star" size={14} color="#FFD700" />
                                        <Text style={{ color: '#FFD700', fontWeight: 'bold', marginLeft: 4, fontSize: 13 }}>{lawyer.rating}</Text>
                                        <Text style={{ color: '#666', fontSize: 12, marginLeft: 4 }}>({lawyer.reviewCount} Değerlendirme)</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Service Icons & Badges */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                                {lawyer.badges.map((badge, idx) => (
                                    <View key={idx} style={styles.badge}>
                                        <Text style={styles.badgeText}>{badge}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Specialty Box */}
                            <View style={styles.specialtyBox}>
                                <Text style={styles.specialtyTitle}>UZMANLIK: <Text style={{ color: '#fff' }}>{lawyer.specialtyTitle}</Text></Text>
                                <Text style={styles.specialtyDesc}>{lawyer.description}</Text>
                            </View>

                            {/* Service Types (Online/Site) */}
                            <View style={{ flexDirection: 'row', gap: 15, marginBottom: 15, paddingHorizontal: 4 }}>
                                {lawyer.online && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="videocam" size={14} color="#aaa" />
                                        <Text style={{ color: '#aaa', fontSize: 12, marginLeft: 4 }}>Online Görüşme</Text>
                                    </View>
                                )}
                                {lawyer.onsite && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <FontAwesome5 name="building" size={12} color="#aaa" />
                                        <Text style={{ color: '#aaa', fontSize: 12, marginLeft: 4 }}>Ofis/Şantiye</Text>
                                    </View>
                                )}
                            </View>

                            {/* Footer */}
                            <View style={styles.cardFooter}>
                                <View>
                                    <Text style={{ color: '#888', fontSize: 10 }}>Danışmanlık Ücreti</Text>
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{lawyer.price}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                    {/* Ask Question Button */}
                                    <TouchableOpacity
                                        style={styles.messageBtn}
                                        onPress={() => handleAskQuestion(lawyer.name)}
                                    >
                                        <MaterialCommunityIcons name="message-text-outline" size={20} color="#fff" />
                                    </TouchableOpacity>

                                    {/* Appointment Button */}
                                    <TouchableOpacity
                                        style={styles.appointmentBtn}
                                        onPress={() => handleAppointment(lawyer.name)}
                                    >
                                        <Text style={styles.appointmentBtnText}>Randevu Al</Text>
                                        <FontAwesome5 name="balance-scale" size={12} color="#fff" style={{ marginLeft: 6 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}

                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* CREATE PROFILE MODAL (LAWYER) */}
                <Modal
                    visible={addProfileModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setAddProfileModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>AVUKAT PROFİLİ OLUŞTUR</Text>
                                <TouchableOpacity onPress={() => setAddProfileModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ padding: 10 }}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Uzmanlık Alanı</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                        {LAW_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[styles.categoryChip, newLawyer.category === cat.id && styles.categoryChipActive]}
                                                onPress={() => setNewLawyer({ ...newLawyer, category: cat.id })}
                                            >
                                                <Text style={[styles.categoryChipText, newLawyer.category === cat.id && styles.categoryChipTextActive]}>{cat.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Ad Soyad</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Av. Ahmet Demir"
                                        placeholderTextColor="#666"
                                        value={newLawyer.name}
                                        onChangeText={(t) => setNewLawyer({ ...newLawyer, name: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Unvan</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: İnşaat Hukuku Uzmanı"
                                        placeholderTextColor="#666"
                                        value={newLawyer.title}
                                        onChangeText={(t) => setNewLawyer({ ...newLawyer, title: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Özellik / Detay</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Sözleşmeler,FIDIC"
                                        placeholderTextColor="#666"
                                        value={newLawyer.specialtyTitle}
                                        onChangeText={(t) => setNewLawyer({ ...newLawyer, specialtyTitle: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Saatlik Ücret (₺)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="3000"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                        value={newLawyer.price}
                                        onChangeText={(t) => setNewLawyer({ ...newLawyer, price: t })}
                                    />
                                </View>

                                <TouchableOpacity style={styles.submitBtn} onPress={handleAddLawyer}>
                                    <Text style={styles.submitBtnText}>PROFİLİMİ YAYINLA</Text>
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
    container: { flex: 1, backgroundColor: '#1a1110' }, // Dark Red tinted background
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#331111' },
    headerTitle: { color: '#ff4444', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
    headerSubtitle: { color: '#aaa', fontSize: 12, marginTop: 2 },
    iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 68, 68, 0.3)' },

    // Filters
    filterScroll: { paddingHorizontal: 20, paddingVertical: 15 },
    filterChip: {
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#333',
        flexDirection: 'row',
        alignItems: 'center'
    },
    filterChipActive: {
        backgroundColor: '#8B0000', // Dark Red
        borderColor: '#ff4444'
    },
    filterText: { color: '#aaa', fontSize: 13, fontWeight: '600' },
    filterTextActive: { color: '#fff', fontWeight: 'bold' },

    // Search
    scrollContent: { paddingHorizontal: 20 },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 46,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    searchInput: { flex: 1, color: '#fff' },

    // Cards
    expertCard: {
        backgroundColor: '#161616',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#331a1a'
    },
    cardHeader: { flexDirection: 'row' },
    avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#ff4444' },
    statusDotOnline: {
        position: 'absolute', bottom: 2, right: 2,
        width: 14, height: 14, borderRadius: 7,
        backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#000'
    },
    expertName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    expertTitle: { color: '#aaa', fontSize: 13, marginTop: 2 },

    badge: {
        backgroundColor: '#2b1111',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 6, borderWidth: 1, borderColor: '#521'
    },
    badgeText: { color: '#ffaaaa', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

    specialtyBox: {
        backgroundColor: '#0a0a0a',
        padding: 12,
        borderRadius: 12,
        marginTop: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#331a1a'
    },
    specialtyTitle: { color: '#888', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
    specialtyDesc: { color: '#ccc', fontSize: 13, lineHeight: 18 },

    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#222'
    },
    appointmentBtn: {
        backgroundColor: '#8B0000',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ff4444'
    },
    appointmentBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    messageBtn: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#444'
    },

    // Styles for Hukuki Çözüm Merkezi
    centerTitle: { color: '#FFD700', fontSize: 16, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
    sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 12, letterSpacing: 0.5 },

    toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
    toolCard: {
        width: '48%', backgroundColor: '#161616', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#333', alignItems: 'center'
    },
    toolIconCircle: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center', marginBottom: 12
    },
    toolTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
    toolDesc: { color: '#666', fontSize: 10, textAlign: 'center', lineHeight: 14 },

    aiMatchBox: {
        backgroundColor: '#0a0a0a', borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: '#333'
    },
    aiPrompt: { color: '#ccc', fontSize: 13, marginBottom: 12, lineHeight: 18 },
    aiInput: {
        backgroundColor: '#1E1E1E', borderRadius: 12, padding: 12, color: '#fff',
        height: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 16
    },
    findExpertBtn: {
        backgroundColor: '#FFD700', borderRadius: 12, height: 48,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8
    },
    findExpertBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },

    // Lawyer Mode Styles
    headerBtn: {
        padding: 8, backgroundColor: 'rgba(255, 68, 68, 0.1)', borderRadius: 12,
        borderWidth: 1, borderColor: '#331111'
    },
    lawyerBanner: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#ff4444', paddingHorizontal: 20, paddingVertical: 10
    },
    lawyerBannerText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
    addProfileBtnHeader: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#000',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6
    },
    addProfileTextHeader: { color: '#fff', fontWeight: 'bold', fontSize: 11 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

    formGroup: { marginBottom: 15 },
    label: { color: '#aaa', marginBottom: 6, fontSize: 12 },
    input: { backgroundColor: '#1E1E1E', color: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#333' },

    categoryChip: { padding: 8, borderRadius: 8, backgroundColor: '#2b1111', marginRight: 8, borderWidth: 1, borderColor: '#521' },
    categoryChipActive: { backgroundColor: '#ff4444', borderColor: '#ff4444' },
    categoryChipText: { color: '#888', fontSize: 11 },
    categoryChipTextActive: { color: '#000', fontWeight: 'bold' },

    submitBtn: { backgroundColor: '#ff4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
