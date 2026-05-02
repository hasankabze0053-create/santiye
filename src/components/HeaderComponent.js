import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';

const HeaderComponent = ({ navigation }) => {
  const { profile } = useAuth();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandGroup}>
        <View style={styles.logoRow}>
          <Text style={styles.brandTitle}>
            <Text style={{ color: '#FFF' }}>Cepte</Text>
            <Text style={{ color: COLORS.gold }}>Şef</Text>
          </Text>
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
  brandTitle: {
    color: '#FFF',
    fontSize: 28,
    fontFamily: FONTS.bold,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    color: '#999',
    fontSize: 9,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
    marginTop: -2,
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
