import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  Linking,
  Share
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import authService from '../../services/authService';
import useAuth from '../../hooks/useAuth';
import { UserProfile } from '../../services/types';
import useTranslation from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const [userData, setUserData] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const dividerStyle = isDarkMode ? styles.darkDivider : styles.lightDivider;

  const { logout } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const user = await authService.getUser();
      setUserData(user);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer vos informations');
    } finally {
      setLoading(false);
    }
  };

  const showLogoutConfirmation = (): void => {
    setLogoutModalVisible(true);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoggingOut(true);
      await logout();

      setTimeout(() => {
        setLogoutModalVisible(false);
      }, 500);
    } catch (error: any) {
      setIsLoggingOut(false);
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

  const inviteFriends = () => {
    setShareModalVisible(true);
  };

  const shareViaWhatsApp = async () => {
    const message = t('inviteMessage', 'profile') || "Join me on this awesome app!";
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          t('error', 'common'),
          t('whatsappNotInstalled', 'profile') || "WhatsApp is not installed on your device"
        );
      }
    } catch (error) {
      Alert.alert(t('error', 'common'), t('cannotOpenWhatsapp', 'profile') || "Cannot open WhatsApp");
    } finally {
      setShareModalVisible(false);
    }
  };

  const shareViaTelegram = async () => {
    const message = t('inviteMessage', 'profile') || "Join me on this awesome app!";
    const telegramUrl = `tg://msg?text=${encodeURIComponent(message)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(telegramUrl);
      if (canOpen) {
        await Linking.openURL(telegramUrl);
      } else {
        Alert.alert(
          t('error', 'common'),
          t('telegramNotInstalled', 'profile') || "Telegram is not installed on your device"
        );
      }
    } catch (error) {
      Alert.alert(t('error', 'common'), t('cannotOpenTelegram', 'profile') || "Cannot open Telegram");
    } finally {
      setShareModalVisible(false);
    }
  };

  const shareViaOther = async () => {
    try {
      const message = t('inviteMessage', 'profile') || "Join me on this awesome app!";
      await Share.share({
        message,
      });
    } catch (error) {
      Alert.alert(t('error', 'common'), t('shareError', 'profile') || "Error sharing");
    } finally {
      setShareModalVisible(false);
    }
  };

  const menuItems = [
    { 
      id: 3, 
      title: t('history', 'profile'), 
      icon: 'time-outline', 
      screen: 'History' 
    },
    { 
      id: 4, 
      title: t('invite', 'profile'), 
      icon: 'people-outline', 
      onPress: inviteFriends 
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, containerStyle, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={[styles.loadingText, headerTextStyle]}>{t('loading', 'profile')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      {/* Header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, headerTextStyle]}>{t('title', 'profile')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Section du profil utilisateur */}
        <View style={[styles.profileCard, cardStyle]}>
          <View style={styles.profileInfo}>
            <Image
              source={userData?.profile_image
                ? { uri: userData.profile_image }
                : require('../../assets/avatars/avatar2.jpg')}
              style={styles.profileAvatar}
            />
            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, headerTextStyle]}>{userData?.full_name}</Text>
              <Text style={[styles.profileEmail, secondaryTextStyle]}>{userData?.email}</Text>
            </View>
          </View>
        </View>

        {/* Statistiques utilisateur - Member Since only */}
        <View style={[styles.statsCard, cardStyle]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, secondaryTextStyle]}>{t('memberSince', 'profile')}</Text>
            <Text style={[styles.statValue, headerTextStyle]}>
              {userData?.created_at
                ? new Date(userData.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long'
                })
                : t('notAvailable', 'profile')}
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, headerTextStyle]}>{t('menu', 'profile')}</Text>

          <View style={[styles.menuCard, cardStyle]}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => item.onPress ? item.onPress() : navigation.navigate(item.screen, { userData })}
                >
                  <View style={styles.menuLeft}>
                    <Ionicons 
                      name={item.icon} 
                      size={24} 
                      color={isDarkMode ? colors.dark.onSurface : colors.light.onSurface} 
                      style={styles.menuIconStyle}
                    />
                    <Text style={[styles.menuText, headerTextStyle]}>{item.title}</Text>
                  </View>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={isDarkMode ? colors.dark.onSurfaceVariant : colors.light.onSurfaceVariant} 
                  />
                </TouchableOpacity>
                {index < menuItems.length - 1 && (
                  <View style={[styles.menuDivider, dividerStyle]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Bouton de déconnexion */}
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

        {/* Espace en bas pour le scrolling */}
        <View style={styles.bottomSpace} />
      </ScrollView>

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
                    {t('logoutConfirm', 'auth')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal for Invite Friends */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, isDarkMode ? styles.darkModal : styles.lightModal, styles.shareModalContainer]}>
            <View style={styles.shareModalHeader}>
              <Text style={[styles.shareModalTitle, headerTextStyle]}>
                {t('inviteFriends', 'profile') || 'Invite Friends'}
              </Text>
              <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={isDarkMode ? colors.dark.onSurface : colors.light.onSurface} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.shareModalContent}>
              <TouchableOpacity style={styles.shareOption} onPress={shareViaWhatsApp}>
                <View style={[styles.shareIconContainer, { backgroundColor: '#25D366' }]}>
                  <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
                </View>
                <Text style={[styles.shareOptionText, headerTextStyle]}>WhatsApp</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareOption} onPress={shareViaTelegram}>
                <View style={[styles.shareIconContainer, { backgroundColor: '#0088cc' }]}>
                  <Ionicons name="paper-plane" size={28} color="#FFFFFF" />
                </View>
                <Text style={[styles.shareOptionText, headerTextStyle]}>Telegram</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareOption} onPress={shareViaOther}>
                <View style={[styles.shareIconContainer, { backgroundColor: '#6366F1' }]}>
                  <Ionicons name="share-social" size={28} color="#FFFFFF" />
                </View>
                <Text style={[styles.shareOptionText, headerTextStyle]}>{t('other', 'profile') || 'Other'}</Text>
              </TouchableOpacity>
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
  // Styles de base
  container: {
    flex: 1,
    paddingTop: 30,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
  },
  profileDetails: {
    justifyContent: 'center',
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconStyle: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    width: '100%',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  bottomSpace: {
    height: 40,
  },

  // Styles pour le mode clair
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  lightCard: {
    backgroundColor: '#F3F4F6',
  },
  lightHeaderText: {
    color: '#111827',
  },
  lightSecondaryText: {
    color: '#6B7280',
  },
  lightDivider: {
    backgroundColor: '#E5E7EB',
  },
  lightModal: {
    backgroundColor: colors.light.surface,
  },

  // Styles pour le mode sombre
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  darkCard: {
    backgroundColor: '#1E293B',
  },
  darkHeaderText: {
    color: '#F9FAFB',
  },
  darkSecondaryText: {
    color: '#9CA3AF',
  },
  darkDivider: {
    backgroundColor: '#374151',
  },
  darkModal: {
    backgroundColor: colors.dark.surface,
  },
  logoutButtonDark: {
    backgroundColor: colors.dark.logout,
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
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // Share modal styles
  shareModalContainer: {
    width: 300,
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.2)',
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  shareModalContent: {
    marginTop: 16,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  shareIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareOptionText: {
    fontSize: 16,
  },
});

export default ProfileScreen;