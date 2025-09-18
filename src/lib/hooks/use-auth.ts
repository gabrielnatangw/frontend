import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { authApi } from '../api/auth';
import type {
  LoginRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  FirstLoginRequest,
} from '../schemas/auth';
import React from 'react';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
  verify: () => [...authKeys.all, 'verify'] as const,
};

// Hook para login
export function useLogin() {
  const { setAuth, setLoading, setError } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: response => {
      // A resposta agora é diretamente o TokenResponse
      setAuth(response);
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

// Hook para logout
export function useLogout() {
  const { logout, accessToken, refreshToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (accessToken && refreshToken) {
        const result = await authApi.logout(accessToken, refreshToken);
        return result;
      }
      return { success: true, message: 'Logout realizado' };
    },
    onSuccess: () => {
      logout();
      // Limpa todas as queries
      queryClient.clear();
    },
    onError: () => {
      // Mesmo com erro, faz logout local
      logout();
      queryClient.clear();
    },
  });
}

// Hook para refresh token
export function useRefreshToken() {
  const { setTokens, logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authApi.refreshToken(token),
    onSuccess: response => {
      // A resposta agora é diretamente o TokenResponse
      setTokens(response.accessToken, response.refreshToken);
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: () => {
      // Se refresh falhar, faz logout
      logout();
      queryClient.clear();
    },
  });
}

// Hook para verificar token
export function useVerifyToken() {
  const { accessToken, setUser, logout } = useAuthStore();

  const query = useQuery({
    queryKey: authKeys.verify(),
    queryFn: () => authApi.verifyToken(accessToken!),
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Efeito para processar a resposta
  React.useEffect(() => {
    if (query.data && query.data.user) {
      setUser(query.data.user);
    } else if (query.error) {
      // Se verificação falhar, faz logout
      logout();
    }
  }, [query.data, query.error, setUser, logout]);

  return query;
}

// Hook para solicitar reset de senha
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

// Hook para reset de senha
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  });
}

// Hook para alterar senha
export function useChangePassword() {
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      authApi.changePassword(accessToken!, data),
  });
}

// Hook para primeiro login
export function useFirstLogin() {
  const { setAuth, setFirstLogin } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FirstLoginRequest) => authApi.firstLogin(data),
    onSuccess: response => {
      // A resposta agora é diretamente o TokenResponse
      setAuth(response);
      setFirstLogin(false);
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
    },
  });
}

// Hook para listar sessões
export function useSessions() {
  const { accessToken, setSessions } = useAuthStore();

  const query = useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => authApi.getSessions(accessToken!),
    enabled: !!accessToken,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Efeito para processar a resposta
  React.useEffect(() => {
    if (query.data && query.data.sessions) {
      setSessions(query.data.sessions);
    }
  }, [query.data, setSessions]);

  return query;
}

// Hook para encerrar sessão
export function useEndSession() {
  const { accessToken, removeSession } = useAuthStore();

  return useMutation({
    mutationFn: (sessionId: string) =>
      authApi.endSession(accessToken!, sessionId),
    onSuccess: (_, sessionId) => {
      removeSession(sessionId);
    },
  });
}

