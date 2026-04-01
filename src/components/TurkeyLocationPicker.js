import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { TURKEY_CITIES, DISTRICTS, DEFAULT_DISTRICTS } from '../constants/TurkeyLocations';

export default function TurkeyLocationPicker({ visible, onClose, onSelect, currentCity, currentDistrict }) {
    const [view, setView] = useState('city'); // 'city' or 'district'
    const [selectedCity, setSelectedCity] = useState(currentCity || '');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCities = TURKEY_CITIES.filter(c => 
        c.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr'))
    );

    const getDistricts = (city) => DISTRICTS[city] || DEFAULT_DISTRICTS;

    const filteredDistricts = getDistricts(selectedCity).filter(d => 
        d.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr'))
    );

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setView('district');
        setSearchQuery('');
    };

    const handleDistrictSelect = (district) => {
        onSelect(selectedCity, district);
        onClose();
        // Reset for next use
        setTimeout(() => {
            setView('city');
            setSearchQuery('');
        }, 300);
    };

    const handleBack = () => {
        if (view === 'district') {
            setView('city');
            setSearchQuery('');
        } else {
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <Ionicons name={view === 'city' ? "close" : "arrow-back"} size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text allowFontScaling={false} style={styles.headerTitle}>
                        {view === 'city' ? 'Şehir Seçin' : `${selectedCity} - İlçe Seçin`}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput allowFontScaling={false}
                        style={styles.searchInput}
                        placeholder={view === 'city' ? "Şehir ara..." : "İlçe ara..."}
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="words"
                    />
                </View>

                <FlatList
                    data={view === 'city' ? filteredCities : filteredDistricts}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.item}
                            onPress={() => view === 'city' ? handleCitySelect(item) : handleDistrictSelect(item)}
                        >
                            <Text allowFontScaling={false} style={styles.itemText}>{item}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#444" />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text allowFontScaling={false} style={{ color: '#888' }}>Sonuç bulunamadı.</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1C', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1C', margin: 20, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 50, color: '#FFF', fontSize: 16 },
    list: { paddingHorizontal: 20, paddingBottom: 40 },
    item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#1A1A1C' },
    itemText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
    empty: { alignItems: 'center', marginTop: 40 }
});
