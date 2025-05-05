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
  ActivityIndicator
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

  const handleLogout = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erreur', 'Échec de la déconnexion');
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    { id: 3, title: t('history', 'profile'), icon: '📊', screen: 'History' },
    { id: 4, title: t('invite', 'profile'), icon: '👥', screen: 'InviteFriends' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, containerStyle, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={[styles.loadingText, headerTextStyle]}> {t('loading', 'profile')}</Text>
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

        {/* Statistiques utilisateur */}
        <View style={[styles.statsCard, cardStyle]}>
          <View style={styles.statItem}>
            
            <Text style={[styles.statLabel, secondaryTextStyle]}>  {t('transactions', 'profile')}</Text>
          </View>
          <View style={[styles.statDivider, dividerStyle]} />
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
          <Text style={[styles.sectionTitle, headerTextStyle]}>  {t('menu', 'profile')}</Text>

          <View style={[styles.menuCard, cardStyle]}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate(item.screen, { userData })}
                >
                  <View style={styles.menuLeft}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={[styles.menuText, headerTextStyle]}>{item.title}</Text>
                  </View>
                  <Text style={[styles.menuArrow, secondaryTextStyle]}>→</Text>
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
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>

        {/* Espace en bas pour le scrolling */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
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
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
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
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
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
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDivider: {
    height: 1,
    width: '100%',
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
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
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
});

export default ProfileScreen;
