import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  
  const validate = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid.';
    }
    
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleLogin = async () => {
    if (!validate()) return;
    
    try {
      await login(email, password);
      // Navigation will be handled by the main navigator based on auth state
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.detail || 'An unexpected error occurred. Please try again.'
      );
    }
  };
  
  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerClassName="flex-grow" 
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center">
            {/* Logo and Welcome Text */}
            <View className="items-center mb-8">
              <Image
                source={require('../../assets/logo.png')}
                className="w-24 h-24 mb-4"
                resizeMode="contain"
              />
              <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('loginTitle', 'auth')}
              </Text>
              <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('loginSubtitle', 'auth')}
              </Text>
            </View>
            
            {/* Login Form */}
            <View className="mb-6">
              <Input
                label={t('email', 'auth')}
                placeholder="yourname@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                error={errors.email}
                autoCorrect={false}
              />
              
              <Input
                label={t('password', 'auth')}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                leftIcon="lock-closed-outline"
                isPassword
                error={errors.password}
              />
              
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword' as never)}
                className="self-end mb-4"
              >
                <Text className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                  {t('forgotPassword', 'auth')}
                </Text>
              </TouchableOpacity>
              
              <Button
                title={t('signIn', 'auth')}
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
              />
            </View>
            
            {/* Social Login */}
            <View className="my-6">
              <View className="flex-row items-center my-4">
                <View className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                <Text className={`px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Or continue with
                </Text>
                <View className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
              </View>
              
              <View className="flex-row justify-center space-x-4">
                <TouchableOpacity 
                  className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                  onPress={() => Alert.alert('Info', 'Google login would happen here')}
                >
                  <Ionicons name="logo-google" size={24} color={isDarkMode ? '#E1E1E1' : '#333333'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                  onPress={() => Alert.alert('Info', 'Apple login would happen here')}
                >
                  <Ionicons name="logo-apple" size={24} color={isDarkMode ? '#E1E1E1' : '#333333'} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Register Link */}
            <View className="flex-row justify-center mt-4">
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('dontHaveAccount', 'auth')}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                <Text className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                  {t('signUp', 'auth')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default LoginScreen;