import { Asset } from 'expo-asset';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

// Import all assets to preload
const ASSETS_TO_LOAD = [
    require('../../assets/splash_8k_final.png'), // The splash logo itself
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
];

export default function CustomSplashScreen({ navigation }) {
    // const navigation = useNavigation(); // Refactored to use props
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const loadAssets = async () => {
            try {
                // 1. Start Preloading Images
                // Asset.fromModule ensures the image is downloaded/cached
                const cacheImages = ASSETS_TO_LOAD.map(image => {
                    return Asset.fromModule(image).downloadAsync();
                });

                // 2. Wait for images AND minimum 2.5 seconds delay (so user sees the logo)
                await Promise.all([
                    ...cacheImages,
                    new Promise(resolve => setTimeout(resolve, 2500))
                ]);

            } catch (e) {
                console.warn("Asset preload error:", e);
            } finally {
                // Navigate after everything is ready
                navigation.replace('MainTabs');
            }
        };

        loadAssets();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            {/* Show Logo */}
            <Image
                source={require('../../assets/splash_8k_final.png')}
                style={styles.image}
                resizeMode="contain"
            />



        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: height,
        transform: [{ scale: 1.5 }],
        // transform removed to show full image, badge covers the logo
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
