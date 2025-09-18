import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userIntegrationApi } from '../api/user-integration';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  ResetPasswordRequest,
  GrantPermissionsRequest,
  RevokePermissionsRequest,
  ChangePasswordRequest,
} from '../../types/user-integration';

// Query Keys
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userQueryKeys.lists(), filters] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  stats: () => [...userQueryKeys.all, 'stats'] as const,
  permissions: (id: string) =>
    [...userQueryKeys.detail(id), 'permissions'] as const,
  roles: (id: string) => [...userQueryKeys.detail(id), 'roles'] as const,
  profile: () => [...userQueryKeys.all, 'profile'] as const,
  byEmail: (email: string) =>
    [...userQueryKeys.all, 'by-email', email] as const,
  byTenant: (tenantId: string) =>
    [...userQueryKeys.all, 'by-tenant', tenantId] as const,
};

// Hooks para listagem
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: userQueryKeys.list(filters),
    queryFn: () => userIntegrationApi.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => userIntegrationApi.getUserById(id),
    enabled: !!id,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: userQueryKeys.stats(),
    queryFn: () => userIntegrationApi.getUserStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useUserByEmail(email: string) {
  return useQuery({
    queryKey: userQueryKeys.byEmail(email),
    queryFn: () => userIntegrationApi.getUserByEmail(email),
    enabled: !!email,
  });
}

export function useUsersByTenant(tenantId: string) {
  return useQuery({
    queryKey: userQueryKeys.byTenant(tenantId),
    queryFn: () => userIntegrationApi.getUsersByTenant(tenantId),
    enabled: !!tenantId,
  });
}

// Hooks para perfil do usuário logado
export function useMyProfile() {
  return useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: () => userIntegrationApi.getMyProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hooks para permissões
export function useUserPermissions(id: string) {
  return useQuery({
    queryKey: userQueryKeys.permissions(id),
    queryFn: () => userIntegrationApi.getUserPermissions(id),
    enabled: !!id,
  });
}

// Hooks para roles
export function useUserRoles(id: string) {
  return useQuery({
    queryKey: userQueryKeys.roles(id),
    queryFn: () => userIntegrationApi.getUserRoles(id),
    enabled: !!id,
  });
}

// Mutations para CRUD
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) =>
      userIntegrationApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.stats() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userIntegrationApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.stats() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      permanent = false,
    }: {
      id: string;
      permanent?: boolean;
    }) => userIntegrationApi.deleteUser(id, permanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.stats() });
    },
  });
}

// Mutations para operações avançadas
export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userIntegrationApi.restoreUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.stats() });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userIntegrationApi.activateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.stats() });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userIntegrationApi.deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.stats() });
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      ...data
    }: { userId: string } & ResetPasswordRequest) =>
      userIntegrationApi.resetPassword(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(userId) });
    },
  });
}

// Mutations para permissões
export function useGrantPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GrantPermissionsRequest }) =>
      userIntegrationApi.grantPermissions(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.permissions(id),
      });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
    },
  });
}

export function useRevokePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: RevokePermissionsRequest;
    }) => userIntegrationApi.revokePermissions(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.permissions(id),
      });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
    },
  });
}

// Mutations para roles
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { roleId: string } }) =>
      userIntegrationApi.assignRole(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.roles(id) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
    },
  });
}

export function useAssignMultipleRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { roleIds: string[] } }) =>
      userIntegrationApi.assignMultipleRoles(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.roles(id) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
    },
  });
}

export function useReplaceUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { roleIds: string[] } }) =>
      userIntegrationApi.replaceUserRoles(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.roles(id) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      userIntegrationApi.removeRole(userId, roleId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.roles(userId) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(userId) });
    },
  });
}

// Mutations para perfil do usuário logado
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) =>
      userIntegrationApi.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      userIntegrationApi.changePassword(data),
  });
}

// Hook utilitário para verificar permissões
export function useUserPermissionsCheck(
  userId: string,
  requiredPermissions: string[]
) {
  const { data: permissionsData, isLoading } = useUserPermissions(userId);

  const hasPermissions = () => {
    if (!permissionsData?.data?.permissions) return false;

    const userPermissions = permissionsData.data.permissions.map(
      p => p.permissionId
    );
    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  };

  return {
    hasPermissions: hasPermissions(),
    isLoading,
    permissions: permissionsData?.data?.permissions || [],
  };
}

// Hook utilitário para verificar roles
export function useUserRolesCheck(userId: string, requiredRoles: string[]) {
  const { data: rolesData, isLoading } = useUserRoles(userId);

  const hasRoles = () => {
    if (!rolesData?.data?.roles) return false;

    const userRoles = rolesData.data.roles.map(r => r.roleId);
    return requiredRoles.every(role => userRoles.includes(role));
  };

  return {
    hasRoles: hasRoles(),
    isLoading,
    roles: rolesData?.data?.roles || [],
  };
}
