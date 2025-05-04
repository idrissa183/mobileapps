// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Dimensions,
//   ActivityIndicator,
//   Modal,
//   TextInput,
//   StyleSheet
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useIsFocused } from '@react-navigation/native';
// import useTheme from '../../hooks/useTheme';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { Currency, TransactionType } from '../../services/transactionService';

// const { width } = Dimensions.get('window');

// // TypeScript interfaces
// interface Transaction {
//   id: string;
//   amount: number;
//   transaction_date: string;
//   transaction_type: TransactionType;
//   merchant_name?: string;
//   recipient_name?: string;
//   description?: string;
// }

// interface Account {
//   id: string;
//   account_name: string;
//   account_type: AccountType;
//   currency: Currency;
//   balance: number;
//   is_primary?: boolean;
// }

// interface CurrencyRate {
//   currency: string;
//   rate: number;
// }

// interface BalanceItem {
//   id: number;
//   amount: string;
//   currency: string;
//   flag: any; // Image source type
// }

// interface NewAccountData {
//   account_name: string;
//   account_type: AccountType;
//   currency: Currency;
// }

// type RootStackParamList = {
//   Home: undefined;
//   Profile: undefined;
//   SendMoney: undefined;
//   RequestMoney: undefined;
//   History: { accountId: string };
//   TransactionDetails: { transaction: Transaction };
// };

// type HomeScreenProps = {
//   navigation: StackNavigationProp<RootStackParamList, 'Home'>;
// };

// const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
//   const { isDarkMode } = useTheme();
//   const isFocused = useIsFocused();

//   // State management
//   const [accounts, setAccounts] = useState<Account[]>([]);
//   const [activeAccount, setActiveAccount] = useState<Account | null>(null);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [currRates, setCurrRates] = useState<CurrencyRate[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [totalBalance, setTotalBalance] = useState<number>(0);
//   const [showNewAccountModal, setShowNewAccountModal] = useState<boolean>(false);
//   const [showAccountSelector, setShowAccountSelector] = useState<boolean>(false);
//   const [newAccountData, setNewAccountData] = useState<NewAccountData>({
//     account_name: '',
//     account_type: AccountType.CHECKING,
//     currency: Currency.USD
//   });

//   // Theme styles
//   const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
//   const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
//   const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
//   const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
//   const inputStyle = isDarkMode ? styles.darkInput : styles.lightInput;
//   const modalStyle = isDarkMode ? styles.darkModal : styles.lightModal;

//   // Fetch data on component mount or when screen is focused
//   useEffect(() => {
//     if (isFocused) {
//       fetchData();
//     }
//   }, [isFocused]);

//   // Fetch all necessary data
//   const fetchData = async (): Promise<void> => {
//     setIsLoading(true);
//     try {
//       // Fetch accounts
//       const accountsData = await bankService.getAccounts();
//       setAccounts(accountsData);

//       // Set active account to primary account or first account
//       const primaryAccount = accountsData.find(account => account.is_primary) || accountsData[0];
//       setActiveAccount(primaryAccount);

//       // Calculate total balance across all accounts
//       const total = accountsData.reduce((sum, account) => sum + account.balance, 0);
//       setTotalBalance(total);

//       // Fetch transactions for active account
//       if (primaryAccount) {
//         const transactionsData = await bankService.getTransactions(primaryAccount.id, {
//           limit: 5, // Only get the most recent 5 transactions
//         });
//         setTransactions(transactionsData);
//       }

//       // Fetch currency rates
//       const exchangeRates = await bankService.getExchangeRates('USD');

//       // Format currency rates - limit to three currencies as requested
//       const currRatesArray = Object.keys(exchangeRates.rates)
//         .filter(currency => ['USD', 'EUR', 'XOF'].includes(currency))
//         .map(currency => ({
//           currency,
//           rate: exchangeRates.rates[currency],
//         }));

//       setCurrRates(currRatesArray);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       // Handle error (show toast or notification)
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Create a new account
//   const handleCreateAccount = async (): Promise<void> => {
//     try {
//       await bankService.createAccount(newAccountData);
//       setShowNewAccountModal(false);
//       setNewAccountData({
//         account_name: '',
//         account_type: AccountType.CHECKING,
//         currency: Currency.USD
//       });
//       // Refresh data
//       fetchData();
//     } catch (error) {
//       console.error('Error creating account:', error);
//       // Handle error (show toast or notification)
//     }
//   };

