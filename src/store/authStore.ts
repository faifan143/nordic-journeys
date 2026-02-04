import { create } from 'zustand';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSubAdmin: boolean;
  isAdminOrSubAdmin: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isSubAdmin: false,
  isAdminOrSubAdmin: false,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
      isSubAdmin: user.role === 'SUB_ADMIN',
      isAdminOrSubAdmin: user.role === 'ADMIN' || user.role === 'SUB_ADMIN',
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isSubAdmin: false,
      isAdminOrSubAdmin: false,
      isLoading: false,
    });
  },

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      // Verify token by fetching current user
      const user = await authApi.me();
      set({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.role === 'ADMIN',
        isSubAdmin: user.role === 'SUB_ADMIN',
        isAdminOrSubAdmin: user.role === 'ADMIN' || user.role === 'SUB_ADMIN',
        isLoading: false,
      });
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        isSubAdmin: false,
        isAdminOrSubAdmin: false,
        isLoading: false,
      });
    }
  },

  refreshUser: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const user = await authApi.me();
      set({
        user,
        isAdmin: user.role === 'ADMIN',
        isSubAdmin: user.role === 'SUB_ADMIN',
        isAdminOrSubAdmin: user.role === 'ADMIN' || user.role === 'SUB_ADMIN',
      });
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      // If refresh fails, logout
      get().logout();
    }
  },
}));
