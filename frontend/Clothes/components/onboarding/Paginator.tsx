import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  interpolate,
  interpolateColor
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface PaginatorProps {
  data: any[];
  scrollX: Animated.SharedValue<number>;
}

const Paginator: React.FC<PaginatorProps> = ({ data, scrollX }) => {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  
  return (
    <View className="flex-row justify-center mt-4">
      {data.map((_, index) => {
        const animatedDotStyle = useAnimatedStyle(() => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          const dotwidth = interpolate(
            scrollX.value,
            inputRange,
            [8, 16, 8]
          );
          
          const backgroundColor = interpolateColor(
            scrollX.value,
            inputRange,
            [
              isDarkMode ? '#4B5563' : '#D1D5DB',
              isDarkMode ? '#60A5FA' : '#3B82F6',
              isDarkMode ? '#4B5563' : '#D1D5DB',
            ]
          );
          
          return {
            width: dotwidth,
            backgroundColor,
          };
        });
        
        return (
          <Animated.View
            key={index}
            className="h-2 mx-1 rounded-full"
            style={animatedDotStyle}
          />
        );
      })}
    </View>
  );
};

export default Paginator;