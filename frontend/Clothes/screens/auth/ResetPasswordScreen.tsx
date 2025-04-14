import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  withSpring
} from 'react-native-reanimated';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

interface RouteParams {
  token?: string;
}

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { resetPassword, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const { token } = route.params as RouteParams || {};
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{password?: string; confirmPassword?: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Animation pour l'effet de secouer lors d'une erreur
  const shakeAnim = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const successScale = useSharedValue(0.8);
  
  const passwordInputAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeAnim.value }],
    };
  });
  
  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: successOpacity.value,
      transform: [{ scale: successScale.value }],
    };
  });
  
  // Vérifier si le token est présent
  useEffect(() => {
    if (!token) {
      Alert.alert('Invalid Request', 'Password reset token is missing or invalid.');
      navigation.navigate('Login' as never);
    }
  }, [token, navigation]);
  
  const validate = () => {
    const newErrors: {password?: string; confirmPassword?: string} = {};
    
    if (!password) {
      newErrors.password = 'New password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Animer l'effet de secousse sur erreur
      shakeAnim.value = withSequence(
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      
      return false;
    }
    
    setErrors({});
    return true;
  };
  
  const handleResetPassword = async () => {
    if (!validate() || !token) return;
    
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      
      // Animer le message de succès
      successOpacity.value = withTiming(1, { duration: 500 });
      successScale.value = withSpring(1, { damping: 12 });
      
      // Rediriger vers la page de connexion après un délai
      setTimeout(() => {
        navigation.navigate('Login' as never);
      }, 2000);
    } catch (error: any) {
      Alert.alert(
        'Reset Failed',
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
          
          {!isSuccess ? (
            <>
              {/* Header */}
              <View className="mb-8">
                <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create New Password
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your new password must be different from previously used passwords.
                </Text>
              </View>
              
              {/* Form */}
              <Animated.View style={passwordInputAnimStyle}>
                <Input
                  label="New Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  leftIcon="lock-closed-outline"
                  isPassword
                  error={errors.password}
                />
                
                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  leftIcon="lock-closed-outline"
                  isPassword
                  error={errors.confirmPassword}
                />
                
                <Button
                  title="Reset Password"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  fullWidth
                  className="mt-4"
                />
              </Animated.View>
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
                Password Reset Successful
              </Text>
              <Text className={`text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your password has been reset successfully. You'll be redirected to login.
              </Text>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default ResetPasswordScreen;