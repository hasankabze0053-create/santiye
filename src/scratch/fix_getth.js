const fs = require('fs');
let code = fs.readFileSync('src/screens/Renovation/PaintDecorWizardScreen.js', 'utf8');

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
    danger: theme.danger,
    warningBg: isDarkMode ? 'rgba(212,175,55,0.08)' : 'rgba(184, 130, 15, 0.08)',
    warningText: theme.accentBright
});
`;

code = code.replace(oldTHRegex, thDef);
fs.writeFileSync('src/screens/Renovation/PaintDecorWizardScreen.js', code);
console.log('Fixed getTH');
