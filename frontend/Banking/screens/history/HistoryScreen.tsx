import React, { useState } from 'react';
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

const HistoryScreen = () => {
  const { isDarkMode } = useTheme();
  const [activeFilter, setActiveFilter] = useState('All');

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;

  const filters = ['All', 'Income', 'Expense', 'Transfer'];

  const transactions = [
    { 
      id: 1, 
      name: 'Alberto Montero', 
      type: 'Added',
      category: 'Income',
      date: '30 Apr 2025', 
      amount: '+$600.00', 
      isPositive: true,
      avatar: require('../../assets/avatars/avatar2.jpg')
    },
    { 
      id: 2, 
      name: 'Louis Da Silva', 
      type: 'Added',
      category: 'Income',
      date: '27 Apr 2025', 
      amount: '+$8.50', 
      isPositive: true,
      avatar: require('../../assets/avatars/avatar2.jpg') 
    },
    { 
      id: 3, 
      name: 'Amazon Store', 
      type: 'Paid',
      category: 'Expense',
      date: '25 Apr 2025', 
      amount: '-$10.50', 
      isPositive: false,
      avatar: require('../../assets/avatars/avatar2.jpg')
    },
    { 
      id: 4, 
      name: 'Transfer to Savings', 
      type: 'Transfer',
      category: 'Transfer',
      date: '20 Apr 2025', 
      amount: '-$200.00', 
      isPositive: false,
      avatar: require('../../assets/avatars/avatar2.jpg')
    },
    { 
      id: 5, 
      name: 'Spotify Premium', 
      type: 'Subscription',
      category: 'Expense',
      date: '15 Apr 2025', 
      amount: '-$9.99', 
      isPositive: false,
      avatar: require('../../assets/avatars/avatar2.jpg')
    },
    { 
      id: 6, 
      name: 'Paycheck', 
      type: 'Salary',
      category: 'Income',
      date: '10 Apr 2025', 
      amount: '+$2,450.00', 
      isPositive: true,
      avatar: require('../../assets/avatars/avatar2.jpg')
    },
    { 
      id: 7, 
      name: 'Transfer from John', 
      type: 'Received',
      category: 'Transfer',
      date: '5 Apr 2025', 
      amount: '+$75.00', 
      isPositive: true,
      avatar: require('../../assets/avatars/avatar2.jpg')
    },
    { 
      id: 8, 
      name: 'Uber Ride', 
      type: 'Transportation',
      category: 'Expense',
      date: '2 Apr 2025', 
      amount: '-$12.75', 
      isPositive: false,
      avatar: require('../../assets/avatars/avatar2.jpg')
    },
  ];

  const filteredTransactions = activeFilter === 'All' 
    ? transactions 
    : transactions.filter(t => t.category === activeFilter);

  // Grouper les transactions par date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  // Calculer les totaux
  const totals = {
    income: transactions.filter(t => t.isPositive).reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0),
    expense: transactions.filter(t => !t.isPositive).reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0)
  };
  
  // Formater pour l'affichage
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
  };

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec le titre et l'avatar */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, headerTextStyle]}>Transaction History</Text>
          <TouchableOpacity>
            <Image 
              source={require('../../assets/avatars/avatar2.jpg')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, cardStyle]}>
            <View style={[styles.iconContainer, styles.incomeIcon]}>
              <Text style={styles.iconText}>↓</Text>
            </View>
            <Text style={[styles.summaryLabel, secondaryTextStyle]}>Income</Text>
            <Text style={[styles.summaryAmount, headerTextStyle, styles.positiveAmount]}>
              {formatCurrency(totals.income)}
            </Text>
          </View>
          
          <View style={[styles.summaryCard, cardStyle]}>
            <View style={[styles.iconContainer, styles.expenseIcon]}>
              <Text style={styles.iconText}>↑</Text>
            </View>
            <Text style={[styles.summaryLabel, secondaryTextStyle]}>Expenses</Text>
            <Text style={[styles.summaryAmount, headerTextStyle, styles.negativeAmount]}>
              {formatCurrency(totals.expense)}
            </Text>
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilterButton
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter ? styles.activeFilterText : secondaryTextStyle
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Transactions List Grouped by Date */}
        <View style={styles.transactionList}>
          {Object.keys(groupedTransactions).map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={[styles.dateHeader, secondaryTextStyle]}>{date}</Text>
              
              {groupedTransactions[date].map((transaction) => (
                <View key={transaction.id} style={[styles.transactionItem, cardStyle]}>
                  <View style={styles.transactionLeft}>
                    <Image source={transaction.avatar} style={styles.transactionAvatar} />
                    <View>
                      <Text style={[styles.transactionName, headerTextStyle]}>{transaction.name}</Text>
                      <View style={styles.transactionMeta}>
                        <Text style={[styles.transactionType, secondaryTextStyle]}>{transaction.type}</Text>
                        <Text style={[styles.transactionCategory, 
                          transaction.isPositive ? styles.categoryIncome : 
                          transaction.category === 'Transfer' ? styles.categoryTransfer : styles.categoryExpense
                        ]}>
                          • {transaction.category}
                        </Text>
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
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Base styles
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  // Summary cards
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: width * 0.43,
    borderRadius: 16,
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  incomeIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  expenseIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Filter styles
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterButton: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  filterText: {
    fontWeight: '500',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  
  // Transaction list
  transactionList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    alignItems: 'center',
  },
  transactionType: {
    fontSize: 14,
    marginRight: 4,
  },
  transactionCategory: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  categoryIncome: {
    color: '#10B981',
  },
  categoryExpense: {
    color: '#EF4444',
  },
  categoryTransfer: {
    color: '#6366F1',
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
  
  // Light mode styles
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
  
  // Dark mode styles
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
});

export default HistoryScreen;