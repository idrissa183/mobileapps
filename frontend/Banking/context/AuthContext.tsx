import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  profile_image?: string;
  roles: string[];
  status: string;
  uses_student_app: boolean;
  uses_banking_app: boolean;
  uses_clothes_app: boolean;
  created_at: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOtpVerification: boolean;
  pendingEmail?: string;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  needsOtpVerification: false,
};

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => { },
  register: async () => { },
  logout: async () => { },
  verifyOtp: async () => { },
  forgotPassword: async () => { },
  resetPassword: async () => { },
  updateProfile: async () => { },
  changePassword: async () => { },
  resendOtp: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userJson = await AsyncStorage.getItem('user');

        if (token && userJson) {
          const user = JSON.parse(userJson);
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
            needsOtpVerification: false,
          });
        } else {
          setAuthState({
            ...initialState,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState({
          ...initialState,
          isLoading: false,
        });
      }
    };

    loadAuthState();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const response = await authService.login(username, password);

      setAuthState({
        user: response.user,
        token: response.access_token,
        isLoading: false,
        isAuthenticated: true,
        needsOtpVerification: false,
      });
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));

      if (error.response?.data?.requires_otp) {
        setAuthState(prev => ({
          ...prev,
          needsOtpVerification: true,
          pendingEmail: username.includes('@') ? username : error.response?.data?.email
        }));
      }

      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const response = await authService.register(userData);

      setAuthState({
        ...initialState,
        isLoading: false,
        needsOtpVerification: true,
        pendingEmail: userData.email,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const response = await authService.verifyOtp(email, otp);

      setAuthState({
        user: response,
        token: response.access_token,
        isLoading: false,
        isAuthenticated: true,
        needsOtpVerification: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authService.forgotPassword(email);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authService.resetPassword(email, resetCode, newPassword);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const updatedUser = await authService.updateProfile(profileData);

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authService.changePassword(currentPassword, newPassword);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authService.resendOtp(email);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authService.logout();

      setAuthState({
        ...initialState,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        verifyOtp,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};