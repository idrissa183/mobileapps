import React from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withSequence
} from 'react-native-reanimated';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  
  const rotateValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  
  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotateValue.value}deg` },
        { scale: scaleValue.value }
      ],
    };
  });
  
  const handleThemeToggle = () => {
    rotateValue.value = withSequence(
      withTiming(rotateValue.value + 180, { duration: 600 }),
      withTiming(rotateValue.value + 360, { duration: 600 })
    );
    
    scaleValue.value = withSequence(
      withSpring(1.2, { damping: 4 }),
      withSpring(1, { damping: 10 })
    );
    
    toggleTheme();
  };
  
  const handleLanguageChange = () => {
    const newLanguage = language === 'en' ? 'fr' : 'en';
    setLanguage(newLanguage);
  };
  
  const handleLogout = async () => {
    Alert.alert(
      t('title', 'settings'),
      'Are you sure you want to log out?',
      [
        {
          text: t('cancel', 'common'),
          style: 'cancel',
        },
        {
          text: t('logout', 'settings'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };
  
  const renderSettingItem = (
    icon: string, 
    title: string, 
    onPress?: () => void, 
    rightElement?: React.ReactNode
  ) => {
    return (
      <TouchableOpacity 
        className={`flex-row items-center justify-between py-4 px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        onPress={onPress}
        disabled={!onPress}
      >
        <View className="flex-row items-center">
          <Ionicons 
            name={icon as any} 
            size={22} 
            color={isDarkMode ? '#A3A3A3' : '#4B5563'} 
            className="mr-3"
          />
          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>
            {title}
          </Text>
        </View>
        
        {rightElement || (
          onPress && (
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? '#A3A3A3' : '#9CA3AF'} 
            />
          )
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaWrapper>
      <View className="flex-1">
        {/* Header */}
        <View className={`py-4 px-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('title', 'settings')}
          </Text>
        </View>
        
        <ScrollView>
          {/* Account Section */}
          <View className="mb-6">
            <Text className={`px-6 py-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
              {t('account', 'settings')}
            </Text>
            
            {renderSettingItem('person-outline', 'Profile', 
              () => navigation.navigate('Profile' as never)
            )}
            
            {renderSettingItem('notifications-outline', 'Notifications', 
              () => navigation.navigate('Notifications' as never)
            )}
            
            {renderSettingItem('card-outline', 'Payment Methods', 
              () => navigation.navigate('PaymentMethods' as never)
            )}
          </View>
          
          {/* Preferences Section */}
          <View className="mb-6">
            <Text className={`px-6 py-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
              {t('appearance', 'settings')}
            </Text>
            
            {renderSettingItem(
              isDarkMode ? 'moon-outline' : 'sunny-outline', 
              t('darkMode', 'common'), 
              undefined,
              <View className="flex-row items-center">
                <Animated.View style={iconAnimatedStyle}>
                  <Ionicons 
                    name={isDarkMode ? 'moon' : 'sunny'} 
                    size={22} 
                    color={isDarkMode ? '#60A5FA' : '#F59E0B'} 
                  />
                </Animated.View>
                <Switch
                  trackColor={{ false: '#767577', true: isDarkMode ? '#60A5FA' : '#3B82F6' }}
                  thumbColor="#f4f3f4"
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={handleThemeToggle}
                  value={isDarkMode}
                  className="ml-2"
                />
              </View>
            )}
            
            {renderSettingItem(
              'language-outline', 
              t('language', 'settings'), 
              handleLanguageChange,
              <View className="flex-row items-center">
                <Text className={`mr-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {language === 'en' ? 'English' : 'Français'}
                </Text>
              </View>
            )}
          </View>
          
          {/* About Section */}
          <View className="mb-6">
            <Text className={`px-6 py-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
              {t('aboutUs', 'settings')}
            </Text>
            
            {renderSettingItem('help-circle-outline', t('termsOfService', 'settings'), 
              () => navigation.navigate('Terms' as never)
            )}
            
            {renderSettingItem('shield-outline', t('privacyPolicy', 'settings'), 
              () => navigation.navigate('Privacy' as never)
            )}
            
            {renderSettingItem('mail-outline', t('contactUs', 'settings'), 
              () => navigation.navigate('Contact' as never)
            )}
          </View>
          
          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className={`mx-6 my-8 py-3 px-4 rounded-lg ${isDarkMode ? 'bg-red-800' : 'bg-red-500'}`}
          >
            <Text className="text-white text-center font-medium">
              {t('logout', 'settings')}
            </Text>
          </TouchableOpacity>
          
          {/* App Version */}
          <Text className={`text-center text-sm mb-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Version 1.0.0
          </Text>
        </ScrollView>
      </View>
    </SafeAreaWrapper>
  );
};

export default SettingsScreen;