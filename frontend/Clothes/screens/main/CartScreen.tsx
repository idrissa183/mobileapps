// frontend/Clothes/screens/main/CartScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

// Données fictives pour l'exemple
const CART_ITEMS = [
  { 
    id: '1', 
    name: 'Summer Dress', 
    price: 49.99, 
    image: require('../../assets/placeholder.png'), 
    quantity: 1,
    size: 'M',
    color: 'Blue'
  },
  { 
    id: '2', 
    name: 'Casual Jeans', 
    price: 39.99, 
    image: require('../../assets/placeholder.png'), 
    quantity: 2,
    size: 'L',
    color: 'Denim'
  },
  { 
    id: '3', 
    name: 'Cotton T-Shirt', 
    price: 19.99, 
    image: require('../../assets/placeholder.png'), 
    quantity: 1,
    size: 'S',
    color: 'White'
  },
];

const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [cartItems, setCartItems] = useState(CART_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calcul du sous-total
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Frais d'expédition fictifs
  const shipping = 5.99;
  
  // Total
  const total = subtotal + shipping;
  
  const handleQuantityChange = (id: string, change: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (newQuantity < 1) return item; // Ne pas permettre une quantité inférieure à 1
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };
  
  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCartItems(prevItems => prevItems.filter(item => item.id !== id));
          },
        },
      ]
    );
  };
  
  const handleCheckout = () => {
    setIsLoading(true);
    // Simuler un processus de paiement
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Order Confirmed',
        'Your order has been placed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setCartItems([]);
              navigation.navigate('Home' as never);
            },
          },
        ]
      );
    }, 1500);
  };
  
  const renderCartItem = ({ item }: { item: any }) => (
    <View className={`flex-row mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <Image
        source={item.image}
        className="w-20 h-20 rounded"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-between">
        <View>
          <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`} numberOfLines={1}>
            {item.name}
          </Text>
          <View className="flex-row mt-1">
            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Size: {item.size}
            </Text>
            <Text className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Color: {item.color}
            </Text>
          </View>
          <Text className={`font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            ${item.price.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TouchableOpacity
              className={`w-6 h-6 rounded items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              onPress={() => handleQuantityChange(item.id, -1)}
            >
              <Ionicons name="remove" size={16} color={isDarkMode ? 'white' : 'black'} />
            </TouchableOpacity>
            <Text className={`mx-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              className={`w-6 h-6 rounded items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              onPress={() => handleQuantityChange(item.id, 1)}
            >
              <Ionicons name="add" size={16} color={isDarkMode ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="p-1"
            onPress={() => handleRemoveItem(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={isDarkMode ? '#F87171' : '#EF4444'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-4 py-3">
        {/* Header */}
        <View className="flex-row items-center justify-center mb-4 relative">
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Shopping Cart
          </Text>
        </View>
        
        {cartItems.length > 0 ? (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              className="mb-4"
            />
            
            {/* Order Summary */}
            <View className={`rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Order Summary
              </Text>
              
              <View className="flex-row justify-between mb-2">
                <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Subtotal ({cartItems.length} items)
                </Text>
                <Text className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Shipping
                </Text>
                <Text className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                  ${shipping.toFixed(2)}
                </Text>
              </View>
              
              <View className="h-px my-2 bg-gray-300 opacity-50" />
              
              <View className="flex-row justify-between mb-2">
                <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Total
                </Text>
                <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>
            
            {/* Checkout Button */}
            <Button
              title="Proceed to Checkout"
              onPress={handleCheckout}
              loading={isLoading}
              fullWidth
              size="large"
            />
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="cart-outline" size={80} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
            <Text className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your cart is empty
            </Text>
            <Text className={`mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Looks like you haven't added any items to your cart yet
            </Text>
            <Button
              title="Start Shopping"
              onPress={() => navigation.navigate('Home' as never)}
              variant="primary"
              className="mt-6"
            />
          </View>
        )}
      </View>
    </SafeAreaWrapper>
  );
};

export default CartScreen;