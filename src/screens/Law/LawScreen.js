import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
const GOLD_DARK = '#FF9100';      // Deep Amber
const GOLD_MAIN = '#FFD700';      // Safety Yellow / Standard Gold
const GOLD_LIGHT = '#FFE57F';     // Light Amber
const DANGER_RED = '#EF4444';     // Emergency Red

// Blinking Icon Component
const BlinkingIcon = ({ name, size, color }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true })
            ])
        ).start();
    }, []);
    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <MaterialCommunityIcons name={name} size={size} color={color} />
        </Animated.View>
    );
};

// Standard Gold Card
const GoldCard = ({ children, style, onPress }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.goldCardContainer, style]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
            colors={[GOLD_MAIN, 'rgba(197, 160, 89, 0.1)', GOLD_MAIN]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.goldBorderGradient}
        />
        <View style={styles.cardContent}>
            {children}
        </View>
    </TouchableOpacity>
);

// Emergency Card (Red)
const EmergencyCard = ({ children, style, onPress }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.goldCardContainer, style, styles.emergencyShadow]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
            colors={[DANGER_RED, 'rgba(239, 68, 68, 0.1)', DANGER_RED]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.goldBorderGradient}
        />
        <View style={[styles.cardContent, styles.redCardBg]}>
            {children}
        </View>
    </TouchableOpacity>
);

