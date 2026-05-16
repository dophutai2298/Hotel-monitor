import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, UserRole } from '../types/auth';
import authApi from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'hotel_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.ADMIN;

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const profile = await authApi.getProfile();
        setUser(profile);
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    const response = await authApi.register(userData);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders (rerender-memo)
  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
  }), [user, isAuthenticated, isAdmin, isLoading, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
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
