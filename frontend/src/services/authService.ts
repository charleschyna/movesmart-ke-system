import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { API_BASE_URL, STORAGE_KEYS, API_ENDPOINTS } from '../constants';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authService = {
  // Login with username/password
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await authAPI.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await authAPI.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  // Get user profile
  async getProfile() {
    const response = await authAPI.get(API_ENDPOINTS.AUTH.PROFILE);
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
    const response = await authAPI.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  // Google OAuth login
  async googleLogin(credential: string): Promise<AuthResponse> {
    const response = await authAPI.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
      token: credential,
    });
    return response.data;
  },
};

export default authService;
