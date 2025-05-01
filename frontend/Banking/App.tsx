import { StatusBar } from 'expo-status-bar';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import "./global.css"
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

// Components
import CustomTabBar from './components/common/CustomTabBar';

// Providers
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';


// Main App Screens
import HomeScreen from './screens/home/HomeScreen';
import CardsScreen from './screens/cards/CardsScreen';
import HistoryScreen from './screens/history/HistoryScreen';
import ContactScreen from './screens/contact/ContactScreen';
import SettingsScreen from './screens/settings/SettingsScreen';
import ProfileScreen from './screens/profile/ProfileScreen';

// Auth Screens
import SignInScreen from './screens/auth/SignInScreen';
import SignUpScreen from './screens/auth/SignUpScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from './screens/auth/OTPVerificationScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuth from './hooks/useAuth';

// Types
export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string; mode: string };
  Terms: undefined;
  PrivacyPolicy: undefined;
  MainApp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Cards: undefined;
  Contact: undefined;
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainAppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cards" component={CardsScreen} />
      <Tab.Screen name="Contact" component={ContactScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainApp" component={MainAppTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} /></>
        )}
        {/* <Stack.Screen name="MainApp" component={MainAppTabs} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <StatusBar style="auto" />
            <Navigation />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
