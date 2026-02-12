import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import PremiumBackground from '../../components/PremiumBackground';

const { width } = Dimensions.get('window');

export default function ContractorRequestDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};

    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const openImage = (uri) => {
        setSelectedImage(uri);
        setImageModalVisible(true);
    };

    if (!request) return null;

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>TALEP DETAYI</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Location Info */}
                    <GlassCard style={styles.section}>
                        <View style={styles.row}>
                            <MaterialCommunityIcons name="map-marker-radius" size={24} color="#D4AF37" />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={styles.label}>LOKASYON</Text>
                                <Text style={styles.value}>{request.district}, {request.neighborhood}</Text>
                                <Text style={styles.subValue}>{request.city}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <MaterialCommunityIcons name="sign-direction" size={24} color="#D4AF37" />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={styles.label}>AÇIK ADRES</Text>
                                <Text style={styles.value}>{request.full_address || 'Belirtilmemiş'}</Text>
                            </View>
                        </View>
                    </GlassCard>

                    {/* Technical Info */}
                    <GlassCard style={styles.section}>
                        <Text style={styles.sectionTitle}>Tapu & İmar Bilgileri</Text>

                        <View style={styles.grid}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>ADA</Text>
                                <Text style={styles.value}>{request.ada}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>PARSEL</Text>
                                <Text style={styles.value}>{request.parsel}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>PAFTA</Text>
                                <Text style={styles.value}>{request.pafta || '-'}</Text>
                            </View>
                        </View>
                    </GlassCard>

                    {/* Offer Type Info */}
                    <GlassCard style={styles.section}>
                        <Text style={styles.sectionTitle}>Talep Türü</Text>
                        <View style={styles.row}>
                            <MaterialCommunityIcons
                                name={request.offer_type === 'anahtar_teslim' ? "home-currency-usd" : "handshake"}
                                size={28}
                                color="#D4AF37"
                            />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.value}>
                                    {request.offer_type === 'anahtar_teslim' ? 'Anahtar Teslim İnşaat' : 'Kat Karşılığı İnşaat'}
                                </Text>
                                <Text style={styles.subValue}>
                                    {request.offer_type === 'anahtar_teslim'
                                        ? 'Maliyet mülk sahibi tarafından karşılanacak.'
                                        : 'Arsa payı karşılığında inşaat yapılacak.'}
                                </Text>
                            </View>
                        </View>

                        {request.is_campaign_active && (
                            <View style={styles.campaignBox}>
                                <MaterialCommunityIcons name="star-circle" size={20} color="#000" />
                                <Text style={styles.campaignText}>
                                    Yarısı Bizden Kampanyası: <Text style={{ fontWeight: 'bold' }}>DAHİL</Text>
                                </Text>
                            </View>
                        )}
                    </GlassCard>

                    {/* Description */}
                    {request.description && (
                        <GlassCard style={styles.section}>
                            <Text style={styles.sectionTitle}>Açıklama & Notlar</Text>
                            <Text style={styles.descText}>{request.description}</Text>
                        </GlassCard>
                    )}

                    {/* Images */}
                    {request.document_urls && request.document_urls.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { marginLeft: 4, marginBottom: 8 }]}>Belgeler & Görseller</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {request.document_urls.map((url, index) => (
                                    <TouchableOpacity key={index} onPress={() => openImage(url)}>
                                        <Image source={{ uri: url }} style={styles.thumbnail} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={{ height: 100 }} />

                </ScrollView>

                {/* Footer Action */}
                <View style={styles.footerContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('ConstructionOfferSubmit', { request })}
                    >
                        <LinearGradient
                            colors={['#996515', '#FFD700', '#FDB931', '#996515']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.gradient}
                        >
                            <Text style={styles.actionText}>TEKLİF VER</Text>
                            <MaterialCommunityIcons name="arrow-right-thick" size={20} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Image Modal */}
                <Modal visible={imageModalVisible} transparent={true} onRequestClose={() => setImageModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.closeModal} onPress={() => setImageModalVisible(false)}>
                            <Ionicons name="close" size={36} color="#FFF" />
                        </TouchableOpacity>
                        <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
                    </View>
                </Modal>

            </SafeAreaView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        width: 44, height: 44,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12
    },
    headerTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
        padding: 16
    },
    sectionTitle: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'uppercase'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    label: {
        color: '#888',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2
    },
    value: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '500'
    },
    subValue: {
        color: '#AAA',
        fontSize: 12,
        marginTop: 2
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 12
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    gridItem: {
        flex: 1,
    },
    campaignBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D4AF37',
        marginTop: 12,
        padding: 10,
        borderRadius: 8,
        gap: 8
    },
    campaignText: {
        color: '#000',
        fontSize: 13
    },
    descText: {
        color: '#EEE',
        fontSize: 14,
        lineHeight: 22
    },
    thumbnail: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#333'
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.9)',
        borderTopWidth: 1,
        borderTopColor: '#333'
    },
    actionButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#D4AF37',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8
    },
    actionText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold'
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeModal: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10
    },
    fullImage: {
        width: width,
        height: '80%'
    }
});
