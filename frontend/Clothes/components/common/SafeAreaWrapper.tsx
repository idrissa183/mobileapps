import React from 'react';
import { SafeAreaView, View, StatusBar, ViewProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SafeAreaWrapperProps extends ViewProps {
  children: React.ReactNode;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, style, ...props }) => {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
      {...props}
    >
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#111827' : '#FFFFFF'}
      />
      <View className="flex-1" style={style}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default SafeAreaWrapper;