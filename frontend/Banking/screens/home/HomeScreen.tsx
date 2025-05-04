import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import transactionService, { Transaction } from '../../services/transactionService';
import axios from 'axios';
import useTheme from '../../hooks/useTheme';
import useTranslation from '../../hooks/useTranslation';
import TransactionsList from '../history/TransactionList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../App';

const { width } = Dimensions.get('window');
type Props = NativeStackScreenProps<MainTabParamList, 'Home'>;
const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currRates, setCurrRates] = useState<{ currency: string; rate: number | null }[]>([]);
  const [balance, setBalance] = useState(1230.60);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const result = await transactionService.getTransactions({ 
          limit: 5,
        });
        setTransactions(result);
      } catch (error) {
        console.error('Erreur lors du chargement des transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const retrieveCurrRates = async () => {
      try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const rates = response?.data.rates;
        const currRatesArray = ['USD', 'XOF', 'EUR'].map((key) => {
          return { currency: key, rate: rates[key] };
        });
        setCurrRates(currRatesArray);
      } catch (error) {
        console.error('Error fetching currency rates:', error);
        setCurrRates([
          { currency: 'USD', rate: 1 },
          { currency: 'XOF', rate: 603.11 },
          { currency: 'EUR', rate: 0.92 }
        ]);
      }
    };

    loadTransactions();
    retrieveCurrRates();
  }, []);

  const flagImages = {
    usd: require('../../assets/flags/usd.jpg'),
    xof: require('../../assets/flags/xof.jpg'),
    eur: require('../../assets/flags/eur.jpg'),
  };

  const formatNumberWithCommas = (number: string) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const balances = currRates.map((currRate, index) => ({
    id: index + 1,
    amount: formatNumberWithCommas((balance * (currRate.rate || 1)).toFixed(2)),
    currency: currRate.currency,
    flag: flagImages[currRate.currency.toLowerCase()] || null,
  }));

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec le titre et l'avatar */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, headerTextStyle]}>{t('balance', 'home')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image 
              source={require('../../assets/avatars/avatar2.jpg')}
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
              <View>
                <Text style={[styles.balanceAmount, headerTextStyle]}>{balance.amount}</Text>
                <Text style={[styles.balanceCurrency, secondaryTextStyle]}>{balance.currency}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Section d'invitation */}
        <View style={styles.inviteContainer}>
          <View>
            <Text style={[styles.inviteText, headerTextStyle]}>{t('inviteYour', 'home')}</Text>
            <Text style={[styles.inviteText, headerTextStyle]}>{t('friendNow', 'home')}</Text>
          </View>
          <TouchableOpacity style={styles.earnButton}>
            <Text style={styles.earnButtonText}>{t('earn100', 'home')}</Text>
          </TouchableOpacity>
        </View>

        {/* Section des transactions */}
        <TransactionsList 
          transactions={transactions}
          isLoading={isLoading}
          showHeader={true}
          showDate={true}
          limit={5}
          onViewAll={() => navigation.navigate('History')}
          navigation={navigation}
          emptyMessage={t('noRecentTransactions', 'transactions')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30
  },
  scrollView: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#1A202C',
  },
  lightContainer: {
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  darkHeaderText: {
    color: '#F9FAFB',
  },
  lightHeaderText: {
    color: '#1F2937',
  },
  darkSecondaryText: {
    color: '#94A3B8',
  },
  lightSecondaryText: {
    color: '#64748B',
  },
  balanceScrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  balanceCard: {
    width: width * 0.75,
    padding: 20,
    borderRadius: 16,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkCard: {
    backgroundColor: '#2D3748',
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  flagContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  flag: {
    width: 48,
    height: 48,
    resizeMode: 'cover',
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
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  earnButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  earnButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default HomeScreen;