//   // Change active account
//   const handleChangeActiveAccount = (account: Account): void => {
//     setActiveAccount(account);
//     setShowAccountSelector(false);

//     // Fetch transactions for the selected account
//     bankService.getTransactions(account.id, { limit: 5 })
//       .then(transactionsData => {
//         setTransactions(transactionsData);
//       })
//       .catch(error => {
//         console.error('Error fetching transactions:', error);
//       });
//   };

//   // Format number with commas
//   const formatNumberWithCommas = (number: string): string => {
//     return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
//   };

//   // Format date
//   const formatDate = (dateString: string): string => {
//     const date = new Date(dateString);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     if (date.toDateString() === today.toDateString()) {
//       return 'Today';
//     } else if (date.toDateString() === yesterday.toDateString()) {
//       return 'Yesterday';
//     } else {
//       return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
//     }
//   };

//   // Calculate balances in different currencies
//   const balances: BalanceItem[] = currRates.map((currRate, index) => ({
//     id: index + 1,
//     amount: formatNumberWithCommas((totalBalance * (currRate.rate || 1)).toFixed(2)),
//     currency: currRate.currency,
//     flag: getFlagForCurrency(currRate.currency),
//   }));

//   // Get flag image based on currency code
//   const getFlagForCurrency = (currencyCode: string): any => {
//     const flagImages: Record<string, any> = {
//       USD: require('../../assets/flags/usd.jpg'),
//       XOF: require('../../assets/flags/xof.jpg'),
//       EUR: require('../../assets/flags/eur.jpg'),
//     };

//     return flagImages[currencyCode] || flagImages.USD;
//   };

//   // Get icon for transaction type
//   const getTransactionIcon = (type: TransactionType): string => {
//     const icons: Record<TransactionType, string> = {
//       [TransactionType.DEPOSIT]: 'arrow-down-bold-circle',
//       [TransactionType.WITHDRAWAL]: 'arrow-up-bold-circle',
//       [TransactionType.TRANSFER]: 'bank-transfer',
//       [TransactionType.PAYMENT]: 'credit-card-outline',
//       [TransactionType.FEE]: 'currency-usd-off',
//       [TransactionType.INTEREST]: 'percent',
//       [TransactionType.REFUND]: 'cash-refund',
//     };

//     return icons[type] || 'cash';
//   };

//   // Get icon color based on transaction type
//   const getTransactionIconColor = (type: TransactionType): string => {
//     const isPositive = [TransactionType.DEPOSIT, TransactionType.REFUND, TransactionType.INTEREST].includes(type);
//     return isPositive ? '#10B981' : '#EF4444';
//   };

//   // Format transaction amount with sign
//   const formatTransactionAmount = (amount: number, type: TransactionType): string => {
//     const isPositive = [TransactionType.DEPOSIT, TransactionType.REFUND, TransactionType.INTEREST].includes(type);
//     return `${isPositive ? '+' : '-'}$${Math.abs(amount).toFixed(2)}`;
//   };

//   // Render account type name
//   const renderAccountTypeName = (type: AccountType): string => {
//     const names: Record<AccountType, string> = {
//       [AccountType.CHECKING]: 'Checking',
//       [AccountType.SAVINGS]: 'Savings',
//       [AccountType.CREDIT]: 'Credit',
//       [AccountType.INVESTMENT]: 'Investment',
//     };

//     return names[type] || type;
//   };

//   if (isLoading) {
//     return (
//       <SafeAreaView style={[styles.container, containerStyle, styles.loadingContainer]}>
//         <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
//         <Text style={[styles.loadingText, headerTextStyle]}>Loading your accounts...</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={[styles.container, containerStyle]}>
//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {/* Header with title and avatar */}
//         <View style={styles.header}>
//           <View>
//             <Text style={[styles.headerTitle, headerTextStyle]}>Welcome</Text>
//             <TouchableOpacity
//               style={styles.accountSelector}
//               onPress={() => setShowAccountSelector(true)}
//             >
//               <Text style={[styles.activeAccountName, headerTextStyle]}>
//                 {activeAccount?.account_name || 'Select Account'}
//               </Text>
//               <Icon name="chevron-down" size={20} color={isDarkMode ? '#F9FAFB' : '#111827'} />
//             </TouchableOpacity>
//           </View>
//           <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
//             <Image
//               source={require('../../assets/avatars/avatar2.jpg')}
//               style={styles.avatar}
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Account summary card */}
//         <View style={[styles.summaryCard, cardStyle]}>
//           <View style={styles.summaryCardHeader}>
//             <View>
//               <Text style={[styles.summaryLabel, secondaryTextStyle]}>Total Balance</Text>
//               <Text style={[styles.summaryBalance, headerTextStyle]}>
//                 ${formatNumberWithCommas(totalBalance.toFixed(2))}
//               </Text>
//             </View>
//             <View style={styles.accountsCountContainer}>
//               <Text style={[styles.accountsCount, headerTextStyle]}>{accounts.length}</Text>
//               <Text style={[styles.accountsCountLabel, secondaryTextStyle]}>Accounts</Text>
//             </View>
//           </View>

