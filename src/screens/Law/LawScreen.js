import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LawScreen() {
    const [problemText, setProblemText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [foundLawyer, setFoundLawyer] = useState(null); // 'Kaan' will appear here

    const handleContractAction = (action) => {
        Alert.alert(action, "Bu modül için doküman yükleme veya form doldurma ekranı açılacak.");
    };

    const handleFindLawyer = () => {
        if (problemText.length < 5) {
            Alert.alert("Hata", "Lütfen sorununuzu kısaca özetleyin.");
            return;
        }

        setIsSearching(true);

        // Simulate AI Search
        setTimeout(() => {
            setIsSearching(false);
            setFoundLawyer({
                name: 'Av. Kaan Arıcı',
                title: 'İnşaat Sözleşmeleri & İhtilaflar Uzmanı',
                matchScore: '%98 Eşleşme',
                image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400&auto=format&fit=crop'
            });
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#1a1a1a']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>HUKUKİ ÇÖZÜM MERKEZİ</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* 1. Legal Tools Grid */}
                    <Text style={styles.sectionHeader}>HIZLI HUKUKİ ARAÇLAR</Text>
                    <View style={styles.toolsGrid}>
                        <TouchableOpacity style={styles.toolCard} onPress={() => handleContractAction('Sözleşme Kontrolü')}>
                            <View style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}>
                                <FontAwesome5 name="file-contract" size={24} color="#1565c0" />
                            </View>
                            <Text style={styles.toolTitle}>Sözleşme Kontrolü</Text>
                            <Text style={styles.toolDesc}>Riskli maddeleri tespit et</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolCard} onPress={() => handleContractAction('Risk Analizi')}>
                            <View style={[styles.iconBox, { backgroundColor: '#ffebee' }]}>
                                <MaterialCommunityIcons name="alert-decagram" size={28} color="#c62828" />
                            </View>
                            <Text style={styles.toolTitle}>Risk Analizi</Text>
                            <Text style={styles.toolDesc}>İflas, fesih durumlarını sor</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolCard} onPress={() => handleContractAction('Avukata Sor')}>
                            <View style={[styles.iconBox, { backgroundColor: '#fff8e1' }]}>
                                <MaterialCommunityIcons name="chat-question" size={28} color="#f9a825" />
                            </View>
                            <Text style={styles.toolTitle}>Alo Avukat</Text>
                            <Text style={styles.toolDesc}>Uzmanına sesli/yazılı danış</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolCard} onPress={() => handleContractAction('Dilekçe Hazırla')}>
                            <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
                                <FontAwesome5 name="file-signature" size={24} color="#2e7d32" />
                            </View>
                            <Text style={styles.toolTitle}>Dilekçe Asistanı</Text>
                            <Text style={styles.toolDesc}>Otomatik ihtarname hazırla</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 2. Find Lawyer (Dynamic) */}
                    <Text style={[styles.sectionHeader, { marginTop: 30 }]}>UZMAN EŞLEŞTİRME</Text>
                    <View style={styles.searchCard}>
                        {!foundLawyer ? (
                            <>
                                <Text style={styles.searchDesc}>
                                    Hukuki sorununuzu anlatın, yapay zeka sizi en doğru uzmana yönlendirsin.
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Örn: Müteahhit ek süre istiyor ama sözleşmede cezai şart var..."
                                    placeholderTextColor="#666"
                                    multiline
                                    value={problemText}
                                    onChangeText={setProblemText}
                                />
                                <TouchableOpacity
                                    style={styles.searchBtn}
                                    onPress={handleFindLawyer}
                                    disabled={isSearching}
                                >
                                    {isSearching ? (
                                        <ActivityIndicator color="#000" />
                                    ) : (
                                        <>
                                            <Text style={styles.searchBtnText}>UZMANI BUL</Text>
                                            <FontAwesome5 name="search" size={16} color="#000" style={{ marginLeft: 8 }} />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            // FOUND LAWYER PROFILE (Kaan Arıcı)
                            <View style={styles.foundProfile}>
                                <View style={styles.matchBadge}>
                                    <Text style={styles.matchText}>{foundLawyer.matchScore}</Text>
                                </View>
                                <View style={styles.profileHeader}>
                                    <Image source={{ uri: foundLawyer.image }} style={styles.profileImage} />
                                    <View style={{ flex: 1, marginLeft: 15 }}>
                                        <Text style={styles.profileName}>{foundLawyer.name}</Text>
                                        <Text style={styles.profileTitle}>{foundLawyer.title}</Text>
                                        <View style={styles.stars}>
                                            <Ionicons name="star" size={14} color="#FFD700" />
                                            <Ionicons name="star" size={14} color="#FFD700" />
                                            <Ionicons name="star" size={14} color="#FFD700" />
                                            <Ionicons name="star" size={14} color="#FFD700" />
                                            <Ionicons name="star" size={14} color="#FFD700" />
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.profileBio}>
                                    Konuyla ilgili 10+ yıllık tecrübesi var. Özellikle "{problemText}" konusundaki davaları başarıyla sonuçlandırmıştır.
                                </Text>
                                <TouchableOpacity style={styles.connectBtn} onPress={() => Alert.alert("Bağlanıyor", "Görüşme başlatılıyor...")}>
                                    <Text style={styles.connectText}>HEMEN GÖRÜŞ</Text>
                                    <Ionicons name="call" size={18} color="#000" style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.resetBtn} onPress={() => { setFoundLawyer(null); setProblemText(''); }}>
                                    <Text style={styles.resetText}>Yeni Arama</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { padding: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
    headerTitle: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
    scrollContent: { padding: 20 },

    sectionHeader: { color: '#666', fontSize: 13, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },

    // Tools Grid
    toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
    toolCard: {
        width: '47%',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'center'
    },
    iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    toolTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
    toolDesc: { color: '#888', fontSize: 11, textAlign: 'center', marginTop: 4 },

    // Search Card
    searchCard: { backgroundColor: '#111', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
    searchDesc: { color: '#ccc', marginBottom: 15 },
    input: {
        backgroundColor: '#222',
        color: '#fff',
        borderRadius: 12,
        padding: 15,
        minHeight: 80,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#444',
        marginBottom: 15
    },
    searchBtn: { backgroundColor: '#FFD700', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    searchBtnText: { color: '#000', fontWeight: 'bold' },

    // Found Profile
    foundProfile: {},
    matchBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    matchText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    profileImage: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#FFD700' },
    profileName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    profileTitle: { color: '#aaa', fontSize: 12 },
    stars: { flexDirection: 'row', marginTop: 4, gap: 2 },
    profileBio: { color: '#ccc', fontSize: 13, lineHeight: 18, marginBottom: 20, fontStyle: 'italic', backgroundColor: '#222', padding: 10, borderRadius: 8 },
    connectBtn: { backgroundColor: '#FFD700', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    connectText: { color: '#000', fontWeight: 'bold' },
    resetBtn: { alignItems: 'center', padding: 10 },
    resetText: { color: '#666' }
});
