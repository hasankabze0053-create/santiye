import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const LOAD_TYPES = [
    { id: '1', label: 'Paletli', icon: 'dolly' },
    { id: '2', label: 'Makine', icon: 'excavator' },
    { id: '3', label: 'Dökme', icon: 'dump-truck' },
    { id: '4', label: 'Diğer', icon: 'package-variant' },
];

const PAYMENT_METHODS = [
    { id: 'cc', label: 'Kredi Kartı', icon: 'credit-card-outline' },
    { id: 'cari', label: 'Cari / Havale', icon: 'bank-transfer' },
    { id: 'cash', label: 'Kapıda Ödeme', icon: 'cash-multiple' },
];

export default function EmptyReturnCheckoutScreen({ navigation, route }) {
    const [selectedLoad, setSelectedLoad] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [contractAccepted, setContractAccepted] = useState(false);

    const handleConfirm = () => {
        if (!selectedLoad) {
            Alert.alert('Eksik Bilgi', 'Lütfen yük tipini seçiniz.');
            return;
        }
        if (!selectedPayment) {
            Alert.alert('Eksik Bilgi', 'Lütfen ödeme yöntemini seçiniz.');
            return;
        }
        if (!contractAccepted) {
            Alert.alert('Onay Gerekli', 'Lütfen taşıma sözleşmesini okuyup onaylayınız.');
            return;
        }

        navigation.replace('EmptyReturnSuccess');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: '#000' }}
        >
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>SON DETAYLAR & ONAY</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>

                    {/* Section 1: Location & Load */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. KONUM VE YÜK</Text>

                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="map-marker-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>NEREDEN ALINACAK?</Text>
                                <TextInput
                                    style={styles.input}
                                    defaultValue="İstanbul - İkitelli OSB"
                                    placeholderTextColor="#666"
                                />
                            </View>
                            <TouchableOpacity>
                                <Text style={styles.editText}>DÜZENLE</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.inputContainer, { marginTop: 12 }]}>
                            <MaterialCommunityIcons name="flag-checkered" size={20} color="#D4AF37" style={styles.inputIcon} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>NEREYE İNECEK?</Text>
                                <TextInput
                                    style={styles.input}
                                    defaultValue="Ankara - Ostim Sanayi"
                                    placeholderTextColor="#666"
                                />
                            </View>
                        </View>

                        <Text style={[styles.inputLabel, { marginTop: 16, marginBottom: 8 }]}>YÜK TİPİ</Text>
                        <View style={styles.loadTypeGrid}>
                            {LOAD_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[styles.typeCard, selectedLoad === type.id && styles.selectedTypeCard]}
                                    onPress={() => setSelectedLoad(type.id)}
                                >
                                    <MaterialCommunityIcons
                                        name={type.icon}
                                        size={24}
                                        color={selectedLoad === type.id ? '#000' : '#ccc'}
                                    />
                                    <Text style={[styles.typeLabel, selectedLoad === type.id && styles.selectedTypeLabel]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Section 2: Payment */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. ÖDEME YÖNTEMİ</Text>
                        {PAYMENT_METHODS.map((method) => {
                            const isSelected = selectedPayment === method.id;
                            return (
                                <View key={method.id}>
                                    <TouchableOpacity
                                        style={[
                                            styles.paymentCard,
                                            isSelected && styles.selectedPaymentCard
                                        ]}
                                        onPress={() => setSelectedPayment(method.id)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.paymentInfo}>
                                            <MaterialCommunityIcons
                                                name={method.icon}
                                                size={22}
                                                color={isSelected ? '#D4AF37' : '#888'}
                                                style={{ marginRight: 12 }}
                                            />
                                            <Text style={[styles.paymentLabel, isSelected && { color: '#fff', fontWeight: 'bold' }]}>
                                                {method.label}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <MaterialCommunityIcons name="check-circle" size={20} color="#D4AF37" />
                                        )}
                                    </TouchableOpacity>

                                    {/* Credit Card Expansion */}
                                    {isSelected && method.id === 'cc' && (
                                        <View style={styles.ccExpansion}>
                                            <View style={styles.savedCardRow}>
                                                <MaterialCommunityIcons name="credit-card-chip" size={24} color="#D4AF37" />
                                                <View style={{ marginLeft: 12 }}>
                                                    <Text style={styles.savedCardText}>Mastercard **** 4321</Text>
                                                    <Text style={styles.savedCardSub}>Garanti Bonus - Kurumsal</Text>
                                                </View>
                                                <MaterialCommunityIcons name="chevron-right" size={20} color="#666" style={{ marginLeft: 'auto' }} />
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        })}

                        <View style={styles.invoiceContainer}>
                            <Text style={styles.inputLabel}>FATURA BİLGİSİ</Text>
                            <TouchableOpacity style={styles.invoiceSelector}>
                                <Text style={styles.invoiceText}>CepteŞef A.Ş. (Varsayılan)</Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color="#ccc" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Section 3: Contract */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.contractRow}
                            onPress={() => setContractAccepted(!contractAccepted)}
                        >
                            <MaterialCommunityIcons
                                name={contractAccepted ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                size={24}
                                color={contractAccepted ? '#D4AF37' : '#666'}
                            />
                            <Text style={styles.contractText}>
                                <Text style={{ color: '#fff', textDecorationLine: 'underline' }}>Taşıma sözleşmesini</Text> ve <Text style={{ color: '#fff', textDecorationLine: 'underline' }}>sigorta şartlarını</Text> okudum, onaylıyorum.
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Sticky Action Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        {/* Left: Price */}
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>TOPLAM</Text>
                            <Text style={styles.totalPrice}>6.500 ₺</Text>
                            <Text style={styles.vatText}>(KDV Dahil)</Text>
                        </View>

                        {/* Right: Button */}
                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={styles.confirmBtn}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.confirmText}>ÖDEMEYİ TAMAMLA</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#000" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                    </View>
                </View>

            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
    closeBtn: { padding: 8 },

    section: { marginBottom: 24 },
    sectionTitle: { color: '#888', fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 1 },

    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 12, borderRadius: 12 },
    inputIcon: { marginRight: 12 },
    inputLabel: { color: '#ccc', fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
    input: { color: '#fff', fontSize: 14, padding: 0 },
    editText: { color: '#D4AF37', fontSize: 12, fontWeight: '600' },

    loadTypeGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    typeCard: { width: '23%', backgroundColor: '#1A1A1A', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    selectedTypeCard: { backgroundColor: '#D4AF37' },
    typeLabel: { color: '#ccc', fontSize: 10, marginTop: 4, fontWeight: '600', textAlign: 'center' },
    selectedTypeLabel: { color: '#000' },

    // Revised Payment Styles
    paymentCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#1A1A1A', padding: 16, marginBottom: 8,
        borderRadius: 12, borderWidth: 1, borderColor: '#333'
    },
    selectedPaymentCard: {
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        borderColor: '#D4AF37'
    },
    paymentInfo: { flexDirection: 'row', alignItems: 'center' },
    paymentLabel: { color: '#888', fontSize: 14, fontWeight: '500' },

    ccExpansion: {
        backgroundColor: '#111', padding: 16, borderRadius: 12, marginTop: -4, marginBottom: 12,
        borderWidth: 1, borderColor: '#333', borderTopWidth: 0
    },
    savedCardRow: { flexDirection: 'row', alignItems: 'center' },
    savedCardText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    savedCardSub: { color: '#666', fontSize: 11, marginTop: 2 },

    invoiceContainer: { marginTop: 16 },
    invoiceSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A1A', padding: 12, borderRadius: 8, marginTop: 4 },
    invoiceText: { color: '#fff', fontSize: 14 },

    contractRow: { flexDirection: 'row', alignItems: 'flex-start' },
    contractText: { color: '#888', fontSize: 12, marginLeft: 12, flex: 1, lineHeight: 18 },

    // Footer Styles
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#222' },
    footerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

    totalContainer: { justifyContent: 'center' },
    totalLabel: { color: '#888', fontSize: 10, fontWeight: '700', marginBottom: 2 },
    totalPrice: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    vatText: { color: '#D4AF37', fontSize: 10, fontWeight: '600' },

    confirmBtn: {
        backgroundColor: '#D4AF37', borderRadius: 28, paddingHorizontal: 24, height: 50,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, marginLeft: 20
    },
    confirmText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
