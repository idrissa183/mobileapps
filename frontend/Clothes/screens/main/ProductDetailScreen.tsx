// frontend/Clothes/screens/main/ProductDetailScreen.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList,
  Dimensions,
  Alert 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  useAnimatedScrollHandler
} from 'react-native-reanimated';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Button from '../../components/common/Button';

import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');


// Produit fictif pour l'exemple
const PRODUCT = {
  id: '1',
  name: 'Summer Cotton Dress',
  description: 'This lightweight summer dress is perfect for hot days. Made with 100% organic cotton, it offers both comfort and style with its timeless design.',
  price: 49.99,
  salePrice: 39.99,
  brand: 'Fashion Brand',
  rating: 4.5,
  reviewCount: 128,
  images: [
    require('../../assets/placeholder.png'),
    require('../../assets/placeholder.png'),
    require('../../assets/placeholder.png'),
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  colors: [
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Yellow', hex: '#F59E0B' },
  ],
  features: [
    '100% organic cotton',
    'Breathable fabric',
    'Machine washable',
    'Available in multiple colors',
  ],
  inStock: true,
  deliveryEstimate: '2-4 business days',
};


interface RouteParams {
  productId: string;
}

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const { productId } = route.params as RouteParams;
  
  // Dans une application réelle, vous récupèreriez les données du produit en fonction de l'ID
  const product = PRODUCT;
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Animation pour l'ajout au panier
  const buttonScale = useSharedValue(1);
  
  // Animation pour le défilement des images
  const scrollX = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });
  
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });
  
  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('Selection Required', 'Please select a size before adding to cart');
      return;
    }
    
    if (!selectedColor) {
      Alert.alert('Selection Required', 'Please select a color before adding to cart');
      return;
    }
    
    // Animation du bouton
    buttonScale.value = withSpring(0.9, { damping: 2 }, () => {
      buttonScale.value = withSpring(1);
    });
    
    // Dans une vraie application, vous ajouteriez l'article au panier
    Alert.alert('Success', `${product.name} has been added to your cart.`);
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const renderSizeItem = (size: string) => (
    <TouchableOpacity
      key={size}
      className={`mr-2 px-4 py-2 rounded-lg border ${
        selectedSize === size
          ? isDarkMode ? 'border-blue-400 bg-blue-900' : 'border-blue-500 bg-blue-50'
          : isDarkMode ? 'border-gray-700' : 'border-gray-300'
      }`}
      onPress={() => setSelectedSize(size)}
    >
      <Text 
        className={`${
          selectedSize === size
            ? isDarkMode ? 'text-blue-400 font-medium' : 'text-blue-500 font-medium'
            : isDarkMode ? 'text-white' : 'text-gray-800'
        }`}
      >
        {size}
      </Text>
    </TouchableOpacity>
  );
  
  const renderColorItem = (color: { name: string, hex: string }) => (
    <TouchableOpacity
      key={color.name}
      className={`mr-3 items-center`}
      onPress={() => setSelectedColor(color.name)}
    >
      <View className={`w-8 h-8 rounded-full mb-1 ${
        selectedColor === color.name
          ? 'border-2 border-blue-500'
          : ''
      }`}
        style={{ backgroundColor: color.hex, padding: selectedColor === color.name ? 2 : 0 }}
      />
      <Text className={`text-xs ${
        selectedColor === color.name
          ? isDarkMode ? 'text-blue-400' : 'text-blue-500'
          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {color.name}
      </Text>
    </TouchableOpacity>
  );
  
  const renderPagination = () => {
    return (
      <View className="flex-row justify-center mb-4">
        {product.images.map((_, index) => {
          const dotWidth = useAnimatedStyle(() => {
            const animatedWidth = interpolate(
              scrollX.value,
              [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              [8, 16, 8],
              'clamp'
            );
            
            const opacity = interpolate(
              scrollX.value,
              [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              [0.5, 1, 0.5],
              'clamp'
            );
            
            return {
              width: animatedWidth,
              opacity,
            };
          });
          
          return (
            <Animated.View
              key={index}
              className={`h-2 mx-1 rounded-full ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}
              style={dotWidth}
            />
          );
        })}
      </View>
    );
  };
  
  return (
    <SafeAreaWrapper>
      <View className="flex-1">
        {/* Header with back button and favorite */}
        <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-between px-4 py-3">
          <TouchableOpacity
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={isDarkMode ? 'white' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onPress={toggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? 'heart' : 'heart-outline'} 
              size={22} 
              color={isFavorite ? '#EF4444' : isDarkMode ? 'white' : 'black'} 
            />
          </TouchableOpacity>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product Images */}
          <View className="relative">
            <Animated.FlatList
              data={product.images}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <Image
                  source={item}
                  style={{ width, height: width }}
                  resizeMode="cover"
                />
              )}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(newIndex);
              }}
            />
            {renderPagination()}
          </View>
          
          <View className="px-4 pb-24">
            {/* Product Info */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {product.brand}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text className={`ml-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {product.rating} ({product.reviewCount} reviews)
                  </Text>
                </View>
              </View>
              
              <Text className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {product.name}
              </Text>
              
              <View className="flex-row items-center mb-4">
                {product.salePrice ? (
                  <>
                    <Text className={`text-xl font-bold mr-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${product.salePrice.toFixed(2)}
                    </Text>
                    <Text className={`text-sm line-through ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ${product.price.toFixed(2)}
                    </Text>
                    <View className="ml-2 px-2 py-1 bg-red-500 rounded">
                      <Text className="text-xs text-white font-medium">
                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${product.price.toFixed(2)}
                  </Text>
                )}
              </View>
              
              <Text className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {product.description}
              </Text>
            </View>
            
            {/* Size Selection */}
            <View className="mb-6">
              <Text className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Size
              </Text>
              <View className="flex-row flex-wrap">
                {product.sizes.map(renderSizeItem)}
              </View>
            </View>
            
            {/* Color Selection */}
            <View className="mb-6">
              <Text className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Color
              </Text>
              <View className="flex-row flex-wrap">
                {product.colors.map(renderColorItem)}
              </View>
            </View>
            
            {/* Features */}
            <View className="mb-6">
              <Text className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Features
              </Text>
              {product.features.map((feature, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  <Ionicons name="checkmark-circle" size={16} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                  <Text className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Delivery */}
            <View className="mb-6">
              <Text className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Delivery
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Estimated delivery in {product.deliveryEstimate}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Bottom Add to Cart Button */}
        <View className={`absolute bottom-0 left-0 right-0 p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <Animated.View style={buttonAnimatedStyle}>
            <Button
              title="Add to Cart"
              onPress={handleAddToCart}
              fullWidth
              size="large"
              disabled={!product.inStock}
            />
          </Animated.View>
          {!product.inStock && (
            <Text className="text-center text-red-500 mt-2">
              Currently out of stock
            </Text>
          )}
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default ProductDetailScreen;