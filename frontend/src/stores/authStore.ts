import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;

  // Computed getters
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) => set({ user }),
        setToken: (token) => set({ token }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        // Auth methods
        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });

          try {
            const apiUrl = import.meta.env.PROD ? '/api/auth/login' : 'http://localhost:3000/api/auth/login';

            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
              throw new Error(data.error || 'Login failed');
            }

            // Store in localStorage for persistence
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            set({
              user: data.user,
              token: data.token,
              isLoading: false,
              error: null
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        register: async (username: string, email: string, password: string) => {
          set({ isLoading: true, error: null });

          try {
            const apiUrl = import.meta.env.PROD ? '/api/auth/register' : 'http://localhost:3000/api/auth/register';

            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
              throw new Error(data.error || 'Registration failed');
            }

            // Store in localStorage for persistence
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            set({
              user: data.user,
              token: data.token,
              isLoading: false,
              error: null
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        logout: () => {
          // Clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          set({
            user: null,
            token: null,
            error: null
          });
        },

        // Computed getters
        get isAuthenticated() {
          return !!get().token && !!get().user;
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);