const fs = require('fs');

let code = fs.readFileSync('src/screens/Renovation/PaintDecorWizardScreen.js', 'utf8');

// 1. Add useTheme import
code = code.replace(
    "import { useSafeAreaInsets } from 'react-native-safe-area-context';",
    "import { useSafeAreaInsets } from 'react-native-safe-area-context';\nimport { useTheme } from '../../context/ThemeContext';"
);
code = code.replace(
    "import { useRef, useState } from 'react';",
    "import { useRef, useState, useMemo } from 'react';"
);

// 2. Replace static TH with getTH
const thDef = `
const getTH = (theme, isDarkMode) => ({
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
    warningText: theme.accentBright,
});
`;
code = code.replace(/const TH = \{[\s\S]*?\};\n/, thDef);

// 3. Update Shared Components to use useTheme
code = code.replace(
    /const SLabel = \(\{ text, sub \}\) => \(/,
    "const SLabel = ({ text, sub }) => {\n    const { theme, isDarkMode } = useTheme();\n    const TH = getTH(theme, isDarkMode);\n    return ("
).replace(
    /<\/View>\n\);/,
    "    </View>\n    );\n};"
);

code = code.replace(
    /const InfoAlert = \(\{ text \}\) => \(/,
    "const InfoAlert = ({ text }) => {\n    const { theme, isDarkMode } = useTheme();\n    const TH = getTH(theme, isDarkMode);\n    const { inf } = useMemo(() => getStyles(TH), [TH]);\n    return ("
).replace(
    /<\/View>\n\);/,
    "    </View>\n    );\n};"
);

code = code.replace(
    /const UploadZone = \(\{ iconName, label, images, onPick, onRemove \}\) => \(/,
    "const UploadZone = ({ iconName, label, images, onPick, onRemove }) => {\n    const { theme, isDarkMode } = useTheme();\n    const TH = getTH(theme, isDarkMode);\n    const { uz } = useMemo(() => getStyles(TH), [TH]);\n    return ("
).replace(
    /<\/View>\n\);/,
    "    </View>\n    );\n};"
);

