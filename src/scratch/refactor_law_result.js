const fs = require('fs');

function refactorLawAnalysisResultScreen() {
    let code = fs.readFileSync('src/screens/Law/LawAnalysisResultScreen.js', 'utf8');

    // 1. Add useTheme import
    if (!code.includes("import { useTheme } from")) {
        code = code.replace(
            /import \{ SafeAreaView \} from 'react-native-safe-area-context';/,
            "import { SafeAreaView } from 'react-native-safe-area-context';\nimport { useTheme } from '../../context/ThemeContext';"
        );
    }

    // 2. Inject into LawAnalysisResultScreen
    if (!code.includes('const s = getStyles(theme, isDarkMode);')) {
        code = code.replace(
            /export default function LawAnalysisResultScreen\(\) \{/,
            "export default function LawAnalysisResultScreen() {\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;\n    const s = getStyles(theme, isDarkMode);"
        );
    }

    // 3. Inject into ScannerOverlay
    if (!code.includes('const theme = useTheme();', code.indexOf('function ScannerOverlay'))) {
        code = code.replace(
            /function ScannerOverlay\(\{ visible, onComplete, hasFile, fileName \}\) \{/,
            "function ScannerOverlay({ visible, onComplete, hasFile, fileName }) {\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;"
        );
        // Fix background of overlay
        code = code.replace(
            /backgroundColor: 'rgba\(0,0,0,0\.82\)'/g,
            "backgroundColor: isDarkMode ? 'rgba(0,0,0,0.82)' : 'rgba(255,255,255,0.92)'"
        );
    }

    // 4. Inject into RiskGauge
    if (!code.includes('const theme = useTheme();', code.indexOf('function RiskGauge'))) {
        code = code.replace(
            /function RiskGauge\(\{ score \}\) \{/,
            "function RiskGauge({ score }) {\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;"
        );
        // Fix border color of gauge circle
        code = code.replace(
            /borderColor: '#1e1e1e'/g,
            "borderColor: isDarkMode ? '#1e1e1e' : '#e5e7eb'"
        );
        code = code.replace(
            /borderRightColor: score >= 3 \? riskColor : '#1e1e1e'/g,
            "borderRightColor: score >= 3 ? riskColor : (isDarkMode ? '#1e1e1e' : '#e5e7eb')"
        );
        code = code.replace(
            /borderBottomColor: score >= 6 \? riskColor : '#1e1e1e'/g,
            "borderBottomColor: score >= 6 ? riskColor : (isDarkMode ? '#1e1e1e' : '#e5e7eb')"
        );
        code = code.replace(
            /borderLeftColor: score >= 8 \? riskColor : '#1e1e1e'/g,
            "borderLeftColor: score >= 8 ? riskColor : (isDarkMode ? '#1e1e1e' : '#e5e7eb')"
        );
        code = code.replace(
            /color: '#555', fontSize: 9/g,
            "color: isDarkMode ? '#555' : theme.textSecondary, fontSize: 9"
        );
        code = code.replace(
            /color: '#666', fontSize: 9/g,
            "color: isDarkMode ? '#666' : theme.textSecondary, fontSize: 9"
        );
    }

    // 5. Convert StyleSheet.create to getStyles
    code = code.replace(
        /const s = StyleSheet\.create\(\{/,
        "const getStyles = (theme, isDarkMode) => StyleSheet.create({"
    );

    // 6. Fix BG constant mapping
    // We shouldn't use `backgroundColor: BG` directly in the object. Let's find it.
    code = code.replace(/backgroundColor: BG \+ 'EE'/g, "backgroundColor: isDarkMode ? BG + 'EE' : 'rgba(255,255,255,0.95)'");
    code = code.replace(/backgroundColor: BG/g, "backgroundColor: isDarkMode ? BG : theme.background");

    // 7. Fix hardcoded colors in getStyles
    // Text colors
    code = code.replace(/color: '#fff'/g, "color: isDarkMode ? '#fff' : theme.text");
    code = code.replace(/color: '#ffffff'/g, "color: isDarkMode ? '#ffffff' : theme.text");
    code = code.replace(/color: '#ccc'/g, "color: isDarkMode ? '#ccc' : theme.textSecondary");
    code = code.replace(/color: '#bbb'/g, "color: isDarkMode ? '#bbb' : theme.textSecondary");
    code = code.replace(/color: '#aaa'/g, "color: isDarkMode ? '#aaa' : theme.textSecondary");
    code = code.replace(/color: '#999'/g, "color: isDarkMode ? '#999' : theme.textSecondary");
    code = code.replace(/color: '#888'/g, "color: isDarkMode ? '#888' : theme.textSecondary");
    code = code.replace(/color: '#777'/g, "color: isDarkMode ? '#777' : theme.textSecondary");
    code = code.replace(/color: '#666'/g, "color: isDarkMode ? '#666' : theme.textSecondary");
    code = code.replace(/color: '#555'/g, "color: isDarkMode ? '#555' : theme.textSecondary");
    code = code.replace(/color: '#444'/g, "color: isDarkMode ? '#444' : theme.textSecondary");

    // Backgrounds
    code = code.replace(/backgroundColor: '#111'/g, "backgroundColor: isDarkMode ? '#111' : theme.surface");
    code = code.replace(/backgroundColor: '#101010'/g, "backgroundColor: isDarkMode ? '#101010' : theme.surface");
    code = code.replace(/backgroundColor: '#0e0e0e'/g, "backgroundColor: isDarkMode ? '#0e0e0e' : theme.surfaceSecondary");
    code = code.replace(/backgroundColor: '#141414'/g, "backgroundColor: isDarkMode ? '#141414' : theme.surfaceSecondary");
    code = code.replace(/backgroundColor: '#181818'/g, "backgroundColor: isDarkMode ? '#181818' : theme.surfaceSecondary");
    code = code.replace(/backgroundColor: '#1a1a1a'/g, "backgroundColor: isDarkMode ? '#1a1a1a' : theme.surfaceSecondary");
    code = code.replace(/backgroundColor: '#1a1810'/g, "backgroundColor: isDarkMode ? '#1a1810' : theme.surfaceSecondary");
    code = code.replace(/backgroundColor: '#1a1508'/g, "backgroundColor: isDarkMode ? '#1a1508' : '#FDF6E3'"); // Slight golden tint for tags

    // Borders
    code = code.replace(/borderColor: '#222'/g, "borderColor: isDarkMode ? '#222' : theme.borderLight");
    code = code.replace(/borderColor: '#2a2a2a'/g, "borderColor: isDarkMode ? '#2a2a2a' : theme.borderLight");
    code = code.replace(/borderColor: '#333'/g, "borderColor: isDarkMode ? '#333' : theme.borderLight");
    code = code.replace(/borderColor: '#1e1e1e'/g, "borderColor: isDarkMode ? '#1e1e1e' : theme.borderLight");

    // 8. Fix gradients in JSX
    // Hero Card Gradient: colors={['#181818', '#111']} -> colors={isDarkMode ? ['#181818', '#111'] : [theme.surface, theme.surface]}
    code = code.replace(/colors=\{\['#181818', '#111'\]\}/g, "colors={isDarkMode ? ['#181818', '#111'] : [theme.surface, theme.surfaceSecondary]}");
    
    // Tag Gradient: colors={['#1e1a0e', '#252010']} -> isDarkMode ? ... : ['#FDF6E3', '#F9F0D4']
    code = code.replace(/colors=\{\['#1e1a0e', '#252010'\]\}/g, "colors={isDarkMode ? ['#1e1a0e', '#252010'] : ['#FDF6E3', '#F9F0D4']}");
    
    // Confirm modal background: colors={['#1a1a1a', '#111']}
    code = code.replace(/colors=\{\['#1a1a1a', '#111'\]\}/g, "colors={isDarkMode ? ['#1a1a1a', '#111'] : [theme.surface, theme.surface]}");
    
    // Lawyer Avatar Background: colors={[selectedLawyer.color, '#111']} -> isDarkMode ? ... : [selectedLawyer.color, theme.surface]
    code = code.replace(/colors=\{\[selectedLawyer\.color, '#111'\]\}/g, "colors={isDarkMode ? [selectedLawyer.color, '#111'] : [selectedLawyer.color, theme.surface]}");
    code = code.replace(/colors=\{\[lawyer\.color, '#0a0a0a'\]\}/g, "colors={isDarkMode ? [lawyer.color, '#0a0a0a'] : [lawyer.color, theme.surface]}");

    // StatusBar
    code = code.replace(/barStyle="light-content"/g, "barStyle={isDarkMode ? 'light-content' : 'dark-content'}");
    code = code.replace(/backgroundColor=\{BG\}/g, "backgroundColor={isDarkMode ? BG : theme.background}");

    fs.writeFileSync('src/screens/Law/LawAnalysisResultScreen.js', code);
}

refactorLawAnalysisResultScreen();
console.log('Successfully refactored LawAnalysisResultScreen for Light Mode!');
