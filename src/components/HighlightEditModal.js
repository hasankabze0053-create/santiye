import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { AppAssetService } from '../services/AppAssetService';
import { COLORS, FONTS } from '../theme';

const THEMES = [
    { id: 'gold', name: 'Gold Premium', colors: { title: '#FFFFFF', pillsBorder: '#B8820F', pillsText: '#B8820F', buttonGradientStart: '#B8820F', buttonGradientEnd: '#8C6200' } },
    { id: 'platinum', name: 'Platin', colors: { title: '#FFFFFF', pillsBorder: '#E5E4E2', pillsText: '#E5E4E2', buttonGradientStart: '#B4B4B4', buttonGradientEnd: '#7A7A7A' } },
    { id: 'sapphire', name: 'Safir', colors: { title: '#FFFFFF', pillsBorder: '#42A5F5', pillsText: '#42A5F5', buttonGradientStart: '#1E88E5', buttonGradientEnd: '#0D47A1' } },
    { id: 'ruby', name: 'Yakut', colors: { title: '#FFFFFF', pillsBorder: '#EF5350', pillsText: '#EF5350', buttonGradientStart: '#E53935', buttonGradientEnd: '#B71C1C' } },
    { id: 'emerald', name: 'Zümrüt', colors: { title: '#FFFFFF', pillsBorder: '#66BB6A', pillsText: '#66BB6A', buttonGradientStart: '#43A047', buttonGradientEnd: '#1B5E20' } }
];

const MODULES = [
    { id: 'KentselDonusum', name: 'Kentsel Dönüşüm' },
    { id: 'Renovation', name: 'Tadilat & Mimari' },
    { id: 'Market', name: 'İnşaat Marketi' },
    { id: 'Hukuk', name: 'Hukuk Danışmanlığı' },
    { id: 'AsansorBakim', name: 'Asansör Bakım' },
    { id: 'GarajOtomasyon', name: 'Garaj Otomasyonu' },
    { id: 'RentalStack', name: 'Kiralama' },
    { id: 'TeknikOfis', name: 'Teknik Ofis' }
];

