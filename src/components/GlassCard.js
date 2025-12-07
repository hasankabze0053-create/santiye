import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function GlassCard({ children, style, intensity = 20 }) {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint="dark" style={styles.blur}>
                <LinearGradient
                    colors={[COLORS.glassBackground, 'rgba(15, 23, 42, 0.6)']}
                    style={styles.gradient}
                >
                    {children}
                </LinearGradient>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    blur: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        padding: 16,
    }
});
