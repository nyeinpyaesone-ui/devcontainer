// Authentication Context - Manages auth state across the application

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { ENV } from '../config/env';
import type { User, AuthTokens, AuthContextType, LoginCredentials, RegisterData } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(ENV.AUTH_TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(ENV.AUTH_REFRESH_TOKEN_KEY);
        const storedUser = localStorage.getItem(ENV.AUTH_USER_KEY);

        if (storedToken && storedRefreshToken && storedUser) {
          setTokens({
            accessToken: storedToken,
            refreshToken: storedRefreshToken,
            expiresIn: ENV.AUTH_TOKEN_EXPIRY,
          });
          setUser(JSON.parse(storedUser));

          // Verify token is still valid
          try {
            const response = await apiService.verify();
            if (response.success && response.data?.user) {
              setUser(response.data.user);
              localStorage.setItem(ENV.AUTH_USER_KEY, JSON.stringify(response.data.user));
            }
          } catch (err) {
            // Token invalid, clear auth state
            clearAuth();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Clear authentication state
  const clearAuth = useCallback(() => {
    setUser(null);
    setTokens(null);
    apiService.clearAuthTokens();
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.login(credentials.email, credentials.password);

      if (response.success && response.data) {
        const { user: userData, tokens: tokenData } = response.data;
        
        setUser(userData);
        setTokens(tokenData);
        apiService.setAuthTokens(tokenData.accessToken, tokenData.refreshToken);
        localStorage.setItem(ENV.AUTH_USER_KEY, JSON.stringify(userData));
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.register(
        data.email,
        data.username,
        data.password,
        data.displayName
      );

      if (response.success && response.data) {
        // Auto-login after registration
        await login({ email: data.email, password: data.password });
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await apiService.refresh();

      if (response.success && response.data?.tokens) {
        const newTokens = response.data.tokens;
        setTokens(newTokens);
        apiService.setAuthTokens(newTokens.accessToken, newTokens.refreshToken);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      clearAuth();
      throw err;
    }
  }, [clearAuth]);

  // Update user
  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem(ENV.AUTH_USER_KEY, JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Update user error:', err);
      throw err;
    }
  }, [user]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
