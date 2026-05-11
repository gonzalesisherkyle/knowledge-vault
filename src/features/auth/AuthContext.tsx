import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, type AuthUserPayload, type RegisterPayload } from '@/lib/api';
import type { ApiResponse, User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  groupId: string | null;
  isAdmin: boolean;
  login: (credentials: any) => Promise<ApiResponse<AuthUserPayload>>;
  register: (userData: any) => Promise<ApiResponse<RegisterPayload>>;
  verifyEmail: (payload: { email: string; code: string }) => Promise<ApiResponse<AuthUserPayload>>;
  resendVerification: (email: string) => Promise<ApiResponse<{ message: string }>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.me();
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    const response = await authApi.login(credentials);
    if (response.success && response.data) {
      setUser(response.data.user);
    }
    return response;
  };

  const register = async (userData: any) => {
    const response = await authApi.register(userData);
    if (response.success && response.data && !response.data.requiresEmailVerification) {
      setUser(response.data.user);
    }
    return response;
  };

  const verifyEmail = async (payload: { email: string; code: string }) => {
    const response = await authApi.verifyEmail(payload);
    if (response.success && response.data) {
      setUser(response.data.user);
    }
    return response;
  };

  const resendVerification = async (email: string) => authApi.resendVerification(email);

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    localStorage.removeItem('knowledgeVaultToken');
    localStorage.removeItem('authToken');
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token: null, 
      isAuthenticated: !!user, 
      isLoading, 
      groupId: user?.groupId || null,
      isAdmin: user?.role === 'admin',
      login, 
      register, 
      verifyEmail,
      resendVerification,
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
