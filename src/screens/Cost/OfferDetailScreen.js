
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BuildingSchema from '../../components/BuildingSchema';
import GlassCard from '../../components/GlassCard';
import PremiumBackground from '../../components/PremiumBackground';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

// Helper for currency formatting
const formatCurrency = (val) => {
    if (!val) return '0';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const numberToTurkishWords = (num) => {
    if (!num || isNaN(num)) return '';
    const ones = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
    const tens = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
    const groups = ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon'];
    const numStr = Math.floor(num).toString();
    const parts = [];
    let i = numStr.length;
    while (i > 0) {
        parts.push(numStr.substring(Math.max(0, i - 3), i));
        i -= 3;
    }
    let words = [];
    parts.forEach((part, index) => {
        const p = parseInt(part);
        if (p > 0) {
            let partWords = [];
            const h = Math.floor(p / 100);
            const t = Math.floor((p % 100) / 10);
            const o = p % 10;
            if (h > 0) { if (h > 1) partWords.push(ones[h]); partWords.push('Yüz'); }
            if (t > 0) partWords.push(tens[t]);
            if (o > 0) { if (index === 1 && p === 1) { } else { partWords.push(ones[o]); } }
            if (groups[index]) partWords.push(groups[index]);
            words.unshift(partWords.join(' '));
        }
    });
    return words.join(' ') + ' Türk Lirası';
};

export default function OfferDetailScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const route = useRoute();
    const { request, request_id, contractor_id, offers: initialOffers, initialOfferIndex = 0 } = route.params || {};

    const [loading, setLoading] = useState(!initialOffers);
    const [offers, setOffers] = useState(initialOffers || []); // Array of offer objects
    const [contractor, setContractor] = useState(null);
    const [activeTab, setActiveTab] = useState(initialOfferIndex); // Index of currently viewed offer
    const [isSchemaModalVisible, setIsSchemaModalVisible] = useState(false);
    const [viewerMode, setViewerMode] = useState('contractor');

    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

    // Initial Scroll Effect
    useEffect(() => {
        if (offers.length > 0 && initialOfferIndex > 0 && slidesRef.current) {
            setTimeout(() => {
                try {
                    slidesRef.current.scrollToIndex({ index: initialOfferIndex, animated: false });
                } catch (e) {
                    // Ignore index error if layout not ready
                }
            }, 100);
        }
    }, [offers, initialOfferIndex]);

    useEffect(() => {
        checkViewer();
    }, [request]);

    const checkViewer = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && request && user.id === request.user_id) {
                setViewerMode('landowner');
            } else {
                setViewerMode('contractor');
            }
        } catch (e) {
            console.log('Error checking viewer:', e);
        }
    };

    useEffect(() => {
        if (!initialOffers) {
            fetchOffers();
        } else if (initialOffers.length > 0) {
            // If we have offers but no contractor profile yet (usually profile is joined)
            if (initialOffers[0].profiles) {
                setContractor(initialOffers[0].profiles);
            } else {
                // Fetch profile if missing
                fetchContractorProfile();
            }
        }
    }, [request_id, contractor_id]);

    const fetchContractorProfile = async () => {
        if (!contractor_id) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', contractor_id).single();
        if (data) setContractor(data);
    };

    const fetchOffers = async () => {
        try {
            setLoading(true);

            // 1. Fetch Offers
            const { data: offersData, error: offersError } = await supabase
                .from('construction_offers')
                .select('*, profiles:contractor_id(*)') // Fetch profile joined
                .eq('request_id', request_id)
                .eq('contractor_id', contractor_id)
                .order('created_at', { ascending: false }); // Newest first

            if (offersError) throw offersError;

            if (offersData && offersData.length > 0) {
                setOffers(offersData);
                if (offersData[0].profiles) {
                    setContractor(offersData[0].profiles);
                }
            }

        } catch (error) {
            console.error('Error fetching details:', error);
            Alert.alert('Hata', 'Teklif detayları yüklenirken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveTab(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

    const renderOfferContent = ({ item: offer, index }) => {
        // Parse JSON data safely
        const floorDetails = offer.floor_details_json?.floors || {};
        const groundFloorType = offer.floor_details_json?.groundFloor || 'apartment';
        const breakdown = offer.unit_breakdown || {};
        const selectedUnits = breakdown.selected_units || [];
        const cashAdj = breakdown.cash_adjustment || {};

        // Helper to ensure selectedUnits matching works even if IDs mismatch
        const normalizeSelectedUnits = () => {
            const allUnits = Object.values(floorDetails).flat();
            // Check if we have direct matches
            const hasDirectMatch = allUnits.some(u => selectedUnits.includes(u.id));

            if (hasDirectMatch) return selectedUnits;

            // Fallback: If no direct match (data inconsistencies with random IDs),
            // select the LAST N 'apartment' units to represent the selection (usually top floors).
            if (selectedUnits.length > 0) {
                const count = selectedUnits.length;
                console.warn(`Unit ID mismatch. Using representative fallback for ${count} units.`);

                const candidates = allUnits.filter(u => u.type === 'apartment' || u.type === 'residence');

                if (candidates.length >= count) {
                    return candidates.slice(candidates.length - count).map(u => u.id);
                }
                return allUnits.slice(allUnits.length - count).map(u => u.id);
            }
            return selectedUnits;
        };

        const effectiveSelectedUnits = normalizeSelectedUnits();

        console.log('DEBUG: OfferDetail', {
            offerId: offer.id,
            selectedUnitsCount: selectedUnits.length,
            effectiveSelectedUnitsCount: effectiveSelectedUnits.length
        });

        return (
            <ScrollView
                style={{ width: width, paddingHorizontal: 20 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Price & Duration Summary */}
                <GlassCard style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="star-circle" size={24} color="#D4AF37" />
                        {/* FIXED: Title now matches the Tab Index logic (1-based) */}
                        <Text style={styles.cardTitle}>TEKLİF #{index + 1}</Text>
                        <View style={{ flex: 1 }} />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>YENİ TEKLİF</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Financials */}
                    {offer.price_estimate > 0 ? (
                        <View>
                            <Text style={styles.label}>TAHMİNİ FİYAT</Text>
                            <Text style={styles.priceValue}>{formatCurrency(offer.price_estimate)} TL</Text>
                            <Text style={styles.priceWords}>{numberToTurkishWords(offer.price_estimate)}</Text>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.label}>KAT KARŞILIĞI PAYLAŞIM MODELİ</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <MaterialCommunityIcons name="home-city" size={20} color="#D4AF37" />
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                                    {selectedUnits.length} Daire Müteahhit Payı
                                </Text>
                            </View>
                            {cashAdj.amount > 0 && (
                                <Text style={{ color: cashAdj.type === 'request' ? '#4CAF50' : '#FF5252', marginTop: 4, fontWeight: 'bold' }}>
                                    {cashAdj.type === 'request' ? `+ ${formatCurrency(cashAdj.amount)} TL (Müteahhit Ödeyecek)` : `- ${formatCurrency(cashAdj.amount)} TL (Sizden Talep Ediliyor)`}
                                </Text>
                            )}
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', marginTop: 16, gap: 20 }}>
                        <View>
                            <Text style={styles.label}>TOPLAM ALAN</Text>
                            <Text style={styles.value}>{offer.total_area || '0'} m²</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>KAT SAYISI</Text>
                            <Text style={styles.value}>{offer.floor_count || '0'}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>DAİRE/KAT</Text>
                            <Text style={styles.value}>{offer.floor_design_type || '0'}</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* 2. Visual Building Schema */}
                <Text style={styles.sectionTitle}>MİMARİ GÖRSELLEŞTİRME</Text>
                {/* FIXED: Removed TouchableOpacity to disable modal opening */}
                <View style={styles.schemaContainer}>
                    <BuildingSchema
                        floorCount={offer.floor_count}
                        floorDetails={floorDetails}
                        groundFloorType={groundFloorType}
                        isBasementResidential={offer.is_basement_residential}
                        basementCount={offer.basement_count || 0}
                        selectable={false} // Read only
                        selectedUnits={effectiveSelectedUnits} // Highlights contractor units
                        campaignData={{
                            unitCount: request?.campaign_unit_count || 0,
                            commercialCount: request?.campaign_commercial_count || 0
                        }}
                        cashAdjustment={{
                            type: cashAdj.type || 'none',
                            amount: cashAdj.amount || 0
                        }}
                        showColors={true}
                        hideDetails={true} // FIXED: Added prop to hide internal Grant/Cash boxes
                        legendLabel={contractor?.id === user?.id ? 'Müteahhit (Siz)' : 'Müteahhit Firma'}
                    />
                    {/* Removed "Detaylı incelemek için dokunun" hint since interaction is disabled */}
                </View>

                {/* 3. Visual Summary Boxes (New) */}
                <View style={{ marginTop: 20, gap: 12 }}>

                    {/* A. Grant Box (Government Support) */}
                    {request?.is_campaign_active && (request?.campaign_unit_count > 0 || request?.campaign_commercial_count > 0) && (
                        <GlassCard style={{ backgroundColor: 'rgba(50, 205, 50, 0.1)', borderColor: 'rgba(50, 205, 50, 0.3)', padding: 16 }}>
                            <Text style={{ color: '#4CAF50', fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
                                DEVLET DESTEĞİNDE HAK EDİŞİNİZ
                            </Text>
                            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                                {formatCurrency((
                                    ((request.campaign_unit_count || 0) * 1750000) +
                                    ((request.campaign_commercial_count || 0) * 875000)
                                ).toString())} TL
                            </Text>
                            <Text style={{ color: '#DDD', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                                {request.campaign_unit_count > 0 ? `${request.campaign_unit_count} Konut (Hibe + Kredi)` : ''}
                                {request.campaign_commercial_count > 0 ? `${request.campaign_unit_count > 0 ? ' + ' : ''}${request.campaign_commercial_count} Dükkan` : ''}
                            </Text>
                        </GlassCard>
                    )}

                    {/* B. Cash Adjustment Box */}
                    {cashAdj.amount > 0 && (
                        <GlassCard style={{ backgroundColor: 'rgba(50, 205, 50, 0.1)', borderColor: 'rgba(50, 205, 50, 0.3)', padding: 16 }}>
                            <Text style={{ color: '#4CAF50', fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
                                {cashAdj.type === 'request'
                                    ? 'HAK SAHİPLERİNDEN TALEP EDİLEN TOPLAM TUTAR'
                                    : 'MÜTEAHHİT FİRMA TARAFINDAN ÖDENECEK TUTAR'}
                            </Text>
                            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                                ₺{formatCurrency(cashAdj.amount)}
                            </Text>
                            <Text style={{ color: '#DDD', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                                {cashAdj.type === 'request' ? 'Nakit Ödeme (İlave Ücret)' : 'Nakit Ödeme (Üste Para)'}
                            </Text>
                        </GlassCard>
                    )}

                    {/* C. Contractor Units Box */}
                    <GlassCard style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', borderColor: 'rgba(212, 175, 55, 0.3)', padding: 16 }}>
                        <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
                            MÜTEAHHİT FİRMAYA KALACAK DAİRELER
                        </Text>
                        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
                            {effectiveSelectedUnits.length > 0
                                ? effectiveSelectedUnits.map(uid => {
                                    // Find unit name from floorDetails if possible, or just ID
                                    // Helper to find name:
                                    let name = 'Bilinmeyen Daire';
                                    Object.values(floorDetails).flat().forEach(u => {
                                        if (u.id === uid) name = u.name;
                                    });
                                    return name;
                                }).join(', ')
                                : 'Seçim Yapılmadı'}
                        </Text>
                        <Text style={{ color: '#DDD', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                            {effectiveSelectedUnits.length} Adet Bağımsız Bölüm
                        </Text>
                    </GlassCard>

                </View>

                {/* 4. Offer Summary Text (Existing) - REMOVED per feedback (Duplicate info) */}
                {/* <OfferSummaryCard
                    selectedUnits={effectiveSelectedUnits}
                    floorDetails={floorDetails}
                    cashAdjustmentType={cashAdj.type}
                    cashAdjustmentAmount={cashAdj.amount}
                    campaignUnitCount={request?.campaign_unit_count}
                    campaignCommercialCount={request?.campaign_commercial_count}
                    isFlatForLand={true}
                    containerStyle={{ marginTop: 20 }}
                    viewerMode={viewerMode}
                /> */}

                {/* 3. Description & Notes */}
                {offer.offer_details && (
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.sectionTitle}>TEKLİF DETAYLARI VE NOTLAR</Text>
                        <GlassCard style={styles.card}>
                            <Text style={styles.noteText}>{offer.offer_details}</Text>
                        </GlassCard>
                    </View>
                )}

                {/* 4. Action Buttons */}
                {/* 4. Action Buttons - Hide if viewer is the contractor who made the offer */}
                {contractor?.id !== user?.id && (
                    <View style={{ marginTop: 30, gap: 12 }}>
                        <TouchableOpacity style={styles.primaryBtn}>
                            <LinearGradient
                                colors={['#D4AF37', '#B8860B']}
                                style={styles.gradientBtn}
                            >
                                <Text style={styles.primaryBtnText}>BU TEKLİFİ KABUL ET</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() => {
                                navigation.navigate('Chat', {
                                    receiver_id: contractor?.id,
                                    receiver_name: contractor?.company_name || contractor?.full_name || 'Müteahhit Firma',
                                    receiver_avatar: contractor?.avatar_url,
                                    request_id: request?.id,
                                    request_title: request?.title || 'Kentsel Dönüşüm Projesi'
                                });
                            }}
                        >
                            <MaterialCommunityIcons name="message-text-outline" size={20} color="#38BDF8" style={{ marginRight: 8 }} />
                            <Text style={[styles.secondaryBtnText, { color: '#38BDF8' }]}>FİRMA İLE GÖRÜŞ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.secondaryBtn, { borderColor: '#EF4444' }]}>
                            <Text style={[styles.secondaryBtnText, { color: '#EF4444' }]}>REDDET</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#D4AF37" size="large" />
            </View>
        );
    }

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.headerTitle}>{contractor?.company_name?.toUpperCase() || contractor?.full_name?.toUpperCase() || 'MÜTEAHHİT'}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name="check-decagram" size={14} color="#38BDF8" />
                            <Text style={{ color: '#BBB', fontSize: 11 }}>Onaylı Yüklenici</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.backBtn}>
                        <MaterialCommunityIcons name="dots-horizontal" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Tabs / Indicators - UPDATED TO BUTTONS */}
                {offers.length > 1 && (
                    <View style={{ marginTop: 10, height: 50 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, alignItems: 'center' }}>
                            {offers.map((_, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        {
                                            paddingVertical: 8,
                                            paddingHorizontal: 16,
                                            borderRadius: 20,
                                            backgroundColor: activeTab === index ? '#D4AF37' : '#333',
                                            borderWidth: 1,
                                            borderColor: activeTab === index ? '#D4AF37' : '#444'
                                        }
                                    ]}
                                    onPress={() => slidesRef.current?.scrollToIndex({ index: index, animated: true })}
                                >
                                    <Text style={{
                                        color: activeTab === index ? '#000' : '#FFF',
                                        fontWeight: 'bold',
                                        fontSize: 13
                                    }}>
                                        TEKLİF {index + 1}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
                {offers.length > 1 && (
                    <Text style={styles.swipeHint}>Farklı seçenekleri görmek için kaydırın</Text>
                )}

                {/* Carousel */}
                <Animated.FlatList
                    ref={slidesRef}
                    data={offers}
                    renderItem={renderOfferContent}
                    keyExtractor={item => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                />

                {/* Full Screen Schema Modal */}
                <Modal visible={isSchemaModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsSchemaModalVisible(false)}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 }}>
                        <TouchableOpacity style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }} onPress={() => setIsSchemaModalVisible(false)}>
                            <Ionicons name="close-circle" size={40} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 40, marginBottom: 20 }}>
                            DETAYLI KAT PLANI
                        </Text>
                        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                            <BuildingSchema
                                floorCount={offers[activeTab]?.floor_count}
                                floorDetails={offers[activeTab]?.floor_details_json?.floors || {}}
                                groundFloorType={offers[activeTab]?.floor_details_json?.groundFloor || 'apartment'}
                                isBasementResidential={offers[activeTab]?.is_basement_residential}
                                basementCount={offers[activeTab]?.basement_count || 0}
                                selectable={false}
                                selectedUnits={offers[activeTab]?.unit_breakdown?.selected_units || []}
                            />
                        </ScrollView>
                    </View>
                </Modal>

            </SafeAreaView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    headerTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },

    tabContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 10 },
    tabDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
    tabDotActive: { backgroundColor: '#D4AF37', width: 24 },
    swipeHint: { textAlign: 'center', color: '#666', fontSize: 10, marginBottom: 10, marginTop: 4 },

    card: { padding: 20, borderRadius: 16, marginBottom: 0 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    badge: { backgroundColor: '#D4AF37', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { color: '#000', fontSize: 10, fontWeight: 'bold' },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },

    label: { color: '#888', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
    priceValue: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
    priceWords: { color: '#666', fontSize: 11, fontStyle: 'italic' },
    value: { color: '#FFF', fontSize: 15, fontWeight: '600' },

    sectionTitle: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold', marginTop: 24, marginBottom: 12, marginLeft: 4 },
    schemaContainer: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 16, borderWidth: 1, borderColor: '#222' },

    noteText: { color: '#DDD', fontSize: 14, lineHeight: 22 },

    primaryBtn: { borderRadius: 12, overflow: 'hidden' },
    gradientBtn: { paddingVertical: 16, alignItems: 'center' },
    primaryBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },

    secondaryBtn: { flexDirection: 'row', paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#333', backgroundColor: 'rgba(255,255,255,0.05)' },
    secondaryBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
});
