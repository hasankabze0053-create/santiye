import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, FONTS } from '../theme';

const CategoryChip = ({ categories, activeCategory, onSelect }) => {
  return (
    <View style={styles.outerContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity 
          style={[styles.chip, activeCategory === 'all' && styles.activeChip]}
          onPress={() => onSelect('all')}
        >
          <Text style={[styles.chipText, activeCategory === 'all' && styles.activeText]}>Tümü</Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat.key}
            style={[styles.chip, activeCategory === cat.key && styles.activeChip]}
            onPress={() => onSelect(cat.key)}
          >
            <Text style={[styles.chipText, activeCategory === cat.key && styles.activeText]}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeChip: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: COLORS.gold,
  },
  chipText: {
    color: '#666',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  activeText: {
    color: COLORS.gold,
  },
});

export default CategoryChip;
