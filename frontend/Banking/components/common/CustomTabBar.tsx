import React from 'react';
import { View, Pressable, Dimensions, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTheme from '../../hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const indicatorPosition = useSharedValue(0);

  React.useEffect(() => {
    const tabWidth = SCREEN_WIDTH / state.routes.length;
    const newPosition = state.index * tabWidth + tabWidth / 2;

    indicatorPosition.value = withSpring(newPosition, {
      damping: 15,
      stiffness: 120
    });
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value - 15 }]
    };
  });

  const getTabAnimation = (index: number) => {
    const scale = useSharedValue(state.index === index ? 1.2 : 1);

    React.useEffect(() => {
      if (state.index === index) {
        scale.value = withSpring(1.2, { damping: 10 });
      } else {
        scale.value = withSpring(1);
      }
    }, [state.index]);

    return useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }]
      };
    });
  };

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const iconInactiveColor = isDarkMode ? '#94A3B8' : '#64748B';
  const textFocusedColor = '#1E40AF';
  const textInactiveColor = isDarkMode ? '#94A3B8' : '#64748B';

  return (
    <View style={[
      styles.container, 
      containerStyle, 
      { paddingBottom: insets.bottom }
    ]}>
      <Animated.View
        style={[styles.indicator, indicatorStyle]}
      />

      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tabIconAnimatedStyle = getTabAnimation(index);

          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = isFocused ? 'home' : 'home-outline';
              break;
            case 'Cards':
              iconName = isFocused ? 'card' : 'card-outline';
              break;
            case 'Settings':
              iconName = isFocused ? 'settings' : 'settings-outline';
              break;
            case 'Contact':
              iconName = isFocused ? 'people' : 'people-outline';
              break;
            case 'History':
              iconName = isFocused ? 'time' : 'time-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          // if (index === 2) {
          //   return (
          //     <View key={route.key} style={styles.centerTabContainer}>
          //       <Pressable
          //         style={styles.centerTabButton}
          //         android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', borderless: true }}
          //         onPress={() => navigation.navigate(route.name)}
          //       >
          //         <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={24} color="#FFFFFF" />
          //       </Pressable>
          //     </View>
          //   );
          // }

          return (
            <Pressable
              key={route.key}
              style={styles.tabButton}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', borderless: true }}
              onPress={() => navigation.navigate(route.name)}
            >
              <Animated.View style={tabIconAnimatedStyle}>
                <Ionicons
                  name={iconName as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={isFocused ? '#1E40AF' : iconInactiveColor}
                />
              </Animated.View>
              <Animated.Text
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  color: isFocused ? textFocusedColor : textInactiveColor,
                  fontWeight: isFocused ? '500' : '400',
                }}
              >
                {route.name}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  darkContainer: {
    backgroundColor: '#020617',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  indicator: {
    position: 'absolute',
    height: 4,
    width: 32,
    backgroundColor: '#1E40AF',
    borderRadius: 100,
    top: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 64,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
  },
  centerTabButton: {
    backgroundColor: '#1E40AF',
    width: 64,
    height: 64,
    borderRadius: 32,
    marginTop: -32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});

export default CustomTabBar;