import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProviderOnboardingScreen() {
    const navigation = useNavigation();
    const [idUploaded, setIdUploaded] = useState(false);
    const [diplomaUploaded, setDiplomaUploaded] = useState(false);
    const [chamberUploaded, setChamberUploaded] = useState(false);

    const handleUpload = (type) => {
        // Mock upload
        Alert.alert("Belge Yükleme", `${type} yükleme işlemi simüle ediliyor... Başarılı!`);
        if (type === 'Kimlik') setIdUploaded(true);
        if (type === 'Diploma') setDiplomaUploaded(true);
        if (type === 'Oda Kaydı') setChamberUploaded(true);
    };

    const handleContinue = () => {
        if (!idUploaded || !diplomaUploaded) {
            Alert.alert("Eksik Belge", "Lütfen kimlik ve diploma belgelerinizi yükleyiniz.");
            return;
        }
        navigation.navigate('ProviderWizard');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Uzman Doğrulama</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="shield-checkmark" size={40} color="#4ADE80" />
                        </View>
                    </View>

                    <Text style={styles.title}>Güvenlik ve Doğrulama</Text>
                    <Text style={styles.subtitle}>
                        Uzman rozetini almak ve hizmet vermeye başlamak için lütfen aşağıdaki belgeleri doğrulayın. Bu bilgiler sadece admin onayı için kullanılır.
                    </Text>

                    <View style={styles.uploadSection}>
                        <UploadItem
                            title="Kimlik Doğrulama"
                            desc="T.C. Kimlik / Ehliyet Ön-Arka Fotoğrafı"
                            icon="id-card"
                            isUploaded={idUploaded}
                            onPress={() => handleUpload('Kimlik')}
                        />
                        <UploadItem
                            title="Mesleki Yeterlilik"
                            desc="Diploma veya Geçici Mezuniyet Belgesi (PDF/Foto)"
                            icon="school"
                            isUploaded={diplomaUploaded}
                            onPress={() => handleUpload('Diploma')}
                        />
                        <UploadItem
                            title="Oda Kayıt Belgesi"
                            desc="İMO, MMO, TMMOB Sicil No veya Üye Kartı"
                            icon="business"
                            isUploaded={chamberUploaded}
                            onPress={() => handleUpload('Oda Kaydı')}
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.btn} onPress={handleContinue}>
                        <Text style={styles.btnText}>Devam Et</Text>
                        <Ionicons name="arrow-forward" size={20} color="#000" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const UploadItem = ({ title, desc, icon, isUploaded, onPress }) => (
    <TouchableOpacity style={[styles.card, isUploaded && styles.cardUploaded]} onPress={onPress}>
        <View style={[styles.cardIcon, isUploaded && styles.cardIconUploaded]}>
            <Ionicons name={isUploaded ? "checkmark" : icon} size={24} color={isUploaded ? "#000" : "#94a3b8"} />
        </View>
        <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, isUploaded && styles.textUploaded]}>{title}</Text>
            <Text style={styles.cardDesc}>{desc}</Text>
        </View>
        {isUploaded ? (
            <Text style={styles.statusText}>Yüklendi</Text>
        ) : (
            <Ionicons name="cloud-upload-outline" size={24} color="#94a3b8" />
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    backButton: { padding: 8, marginRight: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
    headerTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '600' },

    content: { padding: 24, paddingBottom: 100 },
    iconContainer: { alignItems: 'center', marginBottom: 24 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(74, 222, 128, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.3)' },

    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22, marginBottom: 32 },

    uploadSection: { gap: 16 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
    cardUploaded: { borderColor: '#4ADE80', backgroundColor: 'rgba(74, 222, 128, 0.05)' },

    cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
    cardIconUploaded: { backgroundColor: '#4ADE80' },

    cardContent: { flex: 1, paddingHorizontal: 16 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#f1f5f9', marginBottom: 4 },
    textUploaded: { color: '#4ADE80' },
    cardDesc: { fontSize: 12, color: '#64748b' },

    statusText: { fontSize: 12, color: '#4ADE80', fontWeight: 'bold' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: 'rgba(15, 23, 42, 0.95)', borderTopWidth: 1, borderTopColor: '#334155' },
    btn: { backgroundColor: '#4ADE80', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    btnText: { color: '#0f172a', fontSize: 16, fontWeight: 'bold' }
});
