import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import CartScreen from '../screens/main/CartScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import CategoriesScreen from '../screens/main/CategoriesScreen';

import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';

// Définir les types pour les navigateurs
type TabParamList = {
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Favorites: undefined;
  Profile: undefined;
};

// Créer les navigateurs
const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator();

// Stack navigator pour chaque onglet
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Categories" component={CategoriesScreen} />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CartMain" component={CartScreen} />
  </Stack.Navigator>
);

const FavoritesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FavoritesMain" component={FavoritesScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

// Ajout du ProfileStack manquant
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const MainNavigator: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: RouteProp<TabParamList, keyof TabParamList> }) => {
        return {
          headerShown: false,
          tabBarActiveTintColor: isDarkMode ? '#60A5FA' : '#3B82F6',
          tabBarInactiveTintColor: isDarkMode ? '#9CA3AF' : '#6B7280',
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            borderTopColor: isDarkMode ? '#374151' : '#E5E7EB',
            height: Platform.OS === 'ios' ? 90 : 60,
            paddingBottom: Platform.OS === 'ios' ? 25 : 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
            let iconName: string = '';
            
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Cart') {
              iconName = focused ? 'cart' : 'cart-outline';
            } else if (route.name === 'Favorites') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
        } as BottomTabNavigationOptions;
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ tabBarLabel: t('home.title', 'home') }} 
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStack} 
        options={{ tabBarLabel: 'Search' }} 
      />
      <Tab.Screen 
        name="Cart" 
        component={CartStack} 
        options={{ tabBarLabel: 'Cart' }} 
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesStack} 
        options={{ tabBarLabel: 'Favorites' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ tabBarLabel: 'Profile' }} 
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;