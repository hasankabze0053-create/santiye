import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import PremiumBackground from '../../components/PremiumBackground';

const { width } = Dimensions.get('window');

export default function ConstructionOfferScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { location, initialArea } = route.params || {};

    // Form State
    const [neighborhood, setNeighborhood] = useState('');
    const [ada, setAda] = useState('');
    const [parsel, setParsel] = useState('');
    const [pafta, setPafta] = useState('');
    const [address, setAddress] = useState('');

    const [hasDocument, setHasDocument] = useState(false); // Simulator for document upload

    const handleSubmit = () => {
        if (!ada || !parsel || !neighborhood) {
            Alert.alert('Eksik Bilgi', 'Lütfen Ada, Parsel ve Mahalle bilgilerini giriniz. Bu bilgiler doğru teklif için şarttır.');
            return;
        }

        // Navigate to Success Screen instead of Alert
        navigation.navigate('ConstructionSuccess');
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>PROJE KÜNYESİ</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                        {/* 1. KONUM BİLGİSİ */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="map-marker-radius" size={20} color="#D4AF37" />
                                <Text style={styles.sectionTitle}>LOKASYON</Text>
                            </View>

                            <GlassCard style={styles.card}>
                                <View style={styles.readOnlyRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>İL</Text>
                                        <Text style={styles.readOnlyValue}>{location?.city || 'Seçilmedi'}</Text>
                                    </View>
                                    <View style={styles.verticalDivider} />
                                    <View style={{ flex: 1, paddingLeft: 12 }}>
                                        <Text style={styles.label}>İLÇE</Text>
                                        <Text style={styles.readOnlyValue}>{location?.district || 'Seçilmedi'}</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <Text style={styles.label}>MAHALLE</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Örn: Cumhuriyet Mah."
                                    placeholderTextColor="#666"
                                    value={neighborhood}
                                    onChangeText={setNeighborhood}
                                />
                            </GlassCard>
                        </View>

                        {/* 2. TEKNİK KİMLİK (ADA/PARSEL) */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="land-plots" size={20} color="#D4AF37" />
                                <Text style={styles.sectionTitle}>TAPU / İMAR BİLGİLERİ</Text>
                            </View>

                            <GlassCard style={styles.card}>
                                <View style={styles.rowTwo}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={styles.label}>ADA NO</Text>
                                        <TextInput
                                            style={[styles.input, styles.numberInput]}
                                            placeholder="000"
                                            placeholderTextColor="#444"
                                            keyboardType="numeric"
                                            value={ada}
                                            onChangeText={(t) => setAda(t.replace(/[^0-9]/g, ''))}
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={styles.label}>PARSEL NO</Text>
                                        <TextInput
                                            style={[styles.input, styles.numberInput]}
                                            placeholder="00"
                                            placeholderTextColor="#444"
                                            keyboardType="numeric"
                                            value={parsel}
                                            onChangeText={(t) => setParsel(t.replace(/[^0-9]/g, ''))}
                                        />
                                    </View>
                                </View>

                                <View style={{ marginTop: 12 }}>
                                    <Text style={styles.label}>PAFTA (Opsiyonel)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Varsa pafta no giriniz"
                                        placeholderTextColor="#666"
                                        value={pafta}
                                        onChangeText={setPafta}
                                    />
                                </View>

                                <View style={styles.infoBox}>
                                    <Ionicons name="information-circle" size={18} color="#FFD700" style={{ marginTop: 2 }} />
                                    <Text style={styles.infoText}>
                                        Bu bilgiler, müteahhitlerin belediye sisteminden imar durumunu (KAKS/TAKS) sorgulayıp size <Text style={{ fontWeight: 'bold', color: '#fff' }}>net teklif</Text> verebilmesi için zorunludur.
                                    </Text>
                                </View>
                            </GlassCard>
                        </View>

                        {/* 3. ADRES DOĞRULAMA */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="sign-direction" size={20} color="#D4AF37" />
                                <Text style={styles.sectionTitle}>AÇIK ADRES</Text>
                            </View>
                            <GlassCard style={styles.card}>
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="Cadde, Sokak, Kapı No detaylarını yazınız..."
                                    placeholderTextColor="#666"
                                    multiline
                                    value={address}
                                    onChangeText={setAddress}
                                />
                            </GlassCard>
                        </View>

                        {/* 4. BELGE YÜKLEME */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="file-document-outline" size={20} color="#D4AF37" />
                                <Text style={styles.sectionTitle}>BELGE VE GÖRSEL</Text>
                            </View>

                            <TouchableOpacity activeOpacity={0.8} onPress={() => setHasDocument(!hasDocument)}>
                                <GlassCard style={[styles.uploadCard, hasDocument && styles.uploadCardActive]}>
                                    {hasDocument ? (
                                        <View style={{ alignItems: 'center' }}>
                                            <MaterialCommunityIcons name="check-circle" size={42} color="#4CAF50" />
                                            <Text style={[styles.uploadText, { color: '#4CAF50', marginTop: 8 }]}>Belge Eklendi</Text>
                                            <Text style={styles.uploadSubText}>Tapu_Fotokopisi.jpg</Text>
                                        </View>
                                    ) : (
                                        <View style={{ alignItems: 'center' }}>
                                            <View style={styles.iconCircle}>
                                                <MaterialCommunityIcons name="camera-plus" size={32} color="#D4AF37" />
                                            </View>
                                            <Text style={styles.uploadText}>Tapu / İmar Durumu Fotoğrafı Yükle</Text>
                                            <Text style={styles.uploadSubText}>(Opsiyonel ama Önerilir)</Text>
                                            <Text style={styles.uploadHint}>Talebinizin ciddiyetini artırır.</Text>
                                        </View>
                                    )}
                                </GlassCard>
                            </TouchableOpacity>
                        </View>

                        {/* SUBMIT BUTTON */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            activeOpacity={0.9}
                            onPress={handleSubmit}
                        >
                            <LinearGradient
                                colors={['#996515', '#FFD700', '#FDB931', '#996515']} // Reverted to Gradient
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.submitGradient}
                            >
                                <Text style={styles.submitText}>PROJEYİ MÜTEAHHİTLERE SUN</Text>
                                <MaterialCommunityIcons name="briefcase-check" size={24} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    },
    headerTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        color: '#FFD700', // Gold for better visibility
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginLeft: 8,
    },
    card: {
        padding: 16,
        borderRadius: 16,
    },
    rowTwo: {
        flexDirection: 'row',
    },
    label: {
        color: '#E0E0E0', // Much brighter for readability
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    readOnlyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readOnlyValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    verticalDivider: {
        width: 1,
        height: '80%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 12,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
    },
    numberInput: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: '#FFD700',
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 16,
    },
    infoBox: {
        marginTop: 16,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
    },
    infoText: {
        color: '#ccc',
        fontSize: 12,
        lineHeight: 18,
        flex: 1,
    },

    // Upload Styles
    uploadCard: {
        padding: 30,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadCardActive: {
        borderColor: '#4CAF50',
        borderStyle: 'solid',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    iconCircle: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
    },
    uploadText: {
        color: '#D4AF37',
        fontSize: 15,
        fontWeight: 'bold',
    },
    uploadSubText: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    uploadHint: {
        color: '#888',
        fontSize: 11,
        fontStyle: 'italic',
        marginTop: 12,
    },

    // Submit Button
    submitButton: {
        marginTop: 10,
        marginBottom: 40,
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 30,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    submitText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});
