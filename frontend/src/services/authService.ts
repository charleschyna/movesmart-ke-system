import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

const API_BASE_URL = 'http://127.0.0.1:8000';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authService = {
  // Login with username/password
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await authAPI.post('/auth/login/', data);
    return response.data;
  },

  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await authAPI.post('/auth/register/', data);
    return response.data;
  },

  // Get user profile
  async getProfile() {
    const response = await authAPI.get('/auth/profile/');
    return response.data;
  },

  // Update user profile
  async updateProfile(data: Partial<RegisterRequest>) {
    const response = await authAPI.put('/auth/profile/update/', data);
    return response.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await authAPI.post('/auth/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Logout
  async logout() {
    const response = await authAPI.post('/auth/logout/');
    return response.data;
  },

  // Google OAuth login
  async googleLogin(credential: string): Promise<AuthResponse> {
    const response = await authAPI.post('/auth/google/', {
      credential,
    });
    return response.data;
  },
};

export default authService;
