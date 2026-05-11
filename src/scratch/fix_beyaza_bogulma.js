const fs = require('fs');
let code = fs.readFileSync('src/screens/Market/MarketOffersScreen.js', 'utf8');

// Replace all theme.surface and theme.surfaceSecondary with theme.background
// This makes the cards blend into the page (gömük tasarım), completely removing the "white box" effect.

// 1. Summary Card
code = code.replace(
    /colors=\{isDarkMode \? \['rgba\\(30,41,59,0\.9\\)', 'rgba\\(15,23,42,0\.95\\)'\] : \[theme\.surface, theme\.surface\]\}/g,
    "colors={isDarkMode ? ['rgba(30,41,59,0.9)', 'rgba(15,23,42,0.95)'] : [theme.background, theme.background]}"
);

// 2. Back Button
code = code.replace(
    /backgroundColor: isDarkMode \? '#0f172a' : theme\.surface,/g,
    "backgroundColor: isDarkMode ? '#0f172a' : theme.background,"
);

// 3. Group Card
code = code.replace(
    /backgroundColor: isDarkMode \? '#0f172a' : theme\.surface,/g,
    "backgroundColor: isDarkMode ? '#0f172a' : theme.background,"
);

// 4. Navigator
code = code.replace(
    /backgroundColor: isDarkMode \? 'rgba\\(255,255,255,0\.03\\)' : theme\.surfaceSecondary,/g,
    "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : theme.background,"
);

// 5. Price Card
code = code.replace(
    /backgroundColor: isDarkMode \? '#0a1628' : theme\.surfaceSecondary,/g,
    "backgroundColor: isDarkMode ? '#0a1628' : theme.background,"
);

// 6. Sipariş Detayı Wrapper
// It's inline in the component
code = code.replace(
    /backgroundColor: isDarkMode \? 'rgba\\(255,255,255,0\.03\\)' : theme\.surfaceSecondary/g,
    "backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : theme.background"
);

fs.writeFileSync('src/screens/Market/MarketOffersScreen.js', code);
console.log('Fixed beyaza boğulma by converting to theme.background');
