import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api/roles';
import { useNotifications } from './use-notifications';
import { useAuditLogging } from './use-audit-logging';
import { roleKeys } from './use-roles';
import { useOfflineSupport } from './use-offline-support';

/**
 * Hook para duplicar um role
 */
export function useDuplicateRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { logCreate, logError } = useAuditLogging();
  const { getRetryConfig, addToRetryQueue, isOnline } = useOfflineSupport();

  return useMutation({
    mutationFn: (id: string) => rolesApi.duplicate(id, `Cópia de ${id}`),
    ...getRetryConfig(3),
    onSuccess: async (response, id) => {
      const duplicatedRole = response.data;

      // Adicionar à lista de roles
      queryClient.setQueriesData(
        { queryKey: roleKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data?.roles) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              roles: [duplicatedRole, ...oldData.data.roles],
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

      // Log de auditoria
      await logCreate('ROLE', duplicatedRole.id, {
        originalRoleId: id,
        roleName: duplicatedRole.name,
        action: 'DUPLICATE',
      });

      showSuccess(`Role "${duplicatedRole.name}" duplicado com sucesso!`);
    },
    onError: async (error: any, id) => {
      // Log de erro
      await logError('DUPLICATE', 'ROLE', id, error);

      showError(`Erro ao duplicar role: ${error.message}`);

      // Se estiver offline, adicionar à fila de retry
      if (!isOnline) {
        addToRetryQueue(() => rolesApi.duplicate(id, `Cópia de ${id}`));
      }
    },
  });
}

/**
 * Hook para ativar/desativar um role
 */
export function useToggleRoleStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { logUpdate, logError } = useAuditLogging();
  const { getRetryConfig, addToRetryQueue, isOnline } = useOfflineSupport();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      rolesApi.update(id, { isActive }),
    ...getRetryConfig(3),
    onSuccess: async (response, { id, isActive }) => {
      const updatedRole = response.data;

      // Atualizar role específico
      queryClient.setQueryData(roleKeys.detail(id), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: updatedRole,
        };
      });

      // Atualizar na lista
      queryClient.setQueriesData(
        { queryKey: roleKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data?.roles) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              roles: oldData.data.roles.map((role: any) =>
                role.id === id ? updatedRole : role
              ),
            },
          };
        }
      );

      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: roleKeys.stats() });

      // Log de auditoria
      await logUpdate(
        'ROLE',
        id,
        { isActive },
        {
          roleName: updatedRole.name,
          action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
        }
      );

      showSuccess(
        `Role "${updatedRole.name}" ${isActive ? 'ativado' : 'desativado'} com sucesso!`
      );
    },
    onError: async (error: any, { id, isActive }) => {
      // Log de erro
      await logError(isActive ? 'ACTIVATE' : 'DEACTIVATE', 'ROLE', id, error);

      showError(
        `Erro ao ${isActive ? 'ativar' : 'desativar'} role: ${error.message}`
      );

      // Se estiver offline, adicionar à fila de retry
      if (!isOnline) {
        addToRetryQueue(() => rolesApi.update(id, { isActive }));
      }
    },
  });
}

/**
 * Hook para restaurar um role deletado
 */
export function useRestoreRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { getRetryConfig, addToRetryQueue, isOnline } = useOfflineSupport();

  return useMutation({
    mutationFn: (id: string) => rolesApi.restore(id),
    ...getRetryConfig(3),
    onSuccess: response => {
      const restoredRole = response.data;

      // Adicionar de volta à lista
      queryClient.setQueriesData(
        { queryKey: roleKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data?.roles) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              roles: [restoredRole, ...oldData.data.roles],
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

      showSuccess(`Role "${restoredRole.name}" restaurado com sucesso!`);
    },
    onError: (error: any, id: string) => {
      showError(`Erro ao restaurar role: ${error.message}`);

      // Se estiver offline, adicionar à fila de retry
      if (!isOnline) {
        addToRetryQueue(() => rolesApi.restore(id));
      }
    },
  });
}

/**
 * Hook para exportar roles
 */
export function useExportRoles() {
  const { showSuccess, showError } = useNotifications();
  const { getRetryConfig } = useOfflineSupport();

  return useMutation({
    mutationFn: (params: any = {}) => rolesApi.export(params),
    ...getRetryConfig(2),
    onSuccess: response => {
      // Criar link de download
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roles-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess('Roles exportados com sucesso!');
    },
    onError: (error: any) => {
      showError(`Erro ao exportar roles: ${error.message}`);
    },
  });
}

/**
 * Hook para importar roles
 */
export function useImportRoles() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { getRetryConfig, addToRetryQueue, isOnline } = useOfflineSupport();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return rolesApi.import(file);
    },
    ...getRetryConfig(2),
    onSuccess: response => {
      // Invalidar todas as queries de roles
      queryClient.invalidateQueries({ queryKey: roleKeys.all });

      showSuccess(`${response.imported} roles importados com sucesso!`);
    },
    onError: (error: any, file: File) => {
      showError(`Erro ao importar roles: ${error.message}`);

      // Se estiver offline, adicionar à fila de retry
      if (!isOnline) {
        addToRetryQueue(() => rolesApi.import(file));
      }
    },
  });
}

export default {
  useDuplicateRole,
  useToggleRoleStatus,
  useRestoreRole,
  useExportRoles,
  useImportRoles,
};
