const fs = require('fs');

function refactorLawScreen() {
    let code = fs.readFileSync('src/screens/Law/LawScreen.js', 'utf8');

    // 1. Add import
    if (!code.includes('import { useTheme } from')) {
        code = code.replace(
            /import \{ PermissionService \} from '\.\.\/\.\.\/services\/PermissionService';/,
            "import { PermissionService } from '../../services/PermissionService';\nimport { useTheme } from '../../context/ThemeContext';"
        );
    }

    // 2. Add useTheme to component
    if (!code.includes('const theme = useTheme();')) {
        code = code.replace(
            /export default function LawScreen\(\) \{/,
            "export default function LawScreen() {\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;"
        );
    }

    // 3. Define styles inside component
    if (!code.includes('const s = getStyles(theme, isDarkMode);')) {
        code = code.replace(
            /const inputWrapRef = useRef\(null\);/,
            "const inputWrapRef = useRef(null);\n    const s = getStyles(theme, isDarkMode);"
        );
    }

    // 4. Change StyleSheet.create to getStyles factory
    if (!code.includes('const getStyles = (theme, isDarkMode) => StyleSheet.create({')) {
        code = code.replace(
            /const s = StyleSheet\.create\(\{/,
            "const getStyles = (theme, isDarkMode) => StyleSheet.create({"
        );
    }

    // 5. Replace inline styles in the JSX
    code = code.replace(/color="#fff"/g, "color={isDarkMode ? '#fff' : theme.text}");
    code = code.replace(/color="#ffffff"/g, "color={isDarkMode ? '#ffffff' : theme.text}");
    code = code.replace(/color="\#555"/g, "color={isDarkMode ? '#555' : theme.textSecondary}");
    code = code.replace(/color="\#222"/g, "color={isDarkMode ? '#222' : theme.textSecondary}");
    code = code.replace(/backgroundColor="#070707"/g, "backgroundColor={isDarkMode ? '#070707' : theme.background}");
    code = code.replace(/placeholderTextColor="rgba\(255,255,255,0\.25\)"/g, "placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)'}");
    code = code.replace(/colors=\{\['rgba\(255,255,255,0\.05\)', 'rgba\(255,255,255,0\.02\)'\]\}/g, "colors={isDarkMode ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.01)']}");
    
    // 6. Replace styles in the StyleSheet
    // Backgrounds
    code = code.replace(/backgroundColor: '#070707'/g, "backgroundColor: isDarkMode ? '#070707' : theme.background");
    code = code.replace(/backgroundColor: '#141414'/g, "backgroundColor: isDarkMode ? '#141414' : theme.surface");
    code = code.replace(/backgroundColor: '#111'/g, "backgroundColor: isDarkMode ? '#111' : theme.background");
    code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.04\)'/g, "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : theme.surfaceSecondary");
    code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.06\)'/g, "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : theme.surfaceSecondary");

    // Borders
    code = code.replace(/borderColor: 'rgba\(255,255,255,0\.08\)'/g, "borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : theme.borderLight");
    code = code.replace(/borderColor: 'rgba\(255,255,255,0\.10\)'/g, "borderColor: isDarkMode ? 'rgba(255,255,255,0.10)' : theme.borderLight");
    code = code.replace(/borderColor: 'rgba\(255,255,255,0\.06\)'/g, "borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : theme.borderLight");
    code = code.replace(/borderTopColor: '#222'/g, "borderTopColor: isDarkMode ? '#222' : theme.borderLight");

    // Text Colors
    code = code.replace(/color: '#ffffff'/g, "color: isDarkMode ? '#ffffff' : theme.text");
    code = code.replace(/color: '#fff'/g, "color: isDarkMode ? '#fff' : theme.text");
    code = code.replace(/color: '#FFFFFF'/g, "color: isDarkMode ? '#FFFFFF' : theme.text");
    code = code.replace(/color: 'rgba\(255,255,255,0\.5\)'/g, "color: isDarkMode ? 'rgba(255,255,255,0.5)' : theme.textSecondary");
    code = code.replace(/color: 'rgba\(255,255,255,0\.4\)'/g, "color: isDarkMode ? 'rgba(255,255,255,0.4)' : theme.textSecondary");
    code = code.replace(/color: 'rgba\(255,255,255,0\.2\)'/g, "color: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.textSecondary");
    code = code.replace(/color: 'rgba\(255,255,255,0\.25\)'/g, "color: isDarkMode ? 'rgba(255,255,255,0.25)' : theme.textSecondary");

    fs.writeFileSync('src/screens/Law/LawScreen.js', code);
}

refactorLawScreen();
console.log('Successfully refactored LawScreen for Light Mode!');