//           <View style={styles.actionsContainer}>
//             <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SendMoney')}>
//               <Icon name="send" size={24} color="#FFFFFF" />
//               <Text style={styles.actionButtonText}>Send</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('RequestMoney')}>
//               <Icon name="cash-plus" size={24} color="#FFFFFF" />
//               <Text style={styles.actionButtonText}>Request</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton} onPress={() => setShowNewAccountModal(true)}>
//               <Icon name="bank-plus" size={24} color="#FFFFFF" />
//               <Text style={styles.actionButtonText}>New Account</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Currency balances with horizontal scroll */}
//         <View>
//           <Text style={[styles.sectionTitle, headerTextStyle, styles.balancesHeader]}>
//             Your Balance in Different Currencies
//           </Text>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.balanceScrollContainer}
//           >
//             {balances.map((balance) => (
//               <View key={balance.id} style={[styles.balanceCard, cardStyle]}>
//                 <View style={styles.flagContainer}>
//                   <Image source={balance.flag} style={styles.flag} />
//                 </View>
//                 <View>
//                   <Text style={[styles.balanceAmount, headerTextStyle]}>{balance.amount}</Text>
//                   <Text style={[styles.balanceCurrency, secondaryTextStyle]}>{balance.currency}</Text>
//                 </View>
//               </View>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Invite section */}
//         <View style={styles.inviteContainer}>
//           <View>
//             <Text style={[styles.inviteText, headerTextStyle]}>Invite your</Text>
//             <Text style={[styles.inviteText, headerTextStyle]}>friend now!</Text>
//           </View>
//           <TouchableOpacity style={styles.earnButton}>
//             <Text style={styles.earnButtonText}>Earn $100</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Recent transactions section */}
//         <View style={styles.transactionSection}>
//           <View style={styles.sectionHeader}>
//             <Text style={[styles.sectionTitle, headerTextStyle]}>Recent Transactions</Text>
//             <TouchableOpacity onPress={() => navigation.navigate('History', { accountId: activeAccount?.id })}>
//               <Text style={styles.viewAllText}>View All</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Transactions list */}
//           {transactions.length > 0 ? (
//             transactions.map((transaction) => (
//               <TouchableOpacity
//                 key={transaction.id}
//                 style={styles.transactionItem}
//                 onPress={() => navigation.navigate('TransactionDetails', { transaction })}
//               >
//                 <View style={styles.transactionLeft}>
//                   <View style={[styles.transactionIconContainer, { backgroundColor: getTransactionIconColor(transaction.transaction_type) + '20' }]}>
//                     <Icon
//                       name={getTransactionIcon(transaction.transaction_type)}
//                       size={24}
//                       color={getTransactionIconColor(transaction.transaction_type)}
//                     />
//                   </View>
//                   <View>
//                     <Text style={[styles.transactionName, headerTextStyle]}>
//                       {transaction.merchant_name || transaction.recipient_name || transaction.description}
//                     </Text>
//                     <View style={styles.transactionMeta}>
//                       <Text style={[styles.transactionType, secondaryTextStyle]}>
//                         {transaction.transaction_type}
//                       </Text>
//                       <Text style={[styles.transactionDate, secondaryTextStyle]}> • {formatDate(transaction.transaction_date)}</Text>
//                     </View>
//                   </View>
//                 </View>
//                 <Text style={[
//                   styles.transactionAmount,
//                   [TransactionType.DEPOSIT, TransactionType.REFUND, TransactionType.INTEREST].includes(transaction.transaction_type)
//                     ? styles.positiveAmount : styles.negativeAmount
//                 ]}>
//                   {formatTransactionAmount(transaction.amount, transaction.transaction_type)}
//                 </Text>
//               </TouchableOpacity>
//             ))
//           ) : (
//             <View style={styles.noTransactionsContainer}>
//               <Icon name="credit-card-off-outline" size={48} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
//               <Text style={[styles.noTransactionsText, secondaryTextStyle]}>No recent transactions</Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>

