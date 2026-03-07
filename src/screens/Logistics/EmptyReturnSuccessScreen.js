import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, Linking, Share, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function EmptyReturnSuccessScreen({ navigation }) {
    const scaleValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true
        }).start();
    }, []);

    const handleCallDriver = () => {
        const phoneNumber = 'tel:+905321234567'; // Mock number
        Linking.canOpenURL(phoneNumber)
            .then((supported) => {
                if (!supported) {
                    Alert.alert('Hata', 'Arama özelliği desteklenmiyor.');
                } else {
                    return Linking.openURL(phoneNumber);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const handleShareReceipt = async () => {
        try {
            await Share.share({
                message: '🚚 *Taşıma Özeti* \n\n📍 *Rota:* İstanbul > Ankara\n💰 *Tutar:* 6.500 TL\n👤 *Sürücü:* Ahmet Y. (34 VR 1**)\n\nCepteŞef ile güvenle taşındı.',
            });
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0f1a14', '#000000']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>

                {/* Header (Share Button) */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleShareReceipt} style={styles.shareBtn}>
                        <MaterialCommunityIcons name="share-variant" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* Success Animation */}
                    <View style={[styles.iconContainer]}>
                        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                            <MaterialCommunityIcons name="check-circle" size={120} color="#D4AF37" />
                        </Animated.View>
                    </View>

                    {/* Messages */}
                    <Text allowFontScaling={false} style={styles.title}>Tebrikler!{'\n'}Araç Bağlandı.</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.driverInfo}>
                            <View style={styles.avatar}><Text allowFontScaling={false} style={styles.avatarText}>AY</Text></View>
                            <View style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={styles.infoText}>Sürücü <Text allowFontScaling={false} style={{ fontWeight: 'bold' }}>Ahmet Y.</Text> bilgilendirildi.</Text>
                                <Text allowFontScaling={false} style={styles.subText}>Plaka: TR-34 VR 1**</Text>
                            </View>
                            {/* Call Button */}
                            <TouchableOpacity onPress={handleCallDriver} style={styles.callBtn}>
                                <MaterialCommunityIcons name="phone" size={20} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.timeInfo}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#D4AF37" />
                            <Text allowFontScaling={false} style={styles.timeText}>Tahmini Varış: <Text allowFontScaling={false} style={{ color: '#fff' }}>Yarın 08:45</Text></Text>
                        </View>
                        <View style={{ height: 16 }} />
                        <View style={styles.timeInfo}>
                            <MaterialCommunityIcons name="information-outline" size={16} color="#888" />
                            <Text allowFontScaling={false} style={{ color: '#888', fontSize: 12, marginLeft: 6 }}>Lojistik firması bilgilendirilmiştir.</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => { }}>
                            <MaterialCommunityIcons name="file-document-outline" size={20} color="#D4AF37" />
                            <Text allowFontScaling={false} style={styles.secondaryBtnText}>İRSALİYE OLUŞTUR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('MainTabs')}>
                            <Text allowFontScaling={false} style={styles.primaryBtnText}>ANA SAYFAYA DÖN</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    safeArea: { flex: 1 },
    header: { width: '100%', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 10, zIndex: 10 },
    shareBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },

    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: -40 },

    iconContainer: { marginBottom: 32, shadowColor: "#D4AF37", shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },

    title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },

    infoCard: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 40 },
    driverInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontWeight: 'bold' },
    infoText: { color: '#ccc', fontSize: 14 },
    subText: { color: '#666', fontSize: 12 },

    callBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#4CAF50', // Green for Call
        alignItems: 'center', justifyContent: 'center', marginLeft: 10,
        shadowColor: "#4CAF50", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5
    },

    divider: { height: 1, backgroundColor: '#333', marginBottom: 16 },
    timeInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    timeText: { color: '#D4AF37', marginLeft: 8, fontSize: 14 },

    actionsContainer: { width: '100%' },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D4AF37', paddingVertical: 16, borderRadius: 30 },
    primaryBtnText: { color: '#000', fontSize: 14, fontWeight: 'bold' },

    secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderWidth: 1, borderColor: '#D4AF37', paddingVertical: 16, borderRadius: 30, marginBottom: 16 },
    secondaryBtnText: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
});
