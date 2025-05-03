import api from './api';
import { AxiosResponse } from 'axios';

// Enums matching backend types
export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAWAL = 'withdrawal',
    TRANSFER = 'transfer'
}

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export enum Currency {
    USD = 'USD',
    EUR = 'EUR',
    XOF = 'XOF'
}

// Interfaces for request/response types
export interface Transaction {
    id: string;
    transaction_id: string;
    account_id: string;
    transaction_type: TransactionType;
    amount: number;
    currency: Currency;
    description: string;
    status: TransactionStatus;
    recipient_name?: string | null;
    recipient_account_number?: string | null;
    transaction_date: string; // ISO datetime format
}

export interface DepositRequest {
    amount: number;
    description?: string;
}

export interface WithdrawalRequest {
    amount: number;
    description?: string;
}

export interface TransferRequest {
    to_account_number: string;
    amount: number;
    description?: string;
}

export interface ConversionRequest {
    from_currency: Currency;
    to_currency: Currency;
    amount: number;
}

export interface ConversionResponse {
    from_currency: Currency;
    to_currency: Currency;
    amount: number;
    converted_amount: number;
    exchange_rate: number;
    date: string; // ISO datetime format
}

const transactionService = {
    // Get transactions with optional filters
    getTransactions: async (
        params?: {
            transaction_type?: TransactionType,
            start_date?: string, // ISO datetime format
            end_date?: string, // ISO datetime format
            limit?: number,
            offset?: number
        }
    ): Promise<Transaction[]> => {
        try {
            const response: AxiosResponse<Transaction[]> = await api.get('/banking/transactions', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    // Deposit money
    depositMoney: async (depositData: DepositRequest): Promise<Transaction> => {
        try {
            const response: AxiosResponse<Transaction> = await api.post('/banking/transactions/deposit', depositData);
            return response.data;
        } catch (error) {
            console.error('Error depositing money:', error);
            throw error;
        }
    },

    // Withdraw money
    withdrawMoney: async (withdrawalData: WithdrawalRequest): Promise<Transaction> => {
        try {
            const response: AxiosResponse<Transaction> = await api.post('/banking/transactions/withdrawal', withdrawalData);
            return response.data;
        } catch (error) {
            console.error('Error withdrawing money:', error);
            throw error;
        }
    },

    // Transfer money
    transferMoney: async (transferData: TransferRequest): Promise<Transaction> => {
        try {
            const response: AxiosResponse<Transaction> = await api.post('/banking/transactions/transfer', transferData);
            return response.data;
        } catch (error) {
            console.error('Error transferring money:', error);
            throw error;
        }
    },

    // Convert currency
    convertCurrency: async (conversionData: ConversionRequest): Promise<ConversionResponse> => {
        try {
            const response: AxiosResponse<ConversionResponse> = await api.post('/banking/currency/convert', conversionData);
            return response.data;
        } catch (error) {
            console.error('Error converting currency:', error);
            throw error;
        }
    }
};

export default transactionService;