import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/theme';

// Screens
import AiArchitectScreen from '../screens/AI/AiArchitectScreen';
import DetailedCostScreen from '../screens/Cost/DetailedCostScreen';
import MaliyetScreen from '../screens/Cost/MaliyetScreen';
import PosCostScreen from '../screens/Cost/PosCostScreen';
import SimpleCostScreen from '../screens/Cost/SimpleCostScreen';
import EngineeringScreen from '../screens/Engineering/EngineeringScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import SigortaScreen from '../screens/Insurance/SigortaScreen';
import LawScreen from '../screens/Law/LawScreen';
import LogisticsScreen from '../screens/Logistics/LogisticsScreen';
import MarketScreen from '../screens/Market/MarketScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import RenovationScreen from '../screens/Renovation/RenovationScreen';
import RentalScreen from '../screens/Rental/RentalScreen';

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

            {/* Other Modules pushed on top */}
            <Stack.Screen name="Tadilat" component={RenovationScreen} options={{ headerShown: true, title: 'Tadilat & Tamirat' }} />
            <Stack.Screen name="Mühendislik" component={EngineeringScreen} options={{ headerShown: true, title: 'Mühendislik' }} />
            <Stack.Screen name="AI_Galeri" component={AiArchitectScreen} options={{ headerShown: true, title: 'Cebimdeki Mimar', headerTintColor: COLORS.primary }} />

            {/* New Modules */}
            <Stack.Screen name="Hukuk" component={LawScreen} options={{ headerShown: true, title: 'Hukuki Destek' }} />
            <Stack.Screen name="Nakliye" component={LogisticsScreen} options={{ headerShown: true, title: 'Nakliye & Lojistik' }} />
            <Stack.Screen name="Sigorta" component={SigortaScreen} options={{ headerShown: true, title: 'Sigorta İşlemleri' }} />
            <Stack.Screen name="Maliyet" component={MaliyetScreen} options={{ headerShown: true, title: 'Yaklaşık Maliyet' }} />
            <Stack.Screen name="SimpleCost" component={SimpleCostScreen} options={{ headerShown: true, title: 'Hızlı Hesaplama' }} />
            <Stack.Screen name="DetailedCost" component={DetailedCostScreen} options={{ headerShown: true, title: 'Detaylı Maliyet' }} />
            <Stack.Screen name="PosCost" component={PosCostScreen} options={{ headerShown: true, title: 'Poz No Hesap' }} />
        </Stack.Navigator>
    );
}
