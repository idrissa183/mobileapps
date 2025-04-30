import { StatusBar } from 'expo-status-bar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import "./global.css"
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer} from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import CustomTabBar from './components/common/CustomTabBar';
import { ThemeProvider } from './context/ThemeContext';
import HomeScreen from './screens/home/HomeScreen';
import CardsScreen from './screens/cards/CardsScreen';
import HistoryScreen from './screens/history/HistoryScreen';
import ContactScreen from './screens/contact/ContactScreen';
import SettingsScreen from './screens/settings/SettingsScreen';


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <StatusBar style="auto" />
              <Tab.Navigator
                screenOptions={{
                  headerShown: false,
                }}
                tabBar={props => <CustomTabBar {...props} />}
              >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Cards" component={CardsScreen} />
                <Tab.Screen name="Contact" component={ContactScreen} />
                <Tab.Screen name="History" component={HistoryScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
              </Tab.Navigator>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
