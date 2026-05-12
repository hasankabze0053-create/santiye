import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, FONTS } from '../theme';

const CategoryChip = ({ categories, activeCategory, onSelect, onLongPress, isAdmin, onAddNew, isDarkMode }) => {
  return (
    <View style={styles.outerContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity 
          style={[styles.chip, !isDarkMode && { backgroundColor: '#FAF8F3', borderColor: '#D4C4A8' }, activeCategory === 'all' && styles.activeChip, activeCategory === 'all' && !isDarkMode && styles.activeChipLight]}
          onPress={() => onSelect('all')}
        >
          <Text maxFontSizeMultiplier={1.2} style={[styles.chipText, !isDarkMode && { color: '#4A3D28' }, activeCategory === 'all' && styles.activeText, activeCategory === 'all' && !isDarkMode && styles.activeTextLight]}>Tümü</Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat.key}
            style={[styles.chip, !isDarkMode && { backgroundColor: '#FAF8F3', borderColor: '#D4C4A8' }, activeCategory === cat.key && styles.activeChip, activeCategory === cat.key && !isDarkMode && styles.activeChipLight]}
            onPress={() => onSelect(cat)}
            onLongPress={() => onLongPress && onLongPress(cat)}
            delayLongPress={500}
          >
            <Text maxFontSizeMultiplier={1.2} style={[styles.chipText, !isDarkMode && { color: '#4A3D28' }, activeCategory === cat.key && styles.activeText, activeCategory === cat.key && !isDarkMode && styles.activeTextLight]}>{cat.title}</Text>
          </TouchableOpacity>
        ))}

        {isAdmin && (
          <TouchableOpacity 
            style={[styles.chip, styles.addNewChip, !isDarkMode && styles.addNewChipLight]}
            onPress={onAddNew}
          >
            <Text maxFontSizeMultiplier={1.2} style={[styles.addNewText, !isDarkMode && styles.addNewTextLight]}>+ Yeni Ekle</Text>
          </TouchableOpacity>
        )}
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
  activeChipLight: {
    backgroundColor: '#EDE0CA',
    borderColor: '#8C6200',
  },
  chipText: {
    color: '#666',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  activeText: {
    color: COLORS.gold,
  },
  activeTextLight: {
    color: '#8C6200',
  },
  addNewChip: {
    borderStyle: 'dashed',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  addNewText: {
    color: COLORS.gold,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  addNewChipLight: {
    borderColor: 'rgba(140, 98, 0, 0.4)',
    backgroundColor: 'rgba(140, 98, 0, 0.05)',
  },
  addNewTextLight: {
    color: '#8C6200',
  }
});

export default CategoryChip;
