import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ArchitectRequestDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};

    const [selectedImage, setSelectedImage] = useState(null);

    if (!request) return null;

    let tadilatDetails = { propertyType: '-', areaSize: '-', style: '-' };
    let budget = '-';
    let urgency = 'Detaylarda Gizli';
    let notes = '-';
    let operations = [];

    let projeTipi = 'Anahtar Teslim Tadilat';
    let iconName = 'home-edit';

    if (request?.description) {
        const lines = request.description.split('\n');
        const tipLine = lines.find(l => l.startsWith('PROJE TİPİ:'));
        if (tipLine) {
            projeTipi = tipLine.replace('PROJE TİPİ:', '').trim();
            if (projeTipi.includes('Boya')) iconName = 'format-paint';
            else if (projeTipi.includes('Mutfak') || projeTipi.includes('Banyo')) iconName = 'water-pump';
        }
        const budgetLine = lines.find(l => l.startsWith('BÜTÇE:'));
        if (budgetLine) budget = budgetLine.replace('BÜTÇE:', '').trim();

        const yenilemeLine = lines.find(l => l.startsWith('YENİLEME:'));
        if (yenilemeLine) urgency = yenilemeLine.replace('YENİLEME:', '').trim();

        const mekanLine = lines.find(l => l.startsWith('MEKAN:'));
        if (mekanLine) {
            const mekanPart = mekanLine.replace('MEKAN:', '').trim();
            tadilatDetails.propertyType = mekanPart;
            const matchSq = mekanPart.match(/(\d+)\s*m²/g);
            if (matchSq && matchSq.length > 0) {
                let sum = 0;
                matchSq.forEach(m => {
                    const num = parseInt(m.replace(/[^0-9]/g, ''));
                    if (!isNaN(num)) sum += num;
                });
                tadilatDetails.areaSize = `${sum} m²`;
            } else {
                tadilatDetails.areaSize = '-';
            }
        }

        const tarzLine = lines.find(l => l.startsWith('TARZ:'));
        if (tarzLine) tadilatDetails.style = tarzLine.replace('TARZ:', '').trim();

        const notIndex = lines.findIndex(l => l.startsWith('NOT:'));
        if (notIndex !== -1) notes = lines.slice(notIndex + 1).join('\n').trim();
        else notes = 'Ek not bulunmuyor.';

        const scopeLine = lines.find(l => l.startsWith('KAPSAM:'));
        const scopeText = scopeLine ? scopeLine.toLowerCase() : '';
        const yenilemeText = yenilemeLine ? yenilemeLine.toLowerCase() : '';

        if (scopeText.includes('mutfak')) {
            operations.push('Mutfak Dolabı & Tezgah');
            if (yenilemeText.includes('kapsamlı') || yenilemeText.includes('premium')) operations.push('Mutfak Tesisat Yenileme');
        }
        if (scopeText.includes('banyo')) {
            operations.push('Banyo Dolabı & Vitrifiye');
            operations.push('Duşakabin / Küvet Değişimi');
            if (yenilemeText.includes('kapsamlı') || yenilemeText.includes('premium')) operations.push('Banyo Tesisat & Gider Yenileme');
        }
        if (yenilemeText.includes('kapsamlı') || yenilemeText.includes('premium')) {
            operations.push('Zemin Seramiği / Parke Yenileme');
            operations.push('Kırım & Hafriyat İşleri');
        }
        if (projeTipi.includes('Boya')) {
            operations.push('İç Cephe Boya Badana');
            operations.push('Alçı / Sıva Tamiratı');
        }
        if (operations.length === 0) operations.push('Genel Tadilat / Dekorasyon');
    }

    const hasPhotos = request.document_urls && request.document_urls.length > 0;
    const locationText = request.district && request.district !== 'Tümü' ? `${request.district}, ${request.city}` : (request.city || 'Türkiye Geneli');

    let styleIcons = [];
    const styleString = tadilatDetails.style.toLowerCase();
    if (styleString.includes('modern')) styleIcons.push({ icon: 'sofa-outline', label: 'Modern' });
    if (styleString.includes('rustik') || styleString.includes('doğal')) styleIcons.push({ icon: 'leaf', label: 'Rustik/Doğal' });
    if (styleString.includes('klasik')) styleIcons.push({ icon: 'chandelier', label: 'Klasik' });
    if (styleString.includes('endüstriyel') || styleString.includes('loft')) styleIcons.push({ icon: 'factory', label: 'Endüstriyel' });
    if (styleIcons.length === 0) styleIcons.push({ icon: 'palette-outline', label: 'Özel' });
    if (styleIcons.length > 2) styleIcons = styleIcons.slice(0, 2);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>
                
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text allowFontScaling={false} style={styles.headerTitle}>PROJE DETAYI</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={request?.offer_type === 'anahtar_teslim_tadilat' ? { paddingBottom: 150, paddingHorizontal: 20 } : styles.content} showsVerticalScrollIndicator={false}>
                    {request?.offer_type === 'anahtar_teslim_tadilat' ? (
                        <>
                            {/* 1. Dynamic Summary Card */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 24, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#2A2A2A' }}>
                                <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 4 }}>
                                    <Ionicons name="location-outline" size={24} color="#FFD700" />
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: 'bold' }} numberOfLines={2}>{locationText}</Text>
                                </View>
                                <View style={{ width: 1, backgroundColor: '#2A2A2A' }} />
                                <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 4 }}>
                                    <MaterialCommunityIcons name="wallet-outline" size={24} color="#FFD700" />
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: 'bold' }}>Tahmini Bütçe:{'\n'}{budget}</Text>
                                </View>
                                <View style={{ width: 1, backgroundColor: '#2A2A2A' }} />
                                <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 4 }}>
                                    <MaterialCommunityIcons name="home-search-outline" size={24} color="#FFD700" />
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 11, marginTop: 8, textAlign: 'center', fontWeight: 'bold' }} numberOfLines={3}>{urgency}</Text>
                                </View>
                            </View>

                            {/* 2. Görsel Galeri ve Medya */}
                            <View style={{ marginBottom: 24 }}>
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Kullanıcı Fotoğrafları & Mevcut Görünüm</Text>
                                {hasPhotos ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                        {request.document_urls.map((url, idx) => (
                                            <View key={idx} style={{ width: 120 }}>
                                                <TouchableOpacity onPress={() => setSelectedImage(url)}>
                                                    <Image source={{ uri: url }} style={{ width: 120, height: 120, borderRadius: 12, borderWidth: 1, borderColor: '#333' }} />
                                                </TouchableOpacity>
                                                <Text allowFontScaling={false} style={{ color: '#A0A0A0', fontSize: 12, marginTop: 6, textAlign: 'center', fontWeight: '600' }}>Görsel {idx + 1}</Text>
                                            </View>
                                        ))}
                                        <View style={{ width: 120, alignItems: 'center' }}>
                                            <View style={{ width: 120, height: 120, borderRadius: 12, borderWidth: 1, borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.05)', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' }}>
                                                <Ionicons name="map-outline" size={36} color="#FFD700" />
                                                <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 13, marginTop: 8, fontWeight: 'bold' }}>Kroki/Plan</Text>
                                            </View>
                                            <Text allowFontScaling={false} style={{ color: '#A0A0A0', fontSize: 12, marginTop: 6, textAlign: 'center', fontWeight: '600' }}>Örnek Plan</Text>
                                        </View>
                                    </ScrollView>
                                ) : (
                                    <View style={styles.emptyPhotoContainer}>
                                        <View style={styles.emptyPhotoBox}>
                                            <MaterialCommunityIcons name="image-off-outline" size={28} color="#555" />
                                            <Text allowFontScaling={false} style={styles.emptyPhotoText}>Kullanıcı görsel yüklememiş</Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* 3. Teknik Detaylar Kartı */}
                            <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 }}>
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Teknik Detaylar</Text>
                                
                                <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 24, fontWeight: '900', marginBottom: 16, textAlign: 'center' }}>ALAN: {tadilatDetails.areaSize}</Text>
                                <Text allowFontScaling={false} style={{ color: '#A0A0A0', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>{tadilatDetails.propertyType}</Text>

                                <Text allowFontScaling={false} style={{ color: '#888', fontSize: 13, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 }}>BEKLENEN İŞLEMLER</Text>
                                <View style={{ gap: 14, marginBottom: 24 }}>
                                    {operations.map((item, idx) => (
                                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <Ionicons name="checkmark-circle" size={26} color="#FFD700" />
                                            <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 14, fontWeight: '500', flex: 1 }} numberOfLines={2}>{item}</Text>
                                        </View>
                                    ))}
                                </View>

                                {tadilatDetails.style !== '-' && (
                                    <>
                                        <Text allowFontScaling={false} style={{ color: '#888', fontSize: 13, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 }}>TARZ TERCİHİ: {tadilatDetails.style.toUpperCase()}</Text>
                                        <View style={{ flexDirection: 'row', gap: 16 }}>
                                            {styleIcons.map((styleObj, idx) => (
                                                <View key={idx} style={{ flex: 1, backgroundColor: 'rgba(255, 215, 0, 0.1)', borderWidth: 1, borderColor: '#FFD700', borderRadius: 12, padding: 16, alignItems: 'center' }}>
                                                    <MaterialCommunityIcons name={styleObj.icon} size={36} color="#FFD700" />
                                                    <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginTop: 8 }}>{styleObj.label}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </>
                                )}
                            </View>

                            {/* 4. Kullanıcı Notları */}
                            <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 }}>
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Kullanıcı Notları</Text>
                                <Text allowFontScaling={false} style={{ color: '#CCC', fontSize: 15, lineHeight: 24, marginBottom: 20, fontStyle: 'italic' }}>
                                    "{notes}"
                                </Text>
                                
                                {request.audio_url ? (
                                <View style={{ backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333' }}>
                                    <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                        <Ionicons name="play" size={24} color="#000" style={{ marginLeft: 3 }} />
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, height: 30, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                        {[0.3, 0.6, 1, 0.8, 0.4, 0.9, 0.6, 0.5, 0.2, 0.7].map((height, i) => (
                                            <View key={i} style={{ flex: 1, height: 30 * height, backgroundColor: i < 6 ? '#FFD700' : '#444', borderRadius: 4 }} />
                                        ))}
                                    </View>
                                    <Text allowFontScaling={false} style={{ color: '#A0A0A0', fontSize: 12, marginLeft: 12, fontWeight: 'bold' }}>0:15</Text>
                                </View>
                                ) : null}
                            </View>
                        </>
                    ) : (
                    <>
                    <View style={styles.card}>
                        
                        {/* Title Row */}
                        <View style={styles.titleRow}>
                            <View style={styles.titleLeft}>
                                <MaterialCommunityIcons name={iconName} size={28} color="#FFD700" />
                                <Text allowFontScaling={false} style={styles.titleText}>{projeTipi}</Text>
                            </View>
                            <View style={styles.badge}>
                                <Text allowFontScaling={false} style={styles.badgeText}>#{request.id?.slice(0, 8).toUpperCase()}</Text>
                            </View>
                        </View>
                        
                        {/* Metrics Grid */}
                        <View style={styles.gridRow}>
                            <View style={styles.gridCol}>
                                <Text allowFontScaling={false} style={styles.gridLabel}>MEKAN</Text>
                                <Text allowFontScaling={false} style={styles.gridValue}>{tadilatDetails.propertyType}</Text>
                            </View>
                            <View style={styles.gridCol}>
                                <Text allowFontScaling={false} style={styles.gridLabel}>ALAN</Text>
                                <Text allowFontScaling={false} style={styles.gridValue}>{tadilatDetails.areaSize}</Text>
                            </View>
                            <View style={styles.gridCol}>
                                <Text allowFontScaling={false} style={styles.gridLabel}>TARZ</Text>
                                <Text allowFontScaling={false} style={styles.gridValue}>{tadilatDetails.style}</Text>
                            </View>
                        </View>

                        {/* Extra Notes */}
                        <View style={styles.notesSection}>
                            <Text allowFontScaling={false} style={styles.sectionTitle}>EK NOTLAR</Text>
                            <Text allowFontScaling={false} style={styles.notesText}>
                                {request.description && request.description.includes('NOT:') 
                                    ? request.description.split('NOT:')[1]?.trim() 
                                    : '-'}
                            </Text>
                        </View>

                        {/* Photos Section */}
                        <View style={styles.photosSection}>
                            <Text allowFontScaling={false} style={styles.sectionTitle}>MEVCUT ALAN & İLHAM</Text>
                            
                            {hasPhotos ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
                                    {request.document_urls.map((url, idx) => (
                                        <TouchableOpacity key={idx} onPress={() => setSelectedImage(url)}>
                                            <Image source={{ uri: url }} style={styles.photoThumb} />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            ) : (
                                <View style={styles.emptyPhotoContainer}>
                                    <View style={styles.emptyPhotoBox}>
                                        <MaterialCommunityIcons name="image-off-outline" size={24} color="#555" />
                                        <Text allowFontScaling={false} style={styles.emptyPhotoText}>Görsel yüklenmemiş</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Button */}
                        <TouchableOpacity 
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('ConstructionOfferSubmit', { request })}
                        >
                            <Text allowFontScaling={false} style={styles.primaryButtonText}>Teklif Ver</Text>
                        </TouchableOpacity>

                    </View>
                    
                    {/* Delete and Other user side buttons exist, but this is the provider view. 
                        We don't need 'Talebi Sil' for the Architect/Contractor. */}

                    <View style={{ height: 40 }} />
                    </>
                    )}
                </ScrollView>
                
                {/* 5. Fixed Action Bar FOR TADILAT ONLY */}
                {request?.offer_type === 'anahtar_teslim_tadilat' && (
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(5, 5, 5, 0.98)', borderTopWidth: 1, borderColor: '#222', padding: 16, paddingBottom: 34 }}>
                        <Text allowFontScaling={false} style={{ color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 12, fontWeight: 'bold' }}>Tarih: {new Date(request.created_at || Date.now()).toLocaleDateString('tr-TR')}  •  Durum: {request.status}</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Ionicons name="call-outline" size={20} color="#FFF" />
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 15, fontWeight: 'bold' }}>İletişime Geç</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{ flex: 1, backgroundColor: '#FFD700', borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 8, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
                                onPress={() => navigation.navigate('ConstructionOfferSubmit', { request })}
                            >
                                <Ionicons name="document-text-outline" size={22} color="#000" />
                                <Text allowFontScaling={false} style={{ color: '#000', fontSize: 15, fontWeight: 'bold' }}>Teklif Hazırla</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Modal for Fullsize image */}
                <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setSelectedImage(null)}
                        >
                            <Ionicons name="close-circle" size={40} color="white" />
                        </TouchableOpacity>
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.fullImage}
                            />
                        )}
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    content: { padding: 20 },
    
    card: { backgroundColor: '#161616', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A2A2A' },
    
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    titleText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    badge: { backgroundColor: 'rgba(255, 215, 0, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
    
    gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    gridCol: { flex: 1, gap: 4 },
    gridLabel: { color: '#A0A0A0', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
    gridValue: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
    
    notesSection: { marginBottom: 24 },
    sectionTitle: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 },
    notesText: { color: '#DDD', fontSize: 14, lineHeight: 20 },
    
    photosSection: { marginBottom: 32 },
    photosScroll: { gap: 12 },
    photoThumb: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#2A2A2A' },
    
    emptyPhotoContainer: { borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', borderRadius: 12, overflow: 'hidden' },
    emptyPhotoBox: { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' },
    emptyPhotoText: { color: '#A0A0A0', fontSize: 12, marginTop: 8 },

    primaryButton: { backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
    
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    modalCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
    fullImage: { width: '100%', height: '80%', resizeMode: 'contain' }
});
