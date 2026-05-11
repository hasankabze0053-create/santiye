import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, TextInput, Pressable, Keyboard,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { AppAssetService } from '../services/AppAssetService';
import { FONTS } from '../theme';

const THEMES = [
    { id: 'gold', name: 'Gold Premium', colors: { title: '#FFFFFF', pillsBorder: '#B8820F', pillsText: '#B8820F', buttonGradientStart: '#B8820F', buttonGradientEnd: '#8C6200' } },
    { id: 'platinum', name: 'Platin', colors: { title: '#FFFFFF', pillsBorder: '#E5E4E2', pillsText: '#E5E4E2', buttonGradientStart: '#B4B4B4', buttonGradientEnd: '#7A7A7A' } },
    { id: 'sapphire', name: 'Safir', colors: { title: '#FFFFFF', pillsBorder: '#42A5F5', pillsText: '#42A5F5', buttonGradientStart: '#1E88E5', buttonGradientEnd: '#0D47A1' } },
    { id: 'ruby', name: 'Yakut', colors: { title: '#FFFFFF', pillsBorder: '#EF5350', pillsText: '#EF5350', buttonGradientStart: '#E53935', buttonGradientEnd: '#B71C1C' } },
    { id: 'emerald', name: 'Zümrüt', colors: { title: '#FFFFFF', pillsBorder: '#66BB6A', pillsText: '#66BB6A', buttonGradientStart: '#43A047', buttonGradientEnd: '#1B5E20' } }
];

const MODULES = [
    { id: 'KentselDonusum', name: 'Kentsel Dönüşüm' },
    { id: 'Tadilat', name: 'Tadilat & Mimari' },
    { id: 'MarketStack', name: 'İnşaat Marketi' },
    { id: 'Hukuk', name: 'Hukuk Danışmanlığı' },
    { id: 'ElevatorWizard', name: 'Asansör Bakım' },
    { id: 'GarageWizard', name: 'Garaj Otomasyonu' },
    { id: 'RentalStack', name: 'Kiralama' },
    { id: 'TeknikOfis', name: 'Teknik Ofis' }
];

const splitTitle = (title) => {
    if (!title) return { title1: '', title2: '' };
    const parts = title.trim().split(' ');
    if (parts.length === 1) return { title1: '', title2: parts[0] };
    return { title1: parts[0], title2: parts.slice(1).join(' ') };
};

const DEFAULT = {
    title1: '', title2: '', description: '', buttonText: 'Talep Oluştur',
    pills: [], linkedModule: 'KentselDonusum',
    image_dark: null, image_light: null,
    scale: 1, translateX: 20, translateY: 0,
    descTranslateX: 0, descTranslateY: 0,
    pillsTranslateX: 0, pillsTranslateY: 0,
    textAlignment: 'flex-start', textPositionVertical: 'center',
    themeColors: THEMES[0].colors,
};

