import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const TABS = [
    { name: 'Ana Sayfa', icon: 'home', type: 'Ionicons' },
    { name: 'Kiralama', icon: 'information-circle', type: 'Ionicons' },
    { name: 'Market', icon: 'chatbox-ellipses', type: 'Ionicons' },
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
                                        color={isFocused ? '#D4AF37' : '#666'} // Metallic Gold vs Grey
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        name={tabItem.icon}
                                        size={24}
                                        color={isFocused ? '#D4AF37' : '#666'}
                                    />
                                )}
                                {/* Active Dot Indicator */}
                                {isFocused && (
                                    <View style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        width: 4,
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: '#D4AF37',
                                        shadowColor: "#D4AF37",
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 1,
                                        shadowRadius: 4,
                                    }} />
                                )}
                            </View>

                            {/* Label removed for cleaner look, or added back if requested. 
                                Keeping it hidden for 'Showroom' aesthetic, relying on Icon + Dot */}
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
        bottom: 25, // Floating effect
        left: 20,
        right: 20,
        borderRadius: 35,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)', // Glass border
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    // The BlurView wraps this, so we don't need background color here mostly
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12, // Compact vertical padding
        backgroundColor: 'rgba(10, 10, 10, 0.85)', // Dark Glass tint
    },
    tabBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    focusedIconContainer: {
        // Removed solid background, added subtle glow via shadow if needed, or kept clean
        // backgroundColor: 'rgba(212, 175, 55, 0.15)', // Optional: very subtle gold tint
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
        color: '#D4AF37', // Metallic Gold
    }
});
