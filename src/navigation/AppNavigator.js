import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, useColorScheme } from 'react-native';
import RequestDetailScreen from '../screens/Market/RequestDetailScreen';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import MarketScreen from '../screens/Market/MarketScreen';
import AccountSettingsScreen from '../screens/Profile/AccountSettingsScreen';
import ContactUsScreen from '../screens/Profile/ContactUsScreen';
import HelpCenterScreen from '../screens/Profile/HelpCenterScreen';
import NotificationSettingsScreen from '../screens/Profile/NotificationSettingsScreen';
import { InboxScreen, RequestsScreen } from '../screens/Profile/OperationsScreens';
import PrivacySecurityScreen from '../screens/Profile/PrivacySecurityScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import RentalScreen from '../screens/Rental/RentalScreen';

// Secondary Screens (Stack)
import AiArchitectScreen from '../screens/AI/AiArchitectScreen';
import AuthScreen from '../screens/Auth/AuthScreen'; // Import Authentication Screen
import CompanyRegistrationScreen from '../screens/Auth/CompanyRegistrationScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import ConstructionOfferScreen from '../screens/Cost/ConstructionOfferScreen';
import ConstructionSuccessScreen from '../screens/Cost/ConstructionSuccessScreen';
import DetailedCostScreen from '../screens/Cost/DetailedCostScreen';
import MaliyetScreen from '../screens/Cost/MaliyetScreen';
import PosCostScreen from '../screens/Cost/PosCostScreen';
import ProjectIdentityScreen from '../screens/Cost/ProjectIdentityScreen';
import SimpleCostScreen from '../screens/Cost/SimpleCostScreen';
import SmartSketchScreen from '../screens/Cost/SmartSketchScreen';
import EngineeringScreen from '../screens/Engineering/EngineeringScreen';
import OnlineDiscoveryScreen from '../screens/Engineering/OnlineDiscoveryScreen';
import LawScreen from '../screens/Law/LawScreen';
import LawSuccessScreen from '../screens/Law/LawSuccessScreen';
import LawyerDashboardScreen from '../screens/Law/LawyerDashboardScreen';
import CarrierDashboardScreen from '../screens/Logistics/CarrierDashboardScreen';
import CreateTransportScreen from '../screens/Logistics/CreateTransportScreen';
import EmptyReturnCheckoutScreen from '../screens/Logistics/EmptyReturnCheckoutScreen';
import EmptyReturnDetailScreen from '../screens/Logistics/EmptyReturnDetailScreen';
import EmptyReturnScreen from '../screens/Logistics/EmptyReturnScreen';
import EmptyReturnSuccessScreen from '../screens/Logistics/EmptyReturnSuccessScreen';
import LogisticsScreen from '../screens/Logistics/LogisticsScreen';
import TransportModeSelectionScreen from '../screens/Logistics/TransportModeSelectionScreen';
import BulkRequestScreen from '../screens/Market/BulkRequestScreen';
import MarketRequestScreen from '../screens/Market/MarketRequestScreen';
import MarketSuccessScreen from '../screens/Market/MarketSuccessScreen';
import SellerDashboardScreen from '../screens/Market/SellerDashboardScreen';
import SellerStoreScreen from '../screens/Market/SellerStoreScreen';
import ContractorProviderScreen from '../screens/Provider/ContractorProviderScreen';
import LawProviderScreen from '../screens/Provider/LawProviderScreen';
import LogisticsProviderScreen from '../screens/Provider/LogisticsProviderScreen';
import MachineryProviderScreen from '../screens/Provider/MachineryProviderScreen';
import MarketProviderScreen from '../screens/Provider/MarketProviderScreen';
import ProviderDashboardScreen from '../screens/Provider/ProviderDashboardScreen';
import RenovationProviderScreen from '../screens/Provider/RenovationProviderScreen';
import TechnicalProviderScreen from '../screens/Provider/TechnicalProviderScreen';
import CustomRequestScreen from '../screens/Renovation/CustomRequestScreen';
import RenovationProjectSelectionScreen from '../screens/Renovation/RenovationProjectSelectionScreen';
import RenovationScreen from '../screens/Renovation/RenovationScreen';
import RenovationSuccessScreen from '../screens/Renovation/RenovationSuccessScreen';
import StyleSelectionScreen from '../screens/Renovation/StyleSelectionScreen';
import ProjectProposalScreen from '../screens/Rental/ProjectProposalScreen';
import RentalProposalScreen from '../screens/Rental/RentalProposalScreen';
import CustomSplashScreen from '../screens/Splash/CustomSplashScreen';
import UrbanTransformationScreen from '../screens/Transformation/UrbanTransformationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator(); // Separate Stack for Profile Tab

