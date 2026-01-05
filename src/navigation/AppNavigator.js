import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import AiArchitectScreen from '../screens/AI/AiArchitectScreen';
import ConstructionOfferScreen from '../screens/Cost/ConstructionOfferScreen'; // New Import
import ConstructionSuccessScreen from '../screens/Cost/ConstructionSuccessScreen'; // Success Screen
import DetailedCostScreen from '../screens/Cost/DetailedCostScreen';
import MaliyetScreen from '../screens/Cost/MaliyetScreen';
import PosCostScreen from '../screens/Cost/PosCostScreen';
import ProjectIdentityScreen from '../screens/Cost/ProjectIdentityScreen';
import SimpleCostScreen from '../screens/Cost/SimpleCostScreen';
import SmartSketchScreen from '../screens/Cost/SmartSketchScreen';
import EngineeringScreen from '../screens/Engineering/EngineeringScreen';
import OnlineDiscoveryScreen from '../screens/Engineering/OnlineDiscoveryScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import LawScreen from '../screens/Law/LawScreen';
import LawyerDashboardScreen from '../screens/Law/LawyerDashboardScreen';
import CarrierDashboardScreen from '../screens/Logistics/CarrierDashboardScreen';
import CreateTransportScreen from '../screens/Logistics/CreateTransportScreen';
import EmptyReturnScreen from '../screens/Logistics/EmptyReturnScreen';
import LogisticsScreen from '../screens/Logistics/LogisticsScreen';
import TransportModeSelectionScreen from '../screens/Logistics/TransportModeSelectionScreen';
import BulkRequestScreen from '../screens/Market/BulkRequestScreen';
import MarketScreen from '../screens/Market/MarketScreen';
import MarketSuccessScreen from '../screens/Market/MarketSuccessScreen';
import SellerDashboardScreen from '../screens/Market/SellerDashboardScreen';
import SellerStoreScreen from '../screens/Market/SellerStoreScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import CustomRequestScreen from '../screens/Renovation/CustomRequestScreen';
import RenovationProjectSelectionScreen from '../screens/Renovation/RenovationProjectSelectionScreen';
import RenovationScreen from '../screens/Renovation/RenovationScreen';
import RenovationSuccessScreen from '../screens/Renovation/RenovationSuccessScreen';
import StyleSelectionScreen from '../screens/Renovation/StyleSelectionScreen';
import CorporateDashboardScreen from '../screens/Rental/CorporateDashboardScreen';
import ProjectProposalScreen from '../screens/Rental/ProjectProposalScreen';
import RentalProposalScreen from '../screens/Rental/RentalProposalScreen';
import RentalScreen from '../screens/Rental/RentalScreen';
import UrbanTransformationScreen from '../screens/Transformation/UrbanTransformationScreen';

// Provider Screens
import ProviderDashboardScreen from '../screens/Provider/ProviderDashboardScreen';
import ProviderWizardScreen from '../screens/Provider/ProviderWizardScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import FloatingTabBar from '../components/FloatingTabBar';

// ... (Imports remain same)

// --- Tab Navigator ---
function BottomTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={props => <FloatingTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: { position: 'absolute' }, // Required for transparency
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
            <Tab.Screen name="Kiralama" component={RentalScreen} />
            <Tab.Screen name="Market" component={MarketScreen} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

import CustomSplashScreen from '../screens/Splash/CustomSplashScreen';

// --- Main Stack (Root) ---
export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
            <Stack.Screen name="Splash" component={CustomSplashScreen} />
            {/* Main Tabs */}
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

            {/* Stack Versions of Tab Screens (For Dashboard Navigation) */}
            <Stack.Screen name="RentalStack" component={RentalScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MarketStack" component={MarketScreen} options={{ headerShown: false }} />
            <Stack.Screen name="BulkRequest" component={BulkRequestScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MarketSuccess" component={MarketSuccessScreen} options={{ headerShown: false }} />

            {/* Other Modules pushed on top */}
            <Stack.Screen name="Tadilat" component={RenovationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RenovationProjectSelection" component={RenovationProjectSelectionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="StyleSelection" component={StyleSelectionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CustomRequest" component={CustomRequestScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RenovationSuccess" component={RenovationSuccessScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Mühendislik" component={EngineeringScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AI_Galeri" component={AiArchitectScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OnlineDiscovery" component={OnlineDiscoveryScreen} options={{ headerShown: false }} />

            {/* New Modules */}
            <Stack.Screen name="Hukuk" component={LawScreen} options={{ headerShown: false, title: 'Hukuki Destek' }} />
            <Stack.Screen name="CreateTransport" component={CreateTransportScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TransportSelection" component={TransportModeSelectionScreen} options={{ headerShown: false, presentation: 'transparentModal' }} />
            <Stack.Screen name="Nakliye" component={LogisticsScreen} options={{ headerShown: false, title: 'Nakliye & Lojistik' }} />
            <Stack.Screen name="EmptyReturnOpportunities" component={EmptyReturnScreen} options={{ headerShown: false }} />
            <Stack.Screen name="KentselDonusum" component={UrbanTransformationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Maliyet" component={MaliyetScreen} options={{ headerShown: false, title: 'Yaklaşık Maliyet' }} />
            <Stack.Screen name="SimpleCost" component={SimpleCostScreen} options={{ headerShown: false, title: 'Hızlı Hesaplama' }} />
            <Stack.Screen name="ProjectIdentity" component={ProjectIdentityScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SmartSketch" component={SmartSketchScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DetailedCost" component={DetailedCostScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ConstructionOffer" component={ConstructionOfferScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ConstructionSuccess" component={ConstructionSuccessScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PosCost" component={PosCostScreen} options={{ headerShown: false, title: 'Poz No Hesap' }} />
            <Stack.Screen name="ProjectProposal" component={ProjectProposalScreen} options={{ headerShown: false }} />
            {/* New Smart Wizard */}
            <Stack.Screen name="RentalProposal" component={RentalProposalScreen} options={{ headerShown: false }} />

            {/* Provider Flow */}
            <Stack.Screen name="ProviderWizard" component={ProviderWizardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SellerStore" component={SellerStoreScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CorporateDashboard" component={CorporateDashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LawyerDashboard" component={LawyerDashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CarrierDashboard" component={CarrierDashboardScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