export default function LawScreen() {
    const navigation = useNavigation();
    const [expertMatchInput, setExpertMatchInput] = useState('');
    const [activePage, setActivePage] = useState(0);

    const handleQuickTool = (toolName) => {
        Alert.alert("Hızlı İşlem", `${toolName} modülü başlatılıyor...`);
    };

    const handleScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActivePage(roundIndex);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />

            {/* Background */}
            <LinearGradient
                colors={['#1c1c1c', '#000000']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>HUKUKİ ÇÖZÜM</Text>
                            <Text style={styles.headerSubtitle}>MERKEZİ</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.headerIconBtn}
                            onPress={() => navigation.navigate('LawyerDashboard')}
                        >
                            <LinearGradient
                                colors={[GOLD_LIGHT, GOLD_MAIN]}
                                style={styles.iconGradient}
                            >
                                <MaterialCommunityIcons name="scale-balance" size={22} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* 1. SECTION: QUICK TOOLS PAGER */}
                    <Text style={styles.sectionHeader}>HIZLI İŞLEMLER</Text>

                    <View style={styles.pagerContainer}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            style={styles.pagerScroll}
                        >
                            {/* PAGE 1: SITE & EMERGENCY */}
                            <View style={styles.page}>
                                <View style={styles.gridContainer}>
                                    {/* 1. ACİL (RED) */}
                                    <EmergencyCard style={styles.gridItem} onPress={() => handleQuickTool('ACİL İŞ KAZASI')}>
                                        <View style={styles.iconBox}>
                                            <BlinkingIcon name="ambulance" size={32} color={DANGER_RED} />
                                        </View>
                                        <Text style={[styles.gridTitle, { color: '#FFF', fontWeight: 'bold' }]}>🚨 İŞ KAZASI{'\n'}& BASKIN</Text>
                                    </EmergencyCard>

                                    {/* 2. SÖZLEŞME (GOLD) */}
                                    <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('SÖZLEŞME')}>
                                        <View style={styles.iconBox}>
                                            <FontAwesome5 name="file-contract" size={24} color={GOLD_MAIN} />
                                        </View>
                                        <Text style={styles.gridTitle}>📄 SÖZLEŞME{'\n'}& HAKEDİŞ</Text>
                                    </GoldCard>

                                    {/* 3. TAŞERON (GOLD) */}
                                    <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('TAŞERON')}>
                                        <View style={styles.iconBox}>
                                            <MaterialCommunityIcons name="account-hard-hat" size={28} color={GOLD_MAIN} />
                                        </View>
                                        <Text style={styles.gridTitle}>👷‍♂️ TAŞERON{'\n'}& İŞÇİ</Text>
                                    </GoldCard>

                                    {/* 4. İMAR (GOLD) */}
                                    <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('İMAR')}>
                                        <View style={styles.iconBox}>
                                            <MaterialCommunityIcons name="bank-outline" size={28} color={GOLD_MAIN} />
                                        </View>
                                        <Text style={styles.gridTitle}>🏛️ İMAR &{'\n'}CEZA</Text>
                                    </GoldCard>
                                </View>
                            </View>

                            {/* PAGE 2: OFFICE & TRADE */}
                            <View style={styles.page}>
                                <View style={styles.gridContainer}>
                                    {/* 5. KENTSEL DÖNÜŞÜM */}
                                    <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('KENTSEL DÖNÜŞÜM')}>
                                        <View style={styles.iconBox}>
                                            <MaterialCommunityIcons name="crane" size={28} color={GOLD_MAIN} />
                                        </View>
                                        <Text style={styles.gridTitle}>🏗️ KENTSEL{'\n'}DÖNÜŞÜM</Text>
                                    </GoldCard>

                                    {/* 6. MALZEME & TEDARİKÇİ */}
                                    <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('MALZEME')}>
                                        <View style={styles.iconBox}>
                                            <MaterialCommunityIcons name="wall" size={28} color={GOLD_MAIN} />
                                        </View>
                                        <Text style={styles.gridTitle}>🧱 MALZEME &{'\n'}TEDARİKÇİ</Text>
                                    </GoldCard>

                                    {/* 7. ŞİRKET & SGK */}
                                    <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('ŞİRKET')}>
                                        <View style={styles.iconBox}>
                                            <MaterialCommunityIcons name="briefcase-variant-outline" size={28} color={GOLD_MAIN} />
                                        </View>
                                        <Text style={styles.gridTitle}>💼 ŞİRKET{'\n'}& SGK</Text>
                                    </GoldCard>

                                    {/* 8. EMLAK HUKUKU */}
                                    <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('EMLAK')}>
                                        <View style={styles.iconBox}>
                                            <MaterialCommunityIcons name="home-city-outline" size={28} color={GOLD_MAIN} />
                                        </View>
                                        <Text style={styles.gridTitle}>🏠 EMLAK{'\n'}HUKUKU</Text>
                                    </GoldCard>
                                </View>
                            </View>
                        </ScrollView>

                        {/* PAGINATION DOTS */}
                        <View style={styles.pagination}>
                            <View style={[styles.dot, activePage === 0 ? styles.activeDot : styles.inactiveDot]} />
                            <View style={[styles.dot, activePage === 1 ? styles.activeDot : styles.inactiveDot]} />
                        </View>
                    </View>

                    {/* 2. SECTION: AI SMART MATCH (BOTTOM) */}
                    <View style={styles.aiSection}>
                        {/* Glow Behind */}
                        <LinearGradient
                            colors={['rgba(255, 191, 0, 0.1)', 'transparent']}
                            style={styles.heroGlow}
                        />

                        <Text style={styles.aiTitle}>AVUKAT İÇİN VAKA BİLDİRİMİ</Text>
                        <Text style={styles.aiSubtitle}>Sorununuzu detaylıca anlatın, uzman avukat kadromuza anında iletilsin.</Text>

                        <View style={styles.aiInputContainer}>
                            <TextInput
                                style={styles.aiInput}
                                placeholder="Konuyu buraya yazın veya mikrofonla anlatın..."
                                placeholderTextColor="#666"
                                value={expertMatchInput}
                                onChangeText={setExpertMatchInput}
                                multiline
                            />
                            <TouchableOpacity style={styles.micBtn}>
                                <Ionicons name="mic" size={22} color={GOLD_MAIN} />
                            </TouchableOpacity>
                        </View>

                        {/* BIG GOLD ACTION BUTTON */}
                        <TouchableOpacity style={styles.bigActionBtn} activeOpacity={0.9} onPress={() => Alert.alert('Yapay Zeka', 'Analiz başlatılıyor...')}>
                            <LinearGradient
                                colors={[GOLD_MAIN, GOLD_DARK]}
                                style={styles.bigBtnGradient}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.bigBtnText}>İNCELEME BAŞLAT</Text>
                                <MaterialCommunityIcons name="arrow-right-circle" size={24} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { paddingBottom: 50 }, // Removed horizontal padding from container to let Pager take full width if needed, but inner pages have padding

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingHorizontal: 20, marginTop: 20 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '300', letterSpacing: 2 },
    headerSubtitle: { color: GOLD_MAIN, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
    headerIconBtn: { borderRadius: 12, overflow: 'hidden' },
    iconGradient: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

    // Pager System
    sectionHeader: { color: '#666', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 15, marginTop: 10, paddingHorizontal: 20 },
    pagerContainer: { marginBottom: 30 },
    pagerScroll: {},
    page: { width: width, paddingHorizontal: 20 }, // Full width, with padding inside
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },

    goldCardContainer: {
        width: '48%', height: 120, borderRadius: 20,
        overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(255,255,255,0.02)'
    },
    goldBorderGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3 },
    cardContent: { flex: 1, margin: 1, backgroundColor: '#0f0f0f', borderRadius: 19, alignItems: 'center', justifyContent: 'center', padding: 10 },

    emergencyShadow: { shadowColor: '#EF4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
    redCardBg: { backgroundColor: 'rgba(40, 5, 5, 0.95)' },

    iconBox: { marginBottom: 10, opacity: 0.9 },
    gridTitle: { color: '#ddd', fontSize: 11, textAlign: 'center', fontWeight: 'bold', lineHeight: 15 },

    // Pagination
    pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 15 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    activeDot: { backgroundColor: GOLD_MAIN, width: 20 },
    inactiveDot: { backgroundColor: '#333' },

    // AI Section (BOTTOM)
    aiSection: { position: 'relative', marginTop: 10, paddingHorizontal: 20 },
    heroGlow: { position: 'absolute', top: -30, left: -20, right: -20, height: 150, opacity: 0.6 },

    aiTitle: { color: GOLD_MAIN, fontSize: 12, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 },

    aiInputContainer: {
        backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        padding: 5, minHeight: 100, marginBottom: 20
    },
    aiInput: { flex: 1, color: '#fff', fontSize: 15, padding: 15, textAlignVertical: 'top' },
    micBtn: { position: 'absolute', bottom: 10, right: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },

    bigActionBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: GOLD_MAIN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    bigBtnGradient: { padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    bigBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

});
