import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Dimensions
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TransactionType } from '../../services/transactionService';
import { useTranslation } from '../../hooks/useTranslation';
import useTheme from '../../hooks/useTheme';
import { MainTabParamList } from '../../App';

type Props = NativeStackScreenProps<MainTabParamList, 'TransactionDetail'>;

const { width } = Dimensions.get('window');

const TransactionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transaction } = route.params;
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const borderStyle = isDarkMode ? styles.darkBorder : styles.lightBorder;

  const isPositiveTransaction = () => {
    return transaction.transaction_type === TransactionType.DEPOSIT ||
      (transaction.transaction_type === TransactionType.TRANSFER && transaction.amount > 0);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formater le montant avec le signe approprié
  const formatAmount = (amount: number) => {
    const prefix = isPositiveTransaction() ? '+' : '';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(Math.abs(amount)).replace('$', prefix + '$');
  };

  // Obtenir le titre de la transaction
  const getTransactionTitle = () => {
    if (transaction.transaction_type === TransactionType.TRANSFER) {
      if (transaction.amount < 0) {
        return t('transferTo', 'transactions', { name: transaction.recipient_name || t('unknown', 'common') });
      } else {
        return t('transferFrom', 'transactions', { name: transaction.recipient_name || t('unknown', 'common') });
      }
    } else if (transaction.description) {
      return transaction.description;
    } else {
      return t(transaction.transaction_type.toLowerCase(), 'transactions');
    }
  };

  const getStatusIcon = () => {
    switch(transaction.status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={20} color="#10B981" />;
      case 'pending':
        return <Ionicons name="time" size={20} color="#F59E0B" />;
      case 'failed':
        return <Ionicons name="close-circle" size={20} color="#EF4444" />;
      default:
        return <Ionicons name="help-circle" size={20} color="#6B7280" />;
    }
  };

  const getTransactionIcon = () => {
    switch (transaction.transaction_type) {
      case TransactionType.DEPOSIT:
        return <Ionicons name="arrow-down-circle" size={48} color="#10B981" />;
      case TransactionType.WITHDRAWAL:
        return <Ionicons name="arrow-up-circle" size={48} color="#EF4444" />;
      case TransactionType.TRANSFER:
        if (transaction.amount > 0) {
          return <Ionicons name="swap-horizontal" size={48} color="#10B981" />;
        } else {
          return <Ionicons name="swap-horizontal" size={48} color="#EF4444" />;
        }
      default:
        return <Ionicons name="help-circle" size={48} color="#6B7280" />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, headerTextStyle]}>{t('transactionDetail', 'transactions')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mainContent}>
          {/* Carte principale de la transaction */}
          <View style={[styles.transactionCard, cardStyle]}>
            <View style={styles.iconContainer}>
              {getTransactionIcon()}
            </View>
            
            <Text style={[styles.transactionTitle, headerTextStyle]}>
              {getTransactionTitle()}
            </Text>
            
            <Text style={[
              styles.transactionAmount,
              isPositiveTransaction() ? styles.positiveAmount : styles.negativeAmount
            ]}>
              {formatAmount(transaction.amount)}
            </Text>
            
            <View style={styles.statusContainer}>
              {getStatusIcon()}
              <Text style={[
                styles.statusText,
                transaction.status === 'completed' ? styles.statusCompleted :
                transaction.status === 'pending' ? styles.statusPending : styles.statusFailed
              ]}>
                {t(transaction.status, 'transactions')}
              </Text>
            </View>
          </View>

          {/* Détails de la transaction */}
          <View style={[styles.detailsCard, cardStyle]}>
            <Text style={[styles.sectionTitle, headerTextStyle]}>
              {t('details', 'transactions')}
            </Text>

            <View style={[styles.detailRow, borderStyle]}>
              <Text style={[styles.detailLabel, secondaryTextStyle]}>
                {t('transactionType', 'transactions')}
              </Text>
              <Text style={[styles.detailValue, headerTextStyle]}>
                {t(transaction.transaction_type.toLowerCase(), 'transactions')}
              </Text>
            </View>

            <View style={[styles.detailRow, borderStyle]}>
              <Text style={[styles.detailLabel, secondaryTextStyle]}>
                {t('date', 'transactions')}
              </Text>
              <Text style={[styles.detailValue, headerTextStyle]}>
                {formatDate(transaction.transaction_date)}
              </Text>
            </View>

            {transaction.transaction_id && (
              <View style={[styles.detailRow, borderStyle]}>
                <Text style={[styles.detailLabel, secondaryTextStyle]}>
                  {t('transactionId', 'transactions')}
                </Text>
                <Text style={[styles.detailValue, headerTextStyle]}>
                  {transaction.transaction_id}
                </Text>
              </View>
            )}

            {(transaction.transaction_type === TransactionType.TRANSFER) && (
              <View style={[styles.detailRow, borderStyle]}>
                <Text style={[styles.detailLabel, secondaryTextStyle]}>
                  {transaction.amount < 0 
                    ? t('recipient', 'transactions') 
                    : t('sender', 'transactions')}
                </Text>
                <Text style={[styles.detailValue, headerTextStyle]}>
                  {transaction.recipient_name || t('unknown', 'common')}
                </Text>
              </View>
            )}
          </View>

          {/* Actions possibles */}
          {transaction.status !== 'failed' && (
            <View style={[styles.actionsCard, cardStyle]}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                }}
              >
                <Ionicons name="download-outline" size={24} color={isDarkMode ? "#60A5FA" : "#3B82F6"} />
                <Text style={[styles.actionText, headerTextStyle]}>{t('downloadReceipt', 'transactions')}</Text>
              </TouchableOpacity>

              {transaction.transaction_type === TransactionType.TRANSFER && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                  }}
                >
                  <Ionicons name="share-social-outline" size={24} color={isDarkMode ? "#60A5FA" : "#3B82F6"} />
                  <Text style={[styles.actionText, headerTextStyle]}>{t('shareDetails', 'transactions')}</Text>
                </TouchableOpacity>
              )}

              {transaction.status === 'pending' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                  }}
                >
                  <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                  <Text style={[styles.actionText, styles.cancelText]}>{t('cancelTransaction', 'transactions')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:30,
  },
  darkContainer: {
    backgroundColor: '#1E293B',
  },
  lightContainer: {
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  darkHeaderText: {
    color: '#F8FAFC',
  },
  lightHeaderText: {
    color: '#1E293B',
  },
  darkSecondaryText: {
    color: '#94A3B8',
  },
  lightSecondaryText: {
    color: '#64748B',
  },
  mainContent: {
    padding: 16,
    gap: 16,
  },
  transactionCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkCard: {
    backgroundColor: '#334155',
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    marginBottom: 12,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  transactionAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  positiveAmount: {
    color: '#10B981',
  },
  negativeAmount: {
    color: '#EF4444',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
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
  detailsCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  darkBorder: {
    borderBottomColor: '#475569',
    borderBottomWidth: 1,
  },
  lightBorder: {
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: width * 0.5,
    textAlign: 'right',
  },
  actionsCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
    paddingTop: 16,
  },
  cancelText: {
    color: '#EF4444',
  },
});

export default TransactionDetailScreen;