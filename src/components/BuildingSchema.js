import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const UNIT_TYPES = {
    apartment: { label: 'Daire', color: '#D4AF37', bg: '#252525' },
    shop: { label: 'Dükkan', color: '#000', bg: '#D4AF37', text: '#000' },
    office: { label: 'Ofis', color: '#FFF', bg: '#444' },
    parking: { label: 'Otopark', color: '#666', bg: '#2A2A2A', dashed: true },
    shelter: { label: 'Sığınak', color: '#666', bg: '#2A2A2A', dashed: true },
    storage: { label: 'Depo', color: '#666', bg: '#2A2A2A', dashed: true },
    common: { label: 'Ortak', color: '#666', bg: '#2A2A2A' },
};

export default function BuildingSchema({
    floorCount,
    floorDetails,
    groundFloorType,
    isBasementResidential,
    basementCount = 1,
    selectable = false,
    selectedUnits = [],
    onUnitSelect,
    campaignData = {}, // Default empty object to prevent crash
    cashAdjustment = null, // { type: 'request' | 'payment', amount: 0 }
    showColors = false, // New prop to force coloring in read-only mode,
    hideDetails = false, // New prop to hide internal details
    legendLabel = 'Müteahhit (Siz)', // Default label for legend
    isFlatForLand = true,
    turnkeyData = null // { totalPrice: 0, campaignPolicy: 'included' | 'excluded' }
}) {
    const floors = parseInt(floorCount) || 0;
    const basements = parseInt(basementCount) || 1;

    if (floors <= 0) return null;

    // Helper to normalize floor data into an array of units
    const getFloorContent = (floorKey, defaultType = 'apartment', defaultCount = 0) => {
        const floorData = floorDetails && floorDetails[floorKey];

        // 1. If undefined/null, use defaults (legacy fallback)
        if (!floorData) {
            if (defaultCount > 0) return Array.from({ length: defaultCount }).map((_, i) => ({ id: `f${floorKey}_u${i}_${defaultType}`, type: defaultType, name: '', area: '' }));
            return [];
        }

        // 2. If it's already an array (New Format)
        if (Array.isArray(floorData)) {
            return floorData;
        }

        // 3. If it's a number (legacy: "2" -> 2 apartments)
        if (typeof floorData === 'number' || typeof floorData === 'string') {
            const count = parseInt(floorData) || 0;
            return Array.from({ length: count }).map((_, i) => ({ id: `legacy-num-${floorKey}-${i}`, type: defaultType, name: '', area: '' }));
        }

        // 4. If it's an object with counts (legacy mixed: { apartment: 2, shop: 1 })
        if (typeof floorData === 'object') {
            let units = [];
            // Order matters: Shop, Office, Apartment, Others
            ['shop', 'office', 'apartment', 'residence', 'parking', 'shelter', 'storage', 'common'].forEach(type => {
                if (floorData[type]) {
                    const count = parseInt(floorData[type]);
                    const newUnits = Array.from({ length: count }).map((_, i) => ({ id: `legacy-obj-${floorKey}-${type}-${i}`, type, name: '', area: '' }));
                    units = [...units, ...newUnits];
                }
            });
            return units;
        }

        return [];
    };

    const renderUnit = (unit, index) => {
        const typeConfig = UNIT_TYPES[unit.type] || UNIT_TYPES.apartment;

        const isSelected = selectedUnits.includes(unit.id);
        const isSelectionsActive = selectable || showColors; // If selection mode is active OR forced

        // Premium Colors and Gradients
        let colors = ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']; // Default Glass
        let borderColor = 'rgba(255,255,255,0.1)';
        let textColor = '#888';
        let icon = null;

        if (isSelectionsActive) {
            if (isSelected) {
                // Gold Gradient for Contractor
                colors = ['#D4AF37', '#AA8A2E'];
                borderColor = '#FFD700';
                textColor = '#000';
                icon = "key-variant";
            } else {
                // Platinum/Silver Gradient for Landowner
                colors = ['#E0E0E0', '#B0B0B0'];
                borderColor = '#FFF';
                textColor = '#000';
                icon = "home-account";
            }
        } else {
            // Non-selectable default styles based on type
            if (typeConfig.bg !== '#252525') {
                // Keep original color logic for other types if needed, or unify.
                // For now, let's keep it simple and clean.
            }
        }

        const content = (
            <LinearGradient
                colors={colors}
                style={[
                    styles.unitBox,
                    { borderColor: borderColor, borderWidth: 1 },
                    typeConfig.dashed && !isSelected && { borderStyle: 'dashed', borderWidth: 1, borderColor: '#444', backgroundColor: 'transparent' }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                {icon && (
                    <MaterialCommunityIcons name={icon} size={14} color={textColor} style={{ marginBottom: 2 }} />
                )}
                <Text style={[
                    styles.unitText,
                    { color: textColor },
                    (unit.type === 'shop' || isSelected) && { fontWeight: 'bold' }
                ]} numberOfLines={1}>
                    {unit.name || `${typeConfig.label} ${index + 1}`}
                </Text>
                {unit.area ? (
                    <Text style={[styles.unitAreaText, { color: textColor }]}>{unit.area} m²</Text>
                ) : null}
            </LinearGradient>
        );

        if (selectable) {
            return (
                <TouchableOpacity
                    key={index}
                    style={{ flex: 1 }}
                    onPress={() => onUnitSelect && onUnitSelect(unit)}
                    activeOpacity={0.8}
                >
                    {content}
                </TouchableOpacity>
            );
        }

        return <View key={index} style={{ flex: 1 }}>{content}</View>;
    };

    const renderFloors = () => {
        const floorItems = [];

        // Standard Floors (Top Down)
        for (let i = floors; i >= 1; i--) {
            const units = getFloorContent(i, 'apartment');
            floorItems.push(
                <View key={`floor-${i}`} style={styles.floorRow}>
                    <Text style={styles.floorLabel}>{i}. Kat</Text>
                    <View style={styles.floorContent}>
                        {units.length > 0 ? units.map(renderUnit) : (
                            <View style={[styles.unitBox, { backgroundColor: '#333', borderStyle: 'dashed' }]}>
                                <Text style={[styles.unitText, { color: '#666' }]}>?</Text>
                            </View>
                        )}
                    </View>
                </View>
            );
        }

        // Ground Floor (0)
        // If 'groundFloorType' prop exists (legacy), we can use it to set default if usage not in floorDetails[0]
        const legacyGroundType = groundFloorType === 'shop' ? 'shop' : (groundFloorType === 'parking' ? 'parking' : 'apartment');
        const groundUnits = getFloorContent(0, legacyGroundType, 1);

        floorItems.push(
            <View key="ground" style={styles.floorRow}>
                <Text style={styles.floorLabel}>Zemin</Text>
                <View style={[styles.floorContent, { borderColor: groundFloorType === 'shop' ? '#D4AF37' : '#444' }]}>
                    {groundUnits.length > 0 ? groundUnits.map(renderUnit) : (
                        <View style={[styles.unitBox, { backgroundColor: '#222' }]}>
                            <Text style={styles.unitText}>Giriş</Text>
                        </View>
                    )}
                </View>
            </View>
        );

        // Basements
        for (let b = 1; b <= basements; b++) {
            const idx = -b;
            const legacyType = isBasementResidential ? 'apartment' : 'shelter'; // Default fallback
            const bUnits = getFloorContent(idx, legacyType, 1); // Default 1 if missing? Or 0

            floorItems.push(
                <View key={`basement-${b}`} style={styles.floorRow}>
                    <Text style={styles.floorLabel}>{b}. Bodrum</Text>
                    <View style={styles.floorContent}>
                        {bUnits.length > 0 ? bUnits.map(renderUnit) : (
                            <View style={[styles.unitBox, { backgroundColor: '#222', borderStyle: 'dashed' }]}>
                                <Text style={styles.unitText}>{isBasementResidential ? 'Daire?' : 'Sığınak'}</Text>
                            </View>
                        )}
                    </View>
                </View>
            );
        }

        return floorItems;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ÖNİZLEME: YENİ BİNA PLAN ŞEMASI</Text>
            {selectable && (
                <Text style={styles.instruction}>Müteahhit payına düşen daireleri seçmek için üzerine dokunun.</Text>
            )}
            <View style={styles.schemaContainer}>
                {renderFloors()}
            </View>

            {(selectable || showColors) && (
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <LinearGradient colors={['#D4AF37', '#AA8A2E']} style={styles.legendColorBox} />
                        <Text style={styles.legendText}>{legendLabel}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <LinearGradient colors={['#E0E0E0', '#B0B0B0']} style={styles.legendColorBox} />
                        <Text style={styles.legendText}>Arsa Sahibi</Text>
                    </View>
                </View>
            )}

            <Text style={styles.note}>* Temsili şemadır. Kat planları proje detaylarına göre değişebilir.</Text>


            {/* Government Grant Info */}
            {!hideDetails && campaignData && (campaignData.unitCount > 0 || campaignData.commercialCount > 0) && (
                <View style={styles.grantContainer}>
                    <Text style={styles.grantLabel}>DEVLET DESTEĞİNDE HAK EDİŞİNİZ</Text>
                    <Text style={styles.grantAmount}>
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(
                            (campaignData.unitCount * 1750000) + (campaignData.commercialCount * 875000)
                        )}
                    </Text>
                    <Text style={styles.grantSubtext}>
                        {campaignData.unitCount > 0 ? `${campaignData.unitCount} Konut ` : ''}
                        {campaignData.commercialCount > 0 ? `${campaignData.commercialCount} Ticari ` : ''}
                        (Hibe + Kredi)
                    </Text>
                </View>
            )}

            {/* Turnkey Net Payment Box (As requested: under the grant box) */}
            {!hideDetails && !isFlatForLand && turnkeyData && turnkeyData.totalPrice > 0 && (
                <View style={[
                    styles.grantContainer,
                    {
                        marginTop: 10,
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderColor: 'rgba(76, 175, 80, 0.3)'
                    }
                ]}>
                    <Text style={[styles.grantLabel, { color: '#4CAF50' }]}>
                        ARSA SAHİBİ ÖDEYECEK (NET)
                    </Text>
                    <Text style={[styles.grantAmount, { color: '#FFF', textShadowColor: 'rgba(76, 175, 80, 0.5)' }]}>
                        {(() => {
                            const grantAmount = (campaignData.unitCount * 1750000) + (campaignData.commercialCount * 875000);
                            const net = turnkeyData.campaignPolicy === 'included'
                                ? Math.max(0, turnkeyData.totalPrice - grantAmount)
                                : turnkeyData.totalPrice;
                            return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(net);
                        })()}
                    </Text>
                    <Text style={styles.grantSubtext}>
                        {turnkeyData.campaignPolicy === 'included' && (campaignData.unitCount > 0 || campaignData.commercialCount > 0)
                            ? 'Devlet hibe/kredi desteği dışındaki tutardır'
                            : 'Toplam İnşaat Yapım Bedeli'}
                    </Text>
                </View>
            )}

            {/* Cash Adjustment Info */}
            {!hideDetails && cashAdjustment && cashAdjustment.amount > 0 && (
                <View style={[
                    styles.grantContainer,
                    {
                        marginTop: 10,
                        backgroundColor: cashAdjustment.type === 'request' ? 'rgba(50, 205, 50, 0.1)' : 'rgba(255, 82, 82, 0.1)',
                        borderColor: cashAdjustment.type === 'request' ? 'rgba(50, 205, 50, 0.3)' : 'rgba(255, 82, 82, 0.3)'
                    }
                ]}>
                    <Text style={[
                        styles.grantLabel,
                        { color: cashAdjustment.type === 'request' ? '#4CAF50' : '#FF5252' }
                    ]}>
                        {cashAdjustment.type === 'request' ? 'HAK SAHİPLERİNDEN TALEP EDİLEN TOPLAM TUTAR' : 'HAK SAHİPLERİNE ÖDENECEK TOPLAM TUTAR'}
                    </Text>
                    <Text style={[
                        styles.grantAmount,
                        {
                            textShadowColor: cashAdjustment.type === 'request' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'
                        }
                    ]}>
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(cashAdjustment.amount)}
                    </Text>
                    <Text style={styles.grantSubtext}>
                        {cashAdjustment.type === 'request' ? 'Nakit Ödeme (İlave Ücret)' : 'Nakit Ödeme (Üste Para)'}
                    </Text>
                </View>
            )}

            {/* Contractor Selected Units Info */}
            {!hideDetails && selectedUnits.length > 0 && (
                <View style={[
                    styles.grantContainer,
                    {
                        marginTop: 10,
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderColor: 'rgba(212, 175, 55, 0.3)'
                    }
                ]}>
                    <Text style={[styles.grantLabel, { color: '#D4AF37' }]}>
                        MÜTEAHHİT FİRMAYA KALACAK DAİRELER
                    </Text>
                    <Text style={[
                        styles.grantAmount,
                        {
                            fontSize: 14,
                            textAlign: 'center',
                            textShadowColor: 'rgba(212, 175, 55, 0.5)',
                            lineHeight: 20
                        }
                    ]}>
                        {(() => {
                            const unitNames = [];
                            // Re-calculate unit names from floorDetails
                            if (floorDetails) {
                                // Upper floors
                                for (let i = floors; i >= 1; i--) {
                                    const fData = floorDetails[i];
                                    if (Array.isArray(fData)) {
                                        fData.forEach(u => {
                                            if (selectedUnits.includes(u.id)) unitNames.push(u.name || u.type);
                                        });
                                    }
                                }
                                // Ground
                                const gData = floorDetails[0];
                                if (Array.isArray(gData)) {
                                    gData.forEach(u => {
                                        if (selectedUnits.includes(u.id)) unitNames.push(u.name || u.type);
                                    });
                                }
                                // Basement
                                for (let b = 1; b <= basements; b++) {
                                    const bData = floorDetails[-b];
                                    if (Array.isArray(bData)) {
                                        bData.forEach(u => {
                                            if (selectedUnits.includes(u.id)) unitNames.push(u.name || u.type);
                                        });
                                    }
                                }
                            }
                            return unitNames.join(', ');
                        })()}
                    </Text>
                    <Text style={styles.grantSubtext}>
                        {selectedUnits.length} Adet Bağımsız Bölüm
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        padding: 20,
        backgroundColor: 'rgba(30,30,30,0.6)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        alignItems: 'center',
        width: '100%'
    },
    title: {
        color: '#D4AF37',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 24,
        letterSpacing: 2,
        textTransform: 'uppercase'
    },
    instruction: {
        color: '#888',
        fontSize: 11,
        marginBottom: 16,
        textAlign: 'center',
        fontStyle: 'italic'
    },
    grantContainer: {
        marginTop: 20,
        backgroundColor: 'rgba(50, 205, 50, 0.1)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(50, 205, 50, 0.3)',
        alignItems: 'center',
        width: '100%'
    },
    grantLabel: {
        color: '#4CAF50',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 1
    },
    grantAmount: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(76, 175, 80, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10
    },
    grantSubtext: {
        color: '#AAA',
        fontSize: 10,
        marginTop: 4
    },
    schemaContainer: {
        width: '100%',
        alignItems: 'center',
        // Removed maxWidth or set it very large
        // maxWidth: 500
    },
    /* roof styles removed */
    floorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 8 // Increased gap
    },
    floorLabel: {
        width: 60, // Reduced label width to give more space
        color: '#CCC',
        fontSize: 12,
        textAlign: 'right',
        marginRight: 8,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    floorContent: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        height: 60, // Increased height for larger visual
        borderRadius: 4,
        overflow: 'hidden'
    },
    unitBox: {
        flex: 1,
        height: '100%',
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4
    },
    unitText: {
        color: '#FFF',
        fontSize: 11,
        textAlign: 'center',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1
    },
    unitAreaText: {
        color: '#D4AF37',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 0,
        fontWeight: '600'
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 20,
        width: '100%',
        paddingHorizontal: 10
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    legendColorBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        marginRight: 6
    },
    legendText: {
        color: '#CCC',
        fontSize: 11,
        fontWeight: '600'
    },
    note: {
        color: '#555',
        fontSize: 10,
        marginTop: 20,
        fontStyle: 'italic',
        textAlign: 'center'
    }
});
