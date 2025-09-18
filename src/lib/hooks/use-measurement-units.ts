import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementUnitsApi } from '../api/measurement-units';
import type {
  ListMeasurementUnitsParams,
  CreateMeasurementUnitRequest,
  UpdateMeasurementUnitRequest,
} from '../../types/measurement-unit';

// Query keys para unidades de medida
export const measurementUnitKeys = {
  all: ['measurementUnits'] as const,
  lists: () => [...measurementUnitKeys.all, 'list'] as const,
  list: (filters: ListMeasurementUnitsParams) =>
    [...measurementUnitKeys.lists(), filters] as const,
  details: () => [...measurementUnitKeys.all, 'detail'] as const,
  detail: (id: string) => [...measurementUnitKeys.details(), id] as const,
  stats: () => [...measurementUnitKeys.all, 'stats'] as const,
};

// Hook para listar unidades de medida
export function useMeasurementUnits(params: ListMeasurementUnitsParams = {}) {
  return useQuery({
    queryKey: measurementUnitKeys.list(params),
    queryFn: () => measurementUnitsApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar uma unidade de medida específica
export function useMeasurementUnit(id: string) {
  return useQuery({
    queryKey: measurementUnitKeys.detail(id),
    queryFn: () => measurementUnitsApi.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar estatísticas de unidades de medida
export function useMeasurementUnitStats() {
  return useQuery({
    queryKey: measurementUnitKeys.stats(),
    queryFn: () => measurementUnitsApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

// Hook para criar unidade de medida
export function useCreateMeasurementUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeasurementUnitRequest) =>
      measurementUnitsApi.create(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: measurementUnitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: measurementUnitKeys.stats() });
    },
  });
}

// Hook para atualizar unidade de medida
export function useUpdateMeasurementUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMeasurementUnitRequest;
    }) => measurementUnitsApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: measurementUnitKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: measurementUnitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: measurementUnitKeys.stats() });
    },
  });
}

// Hook para deletar unidade de medida
export function useDeleteMeasurementUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => measurementUnitsApi.delete(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: measurementUnitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: measurementUnitKeys.stats() });
    },
  });
}

// Hook para restaurar unidade de medida deletada
export function useRestoreMeasurementUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => measurementUnitsApi.restore(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: measurementUnitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: measurementUnitKeys.stats() });
    },
  });
}
