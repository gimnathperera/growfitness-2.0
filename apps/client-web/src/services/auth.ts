import { api } from './api';
import type { LoginDto } from '@grow-fitness/shared-schemas';

/* ---------- ROLES ---------- */
export type UserRole = 'PARENT' | 'COACH';

/* ---------- USER ---------- */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/* ---------- AUTH RESPONSE ---------- */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/* ---------- STORAGE KEYS ---------- */
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/* ---------- AUTH SERVICE ---------- */
export const authService = {
  /* ---------- LOGIN (Same UI for Parent & Coach) ---------- */
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);

    if (response.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
  },

  /* ---------- REFRESH TOKEN ---------- */
  refreshToken: async (): Promise<AuthResponse | null> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const response = await api.post<AuthResponse>('/auth/refresh', {
        refreshToken,
      });

      if (response.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      }

      return response;
    } catch {
      authService.clearAuth();
      return null;
    }
  },

  /* ---------- LOGOUT ---------- */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      authService.clearAuth();
    }
  },

  /* ---------- HELPERS ---------- */
  getToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getUser: (): AuthUser | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  getRole: (): UserRole | null => {
    const user = authService.getUser();
    return user?.role ?? null;
  },

  isParent: (): boolean => {
    return authService.getRole() === 'PARENT';
  },

  isCoach: (): boolean => {
    return authService.getRole() === 'COACH';
  },

  /* ---------- AUTH CHECK ---------- */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Optional JWT expiry check
      try {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          return false;
        }
      } catch {
        // If parsing fails, let backend decide
      }

      return true;
    } catch {
      return false;
    }
  },

  /* ---------- CLEAR STORAGE ---------- */
  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
