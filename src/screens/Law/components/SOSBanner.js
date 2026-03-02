import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SOSBanner({ onPress }) {
    const pulse = useRef(new Animated.Value(1)).current;
    const dotOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(pulse, { toValue: 1.012, duration: 700, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
            Animated.timing(dotOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
            Animated.timing(dotOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])).start();
    }, []);

    return (
        <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.wrap}>
            <Animated.View style={[styles.container, { transform: [{ scale: pulse }] }]}>
                <LinearGradient
                    colors={['rgba(220,38,38,0.18)', 'rgba(234,88,12,0.08)']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
                {/* Left accent line */}
                <View style={styles.accentLine} />

                <View style={styles.inner}>
                    {/* Live dot */}
                    <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
                    <View style={styles.textBlock}>
                        <Text style={styles.title}>ACİL S.O.S.</Text>
                        <Text style={styles.subtitle}>İş Kazası · Baskın · Mühürleme → Canlı Destek</Text>
                    </View>
                    <View style={styles.arrow}>
                        <MaterialCommunityIcons name="chevron-right" size={18} color="rgba(239,68,68,0.8)" />
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: 20, marginBottom: 28 },
    container: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.25)',
        overflow: 'hidden',
        shadowColor: '#EF4444',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    accentLine: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 3,
        backgroundColor: '#EF4444',
        borderTopLeftRadius: 14,
        borderBottomLeftRadius: 14,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingLeft: 18,
        paddingRight: 14,
        gap: 10,
    },
    liveDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#EF4444',
        shadowColor: '#EF4444', shadowOpacity: 1, shadowRadius: 6,
    },
    textBlock: { flex: 1 },
    title: {
        color: '#EF4444',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 11,
        marginTop: 2,
        letterSpacing: 0.2,
    },
    arrow: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: 'rgba(239,68,68,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
});
