import api from './api';
import { AxiosResponse } from 'axios';

// Interface for Contact as returned by the API
export interface Contact {
    id: string;
    user_id: string;
    username: string;
    full_name: string;
    email: string;
    profile_image?: string | null;
    account_number: string;
    account_name: string;
    phone?: string | null;
}

const contactService = {
    // Get all contacts (with optional search and pagination)
    getContacts: async (
        search?: string,
        limit: number = 20,
        skip: number = 0
    ): Promise<Contact[]> => {
        try {
            const params = {
                search,
                limit,
                skip
            };

            const response: AxiosResponse<Contact[]> = await api.get('/banking/contacts', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    },

    // Get details of a specific contact
    getContactById: async (contactId: string): Promise<Contact> => {
        try {
            const response: AxiosResponse<Contact> = await api.get(`/banking/contacts/${contactId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching contact details for ID ${contactId}:`, error);
            throw error;
        }
    }
};

export default contactService;