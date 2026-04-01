import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BUDGET_OPTIONS = [
    { 
        id: 'Ekonomik', 
        title: 'Ekonomik', 
        desc: 'Fiyat odaklı, standart malzeme ve işçilik çözümleri.', 
        icon: 'cash-minus',
        color: '#81C784'
    },
    { 
        id: 'Standart', 
        title: 'Standart', 
        desc: 'Fiyat/Performans dengeli, kaliteli orta segment seçimler.', 
        icon: 'cash-check',
        color: '#64B5F6'
    },
    { 
        id: 'Premium', 
        title: 'Premium', 
        desc: 'Yüksek kalite, marka garantili ürünler ve ince işçilik.', 
        icon: 'cash-multiple',
        color: '#FFD700'
    },
    { 
        id: 'Lüks', 
        title: 'Lüks', 
        desc: 'Özel tasarım, ithal malzemeler ve VIP hizmet kalitesi.', 
        icon: 'crown',
        color: '#E91E63'
    }
];

export default function BudgetSelector({ selectedSegment, onSelect }) {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {BUDGET_OPTIONS.map((opt) => {
                    const isSelected = selectedSegment === opt.id;
                    return (
                        <TouchableOpacity
                            key={opt.id}
                            style={[
                                styles.card,
                                isSelected && { borderColor: opt.color, backgroundColor: `${opt.color}10` }
                            ]}
                            activeOpacity={0.8}
                            onPress={() => onSelect(opt.id)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: `${opt.color}20` }]}>
                                <MaterialCommunityIcons 
                                    name={opt.icon} 
                                    size={24} 
                                    color={isSelected ? opt.color : '#666'} 
                                />
                            </View>
                            <Text allowFontScaling={false} style={[
                                styles.title,
                                isSelected && { color: opt.color }
                            ]}>
                                {opt.title}
                            </Text>
                            <Text allowFontScaling={false} style={styles.desc} numberOfLines={3}>
                                {opt.desc}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: { 
        width: '48%', 
        backgroundColor: '#1A1A1C', 
        borderRadius: 16, 
        padding: 16, 
        borderWidth: 1, 
        borderColor: '#333',
        minHeight: 140
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12
    },
    title: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 6 },
    desc: { color: '#888', fontSize: 11, lineHeight: 16 }
});
