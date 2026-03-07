import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
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
import { AIService } from '../../services/AIService';
import { MarketService } from '../../services/MarketService';

const { width } = Dimensions.get('window');

// Force Refresh
// Force Refresh
function SmartProcurementWizardScreen() {
    const navigation = useNavigation();

    // Wizard Steps: 0: Input, 1: Processing, 2: Confirmation
    const [step, setStep] = useState(0);
    const [inputText, setInputText] = useState('');
    const [parsedData, setParsedData] = useState(null);

    // Logic
    const handleAnalyze = async () => {
        if (!inputText.trim()) {
            Alert.alert('Dikkat', 'Lütfen ihtiyacınızı yazın (Örn: 1000 m3 C30 beton)');
            return;
        }

        Keyboard.dismiss();
        setStep(1); // Show Loading

        try {
            const result = await AIService.parseRequest(inputText);
            setParsedData(result);
            setStep(2); // Show Confirmation
        } catch (error) {
            Alert.alert('Hata', 'Analiz sırasında bir sorun oluştu.');
            setStep(0);
        }
    };

    const handleConfirm = async () => {
        setStep(1); // Show Loading again
        try {
            const requestPayload = {
                title: `${parsedData.quantity || ''} ${parsedData.unit || ''} ${parsedData.category}`.trim() || 'Yeni İlan',
                items: [{ product_name: parsedData.category, quantity: parsedData.quantity ? parseInt(parsedData.quantity) : 1 }],
                location: parsedData.location || 'Belirtilmedi',
                delivery_time: parsedData.urgency || 'Normal',
                notes: `CepteŞef Ön Analizi: ${parsedData.ai_notes}\n\nKullanıcının Girdiği Metin: ${inputText}`,
                payment_method: 'Belirtilmedi',
            };
            
            const result = await MarketService.createRequest(requestPayload);
            if (result.success) {
                Alert.alert('Başarılı', 'İlanınız market teklif panosuna asıldı! En uygun satıcılar size buradan teklif sunacaktır.');
                navigation.navigate('MarketStack');
            } else {
                throw new Error('Talep oluşturulamadı');
            }
        } catch (error) {
            Alert.alert('Hata', 'İlan yayınlanırken bir sorun oluştu.');
            setStep(2);
        }
    };

    // --- Render Steps ---

    const renderInputStep = () => (
        <View style={styles.stepContainer}>
            <Text allowFontScaling={false} style={styles.promptTitle}>Size Nasıl Yardımcı Olabilirim?</Text>
            <Text allowFontScaling={false} style={styles.promptSubtitle}>
                İhtiyacınızı doğal bir dille anlatın, teknik detayları ben hallederim.
            </Text>

            <View style={styles.inputCard}>
                <TextInput allowFontScaling={false}
                    style={styles.textInput}
                    placeholder="Örnek: Yarın Maslak'taki şantiyem için 500 m3 C30 beton lazım, pompalı döküm olacak."
                    placeholderTextColor="#666"
                    multiline
                    value={inputText}
                    onChangeText={setInputText}
                    autoFocus
                />
                <TouchableOpacity style={styles.micButton}>
                    <MaterialCommunityIcons name="microphone" size={24} color="#D4AF37" />
                </TouchableOpacity>
            </View>

            <View style={styles.suggestionContainer}>
                <Text allowFontScaling={false} style={styles.suggestionTitle}>Hızlı Örnekler:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['C30 Beton', '10 ton 12\'lik Demir', 'Dış Cephe Boyası', 'Yük Asansörü'].map((item, i) => (
                        <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => setInputText(item)}>
                            <Text allowFontScaling={false} style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
                <LinearGradient
                    colors={['#D4AF37', '#996515']}
                    style={styles.gradientButton}
                >
                    <MaterialCommunityIcons name="auto-fix" size={24} color="#000" />
                    <Text allowFontScaling={false} style={styles.buttonText}>ANALİZ ET</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    const renderProcessingStep = () => (
        <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text allowFontScaling={false} style={styles.processingText}>Yapay Zeka Talebinizi İnceliyor...</Text>
            <Text allowFontScaling={false} style={styles.processingSubText}>Teknik şartname oluşturuluyor ve tedarikçiler taranıyor.</Text>
        </View>
    );

    const renderConfirmationStep = () => (
        <View style={styles.stepContainer}>
            <Text allowFontScaling={false} style={styles.promptTitle}>Bunu mu Demek İstediniz?</Text>
            <Text allowFontScaling={false} style={styles.promptSubtitle}>Talebinizden şu teknik detayları çıkardım.</Text>

            <View style={styles.resultCard}>
                <View style={styles.resultRow}>
                    <Text allowFontScaling={false} style={styles.resultLabel}>KATEGORİ:</Text>
                    <Text allowFontScaling={false} style={styles.resultValue}>{parsedData?.category}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.resultRow}>
                    <Text allowFontScaling={false} style={styles.resultLabel}>MİKTAR:</Text>
                    <Text allowFontScaling={false} style={styles.resultValue}>
                        {parsedData?.quantity ? `${parsedData.quantity} ${parsedData.unit}` : 'Belirtilmedi'}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.resultRow}>
                    <Text allowFontScaling={false} style={styles.resultLabel}>ACİLİYET:</Text>
                    <Text allowFontScaling={false} style={[styles.resultValue, parsedData?.urgency.includes('Yüksek') && { color: '#FF4444' }]}>
                        {parsedData?.urgency}
                    </Text>
                </View>
                {parsedData?.requirements?.length > 0 && (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.resultRow}>
                            <Text allowFontScaling={false} style={styles.resultLabel}>EKİPMAN:</Text>
                            <Text allowFontScaling={false} style={styles.resultValue}>{parsedData.requirements.join(', ')}</Text>
                        </View>
                    </>
                )}
            </View>

            <View style={styles.aiNoteBoxContainer}>
                <View style={styles.aiNoteHeaderRow}>
                    <MaterialCommunityIcons name="robot-outline" size={24} color="#D4AF37" />
                    <Text allowFontScaling={false} style={styles.aiNoteHeader}>CEPTEŞEF UZMAN TAVSİYESİ</Text>
                </View>
                <Text allowFontScaling={false} style={styles.aiNoteTextBig}>{parsedData?.ai_notes}</Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(0)}>
                    <Text allowFontScaling={false} style={styles.secondaryButtonText}>DÜZENLE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.analyzeButton, { flex: 1, marginTop: 0 }]} onPress={handleConfirm}>
                    <LinearGradient colors={['#D4AF37', '#996515']} style={styles.gradientButton}>
                        <Text allowFontScaling={false} style={styles.buttonText}>İLAN YAYINLA</Text>
                        <MaterialCommunityIcons name="send-check" size={24} color="#000" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text allowFontScaling={false} style={styles.headerTitle}>CEPTEŞEF AI</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${((step + 1) / 4) * 100}%` }]} />
                </View>

                {/* Content */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.content}>
                        {step === 0 && renderInputStep()}
                        {step === 1 && renderProcessingStep()}
                        {step === 2 && renderConfirmationStep()}
                    </View>
                </KeyboardAvoidingView>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    backButton: { padding: 8 },
    headerTitle: { color: '#D4AF37', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    progressContainer: { height: 4, backgroundColor: '#333', marginTop: 10 },
    progressBar: { height: '100%', backgroundColor: '#D4AF37' },

    content: { flex: 1, padding: 20 },

    stepContainer: { flex: 1 },
    promptTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    promptSubtitle: { color: '#AAA', fontSize: 16, marginBottom: 30, lineHeight: 22 },

    inputCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333', minHeight: 150 },
    textInput: { color: '#FFF', fontSize: 18, lineHeight: 26, flex: 1, textAlignVertical: 'top' },
    micButton: { position: 'absolute', bottom: 15, right: 15, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(212, 175, 55, 0.2)', alignItems: 'center', justifyContent: 'center' },

    suggestionContainer: { marginTop: 30 },
    suggestionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
    suggestionChip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1A1A1A', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#333' },
    suggestionText: { color: '#CCC', fontSize: 14 },

    analyzeButton: { marginTop: 40, borderRadius: 12, overflow: 'hidden' },
    gradientButton: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },

    processingText: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
    processingSubText: { color: '#888', fontSize: 14, marginTop: 8 },

    resultCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    resultLabel: { color: '#888', fontSize: 12, fontWeight: 'bold' },
    resultValue: { color: '#FFF', fontSize: 16, fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 12 },

    aiNoteBoxContainer: { backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: 16, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: '#D4AF37' },
    aiNoteHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    aiNoteHeader: { color: '#D4AF37', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    aiNoteTextBig: { color: '#FFF', fontSize: 15, lineHeight: 22 },

    actionRow: { flexDirection: 'row', gap: 16, marginTop: 40 },
    secondaryButton: { paddingVertical: 18, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#666', alignItems: 'center', justifyContent: 'center' },
    secondaryButtonText: { color: '#FFF', fontWeight: 'bold' },
});

export default SmartProcurementWizardScreen;
