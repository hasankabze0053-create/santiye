import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TechnicalRequestDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { request } = route.params || {};

    if (!request) {
        return (
            <View style={styles.errorContainer}>
                <Text allowFontScaling={false} style={{ color: '#fff' }}>Dosya bulunamadı.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text allowFontScaling={false} style={{ color: '#D4AF37' }}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const {
        service_type = 'Genel Teknik Talep',
        user_name = 'Kullanıcı',
        phone = '',
        email = '',
        description = 'Açıklama bulunmuyor.',
        created_at,
        has_documents = false,
        city = '',
        district = ''
    } = request;

    // Technical requests use 'phone' and 'email' keys directly in formatted data, unlike Law which uses user_phone and user_email
    const userPhone = phone || request.user_phone || '';
    const userEmail = email || request.user_email || '';

    const handleCall = () => {
        if (userPhone) {
            Linking.openURL(`tel:${userPhone}`);
        } else {
            Alert.alert("Bilgi", "Kullanıcıya ait telefon numarası bulunamadı.");
        }
    };

    const handleEmail = () => {
        if (userEmail) {
            Linking.openURL(`mailto:${userEmail}`);
        } else {
            Alert.alert("Bilgi", "Kullanıcıya ait e-posta adresi bulunamadı.");
        }
    };

    const handleDocumentView = () => {
        if (has_documents) {
            Alert.alert("Bilgi", "Belgeler güvenli bir şekilde görüntülenecektir.");
        }
    };

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
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#e2e8f0" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text allowFontScaling={false} style={styles.headerTitle}>DOSYA DETAYI</Text>
                        <Text allowFontScaling={false} style={styles.headerSub} numberOfLines={1} adjustsFontSizeToFit>{service_type.replace(/\n/g, ' ').toUpperCase()}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* CLIENT INFO CARD */}
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="office-building" size={20} color="#D4AF37" />
                        <Text allowFontScaling={false} style={styles.sectionTitle}>Talep Sahibi Bilgileri</Text>
                    </View>

                    <LinearGradient
                        colors={['#121214', '#0a0a0c']}
                        style={styles.card}
                    >
                        <View style={styles.clientRow}>
                            <View style={styles.clientAvatar}>
                                <Text allowFontScaling={false} style={styles.clientAvatarTxt}>{user_name.substring(0, 2).toUpperCase()}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={styles.clientName}>{user_name}</Text>
                                <Text allowFontScaling={false} style={styles.clientDate}>{new Date(created_at).toLocaleDateString('tr-TR')} tarihinde oluşturuldu</Text>
                            </View>
                        </View>

                        {(city || district) && (
                            <>
                                <View style={styles.hDivider} />
                                <View style={styles.contactRow}>
                                    <View style={styles.contactItem}>
                                        <Ionicons name="location-outline" size={16} color="#94a3b8" />
                                        <Text allowFontScaling={false} style={styles.contactTxt}>{(city && city !== 'Tüm Türkiye') ? `${city} / ${district}` : 'Tüm Türkiye (Uzaktan)'}</Text>
                                    </View>
                                </View>
                            </>
                        )}

                        <View style={styles.hDivider} />

                        <View style={styles.contactRow}>
                            <View style={styles.contactItem}>
                                <Ionicons name="call-outline" size={16} color="#94a3b8" />
                                <Text allowFontScaling={false} style={styles.contactTxt}>{userPhone || 'Belirtilmedi'}</Text>
                            </View>
                            <TouchableOpacity onPress={handleCall} style={styles.actionIconBtn}>
                                <Ionicons name="call" size={16} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{ height: 12 }} />

                        <View style={styles.contactRow}>
                            <View style={styles.contactItem}>
                                <Ionicons name="mail-outline" size={16} color="#94a3b8" />
                                <Text allowFontScaling={false} style={styles.contactTxt}>{userEmail || 'Belirtilmedi'}</Text>
                            </View>
                            <TouchableOpacity onPress={handleEmail} style={styles.actionIconBtn}>
                                <Ionicons name="mail" size={16} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    {/* CONTENT CARD */}
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="text-box-outline" size={20} color="#D4AF37" />
                        <Text allowFontScaling={false} style={styles.sectionTitle}>Talep İçeriği</Text>
                    </View>

                    <LinearGradient
                        colors={['#121214', '#0a0a0c']}
                        style={styles.card}
                    >
                        <Text allowFontScaling={false} style={styles.descriptionText}>
                            {description}
                        </Text>
                    </LinearGradient>

                    {/* DOCUMENTS */}
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="file-cabinet" size={20} color="#D4AF37" />
                        <Text allowFontScaling={false} style={styles.sectionTitle}>Ekli Belgeler</Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.docBtn, !has_documents && { opacity: 0.5, borderColor: '#27272a' }]}
                        activeOpacity={0.7}
                        onPress={handleDocumentView}
                        disabled={!has_documents}
                    >
                        <View style={[styles.docIconBox, !has_documents && { backgroundColor: '#1e293b' }]}>
                            <MaterialCommunityIcons name={has_documents ? "file-document-multiple-outline" : "file-hidden"} size={24} color={has_documents ? "#D4AF37" : "#64748b"} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text allowFontScaling={false} style={[styles.docTitle, !has_documents && { color: '#64748b' }]}>
                                {has_documents ? "Sisteme Yüklenmiş Belgeler" : "Dosyaya Ekli Belge Yok"}
                            </Text>
                            <Text allowFontScaling={false} style={styles.docSub}>
                                {has_documents ? "İncelemek veya indirmek için dokunun" : "Kullanıcı destekleyici belge yüklemedi"}
                            </Text>
                        </View>
                        {has_documents && <Ionicons name="chevron-forward" size={20} color="#D4AF37" />}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* BOTTOM ACTION */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.bidButton} onPress={() => {
                        Alert.alert("Başarılı", "Kullanıcıya yanıt / teklif iletme aşamasına geçildi.");
                    }}>
                        <LinearGradient
                            colors={['#1c1c1e', '#0a0a0c']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.gradientBtn}
                        >
                            <Text allowFontScaling={false} style={styles.bidButtonText}>TALEBE YANIT VER / TEKLİF İLET</Text>
                            <MaterialCommunityIcons name="briefcase-check" size={20} color="#D4AF37" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    errorContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { color: '#64748b', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
    headerSub: { color: '#D4AF37', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
    
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 16 },
    sectionTitle: { color: '#e2e8f0', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },

    card: { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#27272a', marginBottom: 8 },
    
    clientRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    clientAvatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(212, 175, 55, 0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    clientAvatarTxt: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    clientName: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
    clientDate: { color: '#94a3b8', fontSize: 12 },
    
    hDivider: { height: 1, backgroundColor: '#27272a', marginVertical: 16 },
    
    contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    contactTxt: { color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
    actionIconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },

    descriptionText: { color: '#e2e8f0', fontSize: 15, lineHeight: 24 },

    docBtn: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#121214', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    docIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center' },
    docTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    docSub: { color: '#94a3b8', fontSize: 12 },

    bottomBar: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#27272a', backgroundColor: '#0a0a0c' },
    bidButton: { borderRadius: 12, overflow: 'hidden' },
    gradientBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)', borderRadius: 12 },
    bidButtonText: { color: '#D4AF37', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
});
