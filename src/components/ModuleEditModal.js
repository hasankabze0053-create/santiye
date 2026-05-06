import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppAssetService } from '../services/AppAssetService';
import { COLORS, FONTS } from '../theme';

const ModuleEditModal = ({ visible, onClose, initialConfig, onSaveSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    const [config, setConfig] = useState({
        id: '',
        title: '',
        subtitle: '',
        screen_route: '',
        is_active: true
    });

    useEffect(() => {
        if (visible && initialConfig) {
            setConfig({
                id: initialConfig.id || '',
                title: initialConfig.title || '',
                subtitle: initialConfig.subtitle || '',
                screen_route: initialConfig.screen_route || '',
                is_active: initialConfig.is_active !== false
            });
        }
    }, [initialConfig, visible]);

    const handleSave = async () => {
        if (!config.id) return;
        setLoading(true);
        
        const updates = {
            title: config.title,
            subtitle: config.subtitle,
            is_active: config.is_active
        };

        const res = await AppAssetService.updateModuleConfig(config.id, updates);
        
        setLoading(false);
        if (res.success) {
            onSaveSuccess({ ...initialConfig, ...updates });
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
                        <Text style={styles.modalTitle}>Modül Düzenle</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={32} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Başlık</Text>
                        <TextInput 
                            style={styles.input} 
                            value={config.title}
                            onChangeText={t => setConfig(prev => ({...prev, title: t}))}
                            placeholderTextColor="#666"
                            placeholder="Örn: KENTSEL DÖNÜŞÜM"
                        />

                        <Text style={styles.label}>Alt Başlık / Açıklama</Text>
                        <TextInput 
                            style={styles.input} 
                            value={config.subtitle}
                            onChangeText={t => setConfig(prev => ({...prev, subtitle: t}))}
                            placeholderTextColor="#666"
                            placeholder="Örn: Devlet Destekli"
                        />

                        <View style={styles.switchContainer}>
                            <View>
                                <Text style={[styles.label, { marginTop: 0 }]}>Modül Görünürlüğü</Text>
                                <Text style={styles.helperText}>
                                    {config.is_active ? 'Kullanıcılar bu modülü görebilir' : 'Sadece yöneticiler silik olarak görebilir'}
                                </Text>
                            </View>
                            <Switch 
                                value={config.is_active}
                                onValueChange={v => setConfig(prev => ({...prev, is_active: v}))}
                                trackColor={{ false: '#3A3A3C', true: '#D4AF37' }}
                                thumbColor={config.is_active ? '#FFF' : '#AAA'}
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
    content: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, minHeight: 500 },
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

export default ModuleEditModal;
