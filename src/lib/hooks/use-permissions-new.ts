import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userPermissionsApi } from '../api/user-permissions';
import { useAuth } from './use-auth';

// Query keys para permissões
export const permissionKeys = {
  all: ['permissions'] as const,
  user: (userId: string) => [...permissionKeys.all, 'user', userId] as const,
  userByFunction: (userId: string) =>
    [...permissionKeys.user(userId), 'by-function'] as const,
  check: (userId: string, functionName: string, permissionLevel: string) =>
    [
      ...permissionKeys.user(userId),
      'check',
      functionName,
      permissionLevel,
    ] as const,
};

// Hook para verificar permissão específica
export function useCheckPermission(
  functionName: string,
  permissionLevel: string,
  userId?: string
) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: permissionKeys.check(
      targetUserId || '',
      functionName,
      permissionLevel
    ),
    queryFn: () =>
      userPermissionsApi.checkPermission(
        targetUserId || '',
        functionName,
        permissionLevel
      ),
    enabled: !!targetUserId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obter permissões do usuário por função
export function useUserPermissionsByFunction(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: permissionKeys.userByFunction(targetUserId || ''),
    queryFn: () =>
      userPermissionsApi.getUserPermissionsByFunction(targetUserId || ''),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para obter todas as permissões do usuário
export function useUserPermissions(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: permissionKeys.user(targetUserId || ''),
    queryFn: () => userPermissionsApi.getUserPermissions(targetUserId || ''),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para conceder permissão
export function useGrantPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      permissionId: string;
      grantedBy?: string;
    }) => userPermissionsApi.grantPermission(data),
    onSuccess: (_, { userId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: permissionKeys.user(userId) });
      queryClient.invalidateQueries({
        queryKey: permissionKeys.userByFunction(userId),
      });
    },
  });
}

// Hook para revogar permissão
export function useRevokePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; permissionId: string }) =>
      userPermissionsApi.revokePermission(data),
    onSuccess: (_, { userId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: permissionKeys.user(userId) });
      queryClient.invalidateQueries({
        queryKey: permissionKeys.userByFunction(userId),
      });
    },
  });
}

// Hook para definir todas as permissões
export function useSetUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      permissionIds,
    }: {
      userId: string;
      permissionIds: string[];
    }) => userPermissionsApi.setUserPermissions(userId, permissionIds),
    onSuccess: (_, { userId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: permissionKeys.user(userId) });
      queryClient.invalidateQueries({
        queryKey: permissionKeys.userByFunction(userId),
      });
    },
  });
}

// Hook para verificar se pode gerenciar usuário
export function useCanManageUser(targetUserId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...permissionKeys.all, 'can-manage', user?.id, targetUserId],
    queryFn: () =>
      userPermissionsApi.canManageUser(user?.id || '', targetUserId),
    enabled: !!user?.id && !!targetUserId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para verificar acesso a tenant
export function useCanAccessTenant(tenantId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...permissionKeys.all, 'can-access-tenant', user?.id, tenantId],
    queryFn: () => userPermissionsApi.canAccessTenant(user?.id || '', tenantId),
    enabled: !!user?.id && !!tenantId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}
