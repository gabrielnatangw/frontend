import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { rolesApi } from '../api/roles';
import { useNotifications } from './use-notifications';
import { roleKeys } from './use-roles';
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  ListRolesParams,
  ListRolesResponse,
  RoleStatsResponse,
} from '../../types/role';

/**
 * Hook otimizado para roles com cache inteligente e invalidação seletiva
 */
export function useRolesOptimized(params: ListRolesParams = {}) {
  const queryClient = useQueryClient();
  // Configuração de cache otimizada
  const queryConfig = useMemo(
    () => ({
      queryKey: roleKeys.list(params),
      queryFn: () => rolesApi.list(params),
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 3,
      retryDelay: (attemptIndex: number) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
    }),
    [params]
  );

  const query = useQuery<ListRolesResponse>(queryConfig);

  // Função para invalidar queries relacionadas de forma inteligente
  const invalidateRelatedQueries = useCallback(() => {
    // Invalidar apenas a lista atual se os parâmetros mudaram
    queryClient.invalidateQueries({
      queryKey: roleKeys.list(params),
      exact: true,
    });

    // Invalidar estatísticas
    queryClient.invalidateQueries({
      queryKey: roleKeys.stats(),
    });
  }, [queryClient, params]);

  // Função para atualizar cache otimisticamente
  const updateCacheOptimistically = useCallback(
    (updatedRole: Role) => {
      // Atualizar role específico
      queryClient.setQueryData(
        roleKeys.detail(updatedRole.id),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: updatedRole,
          };
        }
      );

      // Atualizar na lista se estiver no cache
      queryClient.setQueryData(roleKeys.list(params), (oldData: any) => {
        if (!oldData?.data?.roles) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            roles: oldData.data.roles.map((role: Role) =>
              role.id === updatedRole.id ? updatedRole : role
            ),
          },
        };
      });
    },
    [queryClient, params]
  );

  // Função para adicionar role ao cache
  const addToCache = useCallback(
    (newRole: Role) => {
      queryClient.setQueryData(roleKeys.list(params), (oldData: any) => {
        if (!oldData?.data?.roles) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            roles: [newRole, ...oldData.data.roles],
            pagination: {
              ...oldData.data.pagination,
              total: oldData.data.pagination.total + 1,
            },
          },
        };
      });
    },
    [queryClient, params]
  );

  // Função para remover role do cache
  const removeFromCache = useCallback(
    (roleId: string) => {
      queryClient.setQueryData(roleKeys.list(params), (oldData: any) => {
        if (!oldData?.data?.roles) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            roles: oldData.data.roles.filter(
              (role: Role) => role.id !== roleId
            ),
            pagination: {
              ...oldData.data.pagination,
              total: Math.max(0, oldData.data.pagination.total - 1),
            },
          },
        };
      });
    },
    [queryClient, params]
  );

  return {
    ...query,
    invalidateRelatedQueries,
    updateCacheOptimistically,
    addToCache,
    removeFromCache,
  };
}

/**
 * Hook otimizado para estatísticas de roles
 */
export function useRoleStatsOptimized() {
  const queryConfig = useMemo(
    () => ({
      queryKey: roleKeys.stats(),
      queryFn: () => rolesApi.stats(),
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 2,
      retryDelay: 1000,
    }),
    []
  );

  return useQuery<RoleStatsResponse>(queryConfig);
}

/**
 * Hook otimizado para criar role
 */
export function useCreateRoleOptimized() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => rolesApi.create(data),
    onSuccess: response => {
      const newRole = response.data;

      // Adicionar ao cache de todas as listas
      queryClient.setQueriesData(
        { queryKey: roleKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data?.roles) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              roles: [newRole, ...oldData.data.roles],
              pagination: {
                ...oldData.data.pagination,
                total: oldData.data.pagination.total + 1,
              },
            },
          };
        }
      );

      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });

      showSuccess(`Role "${newRole.name}" criado com sucesso!`);
    },
    onError: (error: any) => {
      showError(`Erro ao criar role: ${error.message}`);
    },
  });
}

/**
 * Hook otimizado para atualizar role
 */
export function useUpdateRoleOptimized() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      rolesApi.update(id, data),
    onSuccess: response => {
      const updatedRole = response.data;

      // Atualizar cache de todas as listas
      queryClient.setQueriesData(
        { queryKey: roleKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data?.roles) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              roles: oldData.data.roles.map((role: Role) =>
                role.id === updatedRole.id ? updatedRole : role
              ),
            },
          };
        }
      );

      // Atualizar role específico
      queryClient.setQueryData(
        roleKeys.detail(updatedRole.id),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: updatedRole,
          };
        }
      );

      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });

      showSuccess(`Role "${updatedRole.name}" atualizado com sucesso!`);
    },
    onError: (error: any) => {
      showError(`Erro ao atualizar role: ${error.message}`);
    },
  });
}

/**
 * Hook otimizado para deletar role
 */
export function useDeleteRoleOptimized() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: (_, roleId) => {
      // Remover de todas as listas
      queryClient.setQueriesData(
        { queryKey: roleKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data?.roles) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              roles: oldData.data.roles.filter(
                (role: Role) => role.id !== roleId
              ),
              pagination: {
                ...oldData.data.pagination,
                total: Math.max(0, oldData.data.pagination.total - 1),
              },
            },
          };
        }
      );

      // Remover role específico
      queryClient.removeQueries({ queryKey: roleKeys.detail(roleId) });

      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });

      showSuccess('Role deletado com sucesso!');
    },
    onError: (error: any) => {
      showError(`Erro ao deletar role: ${error.message}`);
    },
  });
}

export default useRolesOptimized;
