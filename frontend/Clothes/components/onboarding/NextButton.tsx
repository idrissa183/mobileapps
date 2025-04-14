import React, { useEffect } from 'react';
import { TouchableOpacity, Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedProps
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface NextButtonProps {
  scrollTo: () => void;
  percentage: number;
}

const NextButton: React.FC<NextButtonProps> = ({ scrollTo, percentage }) => {
  const { isDarkMode } = useTheme();
  const size = 60;
  const strokeWidth = 2;
  
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0);
  
  useEffect(() => {
    // Animation de rotation subtile
    rotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1, // Répéter indéfiniment
      false // Ne pas inverser
    );
    
    // Mettre à jour la progression en fonction du pourcentage passé en prop
    progress.value = withTiming(percentage, { duration: 300 });
  }, [percentage]);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  
  const animatedCircleProps = useAnimatedProps(() => {
    const circumference = 2 * Math.PI * ((size - strokeWidth) / 2);
    return {
      strokeDashoffset: circumference * (1 - progress.value),
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  
  
  const animatedColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [
        isDarkMode ? '#4B5563' : '#E5E7EB',
        isDarkMode ? '#3B82F6' : '#60A5FA',
        isDarkMode ? '#2563EB' : '#2563EB',
      ]
    );
    
    return {
      backgroundColor,
    };
  });
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <View className="items-center justify-center">
      <Animated.View className="items-center justify-center rounded-full" style={[
        { width: size, height: size },
        animatedColorStyle
      ]}>
        <TouchableOpacity
          onPress={scrollTo}
          className="w-full h-full items-center justify-center"
        >
          <Ionicons 
            name="arrow-forward" 
            size={24} 
            color={isDarkMode ? '#111827' : 'white'} 
          />
        </TouchableOpacity>
        
        <Svg width={size} height={size} className="absolute">
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDarkMode ? '#60A5FA' : '#3B82F6'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animatedProps={animatedCircleProps}
            fill="transparent"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default NextButton;