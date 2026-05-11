const fs = require('fs');
let code = fs.readFileSync('src/screens/Market/MarketOffersScreen.js', 'utf8');

// 1. Add ThemeContext import
if (!code.includes('useTheme')) {
    code = code.replace(
        /import SharedRequestDetail from '\.\.\/\.\.\/components\/SharedRequestDetail';/,
        "import SharedRequestDetail from '../../components/SharedRequestDetail';\nimport { useTheme } from '../../context/ThemeContext';"
    );
}

// 2. Add useTheme inside component
if (!code.includes('const { theme, isDarkMode } = useTheme();')) {
    code = code.replace(
        /const \{ request, bids, isAdminView = false \} = route\.params \|\| \{\};/,
        "const { request, bids, isAdminView = false } = route.params || {};\n    const { theme, isDarkMode } = useTheme();"
    );
}

// 3. Background Gradient
code = code.replace(
    /<LinearGradient colors=\{\['#000000', '#0a0f1e'\]\} style=\{StyleSheet\.absoluteFillObject\} \/>/g,
    "<LinearGradient colors={isDarkMode ? ['#000000', '#0a0f1e'] : [theme.background, theme.background]} style={StyleSheet.absoluteFillObject} />"
);

// 4. Header elements
code = code.replace(/<Ionicons name="arrow-back" size=\{22\} color="#FFF" \/>/g, "<Ionicons name=\"arrow-back\" size={22} color={isDarkMode ? '#FFF' : theme.text} />");
code = code.replace(/color: '#475569'/g, "color: isDarkMode ? '#475569' : theme.textSecondary");

// 5. Summary Card
code = code.replace(
    /colors=\{\['rgba\(30,41,59,0\.9\)', 'rgba\(15,23,42,0\.95\)'\]\}/g,
    "colors={isDarkMode ? ['rgba(30,41,59,0.9)', 'rgba(15,23,42,0.95)'] : [theme.surface, theme.surface]}"
);
code = code.replace(/color: '#fff', fontSize: 15, fontWeight: '800'/g, "color: isDarkMode ? '#fff' : theme.text, fontSize: 15, fontWeight: '800'");
code = code.replace(/color: '#64748b', fontSize: 12, marginTop: 2/g, "color: isDarkMode ? '#64748b' : theme.textSecondary, fontSize: 12, marginTop: 2");

// 6. Firm Details
code = code.replace(/style=\{styles\.firmName\}/g, "style={[styles.firmName, { color: isDarkMode ? '#fff' : theme.text }]}");
code = code.replace(/style=\{styles\.firmSub\}/g, "style={[styles.firmSub, { color: isDarkMode ? '#475569' : theme.textSecondary }]}");

// 7. Sipariş Detayı
code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.03\)'/g, "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : theme.surfaceSecondary");
code = code.replace(/borderColor: 'rgba\(255,255,255,0\.1\)'/g, "borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.borderLight");
code = code.replace(/color="#FFF"/g, "color={isDarkMode ? '#FFF' : theme.text}"); // cube-outline
code = code.replace(/backgroundColor: 'rgba\(255, 255, 255, 0\.15\)'/g, "backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0,0,0,0.05)'");
code = code.replace(/color: '#FFF', fontSize: 11, fontWeight: '900'/g, "color: isDarkMode ? '#FFF' : theme.text, fontSize: 11, fontWeight: '900'");
code = code.replace(/color: '#FFF', fontSize: 18, fontWeight: '900'/g, "color: isDarkMode ? '#FFF' : theme.text, fontSize: 18, fontWeight: '900'");
code = code.replace(/color: '#FFD700', fontSize: 12, fontWeight: '900', letterSpacing: 1\.5/g, "color: isDarkMode ? '#FFD700' : '#B8860B', fontSize: 12, fontWeight: '900', letterSpacing: 1.5");

// 8. Fiyat Bilgisi
code = code.replace(/backgroundColor: '#0a1628'/g, "backgroundColor: isDarkMode ? '#0a1628' : theme.surfaceSecondary");
code = code.replace(/color: '#FFD700', fontSize: 34/g, "color: isDarkMode ? '#FFD700' : '#B8860B', fontSize: 34");
code = code.replace(/color: '#64748b', fontSize: 11, fontWeight: '800'/g, "color: isDarkMode ? '#64748b' : theme.textSecondary, fontSize: 11, fontWeight: '800'");

// 9. Chips
code = code.replace(/color: '#FFF', fontSize: 13, fontWeight: '600'/g, "color: isDarkMode ? '#FFF' : theme.text, fontSize: 13, fontWeight: '600'");

// 10. Styles
code = code.replace(/backgroundColor: '#000'/g, "backgroundColor: isDarkMode ? '#000' : theme.background");
code = code.replace(/color: '#FFD700', fontSize: 15/g, "color: isDarkMode ? '#FFD700' : '#B8860B', fontSize: 15");
code = code.replace(/backgroundColor: '#0f172a'/g, "backgroundColor: isDarkMode ? '#0f172a' : theme.surface");
code = code.replace(/borderColor: '#1e293b'/g, "borderColor: isDarkMode ? '#1e293b' : theme.borderLight");
code = code.replace(/borderColor: 'rgba\(255,215,0,0\.2\)'/g, "borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : theme.borderLight");
code = code.replace(/borderBottomColor: '#1e293b'/g, "borderBottomColor: isDarkMode ? '#1e293b' : theme.borderLight");
code = code.replace(/borderColor: 'rgba\(255,255,255,0\.06\)'/g, "borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : theme.borderLight");

fs.writeFileSync('src/screens/Market/MarketOffersScreen.js', code);
console.log('Update complete.');
