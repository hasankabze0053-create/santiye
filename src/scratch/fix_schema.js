const fs = require('fs');

function fixBuildingSchema() {
    let code = fs.readFileSync('src/components/BuildingSchema.js', 'utf8');

    // 1. Add import useTheme
    if (!code.includes('import { useTheme } from')) {
        code = code.replace(
            /import \{ Dimensions, StyleSheet, Text, TouchableOpacity, View \} from 'react-native';/,
            "import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';\nimport { useTheme } from '../context/ThemeContext';"
        );
    }

    // 2. Add useTheme inside component
    if (!code.includes('const { theme, isDarkMode } = useTheme();')) {
        code = code.replace(
            /export default function BuildingSchema\(.*?\) \{/s,
            (match) => match + "\n    const { theme, isDarkMode } = useTheme();\n    const styles = getStyles(theme, isDarkMode);"
        );
    }

    // 3. Convert styles to getStyles
    if (!code.includes('const getStyles = (theme, isDarkMode) => StyleSheet.create({')) {
        code = code.replace(
            /const styles = StyleSheet\.create\(\{/,
            "const getStyles = (theme, isDarkMode) => StyleSheet.create({"
        );
    }

    // 4. Specific style replacements (only inside getStyles using careful replacements to avoid UNIT_TYPES)
    code = code.replace(/backgroundColor: 'rgba\(30,30,30,0\.6\)'/g, "backgroundColor: isDarkMode ? 'rgba(30,30,30,0.6)' : theme.surfaceSecondary");
    code = code.replace(/borderColor: 'rgba\(212, 175, 55, 0\.2\)'/g, "borderColor: isDarkMode ? 'rgba(212, 175, 55, 0.2)' : theme.borderLight");
    
    // Only target colors in styles by assuming they follow `color: ` and are at the end of line or before comma
    code = code.replace(/color: '#D4AF37'/g, "color: isDarkMode ? '#D4AF37' : '#8C6200'");
    code = code.replace(/color: '#888'/g, "color: isDarkMode ? '#888' : theme.textSecondary");
    code = code.replace(/color: '#4CAF50'/g, "color: isDarkMode ? '#4CAF50' : '#16A34A'");
    code = code.replace(/color: '#FFF'/g, "color: isDarkMode ? '#FFF' : theme.text");
    code = code.replace(/color: '#AAA'/g, "color: isDarkMode ? '#AAA' : theme.textSecondary");
    code = code.replace(/color: '#CCC'/g, "color: isDarkMode ? '#CCC' : theme.textSecondary");
    code = code.replace(/color: '#555'/g, "color: isDarkMode ? '#555' : theme.textSecondary");
    code = code.replace(/backgroundColor: '#111'/g, "backgroundColor: isDarkMode ? '#111' : theme.surface");
    code = code.replace(/borderColor: '#333'/g, "borderColor: isDarkMode ? '#333' : theme.borderLight");

    // 5. Replace inline text colors inside component JSX
    code = code.replace(/color=\{textColor\}/g, "color={isDarkMode ? textColor : (textColor === '#FFF' || textColor === '#888' ? theme.text : textColor)}");
    code = code.replace(/color: textColor/g, "color: isDarkMode ? textColor : (textColor === '#FFF' || textColor === '#888' ? theme.text : textColor)");
    
    // Fix grant texts inline
    code = code.replace(/color: '\#4CAF50'/g, "color: isDarkMode ? '#4CAF50' : '#16A34A'");
    code = code.replace(/color: '\#FF5252'/g, "color: isDarkMode ? '#FF5252' : '#DC2626'");
    code = code.replace(/color: '\#D4AF37'/g, "color: isDarkMode ? '#D4AF37' : '#8C6200'");
    
    // Revert UNIT_TYPES which got messed up by the global replaces
    code = code.replace(/color: isDarkMode \? '#D4AF37' : '#8C6200', bg: '#252525'/g, "color: '#D4AF37', bg: '#252525'");
    code = code.replace(/color: isDarkMode \? '#FFF' : theme\.text, bg: '#444'/g, "color: '#FFF', bg: '#444'");
    code = code.replace(/color: isDarkMode \? '#666' : theme\.textSecondary, bg: '#2A2A2A'/g, "color: '#666', bg: '#2A2A2A'");

    fs.writeFileSync('src/components/BuildingSchema.js', code);
}

fixBuildingSchema();
console.log('Fixed BuildingSchema carefully');
