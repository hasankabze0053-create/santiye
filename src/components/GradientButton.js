import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function GradientButton({ title, onPress, style, icon }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.container, style]}>
            <LinearGradient
                colors={[COLORS.accentGradientStart, COLORS.accentGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {icon}
                <Text style={[styles.text, icon ? { marginLeft: 8 } : null]}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        ...SHADOWS.glow,
    },
    gradient: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
