import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function LawProviderScreen() {
    const navigation = useNavigation();
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'bids' | 'archived'
    const [refreshing, setRefreshing] = useState(false);
    const [companyInfo, setCompanyInfo] = useState(null);

    // Fetch dynamic company info
    useEffect(() => {
        const fetchCompany = async () => {
            if (!user?.id) return;
            const { supabase } = require('../../lib/supabase');
            const { data } = await supabase.from('companies').select('company_name').eq('owner_id', user.id).single();
            if (data) setCompanyInfo(data);
        };
        fetchCompany();
    }, [user?.id]);

    const displayName = companyInfo?.company_name || profile?.full_name || 'Hukuk Bürosu';
    const providerInfo = {
        name: displayName,
        location: profile?.city ? `${profile.city}, TR` : 'Türkiye',
        isVerified: true,
        initials: displayName.substring(0, 2).toUpperCase()
    };

    const [requests, setRequests] = useState([]);

    const loadRequests = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const { supabase } = require('../../lib/supabase');
            const { data, error } = await supabase
                .from('law_requests')
                .select('*, profiles:user_id(full_name, phone, email)')
                .contains('assigned_provider_ids', JSON.stringify([user.id]))
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const formatted = data.map(req => ({
                    id: req.id,
                    user_name: req.profiles?.full_name || 'Kullanıcı',
                    created_at: req.created_at,
                    service_type: req.service_title || 'Genel Hukuk Talebi',
                    user_phone: req.profiles?.phone || '',
                    user_email: req.profiles?.email || '',
                    description: req.description,
                    city: req.city,
                    district: req.district,
                    has_documents: req.file_urls && req.file_urls.length > 0,
                    status: req.status || 'pending',
                    my_offers: []
                }));
                setRequests(formatted);
            }
        } catch (e) {
            console.error("Error fetching law requests:", e);
        } finally {
            if (isRefresh) setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadRequests();
        }, [])
    );

    const renderRequestsList = () => (
        <View style={styles.listContainer}>
            {requests.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="scale-balance" size={48} color="#333" />
                    <Text allowFontScaling={false} style={styles.emptyTitle}>Henüz Talep Yok</Text>
                    <Text allowFontScaling={false} style={styles.emptySub}>Yeni talepler buraya düşecektir.</Text>
                </View>
            ) : (
                requests.map(item => {
                    const rawTipi = item.service_type || 'Hukuki Danışmanlık';
                    const projeTipi = rawTipi.replace(/\n/g, ' ');
                    return (
                        <View key={item.id} style={{ backgroundColor: '#161616', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A', padding: 18, marginBottom: 16, overflow: 'hidden' }}>
                            {/* Absolute Date Badge (Flush to Top Right) */}
                            <View style={{ position: 'absolute', top: 0, right: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.12)', borderBottomWidth: 1, borderLeftWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', paddingHorizontal: 12, paddingVertical: 6, borderBottomLeftRadius: 14, gap: 5 }}>
                                <Ionicons name="calendar" size={12} color="#D4AF37" />
                                <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 11, fontWeight: '700' }}>
                                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                                </Text>
                            </View>

                            {/* Title */}
                            <View style={{ marginBottom: 12, paddingRight: 90 }}>
                                <Text allowFontScaling={false} style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18, letterSpacing: 0.3 }}>
                                    {projeTipi}
                                </Text>
                            </View>

                            {/* Location & Info */}
                            <View style={{ marginBottom: 16, gap: 10 }}>
                                {/* Location */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Ionicons name="location" size={14} color="#D4AF37" />
                                    <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>
                                        {item.city || 'Belirtilmedi'} • {item.district || ''}
                                    </Text>
                                </View>
                                
                                {/* User & Document */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 8 }}>
                                        <Ionicons name="person" size={14} color="#D4AF37" />
                                        <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
                                            {item.user_name || 'Kullanıcı'}
                                        </Text>
                                    </View>
                                    
                                    {/* Premium Document Badge */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 }}>
                                        <Ionicons name="document-attach" size={14} color={item.has_documents ? "#D4AF37" : "#555"} />
                                        <Text allowFontScaling={false} style={{ color: item.has_documents ? '#10b981' : '#64748b', fontSize: 12, fontWeight: '600' }}>
                                            {item.has_documents ? 'Dosya Ekli' : 'Dosya Yok'}
                                        </Text>
                                        <Ionicons name={item.has_documents ? "checkmark-circle" : "remove"} size={14} color={item.has_documents ? "#10b981" : "#64748b"} />
                                    </View>
                                </View>
                            </View>

                            {/* Actions Area */}
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity 
                                    style={{ flex: 1 }}
                                    onPress={() => navigation.navigate('LawRequestDetail', { request: item })}
                                >
                                    <LinearGradient
                                        colors={['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30']}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={{ borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flex: 1 }}
                                    >
                                        <Text allowFontScaling={false} style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>Talebi İncele</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Deep Dark Background */}
            <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#000000' }} />
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRequests(true)} tintColor="#D4AF37" />}
                >
                    {/* 1. HEADER */}
                    <View style={styles.header}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatar}>
                                <Text allowFontScaling={false} style={styles.avatarTxt}>{providerInfo.initials}</Text>
                            </View>
                            <View>
                                <Text allowFontScaling={false} style={styles.welcome}>Hoşgeldin,</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text allowFontScaling={false} style={styles.companyName}>{providerInfo.name}</Text>
                                    <MaterialCommunityIcons name="check-decagram" size={16} color="#38bdf8" />
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                            <Ionicons name="settings-sharp" size={24} color="#e2e8f0" />
                        </TouchableOpacity>
                    </View>

                    {/* 2. STATS OVERVIEW */}
                    <View style={styles.statsRow}>
                        <View style={styles.statPill}>
                            <Ionicons name="location" size={14} color="#94a3b8" />
                            <Text allowFontScaling={false} style={styles.statTxt}>{providerInfo.location}</Text>
                        </View>
                    </View>

                    {/* 3. TABS */}
                    <View style={styles.msgTabs}>
                        <TouchableOpacity onPress={() => setActiveTab('leads')} style={[styles.msgTab, activeTab === 'leads' && styles.msgTabActive]}>
                            <Text allowFontScaling={false} style={[styles.msgTabTxt, activeTab === 'leads' && styles.msgTabTxtActive]}>GELEN TALEPLER</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('bids')} style={[styles.msgTab, activeTab === 'bids' && styles.msgTabActive]}>
                            <Text allowFontScaling={false} style={[styles.msgTabTxt, activeTab === 'bids' && styles.msgTabTxtActive]}>TEKLİFLERİM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('archived')} style={[styles.msgTab, activeTab === 'archived' && styles.msgTabActive]}>
                            <Text allowFontScaling={false} style={[styles.msgTabTxt, activeTab === 'archived' && styles.msgTabTxtActive]}>ARŞİVLENEN</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 4. CONTENT */}
                    {activeTab === 'leads' ? renderRequestsList() :
                        activeTab === 'bids' ? renderRequestsList() :
                            renderRequestsList()}

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
    avatarTxt: { color: '#D4AF37', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
    welcome: { color: '#94a3b8', fontSize: 13, marginBottom: 2 },
    companyName: { color: '#f8fafc', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },

    statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
    statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b' },
    statTxt: { color: '#e2e8f0', fontSize: 13, fontWeight: '600' },

    msgTabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
    msgTab: { paddingBottom: 12, position: 'relative' },
    msgTabActive: { borderBottomWidth: 2, borderBottomColor: '#D4AF37' },
    msgTabTxt: { color: '#64748b', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    msgTabTxtActive: { color: '#D4AF37' },

    listContainer: { paddingHorizontal: 20, gap: 16 },
    leadCard: { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.15)' },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(212, 175, 55, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4AF37' },
    tagText: { color: '#D4AF37', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    timerTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0f172a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#1e293b' },
    timerText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
    
    leadTitle: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    
    detailBox: { backgroundColor: '#0a0a0c', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1c1c1e' },
    detailDescription: { color: '#a1a1aa', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
    hDivider: { height: 1, backgroundColor: '#1c1c1e', marginVertical: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    detailIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#1a1a1c', alignItems: 'center', justifyContent: 'center' },
    detailLabel: { color: '#52525b', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
    detailValue: { color: '#e2e8f0', fontSize: 13, fontWeight: '600' },

    bidButton: { borderRadius: 12, overflow: 'hidden' },
    gradientBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    bidButtonText: { color: '#000', fontSize: 13, fontWeight: '800', letterSpacing: 1 },

    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 12 },
    emptySub: { color: '#64748b', fontSize: 13, marginTop: 4 }
});
