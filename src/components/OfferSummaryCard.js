import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import GlassCard from './GlassCard';

const formatCurrency = (val) => {
    if (!val) return '0';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
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

export default function OfferSummaryCard({
    selectedUnits = [],
    floorDetails = {},
    cashAdjustmentType = 'request',
    cashAdjustmentAmount = 0,
    campaignUnitCount = 0,
    campaignCommercialCount = 0,
    isFlatForLand = true,
    totalPrice = 0,
    campaignPolicy = 'standard', // 'included' | 'excluded' | 'standard'
    containerStyle,
    viewerMode = 'contractor' // 'contractor' | 'landowner'
}) {
    // 1. Find Unit Names
    const unitNames = [];
    if (selectedUnits.length > 0 && floorDetails) {
        Object.values(floorDetails).forEach(floor => {
            if (Array.isArray(floor)) {
                floor.forEach(u => {
                    if (selectedUnits.includes(u.id)) unitNames.push(u.name || u.type);
                });
            }
        });
    }

    // 2. Grant Amount
    const grantAmount = ((campaignUnitCount || 0) * 1750000) + ((campaignCommercialCount || 0) * 875000);
    const formattedGrant = formatCurrency(grantAmount);

    // 3. Cash Adjustment
    const cashAmount = typeof cashAdjustmentAmount === 'string'
        ? parseFloat(cashAdjustmentAmount.replace(/\./g, ''))
        : (cashAdjustmentAmount || 0);
    const formattedCash = formatCurrency(cashAmount);

    // 4. Total Project Price (for Turnkey)
    const tPrice = typeof totalPrice === 'string'
        ? parseFloat(totalPrice.replace(/\./g, ''))
        : (totalPrice || 0);
    const formattedTotalPrice = formatCurrency(tPrice);

    // 5. Net Price Calculation (Price - Grant)
    const isIncluded = campaignPolicy === 'included';
    const netPrice = tPrice - grantAmount;
    const formattedNetPrice = formatCurrency(Math.max(0, netPrice));

    const isLandowner = viewerMode === 'landowner';

    return (
        <GlassCard style={[styles.card, containerStyle]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialCommunityIcons name="file-document-edit-outline" size={24} color="#D4AF37" style={{ marginRight: 8 }} />
                <Text style={styles.headerTitle}>TEKLİF ÖZETİ</Text>
            </View>

            <Text style={styles.bodyText}>
                <Text style={{ fontWeight: 'bold', color: '#FFF' }}>
                    {isLandowner
                        ? 'Söz konusu inşaat yapım işi için müteahhit firmanın talebi;'
                        : 'Söz konusu inşaat yapım işi için müteahhit firma olarak talebim;'}
                </Text>
                {'\n\n'}

                {!isFlatForLand ? (
                    <>
                        {unitNames.length > 0 ? (
                            <>
                                Binada yer alan <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>{unitNames.join(', ')}</Text>
                                {unitNames.length > 1 ? ' bağımsız bölümlerinin ' : ' bağımsız bölümünün '}
                                {isLandowner ? 'müteahhit firmaya devredilmesi,' : 'tarafıma devredilmesi,'} kalan tüm bağımsız bölümlerin hak sahiplerine teslim edilmesi ve inşaat yapım bedeli olarak;
                            </>
                        ) : (
                            <>
                                Binada yer alan <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>tüm bağımsız bölümlerin</Text> hak sahiplerine teslim edilmesi ve inşaat yapım bedeli olarak;
                            </>
                        )}
                        {'\n\n'}
                        {isIncluded && grantAmount > 0 ? (
                            <>
                                Üstlenicinin toplam <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{formattedTotalPrice}</Text> tutarındaki talebinden, devletin sağladığı <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{formattedGrant}</Text> hibe/kredi desteği düşüldüğünde;
                                {'\n\n'}
                                Hak sahipleri tarafından <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 16 }}>{formattedNetPrice}</Text>
                                <Text style={styles.italicText}> ({numberToTurkishWords(Math.max(0, netPrice))})</Text>
                                {isLandowner ? ' nakit ödeme yapılması talep edilmektedir.' : ' nakit ödeme yapılması talep ediyorum.'}
                            </>
                        ) : (
                            <>
                                <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 16 }}>{formattedTotalPrice}</Text>
                                <Text style={styles.italicText}> ({numberToTurkishWords(tPrice)})</Text>
                                {isLandowner ? ' nakit ödeme talep edilmektedir.' : ' nakit ödeme talep ediyorum.'}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {unitNames.length > 0 ? (
                            <>
                                Binada yer alan <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>{unitNames.join(', ')}</Text>
                                {unitNames.length > 1 ? ' bağımsız bölümlerinin ' : ' bağımsız bölümünün '}
                                {isLandowner ? 'müteahhit firmaya devredilmesi' : 'tarafıma devredilmesi'}
                            </>
                        ) : (
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Binada yer alan tüm bağımsız bölümlerin hak sahiplerine teslim edilmesi </Text>
                        )}

                        {grantAmount > 0 && (
                            <Text>
                                {' ve kentsel dönüşüm kapsamında sağlanan '}
                                <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{formattedGrant}</Text>
                                <Text style={styles.italicText}> ({numberToTurkishWords(grantAmount)})</Text>
                                {' hibe/kredi desteği hak edişinin '}
                                {isLandowner ? 'müteahhit firma tarafından alınması' : 'tarafımca alınması'}
                            </Text>
                        )}
                        {' karşılığında; '}

                        {cashAdjustmentType === 'payment' && cashAmount > 0 ? (
                            <Text>
                                hak sahiplerine toplam <Text style={{ color: '#FF5252', fontWeight: 'bold' }}>{formattedCash}</Text>
                                <Text style={styles.italicText}> ({numberToTurkishWords(cashAmount)})</Text>
                                {isLandowner ? ' nakit ödeme yapmayı taahhüt etmektedir.' : ' nakit ödeme yapmayı taahhüt ediyorum.'}
                            </Text>
                        ) : cashAdjustmentType === 'request' && cashAmount > 0 ? (
                            <Text>
                                hak sahiplerinden inşaat yapım bedeline ek olarak <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{formattedCash}</Text>
                                <Text style={styles.italicText}> ({numberToTurkishWords(cashAmount)})</Text>
                                {isLandowner ? ' nakit ödeme talep etmektedir.' : ' nakit ödeme talep ediyorum.'}
                            </Text>
                        ) : (
                            <Text>
                                taraflar arasında herhangi bir nakit ödemesi talep edilmemektedir.
                            </Text>
                        )}
                    </>
                )}
            </Text>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: 16,
        borderColor: '#D4AF37',
        borderWidth: 1,
        backgroundColor: 'rgba(212, 175, 55, 0.05)'
    },
    headerTitle: {
        color: '#D4AF37',
        fontWeight: 'bold',
        fontSize: 13,
        letterSpacing: 1
    },
    bodyText: {
        color: '#E0E0E0',
        fontSize: 13,
        lineHeight: 22
    },
    italicText: {
        color: '#AAA',
        fontSize: 11,
        fontStyle: 'italic'
    }
});
