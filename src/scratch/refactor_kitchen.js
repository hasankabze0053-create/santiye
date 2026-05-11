const fs = require('fs');

let code = fs.readFileSync('src/screens/Renovation/KitchenBathWizardScreen.js', 'utf8');

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
    warningBg: isDarkMode ? 'rgba(255, 215, 0, 0.08)' : 'rgba(184, 130, 15, 0.08)',
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
    /const UploadZone = \(\{ iconName, label, images, onPick, onRemove \}\) => \(/,
    "const UploadZone = ({ iconName, label, images, onPick, onRemove }) => {\n    const { theme, isDarkMode } = useTheme();\n    const TH = getTH(theme, isDarkMode);\n    const { uz } = useMemo(() => getStyles(TH), [TH]);\n    return ("
).replace(
    /<\/View>\n\);/,
    "    </View>\n    );\n};"
);

code = code.replace(
    /const CustomSlider = \(\{ label, value, min, max, onChange, suffix = 'm²' \}\) => \(/,
    "const CustomSlider = ({ label, value, min, max, onChange, suffix = 'm²' }) => {\n    const { theme, isDarkMode } = useTheme();\n    const TH = getTH(theme, isDarkMode);\n    const { slStyle } = useMemo(() => getStyles(TH), [TH]);\n    return ("
).replace(
    /<\/View>\n\);/,
    "    </View>\n    );\n};"
);

