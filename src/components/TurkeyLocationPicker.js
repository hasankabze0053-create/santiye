import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
    Platform,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TURKEY_CITIES, DISTRICTS, DEFAULT_DISTRICTS } from '../constants/TurkeyLocations';

export default function TurkeyLocationPicker({ visible, onClose, onSelect, currentCity, currentDistrict }) {
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, paddingTop: Platform.OS === 'ios' ? 60 : 20, borderBottomWidth: 1, borderBottomColor: theme.border },
        backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' },
        headerTitle: { color: theme.text, fontSize: 18, fontWeight: 'bold' },
        searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, margin: 20, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.borderLight },
        searchIcon: { marginRight: 10 },
        searchInput: { flex: 1, height: 50, color: theme.text, fontSize: 16 },
        list: { paddingHorizontal: 20, paddingBottom: 40 },
        item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: theme.surface },
        itemText: { color: theme.text, fontSize: 16, fontWeight: '500' },
        empty: { alignItems: 'center', marginTop: 40 }
    }), [theme, isDarkMode]);

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
                        <Ionicons name={view === 'city' ? "close" : "arrow-back"} size={24} color={theme.text} />
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
                        placeholderTextColor={theme.textSecondary}
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
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text allowFontScaling={false} style={{ color: theme.textSecondary }}>Sonuç bulunamadı.</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </Modal>
    );
}
