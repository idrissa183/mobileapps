import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled = false,
  style,
  ...props
}) => {
  const { theme, isDarkMode } = useTheme();

  // Styles based on variant
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return isDarkMode
          ? 'bg-blue-600 border-blue-600'
          : 'bg-blue-500 border-blue-500';
      case 'secondary':
        return isDarkMode
          ? 'bg-gray-700 border-gray-700'
          : 'bg-gray-200 border-gray-200';
      case 'outline':
        return isDarkMode
          ? 'bg-transparent border-blue-400'
          : 'bg-transparent border-blue-500';
    }
  };

  // Styles based on size
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return 'py-1 px-3 rounded text-sm';
      case 'medium':
        return 'py-2 px-4 rounded-md text-base';
      case 'large':
        return 'py-3 px-6 rounded-lg text-lg';
    }
  };

  // Text color based on variant
  const getTextColor = () => {
    if (variant === 'outline') {
      return isDarkMode ? 'text-blue-400' : 'text-blue-500';
    } else if (variant === 'secondary') {
      return isDarkMode ? 'text-white' : 'text-gray-800';
    }
    return 'text-white';
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={`border ${getVariantStyle()} ${getSizeStyle()} ${fullWidth ? 'w-full' : 'w-auto'} items-center justify-center ${disabled ? 'opacity-50' : 'opacity-100'}`}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? (isDarkMode ? '#60A5FA' : '#3B82F6') : 'white'} />
      ) : (
        <Text className={`font-semibold ${getTextColor()}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;