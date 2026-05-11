const fs = require('fs');

function fixUseTheme(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Replace the incorrect destructuring with the correct assignment
    code = code.replace(
        /const \{ theme, isDarkMode \} = useTheme\(\);/g,
        "const theme = useTheme();\n    const isDarkMode = theme.isDarkMode;"
    );

    fs.writeFileSync(filePath, code);
}

fixUseTheme('src/components/OfferSummaryCard.js');
fixUseTheme('src/components/BuildingSchema.js');
fixUseTheme('src/screens/Cost/OfferDetailScreen.js');

console.log('Fixed useTheme destructuring in all 3 files.');
