import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ArchitectRequestDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};

    const [selectedImage, setSelectedImage] = useState(null);

    if (!request) return null;

    // --- PROFOSYONEL PARSING MANTIĞI ---
    const getField = (tag) => {
        if (!request.description) return null;
        // Yeni format: [TAG] Değer
        const regexNew = new RegExp(`\\[${tag}\\]\\s*(.*)`, 'i');
        const matchNew = request.description.match(regexNew);
        if (matchNew) return matchNew[1].trim();

        // Eski format: TAG: Değer
        const regexOld = new RegExp(`${tag}:\\s*(.*)`, 'i');
        const matchOld = request.description.match(regexOld);
        if (matchOld) return matchOld[1].trim();

        return null;
    };

    const isElevator = request._tableName === 'elevator_requests' || !!request.fault_type;

    const projeTipi = isElevator ? request.fault_type : (getField('PROJE TİPİ') || 'Anahtar Teslim Tadilat');
    const kapsam = isElevator ? 'Asansör Bakım & Arıza Onarımı' : (getField('KAPSAM') || getField('HİZMETLER') || '-');
    const durum = isElevator ? 'Acil / Rutin Bakım' : (getField('DURUM') || getField('YENİLEME') || '-');
    const teknik = isElevator ? 'Asansör Kabini, Motor, Ray ve Kapı Sistemleri' : (getField('TEKNİK') || getField('MEKAN') || '-');
    const tarz = isElevator ? 'Teknik Onarım' : (getField('TASARIM') || getField('TARZ') || 'Belirtilmedi');
    const butce = isElevator ? 'Keşif Sonrası Belirlenecek' : (getField('BÜTÇE') || '-');
    const lokasyon = isElevator ? `${request.city} / ${request.district}` : (getField('LOKASYON') || '-');

    // Notları ayıkla
    let notes = isElevator ? 'Müşteriye en kısa sürede ulaşılarak arıza tespiti yapılmalıdır.' : 'Ek not bulunmuyor.';
    if (request.description?.includes('[NOT]')) {
        notes = request.description.split('[NOT]')[1]?.trim() || notes;
    } else if (request.description?.includes('NOT:')) {
        notes = request.description.split('NOT:')[1]?.trim() || notes;
    }

    // Teknik Detayları (Mutfak/Banyo listesi) parçala
    const teknikItems = teknik.split('|').map(s => s.trim()).filter(Boolean);

    const hasPhotos = request.document_urls && request.document_urls.length > 0;
    const locationDisplay = lokasyon !== '-' ? lokasyon : `${request.district || ''} / ${request.city || 'Türkiye Geneli'}`;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#0D0D0D']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>
                
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text allowFontScaling={false} style={styles.headerTitle}>KEŞİF & TALEP DETAYI</Text>
                        <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10, fontWeight: 'bold', marginTop: 2 }}>#{request.id?.slice(0, 8).toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity style={styles.backBtn}>
                        <Ionicons name="share-outline" size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                    
                    {/* 1. ANA KART: Özet Bilgiler */}
                    <LinearGradient colors={['#1F1F1F', '#111']} style={styles.mainSummaryCard}>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <MaterialCommunityIcons name="map-marker-radius" size={22} color="#FFD700" />
                                <Text allowFontScaling={false} style={styles.summaryLabel}>KONUM</Text>
                                <Text allowFontScaling={false} style={styles.summaryValue} numberOfLines={1}>{locationDisplay}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <MaterialCommunityIcons name="chart-line" size={22} color="#FFD700" />
                                <Text allowFontScaling={false} style={styles.summaryLabel}>BÜTÇE</Text>
                                <Text allowFontScaling={false} style={styles.summaryValue}>{butce}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <MaterialCommunityIcons name="clock-outline" size={22} color="#FFD700" />
                                <Text allowFontScaling={false} style={styles.summaryLabel}>DURUM</Text>
                                <Text allowFontScaling={false} style={styles.summaryValue}>{request.status === 'pending' ? 'AÇIK' : 'İŞLEMDE'}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* 2. TEKNİK DETAYLAR SEKSİYONU */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleWrap}>
                            <MaterialCommunityIcons name="hammer-wrench" size={20} color="#FFD700" />
                            <Text allowFontScaling={false} style={styles.sectionTitle}>TEKNİK ŞARTLAR & ALANLAR</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.infoRow}>
                            <Text allowFontScaling={false} style={styles.infoLabel}>Proje Tipi</Text>
                            <Text allowFontScaling={false} style={styles.infoValue}>{projeTipi}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text allowFontScaling={false} style={styles.infoLabel}>Mekan / Bina Durumu</Text>
                            <Text allowFontScaling={false} style={[styles.infoValue, { color: '#FFD700' }]}>{durum}</Text>
                        </View>
                        
                        <View style={styles.separator} />
                        
                        <Text allowFontScaling={false} style={styles.subHeader}>YENİLENECEK ALANLAR</Text>
                        {teknikItems.length > 0 ? teknikItems.map((item, idx) => (
                            <View key={idx} style={styles.techItem}>
                                <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFD700" />
                                <Text allowFontScaling={false} style={styles.techItemText}>{item}</Text>
                            </View>
                        )) : (
                            <Text allowFontScaling={false} style={{ color: '#666', fontStyle: 'italic' }}>Belirtilmedi</Text>
                        )}
                    </View>

                    {/* 3. TASARIM DİLİ */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleWrap}>
                            <MaterialCommunityIcons name="palette-swatch" size={20} color="#FFD700" />
                            <Text allowFontScaling={false} style={styles.sectionTitle}>MİMARİ TARZ & ATMOSFER</Text>
                        </View>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.styleBox}>
                            <MaterialCommunityIcons name="pillar" size={32} color="#FFD700" />
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>{tarz}</Text>
                                <Text allowFontScaling={false} style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Kullanıcının hayalindeki tasarım dili.</Text>
                            </View>
                        </View>
                    </View>

                    {/* 4. GÖRSEL GALERİ */}
                    {request.current_situation_urls?.length > 0 || request.inspiration_urls?.length > 0 ? (
                        <>
                            {request.current_situation_urls?.length > 0 && (
                                <>
                                    <View style={styles.sectionHeader}>
                                        <View style={styles.sectionTitleWrap}>
                                            <MaterialCommunityIcons name="camera-outline" size={20} color="#FFD700" />
                                            <Text allowFontScaling={false} style={styles.sectionTitle}>MEVCUT DURUM FOTOĞRAFLARI</Text>
                                        </View>
                                    </View>
                                    <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                            {request.current_situation_urls.map((url, idx) => (
                                                <TouchableOpacity key={`current-${idx}`} onPress={() => setSelectedImage(url)} activeOpacity={0.9}>
                                                    <Image source={{ uri: url }} style={styles.galleryImg} />
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </>
                            )}

                            {request.inspiration_urls?.length > 0 && (
                                <>
                                    <View style={styles.sectionHeader}>
                                        <View style={styles.sectionTitleWrap}>
                                            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FFD700" />
                                            <Text allowFontScaling={false} style={styles.sectionTitle}>İLHAM ALINAN FOTOĞRAFLAR</Text>
                                        </View>
                                    </View>
                                    <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                            {request.inspiration_urls.map((url, idx) => (
                                                <TouchableOpacity key={`inspiration-${idx}`} onPress={() => setSelectedImage(url)} activeOpacity={0.9}>
                                                    <Image source={{ uri: url }} style={styles.galleryImg} />
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleWrap}>
                                    <MaterialCommunityIcons name="camera-burst" size={20} color="#FFD700" />
                                    <Text allowFontScaling={false} style={styles.sectionTitle}>FOTOĞRAFLAR & REFERANSLAR</Text>
                                </View>
                            </View>
                            <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
                                {request.document_urls?.length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                        {request.document_urls.map((url, idx) => (
                                            <TouchableOpacity key={idx} onPress={() => setSelectedImage(url)} activeOpacity={0.9}>
                                                <Image source={{ uri: url }} style={styles.galleryImg} />
                                                <View style={styles.imgLabel}>
                                                    <Text allowFontScaling={false} style={styles.imgLabelText}>{idx < 2 ? (idx === 0 ? 'Mevcut' : 'İlham') : `Görsel ${idx + 1}`}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View style={styles.emptyPhotos}>
                                        <MaterialCommunityIcons name="image-off-outline" size={32} color="#333" />
                                        <Text allowFontScaling={false} style={{ color: '#555', fontSize: 12, marginTop: 8 }}>Kullanıcı görsel eklemedi</Text>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {/* 5. ÖZEL İSTEKLER */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleWrap}>
                            <MaterialCommunityIcons name="message-text-outline" size={20} color="#FFD700" />
                            <Text allowFontScaling={false} style={styles.sectionTitle}>MÜŞTERİ NOTLARI</Text>
                        </View>
                    </View>
                    <View style={[styles.card, { marginBottom: 20 }]}>
                        <Text allowFontScaling={false} style={styles.notesText}>
                            "{notes}"
                        </Text>
                    </View>

                </ScrollView>

                {/* FIXED FOOTER */}
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        <TouchableOpacity style={styles.msgBtn}>
                            <Ionicons name="call" size={20} color="#FFF" />
                            <Text allowFontScaling={false} style={styles.msgBtnText}>Ara</Text>
                        </TouchableOpacity>
                        {!isElevator && (
                            <TouchableOpacity 
                                style={styles.offerBtn}
                                onPress={() => navigation.navigate('ConstructionOfferSubmit', { request })}
                            >
                                <LinearGradient colors={['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
                                <Text allowFontScaling={false} style={styles.offerBtnText}>TEKLİF HAZIRLA</Text>
                            </TouchableOpacity>
                        )}
                        {isElevator && (
                             <TouchableOpacity 
                                 style={styles.offerBtn}
                                 onPress={() => Alert.alert('Bilgi', 'Asansör taleplerine uygulama üzerinden teklif verme yakında eklenecektir. Lütfen müşteriyle iletişime geçiniz.')}
                             >
                                 <LinearGradient colors={['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
                                 <Text allowFontScaling={false} style={styles.offerBtnText}>ONAY BEKLİYOR</Text>
                             </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Fullscreen Image Modal */}
                <Modal visible={!!selectedImage} transparent={true} animationType="fade">
                    <View style={styles.modalBg}>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
                            <Ionicons name="close-circle" size={42} color="white" />
                        </TouchableOpacity>
                        <Image source={{ uri: selectedImage }} style={styles.modalImg} resizeMode="contain" />
                    </View>
                </Modal>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
    backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
    headerTitle: { color: '#FFD700', fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
    
    mainSummaryCard: { margin: 20, borderRadius: 24, paddingVertical: 20, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
    summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center', flex: 1, paddingHorizontal: 5 },
    summaryLabel: { color: '#888', fontSize: 9, fontWeight: '900', marginTop: 8, letterSpacing: 1 },
    summaryValue: { color: '#FFF', fontSize: 12, fontWeight: '800', marginTop: 4, textAlign: 'center' },
    summaryDivider: { width: 1, height: 40, backgroundColor: '#333' },

    sectionHeader: { paddingHorizontal: 20, marginBottom: 15, marginTop: 10 },
    sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionTitle: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
    
    card: { backgroundColor: '#111', marginHorizontal: 20, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#222', marginBottom: 25 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
    infoLabel: { color: '#888', fontSize: 13, fontWeight: '600', width: 130 },
    infoValue: { color: '#FFF', fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right' },
    separator: { height: 1, backgroundColor: '#222', marginVertical: 15 },
    subHeader: { color: '#666', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 15 },
    
    techItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    techItemText: { color: '#DDD', fontSize: 14, fontWeight: '600', flex: 1 },
    
    styleBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333' },
    
    galleryImg: { width: width * 0.35, height: width * 0.35, borderRadius: 18, borderWidth: 1, borderColor: '#222' },
    imgLabel: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    imgLabelText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    emptyPhotos: { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#222' },
    
    notesText: { color: '#CCC', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
    
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, backgroundColor: 'rgba(0,0,0,0.95)', borderTopWidth: 1, borderTopColor: '#222' },
    footerContent: { flexDirection: 'row', gap: 12 },
    msgBtn: { flex: 0.3, height: 56, borderRadius: 18, borderVertical: 1, borderWidth: 1, borderColor: '#333', backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
    msgBtnText: { color: '#FFF', fontWeight: 'bold' },
    offerBtn: { flex: 0.7, height: 56, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    offerBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },

    modalBg: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    modalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
    modalImg: { width: '100%', height: '80%' }
});
