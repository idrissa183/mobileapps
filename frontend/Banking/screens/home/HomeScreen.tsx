import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import transactionService, { Transaction, Currency } from '../../services/transactionService';
import accountService from '../../services/accountService';
import { MainTabParamList } from '../../App';
import useTranslation from '../../hooks/useTranslation';
import TransactionsList from '../history/TransactionList';

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
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [balances, setBalances] = useState<Array<{
    id: number;
    amount: number;
    currency: string;
    flag: any;
    loading: boolean;
  }>>([
    { id: 1, amount: 0.00, currency: Currency.USD, flag: require('../../assets/flags/usd.jpg'), loading: true },
    { id: 2, amount: 0.00, currency: Currency.XOF, flag: require('../../assets/flags/xof.jpg'), loading: true },
    { id: 3, amount: 0.00, currency: Currency.EUR, flag: require('../../assets/flags/eur.jpg'), loading: true },
  ]);

  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setBalanceLoading(true);

      const [transactions, account] = await Promise.all([
        transactionService.getTransactions({ limit: 5 }),
        accountService.getUserAccount()
      ]);

      setTransactions(transactions);

      const updatedBalances = balances.map(b =>
        b.currency === Currency.USD
          ? {
            ...b,
            amount: formatNumberWithCommas((account.balance || 0).toFixed(2)),
            loading: false
          }
          : b
      );

      setBalances(updatedBalances);

      await convertBalancesToOtherCurrencies(account.balance || 0, updatedBalances);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setBalances(prev => prev.map(b => ({ ...b, loading: false, amount: 0 })));
    } finally {
      setIsLoading(false);
      setBalanceLoading(false);
    }
  }, []);


  useFocusEffect(
    useCallback(() => {
      loadUserData();
      return () => {
      };
    }, [loadUserData])
  );

  const convertBalancesToOtherCurrencies = async (usdBalance: number, baseBalances: typeof balances) => {
    try {
      const updatedBalances = [...baseBalances];

      const eurIndex = updatedBalances.findIndex(b => b.currency === Currency.EUR);
      if (eurIndex !== -1) {
        try {
          if (usdBalance === 0) {
            updatedBalances[eurIndex] = {
              ...updatedBalances[eurIndex],
              amount: 0,
              loading: false
            };
          } else {
            const eurAmount = await accountService.convertCurrency(
              usdBalance,
              Currency.USD,
              Currency.EUR
            );
            updatedBalances[eurIndex] = {
              ...updatedBalances[eurIndex],
              amount: formatNumberWithCommas(eurAmount.toFixed(2)),
              loading: false
            };
          }
        } catch (err) {
          console.error('Erreur lors de la conversion en EUR:', err);
          updatedBalances[eurIndex] = {
            ...updatedBalances[eurIndex],
            amount: 0,
            loading: false
          };
        }
      }

      const xofIndex = updatedBalances.findIndex(b => b.currency === Currency.XOF);
      if (xofIndex !== -1) {
        try {
          if (usdBalance === 0) {
            updatedBalances[xofIndex] = {
              ...updatedBalances[xofIndex],
              amount: 0,
              loading: false
            };
          } else {
            const xofAmount = await accountService.convertCurrency(
              usdBalance,
              Currency.USD,
              Currency.XOF
            );
            updatedBalances[xofIndex] = {
              ...updatedBalances[xofIndex],
              amount: formatNumberWithCommas(xofAmount.toFixed(2)),
              loading: false
            };
          }
        } catch (err) {
          console.error('Erreur lors de la conversion en XOF:', err);
          updatedBalances[xofIndex] = {
            ...updatedBalances[xofIndex],
            amount: 0,
            loading: false
          };
        }
      }

      setBalances(updatedBalances);
    } catch (error) {
      console.error('Erreur lors de la conversion des devises:', error);
      setBalances(prev =>
        prev.map(b => ({ ...b, loading: false, amount: 0 }))
      );
    }
  };

  const formatNumberWithCommas = (number: string) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

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
                {balance.loading ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <>
                    <Text style={[styles.balanceAmount, headerTextStyle]}>{balance.amount}</Text>
                    <Text style={[styles.balanceCurrency, secondaryTextStyle]}>{balance.currency}</Text>
                  </>
                )}
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