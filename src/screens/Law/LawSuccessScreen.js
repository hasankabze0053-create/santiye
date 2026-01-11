import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LawSuccessScreen({ navigation }) {
    const scaleValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true
        }).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0f1a14', '#000000']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.content}>

                {/* Success Animation */}
                <View style={[styles.iconContainer]}>
                    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                        <MaterialCommunityIcons name="scale-balance" size={120} color="#D4AF37" />
                    </Animated.View>
                </View>

                {/* Messages */}
                <Text style={styles.title}>Talebiniz Alındı</Text>

                <View style={styles.infoCard}>
                    <View style={styles.timeInfo}>
                        <MaterialCommunityIcons name="check-circle-outline" size={24} color="#D4AF37" />
                        <Text style={styles.infoTitle}>İnceleme Başlatıldı</Text>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.description}>
                        Talebiniz uzman avukatımıza iletilmiştir. Konu incelenip en kısa sürede size dönüş yapılacaktır.
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('MainTabs')}>
                        <Text style={styles.primaryBtnText}>ANA SAYFAYA DÖN</Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

    iconContainer: { marginBottom: 32, shadowColor: "#D4AF37", shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },

    title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },

    infoCard: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 16, padding: 24, marginBottom: 40, alignItems: 'center' },

    timeInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    infoTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },

    divider: { width: '100%', height: 1, backgroundColor: '#333', marginBottom: 16 },

    description: { color: '#ccc', fontSize: 14, textAlign: 'center', lineHeight: 22 },

    actionsContainer: { width: '100%' },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D4AF37', paddingVertical: 16, borderRadius: 30 },
    primaryBtnText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
});
