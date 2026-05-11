const fs = require('fs');

function fixBuildingSchema() {
    let code = fs.readFileSync('src/components/BuildingSchema.js', 'utf8');
    
    // Remove all incorrect getStyles
    code = code.replace(/const styles = getStyles\(theme, isDarkMode\);\n/g, '');
    
    // Insert getStyles at the right place
    code = code.replace(
        /const \{ theme, isDarkMode \} = useTheme\(\);/,
        "const { theme, isDarkMode } = useTheme();\n    const styles = getStyles(theme, isDarkMode);"
    );
    fs.writeFileSync('src/components/BuildingSchema.js', code);
}

function fixOfferSummaryCard() {
    let code = fs.readFileSync('src/components/OfferSummaryCard.js', 'utf8');
    
    // Remove all incorrect getStyles
    code = code.replace(/const styles = getStyles\(theme, isDarkMode\);\n/g, '');
    
    // Insert getStyles at the right place
    code = code.replace(
        /const \{ theme, isDarkMode \} = useTheme\(\);/,
        "const { theme, isDarkMode } = useTheme();\n    const styles = getStyles(theme, isDarkMode);"
    );
    fs.writeFileSync('src/components/OfferSummaryCard.js', code);
}

fixBuildingSchema();
fixOfferSummaryCard();
console.log('Fixed Styles Locations');
