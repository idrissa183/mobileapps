import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  isPassword?: boolean;
  containerStyle?: any;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerStyle,
  ...props
}) => {
  const { theme, isDarkMode } = useTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  const inputBgColor = isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
  const borderColor = error 
    ? 'border-red-500' 
    : isDarkMode ? 'border-gray-700' : 'border-gray-300';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  
  return (
    <View className={`mb-4 ${containerStyle}`}>
      {label && (
        <Text className={`mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </Text>
      )}
      
      <View className={`flex-row items-center border rounded-md ${borderColor} ${inputBgColor}`}>
        {leftIcon && (
          <View className="pl-3">
            <Ionicons 
              name={leftIcon as any} 
              size={20} 
              color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
            />
          </View>
        )}
        
        <TextInput
          className={`p-3 flex-1 ${textColor} ${leftIcon ? 'pl-2' : 'pl-4'}`}
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
          secureTextEntry={isPassword && !passwordVisible}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility} className="pr-3">
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={isDarkMode ? '#9CA3AF' : '#6B7280'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};

export default Input;