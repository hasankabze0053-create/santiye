import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Text as SvgText, TSpan } from 'react-native-svg';
import { COLORS, FONTS } from '../theme';

const { width } = Dimensions.get('window');

const HighlightCard = ({ title, description, onPress, isAdmin, onEdit, config, isDarkMode, type = 'urban' }) => {
  const CARD_HEIGHT = 220;
  const CARD_WIDTH = width - 40; 
  const CURVE_X = CARD_WIDTH * 0.48; 

  const curvePath = `M 0,0 L ${CURVE_X + 10},0 C ${CURVE_X + 35},70 ${CURVE_X - 15},150 ${CURVE_X + 5},${CARD_HEIGHT} L 0,${CARD_HEIGHT} Z`;
  const strokePath = `M ${CURVE_X + 10},0 C ${CURVE_X + 35},70 ${CURVE_X - 15},150 ${CURVE_X + 5},${CARD_HEIGHT}`;

  const titleFont = Platform.OS === 'ios' ? 'Manrope-ExtraBold' : 'sans-serif-condensed';

  // Dynamic Image Logic
  const activeImage = isDarkMode ? config?.image_dark : config?.image_light;
  let imageSource;
  if (activeImage) {
      imageSource = { uri: activeImage };
  } else if (!isDarkMode) {
      if (type === 'renovation' || config?.type === 'highlight_card_renovation') {
          imageSource = require('../assets/highlight/light/renovation.png');
      } else if (type === 'market' || config?.type === 'highlight_card_market') {
          imageSource = require('../assets/highlight/light/market.png');
      } else if (type === 'law' || config?.type === 'highlight_card_law' || config?.type === 'law') {
          imageSource = require('../assets/highlight/light/law.png');
      } else {
          imageSource = require('../assets/highlight/light/urban.png');
      }
  } else {
      if (type === 'renovation' || config?.type === 'highlight_card_renovation') {
          imageSource = require('../assets/highlight/tadilat_premium.jpg');
      } else if (type === 'market' || config?.type === 'highlight_card_market') {
          imageSource = require('../assets/highlight/market_premium.jpg');
      } else if (type === 'law' || config?.type === 'highlight_card_law' || config?.type === 'law') {
          imageSource = require('../assets/highlight/hukuk_premium.jpg');
      } else {
          imageSource = require('../assets/highlight/kentsel_donusum_premium.png');
      }
  }

  // Theme Colors
  const themeTitle = config?.themeColors?.title || (isDarkMode ? '#FFF' : '#1C1208');
  const themePillsBorder = config?.themeColors?.pillsBorder || '#B8820F';
  const themePillsText = config?.themeColors?.pillsText || '#B8820F';
  const themePillsBg = config?.themeColors?.pillsBg || 'transparent';
  const themeDescText = config?.themeColors?.descText || (isDarkMode ? '#888' : '#4A3D28');
  const themeInfoText = config?.themeColors?.infoText || (isDarkMode ? '#888' : '#8A7A65');
  const themeBtnStart = config?.themeColors?.buttonGradientStart || '#B8820F';
  const themeBtnEnd = config?.themeColors?.buttonGradientEnd || '#8C6200';
  const align = config?.textAlignment || 'flex-start';
  const justify = config?.textPositionVertical === 'top' ? 'flex-start' : (config?.textPositionVertical === 'bottom' ? 'flex-end' : 'center');

  // Title Splitting Logic
  let displayTitle1 = config?.title1 || '';
  let displayTitle2 = config?.title2 || '';
  if (!config?.title1 && !config?.title2 && config?.title) {
      const parts = config.title.split(' ');
      if (parts.length === 1) {
          displayTitle2 = parts[0];
      } else {
          displayTitle1 = parts[0];
          displayTitle2 = parts.slice(1).join(' ');
      }
  }

  // Positioning Offsets
  const descOffsetX = config?.descTranslateX || 0;
  const descOffsetY = config?.descTranslateY || 0;
  const pillsOffsetX = config?.pillsTranslateX || 0;
  const pillsOffsetY = config?.pillsTranslateY || 0;

  return (
    <TouchableOpacity 
      style={[styles.card, !isDarkMode && styles.cardLight]} 
      onPress={onPress} 
      activeOpacity={0.95}
    >
      
      {/* 1. BACKGROUND IMAGE */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={imageSource}
          style={[
            styles.backgroundImage,
            {
              transform: [
                { scale: config?.scale || 1 },
                { translateX: config?.translateX || 20 },
                { translateY: config?.translateY || 0 }
              ]
            }
          ]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', isDarkMode ? 'rgba(11,11,12,0.6)' : 'rgba(250,248,243,0.4)']}
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

            <SvgGradient id="textGoldGradientLight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#B8820F" />
              <Stop offset="1" stopColor="#8C6200" />
            </SvgGradient>
          </Defs>

          <Path d={curvePath} fill={isDarkMode ? "#0B0B0C" : "#FAF8F3"} />
          <Path d={strokePath} fill="none" stroke="rgba(184,130,15,0.3)" strokeWidth="4" />
          <Path d={strokePath} fill="none" stroke="url(#goldGradient)" strokeWidth="1.5" />

          {/* Generic SVG Title */}
          <SvgText x="8" y="35" fontSize="21" fontWeight="900" fontFamily={titleFont} letterSpacing="0.3">
            {displayTitle1 ? <TSpan fill={isDarkMode ? "#F3F1EC" : "#1C1208"} x="8" dy="0">{displayTitle1.toUpperCase()}</TSpan> : null}
            {displayTitle2 ? <TSpan fill={isDarkMode ? "url(#textGoldGradient)" : "url(#textGoldGradientLight)"} x={displayTitle1 ? "28" : "8"} dy={displayTitle1 ? "26" : "0"}>{displayTitle2.toUpperCase()}</TSpan> : null}
          </SvgText>
        </Svg>
      </View>

      {/* 3. CONTENT AREA */}
      <View style={[styles.overlayContent, { justifyContent: justify }]}>
        <View style={[styles.textContainer, { alignItems: align }]}>
          
          <View style={{ height: 65 }} />
          
          <Text 
              style={[
                  styles.description, 
                  { 
                      color: themeDescText, 
                      textAlign: align === 'center' ? 'center' : 'left',
                      transform: [{ translateX: descOffsetX }, { translateY: descOffsetY }]
                  }
              ]} 
              numberOfLines={3}
          >
            {config?.description}
          </Text>
          
          {/* Pills / Tags */}
          {config?.pills && config.pills.length > 0 && (
              <View style={[styles.pillsContainer, { justifyContent: align, transform: [{ translateX: pillsOffsetX }, { translateY: pillsOffsetY }] }]}>
                  {config.pills.map((pill, idx) => (
                      <View key={idx} style={[styles.renovationPill, { borderColor: isDarkMode ? themePillsBorder : '#8C6200', backgroundColor: isDarkMode ? themePillsBg : 'rgba(140, 98, 0, 0.05)' }]}>
                          <Text style={[styles.renovationPillText, { color: isDarkMode ? themePillsText : '#8C6200' }]}>{pill}</Text>
                      </View>
                  ))}
              </View>
          )}
        </View>

        {/* Dynamic CTA Button */}
        <View style={[styles.ctaWrapper, align === 'center' ? { left: CARD_WIDTH * 0.25 - 65 } : { left: -1 }]}>
          <LinearGradient
            colors={[themeBtnStart, themeBtnEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>{config?.buttonText || 'Teklif Al'}</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#FFF" />
          </LinearGradient>
        </View>
      </View>

      {/* 4. ADMIN EDIT ICON */}
      {isAdmin && (
        <TouchableOpacity 
          style={styles.adminEditBtn} 
          onPress={onEdit}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <LinearGradient
            colors={['#D4AF37', '#8C6200']}
            style={styles.adminEditIconCircle}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    width: width - 40,
    marginBottom: 20,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0B0B0C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 220,
    elevation: 15,
  },
  cardLight: {
    backgroundColor: '#FAF8F3',
    borderColor: '#D4C4A8',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
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
  plainTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    width: '95%',
    gap: 6,
  },
  renovationPill: {
    borderWidth: 1,
    borderColor: '#B8820F',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  renovationPillText: {
    color: '#B8820F',
    fontSize: 9,
    fontFamily: FONTS.medium,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: -1,
    left: -1,
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
  adminEditBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 100,
  },
  adminEditIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});


export default HighlightCard;