const HighlightEditModal = ({ visible, onClose, initialConfig, onSaveSuccess, type = 'urban' }) => {
    const isNew = type === 'new_card';
    const [activeTab, setActiveTab] = useState('content'); // content, visuals, layout, route
    const [loading, setLoading] = useState(false);

    const [config, setConfig] = useState({
        title: '',
        description: '',
        buttonText: 'Talep Oluştur',
        pills: [],
        type: isNew ? `custom_${Date.now()}` : type,
        linkedModule: 'KentselDonusum',
        image_dark: null,
        image_light: null,
        scale: 1,
        translateX: 20,
        translateY: 0,
        textAlignment: 'flex-start',
        textPositionVertical: 'center',
        themeColors: THEMES[0].colors,
        ...initialConfig
    });

    const [pillsInput, setPillsInput] = useState(config.pills ? config.pills.join(', ') : '');

    useEffect(() => {
        if (visible) {
            const mergedConfig = { ...config, ...initialConfig };
            setConfig(mergedConfig);
            setPillsInput(mergedConfig.pills ? mergedConfig.pills.join(', ') : '');
            setActiveTab('content');
        }
    }, [initialConfig, visible]);

    const handlePickImage = async (theme) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setLoading(true);
            try {
                const publicUrl = await AppAssetService.uploadHighlightImage(result.assets[0].uri, theme);
                if (publicUrl) {
                    setConfig(prev => ({ ...prev, [theme === 'dark' ? 'image_dark' : 'image_light']: publicUrl }));
                }
            } catch (error) {
                Alert.alert("Hata", "Resim yüklenemedi.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const finalPills = pillsInput.split(',').map(p => p.trim()).filter(p => p.length > 0);
        const finalConfig = { ...config, pills: finalPills };
        
        // If it's a new card, we pass isNew=true
        const targetType = isNew ? finalConfig.type : type;
        const res = await AppAssetService.updateHighlightConfig(targetType, finalConfig, isNew, 99); // sort_order 99 puts it at the end
        
        setLoading(false);
        if (res.success) {
            onSaveSuccess(finalConfig);
            onClose();
            Alert.alert("Başarılı", `Ayar kaydedildi.`);
        } else {
            Alert.alert("Hata", "Ayarlar kaydedilemedi.");
        }
    };

    const renderTabs = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {[
                { id: 'content', icon: 'text', label: 'İçerik' },
                { id: 'visuals', icon: 'image', label: 'Görsel & Tema' },
                { id: 'layout', icon: 'format-align-left', label: 'Hizalama' },
                { id: 'route', icon: 'link', label: 'Bağlantı' }
            ].map(tab => (
                <TouchableOpacity 
                    key={tab.id} 
                    style={[styles.tabBtn, activeTab === tab.id && styles.activeTabBtn]}
                    onPress={() => setActiveTab(tab.id)}
                >
                    <MaterialCommunityIcons name={tab.icon} size={20} color={activeTab === tab.id ? '#111' : '#D4AF37'} />
                    <Text style={[styles.tabText, activeTab === tab.id && { color: '#111' }]}>{tab.label}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{isNew ? 'Yeni Kart Ekle' : 'Kart Düzenle'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={32} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 60 }}>
                        {renderTabs()}
                    </View>

                    <ScrollView style={styles.scroll}>
                        
                        {activeTab === 'content' && (
                            <View style={styles.tabContainer}>
                                <Text style={styles.label}>Başlık (Büyük Yazı)</Text>
                                <TextInput 
                                    style={styles.input} 
                                    value={config.title}
                                    onChangeText={t => setConfig(prev => ({...prev, title: t}))}
                                    placeholderTextColor="#666"
                                    placeholder="Örn: LOJİSTİK"
                                />

                                <Text style={styles.label}>Açıklama Metni</Text>
                                <TextInput 
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                                    value={config.description}
                                    onChangeText={t => setConfig(prev => ({...prev, description: t}))}
                                    placeholderTextColor="#666"
                                    placeholder="Açıklama girin..."
                                    multiline
                                />

                                <Text style={styles.label}>Buton Metni</Text>
                                <TextInput 
                                    style={styles.input} 
                                    value={config.buttonText}
                                    onChangeText={t => setConfig(prev => ({...prev, buttonText: t}))}
                                    placeholderTextColor="#666"
                                    placeholder="Örn: Talep Oluştur"
                                />

                                <Text style={styles.label}>Etiketler (Virgülle Ayırın)</Text>
                                <TextInput 
                                    style={styles.input} 
                                    value={pillsInput}
                                    onChangeText={setPillsInput}
                                    placeholderTextColor="#666"
                                    placeholder="Örn: Kepçe, Kamyon, Vinç"
                                />
                            </View>
                        )}

                        {activeTab === 'visuals' && (
                            <View style={styles.tabContainer}>
                                <Text style={styles.sectionTitle}>FOTOĞRAF YÜKLE</Text>
                                <View style={styles.themeRow}>
                                    <TouchableOpacity style={[styles.imageBtn, { backgroundColor: '#111' }]} onPress={() => handlePickImage('dark')}>
                                        <MaterialCommunityIcons name="image-plus" size={24} color="#D4AF37" />
                                        <Text style={styles.imageBtnText}>Resim Seç</Text>
                                        {config.image_dark && <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" style={styles.check} />}
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.sectionTitle}>KADRAJ (BÜYÜTME & KAYDIRMA)</Text>
                                <View style={styles.sliderContainer}>
                                    <Text style={styles.sliderLabel}>Büyütme: {config.scale?.toFixed(2)}</Text>
                                    <Slider style={styles.slider} minimumValue={0.5} maximumValue={3} value={config.scale} onValueChange={v => setConfig(prev => ({ ...prev, scale: v }))} minimumTrackTintColor="#D4AF37" thumbTintColor="#D4AF37" />
                                </View>
                                <View style={styles.sliderContainer}>
                                    <Text style={styles.sliderLabel}>Yatay Kaydırma (X): {config.translateX?.toFixed(0)}</Text>
                                    <Slider style={styles.slider} minimumValue={-200} maximumValue={200} value={config.translateX} onValueChange={v => setConfig(prev => ({ ...prev, translateX: v }))} minimumTrackTintColor="#D4AF37" thumbTintColor="#D4AF37" />
                                </View>
                                <View style={styles.sliderContainer}>
                                    <Text style={styles.sliderLabel}>Dikey Kaydırma (Y): {config.translateY?.toFixed(0)}</Text>
                                    <Slider style={styles.slider} minimumValue={-200} maximumValue={200} value={config.translateY} onValueChange={v => setConfig(prev => ({ ...prev, translateY: v }))} minimumTrackTintColor="#D4AF37" thumbTintColor="#D4AF37" />
                                </View>

                                <Text style={styles.sectionTitle}>PREMIUM TEMA RENGİ</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                    {THEMES.map(theme => (
                                        <TouchableOpacity 
                                            key={theme.id}
                                            style={[styles.themeChip, config.themeColors?.pillsBorder === theme.colors.pillsBorder && styles.activeThemeChip]}
                                            onPress={() => setConfig(prev => ({ ...prev, themeColors: theme.colors }))}
                                        >
                                            <View style={[styles.colorDot, { backgroundColor: theme.colors.pillsBorder }]} />
                                            <Text style={[styles.themeChipText, config.themeColors?.pillsBorder === theme.colors.pillsBorder && { color: '#111' }]}>{theme.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {activeTab === 'layout' && (
                            <View style={styles.tabContainer}>
                                <Text style={styles.sectionTitle}>YATAY HİZALAMA (X EKSENİ)</Text>
                                <View style={styles.alignRow}>
                                    {['flex-start', 'center', 'flex-end'].map(align => (
                                        <TouchableOpacity 
                                            key={align}
                                            style={[styles.alignBtn, config.textAlignment === align && styles.activeAlignBtn]}
                                            onPress={() => setConfig(prev => ({ ...prev, textAlignment: align }))}
                                        >
                                            <MaterialCommunityIcons 
                                                name={align === 'flex-start' ? 'format-align-left' : align === 'center' ? 'format-align-center' : 'format-align-right'} 
                                                size={24} 
                                                color={config.textAlignment === align ? '#111' : '#D4AF37'} 
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.sectionTitle}>DİKEY HİZALAMA (Y EKSENİ)</Text>
                                <View style={styles.alignRow}>
                                    {['top', 'center', 'bottom'].map(align => (
                                        <TouchableOpacity 
                                            key={align}
                                            style={[styles.alignBtn, config.textPositionVertical === align && styles.activeAlignBtn]}
                                            onPress={() => setConfig(prev => ({ ...prev, textPositionVertical: align }))}
                                        >
                                            <MaterialCommunityIcons 
                                                name={align === 'top' ? 'format-align-top' : align === 'center' ? 'format-align-middle' : 'format-align-bottom'} 
                                                size={24} 
                                                color={config.textPositionVertical === align ? '#111' : '#D4AF37'} 
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {activeTab === 'route' && (
                            <View style={styles.tabContainer}>
                                <Text style={styles.sectionTitle}>BU KART HANGİ SAYFAYA GİDECEK?</Text>
                                <Text style={[styles.label, { marginBottom: 15, fontSize: 12 }]}>
                                    Kullanıcı bu sayfadan geri döndüğünde ana ekran otomatik olarak bu karta kayacaktır.
                                </Text>
                                
                                {MODULES.map(mod => (
                                    <TouchableOpacity 
                                        key={mod.id}
                                        style={[styles.moduleRow, config.linkedModule === mod.id && styles.activeModuleRow]}
                                        onPress={() => setConfig(prev => ({ ...prev, linkedModule: mod.id }))}
                                    >
                                        <MaterialCommunityIcons 
                                            name={config.linkedModule === mod.id ? "radiobox-marked" : "radiobox-blank"} 
                                            size={24} 
                                            color={config.linkedModule === mod.id ? "#D4AF37" : "#666"} 
                                        />
                                        <Text style={[styles.moduleText, config.linkedModule === mod.id && { color: '#FFF', fontFamily: FONTS.bold }]}>
                                            {mod.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                        <LinearGradient colors={['#D4AF37', '#8C6200']} style={styles.saveGradient}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>AYARLARI KAYDET</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    content: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '85%', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { color: '#D4AF37', fontSize: 20, fontFamily: FONTS.bold },
    scroll: { flex: 1, marginTop: 10 },
    tabsScroll: { flexDirection: 'row', marginBottom: 10 },
    tabBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D4AF37', marginRight: 10, height: 40 },
    activeTabBtn: { backgroundColor: '#D4AF37' },
    tabText: { color: '#D4AF37', fontFamily: FONTS.bold, marginLeft: 6, fontSize: 12 },
    tabContainer: { paddingBottom: 20 },
    label: { color: '#AAA', fontFamily: FONTS.bold, fontSize: 12, marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: '#2C2C2E', color: '#FFF', borderRadius: 12, padding: 15, fontFamily: FONTS.medium, fontSize: 14, borderWidth: 1, borderColor: '#3A3A3C' },
    sectionTitle: { color: '#888', fontSize: 12, fontFamily: FONTS.bold, marginTop: 25, marginBottom: 15, letterSpacing: 1 },
    themeRow: { flexDirection: 'row', gap: 15 },
    imageBtn: { flex: 1, height: 80, borderRadius: 15, justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 1, borderColor: '#333' },
    imageBtnText: { color: '#FFF', fontSize: 12, marginTop: 8, fontFamily: FONTS.medium },
    check: { position: 'absolute', top: 8, right: 8 },
    sliderContainer: { marginBottom: 15 },
    sliderLabel: { color: '#FFF', fontSize: 14, fontFamily: FONTS.medium, marginBottom: 5 },
    slider: { width: '100%', height: 40 },
    themeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333', backgroundColor: '#222' },
    activeThemeChip: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    themeChipText: { color: '#AAA', fontFamily: FONTS.bold, fontSize: 12 },
    alignRow: { flexDirection: 'row', gap: 15 },
    alignBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
    activeAlignBtn: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    moduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
    moduleText: { color: '#888', fontFamily: FONTS.medium, fontSize: 16, marginLeft: 15 },
    saveBtn: { marginTop: 10, borderRadius: 15, overflow: 'hidden' },
    saveGradient: { height: 55, justifyContent: 'center', alignItems: 'center' },
    saveText: { color: '#FFF', fontSize: 16, fontFamily: FONTS.bold }
});

export default HighlightEditModal;
