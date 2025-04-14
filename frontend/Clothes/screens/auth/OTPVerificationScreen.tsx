// frontend/Clothes/screens/auth/OTPVerificationScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  Easing, 
  cancelAnimation
} from 'react-native-reanimated';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

const NUMBER_OF_INPUTS = 6;

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { verifyOtp, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [otp, setOtp] = useState<string[]>(Array(NUMBER_OF_INPUTS).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>(Array(NUMBER_OF_INPUTS).fill(null));
  const [countdown, setCountdown] = useState(60);
  const [canResendCode, setCanResendCode] = useState(false);
  
  // Animation pour le compte à rebours
  const timerOpacity = useSharedValue(1);
  const timerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: timerOpacity.value,
    };
  });
  
  useEffect(() => {
    // Démarrer l'animation de pulsation pour le compte à rebours
    timerOpacity.value = withRepeat(
      withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    // Démarrer le compte à rebours
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setCanResendCode(true);
          // Arrêter l'animation
          cancelAnimation(timerOpacity);
          timerOpacity.value = withTiming(1, { duration: 300 });
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
      cancelAnimation(timerOpacity);
    };
  }, []);
  
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Auto focus to next input
    if (text && index < NUMBER_OF_INPUTS - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleOtpKeyPress = (e: any, index: number) => {
    const key = e.nativeEvent.key;
    if (key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input when pressing backspace on an empty input
      inputRefs.current[index - 1]?.focus();
      
      // Update previous input value
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };
  
  const handleVerifyOtp = async () => {
    if (otp.some(digit => !digit)) {
      Alert.alert('Verification Failed', 'Please enter the complete verification code.');
      return;
    }
    
    try {
      await verifyOtp(otp.join(''));
      // Navigation will be handled by the main navigator based on auth state
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error.response?.data?.detail || 'Invalid verification code. Please try again.'
      );
    }
  };
  
  const handleResendCode = () => {
    if (!canResendCode) return;
    
    // Reset timer
    setCountdown(60);
    setCanResendCode(false);
    
    // Restart animation
    timerOpacity.value = withRepeat(
      withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    // Simulate resending code
    Alert.alert('Code Resent', 'A new verification code has been sent to your device.');
    
    // Start countdown again
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setCanResendCode(true);
          // Stop animation
          cancelAnimation(timerOpacity);
          timerOpacity.value = withTiming(1, { duration: 300 });
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };
  
  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Header */}
          <View className="mb-8">
            <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('otpVerification', 'auth')}
            </Text>
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('enterOTP', 'auth')}
            </Text>
          </View>
          
          {/* OTP Input Fields */}
          <View className="flex-row justify-between mb-8">
            {Array(NUMBER_OF_INPUTS).fill(0).map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                className={`w-12 h-12 border rounded-lg text-center text-xl font-bold ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } ${otp[index] ? 'border-blue-500' : ''}`}
                maxLength={1}
                keyboardType="number-pad"
                value={otp[index]}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleOtpKeyPress(e, index)}
              />
            ))}
          </View>
          
          {/* Verify Button */}
          <Button
            title={t('verify', 'auth')}
            onPress={handleVerifyOtp}
            loading={isLoading}
            fullWidth
            className="mb-6"
          />
          
          {/* Resend Code */}
          <View className="items-center">
            <View className="flex-row items-center mb-2">
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Didn't receive the code?
              </Text>
            </View>
            
            {canResendCode ? (
              <TouchableOpacity onPress={handleResendCode}>
                <Text className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                  {t('resendCode', 'auth')}
                </Text>
              </TouchableOpacity>
            ) : (
              <Animated.Text style={timerAnimatedStyle} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Resend code in {countdown}s
              </Animated.Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default OTPVerificationScreen;