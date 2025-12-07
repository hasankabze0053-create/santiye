import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/theme';

// Screens
import AiArchitectScreen from '../screens/AI/AiArchitectScreen';
import MaliyetScreen from '../screens/Cost/MaliyetScreen';
import EngineeringScreen from '../screens/Engineering/EngineeringScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import SigortaScreen from '../screens/Insurance/SigortaScreen';
import LawScreen from '../screens/Law/LawScreen';
import LogisticsScreen from '../screens/Logistics/LogisticsScreen';
import MarketScreen from '../screens/Market/MarketScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import RenovationScreen from '../screens/Renovation/RenovationScreen';
import RentalScreen from '../screens/Rental/RentalScreen';
import WorkForceScreen from '../screens/WorkForce/WorkForceScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- Tab Navigator ---
function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    height: 60,
                    paddingBottom: 8,
                    borderTopColor: '#eee'
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: 'gray',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Ana Sayfa') return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
                    if (route.name === 'Kiralama') return <MaterialCommunityIcons name="excavator" size={size} color={color} />;
                    if (route.name === 'Market') return <MaterialCommunityIcons name="store" size={size} color={color} />;
                    if (route.name === 'Profil') return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;

                    return <Ionicons name="apps" size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
            <Tab.Screen name="Kiralama" component={RentalScreen} />
            <Tab.Screen name="Market" component={MarketScreen} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// --- Main Stack (Root) ---
export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Main Tabs */}
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

            {/* Other Modules pushed on top */}
            <Stack.Screen name="Tadilat" component={RenovationScreen} options={{ headerShown: true, title: 'Tadilat & Tamirat' }} />
            <Stack.Screen name="Mühendislik" component={EngineeringScreen} options={{ headerShown: true, title: 'Mühendislik' }} />
            <Stack.Screen name="AI_Galeri" component={AiArchitectScreen} options={{ headerShown: true, title: 'Cebimdeki Mimar', headerTintColor: COLORS.primary }} />

            {/* New Modules */}
            <Stack.Screen name="Hukuk" component={LawScreen} options={{ headerShown: true, title: 'Hukuki Destek' }} />
            <Stack.Screen name="Personel" component={WorkForceScreen} options={{ headerShown: true, title: 'Personel & Usta' }} />
            <Stack.Screen name="Nakliye" component={LogisticsScreen} options={{ headerShown: true, title: 'Nakliye & Lojistik' }} />
            <Stack.Screen name="Sigorta" component={SigortaScreen} options={{ headerShown: true, title: 'Sigorta İşlemleri' }} />
            <Stack.Screen name="Maliyet" component={MaliyetScreen} options={{ headerShown: true, title: 'Yaklaşık Maliyet' }} />
        </Stack.Navigator>
    );
}
