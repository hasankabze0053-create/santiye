import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Dimensions, FlatList, InputAccessoryView, Keyboard, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---

// ... (rest of styles)

// --- CONSTANTS ---
// --- CONSTANTS ---
const GOLD_MAIN = '#C69C3A'; // Deep Premium Gold
const GOLD_DARK = '#8C6C1D';
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
        setViewState('SUCCESS');
    };

    // --- RENDERERS ---

    const renderHeader = () => {
        let title = "SORU & CEVAP";
        let subtitle = "";

        switch (viewState) {
            case 'INBOX': subtitle = "Sorularım"; break;
            case 'INPUT': subtitle = "Sorunu Anlat"; break;
            case 'CATEGORY': subtitle = "Uzman Seçimi"; break;
            case 'SUCCESS': subtitle = "İşlem Tamamlandı"; break;
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
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={styles.fabButton}
                    onPress={() => setViewState('INPUT')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={28} color="#000" />
                    <Text style={styles.fabText}>Yeni Talep Oluştur</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // 2. INPUT VIEW (Refined)
    const renderInput = () => (
        <View style={{ flex: 1 }}>
            <View style={styles.contentContainer}>
                <Text style={styles.stepTitle}>Neyle ilgili destek almak istiyorsunuz?</Text>

                {/* Subject Line Input */}
                <TextInput
                    style={styles.subjectInput}
                    placeholder="Konu Başlığı (Örn: Kolon Çatlağı...)"
                    placeholderTextColor="#AAAAAA"
                    value={titleText}
                    onChangeText={setTitleText}
                    inputAccessoryViewID="doneToolbar"
                />

                {/* Main Description Input */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.msgInput}
                        multiline
                        placeholder="Sorunu detaylandırın: Yapı türü, binanın yaşı, hasarın konumu vb..."
                        placeholderTextColor="#AAAAAA"
                        value={messageText}
                        onChangeText={setMessageText}
                        inputAccessoryViewID="doneToolbar"
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
            </View>

            {/* Sticky Bottom Button */}
            <View style={styles.bottomLayout}>
                <TouchableOpacity style={styles.goldFullButton} onPress={handleToCategory}>
                    <Text style={styles.goldMediumButtonText}>Uzman Seçimine Geç</Text>
                    <Ionicons name="chevron-forward" size={24} color="#000" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            </View>


        </View>
    );

    // 3. CATEGORY VIEW (Redesigned with Selection Logic)
    const renderCategory = () => (
        <View style={{ flex: 1 }}>
            <View style={styles.contentContainer}>
                <View style={{ marginBottom: 25 }}>
                    <Text style={styles.stepTitle}>İlgili Uzmanlık Alanı</Text>
                    <Text style={styles.stepSubtitle}>Sorunuzun en hızlı çözümü için doğru departmanı seçin.</Text>
                </View>

                <FlatList
                    data={EXPERT_CATEGORIES_UPDATED}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => {
                        const isSelected = selectedCategory === item.title;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.expertBox,
                                    isSelected && { borderColor: GOLD_MAIN, backgroundColor: 'rgba(255,215,0,0.05)' }
                                ]}
                                onPress={() => setSelectedCategory(item.title)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.expertHeader}>
                                    <FontAwesome5
                                        name={item.icon}
                                        size={24}
                                        color={isSelected ? GOLD_MAIN : '#CCC'}
                                    />
                                    {isSelected && <Ionicons name="checkmark-circle" size={18} color={GOLD_MAIN} />}
                                </View>

                                <Text style={[styles.expertBoxTitle, isSelected && { color: GOLD_MAIN }]}>
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                    ListFooterComponent={
                        <TouchableOpacity
                            style={[
                                styles.conciergeCard,
                                selectedCategory === "Genel Destek" && { borderColor: GOLD_MAIN, backgroundColor: 'rgba(255,215,0,0.05)' }
                            ]}
                            onPress={() => setSelectedCategory("Genel Destek")}
                            activeOpacity={0.9}
                        >
                            <View style={styles.conciergeIconBox}>
                                <FontAwesome5 name="question" size={24} color="#000" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.conciergeTitle, selectedCategory === "Genel Destek" && { color: GOLD_MAIN }]}>
                                    Talebi Biz Yönlendirelim
                                </Text>
                                <Text style={styles.conciergeSub}>Konu hakkında emin değilseniz teknik ekibimiz incelesin.</Text>
                            </View>
                        </TouchableOpacity>
                    }
                />
            </View>

            {/* Sticky Bottom Button */}
            <View style={styles.bottomLayout}>
                <TouchableOpacity
                    style={[styles.goldFullButton, !selectedCategory && { opacity: 0.5 }]}
                    onPress={() => selectedCategory && handleFinish(selectedCategory)}
                    disabled={!selectedCategory}
                >
                    <Text style={styles.goldFullButtonText}>Onayla ve Gönder</Text>
                    <Ionicons name="checkmark-sharp" size={24} color="#000" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            </View>
        </View>
    );



    // 4. SUCCESS VIEW (New Premium)
    const renderSuccess = () => (
        <View style={styles.contentContainer}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{
                    width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    justifyContent: 'center', alignItems: 'center', marginBottom: 30,
                    borderWidth: 2, borderColor: GOLD_MAIN
                }}>
                    <Ionicons name="checkmark" size={60} color={GOLD_MAIN} />
                </View>

                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>
                    Talep Alındı
                </Text>

                <Text style={{ color: '#CCC', fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 }}>
                    Talebiniz ilgili uzmana yönlendirilmiştir.{'\n'}En kısa sürede tarafınıza dönüş yapılacaktır.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.goldFullButton}
                onPress={() => {
                    setMessageText('');
                    setTitleText('');
                    setSelectedCategory(null);
                    setViewState('INBOX');
                }}
            >
                <Text style={styles.goldFullButtonText}>Sorularıma Dön</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            {/* Technical Background Pattern Simulation */}
            <View style={styles.gridBackground} >
                <View style={styles.gridLineHorizontal} />
                <View style={styles.gridLineVertical} />
            </View >
            <LinearGradient colors={['rgba(0,0,0,0.8)', '#000']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                {renderHeader()}
                {viewState === 'INBOX' && renderInbox()}
                {viewState === 'INPUT' && renderInput()}
                {viewState === 'CATEGORY' && renderCategory()}
                {viewState === 'SUCCESS' && renderSuccess()}
            </SafeAreaView>

            {/* Keyboard Accessory View (Global for this screen) */}
            {Platform.OS === 'ios' && (
                <InputAccessoryView nativeID="doneToolbar">
                    <View style={styles.keyboardToolbar}>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.doneButton}>
                            <Text style={styles.doneButtonText}>Bitti</Text>
                        </TouchableOpacity>
                    </View>
                </InputAccessoryView>
            )}
        </View >
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
        backgroundColor: '#1a1a1a', borderRadius: 18, paddingHorizontal: 20, height: 60,
        color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 20,
        borderWidth: 1.5, borderColor: '#333',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3
    },
    inputWrapper: {
        backgroundColor: '#1a1a1a', borderTopLeftRadius: 18, borderTopRightRadius: 18,
        padding: 20, minHeight: 280, borderWidth: 1, borderColor: '#333', borderBottomWidth: 0
    },
    msgInput: { color: '#fff', fontSize: 18, textAlignVertical: 'top', flex: 1, lineHeight: 28 },

    // Action Bar (Toolbar)
    actionBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#222', borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
        paddingHorizontal: 20, paddingVertical: 15,
        borderWidth: 1, borderColor: '#333', borderTopWidth: 0, marginBottom: 25
    },
    actionBtn: { padding: 8, marginRight: 25, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },

    // Smart Tips
    smartTipsContainer: { opacity: 0.8, marginBottom: 20 },
    tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    tipText: { color: '#888', fontSize: 12 },

    // CATEGORY (Redesigned)
    stepSubtitle: { color: '#888', fontSize: 13, marginTop: -15, marginBottom: 20 },

    expertBox: {
        width: '48%', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
        marginBottom: 15, borderWidth: 1, borderColor: '#333',
        minHeight: 120, justifyContent: 'space-between'
    },
    expertHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    expertBoxTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

    // Concierge Card
    conciergeCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#151515', borderRadius: 16, padding: 16, marginTop: 10,
        borderWidth: 1, borderColor: '#333'
    },
    conciergeIconBox: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD_MAIN,
        alignItems: 'center', justifyContent: 'center', marginRight: 15
    },
    conciergeTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    conciergeSub: { color: '#CCC', fontSize: 11, marginTop: 2, paddingRight: 10 },

    // Bottom Sticky Layout
    bottomLayout: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#000', padding: 20, paddingBottom: 30,
        borderTopWidth: 1, borderTopColor: '#222'
    },
    goldFullButton: {
        backgroundColor: GOLD_MAIN, borderRadius: 25, height: 60,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        shadowColor: GOLD_MAIN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10
    },
    goldFullButtonText: { color: '#000', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
    goldMediumButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },

    // GLOBAL BUTTON (Keep if used elsewhere, currently Step 2 uses bigButton not this one)
    bigButton: {
        backgroundColor: GOLD_MAIN, flexDirection: 'row', height: 56, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: GOLD_MAIN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6
    },
    bigButtonText: { color: '#000', fontWeight: '600', fontSize: 15, letterSpacing: 0.5 },

    // Keyboard Toolbar
    keyboardToolbar: {
        width: width, height: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
        backgroundColor: '#1a1a1a', borderTopWidth: 1, borderTopColor: '#333', paddingHorizontal: 15
    },
    doneButton: { padding: 5 },
    doneButtonText: { color: GOLD_MAIN, fontSize: 16, fontWeight: 'bold' },
});
