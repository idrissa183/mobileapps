import axios, { AxiosResponse } from 'axios';
import api from './api';

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

export interface TransactionSummary {
    totalSent: number;
    totalReceived: number;
    count: number;
}

// Types complémentaires pour l'API
export interface PaginationParams {
    limit: number;
    skip: number;
    search?: string;
}


/**
 * Service pour gérer les contacts dans l'application bancaire
 */
const contactService = {
    /**
     * Récupère la liste des contacts avec une recherche optionnelle et pagination
     * @param search - Terme de recherche optionnel (nom, email, etc.)
     * @param limit - Nombre maximum de contacts à retourner
     * @param skip - Nombre de contacts à sauter (pour la pagination)
     * @returns Promise avec un tableau de contacts
     */
    getContacts: async (
        search?: string,
        limit: number = 20,
        skip: number = 0
    ): Promise<Contact[]> => {
        try {
            const params: PaginationParams = {
                limit,
                skip
            };

            if (search) {
                params.search = search;
            }

            const response: AxiosResponse<Contact[]> = await api.get('/banking/contacts', { params });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des contacts:', error);
            throw error;
        }
    },

    /**
     * Récupère les détails d'un contact spécifique
     * @param contactId - ID du contact à récupérer
     * @returns Promise avec les détails du contact
     */
    getContactById: async (contactId: string): Promise<Contact> => {
        try {
            const response: AxiosResponse<Contact> = await api.get(`/banking/contacts/${contactId}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des détails du contact ${contactId}:`, error);
            throw error;
        }
    }
};

export default contactService;