import { useAuth } from '../context/AuthContext';

// Profile Stack Navigator (Auth -> Profile Flow)
function ProfileStackNavigator() {
    const { user } = useAuth();

    return (
        <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <>
                    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
                    <ProfileStack.Screen name="AccountSettings" component={AccountSettingsScreen} />
                    <ProfileStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
                    <ProfileStack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                    <ProfileStack.Screen name="HelpCenter" component={HelpCenterScreen} />
                    <ProfileStack.Screen name="ContactUs" component={ContactUsScreen} />
                </>
            ) : (
                <ProfileStack.Screen name="Auth" component={AuthScreen} />
            )}
        </ProfileStack.Navigator>
    );
}

// Force Refresh Comment

// --- PREMIUM BOTTOM TAB NAVIGATOR ---
import { useEffect, useState } from 'react';
import { MarketService } from '../services/MarketService';

// ... (existing imports)

// --- PREMIUM BOTTOM TAB NAVIGATOR ---
function BottomTabNavigator() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark' || true; // Force Dark Mode for now context or remove true
    const { user } = useAuth(); // Get user to trigger refetch on login

    const [requestCount, setRequestCount] = useState(0);
    const [inboxCount, setInboxCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchCounts();
        } else {
            setRequestCount(0);
            setInboxCount(0);
        }
    }, [user]);

    const fetchCounts = async () => {
        try {
            // 1. Fetch Request Count
            const requests = await MarketService.getUserRequests();
            if (requests) setRequestCount(requests.length);

            // 2. Fetch Inbox/Offer Count
            const offers = await MarketService.getIncomingOffers();
            if (offers) setInboxCount(offers.length);
        } catch (error) {
            console.log("Badge fetch error:", error);
        }
    };

    // Theme Colors
    const theme = {
        barBg: isDarkMode ? '#000000' : '#FFFFFF',
        active: isDarkMode ? '#FDCB58' : '#121212',
        inactive: isDarkMode ? '#636366' : '#8E8E93',
        border: isDarkMode ? '#1C1C1E' : '#E5E5EA',
    };

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.barBg,
                    borderTopColor: theme.border,
                    borderTopWidth: 0.5,
                    height: Platform.OS === 'ios' ? 95 : 70, // Taller premium look
                    paddingTop: 10,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                },
                tabBarActiveTintColor: theme.active,
                tabBarInactiveTintColor: theme.inactive,
            }}
        >
            {/* 1. ANA SAYFA */}
            <Tab.Screen
                name="Ana Sayfa"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "home-variant" : "home-variant-outline"}
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />

            {/* 2. TALEPLERİM */}
            <Tab.Screen
                name="Requests"
                component={RequestsScreen}
                options={{
                    tabBarLabel: 'Taleplerim',
                    tabBarBadge: requestCount > 0 ? requestCount : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: '#FDCB58', // Gold for requests
                        color: 'black',
                        fontSize: 10,
                        fontWeight: 'bold',
                    },
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "clipboard-list" : "clipboard-list-outline"}
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />

            {/* 3. GELEN KUTUSU */}
            <Tab.Screen
                name="Inbox"
                component={InboxScreen}
                options={{
                    tabBarLabel: 'Gelen Kutusu',
                    tabBarBadge: inboxCount > 0 ? inboxCount : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: '#FF3B30', // Red for alerts
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 'bold',
                    },
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "message-text" : "message-text-outline"}
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />

            {/* 4. PROFİL */}
            <Tab.Screen
                name="Profil"
                component={ProfileStackNavigator}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "account" : "account-outline"}
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// --- MAIN STACK NAVIGATOR ---
export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
            {/* Splash */}
            <Stack.Screen name="Splash" component={CustomSplashScreen} />

            {/* Main Tabs */}
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

            {/* --- Modules & Detail Screens --- */}

            {/* Rental & Market (Stacks for nested nav if needed) */}
            <Stack.Screen name="RentalStack" component={RentalScreen} />
            <Stack.Screen name="MarketStack" component={MarketScreen} />
            <Stack.Screen name="BulkRequest" component={BulkRequestScreen} />
            <Stack.Screen name="MarketRequest" component={MarketRequestScreen} />
            <Stack.Screen name="MarketSuccess" component={MarketSuccessScreen} />

            {/* Renovation */}
            <Stack.Screen name="Tadilat" component={RenovationScreen} />
            <Stack.Screen name="RenovationProjectSelection" component={RenovationProjectSelectionScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="StyleSelection" component={StyleSelectionScreen} />
            <Stack.Screen name="CustomRequest" component={CustomRequestScreen} />
            <Stack.Screen name="RenovationSuccess" component={RenovationSuccessScreen} />

            {/* Engineering & AI */}
            <Stack.Screen name="Mühendislik" component={EngineeringScreen} />
            <Stack.Screen name="OnlineDiscovery" component={OnlineDiscoveryScreen} />
            <Stack.Screen name="AI_Galeri" component={AiArchitectScreen} />

            {/* Law */}
            <Stack.Screen name="Hukuk" component={LawScreen} options={{ title: 'Hukuki Destek' }} />
            <Stack.Screen name="LawSuccess" component={LawSuccessScreen} />

            {/* Logistics */}
            <Stack.Screen name="Nakliye" component={LogisticsScreen} options={{ title: 'Nakliye & Lojistik' }} />
            <Stack.Screen name="CreateTransport" component={CreateTransportScreen} />
            <Stack.Screen name="TransportSelection" component={TransportModeSelectionScreen} options={{ presentation: 'transparentModal' }} />
            <Stack.Screen name="EmptyReturnOpportunities" component={EmptyReturnScreen} />
            <Stack.Screen name="EmptyReturnDetail" component={EmptyReturnDetailScreen} />
            <Stack.Screen name="EmptyReturnCheckout" component={EmptyReturnCheckoutScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="EmptyReturnSuccess" component={EmptyReturnSuccessScreen} />

            {/* Cost & Projects */}
            <Stack.Screen name="Maliyet" component={MaliyetScreen} options={{ title: 'Yaklaşık Maliyet' }} />
            <Stack.Screen name="SimpleCost" component={SimpleCostScreen} options={{ title: 'Hızlı Hesaplama' }} />
            <Stack.Screen name="ProjectIdentity" component={ProjectIdentityScreen} />
            <Stack.Screen name="SmartSketch" component={SmartSketchScreen} />
            <Stack.Screen name="DetailedCost" component={DetailedCostScreen} />
            <Stack.Screen name="ConstructionOffer" component={ConstructionOfferScreen} />
            <Stack.Screen name="ConstructionSuccess" component={ConstructionSuccessScreen} />
            <Stack.Screen name="PosCost" component={PosCostScreen} options={{ title: 'Poz No Hesap' }} />

            {/* Transformation & Proposals */}
            <Stack.Screen name="KentselDonusum" component={UrbanTransformationScreen} />
            <Stack.Screen name="ProjectProposal" component={ProjectProposalScreen} />
            <Stack.Screen name="RentalProposal" component={RentalProposalScreen} />

            <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
            <Stack.Screen name="SellerStore" component={SellerStoreScreen} />
            <Stack.Screen name="LawyerDashboard" component={LawyerDashboardScreen} />
            <Stack.Screen name="CarrierDashboard" component={CarrierDashboardScreen} />
            <Stack.Screen name="MarketProvider" component={MarketProviderScreen} />
            <Stack.Screen name="MachineryProvider" component={MachineryProviderScreen} />
            <Stack.Screen name="RenovationProvider" component={RenovationProviderScreen} />
            <Stack.Screen name="LogisticsProvider" component={LogisticsProviderScreen} />
            <Stack.Screen name="ContractorProvider" component={ContractorProviderScreen} />
            <Stack.Screen name="LawProvider" component={LawProviderScreen} />
            <Stack.Screen name="TechnicalProvider" component={TechnicalProviderScreen} />

            {/* Authentication & Onboarding (Root Level) */}
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="CompanyRegistration" component={CompanyRegistrationScreen} />

            <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
        </Stack.Navigator>
    );
}
