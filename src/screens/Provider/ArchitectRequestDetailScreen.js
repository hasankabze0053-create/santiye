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
    if (request?.description) {
        const lines = request.description.split('\n');
        const mekanLine = lines.find(l => l.startsWith('MEKAN:'));
        const tarzLine = lines.find(l => l.startsWith('TARZ:'));
        if (mekanLine) {
            const mekanPart = mekanLine.replace('MEKAN:', '').trim();
            const split = mekanPart.split('(');
            tadilatDetails.propertyType = split[0].trim();
            tadilatDetails.areaSize = split.length > 1 ? split[1].replace(')', '').trim() : '-';
        }
        if (tarzLine) {
            tadilatDetails.style = tarzLine.replace('TARZ:', '').trim();
        }
    }

    const hasPhotos = request.document_urls && request.document_urls.length > 0;

    let projeTipi = 'Anahtar Teslim Tadilat';
    let iconName = 'home-edit';
    if (request.description && request.description.includes('PROJE TİPİ:')) {
        projeTipi = request.description.split('PROJE TİPİ:')[1].split('\n')[0].trim();
        if (projeTipi.includes('Boya')) iconName = 'format-paint';
        else if (projeTipi.includes('Mutfak')) iconName = 'water-pump';
    }

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
                    <Text style={styles.headerTitle}>PROJE DETAYI</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.card}>
                        
                        {/* Title Row */}
                        <View style={styles.titleRow}>
                            <View style={styles.titleLeft}>
                                <MaterialCommunityIcons name={iconName} size={28} color="#FFD700" />
                                <Text style={styles.titleText}>{projeTipi}</Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>#{request.id?.slice(0, 8).toUpperCase()}</Text>
                            </View>
                        </View>
                        
                        {/* Metrics Grid */}
                        <View style={styles.gridRow}>
                            <View style={styles.gridCol}>
                                <Text style={styles.gridLabel}>MEKAN</Text>
                                <Text style={styles.gridValue}>{tadilatDetails.propertyType}</Text>
                            </View>
                            <View style={styles.gridCol}>
                                <Text style={styles.gridLabel}>ALAN</Text>
                                <Text style={styles.gridValue}>{tadilatDetails.areaSize}</Text>
                            </View>
                            <View style={styles.gridCol}>
                                <Text style={styles.gridLabel}>TARZ</Text>
                                <Text style={styles.gridValue}>{tadilatDetails.style}</Text>
                            </View>
                        </View>

                        {/* Extra Notes */}
                        <View style={styles.notesSection}>
                            <Text style={styles.sectionTitle}>EK NOTLAR</Text>
                            <Text style={styles.notesText}>
                                {request.description && request.description.includes('NOT:') 
                                    ? request.description.split('NOT:')[1]?.trim() 
                                    : '-'}
                            </Text>
                        </View>

                        {/* Photos Section */}
                        <View style={styles.photosSection}>
                            <Text style={styles.sectionTitle}>MEVCUT ALAN & İLHAM</Text>
                            
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
                                        <Text style={styles.emptyPhotoText}>Görsel yüklenmemiş</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Button */}
                        <TouchableOpacity 
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('ConstructionOfferSubmit', { request })}
                        >
                            <Text style={styles.primaryButtonText}>Teklif Ver</Text>
                        </TouchableOpacity>

                    </View>
                    
                    {/* Delete and Other user side buttons exist, but this is the provider view. 
                        We don't need 'Talebi Sil' for the Architect/Contractor. */}

                    <View style={{ height: 40 }} />
                </ScrollView>

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
