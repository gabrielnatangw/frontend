import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api/roles';
import { useNotifications } from './use-notifications';
import { roleKeys } from './use-roles';
import { useOfflineSupport } from './use-offline-support';

/**
 * Hook para operações em lote de roles
 */
export function useBulkRoleOperations() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { getRetryConfig, addToRetryQueue, isOnline } = useOfflineSupport();

  // Ativar múltiplos roles
  const activateRoles = useMutation({
    mutationFn: (roleIds: string[]) =>
      rolesApi.bulkUpdate(roleIds, { isActive: true }),
    ...getRetryConfig(3),
    onSuccess: (response, roleIds) => {
      // Atualizar cache
      queryClient.setQueriesData(
        { queryKey: roleKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data?.roles) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              roles: oldData.data.roles.map((role: any) =>
                roleIds.includes(role.id) ? { ...role, isActive: true } : role
              ),
            },
          };
        }
      );

      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });

      showSuccess(`${roleIds.length} roles ativados com sucesso!`);
    },
    onError: (error: any, roleIds) => {
      showError(`Erro ao ativar roles: ${error.message}`);

      if (!isOnline) {
        addToRetryQueue(() => rolesApi.bulkUpdate(roleIds, { isActive: true }));
      }
    },
  });

  // Desativar múltiplos roles
  const deactivateRoles = useMutation({
    mutationFn: (roleIds: string[]) =>
      rolesApi.bulkUpdate(roleIds, { isActive: false }),
    ...getRetryConfig(3),
    onSuccess: (response, roleIds) => {
      // Atualizar cache
      queryClient.setQueriesData(
        { queryKey: roleKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data?.roles) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              roles: oldData.data.roles.map((role: any) =>
                roleIds.includes(role.id) ? { ...role, isActive: false } : role
              ),
            },
          };
        }
      );

      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });

      showSuccess(`${roleIds.length} roles desativados com sucesso!`);
    },
    onError: (error: any, roleIds) => {
      showError(`Erro ao desativar roles: ${error.message}`);

      if (!isOnline) {
        addToRetryQueue(() =>
          rolesApi.bulkUpdate(roleIds, { isActive: false })
        );
      }
    },
  });

  // Deletar múltiplos roles
  const deleteRoles = useMutation({
    mutationFn: (roleIds: string[]) => rolesApi.bulkDelete(roleIds),
    ...getRetryConfig(3),
    onSuccess: (response, roleIds) => {
      // Remover do cache
      queryClient.setQueriesData(
        { queryKey: roleKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data?.roles) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              roles: oldData.data.roles.filter(
                (role: any) => !roleIds.includes(role.id)
              ),
              pagination: {
                ...oldData.data.pagination,
                total: Math.max(
                  0,
                  oldData.data.pagination.total - roleIds.length
                ),
              },
            },
          };
        }
      );

      // Remover roles específicos
      roleIds.forEach(id => {
        queryClient.removeQueries({ queryKey: roleKeys.detail(id) });
      });

      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });

      showSuccess(`${roleIds.length} roles deletados com sucesso!`);
    },
    onError: (error: any, roleIds) => {
      showError(`Erro ao deletar roles: ${error.message}`);

      if (!isOnline) {
        addToRetryQueue(() => rolesApi.bulkDelete(roleIds));
      }
    },
  });

  // Duplicar múltiplos roles
  const duplicateRoles = useMutation({
    mutationFn: (roleIds: string[]) => rolesApi.bulkDuplicate(roleIds),
    ...getRetryConfig(3),
    onSuccess: (response, _roleIds) => {
      const duplicatedRoles = response.data;

      // Adicionar ao cache
      queryClient.setQueriesData(
        { queryKey: roleKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data?.roles) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              roles: [...duplicatedRoles, ...oldData.data.roles],
              pagination: {
                ...oldData.data.pagination,
                total: oldData.data.pagination.total + duplicatedRoles.length,
              },
            },
          };
        }
      );

      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });

      showSuccess(`${duplicatedRoles.length} roles duplicados com sucesso!`);
    },
    onError: (error: any, roleIds) => {
      showError(`Erro ao duplicar roles: ${error.message}`);

      if (!isOnline) {
        addToRetryQueue(() => rolesApi.bulkDuplicate(roleIds));
      }
    },
  });

  // Exportar roles selecionados
  const exportSelectedRoles = useMutation({
    mutationFn: ({
      roleIds,
      format = 'xlsx',
    }: {
      roleIds: string[];
      format?: string;
    }) => rolesApi.export({ roleIds, format }),
    ...getRetryConfig(2),
    onSuccess: (response, { roleIds }) => {
      // Criar link de download
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roles-selecionados-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(`${roleIds.length} roles exportados com sucesso!`);
    },
    onError: (error: any) => {
      showError(`Erro ao exportar roles: ${error.message}`);
    },
  });

  return {
    activateRoles,
    deactivateRoles,
    deleteRoles,
    duplicateRoles,
    exportSelectedRoles,
  };
}

export default useBulkRoleOperations;
