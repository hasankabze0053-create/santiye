import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator, Switch, ScrollView, Pressable, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppAssetService } from '../services/AppAssetService';
import { COLORS, FONTS } from '../theme';

const AVAILABLE_ROUTES = [
    { id: 'KentselDonusum', name: 'Kentsel Dönüşüm Ana' },
    { id: 'Tadilat', name: 'Tadilat & Mimari' },
    { id: 'MarketStack', name: 'İnşaat Marketi' },
    { id: 'Hukuk', name: 'Hukuk Danışmanlığı' },
    { id: 'ElevatorWizard', name: 'Asansör Bakım' },
    { id: 'RentalStack', name: 'Kiralama (Stack)' },
    { id: 'TeknikOfis', name: 'Teknik Ofis' },
    { id: '', name: 'Yönlendirme Yok' }
];

const CategoryChipEditModal = ({ visible, onClose, initialConfig, onSaveSuccess, onDeleteSuccess, type = 'edit' }) => {
    const isNew = type === 'new';
    const [loading, setLoading] = useState(false);
    
    const [config, setConfig] = useState({
        id: '',
        title: '',
        route: ''
    });

    useEffect(() => {
        if (visible) {
            if (isNew) {
                setConfig({
                    id: `category_chip_custom_${Date.now()}`,
                    title: '',
                    route: ''
                });
            } else if (initialConfig) {
                setConfig({
                    id: initialConfig.id || '',
                    title: initialConfig.title || '',
                    route: initialConfig.metadata?.route || ''
                });
            }
        }
    }, [initialConfig, visible, isNew]);

    const handleSave = async () => {
        if (!config.id || !config.title.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen bir başlık giriniz.");
            return;
        }
        setLoading(true);
        
        // AppAssetService.updateCategoryChip(id, title, route, isVisible, isNew = false, sortOrder = 10)
        const res = await AppAssetService.updateCategoryChip(
            config.id, 
            config.title, 
            config.route, 
            true, // Always visible now
            isNew, 
            99 // Default sort order for new ones
        );
        
        setLoading(false);
        if (res.success) {
            const updatedChip = {
                id: config.id,
                title: config.title,
                metadata: { route: config.route },
                is_visible: true,
                sort_order: isNew ? 99 : (initialConfig?.sort_order || 99)
            };
            onSaveSuccess(updatedChip, isNew);
            onClose();
        } else {
            Alert.alert("Hata", "Ayarlar kaydedilemedi.");
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Silme İşlemi",
            "Bu butonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
            [
                { text: "İptal", style: "cancel" },
                { 
                    text: "Sil", 
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        const res = await AppAssetService.deleteCategoryChip(config.id);
                        setLoading(false);
                        if (res.success) {
                            onDeleteSuccess(config.id);
                            onClose();
                        } else {
                            Alert.alert("Hata", "Silinemedi.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
                <KeyboardAwareScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
                    bounces={false}
                >
                    <View style={styles.panel}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>{isNew ? 'Yeni Buton Ekle' : 'Buton Düzenle'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={32} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Buton Başlığı (Yazısı)</Text>
                        <TextInput 
                            style={styles.input} 
                            value={config.title}
                            onChangeText={t => setConfig(prev => ({...prev, title: t}))}
                            placeholderTextColor="#666"
                            placeholder="Örn: İNŞAAT"
                        />

                        <Text style={styles.label}>Tıklanınca Gidilecek Sayfa</Text>
                        <View style={styles.routeContainer}>
                            {AVAILABLE_ROUTES.map(route => (
                                <TouchableOpacity 
                                    key={route.id}
                                    style={[styles.routeChip, config.route === route.id && styles.activeRouteChip]}
                                    onPress={() => setConfig(prev => ({...prev, route: route.id}))}
                                >
                                    <Text style={[styles.routeText, config.route === route.id && { color: '#111' }]}>
                                        {route.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                        <LinearGradient colors={['#D4AF37', '#8C6200']} style={styles.saveGradient}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>AYARLARI KAYDET</Text>}
                        </LinearGradient>
                    </TouchableOpacity>

                    {!isNew && (
                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={loading}>
                            <Text style={styles.deleteText}>BU BUTONU SİL</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAwareScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
    panel: { 
        flex: 1, 
        marginTop: Platform.OS === 'ios' ? 80 : 60,
        backgroundColor: '#1C1C1E', 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 0
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#D4AF37', fontSize: 20, fontFamily: FONTS.bold },
    scroll: { flex: 1 },
    label: { color: '#AAA', fontFamily: FONTS.bold, fontSize: 12, marginBottom: 8, marginTop: 15 },
    helperText: { color: '#666', fontSize: 10, fontFamily: FONTS.medium, marginTop: 4 },
    input: { backgroundColor: '#2C2C2E', color: '#FFF', borderRadius: 12, padding: 15, fontFamily: FONTS.medium, fontSize: 14, borderWidth: 1, borderColor: '#3A3A3C' },
    routeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
    routeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#3A3A3C', backgroundColor: '#2C2C2E' },
    activeRouteChip: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    routeText: { color: '#AAA', fontFamily: FONTS.medium, fontSize: 12 },
    saveBtn: { marginTop: 20, marginBottom: 15, borderRadius: 15, overflow: 'hidden' },
    saveGradient: { height: 55, justifyContent: 'center', alignItems: 'center' },
    saveText: { color: '#FFF', fontSize: 16, fontFamily: FONTS.bold },
    deleteBtn: { height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 15, borderWidth: 1, borderColor: '#FF3B30', backgroundColor: 'rgba(255,59,48,0.1)', marginBottom: 20 },
    deleteText: { color: '#FF3B30', fontSize: 16, fontFamily: FONTS.bold }
});

export default CategoryChipEditModal;
