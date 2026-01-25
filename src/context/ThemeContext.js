import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { COLORS_DARK, COLORS_LIGHT, LAYOUT, SHADOWS, SIZES } from '../constants/theme';

// Create Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark for safety
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme on startup
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('appTheme');
            if (savedTheme !== null) {
                // 'dark' or 'light'
                setIsDarkMode(savedTheme === 'dark');
            } else {
                // If no preference, default to Dark (Brand Standard)
                // Or you could follow system: Appearance.getColorScheme() === 'dark'
                setIsDarkMode(true);
            }
        } catch (error) {
            console.log('Theme loading error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        try {
            await AsyncStorage.setItem('appTheme', newMode ? 'dark' : 'light');
        } catch (error) {
            console.log('Theme saving error:', error);
        }
    };

    // The Active Theme Object (To be consumed by screens)
    const theme = {
        // Dynamic Colors
        ... (isDarkMode ? COLORS_DARK : COLORS_LIGHT),

        // Static Values
        SIZES,
        SHADOWS,
        LAYOUT,

        // State
        isDarkMode,
        toggleTheme
    };

    if (isLoading) {
        return null; // Or a splash screen
    }

    return (
        <ThemeContext.Provider value={theme}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'} // Or match primary
            />
            {children}
        </ThemeContext.Provider>
    );
};

// Custom Hook for easier usage
export const useTheme = () => useContext(ThemeContext);
