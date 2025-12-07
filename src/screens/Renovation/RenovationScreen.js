import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const PROJECTS = [
    {
        id: '1',
        title: 'Lüks Daire Tadilatı',
        location: 'Caddebostan, İstanbul',
        status: 'Devam Ediyor',
        progress: 0.65,
        image: { uri: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&auto=format&fit=crop' },
        tasks: 'Boya, Parke, Mutfak',
        date: 'Bitiş: 15 Haz'
    },
    {
        id: '2',
        title: 'Ofis Renovasyonu',
        location: 'Maslak, İstanbul',
        status: 'Keşif Bekleniyor',
        progress: 0.1,
        image: { uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop' },
        tasks: 'Alçıpan, Elektrik, Cam',
        date: 'Başlangıç: 20 Haz'
    },
    {
        id: '3',
        title: 'Villa Dış Cephe',
        location: 'Zekeriyaköy, İstanbul',
        status: 'Planlanıyor',
        progress: 0.0,
        image: { uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop' },
        tasks: 'Mantolama, Boya, Çatı',
        date: 'Başlangıç: 1 Tem'
    }
];

const SERVICES = [
    { id: 1, title: 'Boya & Badana', icon: 'paint-roller' },
    { id: 2, title: 'Alçı & Kartonpiyer', icon: 'ruler-combined' },
    { id: 3, title: 'Elektrik & Tesisat', icon: 'bolt' },
    { id: 4, title: 'Mutfak & Banyo', icon: 'faucet' },
];

export default function RenovationScreen({ navigation }) {
    const [filter, setFilter] = useState('All');

    const renderProjectCard = ({ item, index }) => (
        <Animated.View key={item.id} entering={FadeInDown.delay(index * 200).springify()}>
            <TouchableOpacity style={styles.projectCard} activeOpacity={0.9}>
                <Image source={item.image} style={styles.projectImage} />
                <View style={styles.projectOverlay}>
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.95)']}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.projectContent}>
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: item.progress > 0.5 ? COLORS.success : COLORS.accent }]} />
                            <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                        <Text style={styles.projectTitle}>{item.title}</Text>
                        <Text style={styles.projectLocation}>{item.location}</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
                            </View>
                            <Text style={styles.progressText}>%{Math.round(item.progress * 100)}</Text>
                        </View>

                        <View style={styles.metaRow}>
                            <MaterialCommunityIcons name="calendar-clock" size={14} color="#888" />
                            <Text style={styles.metaText}>{item.date}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background: Classic Platinum Grey Gradient */}
            <LinearGradient
                colors={['#4b5052', '#212121', '#0f0f0f']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>PROJELERİM</Text>
                        <Text style={styles.headerSubtitle}>Tadilat ve Renovasyon Takibi</Text>

                        {/* Quick Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>12</Text>
                                <Text style={styles.statLabel}>Tamamlanan</Text>
                            </View>
                            <View style={[styles.statBox, styles.statBoxActive]}>
                                <Text style={[styles.statValue, { color: '#000' }]}>3</Text>
                                <Text style={[styles.statLabel, { color: '#333' }]}>Devam Eden</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>₺450k</Text>
                                <Text style={styles.statLabel}>Toplam Bütçe</Text>
                            </View>
                        </View>
                    </View>

                    {/* AI Architect Promo */}
                    <TouchableOpacity
                        style={styles.aiBanner}
                        onPress={() => navigation.navigate('AI_Galeri')}
                    >
                        <LinearGradient
                            colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 215, 0, 0.05)']}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <View style={styles.aiContent}>
                            <View>
                                <Text style={styles.aiTitle}>CEBİMDEKİ MİMAR</Text>
                                <Text style={styles.aiDesc}>Yapay zeka ile odanı tasarla & maliyet hesapla.</Text>
                            </View>
                            <View style={styles.aiIconBox}>
                                <MaterialCommunityIcons name="robot" size={24} color={COLORS.accent} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Services Horizontal Scroll */}
                    <Text style={styles.sectionHeader}>HIZLI HİZMETLER</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
                        {SERVICES.map((service, index) => (
                            <TouchableOpacity key={service.id} style={styles.serviceCard}>
                                <View style={styles.serviceIcon}>
                                    <FontAwesome5 name={service.icon} size={20} color={COLORS.accent} />
                                </View>
                                <Text style={styles.serviceText}>{service.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Active Projects List */}
                    <Text style={styles.sectionHeader}>AKTİF ŞANTİYELER</Text>
                    <View style={styles.projectsContainer}>
                        {PROJECTS.map((item, index) => renderProjectCard({ item, index }))}
                    </View>

                </ScrollView>

                {/* FAB: Add New Project */}
                <TouchableOpacity style={styles.fabBtn}>
                    <Ionicons name="add" size={32} color="#000" />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f0f' },
    scrollContent: { paddingBottom: 100 },

    // Header
    headerContainer: { padding: 24, paddingBottom: 10 },
    headerTitle: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
    headerSubtitle: { color: '#888', fontSize: 14, marginTop: 4, letterSpacing: 0.5 },

    // Stats
    statsRow: { flexDirection: 'row', marginTop: 24, justifyContent: 'space-between' },
    statBox: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
        padding: 16, marginRight: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    statBoxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent, marginRight: 0 },
    statValue: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
    statLabel: { color: '#888', fontSize: 10, marginTop: 4, fontWeight: '600' },

    // AI Banner
    aiBanner: {
        marginHorizontal: 24, marginTop: 24, height: 80, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', overflow: 'hidden',
        justifyContent: 'center', paddingHorizontal: 20
    },
    aiContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    aiTitle: { color: COLORS.accent, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    aiDesc: { color: '#aaa', fontSize: 11, marginTop: 4 },
    aiIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },

    // Services
    sectionHeader: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1, marginLeft: 24, marginTop: 32, marginBottom: 16 },
    servicesScroll: { paddingLeft: 24 },
    serviceCard: {
        width: 120, height: 100, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
        marginRight: 12, padding: 12, justifyContent: 'space-between',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    serviceIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,215,0,0.1)', alignItems: 'center', justifyContent: 'center' },
    serviceText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    // Projects
    projectsContainer: { paddingHorizontal: 24 },
    projectCard: {
        height: 240, marginBottom: 24, borderRadius: 20, overflow: 'hidden', backgroundColor: '#1E1E1E',
        ...SHADOWS.medium
    },
    projectImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    projectOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, justifyContent: 'flex-end', padding: 20 },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12
    },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    projectTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
    projectLocation: { color: '#ccc', fontSize: 12, marginTop: 4, marginBottom: 16 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    progressBarBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginRight: 12 },
    progressBarFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 2 },
    progressText: { color: COLORS.accent, fontSize: 12, fontWeight: 'bold' },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    metaText: { color: '#888', fontSize: 11, marginLeft: 6 },

    // FAB
    fabBtn: {
        position: 'absolute', bottom: 120, right: 24, width: 64, height: 64, borderRadius: 32,
        backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
        shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8
    }
});
