const fs = require('fs');

let code = fs.readFileSync('src/components/SharedRequestDetail.js', 'utf8');

// 1. Add import
if (!code.includes('useTheme')) {
    code = code.replace(/import React, \{ useState \} from 'react';/, "import React, { useState } from 'react';\nimport { useTheme } from '../context/ThemeContext';");
}

// 2. Pass theme to StatusBadge
code = code.replace(/const StatusBadge = \(\{ status \}\) => \(/, 'const StatusBadge = ({ status, theme, isDarkMode, styles }) => (');
code = code.replace(/<StatusBadge status=\{([^}]+)\} \/>/g, '<StatusBadge status={$1} theme={theme} isDarkMode={isDarkMode} styles={styles} />');

// 3. Inject useTheme into SharedRequestDetail
if (!code.includes('const isDarkMode = theme.isDarkMode;')) {
    code = code.replace(/const SharedRequestDetail = \(\{([\s\S]*?)\}\) => \{/, "const SharedRequestDetail = ({$1}) => {\n    const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;\n    const styles = getStyles(theme, isDarkMode);\n");
}

// 4. Update StyleSheet creation
if (!code.includes('getStyles = (theme, isDarkMode)')) {
    code = code.replace(/const styles = StyleSheet.create\(\{/, 'const getStyles = (theme, isDarkMode) => StyleSheet.create({');
}

// Replace hardcoded values inside getStyles
code = code.replace(/backgroundColor: '#000'/g, "backgroundColor: isDarkMode ? '#000' : theme.background");
code = code.replace(/backgroundColor: '#111'/g, "backgroundColor: isDarkMode ? '#111' : theme.surface");
code = code.replace(/backgroundColor: '#1A1A1A'/g, "backgroundColor: isDarkMode ? '#1A1A1A' : theme.surface");
code = code.replace(/backgroundColor: '#161616'/g, "backgroundColor: isDarkMode ? '#161616' : theme.surface");
code = code.replace(/backgroundColor: '#0A0A0A'/g, "backgroundColor: isDarkMode ? '#0A0A0A' : theme.surface");
code = code.replace(/borderColor: '#222'/g, "borderColor: isDarkMode ? '#222' : theme.borderLight");
code = code.replace(/borderColor: '#333'/g, "borderColor: isDarkMode ? '#333' : theme.border");
code = code.replace(/borderColor: '#1E1E1E'/g, "borderColor: isDarkMode ? '#1E1E1E' : theme.border");

// Fix inline styles in the components
// Gradients
code = code.replace(/colors=\{\['#000000', '#0D0D0D'\]\}/g, "colors={isDarkMode ? ['#000000', '#0D0D0D'] : [theme.background, theme.background]}");
code = code.replace(/colors=\{\['#0F172A', '#020617'\]\}/g, "colors={isDarkMode ? ['#0F172A', '#020617'] : [theme.surface, theme.surface]}");
code = code.replace(/colors=\{\['#1A1200', '#0D0D0D'\]\}/g, "colors={isDarkMode ? ['#1A1200', '#0D0D0D'] : [theme.surface, theme.surface]}");
code = code.replace(/colors=\{\['#1A1200', '#0A0A0A'\]\}/g, "colors={isDarkMode ? ['#1A1200', '#0A0A0A'] : [theme.surface, theme.surface]}");
code = code.replace(/colors=\{\['#1F1F1F', '#111'\]\}/g, "colors={isDarkMode ? ['#1F1F1F', '#111'] : [theme.surface, theme.surface]}");
code = code.replace(/colors=\{\['#000000', '#0A0A0A'\]\}/g, "colors={isDarkMode ? ['#000000', '#0A0A0A'] : [theme.background, theme.background]}");
code = code.replace(/colors=\{\['#1A1A1C', '#000'\]\}/g, "colors={isDarkMode ? ['#1A1A1C', '#000'] : [theme.surface, theme.background]}");

// Text colors
code = code.replace(/color: '#FFF'/g, "color: theme.text");
code = code.replace(/color: '#FFFFFF'/g, "color: theme.text");
code = code.replace(/color: '#888'/g, "color: theme.textSecondary");
code = code.replace(/color: '#666'/g, "color: theme.textSecondary");
code = code.replace(/color: '#CCC'/g, "color: theme.textSecondary");
code = code.replace(/color: '#555'/g, "color: theme.textSecondary");
code = code.replace(/color: '#DDD'/g, "color: theme.textSecondary");
code = code.replace(/color: '#EEE'/g, "color: theme.text");
code = code.replace(/color: '#444'/g, "color: theme.textSecondary");

// Inline properties
code = code.replace(/color="#FFF"/g, 'color={theme.text}');
code = code.replace(/color="#888"/g, 'color={theme.textSecondary}');
code = code.replace(/color="#666"/g, 'color={theme.textSecondary}');
code = code.replace(/color="#444"/g, 'color={theme.textSecondary}');
code = code.replace(/color="#333"/g, 'color={theme.textSecondary}');

// Background colors inline
code = code.replace(/backgroundColor: '#111'/g, "backgroundColor: isDarkMode ? '#111' : theme.surface");

// Write back
fs.writeFileSync('src/components/SharedRequestDetail.js', code);
console.log('Done refactoring SharedRequestDetail.js');
