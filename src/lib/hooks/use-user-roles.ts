import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userRolesApi } from '../api/user-roles';
import type {
  ListUserRolesParams,
  CreateUserRoleRequest,
  UpdateUserRoleRequest,
} from '../../types/user-role';

// Query keys para React Query
export const userRoleKeys = {
  all: ['user-roles'] as const,
  lists: () => [...userRoleKeys.all, 'list'] as const,
  list: (filters: ListUserRolesParams) =>
    [...userRoleKeys.lists(), filters] as const,
  details: () => [...userRoleKeys.all, 'detail'] as const,
  detail: (id: string) => [...userRoleKeys.details(), id] as const,
  stats: () => [...userRoleKeys.all, 'stats'] as const,
  byUser: (userId: string) => [...userRoleKeys.all, 'byUser', userId] as const,
  byRole: (roleId: string) => [...userRoleKeys.all, 'byRole', roleId] as const,
};

// Hook para listar relacionamentos user-role
export function useUserRoles(params: ListUserRolesParams = {}) {
  return useQuery({
    queryKey: userRoleKeys.list(params),
    queryFn: () => userRolesApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar um relacionamento user-role específico
export function useUserRole(id: string) {
  return useQuery({
    queryKey: userRoleKeys.detail(id),
    queryFn: () => userRolesApi.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para estatísticas de user-roles
export function useUserRoleStats() {
  return useQuery({
    queryKey: userRoleKeys.stats(),
    queryFn: () => userRolesApi.stats(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

// Hook para criar relacionamento user-role
export function useCreateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRoleRequest) => userRolesApi.create(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.stats() });
    },
  });
}

// Hook para atualizar relacionamento user-role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRoleRequest }) =>
      userRolesApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userRoleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.stats() });
    },
  });
}

// Hook para deletar relacionamento user-role
export function useDeleteUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userRolesApi.delete(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.stats() });
    },
  });
}

// Hook para obter roles de um usuário
export function useUserRolesByUser(userId: string) {
  return useQuery({
    queryKey: userRoleKeys.byUser(userId),
    queryFn: () => userRolesApi.getByUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para obter usuários de um role
export function useUserRolesByRole(roleId: string) {
  return useQuery({
    queryKey: userRoleKeys.byRole(roleId),
    queryFn: () => userRolesApi.getByRole(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para atribuir role a usuário
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      userRolesApi.assignRole(userId, roleId),
    onSuccess: (_, { userId, roleId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userRoleKeys.byUser(userId) });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.byRole(roleId) });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.stats() });
    },
  });
}

// Hook para remover role de usuário
export function useUnassignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      userRolesApi.unassignRole(userId, roleId),
    onSuccess: (_, { userId, roleId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userRoleKeys.byUser(userId) });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.byRole(roleId) });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.stats() });
    },
  });
}

// Hook para atribuir múltiplos roles a um usuário
export function useAssignMultipleRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      userRolesApi.assignMultipleRoles(userId, roleIds),
    onSuccess: (_, { userId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userRoleKeys.byUser(userId) });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.stats() });
    },
  });
}

// Hook para remover múltiplos roles de um usuário
export function useUnassignMultipleRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      userRolesApi.unassignMultipleRoles(userId, roleIds),
    onSuccess: (_, { userId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userRoleKeys.byUser(userId) });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.stats() });
    },
  });
}

// Hook para atribuir role a múltiplos usuários
export function useAssignRoleToUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, userIds }: { roleId: string; userIds: string[] }) =>
      userRolesApi.assignRoleToUsers(roleId, userIds),
    onSuccess: (_, { roleId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userRoleKeys.byRole(roleId) });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.stats() });
    },
  });
}

// Hook para remover role de múltiplos usuários
export function useUnassignRoleFromUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, userIds }: { roleId: string; userIds: string[] }) =>
      userRolesApi.unassignRoleFromUsers(roleId, userIds),
    onSuccess: (_, { roleId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: userRoleKeys.byRole(roleId) });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userRoleKeys.stats() });
    },
  });
}
