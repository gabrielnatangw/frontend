import { useCallback } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useNotifications } from './use-notifications';

export interface AuditLogEntry {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  userId?: string;
  userEmail?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Hook para logging de auditoria
 */
export function useAuditLogging() {
  const { user } = useAuthStore();
  const { showInfo } = useNotifications();

  // Função para criar entrada de log
  const createLogEntry = useCallback(
    (
      action: string,
      resource: string,
      resourceId?: string,
      details?: Record<string, any>,
      success: boolean = true,
      errorMessage?: string
    ): AuditLogEntry => {
      return {
        action,
        resource,
        resourceId,
        details,
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString(),
        ipAddress: 'client-ip-unknown',
        userAgent: navigator.userAgent,
        success,
        errorMessage,
      };
    },
    [user]
  );

  // Função para enviar log para o servidor
  const sendAuditLog = useCallback(async (logEntry: AuditLogEntry) => {
    try {
      // Aqui você faria a chamada para a API de auditoria
      // await auditApi.createLog(logEntry);

      // Por enquanto, apenas logamos no console
      console.log('[AUDIT LOG]', logEntry);

      // Em produção, você também poderia enviar para um serviço de logging
      // como Sentry, LogRocket, ou um sistema interno
    } catch (error) {
      console.error('Erro ao enviar log de auditoria:', error);
    }
  }, []);

  // Função para log de criação
  const logCreate = useCallback(
    async (
      resource: string,
      resourceId: string,
      details?: Record<string, any>
    ) => {
      const logEntry = createLogEntry(
        'CREATE',
        resource,
        resourceId,
        details,
        true
      );

      await sendAuditLog(logEntry);
      showInfo(`${resource} criado com sucesso`);
    },
    [createLogEntry, sendAuditLog, showInfo]
  );

  // Função para log de atualização
  const logUpdate = useCallback(
    async (
      resource: string,
      resourceId: string,
      changes: Record<string, any>,
      details?: Record<string, any>
    ) => {
      const logEntry = createLogEntry(
        'UPDATE',
        resource,
        resourceId,
        { changes, ...details },
        true
      );

      await sendAuditLog(logEntry);
      showInfo(`${resource} atualizado com sucesso`);
    },
    [createLogEntry, sendAuditLog, showInfo]
  );

  // Função para log de exclusão
  const logDelete = useCallback(
    async (
      resource: string,
      resourceId: string,
      details?: Record<string, any>
    ) => {
      const logEntry = createLogEntry(
        'DELETE',
        resource,
        resourceId,
        details,
        true
      );

      await sendAuditLog(logEntry);
      showInfo(`${resource} deletado com sucesso`);
    },
    [createLogEntry, sendAuditLog, showInfo]
  );

  // Função para log de visualização
  const logView = useCallback(
    async (
      resource: string,
      resourceId: string,
      details?: Record<string, any>
    ) => {
      const logEntry = createLogEntry(
        'VIEW',
        resource,
        resourceId,
        details,
        true
      );

      await sendAuditLog(logEntry);
    },
    [createLogEntry, sendAuditLog]
  );

  // Função para log de erro
  const logError = useCallback(
    async (
      action: string,
      resource: string,
      resourceId: string | undefined,
      error: Error,
      details?: Record<string, any>
    ) => {
      const logEntry = createLogEntry(
        action,
        resource,
        resourceId,
        details,
        false,
        error.message
      );

      await sendAuditLog(logEntry);
    },
    [createLogEntry, sendAuditLog]
  );

  // Função para log de operações em lote
  const logBulkOperation = useCallback(
    async (
      action: string,
      resource: string,
      resourceIds: string[],
      details?: Record<string, any>
    ) => {
      const logEntry = createLogEntry(
        `BULK_${action}`,
        resource,
        undefined,
        { resourceIds, count: resourceIds.length, ...details },
        true
      );

      await sendAuditLog(logEntry);
      showInfo(`${resourceIds.length} ${resource}s processados com sucesso`);
    },
    [createLogEntry, sendAuditLog, showInfo]
  );

  // Função para log de autenticação
  const logAuth = useCallback(
    async (
      action: 'LOGIN' | 'LOGOUT' | 'REFRESH_TOKEN',
      details?: Record<string, any>
    ) => {
      const logEntry = createLogEntry(action, 'AUTH', undefined, details, true);

      await sendAuditLog(logEntry);
    },
    [createLogEntry, sendAuditLog]
  );

  // Função para log de permissões
  const logPermission = useCallback(
    async (
      action: string,
      resource: string,
      resourceId: string,
      permission: string,
      details?: Record<string, any>
    ) => {
      const logEntry = createLogEntry(
        action,
        resource,
        resourceId,
        { permission, ...details },
        true
      );

      await sendAuditLog(logEntry);
    },
    [createLogEntry, sendAuditLog]
  );

  return {
    logCreate,
    logUpdate,
    logDelete,
    logView,
    logError,
    logBulkOperation,
    logAuth,
    logPermission,
    createLogEntry,
    sendAuditLog,
  };
}

export default useAuditLogging;
