// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   ScrollView, 
//   SafeAreaView, 
//   StyleSheet, 
//   Image, 
//   TouchableOpacity, 
//   Dimensions 
// } from "react-native";
// import { useTheme } from '../../hooks/useTheme';

// const { width } = Dimensions.get('window');

// const HistoryScreen = () => {
//   const { isDarkMode } = useTheme();
//   const [activeFilter, setActiveFilter] = useState('All');

//   const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
//   const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
//   const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
//   const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;

//   const filters = ['All', 'Income', 'Expense', 'Transfer'];

//   const transactions = [
//     { 
//       id: 1, 
//       name: 'Alberto Montero', 
//       type: 'Added',
//       category: 'Income',
//       date: '30 Apr 2025', 
//       amount: '+$600.00', 
//       isPositive: true,
//       avatar: require('../../assets/avatars/avatar2.jpg')
//     },
//     { 
//       id: 2, 
//       name: 'Louis Da Silva', 
//       type: 'Added',
//       category: 'Income',
//       date: '27 Apr 2025', 
//       amount: '+$8.50', 
//       isPositive: true,
//       avatar: require('../../assets/avatars/avatar2.jpg') 
//     },
//     { 
//       id: 3, 
//       name: 'Amazon Store', 
//       type: 'Paid',
//       category: 'Expense',
//       date: '25 Apr 2025', 
//       amount: '-$10.50', 
//       isPositive: false,
//       avatar: require('../../assets/avatars/avatar2.jpg')
//     },
//     { 
//       id: 4, 
//       name: 'Transfer to Savings', 
//       type: 'Transfer',
//       category: 'Transfer',
//       date: '20 Apr 2025', 
//       amount: '-$200.00', 
//       isPositive: false,
//       avatar: require('../../assets/avatars/avatar2.jpg')
//     },
//     { 
//       id: 5, 
//       name: 'Spotify Premium', 
//       type: 'Subscription',
//       category: 'Expense',
//       date: '15 Apr 2025', 
//       amount: '-$9.99', 
//       isPositive: false,
//       avatar: require('../../assets/avatars/avatar2.jpg')
//     },
//     { 
//       id: 6, 
//       name: 'Paycheck', 
//       type: 'Salary',
//       category: 'Income',
//       date: '10 Apr 2025', 
//       amount: '+$2,450.00', 
//       isPositive: true,
//       avatar: require('../../assets/avatars/avatar2.jpg')
//     },
//     { 
//       id: 7, 
//       name: 'Transfer from John', 
//       type: 'Received',
//       category: 'Transfer',
//       date: '5 Apr 2025', 
//       amount: '+$75.00', 
//       isPositive: true,
//       avatar: require('../../assets/avatars/avatar2.jpg')
//     },
//     { 
//       id: 8, 
//       name: 'Uber Ride', 
//       type: 'Transportation',
//       category: 'Expense',
//       date: '2 Apr 2025', 
//       amount: '-$12.75', 
//       isPositive: false,
//       avatar: require('../../assets/avatars/avatar2.jpg')
//     },
//   ];

//   const filteredTransactions = activeFilter === 'All' 
//     ? transactions 
//     : transactions.filter(t => t.category === activeFilter);

//   // Grouper les transactions par date
//   const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
//     const date = transaction.date;
//     if (!groups[date]) {
//       groups[date] = [];
//     }
//     groups[date].push(transaction);
//     return groups;
//   }, {});

//   // Calculer les totaux
//   const totals = {
//     income: transactions.filter(t => t.isPositive).reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0),
//     expense: transactions.filter(t => !t.isPositive).reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0)
//   };

//   // Formater pour l'affichage
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
//   };

