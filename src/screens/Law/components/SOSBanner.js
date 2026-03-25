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
            Animated.timing(dotOpacity, { toValue: 0.15, duration: 700, useNativeDriver: true }),
            Animated.timing(dotOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])).start();
    }, []);

    return (
        <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.wrap}>
            <Animated.View style={[styles.container, { transform: [{ scale: pulse }] }]}>
                <LinearGradient
                    colors={['rgba(220,38,38,0.14)', 'rgba(234,88,12,0.04)']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.accentLine} />
                <View style={styles.inner}>
                    <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
                    <Text allowFontScaling={false} style={styles.title}>7/24  ACİL DESTEK</Text>
                    <View style={styles.arrow}>
                        <MaterialCommunityIcons name="chevron-right" size={16} color="rgba(239,68,68,0.7)" />
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: 20, marginBottom: 28 },
    container: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.2)',
        overflow: 'hidden',
        shadowColor: '#EF4444',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    accentLine: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 3,
        backgroundColor: '#EF4444',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        paddingLeft: 18,
        paddingRight: 14,
        gap: 10,
    },
    liveDot: {
        width: 7, height: 7, borderRadius: 3.5,
        backgroundColor: '#EF4444',
        shadowColor: '#EF4444', shadowOpacity: 1, shadowRadius: 5,
    },
    title: {
        flex: 1,
        color: '#EF4444',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2.5,
    },
    arrow: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: 'rgba(239,68,68,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
});

