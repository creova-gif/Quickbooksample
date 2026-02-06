/**
 * API Client Configuration
 * 
 * Centralized axios instance with:
 * - Authentication token management
 * - Request/response interceptors
 * - Error handling
 * - Offline detection
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      });
    }

    // Handle 401 Unauthorized - redirect to login
    if (error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle other errors
    const errorData = error.response.data as any;
    return Promise.reject({
      message: errorData?.message || 'An error occurred',
      status: error.response.status,
      data: errorData,
    });
  }
);

// Helper to set auth token
export function setAuthToken(token: string) {
  localStorage.setItem('authToken', token);
}

// Helper to clear auth token
export function clearAuthToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

// Helper to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('authToken');
}

export default api;
