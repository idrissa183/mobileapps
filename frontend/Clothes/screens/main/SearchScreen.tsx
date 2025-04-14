// frontend/Clothes/screens/main/SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Loader from '../../components/common/Loader';

import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

// Définition des types
type SearchResult = {
  id: string;
  name: string;
  price: number;
  image: any;
  rating: number;
  brand: string;
};

type Filter = {
  id: string;
  label: string;
};

type RootStackParamList = {
  ProductDetail: { productId: string };
};

// Données fictives pour l'exemple
const SEARCH_RESULTS: SearchResult[] = [
  { id: '1', name: 'Summer Dress', price: 49.99, image: require('../../assets/placeholder.png'), rating: 4.5, brand: 'Fashion Brand' },
  { id: '2', name: 'Casual Jeans', price: 39.99, image: require('../../assets/placeholder.png'), rating: 4.2, brand: 'Denim Co.' },
  { id: '3', name: 'Cotton T-Shirt', price: 19.99, image: require('../../assets/placeholder.png'), rating: 4.7, brand: 'Basic Wear' },
  { id: '4', name: 'Sports Jacket', price: 89.99, image: require('../../assets/placeholder.png'), rating: 4.0, brand: 'Active Gear' },
  { id: '5', name: 'Leather Shoes', price: 129.99, image: require('../../assets/placeholder.png'), rating: 4.8, brand: 'Footwear Plus' },
  { id: '6', name: 'Winter Coat', price: 149.99, image: require('../../assets/placeholder.png'), rating: 4.4, brand: 'Winter Collection' },
];

const FILTERS: Filter[] = [
  { id: 'price', label: 'Price' },
  { id: 'brand', label: 'Brand' },
  { id: 'size', label: 'Size' },
  { id: 'color', label: 'Color' },
  { id: 'rating', label: 'Rating' },
];

const RECENT_SEARCHES = [
  'Summer dress',
  'Jeans',
  'Sneakers',
  'Cotton shirt',
];

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  useEffect(() => {
    // Fonction fictive pour simuler une recherche
    const performSearch = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        setIsSearching(true);
        // Simuler un délai de chargement
        setTimeout(() => {
          setSearchResults(SEARCH_RESULTS.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.brand.toLowerCase().includes(searchQuery.toLowerCase())
          ));
          setIsSearching(false);
        }, 500);
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(performSearch);
  }, [searchQuery]);
  
  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      setActiveFilters(activeFilters.filter(id => id !== filterId));
    } else {
      setActiveFilters([...activeFilters, filterId]);
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      className="mb-4"
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View className={`flex-row ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden`}>
        <Image
          source={item.image}
          className="w-24 h-24"
          resizeMode="cover"
        />
        <View className="flex-1 p-3 justify-between">
          <View>
            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.brand}</Text>
            <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
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
  
  const renderFilterItem = ({ item }: { item: Filter }) => (
    <TouchableOpacity
      className={`mr-3 px-4 py-2 rounded-full ${
        activeFilters.includes(item.id)
          ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
          : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`}
      onPress={() => toggleFilter(item.id)}
    >
      <Text className={`${
        activeFilters.includes(item.id)
          ? 'text-white'
          : isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-4 py-3">
        {/* Search Header */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            className="mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? 'white' : 'black'} />
          </TouchableOpacity>
          <View 
            className={`flex-1 flex-row items-center px-4 py-2 rounded-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            <Ionicons name="search" size={20} color={isDarkMode ? '#A3A3A3' : '#6B7280'} />
            <TextInput
              className={`flex-1 ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              placeholder="Search for clothes..."
              placeholderTextColor={isDarkMode ? '#A3A3A3' : '#6B7280'}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#A3A3A3' : '#6B7280'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Filters */}
        <View className="mb-4">
          <FlatList
            data={FILTERS}
            renderItem={renderFilterItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        
        {isSearching ? (
          <Loader />
        ) : searchQuery.length > 0 ? (
          searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="search-outline" size={60} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
              <Text className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No results found for "{searchQuery}"
              </Text>
            </View>
          )
        ) : (
          <View className="flex-1">
            <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Searches
            </Text>
            {RECENT_SEARCHES.map((search, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center py-3"
                onPress={() => handleRecentSearch(search)}
              >
                <Ionicons name="time-outline" size={20} color={isDarkMode ? '#A3A3A3' : '#6B7280'} />
                <Text className={`ml-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {search}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaWrapper>
  );
};

export default SearchScreen;