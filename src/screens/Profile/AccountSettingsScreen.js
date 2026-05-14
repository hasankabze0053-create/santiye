import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function AccountSettingsScreen({ route }) {
    const navigation = useNavigation();
    const { user } = useAuth();
    // Profil sayfasından gelen mevcut veriyi alıyoruz
    const { profileData } = route.params || {};
    const [fullName, setFullName] = useState(profileData?.full_name || '');
    const [phoneNumber, setPhoneNumber] = useState(profileData?.phone || '');
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingCompany, setFetchingCompany] = useState(false);
    const { isDarkMode } = useTheme();

    const theme = {
        background:        isDarkMode ? '#000000' : '#EDE5D5',
        card:              isDarkMode ? '#1C1C1E' : '#FAF8F3',
        text:              isDarkMode ? '#FFFFFF' : '#1C1208',
        subText:           isDarkMode ? '#8E8E93' : '#4A3D28',
        icon:              isDarkMode ? '#FDCB58' : '#8C6200',
        border:            isDarkMode ? '#333333' : '#D4C4A8',
        iconBg:            isDarkMode ? '#2C2C2E' : '#EDE0CA',
        placeholder:       isDarkMode ? '#2C2C2E' : '#F0E8D8',
    };

    // The Corporate Card ALWAYS keeps this Dark/Gold scheme
    const corporateTheme = {
        background: ['#1C1C1E', '#111111'],
        border: '#FDCB58',
        text: '#FFFFFF',
        subText: '#CCCCCC',
        icon: '#FDCB58'
    };

    const fetchCompanyInfo = async () => {
        if (profileData?.user_type !== 'corporate') return;
        
        try {
            setFetchingCompany(true);
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('owner_id', user.id)
                .single();
            
            if (error) {
                console.warn("Company fetch error:", error);
                return;
            }
            setCompanyData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingCompany(false);
        }
    };

    useState(() => {
        fetchCompanyInfo();
    }, []);

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
                    phone: phoneNumber,
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Custom Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.icon} />
                </TouchableOpacity>
                <Text allowFontScaling={false} style={[styles.headerTitle, { color: theme.text }]}>Hesap Bilgileri</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text allowFontScaling={false} style={[styles.label, { color: theme.icon }]}>Ad Soyad</Text>
                <TextInput allowFontScaling={false}
                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor={theme.subText}
                />

                <Text allowFontScaling={false} style={[styles.label, { color: theme.icon }]}>Telefon Numarası</Text>
                <TextInput allowFontScaling={false}
                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    value={phoneNumber}
                    onChangeText={(val) => {
                        if (val.length > 0 && !val.startsWith('0')) {
                            setPhoneNumber('0' + val.replace(/^0+/, ''));
                        } else {
                            setPhoneNumber(val);
                        }
                    }}
                    placeholder="05XX XXX XX XX"
                    placeholderTextColor={theme.subText}
                    keyboardType="phone-pad"
                    maxLength={11}
                />

                <Text allowFontScaling={false} style={[styles.label, { color: theme.icon }]}>E-Posta (Değiştirilemez)</Text>
                <View style={[styles.input, styles.disabledInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text allowFontScaling={false} style={{ color: theme.subText }}>{user?.email}</Text>
                </View>

                {/* New User Type Field */}
                <Text allowFontScaling={false} style={[styles.label, { color: theme.icon }]}>Kullanıcı Tipi</Text>
                <View style={[styles.input, styles.disabledInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text allowFontScaling={false} style={{ color: theme.subText }}>
                        {profileData?.user_type === 'corporate' ? 'Kurumsal Üye' : 'Bireysel Kullanıcı'}
                    </Text>
                </View>

                {/* CORPORATE INFO SECTION */}
                {profileData?.user_type === 'corporate' && (
                    <View style={{ marginTop: 25 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8 }}>
                            <MaterialCommunityIcons name="domain" size={20} color={theme.icon} />
                            <Text allowFontScaling={false} style={{ color: theme.icon, fontSize: 16, fontWeight: 'bold' }}>Kurumsal Firma Bilgileri</Text>
                        </View>

                        {fetchingCompany ? (
                            <ActivityIndicator color={theme.icon} style={{ marginVertical: 20 }} />
                        ) : companyData ? (
                            <View style={[styles.corporateDetailsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <View style={styles.detailRow}>
                                    <Text allowFontScaling={false} style={[styles.detailLabel, { color: theme.subText }]}>Firma Ünvanı</Text>
                                    <Text allowFontScaling={false} style={[styles.detailValue, { color: theme.text }]}>{companyData.company_name || '-'}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 15 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={[styles.detailLabel, { color: theme.subText }]}>Vergi No</Text>
                                        <Text allowFontScaling={false} style={[styles.detailValue, { color: theme.text }]}>{companyData.tax_number || '-'}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={[styles.detailLabel, { color: theme.subText }]}>Vergi Dairesi</Text>
                                        <Text allowFontScaling={false} style={[styles.detailValue, { color: theme.text }]}>{companyData.tax_office || '-'}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text allowFontScaling={false} style={[styles.detailLabel, { color: theme.subText }]}>İletişim Tel</Text>
                                    <Text allowFontScaling={false} style={[styles.detailValue, { color: theme.text }]}>{companyData.phone || '-'}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text allowFontScaling={false} style={[styles.detailLabel, { color: theme.subText }]}>Firma Adresi</Text>
                                    <Text allowFontScaling={false} style={[styles.detailValue, { color: theme.text }]}>{companyData.address || '-'}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={[styles.corporateDetailsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Text allowFontScaling={false} style={{ color: theme.subText, fontStyle: 'italic', textAlign: 'center' }}>Firma bilgileri bulunamadı.</Text>
                            </View>
                        )}
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: isDarkMode ? '#FDCB58' : '#8C6200', shadowColor: isDarkMode ? '#FDCB58' : '#8C6200' }]} 
                    onPress={handleUpdate} 
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={isDarkMode ? '#000' : '#FFF'} />
                    ) : (
                        <Text allowFontScaling={false} style={[styles.saveButtonText, { color: isDarkMode ? '#000' : '#FFF' }]}>Değişiklikleri Kaydet</Text>
                    )}
                </TouchableOpacity>

                {/* Corporate Card Restored for Individual Users */}
                {(!profileData?.user_type || profileData?.user_type === 'individual') && (
                    <TouchableOpacity
                        style={{ marginTop: 20 }}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('Onboarding')}
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
                                    <Text allowFontScaling={false} style={[styles.corporateTitle, { color: corporateTheme.text }]}>
                                        Kurumsal Üyelik
                                    </Text>
                                    <Text allowFontScaling={false} style={[styles.corporateSubtitle, { color: corporateTheme.subText }]}>
                                        Hizmet vermek için kurumsal hesaba geçin.
                                    </Text>
                                </View>
                                <View style={styles.corporateArrow}>
                                    <Text allowFontScaling={false} style={styles.manageText}>BAŞVUR</Text>
                                    <Ionicons name="chevron-forward" size={16} color={corporateTheme.icon} />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
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

    // Corporate Detail Styles
    corporateDetailsContainer: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#222'
    },
    detailRow: { marginBottom: 12 },
    detailLabel: { color: '#666', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    detailValue: { color: '#fff', fontSize: 14, fontWeight: '500' }
});
