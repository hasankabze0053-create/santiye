import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Advanced Floor Editor Component (List Based)
const FloorEditor = ({ floorNum, currentData, onSave, onClose }) => {
    const USAGE_TYPES = [
        { id: 'apartment', label: 'Daire', icon: 'home' },
        { id: 'shop', label: 'Dükkan', icon: 'store' },
        { id: 'office', label: 'Ofis', icon: 'office-building' },
        { id: 'parking', label: 'Otopark', icon: 'car' },
        { id: 'shelter', label: 'Sığınak', icon: 'shield-home' },
        { id: 'storage', label: 'Depo', icon: 'package-variant' },
        { id: 'common', label: 'Ortak Alan', icon: 'stairs' }
    ];

    // Convert currentData to array format if it's not already
    // currentData can be number (legacy), object { apartment: 2 } (legacy mixed), or array [{ type: 'apartment', name: 'Daire 1', area: '' }]
    const parseData = (data) => {
        if (!data) return [];
        // Deep copy array to avoid reference issues
        if (Array.isArray(data)) return data.map(item => ({ ...item }));

        // Convert object { apartment: 2 } to array
        if (typeof data === 'object') {
            let list = [];
            Object.entries(data).forEach(([type, count]) => {
                const typeDef = USAGE_TYPES.find(t => t.id === type);
                const label = typeDef ? typeDef.label : type;

                for (let i = 0; i < count; i++) {
                    list.push({
                        id: Math.random().toString(), // temp id
                        type,
                        name: `${label} ${i + 1}`,
                        area: ''
                    });
                }
            });
            return list;
        }

        // Convert number
        if (typeof data === 'number' || typeof data === 'string') {
            const count = parseInt(data) || 0;
            return Array.from({ length: count }).map((_, i) => ({
                id: Math.random().toString(),
                type: 'apartment',
                name: `Daire ${i + 1}`,
                area: ''
            }));
        }
        return [];
    };

    const [localList, setLocalList] = useState(parseData(currentData));

    const addUnit = (type) => {
        const count = localList.filter(u => u.type === type).length + 1;
        const typeDef = USAGE_TYPES.find(t => t.id === type);
        const label = typeDef ? typeDef.label : type;
        const defaultName = `${label} ${count}`;

        setLocalList([...localList, {
            id: Math.random().toString(),
            type,
            name: defaultName,
            area: ''
        }]);
    };

    const removeUnit = (index) => {
        const newList = [...localList];
        newList.splice(index, 1);
        setLocalList(newList);
    };

    const updateUnit = (index, field, value) => {
        const newList = [...localList];
        newList[index] = { ...newList[index], [field]: value };
        setLocalList(newList);
    };



    return (
        <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={[styles.floorEditorCard, { height: '80%' }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {floorNum > 0 ? `${floorNum}. KAT` : (floorNum === 0 ? 'ZEMİN KAT' : `${Math.abs(floorNum)}. BODRUM`)}
                        </Text>
                        <Text style={styles.modalSubtitle}>Bağımsız Bölüm Listesi</Text>
                    </View>

                    {/* Add Buttons */}
                    <View style={styles.addButtonsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {USAGE_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={styles.addTypeBtn}
                                    onPress={() => addUnit(type.id)}
                                >
                                    <MaterialCommunityIcons name="plus" size={14} color="#000" />
                                    <Text style={styles.addTypeBtnText}>{type.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                        {localList.length === 0 ? (
                            <Text style={styles.emptyText}>Bu katta henüz birim yok. Yukarıdan ekleyiniz.</Text>
                        ) : (
                            localList.map((unit, index) => (
                                <View key={unit.id || index} style={styles.unitRow}>
                                    <View style={[styles.unitIcon, { backgroundColor: unit.type === 'shop' ? '#D4AF37' : '#333' }]}>
                                        <MaterialCommunityIcons
                                            name={USAGE_TYPES.find(t => t.id === unit.type)?.icon || 'home'}
                                            size={18}
                                            color={unit.type === 'shop' ? '#000' : '#888'}
                                        />
                                    </View>

                                    <TextInput
                                        style={styles.unitNameInput}
                                        value={unit.name}
                                        onChangeText={(t) => updateUnit(index, 'name', t)}
                                        placeholder="Birim Adı"
                                        placeholderTextColor="#555"
                                    />

                                    <TextInput
                                        style={styles.unitAreaInput}
                                        value={unit.area}
                                        onChangeText={(t) => updateUnit(index, 'area', t)}
                                        placeholder="m²"
                                        keyboardType="numeric"
                                        placeholderTextColor="#555"
                                    />

                                    <TouchableOpacity onPress={() => removeUnit(index)} style={styles.deleteBtn}>
                                        <Ionicons name="trash-outline" size={18} color="#FF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>İPTAL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={() => onSave(floorNum, localList)}>
                            <LinearGradient
                                colors={['#D4AF37', '#FFD700', '#D4AF37']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.saveButtonText}>KAYDET</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    floorEditorCard: {
        width: '100%',
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden'
    },
    modalHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        alignItems: 'center'
    },
    modalTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    modalSubtitle: {
        color: '#888',
        fontSize: 12,
        marginTop: 4
    },
    addButtonsContainer: {
        padding: 12,
        backgroundColor: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    addTypeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D4AF37',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8
    },
    addTypeBtnText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 40,
        fontStyle: 'italic'
    },
    unitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        padding: 10,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#333'
    },
    unitIcon: {
        width: 32, height: 32,
        borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 10
    },
    unitNameInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 14,
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#444'
    },
    unitAreaInput: {
        width: 60,
        color: '#FFF',
        fontSize: 14,
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        textAlign: 'center',
        marginLeft: 8
    },
    deleteBtn: {
        width: 32, height: 32,
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 8
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
        gap: 12
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#444',
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelButtonText: {
        color: '#888',
        fontWeight: 'bold'
    },
    saveButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden'
    },
    gradientButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    saveButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14
    }
});

export default FloorEditor;
