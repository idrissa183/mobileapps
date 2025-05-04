import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import useTheme from '../../hooks/useTheme';
import useTranslation from '../../hooks/useTranslation';
import Loader from '../../components/common/Loader';
import { Transaction, TransactionType } from '../../services/transactionService';

interface TransactionsListProps {
    transactions: Transaction[] | null;
    isLoading: boolean;
    showHeader?: boolean;
    onViewAll?: () => void;
    showDate?: boolean;
    limit?: number;
    navigation?: any;
    emptyMessage?: string;
}

const { width } = Dimensions.get('window');

const TransactionsList: React.FC<TransactionsListProps> = ({
    transactions,
    isLoading,
    showHeader = true,
    onViewAll,
    showDate = true,
    limit,
    navigation,
    emptyMessage
}) => {
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();

    const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
    const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;

    const formatAmount = (amount: number, type: TransactionType) => {
        const prefix = (type === TransactionType.DEPOSIT ||
            (type === TransactionType.TRANSFER && amount > 0)) ? '+' : '';
        return `${prefix}$${Math.abs(amount).toFixed(2)}`;
    };

    const isPositiveTransaction = (transaction: Transaction) => {
        return transaction.transaction_type === TransactionType.DEPOSIT ||
            (transaction.transaction_type === TransactionType.TRANSFER && transaction.amount > 0);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return t('today', 'common');
        } else if (date.toDateString() === yesterday.toDateString()) {
            return t('yesterday', 'common');
        } else {
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        }
    };

    const getTransactionIcon = (transaction: Transaction) => {
        switch (transaction.transaction_type) {
            case TransactionType.DEPOSIT:
                return <Ionicons name="arrow-down-circle" size={32} color="#10B981" />;
            case TransactionType.WITHDRAWAL:
                return <Ionicons name="arrow-up-circle" size={32} color="#EF4444" />;
            case TransactionType.TRANSFER:
                if (transaction.amount > 0) {
                    return <Ionicons name="swap-horizontal" size={32} color="#10B981" />;
                } else {
                    return <Ionicons name="swap-horizontal" size={32} color="#EF4444" />;
                }
            default:
                return <Ionicons name="help-circle" size={32} color="#6B7280" />;
        }
    };

    const getTransactionName = (transaction: Transaction) => {
        if (transaction.transaction_type === TransactionType.TRANSFER) {
            if (transaction.amount < 0) {
                return t('transferTo', 'transactions');
            } else {
                return t('transferFrom', 'transactions');
            }
        } else if (transaction.transaction_type === TransactionType.DEPOSIT) {
            return t('deposit', 'transactions');
        } else if (transaction.transaction_type === TransactionType.WITHDRAWAL) {
            return t('withdrawal', 'transactions');
        }
        return transaction.description || '';
    };

    const displayTransactions = limit && transactions ? transactions.slice(0, limit) : transactions;

    if (isLoading) {
        return <Loader text={t('loadingTransactions', 'transactions')} />;
    }

    if (!transactions || transactions.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color={isDarkMode ? "#60A5FA" : "#3B82F6"} />
                <Text style={[styles.emptyText, secondaryTextStyle]}>
                    {emptyMessage || t('noTransactions', 'transactions')}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.transactionSection}>
            {showHeader && (
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, headerTextStyle]}>{t('transactions', 'home')}</Text>
                    {onViewAll && (
                        <TouchableOpacity onPress={onViewAll}>
                            <Text style={styles.viewAllText}>{t('viewAll', 'common')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {displayTransactions?.map((transaction) => (
                <TouchableOpacity
                    key={transaction.id}
                    style={styles.transactionItem}
                    onPress={() => navigation?.navigate('TransactionDetail', { transaction })}
                >
                    <View style={styles.transactionLeft}>
                        <View style={styles.transactionIconContainer}>
                            {getTransactionIcon(transaction)}
                        </View>
                        <View>
                            <Text style={[styles.transactionName, headerTextStyle]}>
                                {getTransactionName(transaction)}
                            </Text>
                            <View style={styles.transactionMeta}>
                                <Text style={[styles.transactionType, secondaryTextStyle]}>
                                    {t(transaction.transaction_type, 'transactions')}
                                </Text>
                                {showDate && (
                                    <Text style={[styles.transactionDate, secondaryTextStyle]}> • {formatDate(transaction.transaction_date)}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                    <Text style={[
                        styles.transactionAmount,
                        isPositiveTransaction(transaction) ? styles.positiveAmount : styles.negativeAmount
                    ]}>
                        {formatAmount(transaction.amount, transaction.transaction_type  as TransactionType)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    transactionSection: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    viewAllText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionType: {
        fontSize: 14,
    },
    transactionDate: {
        fontSize: 14,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '500',
    },
    positiveAmount: {
        color: '#10B981',
    },
    negativeAmount: {
        color: '#EF4444',
    },
    lightHeaderText: {
        color: '#1F2937',
    },
    darkHeaderText: {
        color: '#F9FAFB',
    },
    lightSecondaryText: {
        color: '#64748B',
    },
    darkSecondaryText: {
        color: '#94A3B8',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default TransactionsList;