const fs = require('fs');

function fixOfferDetailScreen() {
    let code = fs.readFileSync('src/screens/Cost/OfferDetailScreen.js', 'utf8');

    // 1. Add import useTheme
    if (!code.includes('import { useTheme } from')) {
        code = code.replace(
            /import SharedRequestDetail from '\.\.\/\.\.\/components\/SharedRequestDetail';/,
            "import SharedRequestDetail from '../../components/SharedRequestDetail';\nimport { useTheme } from '../../context/ThemeContext';"
        );
    }

    // 2. Add useTheme inside component
    if (!code.includes('const { theme, isDarkMode } = useTheme();')) {
        code = code.replace(
            /export default function OfferDetailScreen\(\) \{/,
            "export default function OfferDetailScreen() {\n    const { theme, isDarkMode } = useTheme();"
        );
    }

    // 3. Convert styles to getStyles
    if (!code.includes('const getStyles = (theme, isDarkMode) => StyleSheet.create({')) {
        code = code.replace(
            /const styles = StyleSheet\.create\(\{/,
            "const getStyles = (theme, isDarkMode) => StyleSheet.create({"
        );
    }

    // 4. Add const styles = getStyles inside component IF not present
    if (!code.includes('const styles = getStyles(theme, isDarkMode);')) {
        code = code.replace(
            /const \[viewerMode, setViewerMode\] = useState\('contractor'\);/,
            "const [viewerMode, setViewerMode] = useState('contractor');\n    const styles = getStyles(theme, isDarkMode);"
        );
    }

    // 5. Replace colors inside getStyles
    // We only want to replace inside getStyles to avoid replacing valid color values elsewhere blindly.
    // However, regex over the whole file is easier. Let's do it carefully.
    code = code.replace(/backgroundColor: '#000'/g, "backgroundColor: isDarkMode ? '#000' : theme.background");
    code = code.replace(/color: '#D4AF37'/g, "color: isDarkMode ? '#D4AF37' : '#8C6200'");
    code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.12\)'/g, "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.12)' : theme.surfaceSecondary");
    code = code.replace(/color: '#FFF'/g, "color: isDarkMode ? '#FFF' : theme.text");
    code = code.replace(/color: '#888'/g, "color: isDarkMode ? '#888' : theme.textSecondary");
    code = code.replace(/color: '#666'/g, "color: isDarkMode ? '#666' : theme.textSecondary");
    code = code.replace(/color: '#DDD'/g, "color: isDarkMode ? '#DDD' : theme.textSecondary");
    code = code.replace(/color: '#BBB'/g, "color: isDarkMode ? '#BBB' : theme.textSecondary");
    code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.02\)'/g, "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : theme.surfaceSecondary");
    code = code.replace(/borderColor: '#222'/g, "borderColor: isDarkMode ? '#222' : theme.borderLight");
    code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.03\)'/g, "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : theme.surface");
    code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.05\)'/g, "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : theme.surfaceSecondary");
    code = code.replace(/borderColor: '#333'/g, "borderColor: isDarkMode ? '#333' : theme.borderLight");

    // 6. Fix JSX inline colors
    code = code.replace(/color="\#D4AF37"/g, "color={isDarkMode ? '#D4AF37' : '#8C6200'}");
    code = code.replace(/color="\#FFF"/g, "color={isDarkMode ? '#FFF' : theme.text}");

    fs.writeFileSync('src/screens/Cost/OfferDetailScreen.js', code);
}

fixOfferDetailScreen();
console.log('Fixed OfferDetailScreen');
