const fs = require('fs');

function fixLcStyles() {
    let code = fs.readFileSync('src/screens/Law/components/InsightPanel.js', 'utf8');

    // Inside LawyerCard function, we need to call getLcStyles
    if (!code.includes('const lc = getLcStyles(theme, isDarkMode);')) {
        code = code.replace(
            /const s = getStyles\(theme, isDarkMode\);/,
            "const s = getStyles(theme, isDarkMode);\n    const lc = getLcStyles(theme, isDarkMode);"
        );
    }

    // Change const lc = StyleSheet.create to getLcStyles
    code = code.replace(
        /const lc = StyleSheet\.create\(\{/,
        "const getLcStyles = (theme, isDarkMode) => StyleSheet.create({"
    );

    // Also replace static colors in lc to be dynamic
    code = code.replace(/backgroundColor: '#111'/g, "backgroundColor: isDarkMode ? '#111' : theme.surface");
    code = code.replace(/borderColor: '#222'/g, "borderColor: isDarkMode ? '#222' : theme.borderLight");
    code = code.replace(/backgroundColor: '#1E1E1E'/g, "backgroundColor: isDarkMode ? '#1E1E1E' : theme.surfaceSecondary");
    code = code.replace(/color: '#777'/g, "color: isDarkMode ? '#777' : theme.textSecondary");
    code = code.replace(/color: '#aaa'/g, "color: isDarkMode ? '#aaa' : theme.textSecondary");

    fs.writeFileSync('src/screens/Law/components/InsightPanel.js', code);
}

fixLcStyles();
console.log('Fixed lc scope and colors in InsightPanel.js');
