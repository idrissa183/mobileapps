import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View, StyleSheet, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';

import SafeAreaWrapper from "../../components/common/SafeAreaWrapper";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import useTheme from "../../hooks/useTheme";
import useTranslation from "../../hooks/useTranslation";
import { RootStackParamList } from "../../App";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuth from "../../hooks/useAuth";

// type RootStackParamList = {
//   SignIn: undefined;
//   SignUp: undefined;
//   ForgotPassword: undefined;
//   MainApp: undefined;
//   OtpVerification: { email: string; mode: 'login' | 'register' };
// };

const languages = [
  { id: 'en', name: 'English', flag: require('../../assets/flags/usa.png') },
  { id: 'fr', name: 'Français', flag: require('../../assets/flags/france.png') },
];

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignInScreen = () => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { isDarkMode } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const { login, isLoading, needsOtpVerification, pendingEmail } = useAuth();


  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });

  const styles = getStyles(isDarkMode);

  const handleSignIn = async () => {
    setErrors({
      username: '',
      password: '',
    });

    let isValid = true;
    let newErrors = { username: '', password: '' };

    if (!username.trim()) {
      newErrors.username = t('usernameRequired', 'auth');
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = t('passwordRequired', 'auth');
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(username, password);

      // if (!needsOtpVerification) {
      //   navigation.navigate('MainApp');
      // }
    } catch (error: any) {
      if (needsOtpVerification && pendingEmail) {
        navigation.navigate('OTPVerification', {
          email: pendingEmail,
          mode: 'login'
        });
        return;
      }
      if (error.response) {
        switch (error.response.status) {
          case 401:
            Alert.alert(
              t('loginFailed', 'auth'),
              t('incorrectCredentials', 'auth')
            );
            break;
          case 403:
            Alert.alert(
              t('loginFailed', 'auth'),
              t('accountInactive', 'auth')
            );
            break;
          default:
            Alert.alert(
              t('error', 'common'),
              t('serverError', 'common')
            );
        }
      } else {
        Alert.alert(
          t('error', 'common'),
          t('networkError', 'common')
        );
      }
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
              {t('loginTitle', 'auth')}
            </Text>
            <Text style={styles.subtitle}>
              {t('loginSubtitle', 'auth')}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label={t('username', 'auth')}
              leftIcon="person-outline"
              placeholder={t('enterUsername', 'auth')}
              value={username}
              onChangeText={setUsername}
              error={errors.username}
            />

            <Input
              label={t('password', 'auth')}
              leftIcon="lock-closed-outline"
              placeholder={t('enterPassword', 'auth')}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              isPassword
            />

            <View style={styles.rememberForgotRow}>
              <TouchableOpacity
                style={styles.rememberMeRow}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[
                  styles.checkbox,
                  rememberMe ? styles.checkedBox : {}
                ]}>
                  {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.rememberText}>{t('rememberMe', 'auth')}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>
                  {t('forgotPassword', 'auth')}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title={t('signIn', 'auth')}
              loading={isLoading}
              fullWidth
              onPress={handleSignIn}
            />

            <View style={styles.socialContainer}>
              <Text style={styles.socialText}>{t('orSignInWith', 'auth')}</Text>

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
              {t('dontHaveAccount', 'auth')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>
                {t('signUp', 'auth')}
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
                    language === item.id ? styles.selectedLanguage : {}
                  ]}
                  onPress={() => changeLanguage(item.id)}
                >
                  <Image
                    source={item.flag}
                    style={styles.languageFlag}
                  />
                  <Text style={styles.languageText}>
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
  backButton: {
    padding: 4,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
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
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? '#4a5568' : '#cbd5e0',
  },
  checkedBox: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  rememberText: {
    color: isDarkMode ? '#a0aec0' : '#4a5568',
  },
  forgotPassword: {
    color: '#3B82F6',
    fontWeight: '500',
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
    alignItems: 'center',
  },
  footerText: {
    color: isDarkMode ? '#a0aec0' : '#4a5568',
  },
  signUpLink: {
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
    color: isDarkMode ? '#ffffff' : '#1a202c',
  },
});

export default SignInScreen;