// 4. Update Main Component to use hooks
code = code.replace(
    /export default function PaintDecorWizardScreen\(\) \{/,
    "export default function PaintDecorWizardScreen() {\n    const { theme, isDarkMode } = useTheme();\n    const TH = useMemo(() => getTH(theme, isDarkMode), [theme, isDarkMode]);\n    const { styles, s, s1, s2, s3, s4, s5 } = useMemo(() => getStyles(TH), [TH]);\n"
);

// 5. Wrap all StyleSheet.create in getStyles
code = code.replace(
    /const inf = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
).replace(
    /const uz = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
).replace(
    /const styles = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
).replace(
    /const s = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
).replace(
    /const s1 = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
).replace(
    /const s2 = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
).replace(
    /const s3 = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
).replace(
    /const s4 = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
).replace(
    /const s5 = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
);

const stylesDef = `
const getStyles = (TH) => ({
    inf: StyleSheet.create({
        box: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: TH.warningBg, borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
        text: { color: TH.warningText, fontSize: 13, lineHeight: 18, flex: 1, fontWeight: '500' },
    }),
    uz: StyleSheet.create({
        wrap: { marginBottom: 24 },
        dropzone: { height: 110, borderRadius: 16, borderWidth: 1.5, borderColor: TH.border, borderStyle: 'dashed', backgroundColor: TH.cardDark, alignItems: 'center', justifyContent: 'center', gap: 10 },
        dropIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: TH.cardLight, alignItems: 'center', justifyContent: 'center' },
        dropText: { color: TH.textMuted, fontSize: 14, fontWeight: '500' },
        imgWrap: { width: 100, height: 100, borderRadius: 16, overflow: 'hidden', backgroundColor: TH.cardDark },
        removeBtn: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
        addMoreBtn: { width: 100, height: 100, borderRadius: 16, borderWidth: 1.5, borderColor: TH.border, borderStyle: 'dashed', backgroundColor: TH.cardDark, alignItems: 'center', justifyContent: 'center' },
    }),
    styles: StyleSheet.create({
        container: { flex: 1, backgroundColor: TH.bg },
        header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: TH.bg, zIndex: 10 },
        backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: TH.cardLight, alignItems: 'center', justifyContent: 'center' },
        progressWrap: { flex: 1, flexDirection: 'row', gap: 6, marginHorizontal: 16, height: 4 },
        progSeg: { flex: 1, height: '100%', borderRadius: 2, backgroundColor: TH.border },
        progSegActive: { backgroundColor: TH.gold },
        stepIndicator: { color: TH.textMuted, fontSize: 12, fontWeight: '600' },
        scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
        headerTitles: { marginBottom: 30 },
        mainTitle: { color: TH.textPrimary, fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.5 },
        bottomBar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: TH.border, backgroundColor: TH.bg, gap: 12 },
        bottomBackBtn: { height: 56, paddingHorizontal: 24, borderRadius: 30, borderWidth: 1, borderColor: TH.borderLight, alignItems: 'center', justifyContent: 'center' },
        bottomBackText: { color: TH.textMuted, fontSize: 15, fontWeight: '600' },
        primaryBtn: { flex: 1, height: 56, borderRadius: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', overflow: 'hidden' },
        primaryBtnText: { color: '#1A1A1A', fontSize: 16, fontWeight: '900', letterSpacing: 1, zIndex: 2 },
    }),
    s: StyleSheet.create({
        stepBlock: { width: '100%' },
    }),
    s1: StyleSheet.create({
        card: { flexDirection: 'row', alignItems: 'center', backgroundColor: TH.cardLight, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: TH.border },
        cardActive: { borderColor: TH.gold, backgroundColor: TH.warningBg }, // Slight tint
        iconBox: { width: 46, height: 46, borderRadius: 23, backgroundColor: TH.cardDark, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
        iconBoxActive: { backgroundColor: TH.goldMuted },
        title: { color: TH.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
        desc: { color: TH.textMuted, fontSize: 13, lineHeight: 18 },
        checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: TH.borderLight, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
        checkboxActive: { borderColor: TH.gold },
        checkInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: TH.gold },
    }),
    s2: StyleSheet.create({
        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
        squareCard: { width: (width - 40 - 12) / 2, aspectRatio: 1.2, backgroundColor: TH.cardLight, borderRadius: 16, borderWidth: 1, borderColor: TH.border, padding: 16, justifyContent: 'center', alignItems: 'center' },
        squareActive: { borderColor: TH.gold, backgroundColor: TH.warningBg, transform: [{ scale: 1.02 }] },
        sqTitle: { color: TH.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 6 },
        sqSub: { color: TH.textMuted, fontSize: 13, fontWeight: '500' },
        rowCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: TH.cardLight, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: TH.border },
        rowCardActive: { borderColor: TH.gold, backgroundColor: TH.warningBg },
        rowTitle: { color: TH.textPrimary, fontSize: 15, fontWeight: '700', flex: 1, marginLeft: 14 },
    }),
    s3: StyleSheet.create({
        radioWrap: { flexDirection: 'row', gap: 12 },
        radioCard: { flex: 1, backgroundColor: TH.cardLight, borderRadius: 18, borderWidth: 1, borderColor: TH.border, padding: 20, alignItems: 'flex-start' },
        radioActive: { borderColor: TH.gold, backgroundColor: TH.warningBg },
        radioTitle: { color: TH.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
        radioDesc: { color: TH.textMuted, fontSize: 12, lineHeight: 16 },
        rowCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: TH.cardLight, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: TH.border },
        rowTitle: { color: TH.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
        rowDesc: { color: TH.textMuted, fontSize: 13, lineHeight: 18 },
    }),
    s4: StyleSheet.create({
        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
        imgCard: { width: (width - 40 - 12) / 2, height: 210, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: TH.border },
        imgCardActive: { borderColor: TH.gold, borderWidth: 2 },
        checkBadge: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: TH.gold, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
        imgTextWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, zIndex: 5 },
        imgTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 4 },
        imgDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 16 },
        undecidedCard: { width: '100%', height: 110, borderRadius: 20, borderWidth: 1.5, borderColor: TH.border, borderStyle: 'dashed', backgroundColor: TH.cardDark, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
        undecidedActive: { borderColor: TH.gold, backgroundColor: TH.goldMuted },
        unTitle: { color: TH.textMuted, fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 2 },
        unSub: { color: TH.textMuted, fontSize: 13 },
    }),
    s5: StyleSheet.create({
        textAreaWrap: { position: 'relative' },
        locationBtn: {
            backgroundColor: TH.cardDark,
            padding: 18,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: TH.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        textArea: { height: 150, backgroundColor: TH.cardLight, borderRadius: 16, borderWidth: 1, borderColor: TH.border, color: TH.textPrimary, fontSize: 15, padding: 16, paddingRight: 50, textAlignVertical: 'top' },
        micBtn: { position: 'absolute', right: 12, bottom: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: TH.cardDark, alignItems: 'center', justifyContent: 'center' },
        accessory: { backgroundColor: TH.cardDark, padding: 12, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: TH.border },
        accessoryBtn: { color: TH.gold, fontSize: 16, fontWeight: '800', marginRight: 10 },
    })
});
`;

code += stylesDef;

// Hardcoded background colors in elements:
code = code.replace(/backgroundColor: '#1A1A1C'/g, "backgroundColor: TH.cardDark");
code = code.replace(/backgroundColor: '#222'/g, "backgroundColor: TH.cardLight");
code = code.replace(/borderColor: '#555'/g, "borderColor: TH.borderLight");

fs.writeFileSync('src/screens/Renovation/PaintDecorWizardScreen.js', code);
console.log('Done refactoring PaintDecorWizardScreen.js');
