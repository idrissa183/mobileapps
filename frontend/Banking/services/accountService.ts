import api from './api';
import { AxiosResponse } from 'axios';
import { Currency } from './transactionService';

// Account interface matching backend model
export interface Account {
    id: string;
    account_number: string;
    account_name: string;
    balance: number;
    currency: Currency;
    is_active: boolean;
    is_primary: boolean;
    created_at: string; // ISO datetime format
    updated_at: string; // ISO datetime format
    last_transaction?: string | null; // ISO datetime format
}

export interface AccountSummary {
    id: string;
    account_number: string;
    account_name: string;
    balance: number;
    currency: Currency;
}

const accountService = {
    // Get account details for the current user
    getAccountDetails: async (): Promise<Account> => {
        try {
            const response: AxiosResponse<Account> = await api.get('/banking/accounts/current');
            return response.data;
        } catch (error) {
            console.error('Error fetching account details:', error);
            throw error;
        }
    },

    // Get account summary (used in dashboard or quick views)
    getAccountSummary: async (): Promise<AccountSummary> => {
        try {
            const response: AxiosResponse<AccountSummary> = await api.get('/banking/accounts/summary');
            return response.data;
        } catch (error) {
            console.error('Error fetching account summary:', error);
            throw error;
        }
    }
};

export default accountService;