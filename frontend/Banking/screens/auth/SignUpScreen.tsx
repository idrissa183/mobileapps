import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { RootStackParamList } from '../../App';
import authService from '../../services/authService';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Language = {
  id: string;
  name: string;
  flag: any;
};

type FormData = {
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  terms: string;
};

const languages: Language[] = [
  { id: 'en', name: 'English', flag: require('../../assets/flags/usa.png') },
  { id: 'fr', name: 'Français', flag: require('../../assets/flags/france.png') },
];

const SignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { isDarkMode } = useTheme();
  const { t, language, setLanguage } = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });

  const styles = getStyles(isDarkMode);

  const updateFormField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignUp = async() => {
    const newErrors: FormErrors = {
      username: '',
      email: '',
      fullName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      terms: '',
    };

    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = t('usernameRequired', 'auth');
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired', 'auth');
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('invalidEmail', 'auth');
      isValid = false;
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('fullNameRequired', 'auth');
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('phoneRequired', 'auth');
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = t('passwordRequired', 'auth');
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = t('passwordTooShort', 'auth');
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch', 'auth');
      isValid = false;
    }

    if (!acceptTerms) {
      newErrors.terms = t('termsRequired', 'auth');
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.fullName,
        password: formData.password,
        phone: formData.phoneNumber,
        uses_banking_app: true,
        uses_student_app: false,
        uses_clothes_app: false,
      };

      await authService.register(userData);

      navigation.navigate('OTPVerification', {
        email: formData.email,
        mode: 'register'
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('registrationFailed', 'auth');
      Alert.alert(t('error', 'common'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <SafeAreaWrapper>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
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
            <Text style={styles.title}>
              {t('registerTitle', 'auth')}
            </Text>
            <Text style={styles.subtitle}>
              {t('registerSubtitle', 'auth')}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label={t('username', 'auth')}
              leftIcon="person-outline"
              placeholder={t('enterUsername', 'auth')}
              value={formData.username}
              onChangeText={(text) => updateFormField('username', text)}
              error={errors.username}
            />

            <Input
              label={t('email', 'auth')}
              leftIcon="mail-outline"
              placeholder={t('enterEmail', 'auth')}
              value={formData.email}
              onChangeText={(text) => updateFormField('email', text)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label={t('fullName', 'auth')}
              leftIcon="person-circle-outline"
              placeholder={t('enterFullName', 'auth')}
              value={formData.fullName}
              onChangeText={(text) => updateFormField('fullName', text)}
              error={errors.fullName}
            />

            <Input
              label={t('phone', 'auth')}
              leftIcon="call-outline"
              placeholder={t('enterPhone', 'auth')}
              value={formData.phoneNumber}
              onChangeText={(text) => updateFormField('phoneNumber', text)}
              error={errors.phoneNumber}
              keyboardType="phone-pad"
            />

            <Input
              label={t('password', 'auth')}
              leftIcon="lock-closed-outline"
              placeholder={t('enterPassword', 'auth')}
              value={formData.password}
              onChangeText={(text) => updateFormField('password', text)}
              error={errors.password}
              isPassword
            />

            <Input
              label={t('confirmPassword', 'auth')}
              leftIcon="lock-closed-outline"
              placeholder={t('enterConfirmPassword', 'auth')}
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormField('confirmPassword', text)}
              error={errors.confirmPassword}
              isPassword
            />

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View style={[
                  styles.checkbox,
                  acceptTerms ? styles.checkedBox : null
                ]}>
                  {acceptTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    {t('agreeToTerms', 'auth')}
                    <Text style={styles.linkText} onPress={() => navigation.navigate('Terms')}>
                      {t('termsConditions', 'profile')}
                    </Text>
                    {t('and', 'auth')}
                    <Text style={styles.linkText} onPress={() => navigation.navigate('PrivacyPolicy')}>
                      {t('privacyPolicy', 'profile')}
                    </Text>
                  </Text>
                  {errors.terms ?
                    <Text style={styles.errorText}>{errors.terms}</Text> : null
                  }
                </View>
              </TouchableOpacity>
            </View>

            <Button
              title={t('signUp', 'auth')}
              loading={isLoading}
              fullWidth
              onPress={handleSignUp}
            />

            <View style={styles.socialContainer}>
              <Text style={styles.socialText}>{t('orSignUpWith', 'auth')}</Text>

              <View style={styles.socialButtonsRow}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={24} color={isDarkMode ? "#fff" : "#000"} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-apple" size={24} color={isDarkMode ? "#fff" : "#000"} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-facebook" size={24} color={isDarkMode ? "#fff" : "#000"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>
              {t('alreadyHaveAccount', 'auth')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInLink}>
                {t('signIn', 'auth')}
              </Text>
            </TouchableOpacity>
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
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('language', 'common')}</Text>
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
                    language === item.id ? styles.selectedLanguage : null
                  ]}
                  onPress={() => changeLanguage(item.id)}
                >
                  <Image
                    source={item.flag}
                    style={styles.languageFlag}
                  />
                  <Text style={[styles.languageText, isDarkMode ? styles.lightText : styles.darkText]}>
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
      {isLoading}
    </SafeAreaWrapper>
  );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#2d3748' : '#f7fafc',
    backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
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
    color: isDarkMode ? '#ffffff' : '#1a202c',
  },
  subtitle: {
    fontSize: 16,
    color: isDarkMode ? '#a0aec0' : '#4a5568',
  },
  formContainer: {
    marginBottom: 24,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 4,
    marginRight: 8,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? '#4a5568' : '#cbd5e0',
  },
  checkedBox: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: isDarkMode ? '#a0aec0' : '#4a5568',
  },
  linkText: {
    color: '#3B82F6',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 14,
    marginTop: 4,
  },
  socialContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  socialText: {
    color: isDarkMode ? '#a0aec0' : '#4a5568',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  socialButton: {
    padding: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: isDarkMode ? '#4a5568' : '#e2e8f0',
    marginHorizontal: 8,
  },
  footer: {
    padding: 24,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: isDarkMode ? '#a0aec0' : '#4a5568',
  },
  signInLink: {
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 4,
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
    backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
    padding: 16,
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
    color: isDarkMode ? '#ffffff' : '#1a202c',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  selectedLanguage: {
    backgroundColor: isDarkMode ? '#4a5568' : '#ebf5ff',
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
  lightText: {
    color: '#ffffff',
  },
  darkText: {
    color: '#1a202c',
  }
});

export default SignUpScreen;