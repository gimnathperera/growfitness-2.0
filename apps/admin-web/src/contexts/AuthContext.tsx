import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';

interface AuthContextType {
  user: { id: string; email: string; role: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize auth state from localStorage synchronously
function getInitialAuthState() {
  const storedUser = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();
  return {
    user: storedUser && isAuthenticated ? storedUser : null,
    isAuthenticated: !!isAuthenticated,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(getInitialAuthState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify token is still valid by checking if user data exists
    const storedUser = authService.getUser();
    const token = authService.getToken();

    if (storedUser && token) {
      setAuthState({
        user: storedUser,
        isAuthenticated: true,
      });
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setAuthState({
      user: response.user,
      isAuthenticated: true,
    });
  };

  const logout = async () => {
    await authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
