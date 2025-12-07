import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const TABS = [
    { name: 'Ana Sayfa', icon: 'home', type: 'Ionicons' },
    { name: 'Kiralama', icon: 'excavator', type: 'MaterialCommunityIcons' },
    { name: 'Market', icon: 'store', type: 'MaterialCommunityIcons' },
    { name: 'Profil', icon: 'person', type: 'Ionicons' },
];

export default function FloatingTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.container}>
            {/* Glass Background */}
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
                <LinearGradient
                    colors={['rgba(20,20,20,0.85)', 'rgba(5,5,5,0.95)']}
                    style={StyleSheet.absoluteFill}
                />
            </BlurView>

            <View style={styles.tabContainer}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;
                    const tabItem = TABS.find(t => t.name === route.name) || TABS[0];

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={onPress}
                            style={styles.tabBtn}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, isFocused && styles.focusedIconContainer]}>
                                {tabItem.type === 'Ionicons' ? (
                                    <Ionicons
                                        name={isFocused ? tabItem.icon : `${tabItem.icon}-outline`}
                                        size={24}
                                        color={isFocused ? '#000' : '#888'}
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        name={tabItem.icon}
                                        size={24}
                                        color={isFocused ? '#000' : '#888'}
                                    />
                                )}
                            </View>

                            {isFocused && (
                                <Text style={styles.label}>{label}</Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        elevation: 0, // Handled by blur
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 20, // Safe area padding
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(15, 15, 15, 0.95)', // Solid dark base with slight transparency
    },
    tabBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        width: 60,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    focusedIconContainer: {
        backgroundColor: COLORS.accent, // Gold Background
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
        color: COLORS.accent,
    }
});
