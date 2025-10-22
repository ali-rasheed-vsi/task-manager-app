import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { AuthTokens, LoginRequest, SignupRequest, User, Task, CreateTaskRequest, UpdateTaskRequest, PaginatedResponse, PaginationQuery } from '@/types';

/**
 * Functional API Client
 * 
 * This module provides a functional approach to API calls instead of a class-based approach.
 * All functions are exported individually and can be imported directly:
 * 
 * import { login, getTasks, createTask } from '@/lib/api';
 * 
 * The apiClient object is also exported for backward compatibility with existing code.
 */

// Global state for token refresh
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Utility functions
const clearAuthAndRedirect = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
};

const isRefreshTokenExpired = (): boolean => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken || refreshToken === 'null' || refreshToken === 'undefined') {
    return true;
  }
  return isTokenExpired(refreshToken);
};

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  return !!(token && token !== 'null' && token !== 'undefined' && token.length > 10);
};

// Single-flight refresh to avoid multiple refresh calls
const getFreshAccessToken = async (): Promise<string> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = new Promise<string>(async (resolve, reject) => {
    try {
      const response = await refreshToken();
      const { accessToken } = response.data as { accessToken: string };
      localStorage.setItem('accessToken', accessToken);
      isRefreshing = false;
      refreshPromise = null;
      resolve(accessToken);
    } catch (err) {
      // If refresh fails, clear everything and redirect to login
      clearAuthAndRedirect();
      isRefreshing = false;
      refreshPromise = null;
      reject(err);
    }
  });

  return refreshPromise;
};

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    async (config) => {
      // Skip auth logic for login and signup endpoints
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/signup')) {
        return config;
      }

      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // Check if refresh token is expired first
      if (isRefreshTokenExpired()) {
        clearAuthAndRedirect();
        return Promise.reject(new Error('Refresh token expired'));
      }

      // If access token missing but refresh exists, try to refresh silently before request
      if ((!token || token === 'null' || token === 'undefined') && refreshToken) {
        try {
          const newToken = await getFreshAccessToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } catch {
          // fallthrough, request will likely 401 and be handled in response interceptor
        }
      } else if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
        // Check if access token is expired
        if (isTokenExpired(token)) {
          // Access token expired, try to refresh
          try {
            const newToken = await getFreshAccessToken();
            config.headers.Authorization = `Bearer ${newToken}`;
          } catch {
            // fallthrough, request will likely 401 and be handled in response interceptor
          }
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        delete config.headers.Authorization;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptors; handle refresh on 401
  client.interceptors.response.use(
    (response) => {
      if (response && response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
        return { ...response, data: (response.data as { data: unknown }).data };
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Check if we have a refresh token before attempting refresh
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken || refreshToken === 'null' || refreshToken === 'undefined') {
          // No refresh token, clear everything and redirect to login
          clearAuthAndRedirect();
          return Promise.reject(error);
        }

        try {
          const newToken = await getFreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed (likely expired), clear everything and redirect to login
          clearAuthAndRedirect();
          return Promise.reject(refreshError);
        }
      }

      // If we still have a 401 here (e.g., user not found after refresh), clear auth and redirect
      if (error.response?.status === 401) {
        clearAuthAndRedirect();
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Create the client instance
const client = createApiClient();

// Auth endpoints
export const login = async (data: LoginRequest): Promise<AxiosResponse<AuthTokens>> => {
  console.log('🌐 API Client: Making login request to /auth/login with data:', { email: data.email, password: data.password });
  try {
    const response = await client.post('/auth/login', data);
    console.log('✅ API Client: Login request successful:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      success: response.data?.success,
      message: response.data?.message
    });
    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.error('❌ API Client: Login request failed:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data
    });
    throw error;
  }
};

export const signup = async (data: SignupRequest): Promise<AxiosResponse<AuthTokens>> => {
  return client.post('/auth/signup', data);
};

export const refreshToken = async (): Promise<AxiosResponse<{ accessToken: string }>> => {
  return client.post('/auth/refresh-token');
};

export const logout = async (): Promise<AxiosResponse<{ message: string }>> => {
  // Create a separate client for logout that doesn't have auth interceptors
  const logoutClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return logoutClient.post('/auth/logout');
};

export const getProfile = async (): Promise<AxiosResponse<User>> => {
  console.log('👤 API Client: Getting user profile...');
  console.log('🔍 API Client: Checking authentication status...');
  
  if (!isAuthenticated()) {
    console.error('❌ API Client: User not authenticated, cannot get profile');
    throw new Error('User not authenticated');
  }
  
  console.log('✅ API Client: User is authenticated, making profile request...');
  try {
    const response = await client.get('/auth/profile');
    console.log('✅ API Client: Profile request successful:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      success: response.data?.success,
      message: response.data?.message,
      hasUserData: !!response.data?.data
    });
    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.error('❌ API Client: Profile request failed:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data
    });
    throw error;
  }
};

// User endpoints
export const getUsers = async (params?: PaginationQuery): Promise<AxiosResponse<PaginatedResponse<User>>> => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }
  return client.get('/users', { params });
};



// Task endpoints
export const getTasks = async (params?: PaginationQuery): Promise<AxiosResponse<PaginatedResponse<Task>>> => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }
  return client.get('/tasks', { params });
};


export const getTaskById = async (id: string): Promise<AxiosResponse<Task>> => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }
  return client.get(`/tasks/${id}`);
};

export const createTask = async (data: CreateTaskRequest): Promise<AxiosResponse<Task>> => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }
  return client.post('/tasks', data);
};

export const updateTask = async (id: string, data: UpdateTaskRequest): Promise<AxiosResponse<Task>> => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }
  return client.put(`/tasks/${id}`, data);
};

export const deleteTask = async (id: string): Promise<AxiosResponse<{ message: string }>> => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }
  return client.delete(`/tasks/${id}`);
};

// Create a legacy apiClient object for backward compatibility
export const apiClient = {
  login,
  signup,
  refreshToken,
  logout,
  getProfile,
  getUsers,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};