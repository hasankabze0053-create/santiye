import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Dimensions, InputAccessoryView, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumBackground from '../../components/PremiumBackground';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function TransportModeSelectionScreen({ navigation }) {
    const [isFastModalVisible, setFastModalVisible] = useState(false);
    const [userPhone, setUserPhone] = useState('');
    const [fastRequestText, setFastRequestText] = useState('');


    const handleFastSubmit = () => {
        if (fastRequestText.length < 10) {
            Alert.alert("Eksik Bilgi", "Lütfen talebinizi biraz daha detaylandırın.");
            return;
        }
        if (userPhone.length < 10) {
            Alert.alert("Eksik Bilgi", "Lütfen telefon numaranızı giriniz.");
            return;
        }

        // --- WHATSAPP LOGIC ---
        // Target: +90 5380860202
        const targetPhone = '905380860202';
        const message = `⚡ HIZLI NAKLİYE TALEBİ\n\n📌 Talep: ${fastRequestText}\n\n📞 Müşteri Tel: ${userPhone}`;

        const url = `whatsapp://send?phone=${targetPhone}&text=${encodeURIComponent(message)}`;

        Linking.openURL(url).catch(() => {
            Alert.alert("Hata", "WhatsApp uygulaması bulunamadı.");
        });

        setFastModalVisible(false);
        setFastRequestText('');
        setUserPhone('');
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={[styles.header, { paddingTop: 40 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { marginTop: 10 }]}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { marginTop: 10 }]}>TALEP OLUŞTUR</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.container}>



                    {/* OPTION 1: FAST MODE */}
                    <TouchableOpacity
                        style={styles.cardContainer}
                        activeOpacity={0.9}
                        onPress={() => setFastModalVisible(true)}
                    >
                        <LinearGradient
                            colors={['rgba(255, 215, 0, 0.15)', 'rgba(0,0,0,0)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradient}
                        >
                            <View style={styles.iconCircleNeon}>
                                <MaterialCommunityIcons name="lightning-bolt" size={32} color={COLORS.neon} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>HIZLI TALEP OLUŞTUR</Text>
                                <Text style={styles.cardSub}>
                                    Vaktiniz kısıtlı mı? Yükünüzü ve rotanızı kısaca yazın, en uygun aracı biz bulalım.
                                </Text>
                            </View>
                            <View style={styles.arrowBox}>
                                <Ionicons name="arrow-forward" size={20} color={COLORS.neon} />
                            </View>
                        </LinearGradient>
                        <View style={[styles.glowBorder, { borderColor: COLORS.neon }]} />
                    </TouchableOpacity>



                    {/* OPTION 2: PRO MODE - PREMIUM GOLD */}
                    {/* LOGIC: IF Button_Click == Detaylı_Planlama THEN Navigate To -> Screen_Route_Selection */}
                    <TouchableOpacity
                        style={styles.cardContainer}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('CreateTransport')}
                    >
                        <LinearGradient
                            colors={['rgba(255, 193, 7, 0.15)', 'rgba(0,0,0,0)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradient}
                        >
                            <View style={styles.iconCircleGold}>
                                <MaterialCommunityIcons name="map-marker-path" size={32} color="#FFD700" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: '#FFD700' }]}>DETAYLI PLANLAMA</Text>
                                <Text style={styles.cardSub}>
                                    Rotayı, araç tipini ve tonajı kendiniz seçerek anında fiyat hesaplayın.
                                </Text>
                            </View>
                            <View style={[styles.arrowBox, { backgroundColor: 'rgba(255, 193, 7, 0.1)' }]}>
                                <Ionicons name="arrow-forward" size={20} color="#FFD700" />
                            </View>
                        </LinearGradient>
                        <View style={[styles.glowBorder, { borderColor: '#FFD700' }]} />
                    </TouchableOpacity>

                </View>

                {/* FAST REQUEST MODAL */}
                <Modal
                    visible={isFastModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setFastModalVisible(false)}
                >
                    {/* 1. STATIC BACKGROUND (Blur + Dim) - Ignored by Keyboard */}
                    <View style={StyleSheet.absoluteFill}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                    </View>

                    {/* 2. CONTENT HANDLER - Adapts to Keyboard */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "height" : "height"}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        {/* Touchable to close on background tap (Optional but good UX) */}
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            activeOpacity={1}
                            onPress={() => setFastModalVisible(false)}
                        />

                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>⚡ HIZLI ASİSTAN</Text>
                                <TouchableOpacity onPress={() => setFastModalVisible(false)}>
                                    <Ionicons name="close-circle" size={28} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.modalSub}>
                                    Yükünüzü, nereden nereye gideceğini ve ne zaman araç lazım olduğunu kısaca yazın.
                                </Text>

                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Örn: Kartal şantiyesinden Tuzla depoya 3 palet seramik gidecek. Saat 14:00'te araç lazım..."
                                    placeholderTextColor="#555"
                                    multiline
                                    numberOfLines={6}
                                    value={fastRequestText}
                                    onChangeText={setFastRequestText}
                                    inputAccessoryViewID="toolbar_transport_mode"
                                />

                                <Text style={[styles.modalSub, { marginBottom: 10 }]}>İletişim Numaranız:</Text>
                                <TextInput
                                    style={[styles.textArea, { height: 50, marginBottom: 30 }]}
                                    placeholder="0532 999 88 77"
                                    placeholderTextColor="#555"
                                    keyboardType="phone-pad"
                                    value={userPhone}
                                    onChangeText={setUserPhone}
                                    inputAccessoryViewID="toolbar_transport_mode"
                                />

                                <TouchableOpacity style={styles.submitBtn} onPress={handleFastSubmit}>
                                    <LinearGradient colors={[COLORS.neon, '#AACC00']} style={styles.submitGradient}>
                                        <Text style={styles.submitText}>TALEBİ GÖNDER</Text>
                                        <MaterialCommunityIcons name="send" size={20} color="#000" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>

                        {/* Custom JS Toolbar for Absolute Reliability */}
                        {Platform.OS === 'ios' && (
                            <InputAccessoryView nativeID="toolbar_transport_mode">
                                <View style={styles.accessoryContainer}>
                                    <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.accessoryButton}>
                                        <Text style={styles.accessoryText}>Bitti</Text>
                                    </TouchableOpacity>
                                </View>
                            </InputAccessoryView>
                        )}
                    </KeyboardAvoidingView>
                </Modal>

            </SafeAreaView>
        </PremiumBackground >
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 40, lineHeight: 32 },

    cardContainer: { height: 160, marginBottom: 20, borderRadius: 24, overflow: 'hidden', position: 'relative' },
    cardGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
    glowBorder: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderRadius: 24, opacity: 0.5 },

    iconCircleNeon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(204, 255, 0, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.neon },

    iconCircleGold: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 193, 7, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFD700' },
    iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#555' },

    cardContent: { flex: 1 },
    cardTitle: { color: COLORS.neon, fontSize: 16, fontWeight: '900', marginBottom: 6, letterSpacing: 0.5 },
    cardSub: { color: '#aaa', fontSize: 12, lineHeight: 16 },

    arrowBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(204, 255, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 400, borderWidth: 1, borderColor: '#333' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { color: COLORS.neon, fontSize: 18, fontWeight: '900' },
    modalSub: { color: '#888', marginBottom: 20 },
    textArea: { backgroundColor: '#111', borderRadius: 16, padding: 16, color: '#fff', fontSize: 16, height: 150, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 20 },
    submitBtn: { height: 56, borderRadius: 28, overflow: 'hidden' },
    submitGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    submitText: { color: '#000', fontSize: 16, fontWeight: '900' },

    // Gold Accessory Style
    accessoryContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
        padding: 8,
    },
    accessoryButton: {
        backgroundColor: '#1C1C1E',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    accessoryText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
