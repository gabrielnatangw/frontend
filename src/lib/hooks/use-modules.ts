import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modulesApi } from '../api/modules';
import type {
  ListModulesParams,
  CreateModuleRequest,
  UpdateModuleRequest,
} from '../../types/module';

// Query keys para módulos
export const moduleKeys = {
  all: ['modules'] as const,
  lists: () => [...moduleKeys.all, 'list'] as const,
  list: (filters: ListModulesParams) =>
    [...moduleKeys.lists(), filters] as const,
  details: () => [...moduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...moduleKeys.details(), id] as const,
  stats: () => [...moduleKeys.all, 'stats'] as const,
};

// Hook para listar módulos
export function useModules(params: ListModulesParams = {}) {
  return useQuery({
    queryKey: moduleKeys.list(params),
    queryFn: () => modulesApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar um módulo específico
export function useModule(id: string) {
  return useQuery({
    queryKey: moduleKeys.detail(id),
    queryFn: () => modulesApi.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar estatísticas de módulos
export function useModuleStats() {
  return useQuery({
    queryKey: moduleKeys.stats(),
    queryFn: () => modulesApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

// Hook para criar módulo
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModuleRequest) => modulesApi.create(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moduleKeys.stats() });
    },
  });
}

// Hook para atualizar módulo
export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModuleRequest }) =>
      modulesApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moduleKeys.stats() });
    },
  });
}

// Hook para deletar módulo
export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => modulesApi.delete(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moduleKeys.stats() });
    },
  });
}

// Hook para restaurar módulo deletado
export function useRestoreModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => modulesApi.restore(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moduleKeys.stats() });
    },
  });
}
