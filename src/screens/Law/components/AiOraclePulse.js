import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const GOLD = '#D4AF37';
const SIZE = 200;

// A single orbiting particle dot
function Particle({ radius, speed, delay, size = 3 }) {
    const angle = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(angle, { toValue: 1, duration: speed, delay, useNativeDriver: true })
        ).start();
    }, []);

    const rotate = angle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <Animated.View
            style={[
                styles.particleOrbit,
                {
                    width: radius * 2,
                    height: radius * 2,
                    transform: [{ rotate }],
                },
            ]}
        >
            {/* Dot at the "3 o'clock" position of the orbit */}
            <View
                style={[
                    styles.dot,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: GOLD,
                        position: 'absolute',
                        right: 0,
                        top: radius - size / 2,
                        shadowColor: GOLD,
                        shadowOpacity: 0.9,
                        shadowRadius: 4,
                    },
                ]}
            />
        </Animated.View>
    );
}

// A pulsing ring
function Ring({ size, delay, opacity = 0.12 }) {
    const scale = useRef(new Animated.Value(0.85)).current;
    const op    = useRef(new Animated.Value(opacity)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(op, { toValue: opacity * 2, duration: 1000, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(scale, { toValue: 0.85, duration: 2000, useNativeDriver: true }),
                Animated.timing(op, { toValue: opacity, duration: 1000, useNativeDriver: true }),
            ]),
        ])).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.ring,
                {
                    width: size, height: size,
                    borderRadius: size / 2,
                    borderColor: GOLD,
                    opacity: op,
                    transform: [{ scale }],
                },
            ]}
        />
    );
}

// Core glow
function CoreGlow() {
    const scale = useRef(new Animated.Value(1)).current;
    const glow  = useRef(new Animated.Value(0.6)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.parallel([
                Animated.timing(scale, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
                Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(scale, { toValue: 1, duration: 1800, useNativeDriver: true }),
                Animated.timing(glow, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
            ]),
        ])).start();
    }, []);

    return (
        <Animated.View style={[styles.core, { transform: [{ scale }], opacity: glow }]}>
            {/* Inner solid circle */}
            <View style={styles.coreInner} />
        </Animated.View>
    );
}

export default function AiOraclePulse() {
    return (
        <View style={styles.container}>
            {/* Rings from outermost to innermost */}
            <Ring size={SIZE}      delay={0}    opacity={0.07} />
            <Ring size={SIZE * 0.75} delay={400}  opacity={0.12} />
            <Ring size={SIZE * 0.52}  delay={800}  opacity={0.18} />

            {/* Orbiting particles */}
            <Particle radius={SIZE * 0.50} speed={6000}  delay={0}    size={3.5} />
            <Particle radius={SIZE * 0.38}  speed={4500}  delay={1500} size={2.5} />
            <Particle radius={SIZE * 0.26}  speed={3200}  delay={800}  size={2} />
            <Particle radius={SIZE * 0.50} speed={8000}  delay={3000} size={2} />

            {/* Core */}
            <CoreGlow />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: SIZE,
        height: SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    ring: {
        position: 'absolute',
        borderWidth: 1,
    },
    particleOrbit: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {},
    core: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(212,175,55,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#D4AF37',
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    coreInner: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#D4AF37',
        shadowColor: '#D4AF37',
        shadowOpacity: 1,
        shadowRadius: 12,
    },
});