// Hook para verificar se usuário está autenticado
export function useAuth() {
  const [isHydrated, setIsHydrated] = React.useState(false);
  const { isAuthenticated, user, accessToken, isLoading, error } =
    useAuthStore();

  // Aguarda a hidratação do Zustand
  React.useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Verificar se já está hidratado
    if (typeof window !== 'undefined' && useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  // Verifica token automaticamente se estiver autenticado
  // Mas apenas uma vez por sessão
  React.useEffect(() => {
    if (isAuthenticated && accessToken && isHydrated) {
      // A verificação será feita pelo useVerifyToken hook
      // que tem cache configurado
    }
  }, [isAuthenticated, accessToken, isHydrated]);

  // Se não está hidratado, retornar estado de loading apenas se não estiver autenticado
  // Se estiver autenticado mas não hidratado, mostrar como autenticado
  const shouldShowLoading = !isHydrated && !isAuthenticated;

  return {
    isAuthenticated: isHydrated ? isAuthenticated : isAuthenticated, // Se não hidratado mas autenticado, manter autenticado
    user: isHydrated ? user : user, // Se não hidratado mas tem user, manter user
    accessToken: isHydrated ? accessToken : accessToken, // Se não hidratado mas tem token, manter token
    isLoading: shouldShowLoading || isLoading,
    error,
  };
}

// Hook para interceptar erros de autenticação globalmente
export function useAuthErrorInterceptor() {
  const { logout, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [isHandlingError, setIsHandlingError] = React.useState(false);
  const errorHandlingTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  React.useEffect(() => {
    // Função para verificar se é erro de autenticação
    const isAuthError = (error: unknown) => {
      const err = error as { status?: number; message?: string };
      return (
        err?.status === 401 ||
        err?.status === 403 ||
        err?.message?.includes('Unauthorized') ||
        err?.message?.includes('Forbidden') ||
        err?.message?.includes('Token expired') ||
        err?.message?.includes('Invalid token') ||
        err?.message?.includes('JWT expired') ||
        err?.message?.includes('Invalid JWT')
      );
    };

    // Função para fazer logout automático com debounce
    const handleAuthError = () => {
      // Evitar múltiplas execuções simultâneas
      if (isHandlingError) {
        return;
      }

      // Limpar timeout anterior se existir
      if (errorHandlingTimeoutRef.current) {
        clearTimeout(errorHandlingTimeoutRef.current);
      }

      // Debounce para evitar múltiplas execuções
      errorHandlingTimeoutRef.current = setTimeout(() => {
        setIsHandlingError(true);

        // Fazer logout
        logout();

        // Limpar cache do React Query
        queryClient.clear();

        // Redirecionar para login apenas se não estiver já na página de login
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/auth/login')
        ) {
          window.location.href = '/auth/login';
        }

        // Reset do estado após um delay
        setTimeout(() => setIsHandlingError(false), 1000);
      }, 100);
    };

    // Interceptar erros de queries com verificação de token
    const unsubscribeQueries = queryClient
      .getQueryCache()
      .subscribe((event: unknown) => {
        if (
          (event as any).type === 'error' &&
          (event as any).query?.state?.error
        ) {
          const error = (event as any).query.state.error;

          // Só tratar erro de autenticação se tivermos um token
          if (isAuthError(error) && accessToken) {
            handleAuthError();
          }
        }
      });

    // Interceptar erros de mutations com verificação de token
    const unsubscribeMutations = queryClient
      .getMutationCache()
      .subscribe((event: unknown) => {
        if (
          (event as any).type === 'error' &&
          (event as any).mutation?.state?.error
        ) {
          const error = (event as any).mutation.state.error;

          // Só tratar erro de autenticação se tivermos um token
          if (isAuthError(error) && accessToken) {
            handleAuthError();
          }
        }
      });

    return () => {
      unsubscribeQueries();
      unsubscribeMutations();

      // Limpar timeout ao desmontar
      if (errorHandlingTimeoutRef.current) {
        clearTimeout(errorHandlingTimeoutRef.current);
      }
    };
  }, [logout, queryClient, accessToken, isHandlingError]);
}

// Hook para buscar dados do usuário atual
export function useMe() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: [...authKeys.user(), 'me'],
    queryFn: () => authApi.getMe(accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para alterar senha do perfil atual
export function useChangePasswordProfile() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(accessToken!, data),
    onSuccess: () => {
      // Invalidar query do useMe para atualizar dados do usuário
      queryClient.invalidateQueries({ queryKey: [...authKeys.user(), 'me'] });
    },
  });
}

// Hook para verificar permissões
export function usePermissions() {
  const { hasPermission, hasRole, isAdmin } = useAuthStore();

  return {
    hasPermission,
    hasRole,
    isAdmin,
  };
}
