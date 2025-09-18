import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api/roles';
import { useOfflineSupport } from './use-offline-support';
import type {
  ListRolesParams,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '../../types/role';

// Query keys para React Query
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters: ListRolesParams) => [...roleKeys.lists(), filters] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  stats: () => [...roleKeys.all, 'stats'] as const,
};

// Hook para listar roles
export function useRoles(params: ListRolesParams = {}) {
  const { getOfflineCacheConfig, getRetryConfig } = useOfflineSupport();

  const cacheConfig = getOfflineCacheConfig();

  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => rolesApi.list(params),
    ...cacheConfig,
    ...getRetryConfig(3),
  });
}

// Hook para buscar um role específico
export function useRole(id: string) {
  const { getOfflineCacheConfig, getRetryConfig } = useOfflineSupport();

  const cacheConfig = getOfflineCacheConfig();

  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => rolesApi.get(id),
    enabled: !!id,
    ...cacheConfig,
    ...getRetryConfig(3),
  });
}

// Hook para estatísticas de roles
export function useRoleStats() {
  const { getOfflineCacheConfig, getRetryConfig } = useOfflineSupport();

  const cacheConfig = getOfflineCacheConfig();

  return useQuery({
    queryKey: roleKeys.stats(),
    queryFn: () => rolesApi.stats(),
    ...cacheConfig,
    ...getRetryConfig(2),
  });
}

// Hook para criar role
export function useCreateRole() {
  const queryClient = useQueryClient();
  const { getRetryConfig, addToRetryQueue, isOnline } = useOfflineSupport();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => rolesApi.create(data),
    ...getRetryConfig(3),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });
    },
    onError: (error: any, data: CreateRoleRequest) => {
      // Se estiver offline, adicionar à fila de retry
      if (!isOnline) {
        addToRetryQueue(() => rolesApi.create(data));
      }
    },
  });
}

// Hook para atualizar role
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      rolesApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });
    },
  });
}

// Hook para deletar role
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });
    },
  });
}

// Hook para restaurar role
export function useRestoreRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesApi.restore(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });
    },
  });
}

// Hook para duplicar role
export function useDuplicateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      rolesApi.duplicate(id, name),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });
    },
  });
}

// Hook para obter permissões de um role
export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: [...roleKeys.detail(roleId), 'permissions'],
    queryFn: () => rolesApi.getPermissions(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para atualizar permissões de um role
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => rolesApi.updatePermissions(roleId, permissionIds),
    onSuccess: (_, { roleId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({
        queryKey: [...roleKeys.detail(roleId), 'permissions'],
      });
    },
  });
}

// Hook para adicionar permissão a um role
export function useAddRolePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => rolesApi.addPermission(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({
        queryKey: [...roleKeys.detail(roleId), 'permissions'],
      });
    },
  });
}

// Hook para remover permissão de um role
export function useRemoveRolePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => rolesApi.removePermission(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({
        queryKey: [...roleKeys.detail(roleId), 'permissions'],
      });
    },
  });
}

// Hook para obter usuários de um role
export function useRoleUsers(roleId: string) {
  return useQuery({
    queryKey: [...roleKeys.detail(roleId), 'users'],
    queryFn: () => rolesApi.getUsers(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