//       {/* Account selector modal */}
//       <Modal
//         visible={showAccountSelector}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setShowAccountSelector(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setShowAccountSelector(false)}
//         >
//           <View style={[styles.modalContent, modalStyle]}>
//             <View style={styles.modalHeader}>
//               <Text style={[styles.modalTitle, headerTextStyle]}>Select Account</Text>
//               <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
//                 <Icon name="close" size={24} color={isDarkMode ? '#F9FAFB' : '#111827'} />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.accountsList}>
//               {accounts.map((account) => (
//                 <TouchableOpacity
//                   key={account.id}
//                   style={[
//                     styles.accountItem,
//                     activeAccount?.id === account.id && styles.activeAccountItem
//                   ]}
//                   onPress={() => handleChangeActiveAccount(account)}
//                 >
//                   <View style={styles.accountInfo}>
//                     <Icon
//                       name={account.account_type === AccountType.SAVINGS ? 'piggy-bank' : 'bank'}
//                       size={24}
//                       color={isDarkMode ? '#60A5FA' : '#2563EB'}
//                     />
//                     <View style={styles.accountTextContainer}>
//                       <Text style={[styles.accountName, headerTextStyle]}>{account.account_name}</Text>
//                       <Text style={[styles.accountType, secondaryTextStyle]}>
//                         {renderAccountTypeName(account.account_type)} • {account.currency}
//                       </Text>
//                     </View>
//                   </View>
//                   <Text style={[styles.accountBalance, headerTextStyle]}>
//                     ${formatNumberWithCommas(account.balance.toFixed(2))}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* New account modal */}
//       <Modal
//         visible={showNewAccountModal}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setShowNewAccountModal(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setShowNewAccountModal(false)}
//         >
//           <View style={[styles.modalContent, modalStyle]}>
//             <View style={styles.modalHeader}>
//               <Text style={[styles.modalTitle, headerTextStyle]}>Create New Account</Text>
//               <TouchableOpacity onPress={() => setShowNewAccountModal(false)}>
//                 <Icon name="close" size={24} color={isDarkMode ? '#F9FAFB' : '#111827'} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.formContainer}>
//               <Text style={[styles.inputLabel, secondaryTextStyle]}>Account Name</Text>
//               <TextInput
//                 style={[styles.input, inputStyle]}
//                 placeholder="Enter account name"
//                 placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
//                 value={newAccountData.account_name}
//                 onChangeText={(text) => setNewAccountData({ ...newAccountData, account_name: text })}
//               />