//   return (
//     <SafeAreaView style={[styles.container, containerStyle]}>
//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {/* Header avec le titre et l'avatar */}
//         <View style={styles.header}>
//           <Text style={[styles.headerTitle, headerTextStyle]}>Transaction History</Text>
//           <TouchableOpacity>
//             <Image 
//               source={require('../../assets/avatars/avatar2.jpg')}
//               style={styles.avatar}
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Summary Cards */}
//         <View style={styles.summaryContainer}>
//           <View style={[styles.summaryCard, cardStyle]}>
//             <View style={[styles.iconContainer, styles.incomeIcon]}>
//               <Text style={styles.iconText}>↓</Text>
//             </View>
//             <Text style={[styles.summaryLabel, secondaryTextStyle]}>Income</Text>
//             <Text style={[styles.summaryAmount, headerTextStyle, styles.positiveAmount]}>
//               {formatCurrency(totals.income)}
//             </Text>
//           </View>

//           <View style={[styles.summaryCard, cardStyle]}>
//             <View style={[styles.iconContainer, styles.expenseIcon]}>
//               <Text style={styles.iconText}>↑</Text>
//             </View>
//             <Text style={[styles.summaryLabel, secondaryTextStyle]}>Expenses</Text>
//             <Text style={[styles.summaryAmount, headerTextStyle, styles.negativeAmount]}>
//               {formatCurrency(totals.expense)}
//             </Text>
//           </View>
//         </View>

//         {/* Filter tabs */}
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false} 
//           contentContainerStyle={styles.filterContainer}
//         >
//           {filters.map((filter) => (
//             <TouchableOpacity
//               key={filter}
//               style={[
//                 styles.filterButton,
//                 activeFilter === filter && styles.activeFilterButton
//               ]}
//               onPress={() => setActiveFilter(filter)}
//             >
//               <Text
//                 style={[
//                   styles.filterText,
//                   activeFilter === filter ? styles.activeFilterText : secondaryTextStyle
//                 ]}
//               >
//                 {filter}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* Transactions List Grouped by Date */}
//         <View style={styles.transactionList}>
//           {Object.keys(groupedTransactions).map((date) => (
//             <View key={date} style={styles.dateGroup}>
//               <Text style={[styles.dateHeader, secondaryTextStyle]}>{date}</Text>

//               {groupedTransactions[date].map((transaction) => (
//                 <View key={transaction.id} style={[styles.transactionItem, cardStyle]}>
//                   <View style={styles.transactionLeft}>
//                     <Image source={transaction.avatar} style={styles.transactionAvatar} />
//                     <View>
//                       <Text style={[styles.transactionName, headerTextStyle]}>{transaction.name}</Text>
//                       <View style={styles.transactionMeta}>
//                         <Text style={[styles.transactionType, secondaryTextStyle]}>{transaction.type}</Text>
//                         <Text style={[styles.transactionCategory, 
//                           transaction.isPositive ? styles.categoryIncome : 
//                           transaction.category === 'Transfer' ? styles.categoryTransfer : styles.categoryExpense
//                         ]}>
//                           • {transaction.category}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                   <Text style={[
//                     styles.transactionAmount, 
//                     transaction.isPositive ? styles.positiveAmount : styles.negativeAmount
//                   ]}>
//                     {transaction.amount}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   // Base styles
//   container: {
//     flex: 1,
//     paddingTop:30,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 10,
//     paddingBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },

//   // Summary cards
//   summaryContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     justifyContent: 'space-between',
//   },
//   summaryCard: {
//     width: width * 0.43,
//     borderRadius: 16,
//     padding: 16,
//   },
//   iconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   incomeIcon: {
//     backgroundColor: 'rgba(16, 185, 129, 0.2)',
//   },
//   expenseIcon: {
//     backgroundColor: 'rgba(239, 68, 68, 0.2)',
//   },
//   iconText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   summaryLabel: {
//     fontSize: 14,
//     marginBottom: 4,
//   },
//   summaryAmount: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },

//   // Filter styles
//   filterContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 24,
//     flexDirection: 'row',
//   },
//   filterButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginRight: 12,
//     backgroundColor: 'transparent',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   activeFilterButton: {
//     backgroundColor: '#1E40AF',
//     borderColor: '#1E40AF',
//   },
//   filterText: {
//     fontWeight: '500',
//     fontSize: 14,
//   },
//   activeFilterText: {
//     color: '#FFFFFF',
//   },

