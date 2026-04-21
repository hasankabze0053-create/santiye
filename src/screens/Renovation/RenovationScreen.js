import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PermissionService } from '../../services/PermissionService';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
const PLATINUM_DARK = '#2E2E2E'; // Dark Metallic
const PLATINUM_LIGHT = '#E5E4E2'; // Platinum Text
const GOLD_MAIN = '#FFD700';
const GOLD_ACCENT = '#D4AF37';

// Data
const HERO_SLIDES = [
    {
        id: 1,
        title: "Modern Salon\nYenileme",
        image: { uri: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop' },
        tag: "Minimalist"
    },
    {
        id: 2,
        title: "Lüks Mutfak\nTasarımı",
        image: { uri: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop' },
        tag: "Avant-Garde"
    },
    {
        id: 3,
        title: "Asansör Revizyon\n& Bakım",
        image: { uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop' },
        tag: "Premium"
    }
];

// Standard Gold Card (Premium Button)
const GoldCard = ({ children, style, onPress }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.goldCardContainer, style]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
            colors={['rgba(255, 215, 0, 0.15)', 'transparent', 'rgba(255, 255, 255, 0.05)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardContent}>
            {children}
        </View>
    </TouchableOpacity>
);

import { supabase } from '../../lib/supabase';
import { RenovationService } from '../../services/RenovationService';

const COLOR_PALETTE = [
    { name: 'Altın', code: '#D4AF37' },
    { name: 'Beyaz', code: '#FFFFFF' },
    { name: 'Gümüş', code: '#C0C0C0' },
    { name: 'Kömür', code: '#333333' },
    { name: 'Turuncu', code: '#F97316' },
    { name: 'Mavi', code: '#06B6D4' },
    { name: 'Kırmızı', code: '#EF4444' },
];

export default function RenovationScreen({ navigation }) {
    const [requestInput, setRequestInput] = useState('');
    const [selectedQuality, setSelectedQuality] = useState('Konfor');
    const scrollX = useRef(new Animated.Value(0)).current;

    const [isAdmin, setIsAdmin] = useState(false);
    const [isArchitect, setIsArchitect] = useState(false);
    const [isContractor, setIsContractor] = useState(false);
    const [servicePage, setServicePage] = useState(0);
    const [services, setServices] = useState([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        checkUserStatus();
        fetchServices();
        fetchShowcase();
    }, []);

    // Showcase State
    const [showcaseItems, setShowcaseItems] = useState([]);
    const [isShowcaseManagerVisible, setIsShowcaseManagerVisible] = useState(false);
    const [editingShowcaseItem, setEditingShowcaseItem] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchShowcase = async () => {
        const items = await RenovationService.getShowcaseItems();
        setShowcaseItems(items || []);
    };

    const handlePickShowcaseImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setIsUploading(true);
            const publicUrl = await RenovationService.uploadImage(result.assets[0].uri);
            if (publicUrl) {
                setEditingShowcaseItem(prev => ({ ...prev, image_url: publicUrl, image_ref: null, is_local: false }));
            } else {
                Alert.alert("Hata", "Resim yüklenemedi. 'renovation-images' bucket'ı oluşturulduğundan emin olun.");
            }
            setIsUploading(false);
        }
    };

    const handleSaveShowcase = async () => {
        if (!editingShowcaseItem) return;
        
        const isNew = !editingShowcaseItem.id;
        let success = false;

        if (isNew) {
            const res = await RenovationService.addShowcaseItem(editingShowcaseItem);
            success = res.success;
        } else {
            const res = await RenovationService.updateShowcaseItem(editingShowcaseItem.id, editingShowcaseItem);
            success = res.success;
        }

        if (success) {
            fetchShowcase();
            setEditingShowcaseItem(null);
            Alert.alert("Başarılı", "Tadilat kampanyası kaydedildi.");
        } else {
            Alert.alert("Hata", "Kampanya kaydedilemedi.");
        }
    };

    const handleDeleteShowcase = async (id) => {
        Alert.alert("Sil", "Bu kampanyayı silmek istediğinize emin misiniz?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Sil", style: "destructive", onPress: async () => {
                    const { success } = await RenovationService.deleteShowcaseItem(id);
                    if (success) {
                        setShowcaseItems(prev => prev.filter(item => item.id !== id));
                    }
                }
            }
        ]);
    };

    const fetchServices = async () => {
        setIsLoadingServices(true);
        const { data, error } = await supabase
            .from('renovation_services')
            .select('*')
            .order('display_order', { ascending: true });
        
        if (error) {
            console.error('Error fetching services:', error.message);
        } else {
            setServices(data || []);
        }
        setIsLoadingServices(false);
    };

    const moveService = async (index, direction) => {
        const newServices = [...services];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newServices.length) return;

        // Swap locally
        const temp = newServices[index];
        newServices[index] = newServices[targetIndex];
        newServices[targetIndex] = temp;

        setServices(newServices); // Optimistic update

        try {
            // Update only the two swapped rows to be safer with RLS/Constraints
            const { error: err1 } = await supabase
                .from('renovation_services')
                .update({ display_order: index + 1 })
                .eq('id', newServices[index].id);

            const { error: err2 } = await supabase
                .from('renovation_services')
                .update({ display_order: targetIndex + 1 })
                .eq('id', newServices[targetIndex].id);

            if (err1 || err2) throw new Error(err1?.message || err2?.message);
        } catch (error) {
            console.error('Sorting update failed:', error.message);
            Alert.alert('Hata', `Sıralama güncellenemedi: ${error.message}`);
            fetchServices(); // Revert on fail
        }
    };

    const toggleServiceVisibility = async (service) => {
        const newStatus = !service.is_active;
        
        // Optimistic update
        setServices(services.map(s => s.id === service.id ? { ...s, is_active: newStatus } : s));

        const { error } = await supabase
            .from('renovation_services')
            .update({ is_active: newStatus })
            .eq('id', service.id);

        if (error) {
            Alert.alert('Hata', 'Görünürlük güncellenemedi.');
            fetchServices();
        }
    };

    const [hasRenovationAccess, setHasRenovationAccess] = useState(false);

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const roles = await PermissionService.getUserRoles();
                setIsAdmin(roles.isAdmin);

                const hasAccess = await PermissionService.checkAccess('renovation_office');
                setHasRenovationAccess(hasAccess);
            }
        } catch (e) {
            console.warn('User status check failed', e);
        }
    };

    const handleServicePress = (service) => {
        // Use service_id from DB for navigation logic
        const sId = service.service_id || service.id;

        if (sId === 'turnkey') {
            navigation.navigate('RenovationProjectSelection');
            return;
        } else if (sId === 'kitchen') {
            navigation.navigate('KitchenBathWizard');
            return;
        } else if (sId === 'paint') {
            navigation.navigate('PaintDecorWizard');
            return;
        } else if (sId === 'elevator_maintenance') {
            navigation.navigate('ElevatorWizard');
            return;
        }
        Alert.alert(service.title.replace(/\\n/g, ' '), `${service.subtitle}\n\nBu modül yakında aktif olacak.`);
    };

    const handleAction = (action) => {
        Alert.alert(action, "Modül başlatılıyor...");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <LinearGradient
                colors={['#000000', '#121212', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>

                {/* CUSTOM HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text allowFontScaling={false} style={styles.headerTitle}>MİMARLIK OFİSİ</Text>
                        <Text allowFontScaling={false} style={styles.headerSubtitle}>Yaşam Alanınızı Yeniden Keşfedin</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {isAdmin && (
                            <TouchableOpacity 
                                style={[styles.headerIconBtn, isEditMode && { borderColor: GOLD_MAIN, backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}
                                onPress={() => setIsEditMode(!isEditMode)}
                            >
                                <MaterialCommunityIcons name={isEditMode ? "check-circle" : "cog-outline"} size={22} color={GOLD_MAIN} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.headerIconBtn, !hasRenovationAccess && !isAdmin && { opacity: 0.5 }]}
                            onPress={() => {
                                if (isAdmin || hasRenovationAccess) {
                                    navigation.navigate('RenovationProvider');
                                } else {
                                    Alert.alert("Yetkisiz Erişim", "Tadilat yönetim paneline sadece yetkili firmalar erişebilir.");
                                }
                            }}
                            activeOpacity={isAdmin || hasRenovationAccess ? 0.7 : 1}
                        >
                            <MaterialCommunityIcons name="hammer-wrench" size={24} color={isAdmin || hasRenovationAccess ? "#D4AF37" : "#666"} />
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>



                    {/* HERO CAROUSEL */}
                    <View style={styles.carouselContainer}>
                        <Animated.ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
                            scrollEventThrottle={16}
                        >
                            {showcaseItems.map((slide) => (
                                <View key={slide.id} style={styles.slide}>
                                    <Image 
                                        source={slide.is_local ? slide.image : { uri: slide.image_url }} 
                                        style={[
                                            styles.slideImage,
                                            { transform: [{ scale: slide.image_scale || 1 }] }
                                        ]} 
                                        contentFit="cover" 
                                        transition={500} 
                                    />
                                    <View style={styles.slideOverlay}>
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.9)']}
                                            style={StyleSheet.absoluteFillObject}
                                        />
                                        <View style={[
                                            styles.slideContent,
                                            {
                                                transform: [
                                                    { translateX: slide.text_offset_x || 0 },
                                                    { translateY: slide.text_offset_y || 0 }
                                                ]
                                            }
                                        ]}>
                                            <View style={[
                                                styles.tagContainer,
                                                { backgroundColor: slide.tag_color || GOLD_ACCENT, alignSelf: 'flex-start' }
                                            ]}>
                                                <Text allowFontScaling={false} style={styles.tagText}>{slide.tag}</Text>
                                            </View>
                                            <Text allowFontScaling={false} style={[styles.slideTitle, { color: slide.title_color || '#FFF' }]}>{slide.title}</Text>
                                            <TouchableOpacity style={styles.offerBtn} onPress={() => navigation.navigate('RenovationProjectSelection')}>
                                                <Text allowFontScaling={false} style={styles.offerBtnText}>{slide.button_text || 'TEKLİF AL'}</Text>
                                                <MaterialCommunityIcons name="arrow-right" size={16} color="#000" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Admin Slider Edit Shortcut */}
                                        {isAdmin && (
                                            <TouchableOpacity 
                                                style={styles.heroEditShortcut} 
                                                onPress={() => setEditingShowcaseItem(slide)}
                                            >
                                                <MaterialCommunityIcons name="pencil" size={20} color="#000" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </Animated.ScrollView>

                        {/* Pagination Dots */}
                        <View style={styles.pagination}>
                            {showcaseItems.map((_, i) => {
                                const opacity = scrollX.interpolate({
                                    inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                                    outputRange: [0.3, 1, 0.3],
                                    extrapolate: 'clamp'
                                });
                                return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
                            })}
                        </View>
                    </View>

                    {/* Slider Settings Button (Admin Only) */}
                    {isAdmin && (
                        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                            <TouchableOpacity 
                                style={styles.adminSliderBtn}
                                onPress={() => setIsShowcaseManagerVisible(true)}
                            >
                                <LinearGradient colors={['#1A1A1A', '#111']} style={StyleSheet.absoluteFillObject} />
                                <MaterialCommunityIcons name="view-carousel-outline" size={20} color={GOLD_MAIN} />
                                <Text allowFontScaling={false} style={styles.adminSliderBtnText}>SLIDER AYARLARI</Text>
                                <MaterialCommunityIcons name="cog-outline" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* SERVICE GRID — Sayfalı slider */}
                    <View style={styles.sectionContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text allowFontScaling={false} style={[styles.sectionTitle, { marginBottom: 0 }]}>HİZMETLERİMİZ</Text>
                            {isEditMode && <Text allowFontScaling={false} style={{ color: GOLD_MAIN, fontSize: 10, fontWeight: 'bold' }}>DÜZENLEME MODU AKTİF</Text>}
                        </View>
                        
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={e => {
                                const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
                                setServicePage(idx);
                            }}
                        >
                            {(() => {
                                const filteredServices = isEditMode ? services : services.filter(s => s.is_active);
                                const pagesCount = Math.ceil(filteredServices.length / 4);

                                return Array.from({ length: pagesCount }).map((_, pageIdx) => (
                                    <View key={pageIdx} style={[styles.gridPage, pageIdx === pagesCount - 1 && { paddingRight: 0 }]}>
                                        {filteredServices.slice(pageIdx * 4, (pageIdx + 1) * 4).map((item, idxInPage) => {
                                            const globalIdx = pageIdx * 4 + idxInPage;
                                            return (
                                                <GoldCard
                                                    key={item.id}
                                                    style={[styles.gridItem, !item.is_active && { opacity: 0.5 }]}
                                                    onPress={() => !isEditMode && handleServicePress(item)}
                                                >
                                                    {isEditMode && (
                                                        <View style={styles.adminControlsOverlay}>
                                                            <View style={styles.adminActionRow}>
                                                                <TouchableOpacity onPress={() => moveService(globalIdx, 'up')} disabled={globalIdx === 0}>
                                                                    <MaterialCommunityIcons name="chevron-up" size={22} color={globalIdx === 0 ? "#444" : GOLD_MAIN} />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity onPress={() => moveService(globalIdx, 'down')} disabled={globalIdx === filteredServices.length - 1}>
                                                                    <MaterialCommunityIcons name="chevron-down" size={22} color={globalIdx === filteredServices.length - 1 ? "#444" : GOLD_MAIN} />
                                                                </TouchableOpacity>
                                                            </View>
                                                            <TouchableOpacity style={styles.eyeBtn} onPress={() => toggleServiceVisibility(item)}>
                                                                <MaterialCommunityIcons name={item.is_active ? "eye" : "eye-off"} size={20} color={item.is_active ? GOLD_MAIN : "#ef4444"} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}

                                                    <View style={styles.iconCircle}>
                                                        {item.lib === 'Ionicons' ? (
                                                            <Ionicons name={item.icon} size={26} color={GOLD_MAIN} />
                                                        ) : (
                                                            <MaterialCommunityIcons name={item.icon} size={28} color={GOLD_MAIN} />
                                                        )}
                                                    </View>
                                                    <View style={{ alignItems: 'center' }}>
                                                        <Text allowFontScaling={false} style={styles.gridItemTitle}>{item.title.replace(/\\n/g, '\n')}</Text>
                                                        <Text allowFontScaling={false} style={styles.gridItemSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                                                    </View>
                                                </GoldCard>
                                            );
                                        })}
                                    </View>
                                ));
                            })()}
                        </ScrollView>

                        {/* Sayfa Göstergesi */}
                        <View style={styles.servicePagination}>
                            {(() => {
                                const filteredServices = isEditMode ? services : services.filter(s => s.is_active);
                                const pagesCount = Math.ceil(filteredServices.length / 4);
                                return Array.from({ length: pagesCount }).map((_, i) => (
                                    <View key={i} style={[styles.serviceDot, servicePage === i && styles.serviceDotActive]} />
                                ));
                            })()}
                        </View>
                    </View>


                    {/* MIMARIM - SANAL TASARIM STÜDYOSU */}
                    <View style={styles.smartSection}>
                        <LinearGradient
                            colors={['rgba(255, 215, 0, 0.05)', 'transparent']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.smartHeader}>
                            <MaterialCommunityIcons name="cube-scan" size={24} color={GOLD_MAIN} />
                            <Text allowFontScaling={false} style={styles.smartTitle}>Mimarım - Sanal Tasarım Stüdyosu</Text>
                        </View>

                        <Text allowFontScaling={false} style={styles.smartDesc}>
                            Mevcut alanın fotoğrafını yükleyin; seçtiğiniz kalite sınıfına uygun olarak <Text allowFontScaling={false} style={{ color: GOLD_MAIN }}>3D tasarımınızı ve maliyet teklifinizi</Text> hazırlansın.
                        </Text>

                        {/* Mood Tags (Radio Selection) */}
                        <View style={styles.moodTagsRow}>
                            {['Ekonomik', 'Konfor', 'Exclusive'].map((tag, index) => {
                                const isSelected = selectedQuality === tag;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.moodTag, isSelected ? styles.moodTagActive : {}]}
                                        onPress={() => setSelectedQuality(tag)}
                                    >
                                        <Text allowFontScaling={false} style={[styles.moodTagText, isSelected ? styles.moodTagTextActive : {}]}>{tag}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput allowFontScaling={false}
                                style={styles.textInput}
                                placeholder="Dönüşümünüzdeki beklentilerinizi ve alanın fotoğrafını belirtin..."
                                placeholderTextColor="#666"
                                multiline
                                value={requestInput}
                                onChangeText={setRequestInput}
                            />
                        </View>

                        {/* Photo Upload Button (Large Card Style) */}
                        <TouchableOpacity style={styles.photoUploadCard} onPress={() => handleAction('Fotoğraf Yükle')}>
                            <View style={styles.photoIconCircle}>
                                <MaterialCommunityIcons name="camera-plus" size={24} color="#000" />
                                <View style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD_MAIN }} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={styles.photoUploadTitle}>Mevcut Alanın Fotoğrafını Yükle</Text>
                                <Text allowFontScaling={false} style={styles.photoUploadSub}>Mimarlarımız dönüşümü başlatsın</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.submitBtn} onPress={() => handleAction('Analiz Başlat')}>
                            <LinearGradient
                                colors={[GOLD_MAIN, '#B8860B']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}
                            >
                                <Text allowFontScaling={false} style={styles.submitText}>TASARIM VE TEKLİF İSTE</Text>
                                <MaterialCommunityIcons name="magic-staff" size={24} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Consultant CTA (Premium) */}
                        <TouchableOpacity activeOpacity={0.9} onPress={() => handleAction('Mimar Görüşmesi')}>
                            <LinearGradient
                                colors={['#1c1917', '#292524']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.consultantCard}
                            >
                                <View style={styles.consultantContent}>
                                    <View style={styles.consultantIconBox}>
                                        <MaterialCommunityIcons name="face-agent" size={24} color={GOLD_MAIN} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={styles.consultantTitle}>Karar veremediniz mi?</Text>
                                        <Text allowFontScaling={false} style={styles.consultantSub}>Profesyonel destek için tıklayın.</Text>
                                    </View>
                                    <View style={styles.consultantBtn}>
                                        <Text allowFontScaling={false} style={styles.consultantBtnText}>Mimarınızla Görüş</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={16} color="#000" />
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>


                    </View>


                    {/* ═══ AI TADİLAT ASİSTANI ═══════════════════════════ */}
                    <TouchableOpacity
                        style={styles.aiCard}
                        onPress={() => navigation.navigate('AIRenovationAssistant')}
                        activeOpacity={0.88}
                    >
                        <LinearGradient
                            colors={['#0a0900', '#1a1400', '#0a0900']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />
                        {/* Subtle gold glow in corner */}
                        <LinearGradient
                            colors={['rgba(212,175,55,0.18)', 'transparent']}
                            style={[StyleSheet.absoluteFillObject, { borderRadius: 24 }]}
                            start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
                        />
                        <View style={styles.aiCardBorder} />

                        <View style={styles.aiCardLeft}>
                            <View style={styles.aiTagRow}>
                                <MaterialCommunityIcons name="chef-hat" size={13} color="#000" />
                                <Text allowFontScaling={false} style={styles.aiTagText}>CepteŞef AI</Text>
                            </View>
                            <Text allowFontScaling={false} style={styles.aiCardTitle}>İstediğini Bulamadın mı?</Text>
                            <Text allowFontScaling={false} style={styles.aiCardSub}>Mekanının fotoğrafını yükle ve hayalini anlat — yapay zeka teknik listeni çıkarsın.</Text>
                            <View style={styles.aiBtn}>
                                <Text allowFontScaling={false} style={styles.aiBtnText}>Şefle Konuş</Text>
                                <MaterialCommunityIcons name="arrow-right" size={14} color={GOLD_MAIN} />
                            </View>
                        </View>

                        <View style={styles.aiCardRight}>
                            {/* Animated-looking concentric rings */}
                            <View style={styles.aiRingOuter}>
                                <View style={styles.aiRingMid}>
                                    <View style={styles.aiRingInner}>
                                        <MaterialCommunityIcons name="magic-staff" size={28} color={GOLD_MAIN} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                </ScrollView>

                {/* SHOWCASE MANAGER MODAL */}
                <Modal visible={isShowcaseManagerVisible} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.managerModalContent}>
                            <View style={styles.modalHeader}>
                                <Text allowFontScaling={false} style={styles.modalTitle}>Slider Yönetimi</Text>
                                <TouchableOpacity onPress={() => setIsShowcaseManagerVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ flex: 1, padding: 16 }}>
                                {showcaseItems.map((item, idx) => (
                                    <View key={item.id || idx} style={styles.managerItem}>
                                        <Image 
                                            source={item.is_local ? item.image : { uri: item.image_url }} 
                                            style={styles.managerItemThumb} 
                                        />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text allowFontScaling={false} style={styles.managerItemTitle} numberOfLines={1}>
                                                {item.tag || 'Resimsiz'} - {item.title || 'Başlıksız'}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            <TouchableOpacity onPress={() => setEditingShowcaseItem(item)} style={styles.managerActionBtn}>
                                                <MaterialCommunityIcons name="pencil" size={18} color={GOLD_MAIN} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteShowcase(item.id)} style={styles.managerActionBtn}>
                                                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF4D4D" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}

                                <TouchableOpacity 
                                    style={styles.addSliderBtn}
                                    onPress={() => setEditingShowcaseItem({
                                        tag: 'YENİ', title: '', subtitle: '', 
                                        image_url: 'https://placehold.co/800x450/png',
                                        text_offset_x: 0, text_offset_y: 0, image_scale: 1.0,
                                        sort_order: (showcaseItems.length + 1) * 10
                                    })}
                                >
                                    <MaterialCommunityIcons name="plus" size={24} color="#000" />
                                    <Text allowFontScaling={false} style={styles.addSliderBtnText}>YENİ SLIDER EKLE</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* SHOWCASE EDIT MODAL */}
                <Modal visible={!!editingShowcaseItem} animationType="fade" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.editModalContent}>
                            <View style={styles.modalHeader}>
                                <Text allowFontScaling={false} style={styles.modalTitle}>Slider Düzenle</Text>
                                <TouchableOpacity onPress={() => setEditingShowcaseItem(null)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ flex: 1, padding: 16 }}>
                                {/* Image Preview & Picker */}
                                <TouchableOpacity style={styles.imagePickerArea} onPress={handlePickShowcaseImage}>
                                    {isUploading ? (
                                        <ActivityIndicator color={GOLD_MAIN} />
                                    ) : (
                                        <>
                                            <Image 
                                                source={editingShowcaseItem?.is_local ? editingShowcaseItem.image : { uri: editingShowcaseItem?.image_url }} 
                                                style={[StyleSheet.absoluteFill, { opacity: 0.6 }]} 
                                            />
                                            <MaterialCommunityIcons name="camera-plus" size={32} color="#FFF" />
                                            <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, marginTop: 4 }}>Resmi Değiştir</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {/* Inputs */}
                                <Text allowFontScaling={false} style={styles.inputLabel}>BANNER ETİKETİ (SARI ALAN)</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={editingShowcaseItem?.tag}
                                    onChangeText={t => setEditingShowcaseItem(prev => ({ ...prev, tag: t }))}
                                    placeholder="Örn: FIRSAT"
                                    placeholderTextColor="#666"
                                />

                                <Text allowFontScaling={false} style={styles.inputLabel}>ANA BAŞLIK</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={editingShowcaseItem?.title}
                                    onChangeText={t => setEditingShowcaseItem(prev => ({ ...prev, title: t }))}
                                    placeholder="Örn: DEV İNDİRİM"
                                    placeholderTextColor="#666"
                                />

                                <Text allowFontScaling={false} style={styles.inputLabel}>ALT BAŞLIK</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={editingShowcaseItem?.subtitle}
                                    onChangeText={t => setEditingShowcaseItem(prev => ({ ...prev, subtitle: t }))}
                                    placeholder="Detaylı açıklama..."
                                    placeholderTextColor="#666"
                                />

                                {/* Color Selectors */}
                                <Text allowFontScaling={false} style={styles.inputLabel}>ETİKET ZEMİN RENGİ</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
                                    {COLOR_PALETTE.map(c => (
                                        <TouchableOpacity 
                                            key={c.code} 
                                            style={[styles.colorChip, { backgroundColor: c.code, borderColor: editingShowcaseItem?.tag_color === c.code ? '#FFF' : 'transparent', borderWidth: 2 }]} 
                                            onPress={() => setEditingShowcaseItem(prev => ({ ...prev, tag_color: c.code }))}
                                        />
                                    ))}
                                </ScrollView>

                                <Text allowFontScaling={false} style={styles.inputLabel}>ANA BAŞLIK RENGİ</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
                                    {COLOR_PALETTE.map(c => (
                                        <TouchableOpacity 
                                            key={c.code} 
                                            style={[styles.colorChip, { backgroundColor: c.code, borderColor: editingShowcaseItem?.title_color === c.code ? '#FFF' : 'transparent', borderWidth: 2 }]} 
                                            onPress={() => setEditingShowcaseItem(prev => ({ ...prev, title_color: c.code }))}
                                        />
                                    ))}
                                </ScrollView>

                                <Text allowFontScaling={false} style={styles.inputLabel}>ALT BAŞLIK RENGİ</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
                                    {COLOR_PALETTE.map(c => (
                                        <TouchableOpacity 
                                            key={c.code} 
                                            style={[styles.colorChip, { backgroundColor: c.code, borderColor: editingShowcaseItem?.subtitle_color === c.code ? '#FFF' : 'transparent', borderWidth: 2 }]} 
                                            onPress={() => setEditingShowcaseItem(prev => ({ ...prev, subtitle_color: c.code }))}
                                        />
                                    ))}
                                </ScrollView>

                                {/* Visual Adjustments (Sliders) */}
                                <View style={styles.adjustmentGroup}>
                                    <View style={styles.adjHeader}>
                                        <Text allowFontScaling={false} style={styles.inputLabel}>GÖRSEL ÖLÇEĞİ (ZOOM)</Text>
                                        <Text style={styles.adjVal}>{(editingShowcaseItem?.image_scale || 1).toFixed(2)}x</Text>
                                    </View>
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={0.5}
                                        maximumValue={3.0}
                                        value={editingShowcaseItem?.image_scale || 1}
                                        onValueChange={v => setEditingShowcaseItem(prev => ({ ...prev, image_scale: v }))}
                                        minimumTrackTintColor={GOLD_MAIN}
                                        maximumTrackTintColor="#333"
                                        thumbTintColor={GOLD_MAIN}
                                    />

                                    <View style={styles.adjHeader}>
                                        <Text allowFontScaling={false} style={styles.inputLabel}>YAZI DİKEY KONUM (Y)</Text>
                                        <Text style={styles.adjVal}>{Math.round(editingShowcaseItem?.text_offset_y || 0)}</Text>
                                    </View>
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={-150}
                                        maximumValue={150}
                                        value={editingShowcaseItem?.text_offset_y || 0}
                                        onValueChange={v => setEditingShowcaseItem(prev => ({ ...prev, text_offset_y: v }))}
                                        minimumTrackTintColor={GOLD_MAIN}
                                        maximumTrackTintColor="#333"
                                        thumbTintColor={GOLD_MAIN}
                                    />

                                    <View style={styles.adjHeader}>
                                        <Text allowFontScaling={false} style={styles.inputLabel}>YAZI YATAY KONUM (X)</Text>
                                        <Text style={styles.adjVal}>{Math.round(editingShowcaseItem?.text_offset_x || 0)}</Text>
                                    </View>
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={-150}
                                        maximumValue={150}
                                        value={editingShowcaseItem?.text_offset_x || 0}
                                        onValueChange={v => setEditingShowcaseItem(prev => ({ ...prev, text_offset_x: v }))}
                                        minimumTrackTintColor={GOLD_MAIN}
                                        maximumTrackTintColor="#333"
                                        thumbTintColor={GOLD_MAIN}
                                    />
                                </View>

                                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveShowcase}>
                                    <Text allowFontScaling={false} style={styles.modalSaveBtnText}>DEĞİŞİKLİKLERİ KAYDET</Text>
                                </TouchableOpacity>
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { paddingBottom: 100 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
    headerTitle: { color: GOLD_MAIN, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    headerSubtitle: { color: '#fff', fontSize: 16, fontWeight: '300', marginTop: 4 },
    headerBtn: { padding: 5 },

    // Carousel
    carouselContainer: { marginBottom: 30 },
    slide: { width: width, height: 220, overflow: 'hidden' },
    slideImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    slideOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', justifyContent: 'flex-end', padding: 20 },
    tagContainer: { backgroundColor: GOLD_MAIN, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
    tagText: { color: '#000', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    slideTitle: { color: '#fff', fontSize: 28, fontWeight: '300', marginBottom: 15 },
    offerBtn: { backgroundColor: GOLD_MAIN, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5 },
    offerBtnText: { color: '#000', fontSize: 12, fontWeight: '900' },

    pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: -15, gap: 8, marginBottom: 15 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD_MAIN },

    // Grid
    sectionContainer: { paddingHorizontal: 20, marginBottom: 30, overflow: 'visible' },
    gridPage: { width: width - 40, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    servicePagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 14, gap: 8 },
    serviceDot: { width: 22, height: 4, borderRadius: 2, backgroundColor: '#333' },
    serviceDotActive: { backgroundColor: GOLD_MAIN, width: 36 },
    svcBadge: { position: 'absolute', top: 10, right: 10, borderRadius: 20, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
    svcBadgeText: { fontSize: 9, fontWeight: '900' },

    headerIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D4AF37',
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: { color: '#999', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginLeft: 0, marginBottom: 15 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '48%', height: 160, borderRadius: 20, marginBottom: 16 },

    // Premium Card Styles
    goldCardContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'rgba(30, 30, 30, 0.65)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 215, 0, 0.25)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    goldBorderGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.8 },
    cardContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 12 },

    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
    gridItemTitle: { color: '#FFF', fontSize: 14.5, fontWeight: '900', textAlign: 'center', marginTop: 12, letterSpacing: 0.5 },
    gridItemSubtitle: { color: '#aaa', fontSize: 11, textAlign: 'center', marginTop: 4, paddingHorizontal: 4, lineHeight: 15 },


    // Smart Section
    smartSection: { marginHorizontal: 20, backgroundColor: '#111', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
    smartHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    smartTitle: { color: GOLD_MAIN, fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 },
    smartDesc: { color: '#888', fontSize: 12, lineHeight: 18, marginBottom: 20 },

    // Mood Tags
    moodTagsRow: { flexDirection: 'row', gap: 8, marginBottom: 15, flexWrap: 'wrap' },
    moodTag: {
        backgroundColor: '#111',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    moodTagActive: {
        backgroundColor: GOLD_MAIN,
        borderColor: GOLD_MAIN
    },
    moodTagText: { color: '#888', fontSize: 11, fontWeight: '600' },
    moodTagTextActive: { color: '#000', fontWeight: '900' },

    inputContainer: { backgroundColor: '#000', borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 15, height: 100 },
    textInput: { flex: 1, color: '#fff', padding: 15, textAlignVertical: 'top', fontSize: 13 },

    // Photo Upload Card
    photoUploadCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#000',
        borderRadius: 16, padding: 16, marginBottom: 20,
        borderWidth: 1, borderColor: '#333', borderStyle: 'dashed'
    },
    photoIconCircle: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD_MAIN,
        alignItems: 'center', justifyContent: 'center', marginRight: 15
    },
    photoUploadTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
    photoUploadSub: { color: '#666', fontSize: 11 },

    submitBtn: { borderRadius: 16, overflow: 'hidden' },
    submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    submitText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

    // Consultant CTA (Premium Redesign)
    consultantCard: { marginTop: 20, borderRadius: 16, borderWidth: 1, borderColor: '#44403c', overflow: 'hidden' },
    consultantContent: { flexDirection: 'row', items: 'center', padding: 16, alignItems: 'center' },
    consultantIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    consultantTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    consultantSub: { color: '#a8a29e', fontSize: 11 },
    consultantBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: GOLD_MAIN, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, gap: 4 },
    consultantBtnText: { color: '#000', fontSize: 11, fontWeight: '900' },

    // AI Asistan Kartı
    aiCard: { marginHorizontal: 20, marginTop: 20, marginBottom: 10, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', flexDirection: 'row', alignItems: 'center', padding: 22, gap: 16 },
    aiCardBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(212,175,55,0.5)' },
    aiCardLeft: { flex: 1, gap: 6 },
    aiTagRow: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: GOLD_MAIN, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    aiTagText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    aiCardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', lineHeight: 22 },
    aiCardSub: { color: '#888', fontSize: 12, lineHeight: 18 },
    aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
    aiBtnText: { color: GOLD_MAIN, fontSize: 13, fontWeight: '700' },
    aiCardRight: { alignItems: 'center', justifyContent: 'center' },
    aiRingOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center', justifyContent: 'center' },
    aiRingMid: { width: 62, height: 62, borderRadius: 31, borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', alignItems: 'center', justifyContent: 'center' },
    aiRingInner: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: GOLD_MAIN, alignItems: 'center', justifyContent: 'center' },

    // Admin Controls
    adminControlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 10,
        padding: 8,
        justifyContent: 'space-between'
    },
    adminActionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    eyeBtn: {
        alignSelf: 'center',
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20
    },

    // New Showcase Styles
    heroEditShortcut: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: GOLD_MAIN,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        elevation: 5
    },
    adminSliderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden'
    },
    adminSliderBtnText: {
        color: GOLD_MAIN,
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 2
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        justifyContent: 'flex-end'
    },
    managerModalContent: {
        backgroundColor: '#111',
        height: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: '#333'
    },
    editModalContent: {
        backgroundColor: '#111',
        height: '90%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: '#333'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#222'
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold'
    },
    managerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    managerItemThumb: {
        width: 60,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#333'
    },
    managerItemTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500'
    },
    managerActionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center'
    },
    addSliderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: GOLD_MAIN,
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
        marginBottom: 30,
        gap: 8
    },
    addSliderBtnText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold'
    },
    imagePickerArea: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
        borderStyle: 'dashed'
    },
    inputLabel: {
        color: '#999',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 8
    },
    modalInput: {
        backgroundColor: '#000',
        color: '#FFF',
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 20
    },
    adjustmentGroup: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    adjHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },
    adjVal: {
        color: GOLD_MAIN,
        fontSize: 12,
        fontWeight: 'bold'
    },
    modalSaveBtn: {
        backgroundColor: GOLD_MAIN,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
    modalSaveBtnText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1
    },
    colorPalette: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingVertical: 5
    },
    colorChip: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#444'
    }
});
