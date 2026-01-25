import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- THEME CONSTANTS ---
const THEME = {
    background: '#050505',
    cardBg: '#1A1A1A',
    goldPrimary: '#D4AF37',
    goldHighlight: '#F7E5A8',
    textSecondary: '#888',
    inputBg: '#1A1A1A',
    placeholder: '#666',
};

const BTN_GRADIENT = ['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30'];

export default function CustomRequestScreen({ navigation }) {
    const [note, setNote] = useState('');

    // Dummy data for upload slots
    const renderUploadSlot = (label, isGold = true) => (
        <TouchableOpacity
            style={[
                styles.uploadSlot,
                { borderColor: isGold ? THEME.goldPrimary : '#444' }
            ]}
            activeOpacity={0.7}
        >
            <MaterialCommunityIcons
                name="camera-plus-outline"
                size={24}
                color={isGold ? THEME.goldPrimary : '#888'}
            />
            <Text style={[
                styles.uploadText,
                { color: isGold ? THEME.goldPrimary : '#888' }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212', '#000000']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Detaylar &</Text>
                        <Text style={[styles.headerTitle, { color: THEME.goldPrimary }]}> İstekler</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >

                        {/* SECTION 1: CURRENT STATE UPLOAD */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Mevcut Alan Fotoğrafları</Text>
                            <Text style={styles.sectionSubLabel}>Proje yapılacak alanın şu anki hali (Opsiyonel).</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {renderUploadSlot('Alan Ekle', false)}
                                {renderUploadSlot('Alan Ekle', false)}
                                {renderUploadSlot('Alan Ekle', false)}
                                <View style={{ width: 20 }} />
                            </ScrollView>
                        </View>

                        {/* SECTION 2: SPECIAL NOTES */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Özel İstekleriniz</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Örn: Salonda şömine istiyorum, zemin mermer olsun..."
                                    placeholderTextColor={THEME.placeholder}
                                    multiline
                                    textAlignVertical="top"
                                    value={note}
                                    onChangeText={setNote}
                                />
                                {/* Mic Icon Overlay */}
                                <TouchableOpacity style={styles.micButton}>
                                    <Ionicons name="mic" size={20} color={THEME.goldPrimary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* SECTION 3: INSPIRATION UPLOAD */}
                        <View style={[styles.section, { marginBottom: 100 }]}>
                            <Text style={styles.sectionLabel}>İlham Aldığınız Görseller</Text>
                            <Text style={styles.sectionSubLabel}>Beğendiğiniz tasarımları ekleyin.</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {renderUploadSlot('Örnek Ekle', true)}
                                {renderUploadSlot('Örnek Ekle', true)}
                                {renderUploadSlot('Örnek Ekle', true)}
                                <View style={{ width: 20 }} />
                            </ScrollView>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* FOOTER BUTTON */}
                <View style={styles.footerContainer}>
                    <LinearGradient colors={['transparent', '#000']} style={styles.bottomFade} pointerEvents="none" />

                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => navigation.navigate('RenovationSuccess')}
                    >
                        <LinearGradient
                            colors={BTN_GRADIENT}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.buttonText}>KEŞİF & TEKLİF İSTE</Text>
                            <MaterialCommunityIcons name="check-decagram" size={20} color="#1a1a1a" style={{ marginLeft: 8 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    safeArea: { flex: 1 },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10
    },
    backButton: {
        width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20
    },
    headerTitleContainer: { flexDirection: 'row' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5 },

    scrollContent: { padding: 20 },

    section: { marginBottom: 30 },
    sectionLabel: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 8, letterSpacing: 0.5 },
    sectionSubLabel: { fontSize: 12, color: '#666', marginBottom: 15 },

    inputContainer: { position: 'relative' },
    textInput: {
        backgroundColor: THEME.inputBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)', // Subtle gold border
        color: '#FFF',
        fontSize: 14,
        padding: 15,
        paddingRight: 45, // Space for mic
        height: 150,
    },
    micButton: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)'
    },

    horizontalScroll: { flexDirection: 'row', marginHorizontal: -10, paddingHorizontal: 10 },
    uploadSlot: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        backgroundColor: 'rgba(255,255,255,0.02)'
    },
    uploadText: { fontSize: 11, marginTop: 5, fontWeight: '500' },

    footerContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 30, paddingBottom: 40,
        alignItems: 'center'
    },
    bottomFade: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
    },
    continueButton: {
        width: '100%', borderRadius: 30, overflow: 'hidden',
        shadowColor: THEME.goldPrimary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 8
    },
    gradientButton: {
        height: 55, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    },
    buttonText: { color: '#1a1a1a', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});
