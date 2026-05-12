const fs = require('fs');

function fixLawScreenComponents() {
    let code = fs.readFileSync('src/screens/Law/LawScreen.js', 'utf8');

    // 1. AnalyzingOverlay
    if (!code.includes('const s = getStyles(theme, isDarkMode);', code.indexOf('function AnalyzingOverlay'))) {
        code = code.replace(
            /function AnalyzingOverlay\(\{ visible \}\) \{/,
            "function AnalyzingOverlay({ visible }) {\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;\n    const s = getStyles(theme, isDarkMode);"
        );
    }

    // 2. WaveBar
    if (!code.includes('const s = getStyles(theme, isDarkMode);', code.indexOf('function WaveBar'))) {
        code = code.replace(
            /function WaveBar\(\{ delay \}\) \{/,
            "function WaveBar({ delay }) {\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;\n    const s = getStyles(theme, isDarkMode);"
        );
    }

    // 3. RecentCard
    if (!code.includes('const s = getStyles(theme, isDarkMode);', code.indexOf('function RecentCard'))) {
        code = code.replace(
            /function RecentCard\(\{ cat, score, time, onPress, onDelete \}\) \{/,
            "function RecentCard({ cat, score, time, onPress, onDelete }) {\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;\n    const s = getStyles(theme, isDarkMode);"
        );
    }
    
    // We also need to fix `EncodingType not found in imported namespace FileSystem`. 
    // This is because we imported it as `* as FileSystem`. Wait, `FileSystem.EncodingType.Base64` is correct syntax for `* as FileSystem` in expo-file-system. 
    // That warning is an ESLint rule `import/namespace` being overly strict sometimes with Expo, but we don't have to worry about it breaking the app.
    // Let's just fix the `s is not defined` errors.
    
    fs.writeFileSync('src/screens/Law/LawScreen.js', code);
}

fixLawScreenComponents();
console.log('Fixed component scope for s in LawScreen!');
