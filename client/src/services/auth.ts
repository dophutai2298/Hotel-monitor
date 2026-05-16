import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/profile');
    return data;
  },
};

export default authApi;
