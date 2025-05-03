import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Switch,
  Dimensions
} from "react-native";
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const dividerStyle = isDarkMode ? styles.darkDivider : styles.lightDivider;

  const userData = {
    name: 'Alberto Montero',
    email: 'alberto.montero@example.com',
    phone: '+1 234 567 890',
    avatar: require('../../assets/avatars/avatar2.jpg'),
    totalTransactions: 47,
    joined: 'August 2023'
  };

  const menuItems = [
    { id: 1, title: 'Personal Information', icon: '👤', screen: 'PersonalInfo' },
    { id: 2, title: 'Payment Methods', icon: '💳', screen: 'PaymentMethods' },
    { id: 3, title: 'Transaction History', icon: '📊', screen: 'History' },
    { id: 4, title: 'Invite Friends', icon: '👥', screen: 'InviteFriends' },
    { id: 5, title: 'Help & Support', icon: '❓', screen: 'Support' },
    { id: 6, title: 'Terms & Privacy', icon: '📜', screen: 'Terms' },
  ];

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec bouton de retour et titre */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, headerTextStyle]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, headerTextStyle]}>Profile</Text>
          <View style={{ width: 24 }} /> {/* Espace pour équilibrer le header */}
        </View>

        {/* Section du profil utilisateur */}
        <View style={[styles.profileCard, cardStyle]}>
          <View style={styles.profileInfo}>
            <Image source={userData.avatar} style={styles.profileAvatar} />
            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, headerTextStyle]}>{userData.name}</Text>
              <Text style={[styles.profileEmail, secondaryTextStyle]}>{userData.email}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques utilisateur */}
        <View style={[styles.statsCard, cardStyle]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, headerTextStyle]}>{userData.totalTransactions}</Text>
            <Text style={[styles.statLabel, secondaryTextStyle]}>Transactions</Text>
          </View>
          <View style={[styles.statDivider, dividerStyle]} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, secondaryTextStyle]}>Member since</Text>
            <Text style={[styles.statValue, headerTextStyle]}>{userData.joined}</Text>
          </View>
        </View>

        {/* Paramètres */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, headerTextStyle]}>Settings</Text>
          
          <View style={[styles.settingCard, cardStyle]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🌓</Text>
                <Text style={[styles.settingText, headerTextStyle]}>Dark Mode</Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: "#1E40AF" }}
                thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleTheme}
                value={isDarkMode}
              />
            </View>
            
            <View style={[styles.settingDivider, dividerStyle]} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔔</Text>
                <Text style={[styles.settingText, headerTextStyle]}>Notifications</Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: "#1E40AF" }}
                thumbColor={isNotificationsEnabled ? "#ffffff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setIsNotificationsEnabled}
                value={isNotificationsEnabled}
              />
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, headerTextStyle]}>Menu</Text>
          
          <View style={[styles.menuCard, cardStyle]}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigation.navigate(item.screen)}
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
          onPress={() => {
            // Logic for logout
            console.log('Logging out...');
          }}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
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
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
  },
  profileDetails: {
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
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