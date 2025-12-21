import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LawyerDashboardScreen() {
    const navigation = useNavigation();
    const [isOnline, setIsOnline] = useState(true);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            {/* Background: Deep Matte Black */}
            <View style={StyleSheet.absoluteFillObject}>
                <LinearGradient
                    colors={['#121212', '#000000']}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>AVUKAT PANELİ</Text>
                        <Text style={styles.headerSubtitle}>Av. Mert Yılmaz</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4ADE80' : '#666' }]} />
                            <Text style={[styles.statusText, { color: isOnline ? '#4ADE80' : '#666' }]}>
                                {isOnline ? 'Aktif' : 'Meşgul'}
                            </Text>
                            <Switch
                                value={isOnline}
                                onValueChange={setIsOnline}
                                trackColor={{ false: "#333", true: "#4ADE80" }}
                                thumbColor="#fff"
                                style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.exitBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons
                                name="close"
                                size={20}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
                                <MaterialCommunityIcons name="scale-balance" size={24} color="#D4AF37" />
                            </View>
                            <Text style={styles.statValue}>₺92.750</Text>
                            <Text style={styles.statLabel}>Bu Ayki Kazanç</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                                <MaterialCommunityIcons name="gavel" size={24} color="#fff" />
                            </View>
                            <Text style={styles.statValue}>14</Text>
                            <Text style={styles.statLabel}>Aktif Dosya</Text>
                        </View>
                    </View>

                    {/* Quick Tools */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Hukuki Araçlar</Text>
                    </View>

                    <View style={styles.actionsGrid}>
                        <QuickAction icon="file-document-edit" label="Dilekçe Yaz" color="#4ADE80" onPress={() => { }} />
                        <QuickAction icon="folder-account" label="Dosyalarım" color="#D4AF37" onPress={() => { }} />
                        <QuickAction icon="calendar-check" label="Duruşmalar" color="#60a5fa" onPress={() => { }} />
                        <QuickAction icon="cog" label="Ayarlar" color="#94a3b8" onPress={() => { }} />
                    </View>

                    {/* Active Inquiries / Cases */}
                    <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                        <Text style={styles.sectionTitle}>Gelen Talepler</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>Tümü</Text></TouchableOpacity>
                    </View>

                    <View style={styles.requestsList}>
                        <RequestCard
                            id="#REQ-102"
                            client="Yılmaz İnşaat Ltd."
                            topic="Sözleşme Feshi hk."
                            status="Yeni"
                            time="20 dk önce"
                            urgency="Yüksek"
                        />
                        <RequestCard
                            id="#REQ-101"
                            client="Mehmet Öz"
                            topic="İş Kazası Tazminatı"
                            status="İnceleniyor"
                            time="2 saat önce"
                            urgency="Orta"
                        />
                        <RequestCard
                            id="#REQ-099"
                            client="Site Yönetimi A.Ş."
                            topic="Kentsel Dönüşüm"
                            status="Randevu"
                            time="Dün"
                            urgency="Düşük"
                        />
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const QuickAction = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: `${color}15`, borderColor: `${color}40`, borderWidth: 1 }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const RequestCard = ({ id, client, topic, status, time, urgency }) => (
    <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="account-tie" size={16} color="#888" style={{ marginRight: 6 }} />
                <Text style={styles.clientName}>{client}</Text>
            </View>
            <View style={[styles.statusTag,
            status === 'Yeni' ? { backgroundColor: 'rgba(212, 175, 55, 0.2)', borderColor: '#D4AF37' } :
                status === 'Randevu' ? { backgroundColor: 'rgba(74, 222, 128, 0.1)', borderColor: '#4ade80' } :
                    { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: '#666' }
            ]}>
                <Text style={[styles.statusTagText,
                status === 'Yeni' ? { color: '#D4AF37' } :
                    status === 'Randevu' ? { color: '#4ade80' } :
                        { color: '#aaa' }
                ]}>{status}</Text>
            </View>
        </View>

        <View style={styles.requestBody}>
            <Text style={styles.topicText}>{topic}</Text>
            <View style={styles.metaRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={12} color="#666" style={{ marginRight: 4 }} />
                    <Text style={styles.metaText}>{time}</Text>
                </View>
                {urgency === 'Yüksek' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="alert-circle" size={12} color="#D4AF37" style={{ marginRight: 4 }} />
                        <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: 'bold' }}>Acil</Text>
                    </View>
                )}
            </View>
        </View>

        <View style={styles.requestFooter}>
            <Text style={styles.requestId}>{id}</Text>
            <TouchableOpacity style={styles.replyBtn}>
                <Text style={styles.replyBtnText}>YANITLA</Text>
                <Ionicons name="arrow-forward" size={14} color="#000" />
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
    headerTitle: { color: '#D4AF37', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    headerSubtitle: { color: '#fff', fontSize: 20, fontWeight: '300', marginTop: 2 },

    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', paddingLeft: 10, paddingVertical: 4, paddingRight: 4, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },

    exitBtn: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: '#333',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#444'
    },

    content: { padding: 24 },

    statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    statCard: { flex: 1, backgroundColor: '#1A1A1A', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { color: '#888', fontSize: 12 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
    seeAll: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },

    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: { width: '48%', backgroundColor: '#1A1A1A', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center', flexDirection: 'row', gap: 12 },
    actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionLabel: { color: '#ccc', fontWeight: 'bold', fontSize: 12 },

    requestsList: { gap: 12 },
    requestCard: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
    requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    clientName: { color: '#aaa', fontSize: 12, fontWeight: '500' },
    statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    statusTagText: { fontSize: 10, fontWeight: 'bold' },

    requestBody: { marginBottom: 16 },
    topicText: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 8 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metaText: { color: '#666', fontSize: 11 },

    requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 12 },
    requestId: { color: '#555', fontSize: 11, fontWeight: 'bold' },
    replyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4AF37', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, gap: 6 },
    replyBtnText: { color: '#000', fontSize: 11, fontWeight: '900' },
});
