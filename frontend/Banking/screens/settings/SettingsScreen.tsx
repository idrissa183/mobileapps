import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  Image,
  Platform,
  ActivityIndicator
} from "react-native";
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Linking } from 'react-native';
import useAuth from "../../hooks/useAuth";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types'; // Assurez-vous que ce chemin est correct

// Type pour la navigation
type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

// Define available languages with proper typing
interface Language {
  id: string;
  name: string;
  flag: any;
}

const languages: Language[] = [
  { id: 'en', name: 'English', flag: require('../../assets/flags/usa.png') },
  { id: 'fr', name: 'Français', flag: require('../../assets/flags/france.png') },
];

// Define setting item interfaces for type safety
interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

interface ToggleItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface SectionHeaderProps {
  title: string;
}

interface SectionProps {
  children: React.ReactNode;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme, themeMode, setThemeMode, theme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const [langModalVisible, setLangModalVisible] = useState<boolean>(false);
  const [locationServiceStatus, setLocationServiceStatus] = useState<string>('unknown');
  const [logoutModalVisible, setLogoutModalVisible] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const { resetPassword, logout } = useAuth();

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const openURL = async (url: string): Promise<void> => {
    try {
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          t('error', 'common'),
          t('cannotOpenLink', 'settings'),
          [{ text: t('ok', 'common') }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        t('error', 'common'),
        `${t('linkError', 'settings')}: ${error.message}`,
        [{ text: t('ok', 'common') }]
      );
    }
  };

