const fs = require('fs');

let code = fs.readFileSync('src/screens/Renovation/GarageWizardScreen.js', 'utf8');

// Add useTheme and useMemo
code = code.replace(
    "import React from 'react';",
    "import React, { useMemo } from 'react';\nimport { useTheme } from '../../context/ThemeContext';"
);

// Inject theme hooks and replace styles
code = code.replace(
    /export default function GarageWizardScreen\(\{ navigation \}\) \{/,
    "export default function GarageWizardScreen({ navigation }) {\n  const { theme, isDarkMode } = useTheme();\n  const TH = useMemo(() => ({\n    gold: theme.accentBright,\n    bg: theme.background,\n    cardBg: theme.surface,\n    border: theme.border,\n    text: theme.text,\n    textSub: theme.textSecondary,\n    glassBg: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',\n    iconBg: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(140, 98, 0, 0.1)'\n  }), [theme, isDarkMode]);\n  const styles = useMemo(() => getStyles(TH, isDarkMode), [TH, isDarkMode]);\n"
);

// Fix colors in JSX
code = code.replace(/<LinearGradient colors=\{\['#000', '#111'\]\} style=\{StyleSheet\.absoluteFill\} \/>/g, "<LinearGradient colors={[TH.bg, TH.cardBg]} style={StyleSheet.absoluteFill} />");
code = code.replace(/COLORS\.gold/g, "TH.gold");
code = code.replace(/<LinearGradient\s+colors=\{\['transparent', 'rgba\(0,0,0,0\.8\)'\]\}\s+style=\{StyleSheet\.absoluteFill\}\s+\/>/g, "<LinearGradient\n                  colors={['transparent', TH.glassBg]}\n                  style={StyleSheet.absoluteFill}\n                />");

// Wrap styles
code = code.replace(/const styles = StyleSheet\.create\(\{([\s\S]*?)\}\);/g, "const getStyles = (TH, isDarkMode) => StyleSheet.create({$1});");

// Replace hardcoded values inside styles
code = code.replace(/backgroundColor: '#000'/g, "backgroundColor: TH.bg");
code = code.replace(/color: '#FFF'/g, "color: TH.text");
code = code.replace(/color: '#888'/g, "color: TH.textSub");
code = code.replace(/color: '#AAA'/g, "color: TH.textSub");
code = code.replace(/backgroundColor: '#1A1A1A'/g, "backgroundColor: TH.cardBg");
code = code.replace(/borderColor: 'rgba\(255, 215, 0, 0\.1\)'/g, "borderColor: TH.iconBg");
code = code.replace(/backgroundColor: 'rgba\(255, 215, 0, 0\.1\)'/g, "backgroundColor: TH.iconBg");
code = code.replace(/backgroundColor: 'rgba\(0,0,0,0\.3\)'/g, "backgroundColor: 'transparent'"); // already covered by gradient

fs.writeFileSync('src/screens/Renovation/GarageWizardScreen.js', code);
console.log('Done refactoring GarageWizardScreen.js');
