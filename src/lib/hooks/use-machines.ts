import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { machinesApi } from '../api/machines';

// Query keys
export const machineKeys = {
  all: ['machines'] as const,
  lists: () => [...machineKeys.all, 'list'] as const,
  list: (filters: string) => [...machineKeys.lists(), { filters }] as const,
  details: () => [...machineKeys.all, 'detail'] as const,
  detail: (id: string) => [...machineKeys.details(), id] as const,
  stats: () => [...machineKeys.all, 'stats'] as const,
};

// Hook para listar máquinas
export function useMachines(params?: any) {
  return useQuery({
    queryKey: machineKeys.lists(),
    queryFn: () => machinesApi.list(params),
  });
}

// Hook para obter uma máquina específica
export function useMachine(id: string) {
  return useQuery({
    queryKey: machineKeys.detail(id),
    queryFn: () => machinesApi.get(id),
    enabled: !!id,
  });
}

// Hook para estatísticas de máquinas
export function useMachineStats() {
  return useQuery({
    queryKey: machineKeys.stats(),
    queryFn: () => machinesApi.stats(),
  });
}

// Hook para criar máquina
export function useCreateMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => machinesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machineKeys.lists() });
      queryClient.invalidateQueries({ queryKey: machineKeys.stats() });
    },
  });
}

// Hook para atualizar máquina
export function useUpdateMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      machinesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: machineKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: machineKeys.lists() });
      queryClient.invalidateQueries({ queryKey: machineKeys.stats() });
    },
  });
}

// Hook para deletar máquina
export function useDeleteMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => machinesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machineKeys.lists() });
      queryClient.invalidateQueries({ queryKey: machineKeys.stats() });
    },
  });
}

// Hook para restaurar máquina
export function useRestoreMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => machinesApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machineKeys.lists() });
      queryClient.invalidateQueries({ queryKey: machineKeys.stats() });
    },
  });
}
