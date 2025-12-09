import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LuxuryCard from '../../components/LuxuryCard';
import PremiumBackground from '../../components/PremiumBackground';

const { width } = Dimensions.get('window');

// --- SEÇENEK DATALARI ---
const TERRAIN_OPTIONS = [
    { id: 'duz', title: 'Düz Arazi', icon: 'landscape', color: '#4CAF50' }, // Green
    { id: 'az', title: 'Az Eğimli', icon: 'trending-up', color: '#FFC107' }, // Amber
    { id: 'cok', title: 'Çok Eğimli', icon: 'alert-triangle', color: '#F44336' }, // Red
];

const STRUCTURE_OPTIONS = [
    { id: 'beton', title: 'Betonarme', icon: 'office-building' },
    { id: 'celik', title: 'Çelik', icon: 'factory' },
    { id: 'prefabrik', title: 'Prefabrik', icon: 'home-city' },
];

const ROOF_OPTIONS = [
    { id: 'teras', title: 'Teras Çatı', icon: 'checkbox-blank-outline' },
    { id: 'kiremit', title: 'Kiremit Çatı', icon: 'home-roof' },
    { id: 'sandvic', title: 'Sandviç Panel', icon: 'layers' },
];

const FACADE_OPTIONS = [
    { id: 'siva', title: 'Sıva+Boya', icon: 'format-paint' },
    { id: 'mantolama', title: 'Mantolama', icon: 'wall' },
    { id: 'mekanik', title: 'Mekanik/Lüks', icon: 'diamond-stone' },
];

const HEATING_OPTIONS = [
    { id: 'kombi', title: 'Kombi+Petek', icon: 'radiator' },
    { id: 'yerden', title: 'Yerden Isıtma', icon: 'fire' },
    { id: 'klima', title: 'Klima / VRF', icon: 'air-conditioner' },
];

const LOGISTICS_OPTIONS = [
    { id: 'rahat', title: 'Rahat (Tır)', icon: 'truck-check', color: '#4CAF50' },
    { id: 'dar', title: 'Dar Sokak', icon: 'truck-delivery', color: '#FFC107' },
    { id: 'zor', title: 'Zorlu/Elle', icon: 'human-dolly', color: '#F44336' },
];

const LANDSCAPE_OPTIONS = [
    { id: 'temel', title: 'Temel', icon: 'sprout' },
    { id: 'standart', title: 'Standart', icon: 'grass' },
    { id: 'premium', title: 'Premium', icon: 'tree' },
];

// --- YARDIMCI KOMPONENTLER ---

const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBox}>
            <MaterialCommunityIcons name={icon} size={20} color="#121212" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLine} />
    </View>
);

const CounterRow = ({ label, value, onDecrement, onIncrement, suffix = '' }) => (
    <View style={styles.counterRow}>
        <Text style={styles.counterLabel}>{label}</Text>
        <View style={styles.counterControls}>
            <TouchableOpacity style={styles.counterBtn} onPress={onDecrement}>
                <Ionicons name="remove" size={20} color="#D4AF37" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{value} {suffix}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={onIncrement}>
                <Ionicons name="add" size={20} color="#D4AF37" />
            </TouchableOpacity>
        </View>
    </View>
);

