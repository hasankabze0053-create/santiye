import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

const SearchCTA = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Search Bar Area */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color="#555" />
        <TextInput
          placeholder="Hizmet, kategori veya firma ara..."
          placeholderTextColor="#555"
          style={styles.input}
        />
      </View>

      {/* SINGLE LAYERED PREMIUM BUTTON */}
      <TouchableOpacity 
        style={styles.ctaButton}
        onPress={() => navigation.navigate('MarketRequest')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#EAB64E', '#A3792E']}
          style={styles.ctaGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" style={styles.btnIcon} />
            <Text style={styles.ctaText}>Talep Oluştur</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
    backgroundColor: 'transparent', // Ensure no ghost bg
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: '#FFF',
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  ctaButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F9CE6D',
    backgroundColor: 'transparent', // Explicitly transparent
    // Clean shadow following the capsule
    shadowColor: '#EAB64E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaGradient: {
    flex: 1,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnIcon: {
    marginRight: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
});

export default SearchCTA;
