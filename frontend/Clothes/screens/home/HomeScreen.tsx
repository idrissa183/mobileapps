// screens/home/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getProducts, getFeaturedProducts } from '../../services/products';
import { Product } from '../../types/product.types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const categories = [
  { id: '1', name: 'All', icon: 'grid-outline' },
  { id: '2', name: 'Men', icon: 'man-outline' },
  { id: '3', name: 'Women', icon: 'woman-outline' },
  { id: '4', name: 'Kids', icon: 'people-outline' },
  { id: '5', name: 'Sport', icon: 'football-outline' },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('1');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const featured = await getFeaturedProducts();
        setFeaturedProducts(featured);

        const trending = await getProducts({ searchTerm: 'trending' });
        setTrendingProducts(trending);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, []);

  const handleSearch = () => {
    navigation.navigate('ProductList', { searchTerm });
  };

  const renderCategoryItem = ({ item }) => (
    <StyledTouchableOpacity
      className={`mr-4 items-center ${activeCategory === item.id ? 'opacity-100' : 'opacity-60'}`}
      onPress={() => setActiveCategory(item.id)}
    >
      <StyledView
        className={`w-12 h-12 rounded-full items-center justify-center mb-1 ${
          activeCategory === item.id ? 'bg-blue-500' : 'bg-gray-200'
        }`}
      >
        <Ionicons
          name={item.icon}
          size={22}
          color={activeCategory === item.id ? 'white' : 'black'}
        />
      </StyledView>
      <StyledText
        className={`text-xs ${activeCategory === item.id ? 'font-bold' : 'font-normal'}`}
      >
        {item.name}
      </StyledText>
    </StyledTouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <StyledTouchableOpacity
      className="mr-4 w-40"
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <StyledView className="bg-gray-100 rounded-xl overflow-hidden">
        <StyledImage
          source={{ uri: item.imageUrls[0] }}
          className="w-full h-48 rounded-t-xl"
          resizeMode="cover"
        />
        <StyledView className="p-2">
          <StyledText className="text-xs text-gray-500">{item.brand}</StyledText>
          <StyledText className="font-medium" numberOfLines={1}>
            {item.name}
          </StyledText>
          <StyledView className="flex-row items-center justify-between mt-1">
            <StyledText className="font-bold">${item.price}</StyledText>
            <StyledView className="flex-row items-center">
              <Ionicons name="star" size={12} color="#FFD700" />
              <StyledText className="text-xs ml-1">{item.rating}</StyledText>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledTouchableOpacity>
  );

  return (
    <ScrollView>
      <StyledView className="flex-1 bg-white p-4">
        {/* Header */}
        <StyledView className="flex-row justify-between items-center mb-6">
          <StyledView>
            <StyledText className="text-gray-500">Hello, User!</StyledText>
            <StyledText className="text-2xl font-bold">Find your style</StyledText>
          </StyledView>
          <StyledTouchableOpacity
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={20} color="black" />
          </StyledTouchableOpacity>
        </StyledView>

        {/* Search Bar */}
        <StyledView className="flex-row bg-gray-100 rounded-full p-2 mb-6">
          <Ionicons name="search-outline" size={20} color="gray" style={{ marginHorizontal: 8 }} />
          <StyledTextInput
            placeholder="Search clothes..."
            className="flex-1"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
          />
        </StyledView>

        {/* Categories */}
        <StyledText className="text-lg font-bold mb-3">Categories</StyledText>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        />

        {/* Featured Products */}
        <StyledView className="flex-row justify-between items-center mb-3">
          <StyledText className="text-lg font-bold">Featured</StyledText>
          <StyledTouchableOpacity onPress={() => navigation.navigate('ProductList')}>
            <StyledText className="text-blue-500">See All</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
        <FlatList
          data={featuredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        />

        {/* Trending Products */}
        <StyledView className="flex-row justify-between items-center mb-3">
          <StyledText className="text-lg font-bold">Trending Now</StyledText>
          <StyledTouchableOpacity onPress={() => navigation.navigate('ProductList')}>
            <StyledText className="text-blue-500">See All</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
        <FlatList
          data={trendingProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        />
      </StyledView>
    </ScrollView>
  );
};

export default HomeScreen;