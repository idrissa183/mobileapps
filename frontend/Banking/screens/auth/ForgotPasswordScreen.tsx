import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

type Language = {
  id: string;
  name: string;
  flag: any;
};

type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

const languages: Language[] = [
  { id: 'en', name: 'English', flag: require('../../assets/flags/usa.png') },
  { id: 'fr', name: 'Français', flag: require('../../assets/flags/france.png') },
];

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [langModalVisible, setLangModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleResetPassword = (): void => {
    setError('');
    
    if (!email.trim()) {
      setError(t('emailRequired', 'auth'));
      return;
    } else if (!validateEmail(email)) {
      setError(t('invalidEmail', 'auth'));
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        navigation.navigate('SignIn');
      }, 3000);
    }, 1500);
  };
  
  const openLanguageModal = (): void => {
    setLangModalVisible(true);
  };
  
  const changeLanguage = (langCode: any): void => {
    setLanguage(langCode);
    setLangModalVisible(false);
  };
  
  const getCurrentLanguageFlag = () => {
    const currentLang = languages.find(lang => lang.id === language);
    return currentLang?.flag;
  };

  return (
    <SafeAreaWrapper>
      <ScrollView 
        contentContainerStyle={styles.container} 
        style={[styles.scrollView, isDarkMode ? styles.darkBg : styles.lightBg]}
      >
        {/* Header with language selector */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.languageSelector}
            onPress={openLanguageModal}
          >
            <Image 
              source={getCurrentLanguageFlag()} 
              style={styles.flagImage} 
            />
            <Ionicons name="chevron-down" size={16} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isDarkMode ? styles.textLight : styles.textDark]}>
              {t('resetPassword', 'auth')}
            </Text>
            <Text style={[styles.subtitle, isDarkMode ? styles.textSecondaryDark : styles.textSecondaryLight]}>
              {t('enterEmail', 'auth')}
            </Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            {isSuccess ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={32} color="#fff" />
                </View>
                <Text style={[styles.successTitle, isDarkMode ? styles.textLight : styles.textDark]}>
                  {t('resetLinkSent', 'auth')}
                </Text>
                <Text style={[styles.successMessage, isDarkMode ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                  {t('checkEmailForInstructions', 'auth')}
                </Text>
                <TouchableOpacity 
                  style={styles.backToLoginButton}
                  onPress={() => navigation.navigate('SignIn')}
                >
                  <Text style={styles.backToLoginText}>{t('backToLogin', 'auth')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Input
                  label={t('email', 'auth')}
                  leftIcon="mail-outline"
                  placeholder={t('enterEmail', 'auth')}
                  value={email}
                  onChangeText={setEmail}
                  error={error}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <Button
                  title={t('sendResetLink', 'auth')}
                  loading={isLoading}
                  fullWidth
                  onPress={handleResetPassword}
                  style={styles.submitButton}
                />
                
                <View style={styles.helpSection}>
                  <Text style={[styles.helpText, isDarkMode ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                    {t('rememberPassword', 'auth')}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                    <Text style={styles.linkText}>{t('signIn', 'auth')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Language Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, isDarkMode ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.textLight : styles.textDark]}>
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
                    styles.languageItem, 
                    language === item.id && (isDarkMode ? styles.selectedItemDark : styles.selectedItemLight)
                  ]}
                  onPress={() => changeLanguage(item.id)}
                >
                  <Image source={item.flag} style={styles.languageFlag} />
                  <Text style={[styles.languageName, isDarkMode ? styles.textLight : styles.textDark]}>
                    {item.name}
                  </Text>
                  {language === item.id && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      
      {/* Loading overlay */}
      {isLoading && <Loader fullScreen />}
    </SafeAreaWrapper>
  );
};

// La correction principale: utilisation directe de StyleSheet.create au lieu d'une fonction qui prend isDarkMode
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  darkBg: {
    backgroundColor: '#121212',
  },
  lightBg: {
    backgroundColor: '#FFFFFF', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 30,
    zIndex: 10,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  textLight: {
    color: '#FFFFFF',
  },
  textDark: {
    color: '#121212',
  },
  textSecondaryLight: {
    color: '#666666',
  },
  textSecondaryDark: {
    color: '#AAAAAA',
  },
  form: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 16,
  },
  helpSection: {
    flex: 1,
    marginTop: 24,
  },
  helpText: {
    fontSize: 14,
  },
  linkText: {
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: 24,
  },
  backToLoginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  backToLoginText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
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
  },
  modalDark: {
    backgroundColor: '#1F2937',
  },
  modalLight: {
    backgroundColor: '#FFFFFF',
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
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItemDark: {
    backgroundColor: '#374151',
  },
  selectedItemLight: {
    backgroundColor: '#EBF5FF',
  },
  languageFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
  },
});

export default ForgotPasswordScreen;