// 4. Update Main Component to use hooks
code = code.replace(
    /export default function KitchenBathWizardScreen\(\) \{/,
    "export default function KitchenBathWizardScreen() {\n    const { theme, isDarkMode } = useTheme();\n    const TH = useMemo(() => getTH(theme, isDarkMode), [theme, isDarkMode]);\n    const { styles, s, s1, s2, s3, s4, s5 } = useMemo(() => getStyles(TH), [TH]);\n"
);

// 5. Wrap all StyleSheet.create in getStyles
code = code.replace(
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
).replace(
    /const uz = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
).replace(
    /const slStyle = StyleSheet\.create\(\{[\s\S]*?\}\);\n*/g,
    ""
);

const stylesDef = `
const getStyles = (TH) => ({
    styles: StyleSheet.create({
        container: { flex: 1, backgroundColor: TH.bg },
        header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: TH.bg, zIndex: 10 },
        backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: TH.cardLight, alignItems: 'center', justifyContent: 'center' },
        progressWrap: { flex: 1, flexDirection: 'row', gap: 6, marginHorizontal: 16, height: 4 },
        progSeg: { flex: 1, height: '100%', borderRadius: 2, backgroundColor: TH.border },
        progSegActive: { backgroundColor: TH.gold },
        stepIndicator: { color: TH.textMuted, fontSize: 13, fontWeight: '700' },
        scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
        headerTitles: { marginBottom: 30 },
        mainTitle: { color: TH.textPrimary, fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.5 },
        subTitle: { color: TH.textMuted, fontSize: 14, marginTop: 8 },
        bottomBar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: TH.border, backgroundColor: TH.bg, gap: 12 },
        bottomBackBtn: { height: 56, paddingHorizontal: 24, borderRadius: 30, borderWidth: 1, borderColor: TH.borderLight, alignItems: 'center', justifyContent: 'center' },
        bottomBackText: { color: TH.textMuted, fontSize: 15, fontWeight: '600' },
        primaryBtn: { flex: 1, height: 56, borderRadius: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', overflow: 'hidden' },
        primaryBtnText: { color: '#1A1A1A', fontSize: 16, fontWeight: '900', letterSpacing: 1, zIndex: 2 },
    }),
    s: StyleSheet.create({
        stepBlock: { width: '100%' },
        rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
        rowTitle: { color: TH.textPrimary, fontSize: 18, fontWeight: '700' },
    }),
    s1: StyleSheet.create({
        card: { height: 160, borderRadius: 20, overflow: 'hidden', marginBottom: 16, borderWidth: 2, borderColor: 'transparent', backgroundColor: TH.cardLight },
        cardActive: { borderColor: TH.gold },
        contentWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, zIndex: 10 },
        title: { color: TH.textPrimary, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
        radio: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
        radioActive: { borderColor: TH.gold },
        radioInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: TH.gold },
    }),
    s2: StyleSheet.create({
        cardBlock: { backgroundColor: TH.cardLight, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: TH.borderLight },
        subLabel: { color: TH.textMuted, fontSize: 13, marginBottom: 10, fontWeight: '500' },
        pillWrap: { flexDirection: 'row', backgroundColor: TH.cardDark, borderRadius: 16, padding: 6, borderWidth: 1, borderColor: TH.borderLight },
        pillBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
        pillBtnActive: { backgroundColor: TH.textPrimary },
        pillText: { color: TH.textMuted, fontSize: 14, fontWeight: '600' },
        typeBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: TH.cardDark, borderWidth: 1, borderColor: TH.borderLight },
        typeBtnActive: { borderColor: TH.gold, backgroundColor: TH.warningBg },
        typeBtnText: { color: TH.textMuted, fontSize: 14, fontWeight: '600' },
        circRow: { flexDirection: 'row', gap: 14, marginBottom: 10 },
        circBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: TH.cardDark, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: TH.borderLight },
        circBtnActive: { borderColor: TH.gold, overflow: 'hidden' },
        circText: { color: TH.textMuted, fontSize: 16, fontWeight: '600' },
    }),
    s3: StyleSheet.create({
        scopeCard: { backgroundColor: TH.cardLight, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: TH.borderLight },
        scopeCardActive: { borderColor: TH.gold, backgroundColor: TH.warningBg },
        scopePrem: { borderColor: TH.gold, borderWidth: 1 },
        scopePremActive: { backgroundColor: TH.goldMuted },
        scopeRow: { flexDirection: 'row', alignItems: 'center' },
        scopeTitle: { color: TH.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
        scopeDesc: { color: TH.textMuted, fontSize: 13, lineHeight: 18 },
        ageWrap: { flexDirection: 'row', backgroundColor: TH.cardDark, borderRadius: 14, padding: 6, borderWidth: 1, borderColor: TH.borderLight },
        ageBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
        ageBtnActive: { backgroundColor: TH.textPrimary },
        ageText: { color: TH.textMuted, fontSize: 14, fontWeight: '600' },
    }),
    s4: StyleSheet.create({
        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
        imgCard: { width: (width - 40 - 12) / 2, height: 210, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
        imgCardActive: { borderColor: TH.gold },
        checkBadge: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: TH.gold, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
        imgTextWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, zIndex: 5 },
        imgTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 4 },
        imgDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 16 },
        unCard: { width: '100%', height: 110, borderRadius: 20, borderWidth: 1.5, borderColor: TH.border, borderStyle: 'dashed', backgroundColor: TH.cardDark, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
        unCardActive: { borderColor: TH.gold, backgroundColor: TH.goldMuted },
        unTitle: { color: TH.textMuted, fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 2 },
        unSub: { color: TH.textMuted, fontSize: 13 },
    }),
    s5: StyleSheet.create({
        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
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
        budgCard: { width: (width - 40 - 12) / 2, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: TH.border, backgroundColor: TH.cardLight, flexDirection: 'row', alignItems: 'center' },
        budgCardActive: { borderColor: TH.gold },
        budgTitle: { color: TH.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 2 },
        budgSub: { color: TH.textMuted, fontSize: 11 },
        textAreaWrap: { position: 'relative' },
        textArea: { height: 150, backgroundColor: TH.cardLight, borderRadius: 16, borderWidth: 1, borderColor: TH.border, color: TH.textPrimary, fontSize: 15, padding: 16, paddingRight: 50, textAlignVertical: 'top' },
        micBtn: { position: 'absolute', right: 12, bottom: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: TH.cardDark, alignItems: 'center', justifyContent: 'center' },
        accessory: { backgroundColor: TH.cardDark, padding: 12, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: TH.border },
        accessoryBtn: { color: TH.gold, fontSize: 16, fontWeight: '800', marginRight: 10 },
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
    slStyle: StyleSheet.create({
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: -4 },
        label: { color: TH.textMuted, fontSize: 14, fontWeight: '500' },
        valBadge: { backgroundColor: TH.goldMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: TH.gold },
        valText: { color: TH.gold, fontSize: 13, fontWeight: '700' },
        rangeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
        rangeText: { color: TH.textMuted, fontSize: 11 },
    })
});
`;

code += stylesDef;

// Hardcoded background colors in elements:
code = code.replace(/backgroundColor: '#111'/g, "backgroundColor: TH.cardDark");
code = code.replace(/backgroundColor: '#222'/g, "backgroundColor: TH.cardLight");
code = code.replace(/backgroundColor: '#1A1A1C'/g, "backgroundColor: TH.cardDark");
code = code.replace(/borderColor: '#444'/g, "borderColor: TH.borderLight");

fs.writeFileSync('src/screens/Renovation/KitchenBathWizardScreen.js', code);
console.log('Done refactoring KitchenBathWizardScreen.js');
