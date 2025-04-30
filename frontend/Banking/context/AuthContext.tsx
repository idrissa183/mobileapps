import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi, registerApi, verifyOtpApi, forgotPasswordApi } from '../services/auth';

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  hashed_password: string;
  phone?: string;
  profile_image?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOtpVerification: boolean;
  tempUserId?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
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
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  verifyOtp: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Check if user is already logged in
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userString = await AsyncStorage.getItem('user');
        
        if (token && userString) {
          const user = JSON.parse(userString);
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

    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { data } = await loginApi(email, password);
      
      // If OTP verification is required
      if (data.requires_otp) {
        setAuthState({
          ...initialState,
          isLoading: false,
          needsOtpVerification: true,
          tempUserId: data.user_id,
        });
        return;
      }
      
      // If login successful and no OTP required
      await AsyncStorage.setItem('authToken', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        token: data.access_token,
        isLoading: false,
        isAuthenticated: true,
        needsOtpVerification: false,
      });
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { data } = await registerApi(userData);
      
      // If registration requires OTP verification
      if (data.requires_otp) {
        setAuthState({
          ...initialState,
          isLoading: false,
          needsOtpVerification: true,
          tempUserId: data.user_id,
        });
        return;
      }
      
      // If registration is successful and no OTP required
      await AsyncStorage.setItem('authToken', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        token: data.access_token,
        isLoading: false,
        isAuthenticated: true,
        needsOtpVerification: false,
      });
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const verifyOtp = async (otp: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { data } = await verifyOtpApi(authState.tempUserId || '', otp);
      
      // If OTP verification is successful
      await AsyncStorage.setItem('authToken', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        token: data.access_token,
        isLoading: false,
        isAuthenticated: true,
        needsOtpVerification: false,
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await forgotPasswordApi(email);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Forgot password error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      // Implement resetPasswordApi
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Reset password error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      setAuthState({
        ...initialState,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
