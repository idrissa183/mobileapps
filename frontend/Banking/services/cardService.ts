import api from './api';
import { AxiosResponse } from 'axios';

// Enums matching backend types
export enum CardType {
    DEBIT = 'debit',
    VIRTUAL = 'virtual'
}

export enum CardStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BLOCKED = 'blocked',
    EXPIRED = 'expired'
}

// Interfaces for request/response types
export interface CardCreateRequest {
    card_type?: CardType;
    card_name: string;
    daily_limit?: number;
    is_contactless?: boolean;
    is_virtual?: boolean;
    purpose?: string | null;
}

export interface Card {
    id: string;
    card_number: string;
    card_type: CardType;
    card_name: string;
    expiry_date: string; // ISO date format
    is_contactless: boolean;
    daily_limit: number;
    status: CardStatus;
    is_virtual: boolean;
    purpose?: string | null;
    created_at: string; // ISO datetime format
}

const cardService = {
    // Get all cards for the current user
    getAllCards: async (): Promise<Card[]> => {
        try {
            const response: AxiosResponse<Card[]> = await api.get('/banking/cards');
            return response.data;
        } catch (error) {
            console.error('Error fetching cards:', error);
            throw error;
        }
    },

    // Get details of a specific card
    getCardDetails: async (cardId: string): Promise<Card> => {
        try {
            const response: AxiosResponse<Card> = await api.get(`/banking/cards/${cardId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching card details for ID ${cardId}:`, error);
            throw error;
        }
    },

    // Create a new card
    createCard: async (cardData: CardCreateRequest): Promise<Card> => {
        try {
            const response: AxiosResponse<Card> = await api.post('/banking/cards', cardData);
            return response.data;
        } catch (error) {
            console.error('Error creating card:', error);
            throw error;
        }
    }
};

export default cardService;