import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions 
} from "react-native";
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { isDarkMode } = useTheme();

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;

  const transactions = [
    { 
      id: 1, 
      name: 'Alberto Montero', 
      type: 'Added',
      date: 'Today', 
      amount: '+$600.00', 
      isPositive: true,
      avatar: require('../../assets/avatars/avatar1.jpg')
    },
    { 
      id: 2, 
      name: 'Louis Da Silva', 
      type: 'Added',
      date: '27 Aug', 
      amount: '+$8.50', 
      isPositive: true,
      avatar: require('../../assets/avatars/avatar1.jpg') 
    },
    { 
      id: 3, 
      name: 'Amazon Store', 
      type: 'Paid',
      date: '27 Aug', 
      amount: '-$10.50', 
      isPositive: false,
      avatar: require('../../assets/avatars/avatar1.jpg')
    },
  ];

  // Remplacez ces valeurs par vos propres données
  const balances = [
    { id: 1, currency: 'US Dollar', amount: '1.230,60', flag: require('../../assets/flags/nigeria.jpg') },
    { id: 2, currency: 'Australia Dollar', amount: '3.630,60', flag: require('../../assets/flags/nigeria.jpg') },
    { id: 3, currency: 'Euro', amount: '830,40', flag: require('../../assets/flags/nigeria.jpg') },
  ];

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec le titre et l'avatar */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, headerTextStyle]}>Balance</Text>
          <TouchableOpacity>
            <Image 
              source={require('../../assets/avatars/avatar1.jpg')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Section des soldes avec défilement horizontal */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.balanceScrollContainer}
        >
          {balances.map((balance) => (
            <View key={balance.id} style={[styles.balanceCard, cardStyle]}>
              <View style={styles.flagContainer}>
                <Image source={balance.flag} style={styles.flag} />
              </View>
              <Text style={[styles.balanceAmount, headerTextStyle]}>{balance.amount}</Text>
              <Text style={[styles.balanceCurrency, secondaryTextStyle]}>{balance.currency}</Text>
            </View>
          ))}
        </ScrollView>
        
        {/* Section d'invitation */}
        <View style={styles.inviteContainer}>
          <View>
            <Text style={[styles.inviteText, headerTextStyle]}>Invite your</Text>
            <Text style={[styles.inviteText, headerTextStyle]}>friend now!</Text>
          </View>
          <TouchableOpacity style={styles.earnButton}>
            <Text style={styles.earnButtonText}>Earn $100</Text>
          </TouchableOpacity>
        </View>
        
        {/* Section des transactions */}
        <View style={styles.transactionSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, headerTextStyle]}>Transaction</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Liste des transactions */}
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <Image source={transaction.avatar} style={styles.transactionAvatar} />
                <View>
                  <Text style={[styles.transactionName, headerTextStyle]}>{transaction.name}</Text>
                  <View style={styles.transactionMeta}>
                    <Text style={[styles.transactionType, secondaryTextStyle]}>{transaction.type}</Text>
                    <Text style={[styles.transactionDate, secondaryTextStyle]}> • {transaction.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={[
                styles.transactionAmount, 
                transaction.isPositive ? styles.positiveAmount : styles.negativeAmount
              ]}>
                {transaction.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Styles de base
  container: {
    flex: 1,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  balanceScrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  balanceCard: {
    width: width * 0.4,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  flagContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  flag: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceCurrency: {
    fontSize: 14,
  },
  inviteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  inviteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
  },
  earnButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  earnButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  transactionSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  transactionName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
  },
  transactionType: {
    fontSize: 14,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    fontWeight: '600',
    fontSize: 16,
  },
  positiveAmount: {
    color: '#10B981',
  },
  negativeAmount: {
    color: '#EF4444',
  },
  
  // Styles pour le mode clair
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  lightCard: {
    backgroundColor: '#F3F4F6',
  },
  lightText: {
    color: '#374151',
  },
  lightHeaderText: {
    color: '#111827',
  },
  lightSecondaryText: {
    color: '#6B7280',
  },
  
  // Styles pour le mode sombre
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  darkCard: {
    backgroundColor: '#1E293B',
  },
  darkText: {
    color: '#E5E7EB',
  },
  darkHeaderText: {
    color: '#F9FAFB',
  },
  darkSecondaryText: {
    color: '#9CA3AF',
  },
});

export default HomeScreen;