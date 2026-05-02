import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, FONTS } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const InfoCard = ({ weather, ironPrice }) => {
  return (
    <View style={styles.container}>
      {/* Box 1: Weather */}
      <View style={styles.box}>
        <View style={styles.iconRow}>
          <Text style={{ fontSize: 24 }}>🌙</Text> 
          <View style={styles.boxTextGroup}>
            <Text style={styles.boxLabel}>İSTANBUL ▲</Text>
            <Text style={styles.boxValue}>18°C</Text>
            <Text style={styles.boxSub}>Parçalı Bulutlu</Text>
          </View>
        </View>
      </View>

      {/* Box 2: Iron Price */}
      <View style={styles.box}>
        <View style={styles.iconRow}>
          <Image source={require('../assets/kaba_yapi.png')} style={styles.ironImg} />
          <View style={styles.boxTextGroup}>
            <Text style={styles.boxLabel}>DEMİR Ø12 ⌵</Text>
            <Text style={styles.boxValue}>₺31.50</Text>
            <Text style={[styles.boxSub, { color: COLORS.successGreen }]}>+1.25% ▲</Text>
          </View>
        </View>
      </View>

      {/* Box 3: Market Status */}
      <View style={styles.box}>
        <View style={styles.marketHeader}>
          <MaterialCommunityIcons name="chart-line" size={18} color={COLORS.gold} />
          <View style={styles.boxTextGroup}>
            <Text style={styles.boxLabel}>PİYASA</Text>
            <Text style={styles.boxValue}>Güncel</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  box: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    height: 90, 
    justifyContent: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxTextGroup: {
    marginLeft: 6,
  },
  boxLabel: {
    color: '#888',
    fontSize: 8,
    fontFamily: FONTS.bold,
  },
  boxValue: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    marginTop: 2,
  },
  boxSub: {
    color: '#666',
    fontSize: 8,
    marginTop: 1,
  },
  ironImg: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  marketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  }
});

export default InfoCard;
