import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Dimensions, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
const GOLD_MAIN = '#FFD700';
const GOLD_DARK = '#FF9100';
const SUCCESS_GREEN = '#10B981';

// --- DATA ---
const EXPERT_CATEGORIES = [
    { id: '1', title: 'İnşaat Mühendisi', icon: 'hard-hat', sub: 'Statik & Betonarme' }, // building
    { id: '2', title: 'Mimar', icon: 'ruler-combined', sub: 'Tasarım & Ruhsat' }, // draft
    { id: '3', title: 'İç Mimar', icon: 'couch', sub: 'Dekorasyon & Dizayn' }, // swatchbook
    { id: '4', title: 'İş Güvenliği Uzmanı', icon: 'user-shield', sub: 'Saha Denetimi & İSG' }, // shield-virus
    { id: '5', title: 'Hakediş & Metraj', icon: 'calculator', sub: 'Maliyet Hesabı' }, // calculator
    { id: '6', title: 'Elektrik Mühendisi', icon: 'bolt', sub: 'Proje & Tesisat' }, // bolt
    { id: '7', title: 'Makine Mühendisi', icon: 'cogs', sub: 'Mekanik Tesisat' }, // cogs
    { id: '8', title: 'Harita Mühendisi', icon: 'map-marked-alt', sub: 'Ölçüm & Aplikasyon' }, // map
];

const MOCK_PAST_QUESTIONS = [
    {
        id: '2491',
        category: 'İnşaat',
        icon: 'hard-hat',
        title: 'Perde Kolon Etriye Aralığı',
        summary: 'Statik projede S07 perdesi uç bölgesinde belirtilen 8/10 cm etriye sıklaştırması sahadaki uygulama ile...',
        status: 'inceleniyor',
        date: 'Bugün, 14:30'
    },
    {
        id: '2492',
        category: 'Ruhsat',
        icon: 'file-contract',
        title: 'Ruhsat İşlemi',
        summary: 'Belediye onayı için gerekli statik proje revizyonları tamamlandı.',
        status: 'yanıtlandı',
        date: 'Dün'
    },
];

const EXPERT_CATEGORIES_UPDATED = [
    { id: '1', title: 'İnşaat Mühendisi', icon: 'hard-hat', sub: 'Çatlak, Kolon, Güçlendirme' },
    { id: '2', title: 'Mimar', icon: 'ruler-combined', sub: 'Tasarım, Çizim, Ruhsat' },
    { id: '3', title: 'Makine Mühendisi', icon: 'cogs', sub: 'Tesisat, Isıtma, Doğalgaz' },
    { id: '4', title: 'Elektrik Mühendisi', icon: 'bolt', sub: 'Priz, Kablo, Aydınlatma' },
    { id: '5', title: 'Hakediş & Metraj', icon: 'calculator', sub: 'Maliyet Hesabı' },
    { id: '6', title: 'Harita Mühendisi', icon: 'map-marked-alt', sub: 'Arsa Sınırı, Ölçüm' },
];

const FILTER_TABS = ['Tümü', 'Bekleyenler', 'Yanıtlananlar', 'Taslaklar'];

