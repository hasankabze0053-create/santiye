import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../theme';

const { width } = Dimensions.get('window');

const garageOptions = [
  { 
    id: 'barrier', 
    title: 'Otopark Bariyeri', 
    desc: 'Site ve iş merkezi girişleri için hızlı çözümler.', 
    icon: 'gate-arrow-right',
    image: 'https://images.unsplash.com/photo-1590674116333-3069c9b4e073?q=80&w=500&auto=format&fit=crop'
  },
  { 
    id: 'garden_gate', 
    title: 'Otomatik Bahçe Kapısı ve Motoru', 
    desc: 'Yana kayar veya dairesel açılır bahçe kapısı motorları.', 
    icon: 'gate',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=500&auto=format&fit=crop'
  },
  { 
    id: 'garage_door', 
    title: 'Garaj Kapısı', 
    desc: 'Seksiyonel veya sarmal otomatik garaj kapısı sistemleri.', 
    icon: 'garage-variant',
    image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=500&auto=format&fit=crop'
  },
];

export default function GarageWizardScreen({ navigation }) {
  const theme = useTheme(); const isDarkMode = theme.isDarkMode;
  const TH = useMemo(() => ({
    gold: theme.accentBright,
    bg: theme.background,
    cardBg: theme.surface,
    border: theme.border,
    text: theme.text,
    textSub: theme.textSecondary,
    glassBg: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
    iconBg: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(140, 98, 0, 0.1)'
  }), [theme, isDarkMode]);
  const styles = useMemo(() => getStyles(TH, isDarkMode), [TH, isDarkMode]);

  const handleSelect = (option) => {
    // Burada ileride her biri için ayrı form açılabilir
    navigation.navigate('CustomRequest', { 
      serviceTitle: option.title,
      category: 'Garaj & Kapı Sistemleri'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[TH.bg, TH.cardBg]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={TH.gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Garaj & Kapı Sistemleri</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Hangi sistemle ilgileniyorsunuz?</Text>
          <Text style={styles.sectionSub}>İhtiyacınıza en uygun çözümü seçerek devam edin.</Text>

          {garageOptions.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card} 
              onPress={() => handleSelect(item)}
              activeOpacity={0.9}
            >
              <View style={styles.cardOverlay}>
                <LinearGradient
                  colors={['transparent', TH.glassBg]}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={TH.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </View>
                <MaterialCommunityIcons name="arrow-right-circle" size={24} color={TH.gold} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const getStyles = (TH, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TH.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    color: TH.text,
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    color: TH.gold,
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  sectionSub: {
    color: TH.textSub,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: 25,
  },
  card: {
    height: 140,
    backgroundColor: TH.cardBg,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: TH.iconBg,
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: TH.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: TH.text,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  cardDesc: {
    color: TH.textSub,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 4,
  },
});
