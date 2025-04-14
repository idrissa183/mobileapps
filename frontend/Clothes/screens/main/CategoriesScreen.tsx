// frontend/Clothes/screens/main/CategoriesScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ScrollView 
} from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

// Définition des types
type Category = {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
};

type Subcategory = {
  id: string;
  name: string;
  count: number;
};

// Définition du type pour la navigation
type RootStackParamList = {
  Search: { categoryId?: string; subcategoryId?: string; query?: string };
};

// Données fictives pour l'exemple
const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Women',
    icon: 'woman-outline',
    subcategories: [
      { id: '101', name: 'Dresses', count: 124 },
      { id: '102', name: 'Tops', count: 98 },
      { id: '103', name: 'Bottoms', count: 76 },
      { id: '104', name: 'Outerwear', count: 45 },
      { id: '105', name: 'Activewear', count: 33 },
    ]
  },
  {
    id: '2',
    name: 'Men',
    icon: 'man-outline',
    subcategories: [
      { id: '201', name: 'Shirts', count: 87 },
      { id: '202', name: 'T-shirts', count: 112 },
      { id: '203', name: 'Pants', count: 64 },
      { id: '204', name: 'Outerwear', count: 38 },
      { id: '205', name: 'Activewear', count: 29 },
    ]
  },
  {
    id: '3',
    name: 'Kids',
    icon: 'people-outline',
    subcategories: [
      { id: '301', name: 'Girls', count: 93 },
      { id: '302', name: 'Boys', count: 86 },
      { id: '303', name: 'Babies', count: 47 },
    ]
  },
  {
    id: '4',
    name: 'Accessories',
    icon: 'briefcase-outline',
    subcategories: [
      { id: '401', name: 'Bags', count: 56 },
      { id: '402', name: 'Jewelry', count: 78 },
      { id: '403', name: 'Hats & Scarves', count: 42 },
      { id: '404', name: 'Belts', count: 31 },
    ]
  },
  {
    id: '5',
    name: 'Footwear',
    icon: 'footsteps-outline',
    subcategories: [
      { id: '501', name: 'Women\'s Shoes', count: 67 },
      { id: '502', name: 'Men\'s Shoes', count: 59 },
      { id: '503', name: 'Kids\' Shoes', count: 38 },
      { id: '504', name: 'Athletic Shoes', count: 47 },
    ]
  },
];

const POPULAR_SEARCHES = [
  'Summer Dress',
  'Casual T-shirt',
  'Running Shoes',
  'Leather Jacket',
  'Jeans',
  'Backpack',
];

const CategoriesScreen: React.FC = () => {
  // Utilisation du type correct pour la navigation
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  
  const handleCategoryPress = (category: Category) => {
    setActiveCategory(category);
  };
  
  const handleSubcategoryPress = (subcategory: Subcategory) => {
    // Dans une application réelle, naviguez vers l'écran des produits avec filtre
    navigation.navigate('Search', { 
      categoryId: activeCategory.id, 
      subcategoryId: subcategory.id 
    });
  };
  
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      className={`py-3 px-4 ${
        activeCategory.id === item.id
          ? isDarkMode ? 'bg-gray-800' : 'bg-white'
          : 'bg-transparent'
      }`}
      onPress={() => handleCategoryPress(item)}
    >
      <View className="flex-row items-center">
        <Ionicons 
          name={item.icon as any} 
          size={22} 
          color={
            activeCategory.id === item.id
              ? isDarkMode ? '#60A5FA' : '#3B82F6'
              : isDarkMode ? '#9CA3AF' : '#6B7280'
          } 
        />
        <Text 
          className={`ml-2 ${
            activeCategory.id === item.id
              ? isDarkMode 
                ? 'text-white font-medium' 
                : 'text-gray-900 font-medium'
              : isDarkMode 
                ? 'text-gray-400' 
                : 'text-gray-500'
          }`}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderSubcategoryItem = ({ item }: { item: Subcategory }) => (
    <TouchableOpacity
      className={`py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      onPress={() => handleSubcategoryPress(item)}
    >
      <View className="flex-row justify-between items-center">
        <Text className={isDarkMode ? 'text-white' : 'text-gray-800'}>
          {item.name}
        </Text>
        <View className="flex-row items-center">
          <Text className={`mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {item.count}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaWrapper>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
          <TouchableOpacity
            className="mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? 'white' : 'black'} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Categories
          </Text>
        </View>
        
        <View className="flex-row flex-1">
          {/* Categories Sidebar */}
          <View className={`w-1/3 border-r ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
          
          {/* Subcategories and Content */}
          <View className="flex-1">
            <ScrollView className="flex-1 p-4">
              <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeCategory.name}
              </Text>
              
              {/* Subcategories */}
              <View className="mb-6">
                {activeCategory.subcategories.map((subcategory) => (
                  <TouchableOpacity
                    key={subcategory.id}
                    className={`py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    onPress={() => handleSubcategoryPress(subcategory)}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                        {subcategory.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className={`mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {subcategory.count}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Popular Searches */}
              <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Popular Searches
              </Text>
              <View className="flex-row flex-wrap">
                {POPULAR_SEARCHES.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`m-1 px-3 py-2 rounded-full ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                    onPress={() => navigation.navigate('Search', { query: search })}
                  >
                    <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {search}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default CategoriesScreen;