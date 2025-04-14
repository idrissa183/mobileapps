// frontend/Clothes/screens/main/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Loader from '../../components/common/Loader';

import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

// Types pour les données
type Product = {
  id: string;
  name: string;
  price: number;
  image: any;
  rating: number;
};

type Category = {
  id: string;
  name: string;
  icon: string;
};

// Type pour la navigation
type RootStackParamList = {
  ProductDetail: { productId: string };
  Search: undefined;
  Profile: undefined;
  Categories: undefined;
};

// Données fictives pour l'exemple
const FEATURED_PRODUCTS: Product[] = [
  { id: '1', name: 'Summer Dress', price: 49.99, image: require('../../assets/placeholder.png'), rating: 4.5 },
  { id: '2', name: 'Casual Jeans', price: 39.99, image: require('../../assets/placeholder.png'), rating: 4.2 },
  { id: '3', name: 'Cotton T-Shirt', price: 19.99, image: require('../../assets/placeholder.png'), rating: 4.7 },
  { id: '4', name: 'Sports Jacket', price: 89.99, image: require('../../assets/placeholder.png'), rating: 4.0 },
];

const TRENDING_PRODUCTS: Product[] = [
  { id: '5', name: 'Leather Shoes', price: 129.99, image: require('../../assets/placeholder.png'), rating: 4.8 },
  { id: '6', name: 'Winter Coat', price: 149.99, image: require('../../assets/placeholder.png'), rating: 4.4 },
  { id: '7', name: 'Fashion Hat', price: 24.99, image: require('../../assets/placeholder.png'), rating: 4.1 },
  { id: '8', name: 'Designer Watch', price: 199.99, image: require('../../assets/placeholder.png'), rating: 4.9 },
];

const CATEGORIES: Category[] = [
  { id: '1', name: 'All', icon: 'grid-outline' },
  { id: '2', name: 'Men', icon: 'man-outline' },
  { id: '3', name: 'Women', icon: 'woman-outline' },
  { id: '4', name: 'Kids', icon: 'people-outline' },
  { id: '5', name: 'Sport', icon: 'football-outline' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      className={`mr-4 items-center ${activeCategory === item.id ? 'opacity-100' : 'opacity-60'}`}
      onPress={() => setActiveCategory(item.id)}
    >
      <View
        className={`w-14 h-14 rounded-full items-center justify-center mb-1 ${
          activeCategory === item.id 
            ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500' 
            : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}
      >
        <Ionicons
          name={item.icon as any}
          size={22}
          color={activeCategory === item.id ? 'white' : isDarkMode ? '#A3A3A3' : '#4B5563'}
        />
      </View>
      <Text
        className={`text-xs ${
          activeCategory === item.id 
            ? 'font-bold' 
            : 'font-normal'
        } ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="mr-4 w-40"
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <Image
          source={item.image}
          className="w-full h-48 rounded-t-xl"
          resizeMode="cover"
        />
        <View className="p-3">
          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Brand</Text>
          <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`} numberOfLines={1}>
            {item.name}
          </Text>
          <View className="flex-row items-center justify-between mt-1">
            <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              ${item.price}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text className={`text-xs ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.rating}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-3">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Hello, User!
              </Text>
              <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('home.title', 'home')}
              </Text>
            </View>
            <TouchableOpacity
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-outline" size={20} color={isDarkMode ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <TouchableOpacity
            className={`flex-row items-center p-3 mb-6 rounded-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={20} color={isDarkMode ? '#A3A3A3' : '#6B7280'} />
            <Text className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Search for clothes...
            </Text>
          </TouchableOpacity>
          
          {/* Categories */}
          <View className="mb-6">
            <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('home.categories', 'home')}
            </Text>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
          
          {/* Featured Products */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('home.featured', 'home')}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                <Text className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                  {t('home.seeAll', 'home')}
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={FEATURED_PRODUCTS}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
          
          {/* Trending Products */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('home.trending', 'home')}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                <Text className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                  {t('home.seeAll', 'home')}
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={TRENDING_PRODUCTS}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default HomeScreen;