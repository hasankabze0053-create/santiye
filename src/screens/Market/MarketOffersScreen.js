import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MarketOffersScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { request, bids } = route.params || {};
    
    // Support parsing notes similar to Provider screens
    const parseBidNotes = (notesText) => {
        if (!notesText) return {};
        const parsed = {};
        
        const lines = notesText.split('\n');
        lines.forEach(line => {
            if (line.includes('[Marka:')) parsed.offerBrand = line.replace('[Marka: ', '').replace(']', '').trim();
            else if (line.includes('[Özellik:')) parsed.offerTechSpec = line.replace('[Özellik: ', '').replace(']', '').trim();
            else if (line.includes('[Durum:')) parsed.stockStatus = line.includes('Hemen Teslim') ? 'immediate' : 'wait';
            else if (line.includes('[KDV:')) parsed.vatIncluded = line.includes('Dahil');
            else if (line.includes('[Nakliye:')) {
                const parts = line.replace(/\[Nakliye: |\]/g, '').split(' - ');
                parsed.shippingType = parts[0];
                if (parts[1]) parsed.shippingFee = parts[1].replace('TL', '').trim();
            }
            else if (line.includes('[Vade:')) parsed.paymentTerm = line.replace('[Vade: ', '').replace(']', '').trim();
            else if (line.includes('[Geçerlilik:')) parsed.validity = parseInt(line.replace(/[^0-9]/g, '')) || 24;
            else if (line.includes('[Pompa:')) parsed.pumpFee = line.replace('[Pompa: ', '').replace(']', '').trim();
            else if (line.includes('[Döküm Tarihi:')) parsed.deliveryDate = line.replace('[Döküm Tarihi: ', '').replace(']', '').trim();
        });
        
        const textNotes = lines.filter(l => !l.startsWith('[') || !l.endsWith(']')).join('\n').trim();
        if (textNotes) parsed.bidNotes = textNotes;
        
        return parsed;
    };

    // Group bids by provider
    const groupedBids = useMemo(() => {
        if (!bids || !Array.isArray(bids)) return [];
        const groups = {};
        
        bids.forEach(bid => {
            const providerId = bid.provider_id || 'unknown';
            if (!groups[providerId]) {
                groups[providerId] = {
                    provider_id: providerId,
                    provider: bid.provider,
                    offers: []
                };
            }
            groups[providerId].offers.push(bid);
        });

        // Convert to array and sort by number of offers (or anything else)
        return Object.values(groups).sort((a, b) => b.offers.length - a.offers.length);
    }, [bids]);

    if (!request || !bids) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text allowFontScaling={false} style={styles.headerTitle}>Hata</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text allowFontScaling={false} style={{ color: '#fff' }}>Veri bulunamadı.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text allowFontScaling={false} style={styles.headerTitle}>GELEN TEKLİFLER</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.summaryCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="cube-outline" size={28} color="#D4AF37" />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text allowFontScaling={false} style={styles.summaryTitle}>{request.title || 'Talep'}</Text>
                                <Text allowFontScaling={false} style={styles.summarySub}>{request.items?.[0]?.quantity} {request.items?.[0]?.unit} • {request.location?.replace('(Varsayılan)', '').trim()}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text allowFontScaling={false} style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 20 }}>{bids.length}</Text>
                                <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10 }}>TOPLAM TEKLİF</Text>
                            </View>
                        </View>
                    </View>

                    {groupedBids.map((group, idx) => (
                        <View key={group.provider_id + idx} style={styles.groupCard}>
                            {/* FIRM HEADER */}
                            <View style={styles.firmHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={styles.avatar}>
                                        <Text allowFontScaling={false} style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 18 }}>
                                            {group.provider?.full_name ? group.provider.full_name.charAt(0).toUpperCase() : 'F'}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text allowFontScaling={false} style={styles.firmName}>{group.provider?.full_name || 'İsimsiz Firma'}</Text>
                                        <Text allowFontScaling={false} style={styles.firmOffersCount}>{group.offers.length} Farklı Seçenek Sundu</Text>
                                    </View>
                                </View>
                            </View>

                            {/* FIRM BIDS (Horizontally Scrollable if multiple) */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
                                {group.offers.map((bid, offerIdx) => {
                                    const parsed = parseBidNotes(bid.notes);
                                    
                                    // Parse Qty for total calculation
                                    const q = request.items?.[0]?.quantity;
                                    let parsedQ = 0;
                                    if (typeof q === 'number') parsedQ = q;
                                    else if (typeof q === 'string') {
                                        const numPart = q.trim().split(/\s+/)[0];
                                        parsedQ = parseFloat(numPart.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
                                    }
                                    const unitPrice = parseFloat(bid.price) || 0;
                                    const totalAmnt = unitPrice * parsedQ;

                                    return (
                                        <View key={bid.id} style={[styles.offerCard, { width: group.offers.length > 1 ? 280 : '100%' }]}>
                                            {/* Top Tags - Option # and Brand/Spec badges */}
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                                                    <View style={[styles.badge, { backgroundColor: 'rgba(212, 175, 55, 0.15)', borderColor: '#D4AF37' }]}>
                                                        <Text allowFontScaling={false} style={[styles.badgeText, { color: '#D4AF37' }]}>Seçenek {offerIdx + 1}</Text>
                                                    </View>
                                                    {parsed.offerBrand && (
                                                        <View style={styles.badge}>
                                                            <MaterialCommunityIcons name="domain" size={12} color="#94a3b8" />
                                                            <Text allowFontScaling={false} style={styles.badgeText}>{parsed.offerBrand}</Text>
                                                        </View>
                                                    )}
                                                    {parsed.offerTechSpec && (
                                                        <View style={styles.badge}>
                                                            <MaterialCommunityIcons name="cog" size={12} color="#94a3b8" />
                                                            <Text allowFontScaling={false} style={styles.badgeText}>{parsed.offerTechSpec}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>

                                            {/* Price Focus */}
                                            <View style={{ backgroundColor: '#161616', padding: 12, borderRadius: 12, marginBottom: 12 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text allowFontScaling={false} style={{ color: '#888', fontSize: 11, fontWeight: 'bold' }}>BİRİM FİYAT</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>{unitPrice.toLocaleString('tr-TR')} ₺</Text>
                                                        <View style={{ backgroundColor: '#222', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                            <Text allowFontScaling={false} style={{ color: parsed.vatIncluded ? '#4ADE80' : '#EF4444', fontSize: 9, fontWeight: 'bold' }}>
                                                                {parsed.vatIncluded ? 'KDV DAHİL' : '+ KDV'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ height: 1, backgroundColor: '#222', marginVertical: 8 }} />
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text allowFontScaling={false} style={{ color: '#F1F5F9', fontSize: 12, fontWeight: 'bold' }}>TOPLAM TUTAR</Text>
                                                    <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 20, fontWeight: '900' }}>≈ {totalAmnt.toLocaleString('tr-TR')} ₺</Text>
                                                </View>
                                            </View>
                                            
                                            {/* Other Features */}
                                            <View style={{ gap: 8 }}>
                                                <View style={styles.featureRow}>
                                                    <MaterialCommunityIcons name="truck-outline" size={14} color="#888" />
                                                    <Text allowFontScaling={false} style={styles.featureText}>Nakliye: {parsed.shippingType || 'Belirtilmedi'} {parsed.shippingFee ? `(${parsed.shippingFee} TL)` : ''}</Text>
                                                </View>
                                                <View style={styles.featureRow}>
                                                    <MaterialCommunityIcons name="credit-card-outline" size={14} color="#888" />
                                                    <Text allowFontScaling={false} style={styles.featureText}>Vade: {parsed.paymentTerm || 'Belirtilmedi'}</Text>
                                                </View>
                                                <View style={styles.featureRow}>
                                                    <MaterialCommunityIcons name="package-variant-closed" size={14} color="#888" />
                                                    <Text allowFontScaling={false} style={styles.featureText}>Stok: {parsed.stockStatus === 'immediate' ? 'Hemen Teslim' : (parsed.stockStatus === 'wait' ? '2-3 Gün' : 'Belirtilmedi')}</Text>
                                                </View>
                                            </View>

                                            <TouchableOpacity style={styles.actionBtn}>
                                                <Text allowFontScaling={false} style={styles.actionBtnText}>ANLAŞMA SAĞLA</Text>
                                                <MaterialCommunityIcons name="handshake" size={18} color="#000" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { padding: 16, paddingBottom: 50 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, marginBottom: 10 },
    headerTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333' },
    summaryCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5 },
    summaryTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    summarySub: { color: '#888', fontSize: 12, marginTop: 4 },
    groupCard: { backgroundColor: '#1A1A1A', borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 20, overflow: 'hidden' },
    firmHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#252525', marginBottom: 16 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', alignItems: 'center', justifyContent: 'center' },
    firmName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    firmOffersCount: { color: '#A3A3A3', fontSize: 12, marginTop: 4 },
    offerCard: { backgroundColor: '#111', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2A2A2A' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#333' },
    badgeText: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    featureText: { color: '#A3A3A3', fontSize: 12 },
    actionBtn: { marginTop: 16, backgroundColor: '#D4AF37', paddingVertical: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    actionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 }
});
