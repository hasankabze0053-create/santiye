const fs = require('fs');

function refactorInsightPanel() {
    let code = fs.readFileSync('src/screens/Law/components/InsightPanel.js', 'utf8');

    // 1. Add import
    if (!code.includes('import { useTheme } from')) {
        code = code.replace(
            /import \{ MOCK_LAWYERS \} from '\.\.\/\.\.\/\.\.\/services\/legalAiService';/,
            "import { MOCK_LAWYERS } from '../../../services/legalAiService';\nimport { useTheme } from '../../../context/ThemeContext';"
        );
    }

    // 2. Add useTheme to component
    if (!code.includes('const theme = useTheme();')) {
        code = code.replace(
            /export default function InsightPanel\(\{ visible, data, onClose, onConfirm, onReAnalyze \}\) \{/,
            "export default function InsightPanel({ visible, data, onClose, onConfirm, onReAnalyze }) {\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;\n    const s = getStyles(theme, isDarkMode);"
        );
    }

    // 3. Change StyleSheet.create to getStyles factory
    if (!code.includes('const getStyles = (theme, isDarkMode) => StyleSheet.create({')) {
        code = code.replace(
            /const s = StyleSheet\.create\(\{/,
            "const getStyles = (theme, isDarkMode) => StyleSheet.create({"
        );
    }

    // 4. Style rules
    code = code.replace(/backgroundColor: '#0C0C0C'/g, "backgroundColor: isDarkMode ? '#0C0C0C' : theme.surface");
    code = code.replace(/backgroundColor: '#2A2A2A'/g, "backgroundColor: isDarkMode ? '#2A2A2A' : theme.borderLight");
    code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.03\)'/g, "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : theme.surfaceSecondary");
    code = code.replace(/backgroundColor: '#1A1A1A'/g, "backgroundColor: isDarkMode ? '#1A1A1A' : theme.surfaceSecondary");
    code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.05\)'/g, "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : theme.surfaceSecondary");
    code = code.replace(/backgroundColor: 'rgba\(0,0,0,0\.4\)'/g, "backgroundColor: isDarkMode ? 'rgba(0,0,0,0.4)' : theme.surfaceSecondary");
    
    code = code.replace(/borderColor: '#1E1E1E'/g, "borderColor: isDarkMode ? '#1E1E1E' : theme.borderLight");
    code = code.replace(/borderColor: '#333'/g, "borderColor: isDarkMode ? '#333' : theme.borderLight");

    code = code.replace(/color: '#fff'/g, "color: isDarkMode ? '#fff' : theme.text");
    code = code.replace(/color: '#bbb'/g, "color: isDarkMode ? '#bbb' : theme.textSecondary");
    code = code.replace(/color: '#ddd'/g, "color: isDarkMode ? '#ddd' : theme.text");
    code = code.replace(/color: '#666'/g, "color: isDarkMode ? '#666' : theme.textSecondary");
    code = code.replace(/color: '#999'/g, "color: isDarkMode ? '#999' : theme.textSecondary");
    
    // 5. Replace inline text colors inside LawyerCard component.
    // LawyerCard is defined inside InsightPanel.js (probably). Let's see if we need to pass theme there.
    // Wait, let's just make it dynamic.
    if (code.includes('function LawyerCard')) {
        code = code.replace(
            /function LawyerCard\(\{ lawyer, rank, onConnect \}\) \{/,
            "function LawyerCard({ lawyer, rank, onConnect }) {\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;\n    const s = getStyles(theme, isDarkMode);"
        );
        // Replace inner lawyer card styles
        code = code.replace(/backgroundColor: '#151515'/g, "backgroundColor: isDarkMode ? '#151515' : theme.surfaceSecondary");
        code = code.replace(/color: '#888'/g, "color: isDarkMode ? '#888' : theme.textSecondary");
    }

    fs.writeFileSync('src/screens/Law/components/InsightPanel.js', code);
}

refactorInsightPanel();
console.log('Successfully refactored InsightPanel!');
