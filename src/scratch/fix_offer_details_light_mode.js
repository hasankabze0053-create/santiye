const fs = require('fs');

function applyThemeToOfferSummaryCard() {
    let code = fs.readFileSync('src/components/OfferSummaryCard.js', 'utf8');
    
    // Add import if not exists
    if (!code.includes('useTheme')) {
        code = code.replace(
            /import GlassCard from '\.\/GlassCard';/,
            "import GlassCard from './GlassCard';\nimport { useTheme } from '../context/ThemeContext';"
        );
    }
    
    // Add useTheme inside component
    if (!code.includes('const { theme, isDarkMode } = useTheme();')) {
        code = code.replace(
            /const isTadilat = offerType === 'anahtar_teslim_tadilat';/,
            "const isTadilat = offerType === 'anahtar_teslim_tadilat';\n    const { theme, isDarkMode } = useTheme();"
        );
    }
    
    // Convert hardcoded colors inside component
    code = code.replace(/color: '#FFF'/g, "color: isDarkMode ? '#FFF' : theme.text");
    code = code.replace(/color: '#D4AF37'/g, "color: isDarkMode ? '#D4AF37' : '#8C6200'");
    
    // Convert Stylesheet to function
    if (!code.includes('const getStyles = ')) {
        code = code.replace(/const styles = StyleSheet\.create\(\{/, 'const getStyles = (theme, isDarkMode) => StyleSheet.create({');
        code = code.replace(
            /return \(/,
            "const styles = getStyles(theme, isDarkMode);\n    return ("
        );
        
        // Update colors in styles
        code = code.replace(/color: '#D4AF37'/g, "color: isDarkMode ? '#D4AF37' : '#8C6200'");
        code = code.replace(/color: '#E0E0E0'/g, "color: isDarkMode ? '#E0E0E0' : theme.text");
        code = code.replace(/color: '#AAA'/g, "color: isDarkMode ? '#AAA' : theme.textSecondary");
        code = code.replace(/borderColor: '#D4AF37'/g, "borderColor: isDarkMode ? '#D4AF37' : 'rgba(140, 98, 0, 0.3)'");
    }

    fs.writeFileSync('src/components/OfferSummaryCard.js', code);
}

function applyThemeToBuildingSchema() {
    let code = fs.readFileSync('src/components/BuildingSchema.js', 'utf8');
    
    // Add import if not exists
    if (!code.includes('useTheme')) {
        code = code.replace(
            /import \{ Dimensions, StyleSheet, Text, TouchableOpacity, View \} from 'react-native';/,
            "import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';\nimport { useTheme } from '../context/ThemeContext';"
        );
    }
    
    // Add useTheme inside component
    if (!code.includes('const { theme, isDarkMode } = useTheme();')) {
        code = code.replace(
            /const floors = parseInt\(floorCount\) \|\| 0;/,
            "const { theme, isDarkMode } = useTheme();\n    const floors = parseInt(floorCount) || 0;"
        );
    }

    // Replace render text colors inside component
    code = code.replace(/color: '#FFF'/g, "color: isDarkMode ? '#FFF' : theme.text");
    code = code.replace(/color=\{textColor\}/g, "color={isDarkMode ? textColor : (textColor === '#FFF' || textColor === '#888' ? theme.text : textColor)}");
    code = code.replace(/color: textColor/g, "color: isDarkMode ? textColor : (textColor === '#FFF' || textColor === '#888' ? theme.text : textColor)");
    
    // Fix grant texts
    code = code.replace(/color: '#4CAF50'/g, "color: isDarkMode ? '#4CAF50' : '#16A34A'");
    code = code.replace(/color: '#FF5252'/g, "color: isDarkMode ? '#FF5252' : '#DC2626'");
    code = code.replace(/color: '#D4AF37'/g, "color: isDarkMode ? '#D4AF37' : '#8C6200'");

    // Convert Stylesheet to function
    if (!code.includes('const getStyles = ')) {
        code = code.replace(/const styles = StyleSheet\.create\(\{/, 'const getStyles = (theme, isDarkMode) => StyleSheet.create({');
        code = code.replace(
            /return \(/,
            "const styles = getStyles(theme, isDarkMode);\n    return ("
        );
        
        // Update colors in styles
        code = code.replace(/backgroundColor: 'rgba\(30,30,30,0\.6\)'/g, "backgroundColor: isDarkMode ? 'rgba(30,30,30,0.6)' : theme.surfaceSecondary");
        code = code.replace(/borderColor: 'rgba\(212, 175, 55, 0\.2\)'/g, "borderColor: isDarkMode ? 'rgba(212, 175, 55, 0.2)' : theme.borderLight");
        code = code.replace(/color: '#D4AF37'/g, "color: isDarkMode ? '#D4AF37' : '#8C6200'");
        code = code.replace(/color: '#888'/g, "color: isDarkMode ? '#888' : theme.textSecondary");
        code = code.replace(/color: '#4CAF50'/g, "color: isDarkMode ? '#4CAF50' : '#16A34A'");
        code = code.replace(/color: '#FFF'/g, "color: isDarkMode ? '#FFF' : theme.text"); // Grant Amount will fall into this
        code = code.replace(/color: '#AAA'/g, "color: isDarkMode ? '#AAA' : theme.textSecondary");
        code = code.replace(/color: '#CCC'/g, "color: isDarkMode ? '#CCC' : theme.textSecondary");
        code = code.replace(/color: '#555'/g, "color: isDarkMode ? '#555' : theme.textSecondary");
        code = code.replace(/backgroundColor: '#111'/g, "backgroundColor: isDarkMode ? '#111' : theme.surface");
        code = code.replace(/borderColor: '#333'/g, "borderColor: isDarkMode ? '#333' : theme.borderLight");
    }

    fs.writeFileSync('src/components/BuildingSchema.js', code);
}

function applyThemeToOfferDetailScreen() {
    let code = fs.readFileSync('src/screens/Cost/OfferDetailScreen.js', 'utf8');
    
    // Add import if not exists
    if (!code.includes('useTheme')) {
        code = code.replace(
            /import SharedRequestDetail from '\.\.\/\.\.\/components\/SharedRequestDetail';/,
            "import SharedRequestDetail from '../../components/SharedRequestDetail';\nimport { useTheme } from '../../context/ThemeContext';"
        );
    }
    
    // Add useTheme inside component
    if (!code.includes('const theme = useTheme();')) {
        code = code.replace(
            /const \{ request, offer, isAdminView = false \} = route\.params \|\| \{\};/,
            "const { request, offer, isAdminView = false } = route.params || {};\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;"
        );
    }

    // Convert Stylesheet to function
    if (!code.includes('const getStyles = ')) {
        code = code.replace(/const styles = StyleSheet\.create\(\{/, 'const getStyles = (theme, isDarkMode) => StyleSheet.create({');
        code = code.replace(
            /const \[showRequestModal, setShowRequestModal\] = useState\(false\);/,
            "const [showRequestModal, setShowRequestModal] = useState(false);\n    const styles = getStyles(theme, isDarkMode);"
        );
        
        // Update colors in styles
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
    }
    
    // Replace inside the render block
    code = code.replace(/color=\"#D4AF37\"/g, "color={isDarkMode ? '#D4AF37' : '#8C6200'}");
    code = code.replace(/color=\"#FFF\"/g, "color={isDarkMode ? '#FFF' : theme.text}");

    fs.writeFileSync('src/screens/Cost/OfferDetailScreen.js', code);
}

applyThemeToOfferSummaryCard();
applyThemeToBuildingSchema();
applyThemeToOfferDetailScreen();
console.log('Successfully polished Light Mode across Offer Details components!');
