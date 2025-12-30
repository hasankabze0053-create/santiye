import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BulkRequestScreen() {
    const navigation = useNavigation();
    const [rfqTab, setRfqTab] = useState('text'); // 'manual', 'text', 'photo'
    const [rfqText, setRfqText] = useState('');

    const handleSendRFQ = () => {
        Alert.alert(
            "Talep Alındı! 🚀",
            "Malzeme listeniz operasyon ekibimize iletildi. En kısa sürede en iyi fiyatlarla teklifinizi hazırlayıp size döneceğiz.",
            [
                { text: "Tamam", onPress: () => navigation.goBack() }
            ]
        );
        setRfqText('');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1, padding: 20 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFD700" />
                    </TouchableOpacity>
                    <Text style={styles.title}>TOPLU MALZEME TALEBİ</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabBtn, rfqTab === 'text' && styles.activeTabBtn]}
                        onPress={() => setRfqTab('text')}
                    >
                        <MaterialCommunityIcons name="text-box-outline" size={20} color={rfqTab === 'text' ? '#000' : '#888'} />
                        <Text style={[styles.tabText, rfqTab === 'text' && styles.activeTabText]}>Yazarak</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabBtn, rfqTab === 'photo' && styles.activeTabBtn]}
                        onPress={() => setRfqTab('photo')}
                    >
                        <MaterialCommunityIcons name="camera-outline" size={20} color={rfqTab === 'photo' ? '#000' : '#888'} />
                        <Text style={[styles.tabText, rfqTab === 'photo' && styles.activeTabText]}>Fotoğraf</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabBtn, rfqTab === 'manual' && styles.activeTabBtn]}
                        onPress={() => setRfqTab('manual')}
                    >
                        <MaterialCommunityIcons name="playlist-plus" size={20} color={rfqTab === 'manual' ? '#000' : '#888'} />
                        <Text style={[styles.tabText, rfqTab === 'manual' && styles.activeTabText]}>Manuel</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.body}>
                    {rfqTab === 'text' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>İhtiyaçlarınızı WhatsApp'tan yazar gibi yazın:</Text>
                            <TextInput
                                style={styles.textArea}
                                multiline
                                placeholder="Örn: 10 ton Q16 demir, 50 torba çimento, 1000 adet 11mm OSB..."
                                placeholderTextColor="#555"
                                value={rfqText}
                                onChangeText={setRfqText}
                            />
                        </View>
                    )}
                    {rfqTab === 'photo' && (
                        <View style={styles.photoUploadContainer}>
                            <View style={styles.photoPlaceholder}>
                                <MaterialCommunityIcons name="cloud-upload" size={48} color="#FFD700" />
                                <Text style={styles.photoText}>Kağıt listenin fotoğrafını çekin veya yükleyin</Text>
                            </View>
                            <TouchableOpacity style={styles.cameraBtn}>
                                <Text style={styles.cameraBtnText}>KAMERA / GALERİ</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {rfqTab === 'manual' && (
                        <View style={styles.manualContainer}>
                            <Text style={styles.manualInfo}>
                                Detaylı arama ve liste oluşturma modülü yapım aşamasında.
                                Lütfen şimdilik "Yazarak" sekmesini kullanın.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Submit Action */}
                <TouchableOpacity style={styles.submitBtn} onPress={handleSendRFQ}>
                    <Text style={styles.submitText}>TEKLİF İSTE</Text>
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    title: { color: '#FFD700', fontSize: 18, fontWeight: '900', letterSpacing: 1 },

    tabContainer: { flexDirection: 'row', backgroundColor: '#1A1A1A', padding: 4, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#333' },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 6 },
    activeTabBtn: { backgroundColor: '#FFD700' },
    tabText: { fontWeight: 'bold', color: '#888', fontSize: 13 },
    activeTabText: { color: '#000' },

    body: { flex: 1 },
    inputContainer: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
    inputLabel: { color: '#888', marginBottom: 16, fontSize: 14 },
    textArea: { color: '#fff', fontSize: 16, height: '100%', textAlignVertical: 'top' },

    photoUploadContainer: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#333', borderStyle: 'dashed', marginBottom: 20 },
    photoPlaceholder: { alignItems: 'center', marginBottom: 24 },
    photoText: { color: '#666', marginTop: 12, textAlign: 'center', paddingHorizontal: 40, fontSize: 15 },
    cameraBtn: { backgroundColor: '#FFD700', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    cameraBtnText: { fontWeight: 'bold', color: '#000', fontSize: 13 },

    manualContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A1A', borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
    manualInfo: { color: '#666', textAlign: 'center', paddingHorizontal: 30, fontSize: 15 },

    submitBtn: { backgroundColor: '#FFD700', padding: 20, borderRadius: 20, alignItems: 'center' },
    submitText: { color: '#000', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
});
