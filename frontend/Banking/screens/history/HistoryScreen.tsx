import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import transactionService, { Transaction, TransactionType } from '../../services/transactionService';
import Loader from '../../components/common/Loader';
import useTheme from '../../hooks/useTheme';
import useTranslation from '../../hooks/useTranslation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../App';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 10;
type Props = NativeStackScreenProps<MainTabParamList, 'History'>;

const HistoryScreen: React.FC<Props> = ({ navigation }) => {

  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const inputStyle = isDarkMode ? styles.darkInput : styles.lightInput;

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

  const filters = [
    'All',
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
    TransactionType.TRANSFER
  ];

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  useEffect(() => {
    if (!transactions) return;

    let filtered = [...transactions];

    if (activeFilter !== 'All') {
      filtered = filtered.filter(t => t.transaction_type === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.recipient_name && t.recipient_name.toLowerCase().includes(query)) ||
        (t.transaction_id && t.transaction_id.toLowerCase().includes(query))
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, activeFilter, searchQuery]);

  const loadTransactions = async (loadMore = false) => {
    try {
      if (loadMore && !hasMorePages) return;

      if (!loadMore) {
        setIsLoading(true);
        setCurrentPage(1);
      }

      const pageToLoad = loadMore ? currentPage + 1 : 1;

      const result = await transactionService.getTransactions({
        limit: ITEMS_PER_PAGE,
        offset: (pageToLoad - 1) * ITEMS_PER_PAGE
      });

      if (result.length < ITEMS_PER_PAGE) {
        setHasMorePages(false);
      }

      if (loadMore) {
        setTransactions(prev => [...(prev || []), ...result]);
        setCurrentPage(pageToLoad);
      } else {
        setTransactions(result);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!transactions) return { income: 0, expense: 0 };

    return transactions.reduce((totals, transaction) => {
      if (transaction.transaction_type === TransactionType.DEPOSIT ||
        (transaction.transaction_type === TransactionType.TRANSFER && transaction.amount > 0)) {
        totals.income += transaction.amount;
      } else {
        totals.expense += Math.abs(transaction.amount);
      }
      return totals;
    }, { income: 0, expense: 0 });
  };

  const totals = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDateForGrouping = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const groupTransactionsByDate = () => {
    if (!filteredTransactions) return {};

    return filteredTransactions.reduce<Record<string, Transaction[]>>((groups, transaction) => {
      const date = formatDateForGrouping(transaction.transaction_date);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});
  };

  const groupedTransactions = groupTransactionsByDate();

  const isPositiveTransaction = (transaction: Transaction) => {
    return transaction.transaction_type === TransactionType.DEPOSIT ||
      (transaction.transaction_type === TransactionType.TRANSFER && transaction.amount > 0);
  };

  const renderTransactionGroup = ([date, transactions]: [string, Transaction[]]) => (
    <View key={date} style={styles.dateGroup}>
      <Text style={[styles.dateHeader, secondaryTextStyle]}>{date}</Text>

      {transactions.map((transaction: Transaction) => (
        <TouchableOpacity
          key={transaction.id}
          style={[styles.transactionItem, cardStyle]}
          onPress={() => navigation.navigate('TransactionDetail', { transaction })}
        >
          <View style={styles.transactionLeft}>
            <View style={[styles.iconContainer, isPositiveTransaction(transaction) ? styles.incomeIcon : styles.expenseIcon]}>
              {transaction.transaction_type === TransactionType.DEPOSIT && (
                <Ionicons name="arrow-down" size={20} color="#fff" />
              )}
              {transaction.transaction_type === TransactionType.WITHDRAWAL && (
                <Ionicons name="arrow-up" size={20} color="#fff" />
              )}
              {transaction.transaction_type === TransactionType.TRANSFER && (
                <Ionicons name="swap-horizontal" size={20} color="#fff" />
              )}
            </View>

            <View>
              <Text style={[styles.transactionName, headerTextStyle]}>
                {transaction.transaction_type === TransactionType.TRANSFER
                  ? (transaction.amount < 0
                    ? t('transferTo', 'transactions')
                    : t('transferFrom', 'transactions'))
                  : transaction.description || t(transaction.transaction_type, 'transactions')}
              </Text>
              <View style={styles.transactionMeta}>
                <Text style={[styles.transactionType, secondaryTextStyle]}>
                  {t(transaction.transaction_type, 'transactions')}
                </Text>
                <Text style={[styles.transactionStatus,
                transaction.status === 'completed' ? styles.statusCompleted :
                  transaction.status === 'pending' ? styles.statusPending : styles.statusFailed
                ]}>
                  • {t(transaction.status, 'transactions')}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[
            styles.transactionAmount,
            isPositiveTransaction(transaction) ? styles.positiveAmount : styles.negativeAmount
          ]}>
            {isPositiveTransaction(transaction) ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, headerTextStyle]}>{t('transactionHistory', 'history')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Barre de recherche */}
      <View style={[styles.searchContainer, isDarkMode ? styles.darkSearchContainer : styles.lightSearchContainer]}>
        <Ionicons name="search" size={20} color={isDarkMode ? "#94A3B8" : "#64748B"} />
        <TextInput
          style={[styles.searchInput, inputStyle]}
          placeholder={t('searchTransactions', 'history')}
          placeholderTextColor={isDarkMode ? "#94A3B8" : "#64748B"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={isDarkMode ? "#94A3B8" : "#64748B"} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, cardStyle]}>
          <View style={[styles.iconContainer, styles.incomeIcon]}>
            <Ionicons name="arrow-down" size={20} color="#fff" />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={[styles.summaryLabel, secondaryTextStyle]}>{t('income', 'transactions')}</Text>
            <Text style={[styles.summaryValue, headerTextStyle]}>{formatCurrency(totals.income)}</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, cardStyle]}>
          <View style={[styles.iconContainer, styles.expenseIcon]}>
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={[styles.summaryLabel, secondaryTextStyle]}>{t('expense', 'transactions')}</Text>
            <Text style={[styles.summaryValue, headerTextStyle]}>{formatCurrency(totals.expense)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainContentContainer}>
        {/* Filtres */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filters.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  activeFilter === filter ? (isDarkMode ? styles.darkActiveFilter : styles.lightActiveFilter) : null
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter ? styles.activeFilterText : secondaryTextStyle
                  ]}
                >
                  {t(filter.toLowerCase(), 'transactions')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Liste des transactions */}
        {isLoading && !transactions ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : filteredTransactions && filteredTransactions.length > 0 ? (
          <ScrollView
            style={styles.transactionsList}
            showsVerticalScrollIndicator={false}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

              if (isCloseToBottom && hasMorePages && !isLoading) {
                loadTransactions(true);
              }
            }}
            scrollEventThrottle={400}
          >
            {Object.entries(groupedTransactions).map(renderTransactionGroup)}

            {isLoading && hasMorePages && (
              <View style={styles.paginationLoader}>
                <Loader size="small" />
              </View>
            )}

            {!hasMorePages && (
              <Text style={[styles.noMoreTransactions, secondaryTextStyle]}>
                {t('noMoreTransactions', 'transactions')}
              </Text>
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={isDarkMode ? "#60A5FA" : "#3B82F6"} />
            <Text style={[styles.emptyText, headerTextStyle]}>
              {t('noTransactions', 'transactions')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  lightContainer: {
    backgroundColor: '#F8FAFC',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  lightHeaderText: {
    color: '#1E293B',
  },
  darkHeaderText: {
    color: '#F8FAFC',
  },
  lightSecondaryText: {
    color: '#64748B',
  },
  darkSecondaryText: {
    color: '#94A3B8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
    marginBottom: 16,
  },
  lightSearchContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkSearchContainer: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  lightInput: {
    color: '#1E293B',
  },
  darkInput: {
    color: '#F8FAFC',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: (width - 40) / 2,
    padding: 12,
    borderRadius: 12,
  },
  lightCard: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: '#10B981',
  },
  expenseIcon: {
    backgroundColor: '#EF4444',
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  mainContentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },

  filtersContentContainer: {
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingRight: 8,
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    height: 36,
  },
  filterText: {
    fontSize: 14,
  },
  lightActiveFilter: {
    backgroundColor: '#EBF5FF',
  },
  darkActiveFilter: {
    backgroundColor: '#334155',
  },
  activeFilterText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  transactionsList: {
    flex: 1,
    marginTop: 4,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionType: {
    fontSize: 14,
  },
  transactionStatus: {
    fontSize: 14,
    marginLeft: 4,
  },
  statusCompleted: {
    color: '#10B981',
  },
  statusPending: {
    color: '#F59E0B',
  },
  statusFailed: {
    color: '#EF4444',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveAmount: {
    color: '#10B981',
  },
  negativeAmount: {
    color: '#EF4444',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  paginationLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noMoreTransactions: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  filtersWrapper: {
    maxHeight: 52, // Limite la hauteur de la zone des filtres
  },
});

export default HistoryScreen;