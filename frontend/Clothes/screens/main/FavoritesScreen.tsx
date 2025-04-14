// frontend/Clothes/screens/main/FavoritesScreen.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Button from '../../components/common/Button';

import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

// Définition des types
type FavoriteItem = {
  id: string;
  name: string;
  price: number;
  image: any;
  brand: string;
  rating: number;
};

type RootStackParamList = {
  ProductDetail: { productId: string };
  Home: undefined;
};

// Données fictives pour l'exemple
const FAVORITE_ITEMS: FavoriteItem[] = [
  { 
    id: '1', 
    name: 'Summer Dress', 
    price: 49.99, 
    image: require('../../assets/placeholder.png'), 
    brand: 'Fashion Brand',
    rating: 4.5 
  },
  { 
    id: '5', 
    name: 'Leather Shoes', 
    price: 129.99, 
    image: require('../../assets/placeholder.png'), 
    brand: 'Footwear Plus',
    rating: 4.8 
  },
  { 
    id: '7', 
    name: 'Fashion Hat', 
    price: 24.99, 
    image: require('../../assets/placeholder.png'), 
    brand: 'Accessories Co.',
    rating: 4.1 
  }
];

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [favorites, setFavorites] = useState<FavoriteItem[]>(FAVORITE_ITEMS);
  
  const handleRemoveFavorite = (id: string) => {
    Alert.alert(
      'Remove from Favorites',
      'Are you sure you want to remove this item from your favorites?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFavorites(prevItems => prevItems.filter(item => item.id !== id));
          },
        },
      ]
    );
  };
  
  const handleAddToCart = (item: FavoriteItem) => {
    // Dans une application réelle, vous ajouteriez l'article au panier via un contexte ou un service
    Alert.alert('Success', `${item.name} has been added to your cart.`);
  };
  
  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity
      className={`mb-4 rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View className="relative">
        <Image
          source={item.image}
          className="w-full h-48"
          resizeMode="cover"
        />
        <TouchableOpacity
          className="absolute top-2 right-2 p-2 bg-white rounded-full"
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Ionicons name="heart" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {item.brand}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text className={`text-xs ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {item.rating}
            </Text>
          </View>
        </View>
        <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`} numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            ${item.price.toFixed(2)}
          </Text>
          <TouchableOpacity
            className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="cart-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-4 py-3">
        {/* Header */}
        <View className="flex-row items-center justify-center mb-4 relative">
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            My Favorites
          </Text>
        </View>
        
        {favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={renderFavoriteItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="heart-outline" size={80} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
            <Text className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No favorites yet
            </Text>
            <Text className={`mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Items you like will be saved here
            </Text>
            <Button
              title="Explore Products"
              onPress={() => navigation.navigate('Home')}
              variant="primary"
              className="mt-6"
            />
          </View>
        )}
      </View>
    </SafeAreaWrapper>
  );
};

export default FavoritesScreen;