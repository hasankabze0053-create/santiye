const fs = require('fs');

const oldTHRegex = /const TH = \{[\s\S]*?\};\r?\n/;
const thDef = `const getTH = (theme, isDarkMode) => ({
    bg: theme.background,
    cardLight: theme.surface,
    cardDark: theme.surfaceSecondary,
    gold: theme.accentBright,
    goldDark: theme.accent,
    goldMuted: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(140, 98, 0, 0.1)',
    textPrimary: theme.text,
    textMuted: theme.textSecondary,
    border: theme.border,
    borderLight: theme.borderLight,
    danger: theme.danger
});
`;

let codeKB = fs.readFileSync('src/screens/Renovation/KitchenBathWizardScreen.js', 'utf8');
codeKB = codeKB.replace(oldTHRegex, thDef);
fs.writeFileSync('src/screens/Renovation/KitchenBathWizardScreen.js', codeKB);

let codeG = fs.readFileSync('src/screens/Renovation/GarageWizardScreen.js', 'utf8');
codeG = codeG.replace(oldTHRegex, thDef);
fs.writeFileSync('src/screens/Renovation/GarageWizardScreen.js', codeG);

console.log('Fixed getTH in KB and Garage');