export default function HighlightEditModal({ visible, onClose, initialConfig, onSaveSuccess, type = 'urban' }) {
    const isNew = type === 'new_card';
    const [activeTab, setActiveTab] = useState('content');
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState(DEFAULT);
    const [pillsInput, setPillsInput] = useState('');

    useEffect(() => {
        if (!visible) return;
        setActiveTab('content');
        const base = { ...DEFAULT, ...initialConfig };
        if (!base.title1 && !base.title2 && base.title) {
            const { title1, title2 } = splitTitle(base.title);
            base.title1 = title1;
            base.title2 = title2;
        }
        if (!Array.isArray(base.pills)) base.pills = [];
        setConfig(base);
        setPillsInput(base.pills.join(', '));
    }, [initialConfig, visible]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [16, 9], quality: 0.8,
        });
        if (!result.canceled) {
            setLoading(true);
            try {
                const url = await AppAssetService.uploadHighlightImage(result.assets[0].uri, 'dark');
                if (url) setConfig(prev => ({ ...prev, image_dark: url }));
            } catch { Alert.alert('Hata', 'Resim yüklenemedi.'); }
            finally { setLoading(false); }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const finalPills = pillsInput.split(',').map(p => p.trim()).filter(Boolean);
        const finalConfig = { ...config, pills: finalPills, type: isNew ? (config.type || `custom_${Date.now()}`) : type };
        const res = await AppAssetService.updateHighlightConfig(isNew ? finalConfig.type : type, finalConfig, isNew, 99);
        setLoading(false);
        if (res.success) { onSaveSuccess(finalConfig); onClose(); Alert.alert('Başarılı', 'Kaydedildi.'); }
        else Alert.alert('Hata', 'Kaydedilemedi.');
    };

    const TABS = [
        { id: 'content', icon: 'text', label: 'İçerik' },
        { id: 'visuals', icon: 'image', label: 'Görsel & Tema' },
        { id: 'layout', icon: 'format-align-left', label: 'Hizalama' },
        { id: 'route', icon: 'link', label: 'Bağlantı' },
    ];

    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <View style={s.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                
                {/* Panel */}
                <View style={s.panel}>

                    {/* ── Header ── */}
                    <View style={s.header}>
                        <Text style={s.title}>{isNew ? 'Yeni Kart Ekle' : 'Kart Düzenle'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={32} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* ── Tabs ── */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 52, flexGrow: 0 }}>
                        {TABS.map(tab => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[s.tabBtn, activeTab === tab.id && s.activeTabBtn]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <MaterialCommunityIcons name={tab.icon} size={18} color={activeTab === tab.id ? '#111' : '#D4AF37'} />
                                <Text style={[s.tabText, activeTab === tab.id && { color: '#111' }]}>{tab.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* ── Tab Content (scrollable) ── */}
                    <ScrollView
                        style={s.scroll}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* CONTENT TAB */}
                        {activeTab === 'content' && (
                            <View>
                                <Text style={s.label}>Başlık 1. Satır (Açık Renk)</Text>
                                <TextInput style={s.input} value={config.title1} onChangeText={t => setConfig(p => ({ ...p, title1: t }))} placeholderTextColor="#555" placeholder="Örn: İNŞAAT" returnKeyType="next" />

                                <Text style={s.label}>Başlık 2. Satır (Altın Renk)</Text>
                                <TextInput style={s.input} value={config.title2} onChangeText={t => setConfig(p => ({ ...p, title2: t }))} placeholderTextColor="#555" placeholder="Örn: MARKETİ" returnKeyType="next" />

                                <Text style={s.label}>Açıklama Metni</Text>
                                <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={config.description} onChangeText={t => setConfig(p => ({ ...p, description: t }))} placeholderTextColor="#555" placeholder="Açıklama girin..." multiline />

                                <Text style={s.label}>Buton Metni</Text>
                                <TextInput style={s.input} value={config.buttonText} onChangeText={t => setConfig(p => ({ ...p, buttonText: t }))} placeholderTextColor="#555" placeholder="Örn: Talep Oluştur" returnKeyType="next" />

                                <Text style={s.label}>Etiketler (Virgülle Ayırın)</Text>
                                <TextInput style={s.input} value={pillsInput} onChangeText={setPillsInput} placeholderTextColor="#555" placeholder="Örn: Kepçe, Kamyon" returnKeyType="done" />
                            </View>
                        )}

                        {/* VISUALS TAB */}
                        {activeTab === 'visuals' && (
                            <View>
                                <Text style={s.sectionTitle}>FOTOĞRAF YÜKLE</Text>
                                <TouchableOpacity style={s.imageBtn} onPress={handlePickImage}>
                                    <MaterialCommunityIcons name="image-plus" size={24} color="#D4AF37" />
                                    <Text style={s.imageBtnText}>Resim Seç</Text>
                                    {config.image_dark && <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" style={s.check} />}
                                </TouchableOpacity>

                                <Text style={s.sectionTitle}>KADRAJ</Text>
                                {[
                                    { label: 'Büyütme', key: 'scale', min: 0.5, max: 3, fixed: 2 },
                                    { label: 'Yatay (X)', key: 'translateX', min: -200, max: 200, fixed: 0 },
                                    { label: 'Dikey (Y)', key: 'translateY', min: -200, max: 200, fixed: 0 },
                                ].map(item => (
                                    <View key={item.key} style={s.sliderWrap}>
                                        <Text style={s.sliderLabel}>{item.label}: {(config[item.key] || 0).toFixed(item.fixed)}</Text>
                                        <Slider style={s.slider} minimumValue={item.min} maximumValue={item.max} value={config[item.key] || 0} onValueChange={v => setConfig(p => ({ ...p, [item.key]: v }))} minimumTrackTintColor="#D4AF37" thumbTintColor="#D4AF37" />
                                    </View>
                                ))}

                                <Text style={s.sectionTitle}>TEMA RENKLERİ</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                    {THEMES.map(theme => (
                                        <TouchableOpacity
                                            key={theme.id}
                                            style={[s.themeChip, config.themeColors?.pillsBorder === theme.colors.pillsBorder && s.activeThemeChip]}
                                            onPress={() => setConfig(p => ({ ...p, themeColors: theme.colors }))}
                                        >
                                            <View style={[s.colorDot, { backgroundColor: theme.colors.pillsBorder }]} />
                                            <Text style={[s.themeChipText, config.themeColors?.pillsBorder === theme.colors.pillsBorder && { color: '#111' }]}>{theme.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[s.label, { marginTop: 20 }]}>Özel Renk Girdileri</Text>
                                <View style={{ gap: 10 }}>
                                    <TextInput style={s.input} placeholder="Açıklama rengi (#888)" placeholderTextColor="#555" value={config.themeColors?.descText || ''} onChangeText={t => setConfig(p => ({ ...p, themeColors: { ...p.themeColors, descText: t } }))} />
                                    <TextInput style={s.input} placeholder="Pill arka plan rengi" placeholderTextColor="#555" value={config.themeColors?.pillsBg || ''} onChangeText={t => setConfig(p => ({ ...p, themeColors: { ...p.themeColors, pillsBg: t } }))} />
                                    <TextInput style={s.input} placeholder="Bilgi ikonu rengi (#8A7A65)" placeholderTextColor="#555" value={config.themeColors?.infoText || ''} onChangeText={t => setConfig(p => ({ ...p, themeColors: { ...p.themeColors, infoText: t } }))} />
                                </View>
                            </View>
                        )}

                        {/* LAYOUT TAB */}
                        {activeTab === 'layout' && (
                            <View>
                                <Text style={s.sectionTitle}>YATAY HİZALAMA</Text>
                                <View style={s.alignRow}>
                                    {['flex-start', 'center', 'flex-end'].map(align => (
                                        <TouchableOpacity key={align} style={[s.alignBtn, config.textAlignment === align && s.activeAlignBtn]} onPress={() => setConfig(p => ({ ...p, textAlignment: align }))}>
                                            <MaterialCommunityIcons name={align === 'flex-start' ? 'format-align-left' : align === 'center' ? 'format-align-center' : 'format-align-right'} size={24} color={config.textAlignment === align ? '#111' : '#D4AF37'} />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={s.sectionTitle}>DİKEY HİZALAMA</Text>
                                <View style={s.alignRow}>
                                    {['top', 'center', 'bottom'].map(align => (
                                        <TouchableOpacity key={align} style={[s.alignBtn, config.textPositionVertical === align && s.activeAlignBtn]} onPress={() => setConfig(p => ({ ...p, textPositionVertical: align }))}>
                                            <MaterialCommunityIcons name={align === 'top' ? 'format-align-top' : align === 'center' ? 'format-align-middle' : 'format-align-bottom'} size={24} color={config.textPositionVertical === align ? '#111' : '#D4AF37'} />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[s.sectionTitle, { marginTop: 30 }]}>HASSAS KONUMLANDIRMA</Text>
                                {[
                                    { label: 'Açıklama X', key: 'descTranslateX', min: -200, max: 200 },
                                    { label: 'Açıklama Y', key: 'descTranslateY', min: -150, max: 150 },
                                    { label: 'Etiketler X', key: 'pillsTranslateX', min: -200, max: 200 },
                                    { label: 'Etiketler Y', key: 'pillsTranslateY', min: -150, max: 150 },
                                ].map(item => (
                                    <View key={item.key} style={s.sliderWrap}>
                                        <Text style={s.sliderLabel}>{item.label}: {(config[item.key] || 0).toFixed(0)}</Text>
                                        <Slider style={s.slider} minimumValue={item.min} maximumValue={item.max} value={config[item.key] || 0} onValueChange={v => setConfig(p => ({ ...p, [item.key]: v }))} minimumTrackTintColor="#D4AF37" thumbTintColor="#D4AF37" />
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* ROUTE TAB */}
                        {activeTab === 'route' && (
                            <View>
                                <Text style={s.sectionTitle}>BU KART HANGİ SAYFAYA GİDECEK?</Text>
                                <Text style={[s.label, { marginBottom: 15 }]}>Kullanıcı geri döndüğünde ana ekran bu karta kayacaktır.</Text>
                                {MODULES.map(mod => (
                                    <TouchableOpacity key={mod.id} style={[s.moduleRow, config.linkedModule === mod.id && s.activeModuleRow]} onPress={() => setConfig(p => ({ ...p, linkedModule: mod.id }))}>
                                        <MaterialCommunityIcons name={config.linkedModule === mod.id ? 'radiobox-marked' : 'radiobox-blank'} size={24} color={config.linkedModule === mod.id ? '#D4AF37' : '#666'} />
                                        <Text style={[s.moduleText, config.linkedModule === mod.id && { color: '#FFF', fontFamily: FONTS.bold }]}>{mod.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {/* ── Save Button ── */}
                    <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading}>
                        <LinearGradient colors={['#D4AF37', '#8C6200']} style={s.saveGradient}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.saveText}>AYARLARI KAYDET</Text>}
                        </LinearGradient>
                    </TouchableOpacity>

                </View>
            </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' },
    panel: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 80 : 60,
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 0,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { color: '#D4AF37', fontSize: 20, fontFamily: FONTS.bold },
    scroll: { flex: 1 },
    tabBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#D4AF37', marginRight: 10, height: 38 },
    activeTabBtn: { backgroundColor: '#D4AF37' },
    tabText: { color: '#D4AF37', fontFamily: FONTS.bold, marginLeft: 5, fontSize: 12 },
    label: { color: '#AAA', fontFamily: FONTS.bold, fontSize: 12, marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: '#2C2C2E', color: '#FFF', borderRadius: 12, padding: 14, fontFamily: FONTS.medium, fontSize: 14, borderWidth: 1, borderColor: '#3A3A3C' },
    sectionTitle: { color: '#888', fontSize: 12, fontFamily: FONTS.bold, marginTop: 25, marginBottom: 12, letterSpacing: 1 },
    imageBtn: { height: 80, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333', backgroundColor: '#111' },
    imageBtnText: { color: '#FFF', fontSize: 12, marginTop: 6, fontFamily: FONTS.medium },
    check: { position: 'absolute', top: 8, right: 8 },
    sliderWrap: { marginBottom: 14 },
    sliderLabel: { color: '#FFF', fontSize: 13, fontFamily: FONTS.medium, marginBottom: 4 },
    slider: { width: '100%', height: 40 },
    themeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333', backgroundColor: '#222' },
    activeThemeChip: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    themeChipText: { color: '#AAA', fontFamily: FONTS.bold, fontSize: 12 },
    alignRow: { flexDirection: 'row', gap: 15, marginBottom: 10 },
    alignBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
    activeAlignBtn: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    moduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
    activeModuleRow: { borderBottomColor: '#D4AF3740' },
    moduleText: { color: '#888', fontFamily: FONTS.medium, fontSize: 15, marginLeft: 14 },
    saveBtn: { marginTop: 12, marginBottom: 28, borderRadius: 15, overflow: 'hidden' },
    saveGradient: { height: 54, justifyContent: 'center', alignItems: 'center' },
    saveText: { color: '#FFF', fontSize: 16, fontFamily: FONTS.bold },
});
