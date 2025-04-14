// frontend/Clothes/screens/main/ProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Button from '../../components/common/Button';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

// Informations utilisateur fictives
const USER_INFO = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 8901',
  avatar: require('../../assets/placeholder.png'),
  memberSince: 'January 2023',
  orders: [
    { 
      id: 'ORD001', 
      date: '12 Mar 2023', 
      total: 129.97, 
      status: 'Delivered', 
      items: 3 
    },
    { 
      id: 'ORD002', 
      date: '28 Apr 2023', 
      total: 49.99, 
      status: 'Delivered', 
      items: 1 
    },
    { 
      id: 'ORD003', 
      date: '15 May 2023', 
      total: 89.98, 
      status: 'Processing', 
      items: 2 
    },
  ]
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'reviews', 'addresses'
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by the root navigator based on auth state
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };
  
  const renderOrderItem = (order: any) => (
    <TouchableOpacity
      key={order.id}
      className={`mb-3 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      onPress={() => Alert.alert('Order Details', `Details for order ${order.id}`)}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {order.id}
        </Text>
        <View 
          className={`px-2 py-1 rounded-full ${
            order.status === 'Delivered' 
              ? isDarkMode ? 'bg-green-800' : 'bg-green-100' 
              : isDarkMode ? 'bg-yellow-800' : 'bg-yellow-100'
          }`}
        >
          <Text 
            className={`text-xs ${
              order.status === 'Delivered' 
                ? isDarkMode ? 'text-green-200' : 'text-green-800' 
                : isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
            }`}
          >
            {order.status}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {order.date} • {order.items} item{order.items > 1 ? 's' : ''}
        </Text>
        <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          ${order.total.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1">
        <View className="px-4 py-3">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              My Profile
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings' as never)}
            >
              <Ionicons name="settings-outline" size={24} color={isDarkMode ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>
          
          {/* User Info Card */}
          <View className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="flex-row items-center">
              <Image
                source={USER_INFO.avatar}
                className="w-16 h-16 rounded-full"
              />
              <View className="ml-4">
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {USER_INFO.name}
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {USER_INFO.email}
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Member since {USER_INFO.memberSince}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className={`mt-4 py-2 px-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}
              onPress={() => Alert.alert('Edit Profile', 'Edit profile functionality will be added here')}
            >
              <Text className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tabs */}
          <View className="flex-row mb-4">
            <TouchableOpacity
              className={`flex-1 py-2 border-b-2 ${
                activeTab === 'orders' 
                  ? isDarkMode ? 'border-blue-400' : 'border-blue-500' 
                  : isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}
              onPress={() => setActiveTab('orders')}
            >
              <Text 
                className={`text-center ${
                  activeTab === 'orders' 
                    ? isDarkMode ? 'text-blue-400 font-bold' : 'text-blue-500 font-bold' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Orders
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 border-b-2 ${
                activeTab === 'reviews' 
                  ? isDarkMode ? 'border-blue-400' : 'border-blue-500' 
                  : isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}
              onPress={() => setActiveTab('reviews')}
            >
              <Text 
                className={`text-center ${
                  activeTab === 'reviews' 
                    ? isDarkMode ? 'text-blue-400 font-bold' : 'text-blue-500 font-bold' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Reviews
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 border-b-2 ${
                activeTab === 'addresses' 
                  ? isDarkMode ? 'border-blue-400' : 'border-blue-500' 
                  : isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}
              onPress={() => setActiveTab('addresses')}
            >
              <Text 
                className={`text-center ${
                  activeTab === 'addresses' 
                    ? isDarkMode ? 'text-blue-400 font-bold' : 'text-blue-500 font-bold' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Addresses
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          {activeTab === 'orders' && (
            <View>
              <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Orders
              </Text>
              {USER_INFO.orders.map(renderOrderItem)}
            </View>
          )}
          
          {activeTab === 'reviews' && (
            <View className="items-center py-8">
              <Ionicons name="star-outline" size={60} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
              <Text className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No reviews yet
              </Text>
              <Text className={`mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                You haven't written any product reviews
              </Text>
            </View>
          )}
          
          {activeTab === 'addresses' && (
            <View className="items-center py-8">
              <Ionicons name="location-outline" size={60} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
              <Text className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No addresses saved
              </Text>
              <Text className={`mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                You haven't saved any shipping addresses
              </Text>
              <Button
                title="Add Address"
                variant="primary"
                className="mt-4"
                onPress={() => Alert.alert('Add Address', 'Add address functionality will be added here')}
              />
            </View>
          )}
          
          {/* Logout Button */}
          <TouchableOpacity
            className={`mt-8 py-3 rounded-lg ${isDarkMode ? 'bg-red-800' : 'bg-red-500'}`}
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-medium">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default ProfileScreen;