import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://banque-vgx0.onrender.com/api';

// Types
interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: any;
}

interface RegisterData {
    username: string;
    email: string;
    full_name: string;
    password: string;
    phone?: string;
    uses_student_app?: boolean;
    uses_banking_app?: boolean;
    uses_clothes_app?: boolean;
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (!refreshToken) {
                    return Promise.reject(error);
                }

                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    token: refreshToken
                });

                const { access_token, refresh_token } = response.data;

                await AsyncStorage.setItem('authToken', access_token);
                await AsyncStorage.setItem('refreshToken', refresh_token);

                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return axios(originalRequest);
            } catch (refreshError) {
                await authService.logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

const authService = {
    /**
     * Login with username and password
     */
    login: async (username: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await api.post('/auth/token', {
                username,
                password
            });

            await AsyncStorage.setItem('authToken', response.data.access_token);
            await AsyncStorage.setItem('refreshToken', response.data.refresh_token);
            await AsyncStorage.setItem('tokenExpiry', (Date.now() + response.data.expires_in * 1000).toString());
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error: any) {
            // console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Register a new user
     */
    register: async (userData: RegisterData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error: any) {
            console.error('Registration error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Verify OTP code after registration
     */
    verifyOtp: async (email: string, otp: string) => {
        try {
            const response = await api.post('/auth/verify-otp', {
                email,
                otp_code: otp
            });

            if (response.data) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data));
            }

            return response.data;
        } catch (error: any) {
            console.error('OTP verification error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Request password reset
     */
    forgotPassword: async (email: string) => {
        try {
            const response = await api.post('/auth/password-reset', { email });
            return response.data;
        } catch (error: any) {
            console.error('Forgot password error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Reset password with token and new password
     */
    resetPassword: async (email: string, resetCode: string, newPassword: string) => {
        try {
            const response = await api.post('/auth/password-reset/confirm', {
                email,
                reset_code: resetCode,
                new_password: newPassword
            });
            return response.data;
        } catch (error: any) {
            console.error('Reset password error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Change password for authenticated user
     */
    changePassword: async (currentPassword: string, newPassword: string) => {
        try {
            const response = await api.post('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            return response.data;
        } catch (error: any) {
            console.error('Change password error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Update user profile
     */
    updateProfile: async (profileData: any) => {
        try {
            const response = await api.post('/auth/update-profile', profileData);

            await AsyncStorage.setItem('user', JSON.stringify(response.data));

            return response.data;
        } catch (error: any) {
            console.error('Update profile error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Get current user profile
     */
    getUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error: any) {
            console.error('Get user error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Resend OTP verification code
     */
    resendOtp: async (email: string) => {
        try {
            const response = await api.post('/auth/resend-otp', { email });
            return response.data;
        } catch (error: any) {
            console.error('Resend OTP error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Logout user and clear stored data
     */
    logout: async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                await api.post('/auth/logout');
            }
        } catch (error) {
            console.error('Logout API error:', error);
        }

        try {
            await AsyncStorage.multiRemove([
                'authToken',
                'refreshToken',
                'tokenExpiry',
                'user'
            ]);
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const expiryString = await AsyncStorage.getItem('tokenExpiry');

            if (!token || !expiryString) {
                return false;
            }

            const expiry = parseInt(expiryString, 10);
            if (Date.now() > expiry) {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (!refreshToken) {
                    return false;
                }

                try {
                    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                        token: refreshToken
                    });

                    const { access_token, refresh_token, expires_in } = response.data;

                    await AsyncStorage.setItem('authToken', access_token);
                    await AsyncStorage.setItem('refreshToken', refresh_token);
                    await AsyncStorage.setItem('tokenExpiry', (Date.now() + expires_in * 1000).toString());

                    return true;
                } catch (error) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Authentication check error:', error);
            return false;
        }
    }
};

export default authService;