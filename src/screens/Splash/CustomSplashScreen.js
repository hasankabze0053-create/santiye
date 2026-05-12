import { Asset } from 'expo-asset';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