  const checkLocationPermission = async (): Promise<void> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationServiceStatus(status);
      setLocationEnabled(status === 'granted');
    } catch (error) {
      console.error('Error checking location permissions', error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationServiceStatus(status);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions', error);
      return false;
    }
  };

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const sectionStyle = isDarkMode ? styles.darkSection : styles.lightSection;
  const itemStyle = isDarkMode ? styles.darkItem : styles.lightItem;

  const openLanguageModal = (): void => {
    setLangModalVisible(true);
  };

  const changeLanguage = (langCode: any): void => {
    setLanguage(langCode);
    setLangModalVisible(false);
  };

  const getCurrentLanguageFlag = (): any => {
    const currentLang = languages.find(lang => lang.id === language);
    return currentLang?.flag;
  };

  const handleThemeChange = (): void => {
    Alert.alert(
      t('changeTheme', 'settings'),
      t('selectTheme', 'settings'),
      [
        {
          text: t('light', 'settings'),
          onPress: () => {
            setThemeMode('light');
            Alert.alert(t('themeChanged', 'settings'), t('lightThemeApplied', 'settings'));
          }
        },
        {
          text: t('dark', 'settings'),
          onPress: () => {
            setThemeMode('dark');
            Alert.alert(t('themeChanged', 'settings'), t('darkThemeApplied', 'settings'));
          }
        },
        {
          text: t('system', 'settings'),
          onPress: () => {
            setThemeMode('system');
            Alert.alert(t('themeChanged', 'settings'), t('systemThemeApplied', 'settings'));
          }
        },
        { text: t('cancel', 'common'), style: "cancel" }
      ]
    );
  };

  const handleQuickToggleTheme = (): void => {
    toggleTheme();
  };

  // Show logout confirmation modal
  const showLogoutConfirmation = (): void => {
    setLogoutModalVisible(true);
  };

  // Handle actual logout process
  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoggingOut(true); // Activer l'indicateur de chargement
      await logout();
      
      // Permettre à l'utilisateur de voir l'indicateur de chargement pendant un moment
      setTimeout(() => {
        setLogoutModalVisible(false);
        // Assurez-vous que ce nom correspond à un écran dans votre NavigationContainer
        navigation.reset({
          index: 0,
          routes: [{ name: 'AuthStack' }], // Utilisez le nom de la pile d'authentification
        });
      }, 500);
    } catch (error: any) {
      setIsLoggingOut(false); // Désactiver l'indicateur en cas d'erreur
      if (error.response) {
        Alert.alert(
          t('error', 'common'),
          t('serverError', 'common')
        );
      } else {
        Alert.alert(
          t('error', 'common'),
          t('networkError', 'common')
        );
      }
    }
  };

  const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightElement = null
  }) => {
    return (
      <TouchableOpacity style={[styles.settingItem, itemStyle]} onPress={onPress}>
        <View style={styles.settingItemLeft}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, headerTextStyle]}>{title}</Text>
            {subtitle && <Text style={[styles.settingSubtitle, secondaryTextStyle]}>{subtitle}</Text>}
          </View>
        </View>
        {rightElement ? (
          rightElement
        ) : (
          showArrow && <Text style={[styles.arrowIcon, secondaryTextStyle]}>›</Text>
        )}
      </TouchableOpacity>
    );
  };

  const ToggleItem: React.FC<ToggleItemProps> = ({
    icon,
    title,
    subtitle,
    value,
    onValueChange
  }) => {
    return (
      <View style={[styles.settingItem, itemStyle]}>
        <View style={styles.settingItemLeft}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, headerTextStyle]}>{title}</Text>
            {subtitle && <Text style={[styles.settingSubtitle, secondaryTextStyle]}>{subtitle}</Text>}
          </View>
        </View>
        <Switch
          trackColor={{ false: "#767577", true: "#6366F1" }}
          thumbColor={value ? "#FFFFFF" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={onValueChange}
          value={value}
        />
      </View>
    );
  };

  const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
    return (
      <Text style={[styles.sectionHeader, secondaryTextStyle]}>{title}</Text>
    );
  };

  const Section: React.FC<SectionProps> = ({ children }) => {
    return (
      <View style={[styles.section, sectionStyle]}>
        {children}
      </View>
    );
  };

  const accountSettings = [
    {
      icon: <Text style={styles.iconText}>🔑</Text>,
      title: t('password', 'settings'),
      subtitle: t('changePassword', 'settings'),
      onPress: () => console.log("Password pressed")
    },
    {
      icon: <Text style={styles.iconText}>📱</Text>,
      title: t('phoneNumber', 'settings'),
      subtitle: t('changePhoneNumber', 'settings'),
      onPress: () => console.log("Phone number pressed")
    }
  ];

  const privacySettings = [
    {
      type: 'toggle',
      icon: <Text style={styles.iconText}>📍</Text>,
      title: t('locationServices', 'settings'),
      subtitle: locationEnabled ? t('locationServicesEnabled', 'settings') : t('locationServicesDisabled', 'settings'),
      value: locationEnabled,
      onValueChange: async (value: boolean) => {
        if (value && locationServiceStatus !== 'granted') {
          const granted = await requestLocationPermission();
          setLocationEnabled(granted);

          if (granted) {
            Alert.alert(
              t('locationUpdated', 'settings'),
              t('locationEnabledMessage', 'settings'),
              [{ text: t('ok', 'common') }]
            );
          } else {
            Alert.alert(
              t('locationPermissionDenied', 'settings'),
              t('locationPermissionRequired', 'settings'),
              [{ text: t('ok', 'common') }]
            );
          }
        } else if (!value) {
          setLocationEnabled(false);
          Alert.alert(
            t('locationUpdated', 'settings'),
            t('locationDisabledMessage', 'settings'),
            [{ text: t('ok', 'common') }]
          );
        } else {
          setLocationEnabled(true);
          Alert.alert(
            t('locationUpdated', 'settings'),
            t('locationEnabledMessage', 'settings'),
            [{ text: t('ok', 'common') }]
          );
        }
      }
    },
    {
      icon: <Text style={styles.iconText}>🔒</Text>,
      title: t('privacyPolicy', 'settings'),
      subtitle: t('privacyPolicyDescription', 'settings'),
      onPress: () => {
        openURL('https://walkerstanislas.github.io/politique-confidentialite-app-bank/');
      }
    },
    {
      icon: <Text style={styles.iconText}>📄</Text>,
      title: t('termsOfUse', 'settings'),
      subtitle: t('termsOfUseDescription', 'settings'),
      onPress: () => {
        openURL('https://walkerstanislas.github.io/politique-confidentialite-app-bank/');
      }
    }
  ];

  const supportSettings = [
    {
      icon: <Text style={styles.iconText}>✉️</Text>,
      title: t('contactSupport', 'settings'),
      subtitle: t('contactSupportDescription', 'settings'),
      onPress: () => {
        openURL('mailto:walkercompaore972@gmail.com' + encodeURIComponent(t('supportRequestSubject', 'settings')));
      }
    },
    {
      icon: <Text style={styles.iconText}>⭐</Text>,
      title: t('rateApp', 'settings'),
      subtitle: t('rateAppDescription', 'settings'),
      onPress: () => {
        const APP_STORE_ID = '';
        const PLAY_STORE_ID = '';

        if (Platform.OS === 'ios') {
          openURL(`itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`);
        } else {
          openURL(`market://details?id=${PLAY_STORE_ID}`);
        }
      }
    }
  ];

  const getThemeModeName = (): string => {
    switch (themeMode) {
      case 'light': return t('themeLight', 'settings');
      case 'dark': return t('themeDark', 'settings');
      case 'system': return t('themeSystem', 'settings');
      default: return t('themeLight', 'settings');
    }
  };

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      {/* Header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, headerTextStyle]}>{t('settings', 'common')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <SectionHeader title={t('account', 'settings').toUpperCase()} />
        <Section>
          {accountSettings.map((setting, index) => (
            <React.Fragment key={`account-${index}`}>
              <SettingItem
                icon={setting.icon}
                title={setting.title}
                subtitle={setting.subtitle}
                onPress={setting.onPress}
              />
              {index < accountSettings.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Section>

        {/* Preferences Section */}
        <SectionHeader title={t('preferences', 'settings').toUpperCase()} />
        <Section>
          <ToggleItem
            icon={<Text style={styles.iconText}>🔔</Text>}
            title={t('notifications', 'settings')}
            subtitle={notificationsEnabled ? t('notificationsEnabled', 'settings') : t('notificationsDisabled', 'settings')}
            value={notificationsEnabled}
            onValueChange={(value: boolean) => {
              setNotificationsEnabled(value);
              Alert.alert(
                t('notificationsUpdated', 'settings'),
                value ? t('notificationsEnabledMessage', 'settings') : t('notificationsDisabledMessage', 'settings'),
                [{ text: t('ok', 'common') }]
              );
            }}
          />
          <View style={styles.divider} />

          {/* Language selection */}
          <SettingItem
            icon={<Text style={styles.iconText}>🌐</Text>}
            title={t('language', 'settings')}
            subtitle={`${t('changeLanguage', 'settings')}`}
            onPress={openLanguageModal}
            rightElement={
              <View style={styles.languageSelector}>
                <Image
                  source={getCurrentLanguageFlag()}
                  style={styles.flagImage}
                />
                <Ionicons name="chevron-forward" size={16} color={isDarkMode ? "#fff" : "#000"} />
              </View>
            }
          />

          <View style={styles.divider} />

          {/* Theme selection */}
          <SettingItem
            icon={<Text style={styles.iconText}>🌙</Text>}
            title={t('theme', 'settings')}
            subtitle={getThemeModeName()}
            onPress={handleThemeChange}
            rightElement={
              <View style={styles.themeSelector}>
                <TouchableOpacity
                  style={[
                    styles.quickThemeToggle,
                    { backgroundColor: isDarkMode ? '#6366F1' : '#4F46E5' }
                  ]}
                  onPress={handleQuickToggleTheme}
                >
                  <Ionicons
                    name={isDarkMode ? "sunny" : "moon"}
                    size={16}
                    color={isDarkMode ? '#fff' : '#fff'}
                  />
                </TouchableOpacity>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={isDarkMode ? "#fff" : "#000"}
                />
              </View>
            }
          />
        </Section>

        {/* Privacy Section */}
        <SectionHeader title={t('privacy', 'settings').toUpperCase()} />
        <Section>
          {privacySettings.map((setting, index) => (
            <React.Fragment key={`privacy-${index}`}>
              {setting.type === 'toggle' ? (
                <ToggleItem
                  icon={setting.icon}
                  title={setting.title}
                  subtitle={setting.subtitle}
                  value={setting.value}
                  onValueChange={setting.onValueChange}
                />
              ) : (
                <SettingItem
                  icon={setting.icon}
                  title={setting.title}
                  subtitle={setting.subtitle}
                  onPress={setting.onPress}
                />
              )}
              {index < privacySettings.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Section>

        {/* Help and Support Section */}
        <SectionHeader title={t('helpAndSupport', 'settings').toUpperCase()} />
        <Section>
          {supportSettings.map((setting, index) => (
            <React.Fragment key={`support-${index}`}>
              <SettingItem
                icon={setting.icon}
                title={setting.title}
                subtitle={setting.subtitle}
                onPress={setting.onPress}
              />
              {index < supportSettings.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Section>

        {/* Logout Button - Now opens confirmation modal */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            isDarkMode && styles.logoutButtonDark
          ]}
          onPress={showLogoutConfirmation}
          accessibilityLabel={t('logout', 'auth')}
          accessibilityRole="button"
          accessible={true}
        >
          <Text style={styles.logoutText}>{t('logout', 'auth')}</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.versionText, secondaryTextStyle]}>{t('version', 'settings')} 1.0.0</Text>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, isDarkMode ? styles.darkModal : styles.lightModal]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, headerTextStyle]}>
                {t('language', 'common')}
              </Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    language === item.id ? (isDarkMode ? styles.darkSelectedLanguage : styles.lightSelectedLanguage) : {}
                  ]}
                  onPress={() => changeLanguage(item.id)}
                >
                  <Image
                    source={item.flag}
                    style={styles.languageFlag}
                  />
                  <Text style={[styles.languageText, headerTextStyle]}>
                    {item.name}
                  </Text>
                  {language === item.id && (
                    <Ionicons name="checkmark" size={20} color="#6366F1" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, isDarkMode ? styles.darkModal : styles.lightModal]}>
            <View style={styles.logoutModalContent}>
              {isLoggingOut ? (
                <>
                  <ActivityIndicator size="large" color="#6366F1" style={styles.loadingIndicator} />
                  <Text style={[styles.logoutModalMessage, secondaryTextStyle]}>
                    {t('loggingOut', 'auth') || 'Logging out...'}
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.logoutIconContainer}>
                    <Ionicons 
                      name="log-out-outline" 
                      size={40} 
                      color="#6366F1"
                    />
                  </View>
                  
                  <Text style={[styles.logoutModalTitle, headerTextStyle]}>
                    {t('confirmLogout', 'auth') || 'Confirm Logout'}
                  </Text>
                  
                  <Text style={[styles.logoutModalMessage, secondaryTextStyle]}>
                    {t('logoutConfirmMessage', 'auth') || 'Are you sure you want to log out of your account?'}
                  </Text>
                  
                  <View style={styles.logoutModalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setLogoutModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>
                        {t('cancel', 'common') || 'Cancel'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={handleLogout}
                    >
                      <Text style={styles.confirmButtonText}>
                        {t('logout', 'auth') || 'Logout'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const colors = {
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    onSurface: '#111827',
    onSurfaceVariant: '#6B7280',
    primary: '#4F46E5',
    primaryVariant: '#6366F1',
    divider: 'rgba(107, 114, 128, 0.2)',
    error: '#EF4444',
    logout: '#DC2626',
    logoutDark: '#B91C1C',
    selectedItem: '#EEF2FF',
    cancelButton: '#E5E7EB',
    cancelText: '#4B5563',
    confirmButton: '#DC2626',
    confirmText: '#FFFFFF',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#1E293B',
    onSurface: '#F9FAFB',
    onSurfaceVariant: '#9CA3AF',
    primary: '#6366F1',
    primaryVariant: '#818CF8',
    divider: 'rgba(156, 163, 175, 0.2)',
    error: '#F87171',
    logout: '#EF4444',
    logoutDark: '#DC2626',
    selectedItem: '#312E81',
    cancelButton: '#334155',
    cancelText: '#F1F5F9',
    confirmButton: '#EF4444', 
    confirmText: '#FFFFFF',
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  section: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  arrowIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: colors.light.logout,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutButtonDark: {
    backgroundColor: colors.dark.logout,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
  },
  // Light mode styles
  lightContainer: {
    backgroundColor: colors.light.background,
  },
  lightSection: {
    backgroundColor: colors.light.surfaceVariant,
  },
  lightItem: {
    backgroundColor: colors.light.surfaceVariant,
  },
  lightHeaderText: {
    color: colors.light.onSurface,
  },
  lightSecondaryText: {
    color: colors.light.onSurfaceVariant,
  },
  lightModal: {
    backgroundColor: colors.light.surface,
  },
  lightSelectedLanguage: {
    backgroundColor: colors.light.selectedItem,
  },
  // Dark mode styles
  darkContainer: {
    backgroundColor: colors.dark.background,
  },
  darkSection: {
    backgroundColor: colors.dark.surface,
  },
  darkItem: {
    backgroundColor: colors.dark.surface,
  },
  darkHeaderText: {
    color: colors.dark.onSurface,
  },
  darkSecondaryText: {
    color: colors.dark.onSurfaceVariant,
  },
  darkModal: {
    backgroundColor: colors.dark.surface,
  },
  darkSelectedLanguage: {
    backgroundColor: colors.dark.selectedItem,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 320,
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  languageFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  languageText: {
    flex: 1,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  flagImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickThemeToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  // Logout modal styles
  logoutModalContent: {
    alignItems: 'center',
    padding: 16,
  },
  logoutIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  logoutModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.light.cancelButton,
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.light.cancelText,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: colors.light.confirmButton,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: colors.light.confirmText,
    fontWeight: '600',
  },
});

export default SettingsScreen;