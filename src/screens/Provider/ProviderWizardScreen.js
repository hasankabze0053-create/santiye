import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROVIDER_ROLES = [
    { id: 'is_contractor', label: 'Müteahhitlik / Proje', icon: 'business-outline' },
    { id: 'is_seller', label: 'Yapı Market / Malzeme Satışı', icon: 'cart-outline' },
    { id: 'is_transporter', label: 'İş Makinesi / Nakliye', icon: 'construct-outline' },
    { id: 'is_architect', label: 'Mimarlık / Mühendislik Ofisi', icon: 'easel-outline' },
    { id: 'is_real_estate_agent', label: 'Emlak Danışmanlığı', icon: 'home-outline' },
    { id: 'is_lawyer', label: 'Avukat / Hukuk Bürosu', icon: 'scale-outline' },
];

import { useAuth } from '../../context/AuthContext';

export default function ProviderWizardScreen() {
    const navigation = useNavigation();
    const { refreshProfile } = useAuth();
    const [step, setStep] = useState(1);

    // Form State
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [onlineEnabled, setOnlineEnabled] = useState(false);
    const [onlinePrice, setOnlinePrice] = useState('');
    const [onsiteEnabled, setOnsiteEnabled] = useState(false);
    const [onsitePrice, setOnsitePrice] = useState('');
    const [bio, setBio] = useState('');

    const toggleRole = (roleId) => {
        if (selectedRoles.includes(roleId)) {
            setSelectedRoles(selectedRoles.filter(id => id !== roleId));
        } else {
            setSelectedRoles([...selectedRoles, roleId]);
        }
    };

    const handleNext = async () => {
        if (step === 1 && selectedRoles.length === 0) {
            Alert.alert("Seçim Yapın", "Lütfen en az bir hizmet alanı seçin.");
            return;
        }
        if (step === 2 && !onlineEnabled && !onsiteEnabled) {

            // For sellers (Yapı Market), service details might not be relevant in the same way, 
            // but let's keep it required for now or make it optional if only 'is_seller' is selected.
            // For simplicity, we enforce it for everyone for now, or we can skip step 2 for sellers later.
            if (!selectedRoles.includes('is_seller')) {
                Alert.alert("Hizmet Türü", "En az bir hizmet türünü (Online veya Şantiye) aktif etmelisiniz.");
                return;
            }
        }
        if (step === 3 && bio.length < 10) {
            Alert.alert("Biyografi", "Lütfen kendinizi tanıtan kısa bir yazı yazın.");
            return;
        }

        if (step < 3) {
            setStep(step + 1);
        } else {
            // Finish & Save
            try {
                const { data: { user } } = await import('../../lib/supabase').supabase.auth.getUser();
                if (!user) throw new Error("Kullanıcı bulunamadı");

                // Prepare updates object
                const updates = {
                    user_type: 'corporate',
                    approval_status: 'pending', // or 'incomplete' basically needs approval
                    bio: bio,
                    // Reset all roles to false first? No, default is false.
                    is_contractor: selectedRoles.includes('is_contractor'),
                    is_seller: selectedRoles.includes('is_seller'),
                    is_transporter: selectedRoles.includes('is_transporter'),
                    is_architect: selectedRoles.includes('is_architect'),
                    is_engineer: selectedRoles.includes('is_architect'),
                    is_real_estate_agent: selectedRoles.includes('is_real_estate_agent'),
                    is_lawyer: selectedRoles.includes('is_lawyer'),
                };

                const { error } = await import('../../lib/supabase').supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id);

                if (error) throw error;

                // Force context refresh to ensure UI updates immediately
                // We need to import useAuth logic here or just rely on navigation focus
                // But since we are inside a function, we can't use hook. 
                // Wait, useAuth() is a hook, we can use it at component level. 

                // Let's assume refreshProfile is passed or we trigger it.
                // Since I can't easily access the hook's refreshProfile inside this callback if I didn't destructure it,
                // I will add it to the component.
                if (refreshProfile) await refreshProfile();

                Alert.alert("Başvuru Alındı", "Profiliniz ve yetki talepleriniz onaya gönderildi. Durumunuzu profil sayfasından takip edebilirsiniz.", [
                    {
                        text: "Tamam",
                        onPress: () => navigation.navigate('MainTabs', { screen: 'Profil' })
                    }
                ]);

            } catch (err) {
                Alert.alert("Hata", "Başvuru gönderilemedi: " + err.message);
            }
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
                            <Text style={styles.title}>Hizmet Alanları</Text>
                            <Text style={styles.subtitle}>Firmanızın hangi sektörlerde faaliyet göstereceğini seçiniz. Birden fazla seçim yapabilirsiniz.</Text>

                            <View style={styles.roleContainer}>
                                {PROVIDER_ROLES.map((role) => {
                                    const isSelected = selectedRoles.includes(role.id);
                                    return (
                                        <TouchableOpacity
                                            key={role.id}
                                            style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                                            onPress={() => toggleRole(role.id)}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.roleIconBox}>
                                                <Ionicons name={role.icon} size={24} color={isSelected ? "#000" : "#94a3b8"} />
                                            </View>
                                            <Text style={[styles.roleText, isSelected && styles.roleTextSelected]}>
                                                {role.label}
                                            </Text>
                                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                                {isSelected && <Ionicons name="checkmark" size={16} color="#000" />}
                                            </View>
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
    roleContainer: { gap: 12 },
    roleCard: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12,
        backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', marginBottom: 12
    },
    roleCardSelected: { backgroundColor: '#4ADE80', borderColor: '#4ADE80' },
    roleIconBox: {
        width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center', marginRight: 12
    },
    roleText: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 16, flex: 1 },
    roleTextSelected: { color: '#0f172a' },
    checkbox: {
        width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#64748b',
        alignItems: 'center', justifyContent: 'center'
    },
    checkboxSelected: { backgroundColor: '#fff', borderColor: '#fff' },

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
