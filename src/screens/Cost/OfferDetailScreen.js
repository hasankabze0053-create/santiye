
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Linking,
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
import OfferSummaryCard from '../../components/OfferSummaryCard';
import PremiumBackground from '../../components/PremiumBackground';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import SharedRequestDetail from '../../components/SharedRequestDetail';

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
    const { request, request_id, contractor_id, offers: initialOffers, initialOfferIndex = 0, isAdminView = false, isMarket = false } = route.params || {};

    const [loading, setLoading] = useState(!initialOffers);
    const [offers, setOffers] = useState(initialOffers || []); // Array of offer objects
    const [contractor, setContractor] = useState(null);
    const [activeTab, setActiveTab] = useState(initialOfferIndex); // Index of currently viewed offer
    const [isSchemaModalVisible, setIsSchemaModalVisible] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
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

            if (!request_id || !contractor_id || request_id === 'undefined' || contractor_id === 'undefined') {
                console.warn('Skipping fetchOffers due to invalid IDs', { request_id, contractor_id });
                setLoading(false);
                return;
            }

            // 1. Fetch Offers
            const { data: offersData, error: offersError } = await supabase
                .from('construction_offers')
                .select('*, profiles:profiles!contractor_id(*)') // Fetch profile joined with hint
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

    // --- PROFOSYONEL PARSING MANTIĞI ---
    const parseBidNotes = (notesText) => {
        if (!notesText) return {};
        const parsed = {};
        const brandMatch = notesText.match(/\[Marka:\s*(.*?)\]/);
        if (brandMatch) parsed.offerBrand = brandMatch[1].trim();
        const providerBrandMatch = notesText.match(/(?<!\[)Marka:\s*(.*?)(?=\n|$|\[)/);
        if (providerBrandMatch) parsed.providerBrand = providerBrandMatch[1].trim();
        const specMatch = notesText.match(/\[Özellik:\s*(.*?)\]/);
        if (specMatch) parsed.offerTechSpec = specMatch[1].trim();
        const providerSpecMatch = notesText.match(/(?<!\[)Özellik:\s*(.*?)(?=\n|$|\[)/);
        if (providerSpecMatch) parsed.providerTechSpec = providerSpecMatch[1].trim();
        if (notesText.includes('Stok: Hemen') || notesText.includes('Stok Durumu: Hemen')) parsed.stockStatus = 'Hemen Teslim';
        else if (notesText.includes('Stok:') || notesText.includes('Stok Durumu:')) parsed.stockStatus = 'Beklemeli';
        parsed.vatIncluded = notesText.includes('KDV: Dahil') || notesText.includes('KDV: Dahili');
        if (notesText.includes('Nakliye: Alıcı') || notesText.includes('Nakliye Durumu: Alıcı')) parsed.shippingType = 'Alıcı Öder';
        else if (notesText.includes('Nakliye: Hariç') || notesText.includes('Nakliye Durumu: Hariç')) parsed.shippingType = 'Hariç';
        else if (notesText.includes('Nakliye:')) parsed.shippingType = 'Dahil';
        const feeMatch = notesText.match(/Nakliye.*?(\d+)\s*TL/);
        if (feeMatch) parsed.shippingFee = feeMatch[1];
        const vadeMatch = notesText.match(/(\[Vade:\s*(.*?)\]|Vade:\s*(.*?)(?=\n|$))/);
        if (vadeMatch) parsed.paymentTerm = vadeMatch[2] || vadeMatch[3];
        const validMatch = notesText.match(/Geçerlilik:\s*(\d+)/);
        if (validMatch) parsed.validity = validMatch[1] || '48';
        return parsed;
    };

    const getField = (tag) => {
        if (!request?.description) return null;
        const regexNew = new RegExp(`\\[${tag}\\]\\s*(.*)`, 'i');
        const matchNew = request.description.match(regexNew);
        if (matchNew) return matchNew[1].trim();

        const regexOld = new RegExp(`${tag}:\\s*(.*)`, 'i');
        const matchOld = request.description.match(regexOld);
        if (matchOld) return matchOld[1].trim();
        return null;
    };

    const renderOfferContent = ({ item: offer, index }) => {
        const isTadilat = request?.offer_type === 'anahtar_teslim_tadilat' || offer.offer_type === 'anahtar_teslim_tadilat';
        
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

            // Fallback 2: Representative selection (keep for robustness)
            if (selectedUnits.length > 0) {
                const count = selectedUnits.length;
                const candidates = allUnits.filter(u => u.type === 'apartment' || u.type === 'residence');

                if (candidates.length >= count) {
                    return candidates.slice(candidates.length - count).map(u => u.id);
                }
                return allUnits.slice(allUnits.length - count).map(u => u.id);
            }
            return selectedUnits;
        };

        const effectiveSelectedUnits = normalizeSelectedUnits();

        const isFlatForLand = !(offer.price_estimate > 0);

        // Tadilat Fields
        const projeTipi = getField('PROJE TİPİ') || 'Anahtar Teslim Tadilat';
        const kapsam = getField('KAPSAM') || getField('HİZMETLER') || '-';
        const durum = getField('DURUM') || getField('YENİLEME') || '-';
        const teknik = getField('TEKNİK') || getField('MEKAN') || '-';
        const tarz = getField('TASARIM') || getField('TARZ') || 'Belirtilmedi';
        const butce = getField('BÜTÇE') || '-';
        const lokasyon = getField('LOKASYON') || (request?.district ? `${request.district}, ${request.city}` : (request?.city || 'Belirtilmedi'));
        const teknikItems = teknik.split('|').map(s => s.trim()).filter(Boolean);

        if (isMarket) {
            const parsed = parseBidNotes(offer.notes);
            const unitPrice = parseFloat(offer.price) || 0;
            const quantityVal = request?.items?.[0]?.quantity || request?.quantity || 1;
            const totalAmnt = unitPrice * (parseFloat(String(quantityVal).split(' ')[0]) || 1);
            let itemName = request?.items?.[0]?.product_name || request?.title || 'Malzeme Talebi';
            itemName = itemName.replace(/\[Marka:.*?\]/g, '').replace(/\[Özellik:.*?\]/g, '').trim();

            return (
                <ScrollView style={{ width: width, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                    {/* Firm Info - Common */}
                    <GlassCard style={styles.firmCard}>
                        <View style={styles.firmHeaderRow}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarPlaceholder}><MaterialCommunityIcons name="store-outline" size={24} color="#D4AF37" /></View>
                                <View style={styles.onlineBadge} />
                            </View>
                            <View style={styles.firmMeta}>
                                <Text allowFontScaling={false} style={styles.firmLabel}>TEDARİKÇİ FİRMA</Text>
                                <View style={styles.nameRow}>
                                    <Text allowFontScaling={false} style={styles.firmName}>{contractor?.company_name || contractor?.full_name || 'Tedarikçi'}</Text>
                                    <MaterialCommunityIcons name="check-decagram" size={18} color="#34D399" style={{ marginLeft: 6 }} />
                                </View>
                                <View style={styles.statusRow}>
                                    <View style={styles.dot} /><Text allowFontScaling={false} style={styles.statusText}>Aktif Satıcı Üye</Text>
                                </View>
                            </View>
                        </View>
                        {isAdminView && (
                            <TouchableOpacity style={[styles.adminRequestBtn, { marginTop: 15, marginBottom: 5 }]} onPress={() => setShowRequestModal(true)}>
                                <MaterialCommunityIcons name="file-document-outline" size={18} color="#D4AF37" />
                                <Text allowFontScaling={false} style={styles.adminRequestBtnText}>TALEBİ GÖRÜNTÜLE</Text>
                                <Ionicons name="chevron-forward" size={14} color="#D4AF37" style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        )}
                    </GlassCard>

                    {/* Market Offer Card Parity */}
                    <GlassCard style={{ padding: 18, borderRadius: 20, borderColor: 'rgba(255, 215, 0, 0.2)', borderWidth: 1, backgroundColor: 'rgba(255, 215, 0, 0.03)', marginTop: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                             <View style={{ backgroundColor: 'rgba(255, 215, 0, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                                <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 11, fontWeight: '900', letterSpacing: 1 }}>TEKLİF DETAYI</Text>
                             </View>
                             <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11, fontWeight: 'bold' }}>#{offer.id?.substring(0,8).toUpperCase()}</Text>
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text allowFontScaling={false} style={{ color: '#888', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>MALZEME</Text>
                            <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>{itemName}</Text>
                            
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                                {(parsed.providerBrand || parsed.offerBrand) && (
                                    <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <MaterialCommunityIcons name="tag-outline" size={14} color="#38bdf8" />
                                        <Text allowFontScaling={false} style={{ color: '#38bdf8', fontSize: 12, fontWeight: 'bold' }}>Marka: {parsed.providerBrand || parsed.offerBrand}</Text>
                                    </View>
                                )}
                                {(parsed.providerTechSpec || parsed.offerTechSpec) && (
                                    <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <MaterialCommunityIcons name="tune-variant" size={14} color="#a855f7" />
                                        <Text allowFontScaling={false} style={{ color: '#a855f7', fontSize: 12, fontWeight: 'bold' }}>Özellik: {parsed.providerTechSpec || parsed.offerTechSpec}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 20 }} />

                        <View style={{ flexDirection: 'row', gap: 20, marginBottom: 20 }}>
                            <View style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={{ color: '#888', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>MİKTAR</Text>
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 18, fontWeight: '900' }}>{quantityVal}</Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <Text allowFontScaling={false} style={{ color: '#888', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>BİRİM FİYAT</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                                    <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 24, fontWeight: '900' }}>{unitPrice.toLocaleString('tr-TR')} ₺</Text>
                                    <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 12, fontWeight: 'bold' }}>{parsed.vatIncluded ? '(KDV Dahil)' : '(+KDV)'}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 15, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                             <View style={{ width: '47%' }}>
                                <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>STOK</Text>
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>{parsed.stockStatus || 'Hemen Teslim'}</Text>
                             </View>
                             <View style={{ width: '47%' }}>
                                <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>NAKLİYE</Text>
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>{parsed.shippingType || 'Hariç'}</Text>
                             </View>
                             <View style={{ width: '47%' }}>
                                <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>VADE</Text>
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>{parsed.paymentTerm || 'EFT'}</Text>
                             </View>
                             <View style={{ width: '47%' }}>
                                <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>GEÇERLİLİK</Text>
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>{parsed.validity || '48'} Saat</Text>
                             </View>
                        </View>

                        <View style={{ marginTop: 20, backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 12, fontWeight: 'bold' }}>TOPLAM TEKLİF TUTARI</Text>
                            <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 20, fontWeight: '900' }}>{totalAmnt.toLocaleString('tr-TR')} ₺</Text>
                        </View>
                    </GlassCard>
                </ScrollView>
            );
        }

        return (
            <ScrollView
                style={{ width: width, paddingHorizontal: 20 }}
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
            >
                {/* 0. Firm Info Section */}
                <GlassCard style={styles.firmCard}>
                    <View style={styles.firmHeaderRow}>
                        <View style={styles.avatarContainer}>
                            {contractor?.avatar_url ? (
                                <View style={styles.avatarPlaceholder}>
                                    <MaterialCommunityIcons name="office-building" size={24} color="#D4AF37" />
                                </View>
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <MaterialCommunityIcons name="office-building" size={24} color="#D4AF37" />
                                </View>
                            )}
                            <View style={styles.onlineBadge} />
                        </View>
                        <View style={styles.firmMeta}>
                            <Text allowFontScaling={false} numberOfLines={1} style={styles.firmLabel}>
                                {contractor?.company_name || contractor?.full_name || 'MÜTEAHHİT FİRMA'}
                            </Text>
                            <View style={styles.nameRow}>
                                <Text allowFontScaling={false} style={styles.firmName}>
                                    {contractor?.company_name || contractor?.full_name || 'Müteahhit Firma'}
                                </Text>
                                <MaterialCommunityIcons name="check-decagram" size={18} color="#38BDF8" style={{ marginLeft: 6 }} />
                            </View>
                            <View style={styles.statusRow}>
                                <View style={styles.dot} />
                                <Text style={styles.statusText}>Aktif Kurumsal Üye</Text>
                            </View>
                        </View>
                    </View>

                    {isAdminView && (
                        <TouchableOpacity 
                            style={[styles.adminRequestBtn, { marginTop: 15, marginBottom: 5 }]}
                            onPress={() => setShowRequestModal(true)}
                        >
                            <MaterialCommunityIcons name="file-document-outline" size={18} color="#D4AF37" />
                            <Text style={styles.adminRequestBtnText}>TALEBİ GÖRÜNTÜLE</Text>
                            <Ionicons name="chevron-forward" size={14} color="#D4AF37" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        style={styles.visitBtn}
                        onPress={() => navigation.navigate('ProviderPublicProfile', { providerId: contractor?.id })}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="store-outline" size={18} color="#D4AF37" style={{ marginRight: 8 }} />
                            <Text allowFontScaling={false} style={styles.visitBtnText}>Firma Sayfasını Ziyaret Et</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#D4AF37" />
                    </TouchableOpacity>
                </GlassCard>

                {/* 1. Price & Duration Summary */}
                <GlassCard style={[styles.card, isTadilat && { borderColor: '#4CAF50', borderLeftWidth: 4 }]}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name={isTadilat ? "home-edit" : "star-circle"} size={24} color={isTadilat ? "#4CAF50" : "#D4AF37"} />
                        <Text allowFontScaling={false} style={styles.cardTitle}>TEKLİF #{index + 1}</Text>
                        <View style={{ flex: 1 }} />
                        <View style={[styles.badge, isTadilat && { backgroundColor: '#4CAF50' }]}>
                            <Text allowFontScaling={false} style={styles.badgeText}>YENİ TEKLİF</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Financials */}
                    {offer.price_estimate > 0 ? (
                        <View>
                            <Text allowFontScaling={false} style={styles.label}>TAHMİNİ FİYAT</Text>
                            <Text allowFontScaling={false} style={[styles.priceValue, isTadilat && { color: '#4CAF50' }]}>{formatCurrency(offer.price_estimate)} TL</Text>
                            <Text allowFontScaling={false} style={styles.priceWords}>{numberToTurkishWords(offer.price_estimate)}</Text>
                        </View>
                    ) : (
                        <View>
                            <Text allowFontScaling={false} style={styles.label}>KAT KARŞILIĞI PAYLAŞIM MODELİ</Text>
                        </View>
                    )}
                </GlassCard>

                {/* 2. Visual Building Schema (Only for Construction) */}
                {!isTadilat && (
                    <>
                        <Text allowFontScaling={false} style={styles.sectionTitle}>MİMARİ GÖRSELLEŞTİRME</Text>
                        <View style={styles.schemaContainer}>
                            <BuildingSchema
                                floorCount={offer.floor_count}
                                floorDetails={floorDetails}
                                groundFloorType={groundFloorType}
                                isBasementResidential={offer.is_basement_residential}
                                basementCount={offer.basement_count || 0}
                                selectable={false}
                                selectedUnits={effectiveSelectedUnits}
                                campaignData={{
                                    unitCount: request?.campaign_unit_count || 0,
                                    commercialCount: request?.campaign_commercial_count || 0
                                }}
                                cashAdjustment={{
                                    type: cashAdj.type || 'none',
                                    amount: cashAdj.amount || 0
                                }}
                                showColors={true}
                                hideDetails={false}
                                legendLabel={contractor?.id === user?.id ? 'Müteahhit (Siz)' : 'Müteahhit Firma'}
                                isFlatForLand={isFlatForLand}
                                turnkeyData={{
                                    totalPrice: offer.price_estimate || 0,
                                    campaignPolicy: offer.campaign_policy || 'standard'
                                }}
                            />
                        </View>
                    </>
                )}

                {/* 3. Offer Summary Text */}
                <OfferSummaryCard
                    selectedUnits={effectiveSelectedUnits}
                    floorDetails={floorDetails}
                    cashAdjustmentType={cashAdj.type}
                    cashAdjustmentAmount={cashAdj.amount}
                    campaignUnitCount={request?.campaign_unit_count}
                    campaignCommercialCount={request?.campaign_commercial_count}
                    isFlatForLand={isFlatForLand}
                    totalPrice={offer.price_estimate}
                    campaignPolicy={offer.campaign_policy}
                    containerStyle={{ marginTop: 20 }}
                    viewerMode={viewerMode}
                    offerType={request?.offer_type || offer.offer_type}
                />

                {/* 4. Tadilat Talep Detayları (Added for Professionalism) */}
                {isTadilat && (
                    <View style={{ marginTop: 24 }}>
                        <Text allowFontScaling={false} style={styles.sectionTitle}>TALEBİMİN ÖZETİ</Text>
                        <GlassCard style={{ padding: 20, borderRadius: 16, borderLeftWidth: 4, borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.02)' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                                <View>
                                    <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10, fontWeight: 'bold' }}>PROJE TİPİ</Text>
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>{projeTipi}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10, fontWeight: 'bold' }}>KONUM</Text>
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>{lokasyon}</Text>
                                </View>
                            </View>
                            
                            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 15 }} />
                            
                            <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 8 }}>İSTENEN İŞLEMLER</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {teknikItems.map((item, idx) => (
                                    <View key={idx} style={{ backgroundColor: 'rgba(255,215,0,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' }}>
                                        <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 11, fontWeight: 'bold' }}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </GlassCard>
                    </View>
                )}

                {/* 3. Description & Notes */}
                {offer.offer_details && (
                    <View style={{ marginTop: 20 }}>
                        <Text allowFontScaling={false} style={styles.sectionTitle}>TEKLİF DETAYLARI VE NOTLAR</Text>
                        <GlassCard style={styles.card}>
                            <Text allowFontScaling={false} style={styles.noteText}>{offer.offer_details}</Text>
                        </GlassCard>
                    </View>
                )}

                {/* 4. Action Buttons */}
                {contractor?.id !== user?.id && !isAdminView && (
                    <View style={{ marginTop: 30, gap: 12 }}>
                        {/* Info Note */}
                        <GlassCard style={styles.infoNoteCard}>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <MaterialCommunityIcons name="shield-check" size={20} color="#D4AF37" />
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={styles.infoNoteTitle}>GÜVENLİ İLETİŞİM NOTU</Text>
                                    <Text allowFontScaling={false} style={styles.infoNoteText}>
                                        İletişim bilgileriniz şimdiye kadar teklif veren firmayla güvenliğinizi korumak amaçlı <Text style={styles.redEmphasis}>PAYLAŞILMAMIŞTIR</Text>. 
                                        Ön teklif sonrası görüşmek isterseniz iletişim bilgilerinizi <Text style={styles.greenEmphasis}>PAYLAŞABİLİR</Text> ya da siz firmayı <Text style={styles.greenEmphasis}>ARAYABİLİRSİNİZ.</Text>
                                    </Text>
                                </View>
                            </View>
                        </GlassCard>

                        <TouchableOpacity 
                            style={styles.primaryBtn}
                            onPress={() => {
                                Alert.alert(
                                    'İletişim Bilgileri',
                                    'İletişim bilgileriniz firma ile paylaşılacaktır. Onaylıyor musunuz?',
                                    [
                                        { text: 'Vazgeç', style: 'cancel' },
                                        { text: 'Paylaş', onPress: () => Alert.alert('Başarılı', 'Bilgileriniz iletildi. Firma sizinle iletişime geçecektir.') }
                                    ]
                                );
                            }}
                        >
                            <LinearGradient
                                colors={['#D4AF37', '#B8860B']}
                                style={styles.gradientBtn}
                            >
                                <Text allowFontScaling={false} style={styles.primaryBtnText}>İLETİŞİM BİLGİLERİNİ PAYLAŞ</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.callBtn}
                                onPress={() => {
                                    if (contractor?.phone) {
                                        Linking.openURL(`tel:${contractor.phone}`);
                                    } else {
                                        Alert.alert('Hata', 'Firma telefon numarası bulunamadı.');
                                    }
                                }}
                            >
                                <MaterialCommunityIcons name="phone" size={20} color="#4CAF50" style={{ marginRight: 8 }} />
                                <Text allowFontScaling={false} style={[styles.secondaryBtnText, { color: '#4CAF50' }]}>ARA</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.messageBtn}
                                onPress={() => {
                                    navigation.navigate('Chat', {
                                        receiver_id: contractor?.id || contractor_id,
                                        receiver_name: contractor?.company_name || contractor?.full_name || 'Müteahhit Firma',
                                        receiver_avatar: contractor?.avatar_url,
                                        request_id: request?.id || request_id,
                                        request_title: request?.title || 'Kentsel Dönüşüm Projesi'
                                    });
                                }}
                            >
                                <MaterialCommunityIcons name="message-text" size={20} color="#2196F3" style={{ marginRight: 8 }} />
                                <Text allowFontScaling={false} style={[styles.secondaryBtnText, { color: '#2196F3' }]}>MESAJ AT</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[styles.secondaryBtn, { borderColor: '#EF4444' }]}>
                            <Text allowFontScaling={false} style={[styles.secondaryBtnText, { color: '#EF4444' }]}>REDDET</Text>
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
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        style={styles.backBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text allowFontScaling={false} style={styles.headerTitle}>{contractor?.company_name?.toUpperCase() || contractor?.full_name?.toUpperCase() || 'MÜTEAHHİT'}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name="check-decagram" size={14} color="#D4AF37" />
                            <Text allowFontScaling={false} style={{ color: '#BBB', fontSize: 11 }}>
                                {request?.offer_type === 'anahtar_teslim_tadilat' ? 'Onaylı Tadilat Firması' : 'Onaylı Yüklenici'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.backBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialCommunityIcons name="dots-horizontal" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Tabs / Indicators - UPDATED TO BUTTONS */}
                {offers.length > 1 && (
                    <View style={{ marginTop: 10, height: 50 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, alignItems: 'center' }}>
                            {offers.map((offer, index) => (
                                <TouchableOpacity
                                    key={offer.id || `offer-${index}`}
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
                                    <Text allowFontScaling={false} style={{
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
                    <Text allowFontScaling={false} style={styles.swipeHint}>Farklı seçenekleri görmek için kaydırın</Text>
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
                        <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 40, marginBottom: 20 }}>
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

                {/* Shared Request Detail Modal for Admin */}
                <Modal 
                    visible={showRequestModal} 
                    animationType="slide" 
                    transparent={true} 
                    onRequestClose={() => setShowRequestModal(false)}
                >
                    <View style={{ flex: 1, backgroundColor: '#000' }}>
                        <SharedRequestDetail
                            request={request}
                            type={request?.offer_type === 'anahtar_teslim_tadilat' ? 'construction' : 'construction'} // Handle mapping
                            isAdmin={true}
                            showActions={false}
                            navigation={{
                                ...navigation,
                                goBack: () => setShowRequestModal(false)
                            }}
                        />
                    </View>
                </Modal>

            </SafeAreaView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 15, 
        paddingVertical: 15 
    },
    headerTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    backBtn: { 
        width: 44, 
        height: 44, 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: 22, 
        backgroundColor: 'rgba(255,255,255,0.12)',
        marginLeft: 5
    },

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
    subValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
    value: { color: '#FFF', fontSize: 15, fontWeight: '600' },

    sectionTitle: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold', marginTop: 24, marginBottom: 12, marginLeft: 4 },
    schemaContainer: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 0, borderRadius: 16, borderWidth: 1, borderColor: '#222', overflow: 'hidden' },

    noteText: { color: '#DDD', fontSize: 14, lineHeight: 22 },
    infoNoteCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(212,175,55,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.2)',
        marginBottom: 8,
    },
    infoNoteTitle: {
        color: '#D4AF37',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    infoNoteText: {
        color: '#BBB',
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '500',
    },
    redEmphasis: {
        color: '#FF4444',
        fontWeight: 'bold',
    },
    greenEmphasis: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    firmCard: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.15)',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    firmHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 15,
    },
    avatarPlaceholder: {
        width: 54,
        height: 54,
        borderRadius: 16,
        backgroundColor: 'rgba(212,175,55,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.3)',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#121212',
    },
    firmMeta: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CAF50',
        marginRight: 6,
    },
    statusText: {
        color: '#888',
        fontSize: 11,
        fontWeight: '500',
    },
    firmLabel: {
        color: '#D4AF37',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.2,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    firmName: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    visitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: 'rgba(212,175,55,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.25)',
    },
    visitBtnText: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: 'bold',
    },

    adminRequestBtn: {
        backgroundColor: 'rgba(212,175,55,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.3)',
    },
    adminRequestBtnText: {
        color: '#D4AF37',
        fontSize: 10,
        fontWeight: 'bold',
    },

    primaryBtn: { borderRadius: 12, overflow: 'hidden' },
    gradientBtn: { paddingVertical: 16, alignItems: 'center' },
    primaryBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },

    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    callBtn: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.4)',
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
    },
    messageBtn: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(33, 150, 243, 0.4)',
        backgroundColor: 'rgba(33, 150, 243, 0.05)',
    },

    secondaryBtn: { flexDirection: 'row', paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#333', backgroundColor: 'rgba(255,255,255,0.05)' },
    secondaryBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
});