export default function OnlineDiscoveryScreen() {
    const navigation = useNavigation();

    // View State
    const [viewState, setViewState] = useState('INBOX');
    const [activeTab, setActiveTab] = useState('Tümü');

    // Data State
    const [titleText, setTitleText] = useState(''); // New Subject Line State
    const [messageText, setMessageText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // --- ACTIONS ---
    const handleBack = () => {
        if (viewState === 'INBOX') navigation.goBack();
        else if (viewState === 'INPUT') setViewState('INBOX');
        else if (viewState === 'CATEGORY') setViewState('INPUT');
    };

    const handleNewQuestion = () => setViewState('INPUT');

    const handleToCategory = () => {
        if (!messageText.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen sorunuzu kısaca yazın.");
            return;
        }
        setViewState('CATEGORY');
    };

    const handleFinish = (categoryTitle) => {
        Alert.alert(
            "Başarılı",
            `Sorunuz "${categoryTitle}" uzmanlarımıza iletildi.`,
            [{
                text: "Tamam", onPress: () => {
                    setMessageText('');
                    setSelectedCategory(null);
                    setViewState('INBOX');
                }
            }]
        );
    };

    // --- RENDERERS ---

    const renderHeader = () => {
        let title = "SORU & CEVAP";
        let subtitle = "";

        switch (viewState) {
            case 'INBOX': subtitle = "Sorularım"; break;
            case 'INPUT': subtitle = "Sorunu Anlat"; break;
            case 'CATEGORY': subtitle = "Uzman Seçimi"; break;
        }

        return (
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <Text style={styles.headerSubtitle}>{subtitle}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>
        );
    };

    // 1. INBOX VIEW (Refined)
    const renderInbox = () => (
        <View style={styles.contentContainer}>
            {/* TABS */}
            <View style={styles.tabContainer}>
                <FlatList
                    horizontal
                    data={FILTER_TABS}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.tabItem, activeTab === item && styles.tabItemActive]}
                            onPress={() => setActiveTab(item)}
                        >
                            <Text style={[styles.tabText, activeTab === item && styles.tabTextActive]}>
                                {item}
                                {item === 'Bekleyenler' && <Text style={{ color: GOLD_MAIN, fontSize: 10 }}>●</Text>}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* LIST */}
            <FlatList
                data={MOCK_PAST_QUESTIONS}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                ListEmptyComponent={<Text style={styles.emptyText}>Henüz bir sorunuz yok.</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.projectCard} activeOpacity={0.9}>
                        {/* Header: Icon - Title - ID */}
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.cardIconBox}>
                                <FontAwesome5 name={item.icon} size={16} color={GOLD_MAIN} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                            </View>
                            <Text style={styles.cardId}>#{item.id}</Text>
                        </View>

                        {/* Summary */}
                        <Text style={styles.cardSummary} numberOfLines={1}>
                            {item.summary}
                        </Text>

                        {/* Footer: Status - Date */}
                        <View style={styles.cardFooterRow}>
                            <Text style={styles.cardDate}>{item.date}</Text>

                            {/* Status Badge */}
                            <View style={styles.statusRow}>
                                {item.status === 'yanıtlandı' ? (
                                    <>
                                        <Text style={{ color: SUCCESS_GREEN, fontWeight: 'bold', fontSize: 12, marginRight: 5 }}>YANITLANDI</Text>
                                        <Ionicons name="checkmark-circle" size={14} color={SUCCESS_GREEN} />
                                    </>
                                ) : (
                                    <>
                                        <Text style={{ color: GOLD_MAIN, fontWeight: 'bold', fontSize: 12, marginRight: 5 }}>İNCELENİYOR</Text>
                                        {/* Spinning hourglass simulation layout */}
                                        <Ionicons name="hourglass" size={14} color={GOLD_MAIN} />
                                    </>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* FLOATING ACTION BUTTON (With Text) */}
            <TouchableOpacity style={styles.fabButton} onPress={handleNewQuestion} activeOpacity={0.8}>
                <Ionicons name="chatbubbles-outline" size={24} color="#000" />
                <Text style={styles.fabText}>Sohbet Başlat</Text>
            </TouchableOpacity>
        </View>
    );

    // 2. INPUT VIEW (Refined)
    const renderInput = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
            <View style={styles.contentContainer}>
                <Text style={styles.stepTitle}>Neyle ilgili destek almak istiyorsunuz?</Text>

                {/* Subject Line Input */}
                <TextInput
                    style={styles.subjectInput}
                    placeholder="Konu Başlığı (Örn: Kolon Çatlağı, Ruhsat Başvurusu)"
                    placeholderTextColor="#666"
                    value={titleText}
                    onChangeText={setTitleText}
                />

                {/* Main Description Input */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.msgInput}
                        multiline
                        placeholder="Sorunu detaylandırın: Yapı türü, binanın yaşı, hasarın konumu vb..."
                        placeholderTextColor="#666"
                        value={messageText}
                        onChangeText={setMessageText}
                    />
                </View>

                {/* Action Bar (Toolbar) */}
                <View style={styles.actionBar}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="camera" size={22} color={GOLD_MAIN} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="mic" size={22} color={GOLD_MAIN} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="location" size={22} color={GOLD_MAIN} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="attach" size={22} color={GOLD_MAIN} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <Text style={{ color: '#444', fontSize: 10 }}>Ekler</Text>
                </View>

                {/* Smart Tips (Instead of Warning Box) */}
                <View style={styles.smartTipsContainer}>
                    <View style={styles.tipRow}>
                        <Ionicons name="checkmark-sharp" size={14} color={SUCCESS_GREEN} style={{ marginRight: 6 }} />
                        <Text style={styles.tipText}>Geniş açı ve yakın çekim fotoğraf ekleyin.</Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Ionicons name="checkmark-sharp" size={14} color={SUCCESS_GREEN} style={{ marginRight: 6 }} />
                        <Text style={styles.tipText}>Varsa projenin ilgili paftasını ekleyin.</Text>
                    </View>
                </View>

                <View style={{ flex: 1 }} />

                <TouchableOpacity style={styles.bigButton} onPress={handleToCategory}>
                    <Text style={styles.bigButtonText}>İLERİ</Text>
                    <Ionicons name="chevron-forward" size={20} color="#000" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );

    // 3. CATEGORY VIEW
    const renderCategory = () => (
        <View style={styles.contentContainer}>
            <Text style={styles.stepTitle}>Bu soru en çok hangi alanla ilgili?</Text>
            <FlatList
                data={EXPERT_CATEGORIES_UPDATED}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingBottom: 150 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.expertCard}
                        onPress={() => handleFinish(item.title)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#1a1a1a', '#111']}
                            style={styles.expertCardGradient}
                        >
                            <View style={styles.iconCircle}>
                                <FontAwesome5 name={item.icon} size={24} color={GOLD_MAIN} />
                            </View>
                            <Text style={styles.expertTitle}>{item.title}</Text>
                            <Text style={styles.expertSub}>{item.sub}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
                ListFooterComponent={
                    <TouchableOpacity
                        style={styles.unsureButton}
                        onPress={() => handleFinish("Genel Destek")}
                    >
                        <Text style={styles.unsureText}>🤔 EMİN DEĞİLİM (Yönlendirmeyi Biz Yapalım)</Text>
                    </TouchableOpacity>
                }
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            {/* Technical Background Pattern Simulation */}
            <View style={styles.gridBackground}>
                <View style={styles.gridLineHorizontal} />
                <View style={styles.gridLineVertical} />
            </View>
            <LinearGradient colors={['rgba(0,0,0,0.8)', '#000']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                {renderHeader()}
                {viewState === 'INBOX' && renderInbox()}
                {viewState === 'INPUT' && renderInput()}
                {viewState === 'CATEGORY' && renderCategory()}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },

    // Grid Pattern (Simple Tech Look)
    gridBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.1, flexDirection: 'row', justifyContent: 'center' },
    gridLineHorizontal: { position: 'absolute', top: '20%', width: '100%', height: 1, backgroundColor: '#fff' },
    gridLineVertical: { position: 'absolute', left: '50%', height: '100%', width: 1, backgroundColor: '#fff' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222', zIndex: 10 },
    headerTitle: { color: GOLD_MAIN, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    headerSubtitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 8 },

    contentContainer: { flex: 1, padding: 20 },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },
    stepTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20, lineHeight: 28 },

    // TABS
    tabContainer: { flexDirection: 'row', marginBottom: 20, paddingBottom: 10 },
    tabItem: { marginRight: 20, paddingBottom: 5 },
    tabItemActive: { borderBottomWidth: 2, borderBottomColor: GOLD_MAIN },
    tabText: { color: '#999', fontSize: 14, fontWeight: '600' }, // Lightened from #666
    tabTextActive: { color: '#fff' },

    // PROJECT CARDS (Technical Look)
    projectCard: {
        backgroundColor: '#121212', borderRadius: 12, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#333',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4
    },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    cardIconBox: {
        width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#222'
    },
    cardTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 },
    cardId: { color: '#444', fontSize: 12, fontWeight: 'bold' },

    cardSummary: { color: '#CCC', fontSize: 13, marginBottom: 12, paddingLeft: 44 }, // Lightened from #888

    cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 44 },
    cardDate: { color: '#666', fontSize: 11 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },

    // FLOATING BUTTON (Start Chat)
    fabButton: {
        position: 'absolute', bottom: 30, alignSelf: 'center',
        paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30,
        backgroundColor: GOLD_MAIN,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: GOLD_MAIN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8
    },
    fabText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }, // New text style

    // INPUT & REST (Refined)
    subjectInput: {
        backgroundColor: '#1a1a1a', borderRadius: 12, padding: 15,
        color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 12,
        borderWidth: 1, borderColor: '#333'
    },
    inputWrapper: {
        backgroundColor: '#1a1a1a', borderTopLeftRadius: 12, borderTopRightRadius: 12,
        padding: 15, minHeight: 150, borderWidth: 1, borderColor: '#333', borderBottomWidth: 0
    },
    msgInput: { color: '#fff', fontSize: 16, textAlignVertical: 'top', flex: 1, lineHeight: 24 },

    // Action Bar (Toolbar)
    actionBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#222', borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
        paddingHorizontal: 10, paddingVertical: 8,
        borderWidth: 1, borderColor: '#333', borderTopWidth: 0, marginBottom: 20
    },
    actionBtn: { padding: 8, marginRight: 5, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },

    // Smart Tips
    smartTipsContainer: { opacity: 0.8, marginBottom: 20 },
    tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    tipText: { color: '#888', fontSize: 12 },

    // CATEGORY (Reused)
    expertCard: { width: '48%', height: 150, marginBottom: 15, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    expertCardGradient: { flex: 1, padding: 15, justifyContent: 'center', alignItems: 'center' },
    iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    expertTitle: { color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center', marginBottom: 6 },
    expertSub: { color: '#666', fontSize: 11, textAlign: 'center', lineHeight: 14, paddingHorizontal: 2 },
    unsureButton: { marginTop: 10, padding: 16, backgroundColor: '#222', borderRadius: 16, borderWidth: 1, borderColor: '#444', borderStyle: 'dashed', alignItems: 'center' },
    unsureText: { color: '#aaa', fontSize: 14, fontWeight: '600' },

    // GLOBAL BUTTON
    bigButton: {
        backgroundColor: GOLD_MAIN, flexDirection: 'row', height: 56, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: GOLD_MAIN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6
    },
    bigButtonText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});
