import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMarketCart } from '../../context/MarketCartContext';

const { width } = Dimensions.get('window');

const THEME = {
    bg: '#000000',
    card: '#111111',
    border: '#2A2A2A',
    gold: '#D4AF37',
    textMain: '#FFFFFF',
    textMuted: '#888888',
    danger: '#EF4444'
};

export default function MarketDynamicFormScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { addToCart } = useMarketCart();

    const category = route.params?.category || { title: 'Kategori' };
    const subCategory = route.params?.subCategory || 'Malzeme';

    // Form States
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');

    // Dynamic States based on material
    const [selectedType, setSelectedType] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedSpec, setSelectedSpec] = useState(null);
    const [selectedPackaging, setSelectedPackaging] = useState(null);

    // Helpers to identify material type
    const isIron = subCategory.toLowerCase().includes('demir');
    const isPaint = subCategory.toLowerCase().includes('boya');
    const isCement = subCategory.toLowerCase().includes('çimento');

    const handleAddToCart = () => {
        let detailsText = '';
        if (selectedType) detailsText += `Tip: ${selectedType} | `;
        if (selectedBrand) detailsText += `Marka: ${selectedBrand} | `;
        if (selectedSpec) detailsText += `Özellik: ${selectedSpec} | `;
        if (selectedPackaging) detailsText += `Ambalaj: ${selectedPackaging}`;

        const itemData = {
            category: category.title || 'Market',
            subCategory,
            quantity,
            type: selectedType,
            brand: selectedBrand,
            spec: selectedSpec,
            packaging: selectedPackaging,
            details: detailsText.replace(/ \|\ $/, ''),
            notes
        };

        addToCart(itemData);
        navigation.goBack(); // Return to Market screen
    };

    const isAddDisabled = !quantity || quantity.trim() === '';

    const renderChoiceBlock = (title, options, selected, onSelect) => (
        <View style={s.block}>
            <Text allowFontScaling={false} style={s.blockTitle}>{title}</Text>
            <View style={s.chipRow}>
                {options.map(opt => {
                    const isSel = selected === opt;
                    return (
                        <TouchableOpacity
                            key={opt}
                            style={[s.chip, isSel && s.chipActive]}
                            onPress={() => onSelect(opt)}
                            activeOpacity={0.8}
                        >
                            <Text allowFontScaling={false} style={[s.chipText, isSel && s.chipTextActive]}>
                                {opt}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderDynamicFields = () => {
        if (isIron) {
            return (
                <>
                    {renderChoiceBlock('Demir Tipi', ['Nervürlü', 'Düz (Firkete)', 'Kangal'], selectedType, setSelectedType)}
                    {renderChoiceBlock('Kalınlık (Çap)', ['8Q', '10Q', '12Q', '14Q', '16Q', '20Q', '24Q+'], selectedSpec, setSelectedSpec)}
                </>
            );
        }

        if (isPaint) {
            return (
                <>
                    {renderChoiceBlock('Boya Tipi', ['Tavan Boyası', 'İç Cephe Silikonlu', 'İç Cephe Plastik', 'Dış Cephe Akrilik', 'Yağlı Boya'], selectedType, setSelectedType)}
                    {renderChoiceBlock('Marka Tercihi', ['Filli Boya', 'Polisan', 'Dyo', 'Marshall', 'Jotun', 'Fark Etmez'], selectedBrand, setSelectedBrand)}
                    {renderChoiceBlock('Ambalaj', ['20 Kg Kova', '10 Kg Kova', '3.5 Kg Galon', '1 Kg Kutu'], selectedPackaging, setSelectedPackaging)}
                </>
            );
        }

        if (isCement) {
            return (
                <>
                    {renderChoiceBlock('Çimento Tipi', ['Gri (Portland)', 'Beyaz Çimento', 'Harman Tuğla Harcı'], selectedType, setSelectedType)}
                    {renderChoiceBlock('Ambalaj', ['50 Kg Torba', '25 Kg Torba', 'Dökme'], selectedPackaging, setSelectedPackaging)}
                </>
            );
        }

        // Generic Material fallback
        return (
            <View style={s.block}>
                <Text allowFontScaling={false} style={s.blockTitle}>Malzeme Detayları</Text>
                <TextInput allowFontScaling={false}
                    style={[s.input, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="Örn: 1. Sınıf, suya dayanıklı, TS EN normlarına uygun..."
                    placeholderTextColor={THEME.textMuted}
                    multiline
                    value={selectedSpec}
                    onChangeText={setSelectedSpec}
                />
            </View>
        );
    };

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000', THEME.card]} style={StyleSheet.absoluteFillObject} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                
                {/* Header */}
                <View style={[s.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="close" size={24} color={THEME.textMain} />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center', flex: 1, marginRight: 40 }}>
                        <Text allowFontScaling={false} style={s.headerSubtitle}>{category?.title || 'Kategori'}</Text>
                        <Text allowFontScaling={false} style={s.headerTitle} numberOfLines={1}>{subCategory}</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Information Banner */}
                    <View style={s.banner}>
                        <MaterialCommunityIcons name="information-outline" size={20} color={THEME.gold} />
                        <Text allowFontScaling={false} style={s.bannerText}>
                            Teklif veren firmaların net fiyat verebilmesi için detayları eksiksiz doldurun.
                        </Text>
                    </View>

                    {/* Dynamic Form Sections */}
                    {renderDynamicFields()}

                    {/* Universal Quantity Section */}
                    <View style={s.block}>
                        <Text allowFontScaling={false} style={s.blockTitle}>Miktar</Text>
                        <View style={s.qtyRow}>
                            <TextInput allowFontScaling={false}
                                style={[s.input, { flex: 1, fontSize: 18, fontWeight: 'bold' }]}
                                placeholder="Örn: 10, 200, 5"
                                placeholderTextColor={THEME.textMuted}
                                keyboardType="numeric"
                                value={quantity}
                                onChangeText={setQuantity}
                            />
                            <View style={s.qtyUnit}>
                                <Text allowFontScaling={false} style={s.qtyUnitText}>
                                    {isIron ? 'Ton' : isCement ? 'Adet/Torba' : 'Adet'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Universal Notes Section */}
                    <View style={s.block}>
                        <Text allowFontScaling={false} style={s.blockTitle}>Ek Notlar (Opsiyonel)</Text>
                        <TextInput allowFontScaling={false}
                            style={[s.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="Firma teklif verirken dikkate almalı..."
                            placeholderTextColor={THEME.textMuted}
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>

                </ScrollView>

                {/* Footer Bar */}
                <View style={[s.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                    <TouchableOpacity 
                        style={[s.primaryBtn, isAddDisabled && { opacity: 0.5 }]} 
                        disabled={isAddDisabled} 
                        onPress={handleAddToCart}
                        activeOpacity={0.9}
                    >
                        <Text allowFontScaling={false} style={s.primaryBtnText}>TALEP LİSTESİNE EKLE</Text>
                        <MaterialCommunityIcons name="cart-plus" size={20} color="#000" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: THEME.border },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: THEME.gold, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
    headerSubtitle: { color: THEME.gold, fontSize: 11, fontWeight: '600', letterSpacing: 1.5, opacity: 0.7, textTransform: 'uppercase' },
    
    scrollContent: { padding: 20, paddingBottom: 60 },
    
    banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    bannerText: { flex: 1, color: THEME.gold, fontSize: 12, marginLeft: 10, lineHeight: 18 },

    block: { marginBottom: 24 },
    blockTitle: { color: THEME.textMain, fontSize: 16, fontWeight: '700', marginBottom: 12 },
    
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { backgroundColor: THEME.card, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: THEME.border },
    chipActive: { backgroundColor: 'rgba(212, 175, 55, 0.15)', borderColor: THEME.gold },
    chipText: { color: THEME.textMuted, fontSize: 14, fontWeight: '500' },
    chipTextActive: { color: THEME.gold, fontWeight: '700' },

    input: { backgroundColor: THEME.card, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, color: THEME.textMain, fontSize: 15, paddingHorizontal: 16, height: 50 },
    
    qtyRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    qtyUnit: { height: 50, paddingHorizontal: 20, backgroundColor: '#222', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.border },
    qtyUnitText: { color: THEME.textMuted, fontSize: 14, fontWeight: '600' },

    footer: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: THEME.border, backgroundColor: THEME.bg },
    primaryBtn: { height: 56, borderRadius: 16, backgroundColor: THEME.gold, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    primaryBtnText: { color: '#000', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
