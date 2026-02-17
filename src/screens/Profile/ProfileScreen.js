import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const PROFILE_IMAGE = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=687&q=80";

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { user, signOut, profile, refreshProfile } = useAuth(); // Use profile from context
    // const [profile, setProfile] = useState(null); // Removed local state
    const [loading, setLoading] = useState(false); // Default false, strictly for refresh
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Initial fetch handled by AuthContext. We just refresh on focus.
    useFocusEffect(
        useCallback(() => {
            if (user) {
                // Optional: refresh silently
                handleRefresh();
            }
        }, [user])
    );

    const handleRefresh = async () => {
        // Don't show full screen loader, just maybe small indicator if needed, 
        // or just let it update in background.
        // For now, if profile is missing, we might want to show loader.
        if (!profile) setLoading(true);
        await refreshProfile();
        setLoading(false);
    };

    const handleSignOut = async () => {
        Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Çıkış Yap",
                style: "destructive",
                onPress: async () => {
                    console.log("ProfileScreen: User confirmed sign out");
                    try {
                        await signOut();
                        // Force navigation to Auth stack
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Auth' }],
                        });
                        console.log("ProfileScreen: Sign out successful");
                    } catch (error) {
                        console.error("ProfileScreen: Sign out error", error);
                        Alert.alert("Hata", "Çıkış yapılırken bir sorun oluştu.");
                    }
                }
            }
        ]);
    };

    // Dynamic Theme System
    const theme = {
        background: isDarkMode ? '#000000' : '#F2F2F7',
        card: isDarkMode ? '#1C1C1E' : '#FFFFFF',
        text: isDarkMode ? '#FFFFFF' : '#121212',
        subText: isDarkMode ? '#8E8E93' : '#636366',
        icon: isDarkMode ? '#FDCB58' : '#121212',
        border: isDarkMode ? '#333333' : '#E5E5EA',
        placeholder: isDarkMode ? '#2C2C2E' : '#FFFFFF',
        shadow: isDarkMode ? '#000' : '#ccc',
    };

    // The Corporate Card ALWAYS keeps this Dark/Gold scheme
    const corporateTheme = {
        background: ['#1C1C1E', '#111111'],
        border: '#FDCB58',
        text: '#FFFFFF',
        subText: '#CCCCCC',
        icon: '#FDCB58'
    };

    const QuickActionButton = ({ icon, label, badge, onPress }) => (
        <TouchableOpacity
            style={[styles.quickActionBtn, {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: isDarkMode ? 1 : 0,
                shadowColor: theme.shadow,
            }]}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <View style={styles.quickActionIconBox}>
                <MaterialCommunityIcons name={icon} size={28} color={theme.icon} />
                {badge && <View style={styles.badge} />}
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>{label}</Text>
        </TouchableOpacity>
    );

    const MenuItem = ({ icon, label, isDestructive, hasSwitch, switchValue, onSwitchChange, onPress }) => (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
            activeOpacity={hasSwitch ? 1 : 0.7}
            onPress={onPress}
            disabled={hasSwitch}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: isDestructive ? 'rgba(255, 59, 48, 0.1)' : (isDarkMode ? '#2C2C2E' : '#F2F2F7') }]}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={isDestructive ? '#FF3B30' : theme.icon}
                />
            </View>
            <Text style={[styles.menuText, { color: isDestructive ? '#FF3B30' : theme.text }]}>{label}</Text>

            {hasSwitch ? (
                <Switch
                    trackColor={{ false: "#767577", true: "#FDCB58" }}
                    thumbColor={switchValue ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={onSwitchChange}
                    value={switchValue}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={theme.subText} />
            )}
        </TouchableOpacity>
    );

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Simulate wait for better UX or actual fetch
        await refreshProfile();
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
                }
            >

                {/* 1. Header (Individual) */}
                <View style={styles.header}>
                    <View style={styles.profileRow}>
                        <Image source={{ uri: profile?.avatar_url || PROFILE_IMAGE }} style={styles.avatar} />
                        <View style={styles.profileInfo}>
                            {loading ? (
                                <ActivityIndicator size="small" color={theme.text} />
                            ) : (
                                <>
                                    <Text style={[styles.userName, { color: theme.text }]}>
                                        {profile ? profile.full_name : 'Misafir Kullanıcı'}
                                    </Text>
                                    <Text style={[styles.userType, { color: theme.subText }]}>
                                        {profile
                                            ? (profile.user_type === 'corporate' ? 'Kurumsal Üye' : 'Bireysel Kullanıcı')
                                            : 'Giriş Yapılmadı'}
                                    </Text>
                                </>
                            )}
                        </View>
                        <TouchableOpacity style={[styles.editButton, { backgroundColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
                            <MaterialCommunityIcons name="pencil" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 1.5. CORPORATE ACTION CARD (Firma Paneli / Başvuru) */}
                {/* 1.5. CORPORATE ACTION CARD (Firma Paneli - Sadece Onaylı Kurumsallar İçin) */}
                {profile?.user_type === 'corporate' && profile?.approval_status === 'approved' && (
                    <View style={[styles.sectionContainer, { marginTop: 10 }]}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('ProviderDashboard')}
                        >
                            <LinearGradient
                                colors={corporateTheme.background}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.corporateCard, { borderColor: corporateTheme.border }]}
                            >
                                <View style={styles.corporateContent}>
                                    <View style={styles.corporateIconCircle}>
                                        <MaterialCommunityIcons name="domain" size={28} color={corporateTheme.icon} />
                                    </View>
                                    <View style={styles.corporateTextContainer}>
                                        <Text style={[styles.corporateTitle, { color: corporateTheme.text }]}>
                                            Firma Paneli
                                        </Text>
                                        <Text style={[styles.corporateSubtitle, { color: corporateTheme.subText }]}>
                                            Hizmetlerinizi ve tekliflerinizi yönetin.
                                        </Text>
                                    </View>
                                    <View style={styles.corporateArrow}>
                                        <Text style={styles.manageText}>GİT</Text>
                                        <Ionicons name="chevron-forward" size={16} color={corporateTheme.icon} />
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 2. APPLICATION STATUS CARD (Pending/Rejected/Incomplete) */}
                {profile?.user_type === 'corporate' && profile?.approval_status !== 'approved' && (
                    <View style={[styles.sectionContainer, { marginTop: 10 }]}>
                        <LinearGradient
                            colors={
                                profile.approval_status === 'rejected' ? ['#450a0a', '#7f1d1d'] :
                                    profile.approval_status === 'incomplete' ? ['#422006', '#854d0e'] :
                                        ['#172033', '#1e293b']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.corporateCard,
                                {
                                    borderColor:
                                        profile.approval_status === 'rejected' ? '#ef4444' :
                                            profile.approval_status === 'incomplete' ? '#eab308' :
                                                '#334155'
                                }
                            ]}
                        >
                            <View style={styles.corporateContent}>
                                <View style={[
                                    styles.corporateIconCircle,
                                    {
                                        backgroundColor:
                                            profile.approval_status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                                                profile.approval_status === 'incomplete' ? 'rgba(234, 179, 8, 0.2)' :
                                                    'rgba(56, 189, 248, 0.1)'
                                    }
                                ]}>
                                    <MaterialCommunityIcons
                                        name={
                                            profile.approval_status === 'rejected' ? "alert-circle-outline" :
                                                profile.approval_status === 'incomplete' ? "file-document-edit-outline" :
                                                    "timer-sand"
                                        }
                                        size={28}
                                        color={
                                            profile.approval_status === 'rejected' ? '#ef4444' :
                                                profile.approval_status === 'incomplete' ? '#eab308' :
                                                    '#38bdf8'
                                        }
                                    />
                                </View>
                                <View style={styles.corporateTextContainer}>
                                    <Text style={[styles.corporateTitle, { color: '#fff' }]}>
                                        {profile.approval_status === 'rejected' ? 'Başvurunuz Reddedildi' :
                                            profile.approval_status === 'incomplete' ? 'Eksik Bilgi/Belge Talebi' :
                                                'Başvurunuz İnceleniyor'}
                                    </Text>

                                    <Text style={[styles.corporateSubtitle, { color: '#94a3b8' }]}>
                                        {profile.approval_status === 'rejected'
                                            ? 'Başvurunuz kriterlerimize uygun görülmedi.'
                                            : profile.approval_status === 'incomplete'
                                                ? 'Başvurunuzda eksiklikler tespit edildi. Lütfen aşağıdaki notu dikkate alınız.'
                                                : 'Uzmanlık başvurunuz onay sürecindedir. Onaylandığında paneliniz aktif olacaktır.'}
                                    </Text>

                                    {/* Rejection Reason / Note */}
                                    {profile.rejection_reason && (
                                        <View style={{ marginTop: 8, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
                                            <Text style={{ color: '#fff', fontSize: 13, fontStyle: 'italic' }}>
                                                "{profile.rejection_reason}"
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                )}


                {/* 3. Quick Actions */}
                <View style={styles.sectionContainer}>
                    <View style={styles.quickActionsRow}>
                        <QuickActionButton
                            icon="clipboard-list-outline"
                            label="Taleplerim"
                            onPress={() => navigation.navigate('Requests')}
                        />
                        <QuickActionButton
                            icon="message-text-outline"
                            label="Gelen Kutusu"
                            badge
                            onPress={() => navigation.navigate('Inbox')}
                        />
                        <QuickActionButton
                            icon="wallet-outline"
                            label="Cüzdanım"
                            onPress={() => Alert.alert("Yakında", "Cüzdan özelliği yakında eklenecek.")}
                        />
                    </View>
                </View>

                {/* 4. Settings List */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionHeader, { color: theme.subText }]}>HESAP VE AYARLAR</Text>
                    <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
                        <MenuItem
                            icon="person-outline"
                            label="Hesap Bilgileri"
                            onPress={() => navigation.navigate('AccountSettings', { profileData: profile })}
                        />
                        <MenuItem
                            icon={isDarkMode ? "moon" : "sunny"}
                            label={isDarkMode ? "Karanlık Mod" : "Aydınlık Mod"}
                            hasSwitch
                            switchValue={isDarkMode}
                            onSwitchChange={() => setIsDarkMode(!isDarkMode)}
                        />
                        <MenuItem
                            icon="notifications-outline"
                            label="Bildirim Ayarları"
                            onPress={() => navigation.navigate('NotificationSettings')}
                        />
                        <MenuItem
                            icon="shield-checkmark-outline"
                            label="Gizlilik ve Güvenlik"
                            onPress={() => navigation.navigate('PrivacySecurity')}
                        />
                    </View>
                </View>

                {/* 4.5. ADMIN SECTION */}
                {profile?.is_admin && (
                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionHeader, { color: theme.subText }]}>YÖNETİCİ</Text>
                        <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
                            <MenuItem
                                icon="shield-checkmark"
                                label="Admin Paneli"
                                onPress={() => navigation.navigate('AdminDashboard')}
                            />
                        </View>
                    </View>
                )}

                {/* 5. Support List */}
                <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
                    <Text style={[styles.sectionHeader, { color: theme.subText }]}>DESTEK</Text>
                    <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
                        <MenuItem
                            icon="help-circle-outline"
                            label="Yardım Merkezi"
                            onPress={() => navigation.navigate('HelpCenter')}
                        />
                        <MenuItem
                            icon="chatbubble-ellipses-outline"
                            label="Bize Ulaşın"
                            onPress={() => navigation.navigate('ContactUs')}
                        />
                        <MenuItem
                            icon="log-out-outline"
                            label="Çıkış Yap"
                            isDestructive
                            onPress={handleSignOut}
                        />
                    </View>
                </View>

            </ScrollView >

            {/* Visual Bottom Navigation Bar (Mockup) */}
            < View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border }]} >
                <TouchableOpacity style={styles.tabItem}>
                    <MaterialCommunityIcons name="home-variant-outline" size={26} color={theme.subText} />
                    <Text style={[styles.tabLabel, { color: theme.subText }]}>Ana Sayfa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <MaterialCommunityIcons name="clipboard-list-outline" size={26} color={theme.subText} />
                    <Text style={[styles.tabLabel, { color: theme.subText }]}>Taleplerim</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <View>
                        <MaterialCommunityIcons name="bell-outline" size={26} color={theme.subText} />
                        <View style={styles.tabBadge} />
                    </View>
                    <Text style={[styles.tabLabel, { color: theme.subText }]}>Gelenler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <MaterialCommunityIcons name="account" size={26} color={theme.icon} />
                    <Text style={[styles.tabLabel, { color: theme.icon, fontWeight: 'bold' }]}>Profil</Text>
                </TouchableOpacity>
            </View >
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 100 }, // Space for bottom bar

    // Header
    header: { padding: 20, paddingTop: 10 },
    profileRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#333' },
    profileInfo: { flex: 1, marginLeft: 15 },
    userName: { fontSize: 20, fontWeight: '700' },
    userType: { fontSize: 13, marginTop: 2 },
    editButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

    // Sections
    sectionContainer: { marginTop: 4, marginBottom: 20, paddingHorizontal: 20 },
    sectionHeader: { fontSize: 12, fontWeight: '600', marginBottom: 10, letterSpacing: 0.5 },

    // Corporate Card
    corporateCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
    corporateContent: { flexDirection: 'row', alignItems: 'center' },
    corporateIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(253, 203, 88, 0.15)', alignItems: 'center', justifyContent: 'center' },
    corporateTextContainer: { flex: 1, marginLeft: 12 },
    corporateTitle: { fontSize: 16, fontWeight: '700' },
    corporateSubtitle: { fontSize: 12, marginTop: 2 },
    corporateArrow: { flexDirection: 'row', alignItems: 'center' },
    manageText: { color: '#FDCB58', fontSize: 12, fontWeight: '700', marginRight: 2 },

    // Quick Actions
    quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    quickActionBtn: {
        width: '31%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionIconBox: { marginBottom: 8, position: 'relative' },
    quickActionText: { fontSize: 12, fontWeight: '600' },
    badge: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' },

    // Menus
    menuContainer: { borderRadius: 16, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5 },
    menuIconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    menuText: { flex: 1, fontSize: 15, fontWeight: '500' },

    // Bottom Bar (Visual Mockup)
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 85,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1
    },
    tabItem: { alignItems: 'center' },
    tabLabel: { fontSize: 10, marginTop: 4 },
    tabBadge: { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', borderWidth: 1, borderColor: '#fff' }
});
