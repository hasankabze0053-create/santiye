import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppAssetService } from '../services/AppAssetService';
import { COLORS, FONTS } from '../theme';

const AVAILABLE_ROUTES = [
    { id: 'KentselDonusum', name: 'Kentsel Dönüşüm Ana' },
    { id: 'Renovation', name: 'Tadilat & Mimari' },
    { id: 'Market', name: 'İnşaat Marketi' },
    { id: 'Hukuk', name: 'Hukuk Danışmanlığı' },
    { id: 'AsansorBakim', name: 'Asansör Bakım' },
    { id: 'RentalStack', name: 'Kiralama (Stack)' },
    { id: 'TeknikOfis', name: 'Teknik Ofis' },
    { id: '', name: 'Yönlendirme Yok' }
];

const CategoryChipEditModal = ({ visible, onClose, initialConfig, onSaveSuccess, type = 'edit' }) => {
    const isNew = type === 'new';
    const [loading, setLoading] = useState(false);
    
    const [config, setConfig] = useState({
        id: '',
        title: '',
        route: '',
        is_visible: true
    });

    useEffect(() => {
        if (visible) {
            if (isNew) {
                setConfig({
                    id: `category_chip_custom_${Date.now()}`,
                    title: '',
                    route: '',
                    is_visible: true
                });
            } else if (initialConfig) {
                setConfig({
                    id: initialConfig.id || '',
                    title: initialConfig.title || '',
                    route: initialConfig.metadata?.route || '',
                    is_visible: initialConfig.is_visible !== false
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
            config.is_visible, 
            isNew, 
            99 // Default sort order for new ones
        );
        
        setLoading(false);
        if (res.success) {
            const updatedChip = {
                id: config.id,
                title: config.title,
                metadata: { route: config.route },
                is_visible: config.is_visible,
                sort_order: isNew ? 99 : (initialConfig?.sort_order || 99)
            };
            onSaveSuccess(updatedChip, isNew);
            onClose();
        } else {
            Alert.alert("Hata", "Ayarlar kaydedilemedi.");
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>{isNew ? 'Yeni Buton Ekle' : 'Buton Düzenle'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={32} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
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

                        <View style={styles.switchContainer}>
                            <View>
                                <Text style={[styles.label, { marginTop: 0 }]}>Görünürlük</Text>
                                <Text style={styles.helperText}>
                                    {config.is_visible ? 'Kullanıcılar bu butonu görebilir' : 'Sadece yöneticiler silik olarak görebilir'}
                                </Text>
                            </View>
                            <Switch 
                                value={config.is_visible}
                                onValueChange={v => setConfig(prev => ({...prev, is_visible: v}))}
                                trackColor={{ false: '#3A3A3C', true: '#D4AF37' }}
                                thumbColor={config.is_visible ? '#FFF' : '#AAA'}
                            />
                        </View>
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
    content: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, minHeight: 450 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#D4AF37', fontSize: 20, fontFamily: FONTS.bold },
    form: { flex: 1 },
    label: { color: '#AAA', fontFamily: FONTS.bold, fontSize: 12, marginBottom: 8, marginTop: 15 },
    helperText: { color: '#666', fontSize: 10, fontFamily: FONTS.medium, marginTop: 4 },
    input: { backgroundColor: '#2C2C2E', color: '#FFF', borderRadius: 12, padding: 15, fontFamily: FONTS.medium, fontSize: 14, borderWidth: 1, borderColor: '#3A3A3C' },
    routeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
    routeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#3A3A3C', backgroundColor: '#2C2C2E' },
    activeRouteChip: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    routeText: { color: '#AAA', fontFamily: FONTS.medium, fontSize: 12 },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, backgroundColor: '#2C2C2E', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#3A3A3C' },
    saveBtn: { marginTop: 20, marginBottom: 20, borderRadius: 15, overflow: 'hidden' },
    saveGradient: { height: 55, justifyContent: 'center', alignItems: 'center' },
    saveText: { color: '#FFF', fontSize: 16, fontFamily: FONTS.bold }
});

export default CategoryChipEditModal;
