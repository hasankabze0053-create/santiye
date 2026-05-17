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
                <Text allowFontScaling={false} style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>{title}</Text>
                <Text allowFontScaling={false} style={styles.optionDesc}>{description}</Text>
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
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        setLoading(true);
        try {
            // Because there's only one option now, we know they picked corporate
            navigation.replace('CompanyRegistration');
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Just update their profile to individual explicitly and go home
                await AuthService.updateProfile(user.id, { user_type: 'individual' });
                navigation.replace('MainTabs');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <SafeAreaView style={{ flex: 1 }}>

                <View style={styles.header}>
                    <Text allowFontScaling={false} style={styles.title}>Hoş Geldiniz! 👋</Text>
                    <Text allowFontScaling={false} style={styles.subtitle}>Size en uygun deneyimi sunabilmemiz için lütfen kullanım amacınızı seçin.</Text>
                </View>

                <View style={styles.content}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[styles.optionCard, styles.optionCardSelected]}
                    >
                        <LinearGradient
                            colors={['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)']}
                            style={styles.cardGradient}
                        >
                            <View style={[styles.iconContainer, styles.iconContainerSelected]}>
                                <MaterialCommunityIcons name="briefcase" size={32} color="#FFD700" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text allowFontScaling={false} style={[styles.optionTitle, styles.optionTitleSelected]}>Kurumsal Üyelik Başvurusu</Text>
                                <Text allowFontScaling={false} style={styles.optionDesc}>ŞantiyePro'da ürün satmak, iş makinesi kiralamak veya profesyonel hizmet vermek istiyorsanız kurumsal hesaba geçin.</Text>
                            </View>
                            <View style={styles.radioContainer}>
                                <View style={[styles.radioOuter, styles.radioOuterSelected]}>
                                    <View style={styles.radioInner} />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.btn}
                        disabled={loading}
                        onPress={handleContinue}
                    >
                        <LinearGradient
                            colors={['#D4AF37', '#AA8C2C']}
                            style={styles.btnGradient}
                        >
                            <Text allowFontScaling={false} style={styles.btnText}>
                                {loading ? 'İşleniyor...' : 'Başvuruyu Başlat'}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} disabled={loading}>
                        <Text allowFontScaling={false} style={styles.skipBtnText}>Atla, Bireysel Kullanıcı Olarak Devam Etmek İstiyorum</Text>
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

    skipBtn: {
        marginTop: 20,
        alignItems: 'center',
        paddingVertical: 10,
    },
    skipBtnText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    }
});
