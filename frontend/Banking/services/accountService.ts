import api from './api';
import { AxiosResponse } from 'axios';
import { Currency } from './transactionService';

export interface Account {
    id: string;
    account_number: string;
    account_name: string;
    balance: number;
    currency: Currency;
    is_active: boolean;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
    last_transaction: string | null;
}

const accountService = {
    /**
     * Récupère le compte bancaire de l'utilisateur connecté
     * Cette fonction appelle directement l'endpoint du compte
     */
    getUserAccount: async (): Promise<Account> => {
        try {
            const accountResponse: AxiosResponse<Account> = await api.get('/banking/accounts');
            return accountResponse.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du compte:', error);
            throw error;
        }
    },

    /**
     * Convertit le montant d'une devise à une autre
     */
    convertCurrency: async (
        amount: number,
        fromCurrency: Currency,
        toCurrency: Currency
    ): Promise<number> => {
        try {
            const response: AxiosResponse<any> = await api.post('/banking/currency/convert', {
                from_currency: fromCurrency,
                to_currency: toCurrency,
                amount: amount
            });

            return response.data.converted_amount;
        } catch (error) {
            console.error('Erreur lors de la conversion de devise:', error);
            throw error;
        }
    }
};

export default accountService;