import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function AccountSettingsScreen({ route }) {
    const navigation = useNavigation();
    const { user } = useAuth();
    // Profil sayfasından gelen mevcut veriyi alıyoruz
    const { profileData } = route.params || {};

    const [fullName, setFullName] = useState(profileData?.full_name || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!fullName.trim()) {
            Alert.alert('Hata', 'İsim boş olamaz.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    // Buraya istersen telefon, adres vs. ekleyebilirsin
                })
                .eq('id', user.id);

            if (error) throw error;

            Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
            navigation.goBack(); // Geri dönünce profil sayfası güncellenecek (useFocusEffect sayesinde)
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Custom Header (Optional if not using Stack Header) */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hesap Bilgileri</Text>
            </View>

            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Adınız Soyadınız"
                placeholderTextColor="#666"
            />

            <Text style={styles.label}>E-Posta (Değiştirilemez)</Text>
            <View style={[styles.input, styles.disabledInput]}>
                <Text style={{ color: '#aaa' }}>{user?.email}</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', padding: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10
    },
    backButton: {
        marginRight: 15,
        padding: 5
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold'
    },
    label: { color: '#FFD700', marginBottom: 8, marginTop: 15, fontWeight: 'bold' },
    input: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    disabledInput: { opacity: 0.7 },
    saveButton: {
        backgroundColor: '#FFD700',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3
    },
    saveButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
