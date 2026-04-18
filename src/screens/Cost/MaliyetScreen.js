import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated, Dimensions,
    FlatList,
    Modal,
    Platform,
    StatusBar, StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import LuxuryCard from '../../components/LuxuryCard';
import PremiumBackground from '../../components/PremiumBackground';
import { getSortedCities } from '../../constants/TurkeyLocations';
import { supabase } from '../../lib/supabase';
import { ScreenConfigService } from '../../services/ScreenConfigService';

const { width, height } = Dimensions.get('window');

// --- DATA ---
const CITIES = getSortedCities();

// --- COMPONENTS ---

// Custom Modal for Elegant Selection
const SelectionModal = ({ visible, onClose, title, items, onSelect }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (visible) {
            setSearchText('');
            Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }).start();
        } else {
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
    }, [visible]);

    const filteredItems = items.filter(val => val.toLocaleLowerCase('tr').includes(searchText.toLocaleLowerCase('tr')));

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.modalOverlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
                <TouchableOpacity activeOpacity={1} style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Animated.View style={[styles.modalContent, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [200, 0] }) }] }]}>
                        <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={styles.modalGradient}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text allowFontScaling={false} style={styles.modalTitle}>{title}</Text>
                                    <View style={styles.titleUnderline} />
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <MaterialCommunityIcons name="close-circle-outline" size={28} color="#D4AF37" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.searchContainer}>
                                <MaterialCommunityIcons name="magnify" size={20} color="#D4AF37" style={{ marginRight: 10 }} />
                                <TextInput allowFontScaling={false}
                                    style={styles.searchInput}
                                    placeholder="Ara..."
                                    placeholderTextColor="#555"
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    autoCorrect={false}
                                />
                            </View>

                            <FlatList
                                data={filteredItems}
                                keyExtractor={(item) => item}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => {
                                    const isPriority = ['İstanbul', 'Ankara', 'İzmir'].includes(item);
                                    return (
                                        <TouchableOpacity style={styles.modalItem} onPress={() => { onSelect(item); onClose(); }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                <Text allowFontScaling={false} style={[styles.modalItemText, isPriority && { color: '#D4AF37', fontWeight: 'bold' }]}>{item}</Text>
                                            </View>
                                            <MaterialCommunityIcons name="chevron-right" size={16} color="rgba(212, 175, 55, 0.3)" />
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

// Metadata for mapping dynamic config to UI components
const SECTION_METADATA = {
    'cost_simple': {
        icon: 'calculator-variant-outline',
        iconLibrary: 'MaterialCommunityIcons',
        screen: 'SimpleCost',
        defaultTitle: 'HIZLI HESAPLAMA',
        defaultSubtitle: 'Anlık maliyet analizi'
    },
    'cost_detailed': {
        icon: 'chart-timeline-variant',
        iconLibrary: 'MaterialCommunityIcons',
        screen: 'DetailedCost',
        defaultTitle: 'DETAYLI ANALİZ',
        defaultSubtitle: 'Kapsamlı proje bütçesi'
    },
    'cost_pos': {
        icon: 'barcode-scan',
        iconLibrary: 'MaterialCommunityIcons',
        screen: 'PosCost',
        defaultTitle: 'POZ SORGULAMA',
        defaultSubtitle: 'Birim fiyat kütüphanesi'
    },
    'cost_requests_user': {
        icon: 'folder-home-outline',
        iconLibrary: 'MaterialCommunityIcons',
        screen: 'UserRequests',
        defaultTitle: 'TALEPLERİM',
        defaultSubtitle: 'Oluşturduğum talepler ve teklifler'
    },
    'cost_requests_contractor': {
        icon: 'hard-hat',
        iconLibrary: 'MaterialCommunityIcons',
        screen: 'ContractorRequests',
        defaultTitle: 'MÜTEAHHİT PANELİ',
        defaultSubtitle: 'Gelen inşaat talepleri'
    }
};

const LocationSelector = ({ city, onOpenCity }) => (
    <TouchableOpacity style={styles.locationContainer} onPress={onOpenCity}>
        <LuxuryCard style={styles.locationCard}>
            <View style={styles.locationContent}>
                <View>
                    <Text allowFontScaling={false} style={styles.locationLabel}>HESAPLAMA YAPILACAK İL</Text>
                    <Text allowFontScaling={false} style={styles.locationValue}>{city || 'Seçiniz...'}</Text>
                </View>
                <MaterialCommunityIcons name="map-marker-radius" size={24} color="#D4AF37" />
            </View>
        </LuxuryCard>
    </TouchableOpacity>
);



export default function MaliyetScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // State
    const [city, setCity] = useState('İstanbul');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isContractor, setIsContractor] = useState(false);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('city');

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
        checkUserStatus();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadScreenConfig();
        }, [])
    );

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_admin, is_contractor')
                    .eq('id', user.id)
                    .single();
                setIsAdmin(data?.is_admin || false);
                setIsContractor(data?.is_contractor || false);
            }
        } catch (e) {
            console.warn('User status check failed', e);
        }
    };

    const loadScreenConfig = async () => {
        setLoading(true);
        try {
            let config = await ScreenConfigService.fetchConfig('cost_screen');

            // Fallback if no config found (first time run before migration)
            if (!config || config.length === 0) {
                config = [
                    { id: 'cost_simple', is_visible: true, sort_order: 10 },
                    { id: 'cost_detailed', is_visible: true, sort_order: 20 },
                    { id: 'cost_pos', is_visible: true, sort_order: 30 },
                    { id: 'cost_requests_user', is_visible: true, sort_order: 40 },
                    { id: 'cost_requests_contractor', is_visible: true, sort_order: 50 },
                ];
            }
            setSections(config);
        } catch (error) {
            console.error('Config load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSectionVisibility = async (section) => {
        try {
            const newVisibility = !section.is_visible;
            const updatedSections = sections.map(s =>
                s.id === section.id ? { ...s, is_visible: newVisibility } : s
            );
            setSections(updatedSections);

            // Optimistic update
            await ScreenConfigService.updateSectionConfig(section.id, { is_visible: newVisibility });
        } catch (error) {
            Alert.alert("Hata", "Güncelleme yapılamadı.");
            loadScreenConfig(); // Revert on error
        }
    };

    // Handlers
    const openCityModal = () => {
        setModalType('city');
        setModalVisible(true);
    };

    const handleSelect = (item) => {
        if (modalType === 'city') {
            setCity(item);
        }
    };

    const getModalItems = () => {
        if (modalType === 'city') return CITIES;
        return [];
    };

    const getModalTitle = () => {
        return 'İL SEÇİN';
    };

    const handleNavigation = (screen) => {
        // Validation check for city
        if (!city && (screen === 'DetailedCost' || screen === 'SmartSketch')) {
            alert('Lütfen önce bir il seçiniz.');
            openCityModal();
            return;
        }

        // Redirect Detailed Analysis to Project Identity first
        if (screen === 'DetailedCost') {
            navigation.navigate('ProjectIdentity', {
                location: { city, district: 'Tümü' }
            });
            return;
        }

        navigation.navigate(screen, {
            location: { city, district: 'Tümü' }
        });
    };

    return (
        <PremiumBackground>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <Animated.ScrollView
                    contentContainerStyle={styles.content}
                    style={{ opacity: fadeAnim }}
                >
                    {/* CUSTOM HEADER (Previously Native) */}
                    <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                                <Ionicons name="arrow-back" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <View>
                                <Text allowFontScaling={false} style={styles.headerTitle}>MALİYET MERKEZİ</Text>
                                <Text allowFontScaling={false} style={styles.headerSubtitle}>Proje bütçe ve analiz araçları</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="calculator-variant" size={32} color="#D4AF37" style={{ opacity: 0.2 }} />
                    </View>

                    <LocationSelector
                        city={city}
                        onOpenCity={openCityModal}
                    />

                    {loading ? (
                        <View style={{ padding: 20 }}>
                            <ActivityIndicator size="large" color="#D4AF37" />
                        </View>
                    ) : (
                        <View style={styles.menuGrid}>
                            {sections
                                .filter(s => {
                                    if (s.id === 'cost_requests_contractor') {
                                        return (s.is_visible && isContractor) || isAdmin;
                                    }
                                    return s.is_visible || isAdmin;
                                })
                                .map((section) => {
                                    const meta = SECTION_METADATA[section.id];
                                    if (!meta) return null;

                                    return (
                                        <View key={section.id} style={{ position: 'relative' }}>
                                            {/* Admin Control */}
                                            {isAdmin && (
                                                <View style={{
                                                    position: 'absolute',
                                                    top: -10,
                                                    right: 10,
                                                    zIndex: 999,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                                    padding: 5,
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: section.is_visible ? '#00FF00' : '#FF0000'
                                                }}>
                                                    <TouchableOpacity
                                                        onPress={() => toggleSectionVisibility(section)}
                                                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                                                        style={{ padding: 4 }}
                                                    >
                                                        <MaterialCommunityIcons
                                                            name={section.is_visible ? "eye" : "eye-off"}
                                                            size={24}
                                                            color={section.is_visible ? "#00FF00" : "#FF0000"}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            )}

                                            <View style={{ opacity: (!section.is_visible && isAdmin) ? 0.5 : 1 }}>
                                                <LuxuryCard
                                                    style={styles.menuCard}
                                                    onPress={() => handleNavigation(meta.screen)}
                                                >
                                                    <View style={styles.menuCardContent}>
                                                        <View style={styles.iconWrapper}>
                                                            {meta.iconLibrary === 'MaterialCommunityIcons' ? (
                                                                <MaterialCommunityIcons name={meta.icon} size={42} color="#D4AF37" />
                                                            ) : (
                                                                <Ionicons name={meta.icon} size={42} color="#D4AF37" />
                                                            )}
                                                        </View>

                                                        <View style={styles.textWrapper}>
                                                            <Text allowFontScaling={false} style={styles.menuTitle}>{section.title || meta.defaultTitle}</Text>
                                                            <Text allowFontScaling={false} style={styles.menuSubtitle}>{meta.defaultSubtitle}</Text>
                                                        </View>

                                                        <MaterialCommunityIcons name="chevron-right" size={28} color="#D4AF37" style={{ opacity: 0.5 }} />
                                                    </View>
                                                </LuxuryCard>
                                            </View>
                                        </View>
                                    );
                                })}
                        </View>
                    )}
                </Animated.ScrollView>

                {/* Selection Modal */}
                <SelectionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title={getModalTitle()}
                    items={getModalItems()}
                    onSelect={handleSelect}
                />
            </SafeAreaView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
        paddingTop: Platform.OS === 'android' ? 40 : 12,
    },
    header: {
        marginBottom: 40,
        marginLeft: 4,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: Platform.OS === 'android' ? '100' : '200',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 8,
        fontFamily: Platform.OS === 'android' ? 'sans-serif-thin' : 'System',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#888',
        fontWeight: '300',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : 'System',
    },
    locationContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    locationCard: {
        flex: 1,
    },
    locationContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationLabel: {
        fontSize: 10,
        color: '#D4AF37',
        fontWeight: '900',
        marginBottom: 8,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    locationValue: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    placeholder: {
        color: '#444',
    },
    menuGrid: {
        gap: 20,
        marginBottom: 48,
    },
    menuCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        marginRight: 24,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWrapper: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: Platform.OS === 'android' ? '300' : '400',
        color: '#fff',
        marginBottom: 4,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : 'System',
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#666',
        fontWeight: '300',
        letterSpacing: 0.5,
        fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : 'System',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: height * 0.6,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    modalGradient: {
        flex: 1,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        color: '#D4AF37',
        fontWeight: '900',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    titleUnderline: {
        width: 40,
        height: 3,
        backgroundColor: '#D4AF37',
        marginTop: 4,
        borderRadius: 2,
    },
    closeButton: {
        padding: 4,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    modalItemText: {
        color: '#eee',
        fontSize: 16,
        fontWeight: '400',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        height: 54,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        paddingVertical: 8,
    },
});