//   // Transaction list
//   transactionList: {
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//   },
//   dateGroup: {
//     marginBottom: 20,
//   },
//   dateHeader: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   transactionItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//     borderRadius: 12,
//     padding: 12,
//   },
//   transactionLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   transactionAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   transactionName: {
//     fontWeight: '600',
//     fontSize: 16,
//     marginBottom: 4,
//   },
//   transactionMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   transactionType: {
//     fontSize: 14,
//     marginRight: 4,
//   },
//   transactionCategory: {
//     fontSize: 12,
//     fontWeight: '500',
//     paddingHorizontal: 4,
//   },
//   categoryIncome: {
//     color: '#10B981',
//   },
//   categoryExpense: {
//     color: '#EF4444',
//   },
//   categoryTransfer: {
//     color: '#6366F1',
//   },
//   transactionAmount: {
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   positiveAmount: {
//     color: '#10B981',
//   },
//   negativeAmount: {
//     color: '#EF4444',
//   },

//   // Light mode styles
//   lightContainer: {
//     backgroundColor: '#FFFFFF',
//   },
//   lightCard: {
//     backgroundColor: '#F3F4F6',
//   },
//   lightHeaderText: {
//     color: '#111827',
//   },
//   lightSecondaryText: {
//     color: '#6B7280',
//   },

//   // Dark mode styles
//   darkContainer: {
//     backgroundColor: '#0F172A',
//   },
//   darkCard: {
//     backgroundColor: '#1E293B',
//   },
//   darkHeaderText: {
//     color: '#F9FAFB',
//   },
//   darkSecondaryText: {
//     color: '#9CA3AF',
//   },
// });

// export default HistoryScreen;



















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
  FlatList,
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

  // États pour les transactions et le chargement
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

  // Filtres disponibles
  const filters = [
    'All',
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
    TransactionType.TRANSFER
  ];

  // Charger les transactions quand l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  // Effet pour filtrer les transactions
  useEffect(() => {
    if (!transactions) return;

    let filtered = [...transactions];

    // Filtrer par type
    if (activeFilter !== 'All') {
      filtered = filtered.filter(t => t.transaction_type === activeFilter);
    }

    // Filtrer par recherche
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

  // Charger les transactions
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

  // Calculer les totaux
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

  // Formater pour l'affichage
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Formater la date pour regroupement
  const formatDateForGrouping = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Regrouper les transactions par date
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

  // Déterminer si une transaction est positive
  const isPositiveTransaction = (transaction: Transaction) => {
    return transaction.transaction_type === TransactionType.DEPOSIT ||
      (transaction.transaction_type === TransactionType.TRANSFER && transaction.amount > 0);
  };

  // Rendu d'un groupe de transactions
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
                    ? t('transferTo', 'transactions', { name: transaction.recipient_name || t('unknown', 'common') })
                    : t('transferFrom', 'transactions', { name: transaction.recipient_name || t('unknown', 'common') }))
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

      {/* Structure mise à jour: Contenu principal incluant filtres et liste dans un seul conteneur */}
      <View style={styles.mainContentContainer}>
        {/* Filtres */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContentContainer}
        >
          <View style={styles.filterContainer}>
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
          </View>
        </ScrollView>

        {/* Liste des transactions */}
        {isLoading && !transactions ? (
          <View style={styles.loaderContainer}>
            <Loader />
            <Text style={[styles.loadingText, secondaryTextStyle]}>
              {t('loadingTransactions', 'transactions')}
            </Text>
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
  // Nouveau conteneur principal qui englobe les filtres et la liste
  mainContentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  filtersScroll: {
    // Réduire le marginBottom pour rapprocher les filtres de la liste
    marginBottom: 4,
  },
  filtersContentContainer: {
    paddingBottom: 4, // Réduit l'espace après le défilement
  },
  filterContainer: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
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
    // Commence immédiatement après les filtres
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
    flex: 1,
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
});

export default HistoryScreen;