import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const PROFILE_IMAGE = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=687&q=80";

export default function ProfileScreen() {
    const navigation = useNavigation();
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Dynamic Theme System
    const theme = {
        background: isDarkMode ? '#000000' : '#F2F2F7',
        card: isDarkMode ? '#1C1C1E' : '#FFFFFF',
        text: isDarkMode ? '#FFFFFF' : '#121212',
        subText: isDarkMode ? '#8E8E93' : '#636366',
        icon: isDarkMode ? '#FDCB58' : '#121212', // Gold in Dark, Black in Light for clarity
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

    const QuickActionButton = ({ icon, label, badge }) => (
        <TouchableOpacity
            style={[styles.quickActionBtn, {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: isDarkMode ? 1 : 0, // No border in light mode, just shadow
                shadowColor: theme.shadow,
            }]}
            activeOpacity={0.8}
        >
            <View style={styles.quickActionIconBox}>
                <MaterialCommunityIcons name={icon} size={28} color={theme.icon} />
                {badge && <View style={styles.badge} />}
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>{label}</Text>
        </TouchableOpacity>
    );

    const MenuItem = ({ icon, label, isDestructive, hasSwitch, switchValue, onSwitchChange }) => (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
            activeOpacity={hasSwitch ? 1 : 0.7}
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* 1. Header (Individual) */}
                <View style={styles.header}>
                    <View style={styles.profileRow}>
                        <Image source={{ uri: PROFILE_IMAGE }} style={styles.avatar} />
                        <View style={styles.profileInfo}>
                            <Text style={[styles.userName, { color: theme.text }]}>Ahmet Yılmaz</Text>
                            <Text style={[styles.userType, { color: theme.subText }]}>Bireysel Kullanıcı</Text>
                        </View>
                        <TouchableOpacity style={[styles.editButton, { backgroundColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
                            <MaterialCommunityIcons name="pencil" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. CORPORATE ACTION CARD (Always Dark Premium) */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity activeOpacity={0.9}>
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
                                    <Text style={[styles.corporateTitle, { color: corporateTheme.text }]}>Kurumsal Üyelik</Text>
                                    <Text style={[styles.corporateSubtitle, { color: corporateTheme.subText }]}>
                                        Firma profilini yönet veya teklif al.
                                    </Text>
                                </View>
                                <View style={styles.corporateArrow}>
                                    <Text style={styles.manageText}>YÖNET</Text>
                                    <Ionicons name="chevron-forward" size={16} color={corporateTheme.icon} />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* 3. Quick Actions */}
                <View style={styles.sectionContainer}>
                    <View style={styles.quickActionsRow}>
                        <QuickActionButton icon="clipboard-list-outline" label="Taleplerim" />
                        <QuickActionButton icon="message-text-outline" label="Gelen Kutusu" badge />
                        <QuickActionButton icon="wallet-outline" label="Cüzdanım" />
                    </View>
                </View>

                {/* 4. Settings List */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionHeader, { color: theme.subText }]}>HESAP VE AYARLAR</Text>
                    <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
                        <MenuItem icon="person-outline" label="Hesap Bilgileri" />
                        <MenuItem
                            icon={isDarkMode ? "moon" : "sunny"}
                            label={isDarkMode ? "Karanlık Mod" : "Aydınlık Mod"}
                            hasSwitch
                            switchValue={isDarkMode}
                            onSwitchChange={() => setIsDarkMode(!isDarkMode)}
                        />
                        <MenuItem icon="notifications-outline" label="Bildirim Ayarları" />
                        <MenuItem icon="shield-checkmark-outline" label="Gizlilik ve Güvenlik" />
                    </View>
                </View>

                {/* 5. Support List */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionHeader, { color: theme.subText }]}>DESTEK</Text>
                    <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
                        <MenuItem icon="help-circle-outline" label="Yardım Merkezi" />
                        <MenuItem icon="chatbubble-ellipses-outline" label="Bize Ulaşın" />
                        <MenuItem icon="log-out-outline" label="Çıkış Yap" isDestructive />
                    </View>
                </View>

            </ScrollView>

            {/* Visual Bottom Navigation Bar (Mockup) */}
            <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
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
            </View>
        </SafeAreaView>
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
