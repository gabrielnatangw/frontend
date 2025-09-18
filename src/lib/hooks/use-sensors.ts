import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sensorsApi } from '../api/sensors';
import type {
  ListSensorsParams,
  CreateSensorRequest,
  UpdateSensorRequest,
} from '../../types/sensor';

// Query keys para sensores
export const sensorKeys = {
  all: ['sensors'] as const,
  lists: () => [...sensorKeys.all, 'list'] as const,
  list: (filters: ListSensorsParams) =>
    [...sensorKeys.lists(), filters] as const,
  details: () => [...sensorKeys.all, 'detail'] as const,
  detail: (id: string) => [...sensorKeys.details(), id] as const,
  stats: () => [...sensorKeys.all, 'stats'] as const,
};

// Hook para listar sensores
export function useSensors(params: ListSensorsParams = {}) {
  return useQuery({
    queryKey: sensorKeys.list(params),
    queryFn: () => sensorsApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar um sensor específico
export function useSensor(id: string) {
  return useQuery({
    queryKey: sensorKeys.detail(id),
    queryFn: () => sensorsApi.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar estatísticas de sensores
export function useSensorStats() {
  return useQuery({
    queryKey: sensorKeys.stats(),
    queryFn: () => sensorsApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

// Hook para criar sensor
export function useCreateSensor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSensorRequest) => sensorsApi.create(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: sensorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sensorKeys.stats() });
    },
  });
}

// Hook para atualizar sensor
export function useUpdateSensor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSensorRequest }) =>
      sensorsApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: sensorKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: sensorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sensorKeys.stats() });
    },
  });
}

// Hook para deletar sensor
export function useDeleteSensor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sensorsApi.delete(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: sensorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sensorKeys.stats() });
    },
  });
}

// Hook para restaurar sensor deletado
export function useRestoreSensor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sensorsApi.restore(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: sensorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sensorKeys.stats() });
    },
  });
}
