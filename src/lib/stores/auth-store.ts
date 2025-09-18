import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, TokenResponse } from '../schemas/auth';

interface AuthState {
  // Estado de autenticação
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Estado de primeiro login
  isFirstLogin: boolean;

  // Estado de sessões
  sessions: Array<{
    id: string;
    device: string;
    ipAddress: string;
    location: string;
    lastActivity: string;
    isCurrent: boolean;
  }>;

  // Ações de autenticação
  setAuth: (authData: TokenResponse) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;

  // Ações de primeiro login
  setFirstLogin: (isFirstLogin: boolean) => void;

  // Ações de sessões
  setSessions: (sessions: AuthState['sessions']) => void;
  removeSession: (sessionId: string) => void;

  // Utilitários
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isFirstLogin: false,
      sessions: [],

      // Ações de autenticação
      setAuth: (authData: TokenResponse) => {
        set({
          user: authData.user,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          isAuthenticated: true,
          error: null,
          isFirstLogin: authData.firstLogin,
        });
      },

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setLoading: (loading: boolean) =>
        set({
          isLoading: loading,
        }),

      setError: (error: string | null) =>
        set({
          error,
        }),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          isFirstLogin: false,
          sessions: [],
        });
      },

      // Ações de primeiro login
      setFirstLogin: (isFirstLogin: boolean) =>
        set({
          isFirstLogin,
        }),

      // Ações de sessões
      setSessions: sessions =>
        set({
          sessions,
        }),

      removeSession: (sessionId: string) =>
        set(state => ({
          sessions: state.sessions.filter(session => session.id !== sessionId),
        })),

      // Utilitários
      hasPermission: (_permission: string) => {
        const { user } = get();
        if (!user) return false;
        // Por enquanto, baseado no accessType
        if (user.accessType === 'ADMIN') return true;
        return false;
      },

      hasRole: (role: string) => {
        const { user } = get();
        if (!user) return false;
        return user.accessType === role.toUpperCase();
      },

      isAdmin: () => {
        const { user } = get();
        if (!user) return false;
        return user.accessType === 'ADMIN';
      },
    }),
    {
      name: 'auth-storage',
      skipHydration: false,
      onRehydrateStorage: () => () => {},
    }
  )
);
