import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { AuthService } from '../../services/AuthService';

const SERVICE_OPTIONS = [
    { key: 'market_seller', label: 'Yapı Market / Malzeme Satışı', icon: 'cart' },
    { key: 'machine_renter', label: 'İş Makinesi Kiralama', icon: 'construct' },
    { key: 'contractor', label: 'Müteahhitlik / Proje', icon: 'business' },
    { key: 'technical_office', label: 'Mimarlık / Mühendislik Ofisi', icon: 'easel' },
    { key: 'renovation_office', label: 'Tadilat & Dekorasyon', icon: 'color-palette' },
    { key: 'logistics_company', label: 'Nakliye & Lojistik', icon: 'bus' },
    { key: 'lawyer', label: 'İnşaat Hukuku / Avukat', icon: 'briefcase' },
];

export default function CompanyRegistrationScreen() {
    const navigation = useNavigation();
    const [step, setStep] = useState(1); // 1: Info, 2: Services
    const [loading, setLoading] = useState(false);

    // Form Data
    const [companyName, setCompanyName] = useState('');
    const [taxNumber, setTaxNumber] = useState('');
    const [taxOffice, setTaxOffice] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);

    const toggleService = (key) => {
        if (selectedServices.includes(key)) {
            setSelectedServices(prev => prev.filter(k => k !== key));
        } else {
            setSelectedServices(prev => [...prev, key]);
        }
    };

    const handleSubmit = async () => {
        if (selectedServices.length === 0) {
            Alert.alert('Hata', 'Lütfen en az bir hizmet alanı seçiniz.');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Kullanıcı oturumu yok');

            const companyData = {
                owner_id: user.id,
                company_name: companyName,
                tax_number: taxNumber,
                tax_office: taxOffice,
                phone: phone,
                address: address,
            };

            await AuthService.registerCompany(companyData, selectedServices);

            Alert.alert(
                'Başvuru Alındı! 🎉',
                'Firma kaydınız başarıyla oluşturuldu ve onaya gönderildi. Başvurunuz incelendikten sonra bilgilendirileceksiniz.',
                [
                    { text: 'Panele Git', onPress: () => navigation.replace('ProviderDashboard') } // Or AppNavigator logic
                ]
            );

        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Kayıt sırasında bir sorun oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Firma Bilgileri</Text>
            <Text style={styles.stepDesc}>Vergi levhanızda yer alan resmi bilgileri giriniz.</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Firma Yasal Ünvanı</Text>
                <TextInput style={styles.input} placeholder="Örn: Yıldız İnşaat Ltd. Şti." placeholderTextColor="#666" value={companyName} onChangeText={setCompanyName} />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Vergi Numarası</Text>
                    <TextInput style={styles.input} placeholder="10 Haneli No" placeholderTextColor="#666" keyboardType="numeric" maxLength={10} value={taxNumber} onChangeText={setTaxNumber} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Vergi Dairesi</Text>
                    <TextInput style={styles.input} placeholder="Vergi Dairesi" placeholderTextColor="#666" value={taxOffice} onChangeText={setTaxOffice} />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Firma Telefonu</Text>
                <TextInput style={styles.input} placeholder="05XX XXX XX XX" placeholderTextColor="#666" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Adres</Text>
                <TextInput style={[styles.input, { height: 80, paddingTop: 12 }]} placeholder="Açık adres..." placeholderTextColor="#666" multiline value={address} onChangeText={setAddress} />
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Hizmet Alanları</Text>
            <Text style={styles.stepDesc}>Firmanızın hangi sektörlerde faaliyet göstereceğini seçiniz. Birden fazla seçim yapabilirsiniz.</Text>

            <View style={styles.servicesGrid}>
                {SERVICE_OPTIONS.map((item) => {
                    const isSelected = selectedServices.includes(item.key);
                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                            onPress={() => toggleService(item.key)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                                <Ionicons name={item.icon} size={24} color={isSelected ? '#FFD700' : '#888'} />
                            </View>
                            <Text style={[styles.serviceText, isSelected && styles.serviceTextSelected]}>{item.label}</Text>
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Ionicons name="checkmark" size={14} color="#000" />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Kurumsal Kayıt</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.stepDot, step >= 1 && styles.stepActive]}>
                        <Text style={styles.stepNum}>1</Text>
                    </View>
                    <View style={[styles.stepLine, step >= 2 && styles.lineActive]} />
                    <View style={[styles.stepDot, step >= 2 && styles.stepActive]}>
                        <Text style={styles.stepNum}>2</Text>
                    </View>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                        {step === 1 ? renderStep1() : renderStep2()}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer Action */}
                <View style={styles.footer}>
                    {step === 1 ? (
                        <TouchableOpacity
                            style={styles.btn}
                            onPress={() => {
                                if (!companyName || !taxNumber || !phone) {
                                    Alert.alert('Eksik Bilgi', 'Lütfen zorunlu alanları doldurunuz.');
                                    return;
                                }
                                setStep(2);
                            }}
                        >
                            <LinearGradient colors={['#D4AF37', '#AA8C2C']} style={styles.btnGradient}>
                                <Text style={styles.btnText}>Devam Et</Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
                            <LinearGradient colors={['#D4AF37', '#AA8C2C']} style={styles.btnGradient}>
                                {loading ? <Text style={styles.btnText}>Gönderiliyor...</Text> : <Text style={styles.btnText}>Başvuruyu Tamamla</Text>}
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    backBtn: { padding: 8 },

    progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
    stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#444' },
    stepActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    stepNum: { fontSize: 14, fontWeight: 'bold', color: '#000' },
    stepLine: { width: 50, height: 2, backgroundColor: '#222', marginHorizontal: 8 },
    lineActive: { backgroundColor: '#FFD700' },

    formContainer: { padding: 24 },
    stepTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
    stepDesc: { fontSize: 14, color: '#888', marginBottom: 24 },

    inputGroup: { marginBottom: 16 },
    label: { color: '#CCC', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
    input: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, color: '#FFF', fontSize: 15 },
    row: { flexDirection: 'row' },

    servicesGrid: { gap: 12 },
    serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    serviceCardSelected: { borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.05)' },
    iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    iconBoxSelected: { backgroundColor: 'rgba(255, 215, 0, 0.1)' },
    serviceText: { flex: 1, color: '#CCC', fontSize: 15, fontWeight: '600' },
    serviceTextSelected: { color: '#FFD700' },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
    checkboxSelected: { backgroundColor: '#FFD700', borderColor: '#FFD700' },

    footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
    btn: { borderRadius: 14, overflow: 'hidden' },
    btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
    btnText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});
