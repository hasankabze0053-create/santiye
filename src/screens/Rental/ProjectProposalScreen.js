import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Reused Category Data for Selection Modal
const PROPOSAL_CATEGORIES = [
    {
        id: '1', title: 'KULE VE DİKEY KALDIRMA', icon: 'tower-beach',
        items: ['Sabit Kule Vinç', 'Mobil Kule Vinç', 'Gırgır Vinç', 'Dış Cephe Asansörü', 'Yük Asansörü']
    },
    {
        id: '2', title: 'MOBİL KALDIRMA', icon: 'tow-truck',
        items: ['Mobil Vinç', 'Hiyap Vinç', 'Paletli Vinç', 'Örümcek Vinç', 'Telehandler']
    },
    {
        id: '3', title: 'HAFRİYAT VE KAZI', icon: 'excavator',
        items: ['Paletli Ekskavatör', 'Lastikli Ekskavatör', 'Beko Loder (JCB)', 'Yıkım Ekskavatörü']
    },
    {
        id: '4', title: 'YÜKLEME VE SERİ ÇALIŞMA', icon: 'bulldozer',
        items: ['Lastikli Loder', 'Paletli Loder', 'Bobcat']
    },
    {
        id: '5', title: 'PERSONEL YÜKSELTİCİ', icon: 'ladder',
        items: ['Makaslı Platform', 'Eklemli Platform', 'Sepetli Vinç']
    },
    {
        id: '10', title: 'NAKLİYE VE LOJİSTİK', icon: 'truck',
        items: ['Damperli Kamyon', 'Tır (Lowbed)', 'Su Tankeri']
    },
];

