import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CorporateDashboardScreen() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark' || true; // Force Dark Default
    const navigation = useNavigation();

    // TOGGLE FOR TESTING: Set to true to see the Dashboard, false for Onboarding
    const [hasCompanyProfile, setHasCompanyProfile] = useState(false);

    const theme = {
        background: isDarkMode ? '#000000' : '#F2F2F7',
        card: isDarkMode ? '#1C1C1E' : '#FFFFFF',
        text: isDarkMode ? '#FFFFFF' : '#121212',
        subText: isDarkMode ? '#8E8E93' : '#636366',
        accent: isDarkMode ? '#FDCB58' : '#121212',
        iconBg: isDarkMode ? '#2C2C2E' : '#E5E5EA',
        border: isDarkMode ? '#333333' : '#E5E5EA',
        success: '#34C759',
    };

    // --- STATE A: ONBOARDING SELECTOR ---
    const renderOnboarding = () => (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.iconBg }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Hizmet Veren Ol</Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.subText }]}>
                İşini büyütmek için hangi alanda hizmet veriyorsun?
            </Text>

            {/* Cards */}
            <View style={styles.cardsContainer}>
                {/* 1. Machine Owner */}
                <TouchableOpacity
                    style={[styles.roleCard, { backgroundColor: theme.card }]}
                    onPress={() => setHasCompanyProfile(true)}
                    activeOpacity={0.9}
                >
                    <View style={[styles.roleIconBox, { backgroundColor: theme.iconBg }]}>
                        <MaterialCommunityIcons name="tractor" size={32} color={theme.accent} />
                    </View>
                    <View style={styles.roleContent}>
                        <Text style={[styles.roleTitle, { color: theme.text }]}>Makine Parkı Yönetimi</Text>
                        <Text style={[styles.roleDesc, { color: theme.subText }]}>
                            İş makinelerini kiraya ver, boş yatmasın.
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.subText} />
                </TouchableOpacity>

                {/* 2. Material Seller */}
                <TouchableOpacity
                    style={[styles.roleCard, { backgroundColor: theme.card }]}
                    onPress={() => setHasCompanyProfile(true)}
                    activeOpacity={0.9}
                >
                    <View style={[styles.roleIconBox, { backgroundColor: theme.iconBg }]}>
                        <MaterialCommunityIcons name="store" size={32} color={theme.accent} />
                    </View>
                    <View style={styles.roleContent}>
                        <Text style={[styles.roleTitle, { color: theme.text }]}>Malzeme Satışı</Text>
                        <Text style={[styles.roleDesc, { color: theme.subText }]}>
                            İnşaat malzemelerini binlerce alıcıya ulaştır.
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.subText} />
                </TouchableOpacity>

                {/* 3. Contractor */}
                <TouchableOpacity
                    style={[styles.roleCard, { backgroundColor: theme.card }]}
                    onPress={() => setHasCompanyProfile(true)}
                    activeOpacity={0.9}
                >
                    <View style={[styles.roleIconBox, { backgroundColor: theme.iconBg }]}>
                        <MaterialCommunityIcons name="hard-hat" size={32} color={theme.accent} />
                    </View>
                    <View style={styles.roleContent}>
                        <Text style={[styles.roleTitle, { color: theme.text }]}>Müteahhitlik & Teklif</Text>
                        <Text style={[styles.roleDesc, { color: theme.subText }]}>
                            Kentsel dönüşüm projelerine teklif ver.
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.subText} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    // --- STATE B: DASHBOARD ---
    const renderDashboard = () => (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.dashboardHeader}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.iconBg }]}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={[styles.badgeContainer, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                        <MaterialCommunityIcons name="check-decagram" size={16} color={theme.success} />
                        <Text style={[styles.badgeText, { color: theme.success }]}>Onaylı Tedarikçi</Text>
                    </View>
                </View>

                <View style={styles.companyInfo}>
                    <View style={styles.companyAvatar}>
                        <MaterialCommunityIcons name="office-building" size={32} color={theme.accent} />
                    </View>
                    <View>
                        <Text style={[styles.companyName, { color: theme.text }]}>Demir İnşaat & Hafriyat</Text>
                        <View style={styles.ratingRow}>
                            <MaterialCommunityIcons name="star" size={16} color={theme.accent} />
                            <Text style={[styles.ratingText, { color: theme.text }]}>4.8</Text>
                            <Text style={[styles.ratingCount, { color: theme.subText }]}>(124 Değerlendirme)</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Financial Summary */}
            <View style={styles.financialRow}>
                <View style={[styles.financialCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.financialLabel, { color: theme.subText }]}>Toplam Kazanç</Text>
                    <Text style={[styles.financialValue, { color: theme.accent }]}>₺485.000</Text>
                </View>
                <View style={[styles.financialCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.financialLabel, { color: theme.subText }]}>Aktif İşler</Text>
                    <Text style={[styles.financialValue, { color: theme.text }]}>4 Proje</Text>
                </View>
            </View>

            {/* Modules Grid */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Yönetim Paneli</Text>
            <View style={styles.gridContainer}>
                {/* Module 1 */}
                <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card }]}>
                    <View style={[styles.gridIconBox, { backgroundColor: theme.iconBg }]}>
                        <MaterialCommunityIcons name="tractor" size={28} color={theme.accent} />
                    </View>
                    <Text style={[styles.gridTitle, { color: theme.text }]}>Makine Parkım</Text>
                    <Text style={[styles.gridDesc, { color: theme.subText }]}>Filo yönetimi</Text>
                </TouchableOpacity>

                {/* Module 2 */}
                <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card }]}>
                    <View style={[styles.gridIconBox, { backgroundColor: theme.iconBg }]}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={28} color={theme.accent} />
                        <View style={styles.notificationDot} />
                    </View>
                    <Text style={[styles.gridTitle, { color: theme.text }]}>Gelen Talepler</Text>
                    <Text style={[styles.gridDesc, { color: theme.subText }]}>3 Yeni Talep</Text>
                </TouchableOpacity>

                {/* Module 3 */}
                <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card }]}>
                    <View style={[styles.gridIconBox, { backgroundColor: theme.iconBg }]}>
                        <MaterialCommunityIcons name="briefcase-search-outline" size={28} color={theme.accent} />
                    </View>
                    <Text style={[styles.gridTitle, { color: theme.text }]}>İhaleler</Text>
                    <Text style={[styles.gridDesc, { color: theme.subText }]}>Fırsatları yakala</Text>
                </TouchableOpacity>

                {/* Module 4 */}
                <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card }]}>
                    <View style={[styles.gridIconBox, { backgroundColor: theme.iconBg }]}>
                        <MaterialCommunityIcons name="account-group-outline" size={28} color={theme.accent} />
                    </View>
                    <Text style={[styles.gridTitle, { color: theme.text }]}>Personel</Text>
                    <Text style={[styles.gridDesc, { color: theme.subText }]}>Ekip yönetimi</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setHasCompanyProfile(false)} style={{ marginTop: 40, alignSelf: 'center' }}>
                <Text style={{ color: theme.subText, fontSize: 12 }}>[Geliştirici: Moda Dönmek İçin Tıkla]</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            {hasCompanyProfile ? renderDashboard() : renderOnboarding()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 50 },

    // Onboarding Styles
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingTop: 20 },
    backBtn: { padding: 8, borderRadius: 12, marginRight: 16 },
    headerTitle: { fontSize: 24, fontWeight: '800' },
    headerSubtitle: { fontSize: 16, marginBottom: 30, lineHeight: 22 },
    cardsContainer: { gap: 16 },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    roleIconBox: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    roleContent: { flex: 1 },
    roleTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    roleDesc: { fontSize: 13, lineHeight: 18 },

    // Dashboard Styles
    dashboardHeader: { marginBottom: 24, paddingTop: 10 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
    companyInfo: { flexDirection: 'row', alignItems: 'center' },
    companyAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(253, 203, 88, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(253, 203, 88, 0.3)',
    },
    companyName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: 14, fontWeight: '700', marginLeft: 4, marginRight: 4 },
    ratingCount: { fontSize: 12 },

    financialRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    financialCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    financialLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
    financialValue: { fontSize: 22, fontWeight: '800' },

    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gridItem: {
        width: '48%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        minHeight: 140, // Uniform height
    },
    gridIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    gridTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    gridDesc: { fontSize: 12 },
    notificationDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF3B30',
        borderWidth: 2,
        borderColor: '#1C1C1E',
    }
});
