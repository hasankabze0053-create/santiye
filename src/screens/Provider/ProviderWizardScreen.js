import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPECIALTIES = [
    'İnşaat Mühendisi', 'Mimar', 'İSG Uzmanı', 'Harita Mühendisi',
    'İç Mimar', 'Peyzaj Mimarı', 'Makine Mühendisi', 'Elektrik Mühendisi', 'Jeoloji Mühendisi'
];

export default function ProviderWizardScreen() {
    const navigation = useNavigation();
    const [step, setStep] = useState(1);

    // Form State
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [onlineEnabled, setOnlineEnabled] = useState(false);
    const [onlinePrice, setOnlinePrice] = useState('');
    const [onsiteEnabled, setOnsiteEnabled] = useState(false);
    const [onsitePrice, setOnsitePrice] = useState('');
    const [bio, setBio] = useState('');

    const toggleSpecialty = (spec) => {
        if (selectedSpecialties.includes(spec)) {
            setSelectedSpecialties(selectedSpecialties.filter(s => s !== spec));
        } else {
            setSelectedSpecialties([...selectedSpecialties, spec]);
        }
    };

    const handleNext = () => {
        if (step === 1 && selectedSpecialties.length === 0) {
            Alert.alert("Seçim Yapın", "Lütfen en az bir uzmanlık alanı seçin.");
            return;
        }
        if (step === 2 && !onlineEnabled && !onsiteEnabled) {
            Alert.alert("Hizmet Türü", "En az bir hizmet türünü (Online veya Şantiye) aktif etmelisiniz.");
            return;
        }
        if (step === 3 && bio.length < 10) {
            // Basic validation
            Alert.alert("Biyografi", "Lütfen kendinizi tanıtan kısa bir yazı yazın.");
            return;
        }

        if (step < 3) {
            setStep(step + 1);
        } else {
            // Finish
            Alert.alert("Profil Oluşturuldu", "Tebrikler! Uzman profiliniz onaya gönderildi.", [
                { text: "Panele Git", onPress: () => navigation.navigate('ProviderDashboard') }
            ]);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Progress Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
                    </View>
                    <Text style={styles.stepIndicator}>{step}/3</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {step === 1 && (
                        <View>
                            <Text style={styles.title}>Uzmanlık Alanı Seçin</Text>
                            <Text style={styles.subtitle}>Hangi kategorilerde hizmet vermek istiyorsunuz?</Text>

                            <View style={styles.grid}>
                                {SPECIALTIES.map((spec) => {
                                    const isSelected = selectedSpecialties.includes(spec);
                                    return (
                                        <TouchableOpacity
                                            key={spec}
                                            style={[styles.chip, isSelected && styles.chipSelected]}
                                            onPress={() => toggleSpecialty(spec)}
                                        >
                                            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{spec}</Text>
                                            {isSelected && <Ionicons name="checkmark-circle" size={18} color="#0f172a" style={{ marginLeft: 8 }} />}
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View>
                            <Text style={styles.title}>Hizmet Detayları & Fiyat</Text>
                            <Text style={styles.subtitle}>Nasıl çalışmak istediğinizi belirleyin.</Text>

                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.cardTitle}>📹 Online Danışmanlık</Text>
                                        <Text style={styles.cardDesc}>Görüntülü görüşme ile proje kontrolü vb.</Text>
                                    </View>
                                    <Switch
                                        value={onlineEnabled}
                                        onValueChange={setOnlineEnabled}
                                        trackColor={{ false: "#334155", true: "#4ADE80" }}
                                    />
                                </View>
                                {onlineEnabled && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Saatlik Ücret (₺)</Text>
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="numeric"
                                            placeholder="2500"
                                            placeholderTextColor="#64748b"
                                            value={onlinePrice}
                                            onChangeText={setOnlinePrice}
                                        />
                                    </View>
                                )}
                            </View>

                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.cardTitle}>🏗️ Şantiye Ziyareti</Text>
                                        <Text style={styles.cardDesc}>Yerinde tespit, denetim ve imza işleri.</Text>
                                    </View>
                                    <Switch
                                        value={onsiteEnabled}
                                        onValueChange={setOnsiteEnabled}
                                        trackColor={{ false: "#334155", true: "#4ADE80" }}
                                    />
                                </View>
                                {onsiteEnabled && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Ziyaret Başı Başlangıç (₺)</Text>
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="numeric"
                                            placeholder="4000"
                                            placeholderTextColor="#64748b"
                                            value={onsitePrice}
                                            onChangeText={setOnsitePrice}
                                        />
                                        <Text style={styles.hint}>*Yol masrafı ayrıca konuşulur.</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {step === 3 && (
                        <View>
                            <Text style={styles.title}>Vitrin & Biyografi</Text>
                            <Text style={styles.subtitle}>Kendinizi müşterilere tanıtın.</Text>

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Hakkımda</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    multiline
                                    placeholder="Deneyimlerinizden, uzmanlıklarınızdan bahsedin..."
                                    placeholderTextColor="#64748b"
                                    value={bio}
                                    onChangeText={setBio}
                                />
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Portfolio / İş Örnekleri</Text>
                                <TouchableOpacity style={styles.uploadBox} onPress={() => Alert.alert("Galeri", "Fotoğraf seçimi açılıyor...")}>
                                    <Ionicons name="images-outline" size={32} color="#4ADE80" />
                                    <Text style={styles.uploadText}>Fotoğraf veya PDF Yükle</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.btn} onPress={handleNext}>
                        <Text style={styles.btnText}>{step === 3 ? 'Profili Tamamla' : 'Devam Et'}</Text>
                        <Ionicons name={step === 3 ? "checkmark-circle" : "arrow-forward"} size={20} color="#0f172a" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },

    header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
    backButton: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
    progressContainer: { flex: 1, height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: '#4ADE80' },
    stepIndicator: { color: '#94a3b8', fontWeight: 'bold' },

    content: { padding: 24, paddingBottom: 100 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 32 },

    // Step 1
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    chip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center' },
    chipSelected: { backgroundColor: '#4ADE80', borderColor: '#4ADE80' },
    chipText: { color: '#cbd5e1', fontWeight: '500' },
    chipTextSelected: { color: '#0f172a', fontWeight: 'bold' },

    // Step 2 & 3
    card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    cardDesc: { color: '#64748b', fontSize: 12 },

    inputGroup: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155' },
    label: { color: '#94a3b8', fontSize: 13, marginBottom: 8, fontWeight: '600' },
    input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, color: '#fff', borderWidth: 1, borderColor: '#334155' },
    hint: { color: '#64748b', fontSize: 11, marginTop: 6, fontStyle: 'italic' },

    formSection: { marginBottom: 24 },
    textArea: { height: 120, textAlignVertical: 'top' },
    uploadBox: { height: 120, borderRadius: 16, borderWidth: 2, borderColor: '#334155', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 12 },
    uploadText: { color: '#94a3b8', fontWeight: '500' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: 'rgba(15, 23, 42, 0.95)', borderTopWidth: 1, borderTopColor: '#334155' },
    btn: { backgroundColor: '#4ADE80', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    btnText: { color: '#0f172a', fontSize: 16, fontWeight: 'bold' }
});
