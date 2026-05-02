import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../theme';

const { width } = Dimensions.get('window');

const HighlightCard = ({ title, description, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      {/* BACKGROUND IMAGE - FULL CARD */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require('../assets/highlight/kentsel_donusum_premium.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      {/* BLACK OVERLAY FOR TEXT AREA (LEFT SIDE) */}
      <View style={styles.leftOverlay}>
        <View style={styles.contentContainer}>
          {/* Premium Icon Box - Anchored Top-Left */}
          <View style={styles.badgeBox}>
            <View style={styles.innerBadge}>
              <MaterialCommunityIcons name="office-building-marker" size={20} color={COLORS.gold} />
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            Devlet destekli projeler{"\n"}ve finansman çözümleri
          </Text>
        </View>

        {/* Integrated Premium Gold Button - Anchored Bottom-Left */}
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.ctaWrapper}>
          <LinearGradient
            colors={['#EAB64E', '#A3792E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Detaylı Bilgi</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* DIAGONAL DIVIDER - GOLD LINE */}
      <View style={styles.diagonalLine} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(234, 182, 78, 0.25)',
    height: 220,
    elevation: 12,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    left: '25%', 
  },
  leftOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '56%',
    backgroundColor: '#000',
    zIndex: 10,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 24,
  },
  badgeBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    padding: 1,
    backgroundColor: '#F9CE6D',
    marginBottom: 14,
  },
  innerBadge: {
    flex: 1,
    borderRadius: 9,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: width < 380 ? 20 : 23, // Responsive font size
    fontFamily: FONTS.bold,
    lineHeight: width < 380 ? 24 : 28,
    marginBottom: 6,
  },
  description: {
    color: '#999',
    fontSize: width < 380 ? 11 : 12,
    lineHeight: 18,
    fontFamily: FONTS.medium,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopRightRadius: 20, // Only round the top-right
    // Bottom-left matches the card's radius automatically because it's flush
    minWidth: 140,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginRight: 6,
  },
  diagonalLine: {
    position: 'absolute',
    left: '52%',
    top: -50,
    bottom: -50,
    width: 2.5,
    backgroundColor: '#F9CE6D',
    transform: [{ rotate: '16deg' }],
    zIndex: 20,
    shadowColor: '#F9CE6D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
});

export default HighlightCard;
