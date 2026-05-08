import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import SharedRequestDetail from '../../components/SharedRequestDetail';
import { supabase } from '../../lib/supabase';
import { ConstructionService } from '../../services/ConstructionService';
import { MarketService } from '../../services/MarketService';

export default function RequestDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};
    const type = route.params?.type || request?.type;

    const [items, setItems] = useState([]);
    const [bids, setBids] = useState([]);
    const [constructionOffers, setConstructionOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setCurrentUserId(user.id);
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('is_admin')
                        .eq('id', user.id)
                        .single();
                    setIsAdmin(profile?.is_admin || false);
                }
            } catch (err) {
                console.log('Auth check error:', err.message);
            }
        };

        checkAuth();

        if (request?.id) {
            if (type !== 'construction') {
                fetchDetails();
            } else {
                fetchConstructionOffers();
            }
        }
    }, [request, type]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const { data: itemsData, error: itemsError } = await supabase
                .from('market_request_items')
                .select('*')
                .eq('request_id', request.id);

            if (itemsError) throw itemsError;
            setItems(itemsData || []);

            const { data: bidsData, error: bidsError } = await supabase
                .from('market_bids')
                .select('*, provider:profiles!provider_id(full_name)')
                .eq('request_id', request.id);

            if (bidsError) console.log("Bids fetch note:", bidsError.message);
            setBids(bidsData || []);
        } catch (error) {
            console.error('Detail fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConstructionOffers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('construction_offers')
                .select('*, profiles:profiles!contractor_id(id, full_name, company_name, avatar_url)')
                .eq('request_id', request.id)
                .neq('status', 'draft')
                .order('created_at', { ascending: false });

            if (error) {
                const { data: simpleData } = await supabase
                    .from('construction_offers')
                    .select('*')
                    .eq('request_id', request.id)
                    .neq('status', 'draft')
                    .order('created_at', { ascending: false });
                setConstructionOffers(simpleData || []);
            } else {
                setConstructionOffers(data || []);
            }
        } catch (error) {
            console.error('Construction offers fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = () => {
        Alert.alert(
            'Talebi Sil',
            'Bu talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        let result;
                        if (type === 'construction') {
                            result = await ConstructionService.deleteRequest(request.id);
                        } else if (type === 'elevator') {
                            const { ElevatorService } = require('../../services/ElevatorService');
                            result = await ElevatorService.deleteRequest(request.id);
                        } else {
                            result = await MarketService.deleteRequest(request.id);
                        }
                        
                        setLoading(false);
                        if (result.success) {
                            Alert.alert('Başarılı', 'Talep başarıyla silindi.', [
                                { text: 'Tamam', onPress: () => navigation.goBack() }
                            ]);
                        } else {
                            Alert.alert('Hata', 'Silme işlemi başarısız oldu: ' + result.error?.message);
                        }
                    }
                }
            ]
        );
    };

    const isOwner = currentUserId && request?.user_id === currentUserId;

    return (
        <SharedRequestDetail
            request={request}
            type={type}
            items={items}
            bids={bids}
            constructionOffers={constructionOffers}
            loading={loading}
            isAdmin={isAdmin}
            isOwner={isOwner}
            navigation={navigation}
            onDelete={handleDeleteRequest}
        />
    );
}

const styles = StyleSheet.create({});
