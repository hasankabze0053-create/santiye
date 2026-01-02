import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Dimensions, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
const GOLD_MAIN = '#FFD700';
const GOLD_DARK = '#FF9100';
const SUCCESS_GREEN = '#10B981';

// --- DATA ---
const EXPERT_CATEGORIES = [
    { id: '1', title: 'İnşaat Mühendisi', icon: 'hard-hat', sub: 'Statik & Betonarme' }, // building
    { id: '2', title: 'Mimar', icon: 'ruler-combined', sub: 'Tasarım & Ruhsat' }, // draft
    { id: '3', title: 'İç Mimar', icon: 'couch', sub: 'Dekorasyon & Dizayn' }, // swatchbook
    { id: '4', title: 'İş Güvenliği Uzmanı', icon: 'user-shield', sub: 'Saha Denetimi & İSG' }, // shield-virus
    { id: '5', title: 'Hakediş & Metraj', icon: 'calculator', sub: 'Maliyet Hesabı' }, // calculator
    { id: '6', title: 'Elektrik Mühendisi', icon: 'bolt', sub: 'Proje & Tesisat' }, // bolt
    { id: '7', title: 'Makine Mühendisi', icon: 'cogs', sub: 'Mekanik Tesisat' }, // cogs
    { id: '8', title: 'Harita Mühendisi', icon: 'map-marked-alt', sub: 'Ölçüm & Aplikasyon' }, // map
];

