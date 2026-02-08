import { createContext } from 'react';

export type UserRole = 'PARENT' | 'COACH';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
