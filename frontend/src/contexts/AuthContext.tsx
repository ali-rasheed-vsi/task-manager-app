'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { User, AuthContextType, AuthTokens } from '@/types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 AuthContext: Initializing authentication...');
      const token = localStorage.getItem('accessToken');
      const refresh = localStorage.getItem('refreshToken');
      console.log('🔐 AuthContext: Found access token:', !!token, 'Length:', token?.length);
      
      try {
        if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
          console.log('🔐 AuthContext: Valid token found, fetching profile...');
          const response = await apiClient.getProfile();
          console.log('🔐 AuthContext: Profile fetched successfully:', { hasUserData: !!response.data });
          setUser(response.data as User);
        } else if (refresh && refresh !== 'null' && refresh !== 'undefined' && refresh.length > 10) {
          // Try silent refresh first when only refresh token exists
          console.log('🔐 AuthContext: No access token but refresh token exists, attempting refresh...');
          try {
            const refreshed = await apiClient.refreshToken();
            const { accessToken } = refreshed.data as { accessToken: string };
            localStorage.setItem('accessToken', accessToken);
            console.log('🔐 AuthContext: Refresh succeeded, fetching profile...');
            const response = await apiClient.getProfile();
            setUser(response.data as User);
          } catch (e) {
            console.error('❌ AuthContext: Refresh on init failed:', e);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        } else {
          console.log('🔐 AuthContext: No valid tokens, clearing auth state');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ AuthContext: Initialization error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
      console.log('🔐 AuthContext: Setting loading to false');
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Starting login process for email:', email);
      setIsLoading(true);
      console.log('⏳ AuthContext: Loading state set to true');
      
      console.log('🌐 AuthContext: Calling API login...');
      const response = await apiClient.login({ email, password });
      console.log('✅ AuthContext: API login response received:', {
        hasAccessToken: !!(response.data as AuthTokens)?.accessToken,
        hasRefreshToken: !!(response.data as AuthTokens)?.refreshToken
      });
      
      const { accessToken, refreshToken } = response.data as AuthTokens;
      console.log('🔑 AuthContext: Tokens extracted:', {
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length
      });
      
      console.log('💾 AuthContext: Storing tokens in localStorage and cookies...');
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Also set cookies for server-side authentication
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      console.log('✅ AuthContext: Tokens stored successfully');
      
      // Get user profile
      console.log('👤 AuthContext: Fetching user profile...');
      const profileResponse = await apiClient.getProfile();
      console.log('✅ AuthContext: Profile response received:', {
        hasUserData: !!profileResponse.data,
        userEmail: profileResponse.data?.email,
        userName: profileResponse.data?.name
      });
      
      console.log('👤 AuthContext: Setting user state...');
      setUser(profileResponse.data as User);
      console.log('✅ AuthContext: User state updated successfully');
      
      toast.success('Login successful!');
      console.log('🎉 AuthContext: Login process completed successfully');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error('❌ AuthContext: Login error occurred:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText
      });
      
      const message = axiosError.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      console.log('🏁 AuthContext: Setting loading state to false');
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.signup({ name, email, password });
      const { accessToken, refreshToken } = response.data as AuthTokens;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Also set cookies for server-side authentication
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      // Get user profile
      const profileResponse = await apiClient.getProfile();
      setUser(profileResponse.data as User);
      
      toast.success('Account created successfully!');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Signup failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear user state immediately
      setUser(null);
      
      // Clear all cached queries
      queryClient.clear();
      
      // Cancel all pending requests
      queryClient.cancelQueries();
      
      // Try to call logout API to clear server-side cookies
      try {
        await apiClient.logout();
      } catch (error) {
        console.log('Logout API call failed, but continuing with local cleanup', error);
      }
      
      // Clear all tokens from localStorage and cookies
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear cookies
      document.cookie = 'accessToken=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      
      // Force a page reload to clear all cached data and cancel any pending requests
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, we should still clear local state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear cookies
      document.cookie = 'accessToken=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      
      setUser(null);
      queryClient.clear();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();
      const { accessToken } = response.data as { accessToken: string };
      localStorage.setItem('accessToken', accessToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh token is expired, clear everything and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      queryClient.clear();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
