import api from './api';

// Types based on the backend models
export enum AccountType {
    CHECKING = "checking",
    SAVINGS = "savings",
    CREDIT = "credit",
    INVESTMENT = "investment"
}

export enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    TRANSFER = "transfer",
    PAYMENT = "payment",
    FEE = "fee",
    INTEREST = "interest",
    REFUND = "refund"
}

export enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}

export enum CardType {
    DEBIT = "debit",
    CREDIT = "credit",
    VIRTUAL = "virtual"
}

export enum CardStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    BLOCKED = "blocked",
    EXPIRED = "expired"
}

export enum Currency {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    JPY = "JPY",
    CHF = "CHF",
    CAD = "CAD",
    AUD = "AUD",
    CNY = "CNY",
    HKD = "HKD",
    SGD = "SGD",
    XOF = "XOF",
    AOA = "AOA",
    NGN = "NGN",
    ZAR = "ZAR",
    EGP = "EGP",
    MAD = "MAD",
    KES = "KES",
    GHS = "GHS"
}

export interface AccountResponse {
    id: string;
    user_id: string;
    account_number: string;
    account_name: string;
    account_type: AccountType;
    balance: number;
    currency: string;
    preferred_currencies: string[];
    currency_conversion_fee: number;
    is_primary: boolean;
    is_active: boolean;
    credit_limit?: number;
    available_credit?: number;
    interest_rate?: number;
    interest_rate_savings?: number;
    created_at: string;
    updated_at: string;
    last_transaction?: string;
}

export interface TransactionResponse {
    id: string;
    transaction_id: string;
    account_id: string;
    transaction_type: TransactionType;
    amount: number;
    currency: string;
    description: string;
    category?: string;
    status: TransactionStatus;
    recipient_account_id?: string;
    recipient_name?: string;
    recipient_account_number?: string;
    merchant_name?: string;
    merchant_category?: string;
    location?: string;
    transaction_date: string;
    created_at: string;
    updated_at: string;
}

export interface CardResponse {
    id: string;
    user_id: string;
    account_id: string;
    card_number: string;
    card_type: CardType;
    card_name: string;
    expiry_date: string;
    cvv: string;
    is_contactless: boolean;
    daily_limit: number;
    status: CardStatus;
    is_virtual: boolean;
    purpose?: string;
    created_at: string;
    updated_at: string;
}

export interface BeneficiaryResponse {
    id: string;
    user_id: string;
    beneficiary_name: string;
    account_number: string;
    bank_name?: string;
    bank_code?: string;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
}

export interface ExchangeRateResponse {
    base_currency: string;
    rates: Record<string, number>;
    last_updated: string;
}

export interface CurrencyConversionResponse {
    id: string;
    user_id: string;
    from_currency: string;
    to_currency: string;
    amount: number;
    converted_amount: number;
    exchange_rate: number;
    related_transaction_id?: string;
    conversion_date: string;
}

export interface CreateAccountRequest {
    account_name: string;
    account_type: AccountType;
    currency?: string;
    preferred_currencies?: string[];
    is_primary?: boolean;
}

export interface CreateTransactionRequest {
    account_id: string;
    transaction_type: TransactionType;
    amount: number;
    currency?: string;
    description: string;
    category?: string;
    recipient_account_number?: string;
    recipient_name?: string;
    merchant_name?: string;
    merchant_category?: string;
    location?: string;
}

export interface CreateCardRequest {
    account_id: string;
    card_type: CardType;
    card_name: string;
    is_contactless?: boolean;
    daily_limit: number;
    is_virtual?: boolean;
    purpose?: string;
}

export interface CreateBeneficiaryRequest {
    beneficiary_name: string;
    account_number: string;
    bank_name?: string;
    bank_code?: string;
    is_favorite?: boolean;
}

export interface CurrencyConversionRequest {
    from_currency: string;
    to_currency: string;
    amount: number;
    related_transaction_id?: string;
}


// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        } else if (error.request) {
            console.error('API Error Request:', error.request);
        } else {
            console.error('API Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Bank Service with all endpoints
const bankService = {
    // === ACCOUNTS ===

    // Get all accounts for the current user
    getAccounts: async () => {
        try {
            const response = await api.get('/accounts');
            return response.data as AccountResponse[];
        } catch (error) {
            console.error('Error fetching accounts:', error);
            throw error;
        }
    },

    // Get details for a specific account
    getAccountDetails: async (accountId: string) => {
        try {
            const response = await api.get(`/accounts/${accountId}`);
            return response.data as AccountResponse;
        } catch (error) {
            console.error('Error fetching account details:', error);
            throw error;
        }
    },

    // Create a new account
    createAccount: async (accountData: CreateAccountRequest) => {
        try {
            const response = await api.post('/accounts', accountData);
            return response.data as AccountResponse;
        } catch (error) {
            console.error('Error creating account:', error);
            throw error;
        }
    },

    // Update an existing account
    updateAccount: async (accountId: string, accountData: Partial<CreateAccountRequest>) => {
        try {
            const response = await api.put(`/accounts/${accountId}`, accountData);
            return response.data as AccountResponse;
        } catch (error) {
            console.error('Error updating account:', error);
            throw error;
        }
    },

    // Close/deactivate an account
    closeAccount: async (accountId: string) => {
        try {
            const response = await api.patch(`/accounts/${accountId}/close`, {});
            return response.data as AccountResponse;
        } catch (error) {
            console.error('Error closing account:', error);
            throw error;
        }
    },

    // === TRANSACTIONS ===

    // Get recent transactions for an account
    getTransactions: async (accountId: string, params?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        category?: string;
        type?: TransactionType;
    }) => {
        try {
            const response = await api.get(`/accounts/${accountId}/transactions`, { params });
            return response.data as TransactionResponse[];
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    // Get transaction details
    getTransactionDetails: async (transactionId: string) => {
        try {
            const response = await api.get(`/transactions/${transactionId}`);
            return response.data as TransactionResponse;
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            throw error;
        }
    },

    // Create a new transaction (deposit, withdrawal, transfer)
    createTransaction: async (transactionData: CreateTransactionRequest) => {
        try {
            const response = await api.post('/transactions', transactionData);
            return response.data as TransactionResponse;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    },

    // Cancel a pending transaction
    cancelTransaction: async (transactionId: string) => {
        try {
            const response = await api.patch(`/transactions/${transactionId}/cancel`, {});
            return response.data as TransactionResponse;
        } catch (error) {
            console.error('Error cancelling transaction:', error);
            throw error;
        }
    },

    // Get transaction categories for reporting/analytics
    getTransactionCategories: async () => {
        try {
            const response = await api.get('/transactions/categories');
            return response.data as string[];
        } catch (error) {
            console.error('Error fetching transaction categories:', error);
            throw error;
        }
    },

    // Get transaction summary/statistics
    getTransactionSummary: async (accountId: string, params?: {
        startDate?: string;
        endDate?: string;
        groupBy?: 'day' | 'week' | 'month';
    }) => {
        try {
            const response = await api.get(`/accounts/${accountId}/transactions/summary`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching transaction summary:', error);
            throw error;
        }
    },

    // === CARDS ===

    // Get all cards for the current user
    getCards: async () => {
        try {
            const response = await api.get('/cards');
            return response.data as CardResponse[];
        } catch (error) {
            console.error('Error fetching cards:', error);
            throw error;
        }
    },

    // Get cards for a specific account
    getAccountCards: async (accountId: string) => {
        try {
            const response = await api.get(`/accounts/${accountId}/cards`);
            return response.data as CardResponse[];
        } catch (error) {
            console.error('Error fetching account cards:', error);
            throw error;
        }
    },

    // Get details for a specific card
    getCardDetails: async (cardId: string) => {
        try {
            const response = await api.get(`/cards/${cardId}`);
            return response.data as CardResponse;
        } catch (error) {
            console.error('Error fetching card details:', error);
            throw error;
        }
    },

    // Create a new card
    createCard: async (cardData: CreateCardRequest) => {
        try {
            const response = await api.post('/cards', cardData);
            return response.data as CardResponse;
        } catch (error) {
            console.error('Error creating card:', error);
            throw error;
        }
    },

    // Update card status (activate, block, etc.)
    updateCardStatus: async (cardId: string, status: CardStatus) => {
        try {
            const response = await api.patch(`/cards/${cardId}/status`, { status });
            return response.data as CardResponse;
        } catch (error) {
            console.error('Error updating card status:', error);
            throw error;
        }
    },

    // Update card settings (limit, contactless, etc.)
    updateCardSettings: async (cardId: string, settings: {
        daily_limit?: number;
        is_contactless?: boolean;
    }) => {
        try {
            const response = await api.patch(`/cards/${cardId}/settings`, settings);
            return response.data as CardResponse;
        } catch (error) {
            console.error('Error updating card settings:', error);
            throw error;
        }
    },

    // Report card as lost or stolen
    reportCard: async (cardId: string, reason: 'lost' | 'stolen' | 'damaged') => {
        try {
            const response = await api.post(`/cards/${cardId}/report`, { reason });
            return response.data as CardResponse;
        } catch (error) {
            console.error('Error reporting card:', error);
            throw error;
        }
    },

    // === BENEFICIARIES ===

    // Get all beneficiaries for the current user
    getBeneficiaries: async () => {
        try {
            const response = await api.get('/beneficiaries');
            return response.data as BeneficiaryResponse[];
        } catch (error) {
            console.error('Error fetching beneficiaries:', error);
            throw error;
        }
    },

    // Get beneficiary details
    getBeneficiaryDetails: async (beneficiaryId: string) => {
        try {
            const response = await api.get(`/beneficiaries/${beneficiaryId}`);
            return response.data as BeneficiaryResponse;
        } catch (error) {
            console.error('Error fetching beneficiary details:', error);
            throw error;
        }
    },

    // Create a new beneficiary
    createBeneficiary: async (beneficiaryData: CreateBeneficiaryRequest) => {
        try {
            const response = await api.post('/beneficiaries', beneficiaryData);
            return response.data as BeneficiaryResponse;
        } catch (error) {
            console.error('Error creating beneficiary:', error);
            throw error;
        }
    },

    // Update a beneficiary
    updateBeneficiary: async (beneficiaryId: string, beneficiaryData: Partial<CreateBeneficiaryRequest>) => {
        try {
            const response = await api.put(`/beneficiaries/${beneficiaryId}`, beneficiaryData);
            return response.data as BeneficiaryResponse;
        } catch (error) {
            console.error('Error updating beneficiary:', error);
            throw error;
        }
    },

    // Delete a beneficiary
    deleteBeneficiary: async (beneficiaryId: string) => {
        try {
            await api.delete(`/beneficiaries/${beneficiaryId}`);
            return true;
        } catch (error) {
            console.error('Error deleting beneficiary:', error);
            throw error;
        }
    },

    // === CURRENCY OPERATIONS ===

    // Get current exchange rates
    getExchangeRates: async (baseCurrency?: string) => {
        try {
            const response = await api.get('/exchange-rates', {
                params: baseCurrency ? { base: baseCurrency } : {}
            });
            return response.data as ExchangeRateResponse;
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            throw error;
        }
    },

    // Convert currency (get conversion without making a transaction)
    convertCurrency: async (conversionData: CurrencyConversionRequest) => {
        try {
            const response = await api.post('/currency/convert', conversionData);
            return response.data as CurrencyConversionResponse;
        } catch (error) {
            console.error('Error converting currency:', error);
            throw error;
        }
    },

    // Get conversion history
    getConversionHistory: async () => {
        try {
            const response = await api.get('/currency/history');
            return response.data as CurrencyConversionResponse[];
        } catch (error) {
            console.error('Error fetching conversion history:', error);
            throw error;
        }
    },

    // === USER PROFILE & PREFERENCES ===

    // Get user banking profile
    getUserBankingProfile: async () => {
        try {
            const response = await api.get('/user/banking-profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching user banking profile:', error);
            throw error;
        }
    },

    // Update banking preferences
    updateBankingPreferences: async (preferences: {
        default_currency?: string;
        preferred_currencies?: string[];
        notification_preferences?: object;
    }) => {
        try {
            const response = await api.patch('/user/banking-preferences', preferences);
            return response.data;
        } catch (error) {
            console.error('Error updating banking preferences:', error);
            throw error;
        }
    },

    // === MISC BANKING OPERATIONS ===

    // Request account statement
    requestAccountStatement: async (accountId: string, params: {
        startDate: string;
        endDate: string;
        format?: 'pdf' | 'csv' | 'excel';
    }) => {
        try {
            const response = await api.post(`/accounts/${accountId}/statement`, params);
            return response.data;
        } catch (error) {
            console.error('Error requesting account statement:', error);
            throw error;
        }
    },

    // Get money transfer limits
    getTransferLimits: async () => {
        try {
            const response = await api.get('/transfer/limits');
            return response.data;
        } catch (error) {
            console.error('Error fetching transfer limits:', error);
            throw error;
        }
    },

    // Schedule a future payment/transfer
    scheduleTransfer: async (transferData: CreateTransactionRequest & {
        schedule_date: string;
        is_recurring?: boolean;
        recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
        end_date?: string;
    }) => {
        try {
            const response = await api.post('/transactions/schedule', transferData);
            return response.data;
        } catch (error) {
            console.error('Error scheduling transfer:', error);
            throw error;
        }
    },

    // Get scheduled transfers
    getScheduledTransfers: async () => {
        try {
            const response = await api.get('/transactions/scheduled');
            return response.data;
        } catch (error) {
            console.error('Error fetching scheduled transfers:', error);
            throw error;
        }
    },

    // Cancel scheduled transfer
    cancelScheduledTransfer: async (scheduledTransferId: string) => {
        try {
            const response = await api.delete(`/transactions/scheduled/${scheduledTransferId}`);
            return response.data;
        } catch (error) {
            console.error('Error cancelling scheduled transfer:', error);
            throw error;
        }
    },

    // Direct debit management
    getDirectDebits: async (accountId: string) => {
        try {
            const response = await api.get(`/accounts/${accountId}/direct-debits`);
            return response.data;
        } catch (error) {
            console.error('Error fetching direct debits:', error);
            throw error;
        }
    },

    // Standing order management
    getStandingOrders: async (accountId: string) => {
        try {
            const response = await api.get(`/accounts/${accountId}/standing-orders`);
            return response.data;
        } catch (error) {
            console.error('Error fetching standing orders:', error);
            throw error;
        }
    }
};

export default bankService;