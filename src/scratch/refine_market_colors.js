const fs = require('fs');
let code = fs.readFileSync('src/screens/Market/MarketOffersScreen.js', 'utf8');

// 1. Fix Summary Card Gradient (Top Card) - Don't drown it in white
code = code.replace(
    /colors=\{isDarkMode \? \['rgba\\(30,41,59,0\.9\\)', 'rgba\\(15,23,42,0\.95\\)'\] : \[theme\.surface, theme\.surface\]\}/g,
    "colors={isDarkMode ? ['rgba(30,41,59,0.9)', 'rgba(15,23,42,0.95)'] : [theme.surface, 'rgba(140,98,0,0.05)']}"
);

// 2. Fix Bright Yellow Icons & Text (Cırtlak Sarı)
code = code.replace(/color=\"#FFD700\"/g, "color={isDarkMode ? '#FFD700' : '#8C6200'}");
// Fix explicitly bright gold text
code = code.replace(/color: '#FFD700'/g, "color: isDarkMode ? '#FFD700' : '#8C6200'");

// 3. Fix Bright Green (Sipariş Miktarı & KDV Dahil & Toplam Fiyat)
code = code.replace(/color: '#4ADE80'/g, "color: isDarkMode ? '#4ADE80' : '#16A34A'");
code = code.replace(/backgroundColor: 'rgba\\(74, 222, 128, 0\.1\\)'/g, "backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(22, 163, 74, 0.1)'");
code = code.replace(/backgroundColor: 'rgba\\(74,222,128,0\.1\\)'/g, "backgroundColor: isDarkMode ? 'rgba(74,222,128,0.1)' : 'rgba(22, 163, 74, 0.1)'");

// 4. Fix Bright Orange (KDV Hariç)
code = code.replace(/color: '#fb923c'/g, "color: isDarkMode ? '#fb923c' : '#D97706'");
code = code.replace(/backgroundColor: 'rgba\\(251,146,60,0\.1\\)'/g, "backgroundColor: isDarkMode ? 'rgba(251,146,60,0.1)' : 'rgba(217, 119, 6, 0.1)'");

// 5. Fix Bright Blue & Pink (Özellikler)
code = code.replace(/color: '#38bdf8'/g, "color: isDarkMode ? '#38bdf8' : '#0284C7'");
code = code.replace(/color=\"#38bdf8\"/g, "color={isDarkMode ? '#38bdf8' : '#0284C7'}");
code = code.replace(/backgroundColor: 'rgba\\(56, 189, 248, 0\.1\\)'/g, "backgroundColor: isDarkMode ? 'rgba(56, 189, 248, 0.1)' : 'rgba(2, 132, 199, 0.1)'");
code = code.replace(/borderColor: 'rgba\\(56, 189, 248, 0\.4\\)'/g, "borderColor: isDarkMode ? 'rgba(56, 189, 248, 0.4)' : 'rgba(2, 132, 199, 0.3)'");

code = code.replace(/color: '#f472b6'/g, "color: isDarkMode ? '#f472b6' : '#BE185D'");
code = code.replace(/color=\"#f472b6\"/g, "color={isDarkMode ? '#f472b6' : '#BE185D'}");
code = code.replace(/backgroundColor: 'rgba\\(244, 114, 182, 0\.1\\)'/g, "backgroundColor: isDarkMode ? 'rgba(244, 114, 182, 0.1)' : 'rgba(190, 24, 93, 0.1)'");
code = code.replace(/borderColor: 'rgba\\(244, 114, 182, 0\.4\\)'/g, "borderColor: isDarkMode ? 'rgba(244, 114, 182, 0.4)' : 'rgba(190, 24, 93, 0.3)'");

// 6. Fix "Beyaza Boğulma" by separating surface levels
// Instead of all cards being `theme.surface` or `theme.surfaceSecondary`, let's make `groupCard` purely `theme.surface` and inner cards `theme.surfaceSecondary`.
// This is actually mostly done but `Sipariş Detayı` and `Fiyat` were using `theme.surfaceSecondary` already. Let's make sure chips have correct bg:
// "KDV Dahil", "Nakliye", etc. chips currently have a hardcoded gold background.
code = code.replace(/backgroundColor: 'rgba\\(212, 175, 55, 0\.08\\)'/g, "backgroundColor: isDarkMode ? 'rgba(212, 175, 55, 0.08)' : theme.surfaceSecondary");

// 7. Fix Icon and Chips text colors that might still be dark gold
code = code.replace(/color=\"#D4AF37\"/g, "color={isDarkMode ? '#D4AF37' : '#8C6200'}");
code = code.replace(/color: '#D4AF37'/g, "color: isDarkMode ? '#D4AF37' : '#8C6200'");

// 8. Bottom CTA Button "GÖRÜŞME SAĞLA" gradient
// It was ['#FFD700', '#FF9100'], which is super bright yellow.
code = code.replace(
    /colors=\{\['#FFD700', '#FF9100'\]\}/g,
    "colors={isDarkMode ? ['#FFD700', '#FF9100'] : ['#D4AF37', '#E8890C']}"
);

// Write changes
fs.writeFileSync('src/screens/Market/MarketOffersScreen.js', code);
console.log('Successfully polished Light Mode colors for MarketOffersScreen!');
