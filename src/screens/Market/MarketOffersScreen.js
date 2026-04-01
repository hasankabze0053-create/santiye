import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Alert, Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function MarketOffersScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { request, bids } = route.params || {};

    // Per-group active offer index
    const [offerIndexMap, setOfferIndexMap] = useState({});

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
        
        if (notesText.includes('Stok: Hemen') || notesText.includes('Stok Durumu: Hemen')) parsed.stockStatus = 'immediate';
        else if (notesText.includes('Stok:') || notesText.includes('Stok Durumu:')) parsed.stockStatus = 'wait';

        parsed.vatIncluded = notesText.includes('KDV: Dahil') || notesText.includes('KDV: Dahili');

        if (notesText.includes('Nakliye: Alıcı') || notesText.includes('Nakliye Durumu: Alıcı')) parsed.shippingType = 'Alıcı Öder';
        else if (notesText.includes('Nakliye: Hariç') || notesText.includes('Nakliye Durumu: Hariç')) parsed.shippingType = 'Hariç';
        else if (notesText.includes('Nakliye:')) parsed.shippingType = 'Dahil';

        const feeMatch = notesText.match(/Nakliye.*?(\d+)\s*TL/);
        if (feeMatch) parsed.shippingFee = feeMatch[1];

        const vadeMatch = notesText.match(/(\[Vade:\s*(.*?)\]|Vade:\s*(.*?)(?=\n|$))/);
        if (vadeMatch) parsed.paymentTerm = vadeMatch[2] || vadeMatch[3];

        const validMatch = notesText.match(/Geçerlilik:\s*(\d+)/);
        if (validMatch) parsed.validity = parseInt(validMatch[1]) || 24;

        const pumpMatch = notesText.match(/Pompa.*?(\d+)/);
        if (pumpMatch) parsed.pumpFee = pumpMatch[1];

        return parsed;
    };

    // Group bids by provider
    const groupedBids = useMemo(() => {
        if (!bids || !Array.isArray(bids)) return [];
        const groups = {};
        bids.forEach(bid => {
            const pid = bid.provider_id || 'unknown';
            if (!groups[pid]) {
                groups[pid] = { provider_id: pid, provider: bid.provider, offers: [] };
            }
            groups[pid].offers.push(bid);
        });
        return Object.values(groups).sort((a, b) => {
            const minA = Math.min(...a.offers.map(o => parseFloat(o.price) || Infinity));
            const minB = Math.min(...b.offers.map(o => parseFloat(o.price) || Infinity));
            return minA - minB;
        });
    }, [bids]);

    const goTo = (pid, idx) => setOfferIndexMap(prev => ({ ...prev, [pid]: idx }));

    const calcTotal = (bid) => {
        const q = request?.items?.[0]?.quantity || request?.quantity || 1;
        let parsedQ = 1;
        if (typeof q === 'number') {
            parsedQ = q;
        } else if (typeof q === 'string') {
            let numStr = q.trim().split(/\s+/)[0]; 
            if (numStr.includes('.') && numStr.split('.')[1]?.length === 3) {
                numStr = numStr.replace(/\./g, '');
            }
            numStr = numStr.replace(/[^0-9.,]/g, '').replace(',', '.');
            parsedQ = parseFloat(numStr) || 1;
        }
        return (parseFloat(bid.price) || 0) * parsedQ;
    };

    if (!request || !bids) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text allowFontScaling={false} style={{ color: '#fff' }}>Veri bulunamadı.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#0a0f1e']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color="#FFF" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text allowFontScaling={false} style={styles.headerTitle}>GELEN TEKLİFLER</Text>
                        <Text allowFontScaling={false} style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                            {bids.length} teklif · {groupedBids.length} firma
                        </Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* ── Request Summary Card ── */}
                    <LinearGradient
                        colors={['rgba(30,41,59,0.9)', 'rgba(15,23,42,0.95)']}
                        style={styles.summaryCard}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(212,175,55,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' }}>
                                <MaterialCommunityIcons name="cube-outline" size={22} color="#FFD700" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 15, fontWeight: '800' }} numberOfLines={1}>
                                    {request.title || 'Toptan Malzeme Talebi'}
                                </Text>
                                <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                                    · {request.location?.replace('(Varsayılan)', '').trim()}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text allowFontScaling={false} style={{ color: '#FFD700', fontWeight: '900', fontSize: 22 }}>{bids.length}</Text>
                                <Text allowFontScaling={false} style={{ color: '#475569', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>TOPLAM TEKLİF</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* ── Bid Groups ── */}
                    {groupedBids.map((group, gIdx) => {
                        const pid = group.provider_id;
                        const total = group.offers.length;
                        const idx = offerIndexMap[pid] ?? 0;
                        const bid = group.offers[idx];
                        const parsed = parseBidNotes(bid.notes);
                        const totalAmnt = calcTotal(bid);
                        const unitPrice = parseFloat(bid.price) || 0;
                        const isLowest = gIdx === 0; // sorted by price, first = cheapest

                        return (
                            <View key={pid} style={[styles.groupCard, isLowest && { borderColor: 'rgba(255,215,0,0.35)' }]}>

                                {/* Cheapest badge */}
                                {isLowest && groupedBids.length > 1 && (
                                    <View style={{ position: 'absolute', top: -10, right: 16, backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4, zIndex: 2 }}>
                                        <Ionicons name="trophy" size={12} color="#000" />
                                        <Text allowFontScaling={false} style={{ color: '#000', fontWeight: '900', fontSize: 11 }}>EN UCUZ</Text>
                                    </View>
                                )}

                                {/* ── Firm Header ── */}
                                <View style={styles.firmHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <View style={styles.avatar}>
                                            <Text allowFontScaling={false} style={{ color: '#FFD700', fontWeight: '900', fontSize: 18 }}>
                                                {group.provider?.full_name ? group.provider.full_name.charAt(0).toUpperCase() : 'F'}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text allowFontScaling={false} style={styles.firmName}>{group.provider?.full_name || 'Tedarikçi Firma'}</Text>
                                            <Text allowFontScaling={false} style={styles.firmSub}>
                                                {total > 1 ? `${total} farklı seçenek sundu` : '1 teklif sundu'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* ── Offer Navigator (if >1) ── */}
                                {total > 1 && (
                                    <View style={styles.navigator}>
                                        <TouchableOpacity
                                            onPress={() => goTo(pid, idx - 1)}
                                            disabled={idx === 0}
                                            style={[styles.navBtn, { borderColor: idx === 0 ? '#1e293b' : 'rgba(255,215,0,0.35)', backgroundColor: idx === 0 ? 'transparent' : 'rgba(255,215,0,0.08)' }]}
                                        >
                                            <Ionicons name="chevron-back" size={16} color={idx === 0 ? '#1e293b' : '#FFD700'} />
                                        </TouchableOpacity>

                                        <View style={{ alignItems: 'center', gap: 5 }}>
                                            <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>
                                                SEÇİM {idx + 1} / {total}
                                            </Text>
                                            <View style={{ flexDirection: 'row', gap: 4 }}>
                                                {group.offers.map((_, i) => (
                                                    <TouchableOpacity key={i} onPress={() => goTo(pid, i)}>
                                                        <View style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? '#FFD700' : '#1e293b' }} />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => goTo(pid, idx + 1)}
                                            disabled={idx === total - 1}
                                            style={[styles.navBtn, { borderColor: idx === total-1 ? '#1e293b' : 'rgba(255,215,0,0.35)', backgroundColor: idx === total-1 ? 'transparent' : 'rgba(255,215,0,0.08)' }]}
                                        >
                                            <Ionicons name="chevron-forward" size={16} color={idx === total-1 ? '#1e293b' : '#FFD700'} />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Premium Raw Offer Detail */}
                                <View style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 20 }}>
                                    
                                    {/* Sipariş Detayı (Ne sipariş edildi?) */}
                                    <View style={{ marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                                                    <MaterialCommunityIcons name="cube-outline" size={26} color="#FFF" />
                                                </View>
                                                <View>
                                                    <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 }}>
                                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 }}>SİPARİŞ DETAYI</Text>
                                                    </View>
                                                    
                                                    {(() => {
                                                        let itemName = request?.items?.[0]?.product_name || request?.title || 'İstenen Malzeme';
                                                        let iBrand = null;
                                                        let iSpec = null;
                                                        const bMatch = itemName.match(/\[Marka:\s(.*?)\]/);
                                                        if (bMatch) { iBrand = bMatch[1]; itemName = itemName.replace(bMatch[0], '').trim(); }
                                                        const sMatch = itemName.match(/\[Özellik:\s(.*?)\]/);
                                                        if (sMatch) { iSpec = sMatch[1]; itemName = itemName.replace(sMatch[0], '').trim(); }
                                                        
                                                        return (
                                                            <View style={{ marginTop: 2 }}>
                                                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 18, fontWeight: '900' }}>{itemName}</Text>
                                                                {iBrand && <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 13, fontWeight: '600', marginTop: 4 }}>• İstenen Marka: {iBrand}</Text>}
                                                                {iSpec && <Text allowFontScaling={false} style={{ color: '#38bdf8', fontSize: 13, fontWeight: '600', marginTop: 2 }}>• İstenen Özellik: {iSpec}</Text>}
                                                            </View>
                                                        );
                                                    })()}
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>SİPARİŞ MİKTARI:</Text>
                                            <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 18, fontWeight: '900' }}>{request?.items?.[0]?.quantity || request?.quantity || '-'}</Text>
                                        </View>
                                    </View>

                                    {/* Firmanın Teklifi Başlık Alanı */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 8, paddingHorizontal: 4 }}>
                                        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255, 215, 0, 0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)' }}>
                                            <MaterialCommunityIcons name="handshake-outline" size={26} color="#FFD700" />
                                        </View>
                                        <View>
                                            <View style={{ backgroundColor: 'rgba(255, 215, 0, 0.15)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }}>
                                                <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 }}>FİRMANIN TEKLİFİ</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Fiyat Bilgisi */}
                                    <View style={{ backgroundColor: '#0a1628', borderRadius: 16, padding: 18, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#FFD700', borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }}>BİRİM FİYAT</Text>
                                            <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 34, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 }}>{unitPrice.toLocaleString('tr-TR')} ₺</Text>
                                            
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                                {parsed.vatIncluded ? (
                                                    <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 13, fontWeight: '800', backgroundColor: 'rgba(74,222,128,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>KDV Dahil</Text>
                                                ) : (
                                                    <Text allowFontScaling={false} style={{ color: '#fb923c', fontSize: 13, fontWeight: '800', backgroundColor: 'rgba(251,146,60,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>KDV</Text>
                                                )}
                                                {parsed.pumpFee && (
                                                    <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 12, fontWeight: 'bold', marginLeft: 8 }}>
                                                        & Pompa {parsed.pumpFee}₺
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        
                                        {totalAmnt > 0 && (
                                            <View style={{ alignItems: 'flex-end', justifyContent: 'center', paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)' }}>
                                                <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 6, textAlign: 'right', maxWidth: 100 }}>
                                                    {String(request?.items?.[0]?.quantity || request?.quantity || '').toUpperCase()} TOPLAM
                                                </Text>
                                                <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 26, fontWeight: '900', marginTop: 2 }}>≈ {totalAmnt.toLocaleString('tr-TR')} ₺</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Teklifin Seçimleri (Çipler) */}
                                    <View>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                            <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.25)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <MaterialCommunityIcons name="receipt" size={16} color="#D4AF37" />
                                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>KDV: {parsed.vatIncluded ? 'Dahil' : 'Hariç'}</Text>
                                            </View>
                                            <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.25)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <MaterialCommunityIcons name="truck-delivery-outline" size={16} color="#D4AF37" />
                                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>
                                                    Nakliye: {parsed.shippingType || 'Belirtilmedi'}
                                                    {parsed.shippingFee ? (
                                                        <Text style={{ color: '#FCD34D' }}>
                                                            {` (+${parseInt(parsed.shippingFee).toLocaleString('tr-TR')} ₺)`}
                                                        </Text>
                                                    ) : ''}
                                                </Text>
                                            </View>
                                            <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.25)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <MaterialCommunityIcons name="package-variant" size={16} color="#D4AF37" />
                                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Stok: {parsed.stockStatus === 'immediate' ? 'Hemen Teslim' : (parsed.stockStatus === 'wait' ? '~ 2-3 Gün' : 'Belirtilmedi')}</Text>
                                            </View>
                                            <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.25)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <MaterialCommunityIcons name="clock-outline" size={16} color="#D4AF37" />
                                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Vade: {parsed.paymentTerm || '—'}</Text>
                                            </View>
                                            <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.25)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <MaterialCommunityIcons name="shield-check-outline" size={16} color="#D4AF37" />
                                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Geçerlilik: {parsed.validity ? (parsed.validity >= 168 ? '1 Hafta' : `${parsed.validity} Saat`) : '24 Saat'}</Text>
                                            </View>
                                            {parsed.offerBrand && (
                                                <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.4)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Ionicons name="pricetag" size={16} color="#38bdf8" />
                                                    <Text allowFontScaling={false} style={{ color: '#38bdf8', fontSize: 13, fontWeight: '700' }}>Gelen Teklifteki Marka: {parsed.offerBrand}</Text>
                                                </View>
                                            )}
                                            {parsed.offerTechSpec && (
                                                <View style={{ backgroundColor: 'rgba(244, 114, 182, 0.1)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(244, 114, 182, 0.4)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <MaterialCommunityIcons name="tune-vertical-variant" size={16} color="#f472b6" />
                                                    <Text allowFontScaling={false} style={{ color: '#f472b6', fontSize: 13, fontWeight: '700' }}>Gelen Teklifteki Özellik: {parsed.offerTechSpec}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                {/* ── CTA Button ── */}
                                <TouchableOpacity
                                    style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 14, overflow: 'hidden' }}
                                    onPress={() =>
                                        Alert.alert(
                                            'Görüşme Sağla',
                                            `${group.provider?.full_name || 'Firma'} ile ${unitPrice.toLocaleString('tr-TR')} ₺/birim fiyat üzerinden görüşmek istiyor musunuz?`,
                                            [
                                                { text: 'Vazgeç', style: 'cancel' },
                                                { text: 'Evet, Görüş', style: 'default' },
                                            ]
                                        )
                                    }
                                    activeOpacity={0.85}
                                >
                                    <LinearGradient
                                        colors={['#FFD700', '#FF9100']}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                                    >
                                        <MaterialCommunityIcons name="chat-processing-outline" size={20} color="#000" />
                                        <Text allowFontScaling={false} style={{ color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 }}>
                                            GÖRÜŞME SAĞLA
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                            </View>
                        );
                    })}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { padding: 16, paddingTop: 8 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8
    },
    headerTitle: { color: '#FFD700', fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
    backBtn: {
        width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
        borderRadius: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b'
    },

    summaryCard: {
        borderRadius: 16, padding: 16, borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)', marginBottom: 20
    },

    groupCard: {
        backgroundColor: '#0f172a', borderRadius: 20, borderWidth: 1,
        borderColor: '#1e293b', marginBottom: 20, overflow: 'hidden', paddingTop: 4
    },
    firmHeader: {
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#1e293b'
    },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,215,0,0.1)', borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.25)', alignItems: 'center', justifyContent: 'center'
    },
    firmName: { color: '#fff', fontSize: 15, fontWeight: '800' },
    firmSub: { color: '#475569', fontSize: 12, marginTop: 2 },

    navigator: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginHorizontal: 16, marginTop: 12, marginBottom: 4,
        backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
        paddingVertical: 10, paddingHorizontal: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)'
    },
    navBtn: {
        width: 36, height: 36, borderRadius: 10, alignItems: 'center',
        justifyContent: 'center', borderWidth: 1
    },

    priceCard: {
        marginHorizontal: 16, marginTop: 14, marginBottom: 14,
        backgroundColor: '#0a1628', borderRadius: 16, padding: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        borderLeftWidth: 3, borderLeftColor: '#FFD700',
        borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)'
    },

    infoGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        marginHorizontal: 16, marginBottom: 16, gap: 8
    },
    infoCell: {
        flex: 1, minWidth: '45%', backgroundColor: '#111827', borderRadius: 12,
        padding: 12, borderWidth: 1, borderColor: '#1e293b'
    },
    infoCellLabel: { color: '#334155', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
    infoCellValue: { color: '#e2e8f0', fontSize: 13, fontWeight: '700' },
});
