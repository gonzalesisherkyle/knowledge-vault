import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  groupId: string | null;
  isAdmin: boolean;
  login: (credentials: any) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('knowledgeVaultToken'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        // Token might be invalid
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (credentials: any) => {
    const response = await authApi.login(credentials);
    if (response.success && response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('knowledgeVaultToken', response.data.token);
      return true;
    }
    return false;
  };

  const register = async (userData: any) => {
    const response = await authApi.register(userData);
    if (response.success && response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('knowledgeVaultToken', response.data.token);
      return true;
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('knowledgeVaultToken');
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      isLoading, 
      groupId: user?.groupId || null,
      isAdmin: user?.role === 'admin',
      login, 
      register, 
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
