import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

interface LoaderProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'large', 
  text, 
  fullScreen = false 
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const loaderText = text || t('loading', 'common');
  
  return (
    <View 
      className={`items-center justify-center ${fullScreen ? 'flex-1 absolute inset-0' : 'py-4'}`}
      style={fullScreen ? { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' } : {}}
    >
      <ActivityIndicator size={size} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
      {loaderText && (
        <Text className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {loaderText}
        </Text>
      )}
    </View>
  );
};

export default Loader;