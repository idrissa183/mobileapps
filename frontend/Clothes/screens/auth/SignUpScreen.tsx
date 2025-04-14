// frontend/Clothes/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    phone: '',
    uses_clothes_app: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required.';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    
    // Full name validation
    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required.';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    
    // Phone validation (optional)
    if (formData.phone && !/^\+?[0-9]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRegister = async () => {
    if (!validate()) return;
    
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      // Navigation will be handled by the main navigator based on auth state
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
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
          <View className="flex-1 px-6 py-8">
            {/* Back Button */}
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="mb-4"
            >
              <View className="flex-row items-center">
                <Text className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'} font-medium`}>
                  ← {t('back', 'common')}
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Header */}
            <View className="mb-6">
              <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('registerTitle', 'auth')}
              </Text>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('registerSubtitle', 'auth')}
              </Text>
            </View>
            
            {/* Registration Form */}
            <View className="mb-6">
              <Input
                label={t('fullName', 'auth')}
                placeholder="John Doe"
                value={formData.full_name}
                onChangeText={(value) => handleChange('full_name', value)}
                leftIcon="person-outline"
                error={errors.full_name}
              />
              
              <Input
                label={t('username', 'auth')}
                placeholder="johndoe"
                value={formData.username}
                onChangeText={(value) => handleChange('username', value)}
                leftIcon="at-outline"
                autoCapitalize="none"
                error={errors.username}
                autoCorrect={false}
              />
              
              <Input
                label={t('email', 'auth')}
                placeholder="john@example.com"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                error={errors.email}
                autoCorrect={false}
              />
              
              <Input
                label={t('phone', 'auth')}
                placeholder="+1234567890"
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                keyboardType="phone-pad"
                leftIcon="call-outline"
                error={errors.phone}
              />
              
              <Input
                label={t('password', 'auth')}
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                leftIcon="lock-closed-outline"
                isPassword
                error={errors.password}
              />
              
              <Input
                label={t('confirmPassword', 'auth')}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
                leftIcon="lock-closed-outline"
                isPassword
                error={errors.confirmPassword}
              />
              
              <Button
                title={t('signUp', 'auth')}
                onPress={handleRegister}
                loading={isLoading}
                fullWidth
                className="mt-4"
              />
            </View>
            
            {/* Login Link */}
            <View className="flex-row justify-center mt-4">
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('alreadyHaveAccount', 'auth')}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                <Text className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                  {t('signIn', 'auth')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default RegisterScreen;