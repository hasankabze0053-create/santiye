import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { MarketCartProvider } from './src/context/MarketCartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Uygulama genelinde sistemin font büyütme/küçültme ayarlarını ezerek 
// UI tasarımının bozulmasını önler. Premium tasarımın sabit kalmasını sağlar.
// Erişilebilirliği tamamen kapatmak yerine %15 büyüme sınırı (maxFontSizeMultiplier) koyuyoruz.
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.maxFontSizeMultiplier = 1.15;
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.15;

const oldTextRender = Text.render;
if (oldTextRender) {
    Text.render = function(...args) {
        const origin = oldTextRender.call(this, ...args);
        
        // Eğer geliştirici özel olarak o component'e allowFontScaling={false} verdiyse ezme
        const shouldScale = origin.props.allowFontScaling !== false;
        
        return React.cloneElement(origin, {
            allowFontScaling: shouldScale,
            maxFontSizeMultiplier: 1.15,
        });
    };
}

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <MarketCartProvider>
                    <SafeAreaProvider>
                        <NavigationContainer>
                            <AppNavigator />
                        </NavigationContainer>
                    </SafeAreaProvider>
                </MarketCartProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
