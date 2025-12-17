import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated, Dimensions,
    FlatList,
    Modal,
    Platform,
    StatusBar, StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LuxuryCard from '../../components/LuxuryCard';
import PremiumBackground from '../../components/PremiumBackground';

const { width, height } = Dimensions.get('window');

// --- DATA ---
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Kastamonu'];

const DISTRICTS = {
    'İstanbul': [
        'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir',
        'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy',
        'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
        'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli',
        'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'
    ],
    'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar', 'Gölbaşı'],
    'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Çiğli', 'Gaziemir', 'Balçova', 'Narlıdere', 'Güzelbahçe'],
    'Kastamonu': ['Merkez', 'Tosya', 'Taşköprü', 'Cide', 'İnebolu', 'Bozkurt', 'Abana', 'Daday']
};

// --- COMPONENTS ---

// Custom Modal for Elegant Selection
const SelectionModal = ({ visible, onClose, title, items, onSelect }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Animated.View style={[styles.modalContent, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
                    <LinearGradient
                        colors={['#1a1a1a', '#0F0F0F']}
                        style={styles.modalGradient}
                    >
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>

                        {/* List */}
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                    <Ionicons name="chevron-forward" size={16} color="rgba(212, 175, 55, 0.3)" />
                                </TouchableOpacity>
                            )}
                        />
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const MENU_ITEMS = [
    {
        id: 'simple',
        title: 'HIZLI HESAPLAMA',
        subtitle: 'Anlık maliyet analizi',
        icon: 'calculator-variant-outline',
        iconLibrary: 'MaterialCommunityIcons',
        screen: 'SimpleCost',
    },
    {
        id: 'detailed',
        title: 'DETAYLI ANALİZ',
        subtitle: 'Kapsamlı proje bütçesi',
        icon: 'chart-timeline-variant',
        iconLibrary: 'MaterialCommunityIcons',
        screen: 'DetailedCost',
    },
    {
        id: 'pos',
        title: 'POZ SORGULAMA',
        subtitle: 'Birim fiyat kütüphanesi',
        icon: 'barcode-scan',
        iconLibrary: 'MaterialCommunityIcons',
        screen: 'PosCost',
    }
];

const LocationSelector = ({ city, onOpenCity }) => (
    <View style={styles.locationContainer}>
        {/* City Selector */}
        <LuxuryCard style={styles.locationCard} onPress={onOpenCity} variant="dark">
            <View style={styles.locationContent}>
                <View>
                    <Text style={styles.locationLabel}>İL SEÇİN</Text>
                    <Text style={[styles.locationValue, !city && styles.placeholder]}>
                        {city || 'Seçiniz...'}
                    </Text>
                </View>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#D4AF37" />
            </View>
        </LuxuryCard>
    </View>
);



export default function MaliyetScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // State
    const [city, setCity] = useState('İstanbul');

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('city');

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

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
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>MALİYET MERKEZİ</Text>
                        <Text style={styles.headerSubtitle}>Proje bütçe ve analiz araçları</Text>
                    </View>

                    <LocationSelector
                        city={city}
                        onOpenCity={openCityModal}
                    />

                    <View style={styles.menuGrid}>
                        {MENU_ITEMS.map((item) => (
                            <LuxuryCard
                                key={item.id}
                                style={styles.menuCard}
                                onPress={() => handleNavigation(item.screen)}
                            >
                                <View style={styles.menuCardContent}>

                                    <View style={styles.iconWrapper}>
                                        {/* Pure Gold Icon without Box */}
                                        {item.iconLibrary === 'MaterialCommunityIcons' ? (
                                            <MaterialCommunityIcons name={item.icon} size={42} color="#D4AF37" />
                                        ) : (
                                            <Ionicons name={item.icon} size={42} color="#D4AF37" />
                                        )}
                                    </View>

                                    <View style={styles.textWrapper}>
                                        <Text style={styles.menuTitle}>{item.title}</Text>
                                        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                    </View>

                                    <MaterialCommunityIcons name="chevron-right" size={28} color="#D4AF37" style={{ opacity: 0.5 }} />
                                </View>
                            </LuxuryCard>
                        ))}
                    </View>


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
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    locationValue: {
        fontSize: 15,
        color: '#D4AF37', // Gold
        fontWeight: '500',
        letterSpacing: 0.5,
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
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: height * 0.6,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    modalGradient: {
        flex: 1,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 175, 55, 0.2)',
        paddingBottom: 16,
    },
    modalTitle: {
        fontSize: 16,
        color: '#D4AF37',
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    closeButton: {
        padding: 4,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    modalItemText: {
        color: '#eee',
        fontSize: 16,
        fontWeight: '300',
        letterSpacing: 0.5,
    }
});
