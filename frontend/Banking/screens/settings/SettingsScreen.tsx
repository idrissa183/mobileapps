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
  Platform
} from "react-native";
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Linking } from 'react-native'; 
import useAuth from "../../hooks/useAuth";

// Définition des langues disponibles
const languages = [
  { id: 'en', name: 'English', flag: require('../../assets/flags/usa.png') },
  { id: 'fr', name: 'Français', flag: require('../../assets/flags/france.png') },
];

const SettingsScreen = ({ navigation }) => {
  // Utilisation correcte du hook useTheme
  const { isDarkMode, toggleTheme, themeMode, setThemeMode, theme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [locationServiceStatus, setLocationServiceStatus] = useState('unknown'); // 'unknown', 'granted', 'denied'
  const { resetPassword, logout } = useAuth();


  // Vérifier et demander les permissions de localisation au chargement
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Fixed openURL function using expo-linking with better error handling
  const openURL = async (url) => {
    console.log('Attempting to open URL:', url); // Debug log
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        console.log('URL opened successfully:', url); // Debug log
      } else {
        console.log('Cannot open URL:', url); // Debug log
        Alert.alert(
          t('error', 'common'),
          t('cannotOpenLink', 'settings'),
          [{ text: t('ok', 'common') }]
        );
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert(
        t('error', 'common'),
        `${t('linkError', 'settings')}: ${error.message}`,
        [{ text: t('ok', 'common') }]
      );
    }
  };
  


  // Fonction pour vérifier et demander les permissions de localisation
  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationServiceStatus(status);
      setLocationEnabled(status === 'granted');
    } catch (error) {
      console.log('Error checking location permissions', error);
    }
  };
  
  // Fonction pour demander les permissions de localisation
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationServiceStatus(status);
      return status === 'granted';
    } catch (error) {
      console.log('Error requesting location permissions', error);
      return false;
    }
  };

  // Styles basés sur le thème
  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const sectionStyle = isDarkMode ? styles.darkSection : styles.lightSection;
  const itemStyle = isDarkMode ? styles.darkItem : styles.lightItem;

  // Gestion du changement de langue avec modal
  const openLanguageModal = () => {
    setLangModalVisible(true);
  };

  const changeLanguage = (langCode: any) => {
    setLanguage(langCode);
    setLangModalVisible(false);
  };

  const getCurrentLanguageFlag = () => {
    const currentLang = languages.find(lang => lang.id === language);
    return currentLang?.flag;
  };

  // Gestion améliorée du changement de thème
  const handleThemeChange = () => {
    Alert.alert(
      t('changeTheme', 'settings'),
      t('selectTheme', 'settings'),
      [
        { 
          text: t('light', 'settings'), 
          onPress: () => {
            setThemeMode('light');
            // Feedback visuel pour confirmer le changement
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

  // Fonction simple pour basculer directement entre clair et sombre
  const handleQuickToggleTheme = () => {
    toggleTheme();
    // Le feedback visuel n'est pas nécessaire ici car le changement est immédiatement visible
  };

  // Gestion de la déconnexion
  const handleLogout  = async () => {
    try {
      // Appel à ta fonction de logout depuis le contexte ou un service
      await logout();
  
      // Redirige vers l'écran de connexion ou d'accueil
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // Remplace 'Login' si ton écran a un autre nom
      });
    } catch (error: any) {
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

  // Élément de paramètre avec icône et texte
  const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true, rightElement = null }) => {
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

  // Élément de paramètre avec bascule
  const ToggleItem = ({ icon, title, subtitle, value, onValueChange }) => {
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
          trackColor={{ false: "#767577", true: "#FFD700" }}
          thumbColor={value ? "#FFFFFF" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={onValueChange}
          value={value}
        />
      </View>
    );
  };

  // En-tête de section
  const SectionHeader = ({ title }) => {
    return (
      <Text style={[styles.sectionHeader, secondaryTextStyle]}>{title}</Text>
    );
  };

  // Conteneur de section
  const Section = ({ children }) => {
    return (
      <View style={[styles.section, sectionStyle]}>
        {children}
      </View>
    );
  };

  // Données de paramètres dynamiques
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
      onValueChange: async (value) => {
        if (value && locationServiceStatus !== 'granted') {
          // Si l'utilisateur active la localisation mais que la permission n'est pas accordée
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
          // Si l'utilisateur désactive la localisation
          setLocationEnabled(false);
          Alert.alert(
            t('locationUpdated', 'settings'),
            t('locationDisabledMessage', 'settings'),
            [{ text: t('ok', 'common') }]
          );
        } else {
          // Si la permission est déjà accordée et que l'utilisateur active la localisation
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
        console.log('Privacy Policy pressed'); // Debug log
        // Ouvrir directement le lien sans la alerte de confirmation
        openURL('https://walkerstanislas.github.io/politique-confidentialite-app-bank/');
      }
    },
    {
      icon: <Text style={styles.iconText}>📄</Text>,
      title: t('termsOfUse', 'settings'),
      subtitle: t('termsOfUseDescription', 'settings'),
      onPress: () => {
        console.log('Terms of Use pressed'); // Debug log
        // Ouvrir directement le lien sans la alerte de confirmation
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
        console.log('Contact Support pressed'); // Debug log
        // Ouvrir directement le client email sans la alerte de confirmation
        openURL('mailto:walkercompaore972@gmail.com' + encodeURIComponent(t('supportRequestSubject', 'settings')));
      }
    },
    {
      icon: <Text style={styles.iconText}>⭐</Text>,
      title: t('rateApp', 'settings'),
      subtitle: t('rateAppDescription', 'settings'),
      onPress: () => {
        console.log('Rate App pressed'); // Debug log
        // Détecter la plateforme et ouvrir le magasin approprié
        const APP_STORE_ID = 'YOUR_APP_ID'; // À remplacer par votre ID App Store
        const PLAY_STORE_ID = 'YOUR_PACKAGE_NAME'; // À remplacer par votre ID Google Play
        
        if (Platform.OS === 'ios') {
          openURL(`itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`);
        } else {
          openURL(`market://details?id=${PLAY_STORE_ID}`);
        }
      }
    }
  ];

  // Fonction d'aide pour obtenir le nom du mode de thème traduit
  const getThemeModeName = () => {
    switch(themeMode) {
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFD700' : '#1E40AF'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, headerTextStyle]}>{t('settings', 'common')}</Text>
        <View style={styles.headerRight} />
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
            onValueChange={(value) => {
              setNotificationsEnabled(value);
              // Dans une application réelle, vous devriez demander la permission de notification ici
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
          
          {/* Improved theme selection */}
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
                    { backgroundColor: isDarkMode ? '#FFD700' : '#1E40AF' }
                  ]}
                  onPress={handleQuickToggleTheme}
                >
                  <Ionicons 
                    name={isDarkMode ? "sunny" : "moon"} 
                    size={16} 
                    color={isDarkMode ? '#000' : '#fff'} 
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

        {/* Logout Button */}
        <TouchableOpacity 
          style={[
            styles.logoutButton,
            isDarkMode && styles.logoutButtonDark
          ]} 
          onPress={handleLogout}
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
                    <Ionicons name="checkmark" size={20} color="#FFD700" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
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
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutButtonDark: {
    backgroundColor: '#FF453A', // Variante plus foncée pour le mode sombre
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
  // Styles mode clair
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  lightSection: {
    backgroundColor: '#F3F4F6',
  },
  lightItem: {
    backgroundColor: '#F3F4F6',
  },
  lightHeaderText: {
    color: '#111827',
  },
  lightSecondaryText: {
    color: '#6B7280',
  },
  lightModal: {
    backgroundColor: '#ffffff',
  },
  lightSelectedLanguage: {
    backgroundColor: '#ebf5ff',
  },
  // Styles mode sombre
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  darkSection: {
    backgroundColor: '#1E293B',
  },
  darkItem: {
    backgroundColor: '#1E293B',
  },
  darkHeaderText: {
    color: '#F9FAFB',
  },
  darkSecondaryText: {
    color: '#9CA3AF',
  },
  darkModal: {
    backgroundColor: '#2d3748',
  },
  darkSelectedLanguage: {
    backgroundColor: '#4a5568',
  },
  // Styles de modal
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
  // Style pour le sélecteur de langue dans le menu
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
  // Nouveaux styles pour le sélecteur de thème
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  quickThemeToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});

const getStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 30,
            backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
        },
        scroll: {
            flex: 1,
        },
        innerContainer: {
            padding: 16, 
        },
        title: {
            fontSize: 24, 
            fontWeight: 'bold',
            marginBottom: 24,
            color: isDarkMode ? '#ffffff' : '#1f2937',
        },
    });

export default SettingsScreen;
