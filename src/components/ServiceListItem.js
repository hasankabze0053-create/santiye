import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

const ServiceListItem = ({ title, subtitle, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        {/* 1. Far Left Gold Line */}
        <View style={styles.goldLine} />
        
        {/* 2. Icon in Box */}
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon} size={20} color={COLORS.gold} />
        </View>

        {/* 3. Text Info */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* 4. Right Chevron */}
      <MaterialCommunityIcons name="chevron-right" size={20} color="#333" />
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
});

export default ServiceListItem;