//               <Text style={[styles.inputLabel, secondaryTextStyle]}>Account Type</Text>
//               <View style={styles.accountTypeContainer}>
//                 {Object.values(AccountType).map((type) => (
//                   <TouchableOpacity
//                     key={type}
//                     style={[
//                       styles.accountTypeButton,
//                       newAccountData.account_type === type && styles.selectedAccountType
//                     ]}
//                     onPress={() => setNewAccountData({ ...newAccountData, account_type: type })}
//                   >
//                     <Text style={[
//                       styles.accountTypeText,
//                       newAccountData.account_type === type && styles.selectedAccountTypeText
//                     ]}>
//                       {renderAccountTypeName(type)}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <Text style={[styles.inputLabel, secondaryTextStyle]}>Currency</Text>
//               <View style={styles.currencyContainer}>
//                 {/* Limiter les devises à seulement EUR, USD et XOF */}
//                 {['USD', 'EUR', 'XOF'].map((currency) => (
//                   <TouchableOpacity
//                     key={currency}
//                     style={[
//                       styles.currencyButton,
//                       newAccountData.currency === currency && styles.selectedCurrency
//                     ]}
//                     onPress={() => setNewAccountData({ ...newAccountData, currency: currency as Currency })}
//                   >
//                     <Text style={[
//                       styles.currencyText,
//                       newAccountData.currency === currency && styles.selectedCurrencyText
//                     ]}>
//                       {currency}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <TouchableOpacity
//                 style={styles.createAccountButton}
//                 onPress={handleCreateAccount}
//                 disabled={!newAccountData.account_name}
//               >
//                 <Text style={styles.createAccountButtonText}>Create Account</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//     // Base styles
//     container: {
//         flex: 1,
//         paddingTop: 20,
//     },
//     scrollView: {
//         flex: 1,
//     },
//     loadingContainer: {
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     loadingText: {
//         marginTop: 16,
//         fontSize: 18,
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         paddingTop: 10,
//         paddingBottom: 20,
//     },
//     headerTitle: {
//         fontSize: 18,
//         fontWeight: '500',
//     },
//     accountSelector: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 4,
//     },
//     activeAccountName: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginRight: 4,
//     },
//     avatar: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//     },

//     // Summary card
//     summaryCard: {
//         marginHorizontal: 20,
//         borderRadius: 16,
//         padding: 16,
//         marginBottom: 20,
//     },
//     summaryCardHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     summaryLabel: {
//         fontSize: 14,
//         marginBottom: 4,
//     },
//     summaryBalance: {
//         fontSize: 28,
//         fontWeight: 'bold',
//     },
//     accountsCountContainer: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         width: 64,
//         height: 64,
//         borderRadius: 32,
//         backgroundColor: 'rgba(96, 165, 250, 0.2)',
//     },
//     accountsCount: {
//         fontSize: 20,
//         fontWeight: 'bold',
//     },
//     accountsCountLabel: {
//         fontSize: 12,
//     },

//     // Action buttons
//     actionsContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 8,
//     },
//     actionButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#2563EB',
//         paddingVertical: 10,
//         paddingHorizontal: 16,
//         borderRadius: 8,
//         flex: 1,
//         marginHorizontal: 4,
//     },
//     actionButtonText: {
//         color: '#FFFFFF',
//         fontWeight: '600',
//         marginLeft: 6,
//     },

//     // Balance cards
//     balancesHeader: {
//         paddingHorizontal: 20,
//         marginBottom: 12,
//     },
//     balanceScrollContainer: {
//         paddingHorizontal: 20,
//         paddingBottom: 20,
//     },
//     balanceCard: {
//         display: 'flex',
//         justifyContent: 'space-between',
//         width: width * 0.4,
//         borderRadius: 16,
//         padding: 16,
//         marginRight: 12,
//         height: 120,
//     },
//     flagContainer: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         backgroundColor: 'rgba(255, 255, 255, 0.2)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 12,
//         overflow: 'hidden',
//     },
//     flag: {
//         width: 48,
//         height: 48,
//         borderRadius: 24,
//     },
//     balanceAmount: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 4,
//     },
//     balanceCurrency: {
//         fontSize: 14,
//     },

//     // Invite section
//     inviteContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         backgroundColor: '#E0F2FE',
//         marginHorizontal: 20,
//         marginBottom: 20,
//         borderRadius: 16,
//         padding: 16,
//     },
//     inviteText: {
//         fontSize: 20,
//         fontWeight: '600',
//         color: '#0C4A6E',
//     },
//     earnButton: {
//         backgroundColor: '#0F172A',
//         paddingHorizontal: 14,
//         paddingVertical: 8,
//         borderRadius: 20,
//     },
//     earnButtonText: {
//         color: 'white',
//         fontWeight: '600',
//         fontSize: 16,
//     },

//     // Transactions section
//     transactionSection: {
//         paddingHorizontal: 20,
//         paddingBottom: 30,
//     },
//     sectionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     sectionTitle: {
//         fontSize: 20,
//         fontWeight: 'bold',
//     },
//     viewAllText: {
//         fontSize: 16,
//         color: '#2563EB',
//     },
//     transactionItem: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 16,
//         paddingVertical: 8,
//     },
//     transactionLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     transactionIconContainer: {
//         width: 48,
//         height: 48,
//         borderRadius: 24,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     transactionName: {
//         fontWeight: '600',
//         fontSize: 16,
//         marginBottom: 4,
//     },
//     transactionMeta: {
//         flexDirection: 'row',
//     },
//     transactionType: {
//         fontSize: 14,
//         textTransform: 'capitalize',
//     },
//     transactionDate: {
//         fontSize: 14,
//     },
//     transactionAmount: {
//         fontWeight: '600',
//         fontSize: 16,
//     },
//     positiveAmount: {
//         color: '#10B981',
//     },
//     negativeAmount: {
//         color: '#EF4444',
//     },

//     // No transactions placeholder
//     noTransactionsContainer: {
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 30,
//     },
//     noTransactionsText: {
//         marginTop: 12,
//         fontSize: 16,
//     },

//     // Modal styles
//     modalOverlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         justifyContent: 'flex-end',
//     },
//     modalContent: {
//         borderTopLeftRadius: 24,
//         borderTopRightRadius: 24,
//         padding: 24,
//         maxHeight: '80%',
//     },
//     modalHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 24,
//     },
//     modalTitle: {
//         fontSize: 20,
//         fontWeight: 'bold',
//     },

//     // Account selector styles
//     accountsList: {
//         maxHeight: 400,
//     },
//     accountItem: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingVertical: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(156, 163, 175, 0.2)',
//     },
//     activeAccountItem: {
//         backgroundColor: 'rgba(96, 165, 250, 0.1)',
//         borderRadius: 8,
//         paddingHorizontal: 12,
//     },
//     accountInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     accountTextContainer: {
//         marginLeft: 12,
//     },
//     accountName: {
//         fontSize: 16,
//         fontWeight: '600',
//         marginBottom: 4,
//     },
//     accountType: {
//         fontSize: 14,
//         textTransform: 'capitalize',
//     },
//     accountBalance: {
//         fontSize: 16,
//         fontWeight: '600',
//     },

//     // Form styles
//     formContainer: {
//         marginTop: 8,
//     },
//     inputLabel: {
//         fontSize: 16,
//         marginBottom: 8,
//         fontWeight: '500',
//     },
//     input: {
//         height: 50,
//         borderRadius: 8,
//         paddingHorizontal: 16,
//         fontSize: 16,
//         marginBottom: 16,
//         borderWidth: 1,
//     },
//     accountTypeContainer: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         marginBottom: 16,
//     },
//     accountTypeButton: {
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 20,
//         borderWidth: 1,
//         borderColor: '#9CA3AF',
//         marginRight: 8,
//         marginBottom: 8,
//     },
//     selectedAccountType: {
//         backgroundColor: '#2563EB',
//         borderColor: '#2563EB',
//     },
//     accountTypeText: {
//         fontSize: 14,
//         color: '#4B5563',
//     },
//     selectedAccountTypeText: {
//         color: '#FFFFFF',
//     },
//     currencyContainer: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         marginBottom: 24,
//     },
//     currencyButton: {
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 20,
//         borderWidth: 1,
//         borderColor: '#9CA3AF',
//         marginRight: 8,
//         marginBottom: 8,
//     },
//     selectedCurrency: {
//         backgroundColor: '#2563EB',
//         borderColor: '#2563EB',
//     },
//     currencyText: {
//         fontSize: 14,
//         color: '#4B5563',
//     },
//     selectedCurrencyText: {
//         color: '#FFFFFF',
//     },
//     createAccountButton: {
//         backgroundColor: '#2563EB',
//         paddingVertical: 14,
//         borderRadius: 8,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     createAccountButtonText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '600',
//     },

//     // Theme specific styles
//     lightContainer: {
//         backgroundColor: '#F9FAFB',
//     },
//     darkContainer: {
//         backgroundColor: '#111827',
//     },
//     lightCard: {
//         backgroundColor: '#FFFFFF',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//         elevation: 2,
//     },
//     darkCard: {
//         backgroundColor: '#1F2937',
//     },
//     lightHeaderText: {
//         color: '#111827',
//     },
//     darkHeaderText: {
//         color: '#F9FAFB',
//     },
//     lightSecondaryText: {
//         color: '#6B7280',
//     },
//     darkSecondaryText: {
//         color: '#9CA3AF',
//     },
//     lightInput: {
//         backgroundColor: '#F3F4F6',
//         borderColor: '#E5E7EB',
//         color: '#111827',
//     },
//     darkInput: {
//         backgroundColor: '#374151',
//         borderColor: '#4B5563',
//         color: '#F9FAFB',
//     },
//     lightModal: {
//         backgroundColor: '#FFFFFF',
//     },
//     darkModal: {
//         backgroundColor: '#1F2937',
//     },
// });

// export default HomeScreen;