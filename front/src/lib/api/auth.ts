import { apiClient } from '../api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  group?: string;
  studentRole?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  group?: string;
  photoUrl?: string;
  studentRole?: string;
  performanceCategory?: string;
  totalPoints?: number;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('authApi.login called with:', { email, hasPassword: !!password, passwordLength: password?.length });
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email: email.trim(),
      password: password,
    });
    apiClient.setAuthTokens(response.token, response.refreshToken);
    return response;
  },

  async register(data: RegisterRequest): Promise<User> {
    return await apiClient.post<User>('/auth/register', data);
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    apiClient.clearAuth();
  },

  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>('/auth/me');
  },

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string; expiresIn: number }> {
    return await apiClient.post('/auth/refresh', { refreshToken });
  },
};

