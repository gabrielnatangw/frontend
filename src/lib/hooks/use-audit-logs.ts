import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../api/audit-logs';
import { useOfflineSupport } from './use-offline-support';

// Chaves para cache do React Query
export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (params: any) => [...auditLogKeys.lists(), params] as const,
  details: () => [...auditLogKeys.all, 'detail'] as const,
  detail: (id: string) => [...auditLogKeys.details(), id] as const,
  stats: () => [...auditLogKeys.all, 'stats'] as const,
};

// Hook para listar logs de auditoria
export function useAuditLogs(
  params: {
    search?: string;
    type?: string;
    date?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const { getOfflineCacheConfig, getRetryConfig } = useOfflineSupport();

  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => auditLogsApi.list(params),
    ...getOfflineCacheConfig(), // 5 minutos
    ...getRetryConfig(3),
  });
}

// Hook para buscar log específico
export function useAuditLog(id: string) {
  const { getOfflineCacheConfig, getRetryConfig } = useOfflineSupport();

  return useQuery({
    queryKey: auditLogKeys.detail(id),
    queryFn: () => auditLogsApi.get(id),
    ...getOfflineCacheConfig(), // 10 minutos
    ...getRetryConfig(3),
  });
}

// Hook para estatísticas de auditoria
export function useAuditStats() {
  const { getOfflineCacheConfig, getRetryConfig } = useOfflineSupport();

  return useQuery({
    queryKey: auditLogKeys.stats(),
    queryFn: () => auditLogsApi.stats(),
    ...getOfflineCacheConfig(), // 2 minutos
    ...getRetryConfig(2),
  });
}
