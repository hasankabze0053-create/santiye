import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// MOCK DATA FOR ACTIVE SHIPMENTS
const ACTIVE_SHIPMENTS = [
    { id: 'TR-8821', status: 'Yolda', from: 'Kadıköy Şantiye', to: 'Gebze Depo', type: 'Hafriyat', driver: 'Ahmet Y.', eta: '14:30' }
];

export default function LogisticsScreen() {
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'wizard'
    const [wizardStep, setWizardStep] = useState(1);

    // Form Data
    const [formData, setFormData] = useState({
        loadType: null,
        weight: '',
        vehicle: null,
        needsCrane: false,
        needsLabor: false,
        note: ''
    });

    // --- DASHBOARD VIEW ---
    const renderDashboard = () => (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Quick Actions */}
            <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.mainActionBtn} onPress={() => setViewMode('wizard')}>
                    <LinearGradient colors={['#FFD700', '#FFC107']} style={styles.btnGradient}>
                        <MaterialCommunityIcons name="truck-fast" size={40} color="#000" />
                        <Text style={styles.mainBtnText}>YENİ NAKLİYE ÇAĞIR</Text>
                        <Text style={styles.mainBtnSub}>7/24 Anında Araç</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.sideActions}>
                    <TouchableOpacity style={styles.sideBtn}>
                        <MaterialCommunityIcons name="history" size={24} color="#fff" />
                        <Text style={styles.sideBtnText}>Geçmiş</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sideBtn}>
                        <MaterialCommunityIcons name="file-document-outline" size={24} color="#fff" />
                        <Text style={styles.sideBtnText}>İrsaliyeler</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Active Shipments */}
            <Text style={styles.sectionTitle}>AKTİF TAŞIMALARIM</Text>
            {ACTIVE_SHIPMENTS.map(item => (
                <View key={item.id} style={styles.activeCard}>
                    <View style={styles.cardRow}>
                        <View style={styles.statusBadge}>
                            <View style={styles.pulsingDot} />
                            <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                        <Text style={styles.trackingId}>{item.id}</Text>
                    </View>
                    <View style={styles.routeContainer}>
                        <View style={styles.point}>
                            <View style={styles.pointDot} />
                            <Text style={styles.pointText}>{item.from}</Text>
                        </View>
                        <View style={styles.line} />
                        <View style={styles.point}>
                            <View style={[styles.pointDot, { backgroundColor: '#FFD700' }]} />
                            <Text style={styles.pointText}>{item.to}</Text>
                        </View>
                    </View>
                    <View style={styles.driverRow}>
                        <MaterialCommunityIcons name="steering" size={16} color="#888" />
                        <Text style={styles.driverText}>{item.driver} • {item.type}</Text>
                        <Text style={styles.etaText}>Varış: {item.eta}</Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );

    // --- WIZARD STEPS ---
    const renderWizard = () => (
        <View style={{ flex: 1 }}>
            {/* Step Progress */}
            <View style={styles.progressContainer}>
                {[1, 2, 3, 4].map(step => (
                    <View key={step} style={[styles.progressStep, wizardStep >= step && styles.progressActive]} />
                ))}
            </View>
            <Text style={styles.stepTitle}>
                {wizardStep === 1 ? 'Yükünü Seç' :
                    wizardStep === 2 ? 'Detaylar & Hacim' :
                        wizardStep === 3 ? 'Araç & Ekipman' : 'Rota & Onay'}
            </Text>

            <ScrollView contentContainerStyle={styles.wizardContent}>

                {/* STEP 1: LOAD TYPE */}
                {wizardStep === 1 && (
                    <View style={styles.grid}>
                        {[
                            { id: 'kaba', title: 'Kaba İnşaat', icon: 'wall' }, // tuğla
                            { id: 'ince', title: 'İnce İşler', icon: 'format-paint' }, // boya/seramik
                            { id: 'demir', title: 'Demir/Profil', icon: 'girder' },
                            { id: 'hafriyat', title: 'Hafriyat', icon: 'dump-truck' },
                            { id: 'makine', title: 'İş Makinesi', icon: 'excavator' },
                            { id: 'diger', title: 'Diğer', icon: 'package-variant' },
                        ].map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.opticCard, formData.loadType === item.id && styles.opticSelected]}
                                onPress={() => setFormData({ ...formData, loadType: item.id })}
                            >
                                <MaterialCommunityIcons
                                    name={item.icon}
                                    size={32}
                                    color={formData.loadType === item.id ? '#000' : '#FFD700'}
                                />
                                <Text style={[styles.opticText, formData.loadType === item.id && styles.opticTextSelected]}>
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* STEP 2: DETAILS */}
                {wizardStep === 2 && (
                    <View>
                        <Text style={styles.inputLabel}>Tahmini Ağırlık / Miktar</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: 10 Palet veya 5 Ton"
                            placeholderTextColor="#666"
                            value={formData.weight}
                            onChangeText={t => setFormData({ ...formData, weight: t })}
                        />
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color="#FFD700" />
                            <Text style={styles.infoText}>
                                Yükünüzün fotoğrafını çekmeniz, doğru araç seçimi için kritiktir.
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.photoBtn}>
                            <Ionicons name="camera" size={24} color="#000" />
                            <Text style={styles.photoBtnText}>Yük Fotoğrafı Ekle</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* STEP 3: VEHICLE */}
                {wizardStep === 3 && (
                    <View>
                        <Text style={styles.sectionHeader}>Araç Tipi</Text>
                        {[
                            { id: 'kamyonet', title: 'Kamyonet', desc: 'Şehir içi, 3.5 Tona kadar' },
                            { id: 'kamyon', title: '10 Teker', desc: '15 Tona kadar yükler' },
                            { id: 'tir', title: 'Tır / Lowbed', desc: 'Ağır tonaj ve iş makineleri' },
                        ].map(v => (
                            <TouchableOpacity
                                key={v.id}
                                style={[styles.listOption, formData.vehicle === v.id && styles.opticSelected]}
                                onPress={() => setFormData({ ...formData, vehicle: v.id })}
                            >
                                <View>
                                    <Text style={[styles.opticText, formData.vehicle === v.id && styles.opticTextSelected]}>{v.title}</Text>
                                    <Text style={[styles.opticDesc, formData.vehicle === v.id && styles.opticTextSelected]}>{v.desc}</Text>
                                </View>
                                {formData.vehicle === v.id && <Ionicons name="checkmark-circle" size={24} color="#000" />}
                            </TouchableOpacity>
                        ))}

                        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Ek Hizmetler</Text>
                        <TouchableOpacity
                            style={styles.checkOption}
                            onPress={() => setFormData({ ...formData, needsCrane: !formData.needsCrane })}
                        >
                            <MaterialCommunityIcons name={formData.needsCrane ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color="#FFD700" />
                            <Text style={styles.checkText}>Vinçli Araç İstiyorum</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.checkOption}
                            onPress={() => setFormData({ ...formData, needsLabor: !formData.needsLabor })}
                        >
                            <MaterialCommunityIcons name={formData.needsLabor ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color="#FFD700" />
                            <Text style={styles.checkText}>Hamaliye / İndirme Ekibi</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* STEP 4: ROUTE & SUMMARY */}
                {wizardStep === 4 && (
                    <View>
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.sumLabel}>Nereden:</Text>
                                <Text style={styles.sumValue}>Mevcut Konum (Şantiye A)</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.sumLabel}>Nereye:</Text>
                                <Text style={styles.sumValue}>Seçilen Konum...</Text>
                            </View>
                            <View style={styles.divider} />

                            <Text style={styles.priceLabel}>Tahmini Tutar</Text>
                            <Text style={styles.priceValue}>₺3.500 - ₺4.200</Text>
                            <Text style={styles.insuranceBadge}>🛡️ Yükünüz 100.000 TL Sigortalıdır</Text>
                        </View>

                        <Text style={styles.noteLabel}>Sürücüye Notlar (Dar sokak vb.)</Text>
                        <TextInput
                            style={styles.noteInput}
                            placeholder="Örn: Araç saat 17:00'den sonra girmeli..."
                            placeholderTextColor="#666"
                            multiline
                            value={formData.note}
                            onChangeText={t => setFormData({ ...formData, note: t })}
                        />
                    </View>
                )}

            </ScrollView>

            {/* Wizard Footer */}
            <View style={styles.footer}>
                {wizardStep > 1 && (
                    <TouchableOpacity style={styles.backBtn} onPress={() => setWizardStep(prev => prev - 1)}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={() => {
                        if (wizardStep < 4) setWizardStep(prev => prev + 1);
                        else {
                            Alert.alert("Başarılı", "Talebiniz oluşturuldu! Bölgedeki taşıyıcılara iletiliyor.");
                            setViewMode('dashboard');
                            setWizardStep(1);
                        }
                    }}
                >
                    <Text style={styles.nextBtnText}>{wizardStep === 4 ? 'TALEBİ ONAYLA' : 'DEVAM ET'}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#1a1a1a']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    {viewMode === 'wizard' ? (
                        <TouchableOpacity onPress={() => { setViewMode('dashboard'); setWizardStep(1); }} style={styles.navBack}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    ) : <View style={{ width: 40 }} />}
                    <Text style={styles.headerTitle}>NAKLİYE & LOJİSTİK</Text>
                    <View style={{ width: 40 }} />
                </View>

                {viewMode === 'dashboard' ? renderDashboard() : renderWizard()}

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
    headerTitle: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
    navBack: { padding: 8 },
    scrollContent: { padding: 20 },

    // Dashboard
    actionGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    mainActionBtn: { flex: 2, borderRadius: 20, overflow: 'hidden' },
    btnGradient: { padding: 20, alignItems: 'center', justifyContent: 'center', height: 140 },
    mainBtnText: { color: '#000', fontSize: 16, fontWeight: '900', marginTop: 10, textAlign: 'center' },
    mainBtnSub: { color: '#333', fontSize: 11, marginTop: 4 },

    sideActions: { flex: 1, gap: 15 },
    sideBtn: { flex: 1, backgroundColor: '#1E1E1E', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
    sideBtnText: { color: '#ccc', fontSize: 12, marginTop: 6 },

    sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
    activeCard: { backgroundColor: '#111', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#333' },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    pulsingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 6 },
    statusText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
    trackingId: { color: '#666', fontFamily: 'monospace' },

    routeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    point: { alignItems: 'center' },
    pointDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50', marginBottom: 6 },
    pointText: { color: '#fff', fontSize: 12 },
    line: { flex: 1, height: 2, backgroundColor: '#333', marginHorizontal: 10, top: -9 },

    driverRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 },
    driverText: { color: '#aaa', fontSize: 12, marginLeft: 6 },
    etaText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },

    // Wizard
    progressContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 10 },
    progressStep: { flex: 1, height: 4, backgroundColor: '#333', borderRadius: 2 },
    progressActive: { backgroundColor: '#FFD700' },
    stepTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 20 },
    wizardContent: { padding: 20 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
    opticCard: { width: '47%', aspectRatio: 1, backgroundColor: '#1E1E1E', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
    opticSelected: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    opticText: { color: '#ccc', marginTop: 10, fontWeight: 'bold' },
    opticTextSelected: { color: '#000' },

    inputLabel: { color: '#ccc', marginBottom: 10 },
    input: { backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#444', marginBottom: 20 },
    infoBox: { flexDirection: 'row', backgroundColor: 'rgba(255, 215, 0, 0.1)', padding: 15, borderRadius: 12, marginBottom: 20 },
    infoText: { color: '#FFD700', fontSize: 12, marginLeft: 10, flex: 1 },
    photoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12 },
    photoBtnText: { color: '#000', fontWeight: 'bold', marginLeft: 10 },

    listOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E1E1E', padding: 20, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
    opticDesc: { color: '#666', fontSize: 12, marginTop: 4 },
    checkOption: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    checkText: { color: '#fff', marginLeft: 10, fontSize: 15 },

    summaryCard: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 16, marginBottom: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    sumLabel: { color: '#888' },
    sumValue: { color: '#fff', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 15 },
    priceLabel: { color: '#aaa', textAlign: 'center', fontSize: 12 },
    priceValue: { color: '#FFD700', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 5 },
    insuranceBadge: { textAlign: 'center', color: '#4CAF50', fontSize: 12, marginTop: 10 },
    noteLabel: { color: '#ccc', marginBottom: 10 },
    noteInput: { backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 12, minHeight: 80, textAlignVertical: 'top' },

    footer: { padding: 20, flexDirection: 'row', gap: 15 },
    backBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
    nextBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#FFD700', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    nextBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
