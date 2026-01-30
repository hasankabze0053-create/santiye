import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function AccountSettingsScreen({ route }) {
    const navigation = useNavigation();
    const { user } = useAuth();
    // Profil sayfasından gelen mevcut veriyi alıyoruz
    const { profileData } = route.params || {};

    const [fullName, setFullName] = useState(profileData?.full_name || '');
    const [loading, setLoading] = useState(false);

    // The Corporate Card ALWAYS keeps this Dark/Gold scheme
    const corporateTheme = {
        background: ['#1C1C1E', '#111111'],
        border: '#FDCB58',
        text: '#FFFFFF',
        subText: '#CCCCCC',
        icon: '#FDCB58'
    };

    const handleUpdate = async () => {
        if (!fullName.trim()) {
            Alert.alert('Hata', 'İsim boş olamaz.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    // Buraya istersen telefon, adres vs. ekleyebilirsin
                })
                .eq('id', user.id);

            if (error) throw error;

            Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
            navigation.goBack(); // Geri dönünce profil sayfası güncellenecek (useFocusEffect sayesinde)
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Custom Header (Matches NotificationSettings) */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hesap Bilgileri</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Ad Soyad</Text>
                <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>E-Posta (Değiştirilemez)</Text>
                <View style={[styles.input, styles.disabledInput]}>
                    <Text style={{ color: '#aaa' }}>{user?.email}</Text>
                </View>

                {/* New User Type Field */}
                <Text style={styles.label}>Kullanıcı Tipi</Text>
                <View style={[styles.input, styles.disabledInput]}>
                    <Text style={{ color: '#aaa' }}>
                        {profileData?.user_type === 'corporate' ? 'Kurumsal Üye' : 'Bireysel Kullanıcı'}
                    </Text>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                    )}
                </TouchableOpacity>

                {/* CORPORATE ACTION CARD (Moved from ProfileScreen) */}
                <View style={{ marginTop: 40, marginBottom: 20 }}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            if (profileData?.user_type === 'corporate') {
                                navigation.navigate('ProviderDashboard');
                            } else {
                                navigation.navigate('Onboarding');
                            }
                        }}
                    >
                        <LinearGradient
                            colors={corporateTheme.background}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.corporateCard, { borderColor: corporateTheme.border }]}
                        >
                            <View style={styles.corporateContent}>
                                <View style={styles.corporateIconCircle}>
                                    <MaterialCommunityIcons name="domain" size={28} color={corporateTheme.icon} />
                                </View>
                                <View style={styles.corporateTextContainer}>
                                    <Text style={[styles.corporateTitle, { color: corporateTheme.text }]}>
                                        {profileData?.user_type === 'corporate' ? 'Firma Paneli' : 'Kurumsal Üyelik'}
                                    </Text>
                                    <Text style={[styles.corporateSubtitle, { color: corporateTheme.subText }]}>
                                        {profileData?.user_type === 'corporate'
                                            ? 'Hizmetlerinizi ve tekliflerinizi yönetin.'
                                            : 'Hizmet vermek için kurumsal hesaba geçin.'}
                                    </Text>
                                </View>
                                <View style={styles.corporateArrow}>
                                    <Text style={styles.manageText}>
                                        {profileData?.user_type === 'corporate' ? 'GİT' : 'BAŞVUR'}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color={corporateTheme.icon} />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a'
    },
    backButton: { marginRight: 15 },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    content: { padding: 20 },
    label: { color: '#FFD700', marginBottom: 8, marginTop: 15, fontWeight: 'bold' },
    input: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    disabledInput: { opacity: 0.7 },
    saveButton: {
        backgroundColor: '#FFD700',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3
    },
    saveButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    // Corporate Card Styles
    corporateCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
    corporateContent: { flexDirection: 'row', alignItems: 'center' },
    corporateIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(253, 203, 88, 0.15)', alignItems: 'center', justifyContent: 'center' },
    corporateTextContainer: { flex: 1, marginLeft: 12 },
    corporateTitle: { fontSize: 16, fontWeight: '700' },
    corporateSubtitle: { fontSize: 12, marginTop: 2 },
    corporateArrow: { flexDirection: 'row', alignItems: 'center' },
    manageText: { color: '#FDCB58', fontSize: 12, fontWeight: '700', marginRight: 2 },
});
