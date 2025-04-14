import api from './api';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: any;
  requires_otp?: boolean;
  user_id?: string;
}

interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  user: any;
  requires_otp?: boolean;
  user_id?: string;
}

interface OtpVerificationResponse {
  access_token: string;
  refresh_token: string;
  user: any;
}

export const loginApi = async (username: string, password: string) => {
  return await api.post<LoginResponse>('/auth/token', {
    username,
    password,
  });
};

export const registerApi = async (userData: any) => {
  return await api.post<RegisterResponse>('/auth/register', userData);
};

export const verifyOtpApi = async (userId: string, otp: string) => {
  return await api.post<OtpVerificationResponse>('/auth/verify-otp', {
    user_id: userId,
    otp,
  });
};


export const forgotPasswordApi = async (email: string) => {
    return await api.post('/auth/forgot-password', {
      email,
    });
  };
  
  export const resetPasswordApi = async (token: string, newPassword: string) => {
    return await api.post('/auth/reset-password', {
      token,
      password: newPassword,
    });
  };
  
  export const refreshTokenApi = async (refreshToken: string) => {
    return await api.post('/auth/refresh-token', {
      token: refreshToken,
    });
  };