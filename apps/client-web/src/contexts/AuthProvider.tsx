import { useState, type ReactNode } from 'react';
import { authService } from '@/services/auth';
import { AuthContext, type AuthUser } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = authService.getUser();
    const token = authService.getToken();
    return token ? storedUser : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedUser = authService.getUser();
    const token = authService.getToken();
    return !!(storedUser && token);
  });
  
  const [isLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setUser(res.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
