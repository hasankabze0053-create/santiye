import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

const ServiceListItem = ({ title, subtitle, icon, onPress, onEdit, isAdmin, isHidden, isDarkMode }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, !isDarkMode && styles.containerLight, isHidden && styles.hiddenContainer]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        {/* 1. Far Left Gold Line */}
        <View style={styles.goldLine} />
        
        {/* 2. Icon in Box */}
        <View style={[styles.iconBox, !isDarkMode && styles.iconBoxLight]}>
          <MaterialCommunityIcons name={icon} size={20} color={isDarkMode ? COLORS.gold : '#8C6200'} />
        </View>

        {/* 3. Text Info */}
        <View style={styles.textContainer}>
          <Text maxFontSizeMultiplier={1.3} ellipsizeMode="tail" numberOfLines={1} style={[styles.title, !isDarkMode && { color: '#1C1208' }]}>{title}</Text>
          <Text maxFontSizeMultiplier={1.3} ellipsizeMode="tail" numberOfLines={1} style={[styles.subtitle, !isDarkMode && { color: '#4A3D28' }]}>{subtitle}</Text>
        </View>
      </View>

      {/* 4. Right Section (Chevron / Edit) */}
      <View style={styles.rightSection}>
        {isAdmin && onEdit && (
          <TouchableOpacity 
            style={[styles.editBtn, !isDarkMode && styles.editBtnLight]} 
            onPress={onEdit}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <MaterialCommunityIcons name="pencil" size={18} color={isDarkMode ? "#D4AF37" : "#8C6200"} />
          </TouchableOpacity>
        )}
        <MaterialCommunityIcons name="chevron-right" size={20} color={isDarkMode ? "#333" : "#D4C4A8"} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)', // Subtle row background
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  containerLight: {
    backgroundColor: '#FAF8F3',
    borderColor: '#D4C4A8',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goldLine: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.gold,
    borderRadius: 1,
    marginRight: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#121417', // Darker box for icon
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconBoxLight: {
    backgroundColor: '#EDE0CA',
    borderColor: 'rgba(140, 98, 0, 0.1)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#666',
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginRight: 4,
  },
  editBtnLight: {
    backgroundColor: 'rgba(140, 98, 0, 0.1)',
    borderColor: 'rgba(140, 98, 0, 0.3)',
  },
  hiddenContainer: {
    opacity: 0.4,
    borderStyle: 'dashed',
  }
});

export default ServiceListItem;
