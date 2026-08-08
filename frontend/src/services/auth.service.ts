import api from './api';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth.types';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post('/auth/login', payload);
    return response.data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post('/auth/register', payload);
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { email, newPassword });
    return response.data;
  },
};
