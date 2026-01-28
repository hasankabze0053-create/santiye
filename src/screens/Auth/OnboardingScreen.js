import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { AuthService } from '../../services/AuthService';

const { width } = Dimensions.get('window');

const OptionCard = ({ title, description, icon, isSelected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[
            styles.optionCard,
            isSelected && styles.optionCardSelected
        ]}
    >
        <LinearGradient
            colors={isSelected ? ['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)'] : ['#1A1A1A', '#1A1A1A']}
            style={styles.cardGradient}
        >
            <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                <MaterialCommunityIcons name={icon} size={32} color={isSelected ? '#FFD700' : '#666'} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>{title}</Text>
                <Text style={styles.optionDesc}>{description}</Text>
            </View>
            <View style={styles.radioContainer}>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
            </View>
        </LinearGradient>
    </TouchableOpacity>
);

export default function OnboardingScreen() {
    const navigation = useNavigation();
    const [selectedType, setSelectedType] = useState(null); // 'individual' | 'corporate'
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!selectedType) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Kullanıcı bulunamadı');

            // Update Profile
            await AuthService.updateProfile(user.id, { user_type: selectedType });

            if (selectedType === 'individual') {
                // Done -> Go Home
                navigation.replace('MainTabs');
            } else {
                // Corporate -> Go to Registration
                navigation.replace('CompanyRegistration');
            }
        } catch (error) {
            console.error(error);
            alert('Bir hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <SafeAreaView style={{ flex: 1 }}>

                <View style={styles.header}>
                    <Text style={styles.title}>Hoş Geldiniz! 👋</Text>
                    <Text style={styles.subtitle}>Size en uygun deneyimi sunabilmemiz için lütfen kullanım amacınızı seçin.</Text>
                </View>

                <View style={styles.content}>
                    <OptionCard
                        title="Bireysel Kullanıcıyım"
                        description="Tadilat yaptırmak, malzeme almak veya fiyat araştırması yapmak istiyorum."
                        icon="account"
                        isSelected={selectedType === 'individual'}
                        onPress={() => setSelectedType('individual')}
                    />

                    <View style={{ height: 16 }} />

                    <OptionCard
                        title="Kurumsal / Hizmet Verenim"
                        description="Ürün satmak, makine kiralamak veya hizmet/teklif vermek istiyorum."
                        icon="briefcase"
                        isSelected={selectedType === 'corporate'}
                        onPress={() => setSelectedType('corporate')}
                    />
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.btn, !selectedType && styles.btnDisabled]}
                        disabled={!selectedType || loading}
                        onPress={handleContinue}
                    >
                        <LinearGradient
                            colors={selectedType ? ['#D4AF37', '#AA8C2C'] : ['#333', '#333']}
                            style={styles.btnGradient}
                        >
                            <Text style={[styles.btnText, !selectedType && styles.btnTextDisabled]}>
                                {loading ? 'İşleniyor...' : 'Devam Et'}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color={selectedType ? '#000' : '#666'} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { padding: 24, paddingTop: 40 },
    title: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 12 },
    subtitle: { fontSize: 16, color: '#999', lineHeight: 24 },

    content: { flex: 1, padding: 24, justifyContent: 'center' },

    optionCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
    },
    optionCardSelected: {
        borderColor: '#FFD700',
    },
    cardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 56, height: 56,
        borderRadius: 28,
        backgroundColor: '#222',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 16,
    },
    iconContainerSelected: {
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    textContainer: { flex: 1 },
    optionTitle: { fontSize: 17, fontWeight: '700', color: '#FFF', marginBottom: 4 },
    optionTitleSelected: { color: '#FFD700' },
    optionDesc: { fontSize: 13, color: '#888', lineHeight: 18 },

    radioContainer: { marginLeft: 12 },
    radioOuter: {
        width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#444',
        alignItems: 'center', justifyContent: 'center'
    },
    radioOuterSelected: { borderColor: '#FFD700' },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFD700' },

    footer: { padding: 24, paddingBottom: 40 },
    btn: { borderRadius: 12, overflow: 'hidden' },
    btnDisabled: { opacity: 0.7 },
    btnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, gap: 10
    },
    btnText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    btnTextDisabled: { color: '#666' },
});
