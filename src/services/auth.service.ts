/**
 * Authentication Service
 * 
 * Handles user authentication:
 * - Login/logout
 * - Registration
 * - Token management
 * - User profile
 */

import api, { setAuthToken, clearAuthToken } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessName: string;
  country: string;
  vatRegistered: boolean;
  taxId?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  business: {
    id: string;
    name: string;
    countryCode: string;
    currency: string;
    vatRegistered: boolean;
  };
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post('/auth/login', credentials);
  const data = response.data;
  
  // Store token
  setAuthToken(data.token);
  
  // Store user and business info
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('business', JSON.stringify(data.business));
  
  return data;
}

/**
 * Register new user and business
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post('/auth/register', data);
  const authData = response.data;
  
  // Store token
  setAuthToken(authData.token);
  
  // Store user and business info
  localStorage.setItem('user', JSON.stringify(authData.user));
  localStorage.setItem('business', JSON.stringify(authData.business));
  
  return authData;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  clearAuthToken();
  localStorage.removeItem('user');
  localStorage.removeItem('business');
  
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Ignore errors on logout
    console.error('Logout error:', error);
  }
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<AuthResponse['user']> {
  const response = await api.get('/users/me');
  return response.data;
}

/**
 * Update user profile
 */
export async function updateProfile(data: Partial<AuthResponse['user']>): Promise<AuthResponse['user']> {
  const response = await api.patch('/users/me', data);
  
  // Update stored user
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const updatedUser = { ...storedUser, ...response.data };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  
  return response.data;
}

/**
 * Change password
 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await api.post('/auth/change-password', { oldPassword, newPassword });
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/auth/reset-password', { token, newPassword });
}

/**
 * Get stored user
 */
export function getStoredUser(): AuthResponse['user'] | null {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Get stored business
 */
export function getStoredBusiness(): AuthResponse['business'] | null {
  const business = localStorage.getItem('business');
  return business ? JSON.parse(business) : null;
}
