import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import type {
  ListUsersParams,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  SetPasswordRequest,
} from '../../types/user';

// Query keys para usuários
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: ListUsersParams) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

// Hook para listar usuários
export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar um usuário específico
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar perfil do usuário atual (baseado no token)
export function useProfile() {
  // TODO: Implementar lógica para obter ID do usuário atual do token
  // Por enquanto, retorna null
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => Promise.resolve(null),
    enabled: false, // Desabilitado até implementar lógica de autenticação
  });
}

// Hook para buscar estatísticas de usuários
export function useUserStats(tenantId?: string) {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => usersApi.getStats(tenantId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

// Hook para criar usuário
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

// Hook para atualizar usuário
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: async (response, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });

      // Invalidar query do useMe (auth/me)
      queryClient.invalidateQueries({ queryKey: ['auth', 'user', 'me'] });

      // Atualizar store de autenticação se for o usuário atual
      try {
        const { useAuthStore } = await import('../stores/auth-store');
        const authState = useAuthStore.getState();

        // Se o usuário atualizado é o usuário logado, atualizar o store
        if (authState.user?.id === id && response?.data) {
          // Converter o tipo para compatibilidade com o store
          const userData = {
            ...response.data, // Use data directly
            accessType: response.data.accessType as
              | 'ADMIN'
              | 'USER'
              | 'OPERATOR',
            userType: response.data.userType as 'STANDARD' | 'PREMIUM',
          };
          useAuthStore.getState().setUser(userData);
        }
      } catch (error) {
        console.warn('Erro ao atualizar store de autenticação:', error);
      }
    },
  });
}

// Hook para deletar usuário
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permanent }: { id: string; permanent?: boolean }) =>
      usersApi.delete(id, permanent),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

// Hook para restaurar usuário
export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.restore(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

// Hook para ativar usuário
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: (_, id) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

// Hook para desativar usuário
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: (_, id) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

// Hook para trocar senha
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordRequest }) =>
      usersApi.changePassword(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

// Hook para definir nova senha
export function useSetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetPasswordRequest }) =>
      usersApi.setPassword(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

// Hook para resetar senha
export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      newPassword,
      sendEmail,
    }: {
      userId: string;
      newPassword?: string;
      sendEmail?: boolean;
    }) => usersApi.resetPassword(userId, { newPassword, sendEmail }),
    onSuccess: (_, { userId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Hook para buscar usuários por email
export function useUserByEmail(email: string, tenantId: string) {
  return useQuery({
    queryKey: [...userKeys.all, 'by-email', email, tenantId],
    queryFn: () => usersApi.getByEmail(email, tenantId),
    enabled: !!email && !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar usuários por tenant
export function useUsersByTenant(tenantId: string) {
  return useQuery({
    queryKey: [...userKeys.all, 'by-tenant', tenantId],
    queryFn: () => usersApi.getByTenant(tenantId),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar usuários por role
export function useUsersByRole(roleId: string, tenantId?: string) {
  return useQuery({
    queryKey: [...userKeys.all, 'by-role', roleId, tenantId],
    queryFn: () => usersApi.getByRole(roleId, tenantId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar admins do tenant
export function useTenantAdmins(tenantId: string) {
  return useQuery({
    queryKey: [...userKeys.all, 'tenant-admins', tenantId],
    queryFn: () => usersApi.getTenantAdmins(tenantId),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar primeiro admin do tenant
export function useFirstTenantAdmin(tenantId: string) {
  return useQuery({
    queryKey: [...userKeys.all, 'first-tenant-admin', tenantId],
    queryFn: () => usersApi.getFirstTenantAdmin(tenantId),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para busca avançada
export function useUserSearch(
  searchTerm: string,
  params: Omit<ListUsersParams, 'name' | 'email'> = {}
) {
  return useQuery({
    queryKey: [...userKeys.all, 'search', searchTerm, params],
    queryFn: () => usersApi.search(searchTerm, params),
    enabled: !!searchTerm,
    staleTime: 2 * 60 * 1000, // 2 minutos (busca mais dinâmica)
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}
