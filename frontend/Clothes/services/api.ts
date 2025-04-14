import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état
      // en dehors de la plage 2xx
      console.error('API Error Response:', error.response.data);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('API Error Request:', error.request);
    } else {
      // Une erreur s'est produite lors de la création de la requête
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
