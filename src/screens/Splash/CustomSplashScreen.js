import { Asset } from 'expo-asset';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Import all assets to preload
const ASSETS_TO_LOAD = [
    // Preload Home Category Images to fix slow loading
    require('../../assets/categories/cat_kiralama.png'),
    require('../../assets/categories/cat_market.png'),
    require('../../assets/categories/cat_tadilat.png'),
    require('../../assets/categories/cat_proje.png'),
    require('../../assets/categories/cat_hukuk.png'),
    require('../../assets/categories/cat_nakliye.png'),
    require('../../assets/categories/cat_sigorta.png'),
    require('../../assets/categories/cat_maliyet.png'),
    require('../../assets/categories/cat_usta.png'),

    // Preload Highlight Card (Banner) Premium Backgrounds to fix late loading on Home Screen
    require('../../assets/highlight/kentsel_donusum_premium.png'),
    require('../../assets/highlight/tadilat_premium.jpg'),
    require('../../assets/highlight/market_premium.jpg'),
    require('../../assets/highlight/hukuk_premium.jpg'),
];

export default function CustomSplashScreen({ navigation }) {
    const { loading } = useAuth(); // Import loading state from AuthContext
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    useEffect(() => {
        const loadAssets = async () => {
            try {
                // 1. Start Preloading Images
                // Asset.fromModule ensures the image is downloaded/cached
                const cacheImages = ASSETS_TO_LOAD.map(image => {
                    return Asset.fromModule(image).downloadAsync();
                });

                // 2. Start Preloading Dynamic Admin Images (OTA Support)
                const dynamicImagePromises = [];
                try {
                    const cachedConfigStr = await AsyncStorage.getItem('app_highlight_configs_cache');
                    if (cachedConfigStr) {
                        const configs = JSON.parse(cachedConfigStr);
                        if (configs && configs.length > 0) {
                            const primaryConfig = configs[0]?.metadata;
                            if (primaryConfig?.image_dark) {
                                dynamicImagePromises.push(Image.prefetch(primaryConfig.image_dark));
                            }
                            if (primaryConfig?.image_light) {
                                dynamicImagePromises.push(Image.prefetch(primaryConfig.image_light));
                            }
                        }
                    }
                } catch (err) {
                    console.log('Dynamic prefetch error:', err);
                }

                // 3. Set a minimum branding time (1.2s) and maximum timeout (3s) to prevent infinite hanging
                const minTimePromise = new Promise(resolve => setTimeout(resolve, 1200));
                
                const loadAllAssetsPromise = Promise.all([
                    ...cacheImages,
                    ...dynamicImagePromises
                ]);

                // We race the asset loading against a 3-second strict timeout.
                // If network is terrible, we drop the user into the app after 3s max.
                const maxTimeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));

                await Promise.all([
                    minTimePromise, // Guarantee at least 1.2s for logo visibility
                    Promise.race([loadAllAssetsPromise, maxTimeoutPromise]) // Cap loading at 3s
                ]);

            } catch (e) {
                console.warn("Asset preload error:", e);
            } finally {
                // Mark assets as fully loaded (or timed out)
                setAssetsLoaded(true);
            }
        };

        loadAssets();
    }, []);

    // 3. EFFECT: Navigate only when BOTH assets are loaded AND AuthContext has finished fetching profile data
    useEffect(() => {
        if (assetsLoaded && !loading) {
            navigation.replace('MainTabs');
        }
    }, [assetsLoaded, loading, navigation]);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            {/* Image Wrapper with Blend Masks */}
            <View style={styles.imageWrapper}>
                <Image
                    source={require('../../assets/splash_ceptesef_premium.jpg')}
                    style={styles.image}
                    resizeMode="contain"
                />
                
                {/* Top Blend */}
                <LinearGradient
                    colors={['#EEDDC9', 'rgba(238, 221, 201, 0)']}
                    style={{ position: 'absolute', top: -2, left: 0, right: 0, height: 60 }}
                />
                {/* Bottom Blend */}
                <LinearGradient
                    colors={['rgba(238, 221, 201, 0)', '#EEDDC9']}
                    style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 60 }}
                />
                {/* Left Blend */}
                <LinearGradient
                    colors={['#EEDDC9', 'rgba(238, 221, 201, 0)']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ position: 'absolute', top: 0, bottom: 0, left: -2, width: 60 }}
                />
                {/* Right Blend */}
                <LinearGradient
                    colors={['rgba(238, 221, 201, 0)', '#EEDDC9']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ position: 'absolute', top: 0, bottom: 0, right: -2, width: 60 }}
                />
            </View>



        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEDDC9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        width: width,
        height: width, // Square box for the image
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },

    loadingText: {
        position: 'absolute',
        bottom: 80,
        color: 'rgba(255,165,0, 0.6)', // Orange tint
        fontSize: 12,
        letterSpacing: 3,
        fontWeight: 'bold'
    }
});
