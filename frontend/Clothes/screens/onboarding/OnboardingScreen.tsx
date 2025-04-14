// frontend/Clothes/screens/onboarding/OnboardingScreen.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  TouchableOpacity, 
  Image, 
  ListRenderItem
} from 'react-native';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  useAnimatedScrollHandler
} from 'react-native-reanimated';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Button from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

// Type pour les données d'onboarding
type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  image: any;
};

// Type pour la navigation
type RootStackParamList = {
  Main: undefined;
  Home: undefined;
};

// Données d'onboarding
const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Bienvenue sur Notre Boutique',
    description: 'Découvrez les dernières tendances de mode à des prix imbattables',
    image: require('../../assets/placeholder.png')
  },
  {
    id: '2',
    title: 'Faites votre Shopping Facilement',
    description: 'Parcourez notre catalogue, ajoutez au panier et payez en toute sécurité',
    image: require('../../assets/placeholder.png')
  },
  {
    id: '3',
    title: 'Livraison Rapide',
    description: 'Recevez vos articles préférés directement à votre porte en quelques jours',
    image: require('../../assets/placeholder.png')
  }
];

const AnimatedFlatList = Animated.createAnimatedComponent<React.ComponentProps<typeof FlatList<OnboardingItem>>>(FlatList);

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList<OnboardingItem>>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const handleContinue = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({
      index: onboardingData.length - 1,
      animated: true
    });
  };

  const handleGetStarted = () => {
    // Navigation vers l'écran Home via Main
    // Méthode 1 : Utilisation de reset pour remplacer la pile de navigation
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });

    // Méthode alternative si Main contient un TabNavigator avec Home
    // Utilisation de CommonActions.reset pour naviguer jusqu'à Home à l'intérieur de Main
    /*
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { 
            name: 'Main',
            state: {
              routes: [{ name: 'Home' }],
              index: 0,
            }
          },
        ],
      })
    );
    */
  };

  const renderItem: ListRenderItem<OnboardingItem> = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image 
          source={item.image} 
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={[
          styles.title, 
          { color: isDarkMode ? '#FFFFFF' : '#1F2937' }
        ]}>
          {item.title}
        </Text>
        <Text style={[
          styles.description, 
          { color: isDarkMode ? '#D1D5DB' : '#4B5563' }
        ]}>
          {item.description}
        </Text>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const dotStyle = useAnimatedStyle(() => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width
            ];
            
            const dotWidth = interpolate(
              scrollX.value,
              inputRange,
              [8, 16, 8],
              'clamp'
            );
            
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.5, 1, 0.5],
              'clamp'
            );
            
            const backgroundColor = isDarkMode ? '#60A5FA' : '#3B82F6';
            
            return {
              width: dotWidth,
              opacity,
              backgroundColor,
            };
          });
          
          return (
            <Animated.View
              key={index}
              style={[styles.dot, dotStyle]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaWrapper>
      <View style={[
        styles.container, 
        { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF' }
      ]}>
        <View style={styles.skipContainer}>
          {currentIndex < onboardingData.length - 1 && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={[
                styles.skipText, 
                { color: isDarkMode ? '#60A5FA' : '#3B82F6' }
              ]}>
                Passer
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <AnimatedFlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        
        {renderPagination()}
        
        <View style={styles.bottomContainer}>
          {currentIndex === onboardingData.length - 1 ? (
            <Button
              title="Commencer"
              onPress={handleGetStarted}
              fullWidth
              size="large"
            />
          ) : (
            <Button
              title="Continuer"
              onPress={handleContinue}
              fullWidth
              size="large"
            />
          )}
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    height: height * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default OnboardingScreen;