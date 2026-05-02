import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Text as SvgText, TSpan } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';

const HeaderComponent = ({ navigation }) => {
  const { profile } = useAuth();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandGroup}>
        <View style={styles.logoRow}>
          <Svg height="35" width="150">
            <Defs>
              <SvgGradient id="logoGoldGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#F6D88B" />
                <Stop offset="0.5" stopColor="#D6A23A" />
                <Stop offset="1" stopColor="#9A6A12" />
              </SvgGradient>
            </Defs>
            <SvgText
              x="0"
              y="25"
              fontSize="28"
              fontWeight="bold"
              fontFamily={FONTS.bold}
              letterSpacing="-0.5"
            >
              <TSpan fill="#F3F1EC">Cepte</TSpan>
              <TSpan fill="url(#logoGoldGradient)">Şef</TSpan>
            </SvgText>
          </Svg>
        </View>
        <Text style={styles.brandSubtitle}>İNŞAAT & HİZMET PLATFORMU</Text>
      </View>

      <View style={styles.actionGroup}>
        <TouchableOpacity 
          style={styles.outlineBtn} 
          onPress={() => navigation.navigate('ProviderDashboard')}
        >
          <Text style={styles.outlineBtnText}>Hizmet Paneli</Text>
          <MaterialCommunityIcons name="briefcase-outline" size={14} color={COLORS.gold} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.avatarWrapper} 
          onPress={() => navigation.navigate('ProfileMain')}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLabel}>
              {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'KZ'}
            </Text>
          </View>
          <View style={styles.onlineIndicator} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  brandGroup: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandSubtitle: {
    color: '#999',
    fontSize: 9,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
    marginTop: -4, // Adjusted for SVG text alignment
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 12,
  },
  outlineBtnText: {
    color: '#AAA',
    fontSize: 10,
    fontFamily: FONTS.bold,
    marginRight: 6,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  avatarLabel: {
    color: COLORS.gold,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.successGreen,
    borderWidth: 1.5,
    borderColor: '#07090C',
  },
});

export default HeaderComponent;
