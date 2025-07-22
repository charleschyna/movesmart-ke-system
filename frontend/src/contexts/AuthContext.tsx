import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    if (state.token) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.getProfile();
      dispatch({
        type: 'SET_USER',
        payload: {
          user: response.user,
          token: state.token!,
        },
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    }
  };

  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login({ username, password });
      
      localStorage.setItem('token', response.token);
      dispatch({
        type: 'SET_USER',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      
      toast.success(`Welcome back, ${response.user.first_name || response.user.username}!`);
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.register(data);
      
      localStorage.setItem('token', response.token);
      dispatch({
        type: 'SET_USER',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      
      toast.success(`Welcome to MoveSmart KE, ${response.user.first_name}!`);
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.googleLogin(credential);
      
      localStorage.setItem('token', response.token);
      dispatch({
        type: 'SET_USER',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      
      toast.success(`Welcome, ${response.user.first_name || response.user.username}!`);
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error || 'Google login failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'CLEAR_USER' });
      toast.success('Logged out successfully');
    }
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    login,
    register,
    loginWithGoogle,
    logout,
    loading: state.loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
