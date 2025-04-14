// frontend/Clothes/screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  Easing 
} from 'react-native-reanimated';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { forgotPassword, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Animation for success message
  const successOpacity = useSharedValue(0);
  const successScale = useSharedValue(0.8);
  
  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: successOpacity.value,
      transform: [{ scale: successScale.value }],
    };
  });
  
  const validate = () => {
    if (!email) {
      setError('Email is required.');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email address is invalid.');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const handleForgotPassword = async () => {
    if (!validate()) return;
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      
      // Animate success message
      successOpacity.value = withTiming(1, { duration: 500 });
      successScale.value = withSpring(1, { damping: 12 });
    } catch (error: any) {
      Alert.alert(
        'Request Failed',
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
          
          {!isSubmitted ? (
            <>
              {/* Header */}
              <View className="mb-8">
                <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('resetPassword', 'auth')}
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('enterEmail', 'auth')}
                </Text>
              </View>
              
              {/* Form */}
              <View>
                <Input
                  label={t('email', 'auth')}
                  placeholder="yourname@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                  error={error}
                  autoCorrect={false}
                />
                
                <Button
                  title={t('submit', 'auth')}
                  onPress={handleForgotPassword}
                  loading={isLoading}
                  fullWidth
                  className="mt-4"
                />
              </View>
            </>
          ) : (
            /* Success Message */
            <Animated.View 
              className="flex-1 justify-center items-center" 
              style={successAnimatedStyle}
            >
              <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${isDarkMode ? 'bg-green-800' : 'bg-green-100'}`}>
                <Text style={{ fontSize: 30 }}>✓</Text>
              </View>
              <Text className={`text-xl font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Reset Email Sent
              </Text>
              <Text className={`text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                We've sent instructions to reset your password to {email}
              </Text>
              <Button
                title="Back to Login"
                onPress={() => navigation.navigate('Login' as never)}
                variant="primary"
                fullWidth={false}
              />
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default ForgotPasswordScreen;