const SelectionGrid = ({ options, selectedId, onSelect, columns = 3 }) => (
    <View style={styles.gridContainer}>
        {options.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
                <TouchableOpacity
                    key={opt.id}
                    style={[
                        styles.gridItem,
                        { width: columns === 3 ? '31%' : '48%' },
                        isSelected && styles.gridItemSelected
                    ]}
                    onPress={() => onSelect(opt.id)}
                >
                    <MaterialCommunityIcons
                        name={opt.icon}
                        size={24}
                        color={isSelected ? '#121212' : (opt.color || '#D4AF37')}
                    />
                    <Text style={[styles.gridItemText, isSelected && styles.gridItemTextSelected]}>
                        {opt.title}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

const ToggleRow = ({ label, icon, value, onToggle }) => (
    <TouchableOpacity style={styles.toggleRow} onPress={() => onToggle(!value)} activeOpacity={0.8}>
        <View style={styles.toggleLeft}>
            <MaterialCommunityIcons name={icon} size={24} color="#888" style={{ marginRight: 12 }} />
            <Text style={[styles.toggleLabel, value && styles.toggleLabelActive]}>{label}</Text>
        </View>
        <View style={[styles.customToggle, value && styles.customToggleActive]}>
            <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
        </View>
    </TouchableOpacity>
);


export default function DetailedCostScreen({ navigation }) {
    // --- STATE ---
    // 1. Temel Yapı
    const [floorCount, setFloorCount] = useState(1);
    const [terrain, setTerrain] = useState('duz');
    const [structure, setStructure] = useState('beton');

    // 2. Kabuk & Görünüm
    const [roof, setRoof] = useState('teras');
    const [facade, setFacade] = useState('mantolama');

    // 3. Teknik & Lojistik
    const [heating, setHeating] = useState('kombi');
    const [logistics, setLogistics] = useState('rahat');

    // 4. Lüks & Prestij
    const [pool, setPool] = useState(false);
    const [hasParking, setHasParking] = useState(false);
    const [fireplace, setFireplace] = useState(false);

    // 5. Teknoloji & Güvenlik
    const [cameraSystem, setCameraSystem] = useState(false);
    const [smartHome, setSmartHome] = useState(false);

    // 6. Peyzaj & Enerji
    const [solar, setSolar] = useState(false);
    const [landscape, setLandscape] = useState('standart');
    const [generator, setGenerator] = useState(false);

    // 7. Mali
    const [contractorMarkup, setContractorMarkup] = useState(true); // %20 Müteahhit karı


    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#D4AF37" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>DETAYLI ANALİZ</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.introText}>
                        Projenizin gerçek maliyetini hesaplamak için detayları aşağıdan belirleyin.
                    </Text>

                    {/* 1. KAT & ARAZİ */}
                    <SectionHeader title="YAPI & ARAZİ" icon="domain" />
                    <LuxuryCard style={styles.card}>
                        <CounterRow
                            label="Kat Adedi"
                            value={floorCount}
                            onDecrement={() => floorCount > 1 && setFloorCount(f => f - 1)}
                            onIncrement={() => setFloorCount(f => f + 1)}
                            suffix="Kat"
                        />
                        <View style={styles.divider} />
                        <Text style={styles.subLabel}>Arazi Eğim Durumu</Text>
                        <SelectionGrid options={TERRAIN_OPTIONS} selectedId={terrain} onSelect={setTerrain} />

                        <View style={styles.divider} />
                        <Text style={styles.subLabel}>Taşıyıcı Sistem</Text>
                        <SelectionGrid options={STRUCTURE_OPTIONS} selectedId={structure} onSelect={setStructure} />
                    </LuxuryCard>

                    {/* 2. DIŞ CEPHE & ÇATI */}
                    <SectionHeader title="DIŞ KABUK" icon="home-roof" />
                    <LuxuryCard style={styles.card}>
                        <Text style={styles.subLabel}>Çatı Tipi</Text>
                        <SelectionGrid options={ROOF_OPTIONS} selectedId={roof} onSelect={setRoof} />

                        <View style={styles.divider} />
                        <Text style={styles.subLabel}>Cephe Kaplaması</Text>
                        <SelectionGrid options={FACADE_OPTIONS} selectedId={facade} onSelect={setFacade} />
                    </LuxuryCard>

                    {/* 3. TEKNİK & LOJİSTİK */}
                    <SectionHeader title="TEKNİK & LOJİSTİK" icon="cogs" />
                    <LuxuryCard style={styles.card}>
                        <Text style={styles.subLabel}>Isıtma Sistemi</Text>
                        <SelectionGrid options={HEATING_OPTIONS} selectedId={heating} onSelect={setHeating} />

                        <View style={styles.divider} />
                        <Text style={styles.subLabel}>Sokak/Ulaşım Durumu</Text>
                        <SelectionGrid options={LOGISTICS_OPTIONS} selectedId={logistics} onSelect={setLogistics} />
                    </LuxuryCard>

                    {/* 4. PRESTİJ EKLENTİLERİ */}
                    <SectionHeader title="PRESTİJ & KEYİF" icon="star" />
                    <LuxuryCard style={styles.card}>
                        <ToggleRow label="Havuz Yapımı" icon="pool" value={pool} onToggle={setPool} />
                        <View style={styles.divider} />
                        <ToggleRow label="Otopark Alanı" icon="car" value={hasParking} onToggle={setHasParking} />
                        <View style={styles.divider} />
                        <ToggleRow label="Şömine / Barbekü" icon="fire" value={fireplace} onToggle={setFireplace} />
                    </LuxuryCard>

                    {/* 5. GÜVENLİK & TEKNOLOJİ */}
                    <SectionHeader title="AKILLI BİNA" icon="cctv" />
                    <LuxuryCard style={styles.card}>
                        <ToggleRow label="Kamera & Güvenlik" icon="shield-check" value={cameraSystem} onToggle={setCameraSystem} />
                        <View style={styles.divider} />
                        <ToggleRow label="Akıllı Ev Sistemi" icon="home-automation" value={smartHome} onToggle={setSmartHome} />
                    </LuxuryCard>

                    {/* 6. PEYZAJ & ENERJİ */}
                    <SectionHeader title="BAHÇE & ENERJİ" icon="tree" />
                    <LuxuryCard style={styles.card}>
                        <Text style={styles.subLabel}>Peyzaj Düzenleme</Text>
                        <SelectionGrid options={LANDSCAPE_OPTIONS} selectedId={landscape} onSelect={setLandscape} />

                        <View style={styles.divider} />
                        <ToggleRow label="Güneş Enerjisi (GES)" icon="solar-power" value={solar} onToggle={setSolar} />
                        <View style={styles.divider} />
                        <ToggleRow label="Jeneratör Altyapısı" icon="lightning-bolt" value={generator} onToggle={setGenerator} />
                    </LuxuryCard>

                    {/* 7. FİNANS */}
                    <View style={{ height: 20 }} />
                    <LuxuryCard style={[styles.card, { borderColor: '#D4AF37', borderWidth: 1 }]}>
                        <ToggleRow
                            label="Müteahhit Kârı Dahi (%20)"
                            icon="briefcase"
                            value={contractorMarkup}
                            onToggle={setContractorMarkup}
                        />
                    </LuxuryCard>

                    <TouchableOpacity style={styles.calculateBtn}>
                        <LinearGradient
                            colors={['#D4AF37', '#AA8C2C']}
                            style={styles.btnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.btnText}>MALİYETİ HESAPLA</Text>
                            <Ionicons name="calculator" size={24} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
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
        paddingBottom: 20,
    },
    headerTitle: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    backButton: {
        padding: 5,
    },
    content: {
        paddingHorizontal: 16,
    },
    introText: {
        color: '#888',
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
    },
    card: {
        padding: 16,
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 16,
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12,
    },
    sectionIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#D4AF37',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginRight: 12,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    // Counter
    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    counterLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderRadius: 8,
        padding: 4,
    },
    counterBtn: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: 6,
    },
    counterValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        width: 60,
        textAlign: 'center',
    },

    // Grid Selection
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
        marginTop: 8,
    },
    gridItem: {
        backgroundColor: '#121212',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    gridItemSelected: {
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37',
    },
    gridItemText: {
        color: '#666',
        fontSize: 11,
        marginTop: 8,
        fontWeight: '500',
        textAlign: 'center',
    },
    gridItemTextSelected: {
        color: '#121212',
        fontWeight: 'bold',
    },
    subLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Toggle Row
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        color: '#666',
        fontSize: 16,
    },
    toggleLabelActive: {
        color: '#fff',
        fontWeight: '500',
    },
    customToggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#333',
        padding: 2,
    },
    customToggleActive: {
        backgroundColor: '#D4AF37',
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    toggleKnobActive: {
        transform: [{ translateX: 22 }],
    },

    // Button
    calculateBtn: {
        marginTop: 24,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 28,
    },
    btnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginRight: 12,
    },
});
