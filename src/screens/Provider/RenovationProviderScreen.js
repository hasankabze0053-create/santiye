import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProviderScaffold, { GlassCard, SectionTitle, THEME } from '../../components/ProviderScaffold';

// Mock Gallery Images
const PROJECT_IMGS = [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=200',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=200'
];

export default function RenovationProviderScreen() {
    return (
        <ProviderScaffold title="Mimar Ofisi">

            {/* 1. PROJECT GALLERY */}
            <SectionTitle title="PROJE GALERİSİ" actionText="Düzenle" />
            <GlassCard>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity style={styles.addBtn}>
                        <Ionicons name="add" size={32} color="#666" />
                        <Text style={{ color: '#666', fontSize: 10, marginTop: 4 }}>Yükle</Text>
                    </TouchableOpacity>
                    {PROJECT_IMGS.map((uri, idx) => (
                        <Image key={idx} source={{ uri }} style={styles.galleryImg} />
                    ))}
                </ScrollView>
                <View style={styles.statsRow}>
                    <Text style={styles.statText}>12 Aktif Proje</Text>
                    <Text style={styles.statText}>4.8 ★ Puan</Text>
                </View>
            </GlassCard>

            {/* 2. DESIGN REQUESTS */}
            <SectionTitle title="TASARIM TALEPLERİ" actionText="Tümü (5)" />

            <GlassCard>
                {/* Req 1 */}
                <View style={styles.requestItem}>
                    <View style={styles.userAvatar}>
                        <Text style={{ color: '#000', fontWeight: 'bold' }}>AH</Text>
                    </View>
                    <View style={{ flex: 1, paddingLeft: 12 }}>
                        <Text style={styles.reqHeader}>Ali H. - Salon Yenileme</Text>
                        <Text style={styles.reqBody}>35m² • Modern Stil • Bütçe: 150k</Text>
                        <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                            <TouchableOpacity style={styles.outlineBtn}>
                                <Text style={styles.outlineBtnText}>Fotoğraflar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.fillBtn}>
                                <Text style={styles.fillBtnText}>Teklif Ver</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Req 2 */}
                <View style={styles.requestItem}>
                    <View style={styles.userAvatar}>
                        <Text style={{ color: '#000', fontWeight: 'bold' }}>ZS</Text>
                    </View>
                    <View style={{ flex: 1, paddingLeft: 12 }}>
                        <Text style={styles.reqHeader}>Zeynep S. - Mutfak Tadilatı</Text>
                        <Text style={styles.reqBody}>12m² • Country Stil • Bütçe: 80k</Text>
                        <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                            <TouchableOpacity style={styles.outlineBtn}>
                                <Text style={styles.outlineBtnText}>Fotoğraflar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.fillBtn}>
                                <Text style={styles.fillBtnText}>Teklif Ver</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </GlassCard>

            {/* 3. TIMELINE */}
            <SectionTitle title="PROJE TAKVİMİ" />
            <GlassCard>
                <View style={styles.timelineRow}>
                    <View style={styles.timelineDotActive} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.timelineTime}>Bugün, 14:00</Text>
                        <Text style={styles.timelineTitle}>Kadiköy Villa - Keşif Randevusu</Text>
                    </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineRow}>
                    <View style={styles.timelineDot} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.timelineTime}>Yarın, 10:00</Text>
                        <Text style={styles.timelineTitle}>Maltepe Ofis - Proje Teslimi</Text>
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
