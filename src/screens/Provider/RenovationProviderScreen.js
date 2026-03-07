import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProviderScaffold, { GlassCard, SectionTitle, THEME } from '../../components/ProviderScaffold';
import { ConstructionService } from '../../services/ConstructionService';

// Mock Gallery Images
const PROJECT_IMGS = [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=200',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=200'
];

export default function RenovationProviderScreen() {
    const navigation = useNavigation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await ConstructionService.getOpenRequestsForArchitect();
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching architect requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderRequestItem = (item) => {
        const hasPhotos = item.document_urls && item.document_urls.length > 0;

        let projeTipi = 'Anahtar Teslim Tadilat';
        if (item.description && item.description.includes('PROJE TİPİ:')) {
            projeTipi = item.description.split('PROJE TİPİ:')[1].split('\n')[0].trim();
        }

        return (
            <View key={item.id} style={{ backgroundColor: '#161616', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A', padding: 16, marginBottom: 16, flexDirection: 'row', gap: 16 }}>
                {/* Left Avatar (Premium Solid Gradient-like or darker gold) */}
                <LinearGradient
                    colors={['#8C6A30', '#D4AF37', '#8C6A30']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text allowFontScaling={false} style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
                        {item.user_id ? item.user_id.substring(0,2).toUpperCase() : 'M'}
                    </Text>
                </LinearGradient>

                {/* Right Content */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    {/* Title */}
                    <Text allowFontScaling={false} style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, marginBottom: 12 }}>
                        {projeTipi}
                    </Text>

                    {/* Actions Area */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {hasPhotos && (
                            <TouchableOpacity 
                                style={{ borderWidth: 1, borderColor: '#3A3A3C', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'center' }}
                                onPress={() => navigation.navigate('ArchitectRequestDetail', { request: item })}
                            >
                                <Text allowFontScaling={false} style={{ color: '#E5E5EA', fontSize: 13 }}>Fotoğraflar</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={{ flex: 1 }}
                            onPress={() => navigation.navigate('ArchitectRequestDetail', { request: item })}
                        >
                            <LinearGradient
                                colors={['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={{ borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', flex: 1 }}
                            >
                                <Text allowFontScaling={false} style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>Talebi İncele</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ProviderScaffold title="Mimar Ofisi">

            {/* 1. PROJECT GALLERY */}
            <SectionTitle title="PROJE GALERİSİ" actionText="Düzenle" />
            <GlassCard>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity style={styles.addBtn}>
                        <Ionicons name="add" size={32} color="#666" />
                        <Text allowFontScaling={false} style={{ color: '#666', fontSize: 10, marginTop: 4 }}>Yükle</Text>
                    </TouchableOpacity>
                    {PROJECT_IMGS.map((uri, idx) => (
                        <Image key={idx} source={{ uri }} style={styles.galleryImg} />
                    ))}
                </ScrollView>
                <View style={styles.statsRow}>
                    <Text allowFontScaling={false} style={styles.statText}>12 Aktif Proje</Text>
                    <Text allowFontScaling={false} style={styles.statText}>4.8 ★ Puan</Text>
                </View>
            </GlassCard>

            {/* 2. DESIGN REQUESTS */}
            <SectionTitle title="TASARIM TALEPLERİ" actionText={`Tümü (${requests.length})`} />
            
            <View style={{ marginTop: 8 }}>
                {loading ? (
                    <ActivityIndicator size="small" color="#FFD700" style={{ padding: 20 }} />
                ) : requests.length > 0 ? (
                    requests.map(req => renderRequestItem(req))
                ) : (
                    <Text allowFontScaling={false} style={{ color: '#666', textAlign: 'center', marginVertical: 20 }}>Henüz aktif talep bulunmuyor.</Text>
                )}
            </View>

            {/* 3. TIMELINE */}
            <SectionTitle title="PROJE TAKVİMİ" />
            <GlassCard>
                <View style={styles.timelineRow}>
                    <View style={styles.timelineDotActive} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text allowFontScaling={false} style={styles.timelineTime}>Bugün, 14:00</Text>
                        <Text allowFontScaling={false} style={styles.timelineTitle}>Kadiköy Villa - Keşif Randevusu</Text>
                    </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineRow}>
                    <View style={styles.timelineDot} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text allowFontScaling={false} style={styles.timelineTime}>Yarın, 10:00</Text>
                        <Text allowFontScaling={false} style={styles.timelineTitle}>Maltepe Ofis - Proje Teslimi</Text>
                    </View>
                </View>
            </GlassCard>

        </ProviderScaffold>
    );
}

const styles = StyleSheet.create({
    addBtn: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    galleryImg: { width: 80, height: 80, borderRadius: 12, marginRight: 10 },
    statsRow: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#27272a' },
    statText: { color: '#ccc', fontSize: 12, fontWeight: '600' },

    // Request
    requestItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
    userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center' },
    reqHeader: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    reqBody: { color: '#888', fontSize: 12, marginTop: 2 },
    outlineBtn: { borderWidth: 1, borderColor: '#444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    outlineBtnText: { color: '#ccc', fontSize: 11 },
    fillBtn: { backgroundColor: THEME.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    fillBtnText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#27272a', marginVertical: 16 },

    // Timeline
    timelineRow: { flexDirection: 'row', alignItems: 'center' },
    timelineDotActive: { width: 12, height: 12, borderRadius: 6, backgroundColor: THEME.accent, borderWidth: 2, borderColor: 'rgba(255, 215, 0, 0.3)' },
    timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#444' },
    timelineLine: { height: 20, width: 2, backgroundColor: '#333', marginLeft: 5, marginVertical: 4 },
    timelineTime: { color: THEME.accent, fontSize: 11, fontWeight: 'bold' },
    timelineTitle: { color: '#fff', fontSize: 13 }
});
