import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viewsApi } from '../api/views';
import { useOfflineSupport } from './use-offline-support';
import { useNotifications } from './use-notifications';
import type {
  CreateViewRequest,
  UpdateViewRequest,
  ListViewsParams,
} from '../../types/view';

export const viewKeys = {
  all: ['views'] as const,
  lists: () => [...viewKeys.all, 'list'] as const,
  list: (params: ListViewsParams) => [...viewKeys.lists(), params] as const,
  details: () => [...viewKeys.all, 'detail'] as const,
  detail: (id: string) => [...viewKeys.details(), id] as const,
  stats: () => [...viewKeys.all, 'stats'] as const,
};

// Hook para listar views
export function useViews(params: ListViewsParams = {}) {
  const { getOfflineCacheConfig, getRetryConfig } = useOfflineSupport();

  return useQuery({
    queryKey: viewKeys.list(params),
    queryFn: () => viewsApi.list(params),
    ...getOfflineCacheConfig(),
    ...getRetryConfig(3),
  });
}

// Hook para listar views do usuário atual
export function useMyViews() {
  const { getOfflineCacheConfig, getRetryConfig } = useOfflineSupport();

  return useQuery({
    queryKey: [...viewKeys.all, 'my', 'complete'],
    queryFn: () => viewsApi.listComplete({ my: true }),
    ...getOfflineCacheConfig(),
    ...getRetryConfig(3),
  });
}

// Hook para buscar uma view específica
export function useView(id: string) {
  const { getOfflineCacheConfig, getRetryConfig } = useOfflineSupport();

  return useQuery({
    queryKey: viewKeys.detail(id),
    queryFn: () => viewsApi.get(id),
    enabled: !!id,
    ...getOfflineCacheConfig(),
    ...getRetryConfig(3),
  });
}

// Hook para estatísticas de views
export function useViewStats() {
  const { getOfflineCacheConfig, getRetryConfig } = useOfflineSupport();

  return useQuery({
    queryKey: viewKeys.stats(),
    queryFn: () => viewsApi.stats(),
    ...getOfflineCacheConfig(),
    ...getRetryConfig(3),
  });
}

// Hook para criar view
export function useCreateView() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { addToRetryQueue, isOnline } = useOfflineSupport();

  return useMutation({
    mutationFn: (data: CreateViewRequest) => viewsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...viewKeys.all, 'my', 'complete'],
      });
      queryClient.invalidateQueries({ queryKey: viewKeys.stats() });
      showSuccess('View criada com sucesso');
    },
    onError: (error: any, data: CreateViewRequest) => {
      showError(`Erro ao criar view: ${error.message}`);
      if (!isOnline) {
        addToRetryQueue(() => viewsApi.create(data));
      }
    },
  });
}

// Hook para atualizar view
export function useUpdateView() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { addToRetryQueue, isOnline } = useOfflineSupport();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateViewRequest }) =>
      viewsApi.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...viewKeys.all, 'my', 'complete'],
      });
      queryClient.invalidateQueries({ queryKey: viewKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: viewKeys.stats() });
      showSuccess('View atualizada com sucesso');
    },
    onError: (error: any, { id, data }) => {
      showError(`Erro ao atualizar view: ${error.message}`);
      if (!isOnline) {
        addToRetryQueue(() => viewsApi.update(id, data));
      }
    },
  });
}

// Hook para deletar view
export function useDeleteView() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { addToRetryQueue, isOnline } = useOfflineSupport();

  return useMutation({
    mutationFn: (id: string) => viewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...viewKeys.all, 'my', 'complete'],
      });
      queryClient.invalidateQueries({ queryKey: viewKeys.stats() });
      showSuccess('View excluída com sucesso');
    },
    onError: (error: any, id: string) => {
      showError(`Erro ao excluir view: ${error.message}`);
      if (!isOnline) {
        addToRetryQueue(() => viewsApi.delete(id));
      }
    },
  });
}

// Hook para compartilhar view
export function useShareView() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { addToRetryQueue, isOnline } = useOfflineSupport();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { userIds: string[]; permission: string; isPublic: boolean };
    }) => viewsApi.share(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: viewKeys.detail(id) });
      showSuccess('View compartilhada com sucesso');
    },
    onError: (error: any, { id, data }) => {
      showError(`Erro ao compartilhar view: ${error.message}`);
      if (!isOnline) {
        addToRetryQueue(() => viewsApi.share(id, data));
      }
    },
  });
}

// Hook para atualizar permissões de view
export function useUpdateViewPermissions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { addToRetryQueue, isOnline } = useOfflineSupport();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { permissionIds: string[] };
    }) => viewsApi.updatePermissions(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: viewKeys.detail(id) });
      showSuccess('Permissões da view atualizadas com sucesso');
    },
    onError: (error: any, { id, data }) => {
      showError(`Erro ao atualizar permissões: ${error.message}`);
      if (!isOnline) {
        addToRetryQueue(() => viewsApi.updatePermissions(id, data));
      }
    },
  });
}
