import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
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
import { MarketService } from '../../services/MarketService';

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

export default function MarketCartScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { cartItems, removeFromCart, clearCart } = useMarketCart();

    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [generalNotes, setGeneralNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (cartItems.length === 0) {
            Alert.alert("Hata", "Sepetiniz boş.");
            return;
        }
        if (!address.trim()) {
            Alert.alert("Bilgi Eksik", "Lütfen teslimat bölgesi giriniz (Örn: Ataşehir, İstanbul).");
            return;
        }

        setIsSubmitting(true);
        try {
            // Build Unified Description
            let requestDetails = "TOPTAN MALZEME TALEBİ\n\n";
            cartItems.forEach((item, index) => {
                requestDetails += `--- MALZEME ${index + 1} ---\n`;
                requestDetails += `Kategori: ${item.category} > ${item.subCategory}\n`;
                requestDetails += `Miktar: ${item.quantity}\n`;
                if (item.details) requestDetails += `Detaylar: ${item.details}\n`;
                if (item.notes) requestDetails += `Ek Not: ${item.notes}\n`;
                requestDetails += '\n';
            });

            const payload = {
                title: "Toptan Malzeme Talebi",
                items: cartItems.map(i => `${i.quantity} x ${i.subCategory}`).join(', '),
                location: address,
                delivery_time: 'Belirtilmedi',
                notes: requestDetails + (generalNotes ? `\n\nGENEL NOTLAR:\n${generalNotes}` : ''),
                payment_method: paymentMethod || 'Belirtilmedi',
                image_url: ""
            };

            await MarketService.createRequest(payload);
            clearCart();
            navigation.navigate('MarketSuccess');
        } catch (error) {
            console.error('Cart Submit Error:', error);
            Alert.alert("Hata", "Talebiniz gönderilirken hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle="light-content" />
                <LinearGradient colors={['#000', THEME.card]} style={StyleSheet.absoluteFillObject} />
                <MaterialCommunityIcons name="cart-off" size={64} color={THEME.border} style={{ marginBottom: 16 }} />
                <Text allowFontScaling={false} style={{ color: THEME.textMain, fontSize: 18, fontWeight: 'bold' }}>Talebiniz Bulunmuyor</Text>
                <Text allowFontScaling={false} style={{ color: THEME.textMuted, marginTop: 8, marginBottom: 24 }}>Lütfen marketten malzeme seçin.</Text>
                <TouchableOpacity style={[s.primaryBtn, { paddingHorizontal: 32 }]} onPress={() => navigation.goBack()}>
                    <Text allowFontScaling={false} style={s.primaryBtnText}>MARKETE DÖN</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000', THEME.card]} style={StyleSheet.absoluteFillObject} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                
                {/* Header */}
                <View style={[s.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                        <Ionicons name="arrow-back" size={24} color={THEME.textMain} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center', marginRight: 40 }}>
                        <Text allowFontScaling={false} style={s.headerTitle}>TALEP LİSTESİ</Text>
                        <Text allowFontScaling={false} style={s.headerSubtitle}>{cartItems.length} Kalem Malzeme</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Cart Items */}
                    <View style={{ marginBottom: 24 }}>
                        {cartItems.map((item, index) => (
                            <View key={item.cartId} style={s.cartItem}>
                                <View style={s.itemHeader}>
                                    <View style={s.itemBadge}><Text allowFontScaling={false} style={s.itemBadgeText}>{index + 1}</Text></View>
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text allowFontScaling={false} style={s.itemCategory}>{item.category} • {item.subCategory}</Text>
                                    </View>
                                    <TouchableOpacity style={s.removeBtn} onPress={() => removeFromCart(item.cartId)}>
                                        <MaterialCommunityIcons name="trash-can-outline" size={20} color={THEME.danger} />
                                    </TouchableOpacity>
                                </View>
                                <View style={s.itemBody}>
                                    {item.details ? <Text allowFontScaling={false} style={s.itemDetails}>{item.details}</Text> : null}
                                    <Text allowFontScaling={false} style={s.itemQty}>
                                        Miktar: <Text allowFontScaling={false} style={{ color: THEME.gold }}>
                                            {item.quantity} {item.subCategory?.toLowerCase().includes('demir') ? 'Ton' : item.subCategory?.toLowerCase().includes('çimento') ? 'Torba' : 'Adet'}
                                        </Text>
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Delivery Form */}
                    <Text allowFontScaling={false} style={s.sectionTitle}>Teslimat Bilgileri</Text>
                    
                    <View style={s.inputGroup}>
                        <View style={s.inputIcon}><MaterialCommunityIcons name="map-marker-outline" size={20} color={THEME.gold} /></View>
                        <TextInput allowFontScaling={false}
                            style={s.input}
                            placeholder="Teslimat Bölgesi (Örn: Kadıköy, İstanbul)"
                            placeholderTextColor={THEME.textMuted}
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>

                    <View style={s.inputGroup}>
                        <View style={s.inputIcon}><MaterialCommunityIcons name="cash-multiple" size={20} color={THEME.gold} /></View>
                        <TextInput allowFontScaling={false}
                            style={s.input}
                            placeholder="Ödeme Şekli (Örn: Nakit, Vadeli, EFT)"
                            placeholderTextColor={THEME.textMuted}
                            value={paymentMethod}
                            onChangeText={setPaymentMethod}
                        />
                    </View>

                    <View style={[s.inputGroup, { alignItems: 'flex-start' }]}>
                        <View style={[s.inputIcon, { marginTop: 12 }]}><MaterialCommunityIcons name="text-box-outline" size={20} color={THEME.gold} /></View>
                        <TextInput allowFontScaling={false}
                            style={[s.input, { height: 80, paddingTop: 14, textAlignVertical: 'top' }]}
                            placeholder="Genel şantiye notları (Tır girebilir vb.)"
                            placeholderTextColor={THEME.textMuted}
                            multiline
                            value={generalNotes}
                            onChangeText={setGeneralNotes}
                        />
                    </View>

                </ScrollView>

                {/* Footer */}
                <View style={[s.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                    <TouchableOpacity 
                        style={[s.primaryBtn, isSubmitting && { opacity: 0.6 }]} 
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        activeOpacity={0.9}
                    >
                        <Text allowFontScaling={false} style={s.primaryBtnText}>
                            {isSubmitting ? 'TALEPLER İLETİLİYOR...' : 'TOPLU FİYAT TEKLİFİ İSTE'}
                        </Text>
                        {!isSubmitting && <MaterialCommunityIcons name="send-check" size={20} color="#000" style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: THEME.border, backgroundColor: THEME.bg },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.card, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: THEME.gold, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    headerSubtitle: { color: THEME.gold, fontSize: 11, fontWeight: '600', letterSpacing: 1.5, opacity: 0.7, marginTop: 2 },
    
    scrollContent: { padding: 20, paddingBottom: 60 },
    
    // Cart Item
    cartItem: { backgroundColor: THEME.card, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.border, overflow: 'hidden' },
    itemHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1A1A1A', backgroundColor: '#141414' },
    itemBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderWidth: 1, borderColor: THEME.gold, alignItems: 'center', justifyContent: 'center' },
    itemBadgeText: { color: THEME.gold, fontSize: 12, fontWeight: 'bold' },
    itemCategory: { color: THEME.textMain, fontSize: 14, fontWeight: 'bold' },
    removeBtn: { padding: 4 },
    itemBody: { padding: 16 },
    itemDetails: { color: THEME.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 6 },
    itemQty: { color: THEME.textMain, fontSize: 14, fontWeight: '600' },

    sectionTitle: { color: THEME.textMain, fontSize: 16, fontWeight: '700', marginBottom: 16, marginTop: 10 },
    
    inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, marginBottom: 12, overflow: 'hidden' },
    inputIcon: { width: 48, alignItems: 'center', justifyContent: 'center' },
    input: { flex: 1, color: THEME.textMain, fontSize: 14, paddingVertical: 14, paddingRight: 16, height: 50 },

    footer: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: THEME.border, backgroundColor: THEME.bg },
    primaryBtn: { height: 56, borderRadius: 16, backgroundColor: THEME.gold, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    primaryBtnText: { color: '#000', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});
