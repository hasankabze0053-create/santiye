const fs = require('fs');

let code = fs.readFileSync('src/screens/Renovation/ElevatorWizardScreen.js', 'utf8');

// 1. Add useTheme import
code = code.replace(
    "import { SafeAreaView } from 'react-native-safe-area-context';",
    "import { SafeAreaView } from 'react-native-safe-area-context';\nimport { useTheme } from '../../context/ThemeContext';"
);

// Remove static constants
code = code.replace(
    "// ─── THEME ────────────────────────────────────────────────────────────────────\nconst GOLD = '#D4AF37';\nconst GOLD_LIGHT = '#F7E5A8';\nconst GOLD_DARK = '#8C6A30';\nconst BG_DARK = '#0A0A0A';\nconst CARD_BG = '#141414';\nconst BORDER = '#252525';",
    "// ─── THEME DYNAMIC ────────────────────────────────────────────────────────────\n" +
    "const getTH = (theme, isDarkMode) => ({\n" +
    "    GOLD: theme.accentBright,\n" +
    "    GOLD_LIGHT: isDarkMode ? '#F7E5A8' : '#B8820F',\n" +
    "    GOLD_DARK: theme.accent,\n" +
    "    BG_DARK: theme.background,\n" +
    "    CARD_BG: theme.surface,\n" +
    "    CARD_BG_SEC: theme.surfaceSecondary,\n" +
    "    BORDER: theme.border,\n" +
    "    BORDER_LIGHT: theme.borderLight,\n" +
    "    TEXT: theme.text,\n" +
    "    TEXT_MUTED: theme.textSecondary,\n" +
    "    GLASS_BG: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(140,98,0,0.04)',\n" +
    "    ICON_BG: isDarkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(140, 98, 0, 0.1)',\n" +
    "});"
);

// Update Main Component to use hooks
code = code.replace(
    /export default function ElevatorWizardScreen\(\{ navigation \}\) \{/,
    "export default function ElevatorWizardScreen({ navigation }) {\n    const { theme, isDarkMode } = useTheme();\n    const TH = useMemo(() => getTH(theme, isDarkMode), [theme, isDarkMode]);\n    const { styles } = useMemo(() => getStyles(TH, isDarkMode), [TH, isDarkMode]);\n"
);

// Wrap StyleSheet.create
code = code.replace(/const styles = StyleSheet\.create\(\{([\s\S]*?)\}\);/, "const getStyles = (TH, isDarkMode) => ({\n    styles: StyleSheet.create({$1})\n});");

// Replace hardcoded variables in the file with TH. variables
code = code.replace(/GOLD/g, "TH.GOLD");
code = code.replace(/TH\.TH\.GOLD/g, "TH.GOLD"); // Fix double replacement if any
code = code.replace(/GOLD_LIGHT/g, "TH.GOLD_LIGHT");
code = code.replace(/TH\.TH\.GOLD_LIGHT/g, "TH.GOLD_LIGHT");
code = code.replace(/GOLD_DARK/g, "TH.GOLD_DARK");
code = code.replace(/TH\.TH\.GOLD_DARK/g, "TH.GOLD_DARK");
code = code.replace(/BG_DARK/g, "TH.BG_DARK");
code = code.replace(/TH\.TH\.BG_DARK/g, "TH.BG_DARK");
code = code.replace(/CARD_BG/g, "TH.CARD_BG");
code = code.replace(/TH\.TH\.CARD_BG/g, "TH.CARD_BG");
code = code.replace(/BORDER/g, "TH.BORDER");
code = code.replace(/TH\.TH\.BORDER/g, "TH.BORDER");

// Now let's fix specific hardcoded colors in styles and JSX
code = code.replace(/colors=\{\[TH\.BG_DARK, '#0D0D0D', TH\.BG_DARK\]\}/g, "colors={[TH.BG_DARK, isDarkMode ? '#0D0D0D' : TH.CARD_BG_SEC, TH.BG_DARK]}");
code = code.replace(/colors=\{selectedType === 'malfunction' \? \[TH\.GOLD_DARK, '#1A1A1A'\] : \['#141414', '#0A0A0A'\]\}/g, "colors={selectedType === 'malfunction' ? [TH.GOLD_DARK, isDarkMode ? '#1A1A1A' : TH.CARD_BG] : [TH.CARD_BG, TH.CARD_BG_SEC]}");
code = code.replace(/colors=\{selectedType === 'maintenance' \? \[TH\.GOLD_DARK, '#1A1A1A'\] : \['#141414', '#0A0A0A'\]\}/g, "colors={selectedType === 'maintenance' ? [TH.GOLD_DARK, isDarkMode ? '#1A1A1A' : TH.CARD_BG] : [TH.CARD_BG, TH.CARD_BG_SEC]}");

code = code.replace(/backgroundColor: '#141414'/g, "backgroundColor: TH.CARD_BG");
code = code.replace(/backgroundColor: '#111'/g, "backgroundColor: TH.CARD_BG_SEC");
code = code.replace(/backgroundColor: '#161616'/g, "backgroundColor: TH.CARD_BG_SEC");
code = code.replace(/backgroundColor: '#000'/g, "backgroundColor: TH.CARD_BG");
code = code.replace(/backgroundColor: 'rgba\(255,255,255,0\.02\)'/g, "backgroundColor: TH.GLASS_BG");
code = code.replace(/backgroundColor: 'rgba\(212, 175, 55, 0\.1\)'/g, "backgroundColor: TH.ICON_BG");

code = code.replace(/color: '#FFF'/g, "color: TH.TEXT");
code = code.replace(/color="#FFF"/g, 'color={TH.TEXT}');
code = code.replace(/color: '#555'/g, "color: TH.TEXT_MUTED");
code = code.replace(/color="#555"/g, 'color={TH.TEXT_MUTED}');
code = code.replace(/color: '#666'/g, "color: TH.TEXT_MUTED");
code = code.replace(/color: '#888'/g, "color: TH.TEXT_MUTED");
code = code.replace(/color: '#999'/g, "color: TH.TEXT_MUTED");
code = code.replace(/color: '#444'/g, "color: TH.TEXT_MUTED");
code = code.replace(/color="#333"/g, 'color={TH.TEXT_MUTED}');
code = code.replace(/color: '#000'/g, "color: isDarkMode ? '#000' : '#FFF'"); // inside buttons, usually inverted

code = code.replace(/borderBottomColor: '#1A1A1A'/g, "borderBottomColor: TH.BORDER_LIGHT");
code = code.replace(/borderRightColor: '#222'/g, "borderRightColor: TH.BORDER");

fs.writeFileSync('src/screens/Renovation/ElevatorWizardScreen.js', code);
console.log('Done refactoring ElevatorWizardScreen.js');