export default function OnlineDiscoveryScreen() {
    const navigation = useNavigation();
    const [step, setStep] = useState(1); // 1: Select Expert, 2: Select Method, 3: Chat/Video
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [communicationMethod, setCommunicationMethod] = useState(null); // 'VIDEO' or 'MESSAGE'
    const [messageText, setMessageText] = useState('');

    // --- STEPS ---

    const handleSelectExpert = (expert) => {
        setSelectedExpert(expert);
        setStep(2);
    };

    const handleSelectMethod = (method) => {
        setCommunicationMethod(method);
        setStep(3);
    };

    const handleBack = () => {
        if (step === 1) navigation.goBack();
        else if (step === 2) setStep(1);
        else setStep(2);
    };

    const handleSendMessage = () => {
        if (!messageText.trim()) return;
        Alert.alert("Başarılı", "Mesajınız ve dosyanız uzmana iletildi. En kısa sürede yanıt alacaksınız.");
        setMessageText('');
        navigation.goBack();
    };

    const handleBookAppointment = () => {
        Alert.alert("Randevu Talebi", "Görüntülü görüşme talebiniz alındı. Uzmanımız uygunluk durumuna göre size bildirim gönderecektir.");
        navigation.goBack();
    };


    // --- RENDERS ---

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>ONLINE KEŞİF</Text>
                <Text style={styles.headerSubtitle}>
                    {step === 1 ? 'Uzman Seçimi' : step === 2 ? 'İletişim Yöntemi' : selectedExpert?.title}
                </Text>
            </View>
            <View style={{ width: 40 }} />
        </View>
    );

    const renderStep1_ExpertList = () => (
        <View style={styles.contentContainer}>
            <Text style={styles.instructionText}>Destek almak istediğiniz uzmanlık alanını seçin:</Text>
            <FlatList
                data={EXPERT_CATEGORIES}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingBottom: 50 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.expertCard}
                        onPress={() => handleSelectExpert(item)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#1a1a1a', '#111']}
                            style={styles.expertCardGradient}
                        >
                            <View style={styles.iconCircle}>
                                <FontAwesome5 name={item.icon} size={24} color={GOLD_MAIN} />
                            </View>
                            <Text style={styles.expertTitle}>{item.title}</Text>
                            <Text style={styles.expertSub}>{item.sub}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    const renderStep2_MethodSelection = () => (
        <View style={styles.contentContainer}>
            <View style={styles.expertSummaryContainer}>
                <View style={styles.iconCircleSmall}>
                    <FontAwesome5 name={selectedExpert?.icon} size={18} color="#000" />
                </View>
                <Text style={styles.expertSummaryText}>Seçilen: <Text style={{ color: GOLD_MAIN, fontWeight: 'bold' }}>{selectedExpert?.title}</Text></Text>
            </View>

            <Text style={styles.instructionText}>Nasıl iletişim kurmak istersiniz?</Text>

            {/* VIDEO CALL OPTION */}
            <TouchableOpacity style={styles.methodCard} onPress={() => handleSelectMethod('VIDEO')}>
                <LinearGradient colors={['#1a1a1a', '#111']} style={styles.methodCardContent}>
                    <View style={[styles.methodIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Ionicons name="videocam" size={32} color={SUCCESS_GREEN} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.methodTitle}>Görüntülü Randevu</Text>
                        <Text style={styles.methodDesc}>Uzmanımızla canlı görüşerek sorununuzu gösterin ve anında çözüm alın.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </LinearGradient>
            </TouchableOpacity>

            {/* MESSAGE OPTION */}
            <TouchableOpacity style={styles.methodCard} onPress={() => handleSelectMethod('MESSAGE')}>
                <LinearGradient colors={['#1a1a1a', '#111']} style={styles.methodCardContent}>
                    <View style={[styles.methodIconBox, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                        <Ionicons name="chatbubbles" size={32} color={GOLD_MAIN} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.methodTitle}>Mesaj & Dosya Gönder</Text>
                        <Text style={styles.methodDesc}>Fotoğraf, proje dosyası yükleyin ve sorunuzu yazılı olarak iletin.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </LinearGradient>
            </TouchableOpacity>

        </View>
    );

    const renderStep3_Communication = () => {
        if (communicationMethod === 'VIDEO') {
            return (
                <View style={styles.contentContainer}>
                    <View style={styles.videoPromoContainer}>
                        <Ionicons name="calendar" size={60} color={SUCCESS_GREEN} style={{ marginBottom: 20 }} />
                        <Text style={styles.videoTitle}>Görüntülü Keşif Randevusu</Text>
                        <Text style={styles.videoDesc}>
                            {selectedExpert?.title} uzmanımızla yapacağınız görüşme için uygun zamanı belirleyin.
                            Görüşme süresi min. 15 dakikadır.
                        </Text>
                    </View>

                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.bigButton} onPress={handleBookAppointment}>
                        <Text style={styles.bigButtonText}>RANDEVU TALEBİ OLUŞTUR</Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.contentContainer}>
                        <View style={styles.chatHeader}>
                            <Text style={{ color: '#ccc' }}>Uzmana sorununuzu detaylıca anlatın. Gerekirse fotoğraf veya proje dosyası ekleyin.</Text>
                        </View>

                        <View style={styles.inputArea}>
                            <TextInput
                                style={styles.msgInput}
                                multiline
                                placeholder="Mesajınız..."
                                placeholderTextColor="#666"
                                value={messageText}
                                onChangeText={setMessageText}
                            />

                            <View style={styles.mediaButtons}>
                                <TouchableOpacity style={styles.mediaBtn}>
                                    <Ionicons name="camera" size={20} color={GOLD_MAIN} />
                                    <Text style={styles.mediaBtnText}>Foto</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.mediaBtn}>
                                    <Ionicons name="attach" size={20} color={GOLD_MAIN} />
                                    <Text style={styles.mediaBtnText}>Dosya</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.bigButton} onPress={handleSendMessage}>
                            <Text style={styles.bigButtonText}>GÖNDER</Text>
                            <Ionicons name="send" size={20} color="#000" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            );
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <LinearGradient colors={['#000', '#111']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>
                {renderHeader()}

                {step === 1 && renderStep1_ExpertList()}
                {step === 2 && renderStep2_MethodSelection()}
                {step === 3 && renderStep3_Communication()}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
    headerTitle: { color: GOLD_MAIN, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
    headerSubtitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    backBtn: { padding: 8 },

    contentContainer: { flex: 1, padding: 20 },
    instructionText: { color: '#888', marginBottom: 20, fontSize: 14 },

    // Expert Card
    expertCard: { width: '48%', height: 140, marginBottom: 15, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    expertCardGradient: { flex: 1, padding: 15, justifyContent: 'center', alignItems: 'center' },
    iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    expertTitle: { color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center', marginBottom: 4 },
    expertSub: { color: '#666', fontSize: 10, textAlign: 'center' },

    // Step 2 Summary
    expertSummaryContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 12, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#333' },
    iconCircleSmall: { width: 30, height: 30, borderRadius: 15, backgroundColor: GOLD_MAIN, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    expertSummaryText: { color: '#fff', fontSize: 14 },

    // Method Card
    methodCard: { marginBottom: 15, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    methodCardContent: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    methodIconBox: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    methodTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    methodDesc: { color: '#888', fontSize: 12, lineHeight: 18 },

    // Video
    videoPromoContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    videoTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    videoDesc: { color: '#888', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },

    // Chat
    chatHeader: { marginBottom: 20 },
    inputArea: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
    msgInput: { color: '#fff', fontSize: 15, textAlignVertical: 'top', flex: 1 },
    mediaButtons: { flexDirection: 'row', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#333' },
    mediaBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    mediaBtnText: { color: '#aaa', fontSize: 13, marginLeft: 6 },

    // Big Button
    bigButton: { backgroundColor: GOLD_MAIN, flexDirection: 'row', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: GOLD_MAIN, shadowOffset: { height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    bigButtonText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});