export default function ProjectProposalScreen({ navigation }) {
    const [photos, setPhotos] = useState([]); // Array of photo objects
    const [address, setAddress] = useState('Bağdat Cad. No:15, Kadıköy'); // Mock GPS default
    const [description, setDescription] = useState('');

    // Mock Photo Add
    const handleAddPhoto = () => {
        // In real app: Open ImagePicker
        const newPhoto = {
            id: Date.now(),
            uri: 'https://via.placeholder.com/150/FFD700/000000?text=Foto'
        };
        setPhotos([...photos, newPhoto]);
    };

    const handleRemovePhoto = (id) => {
        setPhotos(photos.filter(p => p.id !== id));
    };

    // --- MACHINE SELECTION LOGIC ---
    const [selectedMachines, setSelectedMachines] = useState([]);
    const [machineModalVisible, setMachineModalVisible] = useState(false);

    const handleAddMachine = (machineName, categoryIcon) => {
        const existing = selectedMachines.find(m => m.name === machineName);
        if (existing) {
            // Already exists, increment quantity
            handleUpdateQuantity(existing.id, 1);
        } else {
            // Add new
            const newMachine = {
                id: Date.now().toString(),
                name: machineName,
                icon: categoryIcon,
                quantity: 1
            };
            setSelectedMachines([...selectedMachines, newMachine]);
        }
        setMachineModalVisible(false);
    };

    const handleUpdateQuantity = (id, delta) => {
        setSelectedMachines(prev => prev.map(m => {
            if (m.id === id) {
                const newQty = m.quantity + delta;
                return newQty > 0 ? { ...m, quantity: newQty } : m;
            }
            return m;
        }));
    };

    const handleRemoveMachine = (id) => {
        setSelectedMachines(prev => prev.filter(m => m.id !== id));
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <SafeAreaView style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>PROJE DETAYLARI</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* SECTION 1: FIELD PHOTOS (Horizontal Gallery) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Saha Görselleri</Text>
                        <Text style={styles.sectionSub}>Detaylı teklif için farklı açılardan çekin</Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.galleryContainer}
                        >
                            {/* ADD PHOTO BUTTON */}
                            <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
                                <MaterialCommunityIcons name="camera-plus" size={32} color="#FFD700" />
                                <Text style={styles.addPhotoText}>EKLE</Text>
                            </TouchableOpacity>

                            {/* PHOTOS LIST */}
                            {photos.map((photo) => (
                                <View key={photo.id} style={styles.photoContainer}>
                                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => handleRemovePhoto(photo.id)}
                                    >
                                        <Ionicons name="close" size={14} color="#fff" />
                                    </TouchableOpacity>

                                    {/* Mock Progress Ring (Static for demo) */}
                                    {/* <View style={styles.progressRing} /> */}
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* SECTION 2: LOCATION */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Proje Konumu</Text>

                        <View style={styles.locationInputContainer}>
                            {/* Pin Icon */}
                            <MaterialCommunityIcons name="map-marker" size={24} color="#FFD700" style={styles.locationIcon} />

                            {/* Input */}
                            <TextInput
                                style={styles.locationInput}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Adres giriniz..."
                                placeholderTextColor="#666"
                            />

                            {/* GPS Button */}
                            <TouchableOpacity style={styles.gpsButton} onPress={() => setAddress('Mevcut Konum Bulundu...')}>
                                <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#FFD700" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* SECTION 3: DESCRIPTION */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. Yapılacak İş / Notlar</Text>
                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Eski fabrika binası yıkımı. Giriş kapısı dar, yüksek tonajlı vinç sığmayabilir..."
                                placeholderTextColor="#666"
                                multiline
                                textAlignVertical="top"
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>
                    </View>

                    {/* SECTION 4: MACHINE PREFERENCES (NEW) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>4. Makine Tercihleriniz (Opsiyonel)</Text>
                        <Text style={styles.sectionSub}>Aklınızda belirli bir model var mı?</Text>

                        {/* Selected Machines List */}
                        {selectedMachines.map(machine => (
                            <View key={machine.id} style={styles.machineCard}>
                                <View style={styles.machineInfo}>
                                    <View style={styles.machineIconBox}>
                                        <MaterialCommunityIcons name={machine.icon} size={24} color="#FFD700" />
                                    </View>
                                    <Text style={styles.machineName}>{machine.name}</Text>
                                </View>

                                <View style={styles.machineActions}>
                                    {/* Quantity Selector */}
                                    <View style={styles.qtyContainer}>
                                        <TouchableOpacity onPress={() => handleUpdateQuantity(machine.id, -1)} style={styles.qtyBtn}>
                                            <Text style={styles.qtyText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.qtyValue}>{machine.quantity}</Text>
                                        <TouchableOpacity onPress={() => handleUpdateQuantity(machine.id, 1)} style={styles.qtyBtn}>
                                            <Text style={styles.qtyText}>+</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Remove Button */}
                                    <TouchableOpacity onPress={() => handleRemoveMachine(machine.id)} style={styles.removeMachineBtn}>
                                        <Ionicons name="trash-outline" size={20} color="#CF3335" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {/* Add Machine Button */}
                        <TouchableOpacity
                            style={styles.addMachineBtn}
                            onPress={() => setMachineModalVisible(true)}
                        >
                            <Ionicons name="add" size={24} color="#FFD700" />
                            <Text style={styles.addMachineText}>Başka Makine / Ekipman Ekle</Text>
                        </TouchableOpacity>
                    </View>

                    {/* MACHINE SELECTION MODAL */}
                    <Modal
                        visible={machineModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setMachineModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Makine Seç</Text>
                                    <TouchableOpacity onPress={() => setMachineModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {PROPOSAL_CATEGORIES.map(cat => (
                                        <View key={cat.id} style={styles.modalCategory}>
                                            <View style={styles.modalCatHeader}>
                                                <MaterialCommunityIcons name={cat.icon} size={20} color="#FFD700" style={{ marginRight: 8 }} />
                                                <Text style={styles.modalCatTitle}>{cat.title}</Text>
                                            </View>
                                            <View style={styles.modalItemsRow}>
                                                {cat.items.map((item, idx) => (
                                                    <TouchableOpacity
                                                        key={idx}
                                                        style={styles.modalItemBadge}
                                                        onPress={() => handleAddMachine(item, cat.icon)}
                                                    >
                                                        <Text style={styles.modalItemText}>{item}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* FOOTER BUTTON */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitBtn}>
                    <LinearGradient
                        colors={['#FFD700', '#FFC000']} // Gold Gradient
                        style={styles.submitGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.submitText}>PROJENİZ İÇİN TEKLİF ALIN</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerContainer: {
        backgroundColor: '#111',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120, // Space for footer
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 4,
    },
    sectionSub: {
        fontSize: 12,
        color: '#888',
        marginBottom: 16,
    },

    // Gallery Styles
    galleryContainer: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    addPhotoBtn: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFD700',
        borderStyle: 'dashed',
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    addPhotoText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
    photoContainer: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 12,
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: '#222',
    },
    deleteBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#CF3335',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },

    // Location Styles
    locationInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        height: 56,
        paddingHorizontal: 12,
    },
    locationIcon: {
        marginRight: 12,
    },
    locationInput: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        height: '100%',
    },
    gpsButton: {
        padding: 8,
    },

    // Description Styles
    textAreaContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        height: 120,
        padding: 12,
    },
    textArea: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
    },

    // Machine Selection Styles
    machineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    machineInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    machineIconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    machineName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        width: '60%' // Prevent overlap
    },
    machineActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 8,
        height: 32,
        marginRight: 10,
    },
    qtyBtn: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
    },
    qtyValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 4,
    },
    removeMachineBtn: {
        padding: 4,
    },
    addMachineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderStyle: 'dashed',
        borderRadius: 12,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    addMachineText: {
        color: '#ccc',
        marginLeft: 8,
        fontSize: 14,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        height: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalCategory: {
        marginBottom: 20,
    },
    modalCatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalCatTitle: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalItemsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    modalItemBadge: {
        backgroundColor: '#222',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalItemText: {
        color: '#ccc',
        fontSize: 13,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    submitBtn: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
    },
    submitGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 0.5,
    },
});
