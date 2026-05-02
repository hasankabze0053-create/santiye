import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../theme';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MarketRequestScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const CACHE_KEY = 'app_module_config_cache';
      try {
        // Önce cache'den oku
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setCategories(JSON.parse(cached));
          setLoading(false);
        }

        // Güncel veriyi çek
        const { data, error } = await supabase
          .from('app_module_config')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (data) {
          setCategories(data);
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Config fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getIconForCategory = (title) => {
    const normalized = title.toUpperCase();
    if (normalized.includes('TADİLAT')) return 'hammer-wrench';
    if (normalized.includes('MARKET')) return 'cart-outline';
    if (normalized.includes('LOJİSTİK') || normalized.includes('NAKLİYE')) return 'truck-delivery-outline';
    if (normalized.includes('TEKNİK OFİS')) return 'office-building-cog';
    if (normalized.includes('İŞ MAKİNESİ')) return 'crane';
    if (normalized.includes('HUKUK')) return 'scale-balance';
    if (normalized.includes('KENTSEL DÖNÜŞÜM')) return 'office-building-marker-outline';
    return 'dots-horizontal';
  };

  const getRouteForCategory = (cat) => {
    const title = cat.title.toUpperCase();
    if (title.includes('TADİLAT')) return 'Tadilat';
    if (title.includes('MARKET')) return 'MarketStack';
    if (title.includes('KENTSEL DÖNÜŞÜM')) return 'KentselDonusum';
    if (title.includes('HUKUK')) return 'Hukuk';
    if (title.includes('NAKLİYE') || title.includes('LOJİSTİK')) return 'Nakliye';
    if (title.includes('İŞ MAKİNESİ')) return 'RentalStack';
    return cat.screen_route || 'HomeScreen';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Talep Oluştur</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Nasıl yardımcı olabiliriz?</Text>
          <Text style={styles.sectionSubtitle}>Oluşturmak istediğiniz hizmet kategorisini seçin.</Text>

          {loading ? (
            <ActivityIndicator color={COLORS.gold} style={{ marginTop: 40 }} />
          ) : (
            categories.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card}
                onPress={() => navigation.navigate(getRouteForCategory(item))}
                activeOpacity={0.7}
              >
                <View style={styles.leftSection}>
                  <View style={styles.goldLine} />
                  <View style={styles.iconBox}>
                    <MaterialCommunityIcons name={getIconForCategory(item.title)} size={22} color={COLORS.gold} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title.toUpperCase()}</Text>
                    <Text style={styles.subtitle}>{item.subtitle || 'Talep Oluşturmak için Seçin'}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#444" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#888',
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goldLine: {
    width: 2,
    height: 28,
    backgroundColor: COLORS.gold,
    borderRadius: 1,
    marginRight: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#121417',
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
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    color: '#666',
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
});
