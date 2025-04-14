import React from 'react';
import { View, Text, Image, useWindowDimensions, ImageSourcePropType } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface OnboardingItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: ImageSourcePropType;
  };
  index: number;
  scrollX: Animated.SharedValue<number>;
}

const OnboardingItem: React.FC<OnboardingItemProps> = ({ item, index, scrollX }) => {
  const { width } = useWindowDimensions();
  const { theme, isDarkMode } = useTheme();
  
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8]
    );
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4]
    );
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });
  
  const textAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [50, 0, 50]
    );
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0]
    );
    
    return {
      transform: [{ translateY }],
      opacity,
    };
  });
  
  return (
    <View className="items-center w-full" style={{ width }}>
      <Animated.View className="mb-8" style={imageAnimatedStyle}>
        <Image 
          source={item.image} 
          className="w-72 h-72" 
          resizeMode="contain" 
        />
      </Animated.View>
      
      <Animated.View className="px-6 items-center" style={textAnimatedStyle}>
        <Text className={`text-2xl font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {item.title}
        </Text>
        <Text className={`text-base text-center mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {item.description}
        </Text>
      </Animated.View>
    </View>
  );
};

export default OnboardingItem;