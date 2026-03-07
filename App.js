import { NavigationContainer } from '@react-navigation/native';
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { MarketCartProvider } from './src/context/MarketCartContext';
import AppNavigator from './src/navigation/AppNavigator';

// Uygulama genelinde sistemin font büyütme/küçültme ayarlarını ezerek 
// UI tasarımının bozulmasını önler. Premium tasarımın sabit kalmasını sağlar.
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;

if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;

export default function App() {
    return (
        <AuthProvider>
            <MarketCartProvider>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                </SafeAreaProvider>
            </MarketCartProvider>
        </AuthProvider>
    );
}
