import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

const MOCK_POS_DATA = [
    { id: '15.120.1001', desc: 'Bina kazıları (Hafif ve sert kaya)', price: '125,50 ₺' },
    { id: '15.120.1002', desc: 'Bina kazıları (Kaya)', price: '180,00 ₺' },
    { id: '15.200.1001', desc: 'Betonarme Kalıbı yapılması', price: '450,00 ₺' },
    { id: '15.200.1002', desc: 'Plak döşeme kalıbı', price: '420,00 ₺' },
    { id: 'Y.16.050/04', desc: 'C30/37 Hazır Beton Dökümü', price: '2.800,00 ₺' },
    { id: 'Y.23.014', desc: 'Ø8-Ø12mm Nervürlü Beton Çeliği', price: '24.500,00 ₺' },
];

export default function PosCostScreen({ navigation }) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState(MOCK_POS_DATA);

    const handleSearch = (text) => {
        setSearch(text);
        if (text.length === 0) {
            setResults(MOCK_POS_DATA);
        } else {
            const filtered = MOCK_POS_DATA.filter(item =>
                item.id.toLowerCase().includes(text.toLowerCase()) ||
                item.desc.toLowerCase().includes(text.toLowerCase())
            );
            setResults(filtered);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#121212', '#1C1C1E']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Search Header */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={COLORS.accent} />
                        <TextInput
                            style={styles.input}
                            placeholder="Poz No veya Açıklama Ara..."
                            placeholderTextColor="#555"
                            value={search}
                            onChangeText={handleSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <Ionicons name="close-circle" size={18} color="#555" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Results List */}
                <FlatList
                    data={results}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.itemCard}>
                            <View style={styles.iconBox}>
                                <Text style={styles.iconText}>{item.id.substring(0, 2)}</Text>
                            </View>
                            <View style={styles.itemContent}>
                                <Text style={styles.itemId}>{item.id}</Text>
                                <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
                                <Text style={styles.itemPrice}>{item.price}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#444" />
                        </TouchableOpacity>
                    )}
                />

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    searchContainer: { padding: 16, backgroundColor: 'rgba(255,255,255,0.02)' },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingHorizontal: 12, height: 48,
        borderWidth: 1, borderColor: '#333'
    },
    input: { flex: 1, color: '#fff', marginLeft: 12, fontSize: 16 },

    itemCard: {
        backgroundColor: '#1E1E1E',
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    iconBox: {
        width: 40, height: 40, borderRadius: 8,
        backgroundColor: 'rgba(56, 239, 125, 0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12
    },
    iconText: { color: '#38ef7d', fontWeight: '900' },
    itemContent: { flex: 1, marginRight: 8 },
    itemId: { color: '#38ef7d', fontSize: 12, fontWeight: '700', marginBottom: 2 },
    itemDesc: { color: '#ccc', fontSize: 14, fontWeight: '500', marginBottom: 4 },
    itemPrice: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});
