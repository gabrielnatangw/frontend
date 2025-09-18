import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from './use-notifications';

/**
 * Hook para suporte offline com retry automático
 */
export function useOfflineSupport() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useNotifications();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryQueue, setRetryQueue] = useState<Array<() => Promise<any>>>([]);

  // Processar fila de retry quando voltar online
  const processRetryQueue = useCallback(async () => {
    if (retryQueue.length === 0) return;

    const queue = [...retryQueue];
    setRetryQueue([]);

    for (const retryFn of queue) {
      try {
        await retryFn();
      } catch (error) {
        console.error('Erro ao processar retry:', error);
        // Adicionar de volta à fila se falhar
        setRetryQueue(prev => [...prev, retryFn]);
      }
    }
  }, [retryQueue]);

  // Detectar mudanças de conectividade
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showSuccess('Conexão restaurada!');

      // Processar fila de retry
      processRetryQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showError(
        'Conexão perdida. Algumas funcionalidades podem estar limitadas.'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showSuccess, showError, processRetryQueue]);

  // Adicionar função à fila de retry
  const addToRetryQueue = useCallback((retryFn: () => Promise<any>) => {
    setRetryQueue(prev => [...prev, retryFn]);
  }, []);

  // Função para retry automático de queries
  const retryFailedQueries = useCallback(() => {
    queryClient.refetchQueries({
      type: 'all',
      stale: true,
    });
  }, [queryClient]);

  // Configuração de retry para mutations
  const getRetryConfig = useCallback(
    (maxRetries = 3) => ({
      retry: (failureCount: number, error: any) => {
        // Não tentar novamente se estiver offline
        if (!isOnline) {
          return false;
        }

        // Não tentar novamente para erros 4xx (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }

        return failureCount < maxRetries;
      },
      retryDelay: (attemptIndex: number) => {
        // Backoff exponencial com jitter
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
        const jitter = Math.random() * 1000;
        return baseDelay + jitter;
      },
    }),
    [isOnline]
  );

  // Função para invalidar queries quando voltar online
  const invalidateOnReconnect = useCallback(() => {
    if (isOnline) {
      queryClient.invalidateQueries({
        type: 'all',
        stale: true,
      });
    }
  }, [isOnline, queryClient]);

  // Configuração de cache para modo offline
  const getOfflineCacheConfig = useCallback(
    () => ({
      staleTime: isOnline ? 5 * 60 * 1000 : Infinity, // Cache infinito quando offline
      gcTime: isOnline ? 10 * 60 * 1000 : Infinity, // Nunca limpar quando offline
      refetchOnWindowFocus: isOnline, // Só refetch quando online
      refetchOnMount: isOnline, // Só refetch quando online
      refetchOnReconnect: true, // Sempre refetch quando reconectar
    }),
    [isOnline]
  );

  return {
    isOnline,
    retryQueue,
    addToRetryQueue,
    retryFailedQueries,
    getRetryConfig,
    invalidateOnReconnect,
    getOfflineCacheConfig,
    processRetryQueue,
  };
}

export default useOfflineSupport;
