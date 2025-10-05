// Authentication utility functions for JWT token management

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Get the stored JWT token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store JWT token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get the stored user data from localStorage
 */
export const getUser = <T = unknown>(): T | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? (JSON.parse(userStr) as T) : null;
};

/**
 * Store user data in localStorage
 */
export const setUser = <T>(user: T): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Remove user data from localStorage
 */
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    // Basic check - decode JWT payload to see if it's expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;

    return payload.exp > currentTime;
  } catch {
    // If token is malformed, consider user not authenticated
    return false;
  }
};

/**
 * Clear all authentication data
 */
export const logout = (): void => {
  removeToken();
  removeUser();
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): { Authorization?: string } => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};