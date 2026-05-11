const fs = require('fs');
let code = fs.readFileSync('src/components/SharedRequestDetail.js', 'utf8');

// Fix the pitch black background in 'TEKLİFLERİ İNCELE' container (Image 1 and 3)
code = code.replace(
    /colors=\{\['#17130A', '#0D0C09', '#050505'\]\}/g,
    "colors={isDarkMode ? ['#17130A', '#0D0C09', '#050505'] : ['rgba(212,175,55,0.08)', 'rgba(212,175,55,0.04)', 'rgba(212,175,55,0.01)']}"
);

// Fix the "cırtlak" white background in '2 ADET TEKLİF ALINDI' container (Image 2)
code = code.replace(
    /colors=\{isDarkMode \? \['#1A1200', '#0A0A0A'\] : \[theme\.surface, theme\.surface\]\}/g,
    "colors={isDarkMode ? ['#1A1200', '#0A0A0A'] : ['rgba(212,175,55,0.08)', 'rgba(212,175,55,0.02)']}"
);

// Fix other stark white surfaces that might look too "cırtlak" (like the hero card)
code = code.replace(
    /colors=\{isDarkMode \? \['#1A1200', '#0D0D0D'\] : \[theme\.surface, theme\.surface\]\}/g,
    "colors={isDarkMode ? ['#1A1200', '#0D0D0D'] : [theme.surface, 'rgba(212,175,55,0.03)']}"
);

// We need to also check if there is a 'backgroundColor: isDarkMode ? \'#111\' : theme.surface' inside GELEN TEKLİFLER mapped bids.
code = code.replace(
    /backgroundColor: isDarkMode \? '#111' : theme\.surface/g,
    "backgroundColor: isDarkMode ? '#111' : theme.background" // Or theme.surface if background is already theme.surface
);

fs.writeFileSync('src/components/SharedRequestDetail.js', code);
console.log('Fixed GELEN TEKLİFLER and other contrast issues!');
