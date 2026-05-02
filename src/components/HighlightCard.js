import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Text as SvgText, TSpan } from 'react-native-svg';
import { COLORS, FONTS } from '../theme';

const { width } = Dimensions.get('window');

const HighlightCard = ({ title, description, onPress }) => {
  const CARD_HEIGHT = 220;
  const CARD_WIDTH = width - 40; 
  const CURVE_X = CARD_WIDTH * 0.48; 

  const curvePath = `M 0,0 L ${CURVE_X + 10},0 C ${CURVE_X + 35},70 ${CURVE_X - 15},150 ${CURVE_X + 5},${CARD_HEIGHT} L 0,${CARD_HEIGHT} Z`;
  const strokePath = `M ${CURVE_X + 10},0 C ${CURVE_X + 35},70 ${CURVE_X - 15},150 ${CURVE_X + 5},${CARD_HEIGHT}`;

  const titleFont = Platform.OS === 'ios' ? 'Manrope-ExtraBold' : 'sans-serif-condensed';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      
      {/* 1. BACKGROUND IMAGE */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require('../assets/highlight/kentsel_donusum_premium.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(11,11,12,0.5)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.8, y: 0 }}
          end={{ x: 0.5, y: 0 }}
        />
      </View>

      {/* 2. SVG LAYER - BLACK MASK, GOLD LINE & GRADIENT TEXT */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg height={CARD_HEIGHT} width={CARD_WIDTH}>
          <Defs>
            <SvgGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#5F4307" />
              <Stop offset="0.3" stopColor="#B8820F" />
              <Stop offset="0.6" stopColor="#F2C766" />
              <Stop offset="1" stopColor="#8C6200" />
            </SvgGradient>

            <SvgGradient id="textGoldGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F6D88B" />
              <Stop offset="0.5" stopColor="#D6A23A" />
              <Stop offset="1" stopColor="#9A6A12" />
            </SvgGradient>
          </Defs>

          <Path d={curvePath} fill="#0B0B0C" />
          
          <Path d={strokePath} fill="none" stroke="rgba(184,130,15,0.3)" strokeWidth="4" />
          <Path d={strokePath} fill="none" stroke="url(#goldGradient)" strokeWidth="1.5" />

          {/* ASYMMETRIC STEPPED TITLE */}
          <SvgText
            x="8"
            y="35"
            fontSize="21"
            fontWeight="900"
            fontFamily={titleFont}
            letterSpacing="0.3"
          >
            <TSpan fill="#F3F1EC" x="8" dy="0">KENTSEL</TSpan>
            <TSpan fill="url(#textGoldGradient)" x="28" dy="26">DÖNÜŞÜM</TSpan>
          </SvgText>
        </Svg>
      </View>

      {/* 3. CONTENT AREA */}
      <View style={styles.overlayContent}>
        <View style={styles.textContainer}>
          <View style={{ height: 65 }} /> 
          
          <Text style={styles.description} numberOfLines={3}>
            Arsa veya binanız için{"\n"}müteahhitlerden teklif alın.
          </Text>
          
          <View style={styles.infoChip}>
            <MaterialCommunityIcons name="map-marker" size={10} color="#B8820F" />
            <Text style={styles.infoText}>Ada • Parsel • Adres</Text>
          </View>
        </View>

        {/* Integrated Premium Gold Button */}
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.ctaWrapper}>
          <LinearGradient
            colors={['#B8820F', '#8C6200']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Teklif Al</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0B0B0C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 220,
    elevation: 15,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    left: '20%',
  },
  overlayContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 10,
  },
  textContainer: {
    paddingLeft: 8,
    paddingTop: 8,
  },
  description: {
    color: '#888',
    fontSize: 10,
    lineHeight: 15,
    fontFamily: FONTS.medium,
    marginBottom: 10,
    width: '95%',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(184, 130, 15, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 0.5,
    borderLeftWidth: 0,
    borderColor: 'rgba(184, 130, 15, 0.2)',
    marginLeft: -8,
  },
  infoText: {
    color: '#777',
    fontSize: 9,
    fontFamily: FONTS.medium,
    marginLeft: 4,
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
    borderTopRightRadius: 22,
    minWidth: 130,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    marginRight: 6,
  },
});

export default HighlightCard;
