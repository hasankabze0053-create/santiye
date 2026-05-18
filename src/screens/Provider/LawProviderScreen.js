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
                requests.map(item => (
                    <LinearGradient
                        key={item.id}
                        colors={['#1a1a1c', '#0f0f11']}
                        style={styles.leadCard}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    >
                        {/* 1. TOP ROW: DYNAMIC SERVICE TYPE & DATE */}
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.tagBadge}>
                                <View style={styles.statusDot} />
                                {/* DYNAMIC SERVICE TYPE: Matches whatever the user clicked in the grid */}
                                <Text allowFontScaling={false} style={styles.tagText}>
                                    {(item.service_type || 'Genel Hukuk Talebi').toUpperCase()}
                                </Text>
                            </View>
                            <View style={[styles.timerTag, { marginLeft: 'auto' }]}>
                                <Ionicons name="calendar" size={12} color="#94a3b8" />
                                <Text allowFontScaling={false} style={styles.timerText}>{new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
                            </View>
                        </View>

                        {/* 2. USER INFO */}
                        <View style={{ marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="person-circle-outline" size={18} color="#D4AF37" />
                                <Text allowFontScaling={false} style={styles.leadTitle}>{item.user_name}</Text>
                            </View>
                        </View>

                        {/* 3. REQUEST CONTENT SUMMARY */}
                        <View style={styles.detailBox}>
                            <View style={{ marginTop: 8 }} />
                            
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <MaterialCommunityIcons name={item.has_documents ? "file-document-multiple-outline" : "file-hidden"} size={18} color={item.has_documents ? "#D4AF37" : "#555"} />
                                </View>
                                <View>
                                    <Text allowFontScaling={false} style={styles.detailLabel}>EKLİ BELGELER</Text>
                                    <Text allowFontScaling={false} style={[styles.detailValue, !item.has_documents && { color: '#555' }]}>
                                        {item.has_documents ? 'Kullanıcı Belge Yükledi' : 'Belge Yok'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* 4. ACTIONS */}
                        <TouchableOpacity
                            style={styles.bidButton}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('LawRequestDetail', { request: item })}
                        >
                            <LinearGradient
                                colors={['#1c1c1e', '#0a0a0c']} // Dark metallic premium theme
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={[styles.gradientBtn, { borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.4)', borderRadius: 12 }]}
                            >
                                <Text allowFontScaling={false} style={[styles.bidButtonText, { color: '#D4AF37' }]}>DOSYAYI İNCELE</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#D4AF37" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                ))
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
