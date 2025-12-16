import { api } from './api';
import { LoginDto } from '@grow-fitness/shared-schemas';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const authService = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  refreshToken: async (): Promise<AuthResponse | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data: AuthResponse = await response.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      // Refresh failed, clear auth
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return null;
    }
  },

  logout: async () => {
    try {
      // Call logout API endpoint
      await api.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, clear local storage
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage regardless of API call result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    // Basic token validation - check if token exists and has valid format
    // The server will validate the actual token expiration
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false; // JWT should have 3 parts

      // Optionally check expiration (but don't fail if we can't parse)
      try {
        const payload = JSON.parse(atob(parts[1]));
        const exp = payload.exp * 1000;
        if (Date.now() >= exp) {
          return false; // Token expired
        }
      } catch {
        // If we can't parse expiration, still consider token valid
        // The server will handle validation
      }

      return true;
    } catch {
      return false;
    }
  },
};
