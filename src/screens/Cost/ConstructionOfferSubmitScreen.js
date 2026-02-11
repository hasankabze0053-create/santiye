import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import PremiumBackground from '../../components/PremiumBackground';
import { supabase } from '../../lib/supabase';

export default function ConstructionOfferSubmitScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};

    const [price, setPrice] = useState('');
    const [details, setDetails] = useState('');
    const [totalArea, setTotalArea] = useState('');
    const [unitBreakdown, setUnitBreakdown] = useState([]);
    const [campaignPolicy, setCampaignPolicy] = useState('standard'); // standard, included, excluded
    const [modalVisible, setModalVisible] = useState(false);
    const [newItem, setNewItem] = useState({ type: '2+1', area: '', count: '' });

    const unitPrice = (price && totalArea) ? (parseFloat(price) / parseFloat(totalArea)).toFixed(2) : '0.00';

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!price || !details) {
            Alert.alert('Eksik Bilgi', 'Lütfen fiyat teklifi ve detayları giriniz.');
            return;
        }

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Hata', 'Oturum açmanız gerekiyor.');
                return;
            }

            const { error } = await supabase
                .from('construction_offers')
                .insert({
                    request_id: request.id,
                    contractor_id: user.id,
                    price_estimate: parseFloat(price),
                    offer_details: details,
                    total_area: parseFloat(totalArea) || 0,
                    unit_price: parseFloat(unitPrice) || 0,
                    unit_breakdown: unitBreakdown,
                    campaign_policy: campaignPolicy,
                    status: 'pending'
                });

            if (error) throw error;

            Alert.alert('Başarılı', 'Teklifiniz başarıyla iletildi!', [
                { text: 'Tamam', onPress: () => navigation.navigate('MainTabs', { screen: 'Requests' }) }
            ]);

        } catch (error) {
            console.error('Offer submission error:', error);
            Alert.alert('Hata', 'Teklif gönderilemedi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>TEKLİF VER</Text>
                    <View style={{ width: 44 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.content}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View>
                                {/* Request Summary Card */}
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryTitle}>Proje Özeti</Text>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Proje No:</Text>
                                        <Text style={styles.value}>#{request?.id?.slice(0, 8).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Konum:</Text>
                                        <Text style={styles.value}>{request?.district}, {request?.neighborhood}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Model:</Text>
                                        <Text style={styles.value}>{request?.offer_type === 'kat_karsiligi' ? 'Kat Karşılığı' : 'Anahtar Teslim'}</Text>
                                    </View>
                                </View>

                                {/* Form */}
                                <Text style={styles.sectionTitle}>TEKLİF DETAYLARI</Text>

                                <GlassCard style={styles.formCard}>
                                    {/* Price Input */}
                                    <Text style={styles.inputLabel}>Tahmini Fiyat / Bedel (TL)</Text>
                                    <View style={styles.inputContainer}>
                                        <MaterialCommunityIcons name="cash" size={20} color="#D4AF37" style={{ marginRight: 10 }} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="0.00"
                                            placeholderTextColor="#666"
                                            keyboardType="numeric"
                                            value={price}
                                            onChangeText={setPrice}
                                        />
                                    </View>

                                    <View style={styles.rowTwo}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={styles.inputLabel}>Toplam İnşaat Alanı (m²)</Text>
                                            <View style={styles.inputContainer}>
                                                <MaterialCommunityIcons name="ruler-square" size={20} color="#D4AF37" style={{ marginRight: 10 }} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="0"
                                                    placeholderTextColor="#666"
                                                    keyboardType="numeric"
                                                    value={totalArea}
                                                    onChangeText={setTotalArea}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Text style={styles.inputLabel}>Birim Fiyat (TL/m²)</Text>
                                            <View style={[styles.inputContainer, { backgroundColor: 'transparent', borderColor: 'transparent' }]}>
                                                <Text style={{ color: '#D4AF37', fontSize: 18, fontWeight: 'bold' }}>
                                                    {unitPrice} TL
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {request?.is_campaign_active && (
                                        <View style={{ marginTop: 16 }}>
                                            <Text style={styles.inputLabel}>Yarısı Bizden Kampanyası</Text>
                                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                                {['included', 'excluded'].map((option) => (
                                                    <TouchableOpacity
                                                        key={option}
                                                        style={[
                                                            styles.campaignOption,
                                                            campaignPolicy === option && styles.campaignOptionActive
                                                        ]}
                                                        onPress={() => setCampaignPolicy(option)}
                                                    >
                                                        <Text style={[
                                                            styles.campaignOptionText,
                                                            campaignPolicy === option && { color: '#000', fontWeight: 'bold' }
                                                        ]}>
                                                            {option === 'included' ? 'Hibe Fiyata Dahil' : 'Hibe Fiyata Hariç'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                            <Text style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
                                                * {campaignPolicy === 'included' ? 'Devlet hibesi teklif fiyatınızın içindedir (Size ödenir).' : 'Devlet hibesi mülk sahibine aittir (Size ayrıca ödenmez).'}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.divider} />

                                    {/* Unit Breakdown */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <Text style={styles.inputLabel}>Daire Dağılımı ve Alanlar</Text>
                                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                                            <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: 'bold' }}>+ EKLE</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {unitBreakdown.length > 0 ? (
                                        unitBreakdown.map((item, index) => (
                                            <View key={index} style={styles.breakdownItem}>
                                                <Text style={{ color: '#FFF' }}>{item.count} adet {item.type}</Text>
                                                <Text style={{ color: '#AAA' }}>{item.area} m²</Text>
                                                <TouchableOpacity onPress={() => setUnitBreakdown(prev => prev.filter((_, i) => i !== index))}>
                                                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={{ color: '#666', fontSize: 12, fontStyle: 'italic', marginBottom: 16 }}>Henüz daire bilgisi eklenmedi.</Text>
                                    )}

                                    <View style={styles.divider} />

                                    {/* Details Input */}
                                    <Text style={styles.inputLabel}>Teklif Açıklaması & Kapsam</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Yapılacak işlerin kapsamı, kullanılacak malzeme kalitesi, tahmini süre vb. detayları yazınız..."
                                        placeholderTextColor="#666"
                                        multiline
                                        textAlignVertical="top"
                                        value={details}
                                        onChangeText={setDetails}
                                    />
                                </GlassCard>

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={[styles.submitButton, loading && { opacity: 0.7 }]}
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={['#996515', '#FFD700', '#FDB931', '#996515']}
                                        start={{ x: 0, y: 0.5 }}
                                        end={{ x: 1, y: 0.5 }}
                                        style={styles.submitGradient}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#000" />
                                        ) : (
                                            <>
                                                <Text style={styles.submitText}>TEKLİFİ GÖNDER</Text>
                                                <MaterialCommunityIcons name="send" size={20} color="#000" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Unit Breakdown Modal */}
                <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Daire Çeşidi Ekle</Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Daire Tipi (Örn: 2+1)"
                                placeholderTextColor="#666"
                                value={newItem.type}
                                onChangeText={(t) => setNewItem({ ...newItem, type: t })}
                            />

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Adet (Örn: 5)"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={newItem.count}
                                onChangeText={(t) => setNewItem({ ...newItem, count: t })}
                            />

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Net Alan (m²)"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={newItem.area}
                                onChangeText={(t) => setNewItem({ ...newItem, area: t })}
                            />

                            <TouchableOpacity
                                style={styles.modalBtn}
                                onPress={() => {
                                    if (newItem.type && newItem.count && newItem.area) {
                                        setUnitBreakdown([...unitBreakdown, newItem]);
                                        setNewItem({ type: '2+1', area: '', count: '' });
                                        setModalVisible(false);
                                    } else {
                                        Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurunuz.');
                                    }
                                }}
                            >
                                <Text style={styles.modalBtnText}>EKLE</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#333', marginTop: 8 }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: '#AAA' }]}>VAZGEÇ</Text>
                            </TouchableOpacity>
                        </View>
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
    },
    backButton: {
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#222',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    headerTitle: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    content: {
        padding: 20,
    },
    summaryCard: {
        padding: 16,
        marginBottom: 24,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)'
    },
    summaryTitle: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'uppercase'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    label: { color: '#AAA', fontSize: 13 },
    value: { color: '#FFF', fontWeight: '600', fontSize: 13 },
    sectionTitle: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4
    },
    formCard: {
        padding: 16,
        marginBottom: 24
    },
    inputLabel: {
        color: '#CCC',
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '600'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: '#333'
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        paddingVertical: 12,
        height: 50
    },
    textArea: {
        height: 120,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 16
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 40,
        shadowColor: '#FFD700',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10
    },
    submitText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16
    },
    rowTwo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    campaignOption: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)'
    },
    campaignOptionActive: {
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37'
    },
    campaignOptionText: {
        color: '#888',
        fontSize: 12
    },
    breakdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        marginBottom: 8
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    modalTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    },
    modalInput: {
        backgroundColor: '#111',
        borderRadius: 8,
        padding: 12,
        color: '#FFF',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    modalBtn: {
        backgroundColor: '#D4AF37',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8
    },
    modalBtnText: {
        color: '#000',
        fontWeight: 'bold'
    }
});
