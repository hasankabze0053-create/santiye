import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- THEME CONSTANTS ---
const THEME = {
    bg: '#09090b',          // Matte Black
    cardBg: '#18181b',      // Dark Grey
    accent: '#FFD700',      // Golden Yellow
    text: '#FFFFFF',
    textDim: '#a1a1aa',
    border: '#27272a',
};

const ProviderScaffold = ({ title, children, showBack = true }) => {
    const navigation = useNavigation();
    const [isProviderMode, setIsProviderMode] = useState(true);

    const handleToggle = (value) => {
        setIsProviderMode(value);
        if (!value) {
            // User switched to "Customer View", so go back
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

            {/* Background */}
            <View style={styles.bg} />

            <SafeAreaView style={{ flex: 1 }}>

                {/* --- APP BAR --- */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {showBack && (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={24} color={THEME.text} />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle}>{title}</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <Text style={[styles.modeText, !isProviderMode && styles.activeModeText]}>Müşteri</Text>
                        <Switch
                            trackColor={{ false: '#3f3f46', true: 'rgba(255, 215, 0, 0.3)' }}
                            thumbColor={isProviderMode ? THEME.accent : '#f4f3f4'}
                            ios_backgroundColor="#3f3f46"
                            onValueChange={handleToggle}
                            value={isProviderMode}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                        <Text style={[styles.modeText, isProviderMode && styles.activeModeText]}>Kurumsal</Text>
                    </View>
                </View>

                {/* --- CONTENT --- */}
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>

            </SafeAreaView>
        </View>
    );
};

export const SectionTitle = ({ title, actionText, onAction }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitleText}>{title}</Text>
        {actionText && (
            <TouchableOpacity onPress={onAction}>
                <Text style={styles.sectionActionText}>{actionText}</Text>
            </TouchableOpacity>
        )}
    </View>
);

export const GlassCard = ({ children, style, onPress }) => {
    const Container = onPress ? TouchableOpacity : View;
    return (
        <Container
            style={[styles.glassCard, style]}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <LinearGradient
                colors={[THEME.cardBg, 'rgba(24, 24, 27, 0.8)']}
                style={StyleSheet.absoluteFill}
            />
            {/* Subtle Border Gradient Simulation */}
            <View style={styles.cardBorder} />

            <View style={styles.cardInner}>
                {children}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    bg: { ...StyleSheet.absoluteFillObject, backgroundColor: THEME.bg },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
        backgroundColor: THEME.bg,
        zIndex: 10,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerTitle: { color: THEME.text, fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
    backBtn: { padding: 4 },

    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    modeText: { color: '#52525b', fontSize: 11, fontWeight: '600' },
    activeModeText: { color: THEME.accent },

    // Content
    scrollContent: { padding: 16, paddingBottom: 100 },

    // Section
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 12 },
    sectionTitleText: { color: '#71717a', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    sectionActionText: { color: THEME.accent, fontSize: 12, fontWeight: '600' },

    // Glass Card
    glassCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    cardBorder: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderRadius: 16
    },
    cardInner: { padding: 16 },

});

export { THEME };
export default ProviderScaffold;
