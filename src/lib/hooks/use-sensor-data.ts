import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query';
import { sensorDataApi } from '../api/views';
import type {
  UpdateSensorCurrentData,
  SensorCurrentValue,
} from '../../types/view';

// ===========================================
// HOOKS PARA DADOS DE SENSORES
// ===========================================

export const useCurrentSensorValue = (sensorId: string) => {
  return useQuery({
    queryKey: ['sensor-current', sensorId],
    queryFn: () => sensorDataApi.getCurrentData(sensorId),
    enabled: !!sensorId,
    refetchInterval: 1000, // Atualizar a cada segundo
    staleTime: 0, // Sempre considerar dados como stale
  });
};

export const useCurrentSensorValues = (sensorIds: string[]) => {
  return useQueries({
    queries: sensorIds.map(sensorId => ({
      queryKey: ['sensor-current', sensorId],
      queryFn: () => sensorDataApi.getCurrentData(sensorId),
      refetchInterval: 1000,
      staleTime: 0,
    })),
  });
};

export const useUpdateCurrentSensorValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSensorCurrentData) =>
      sensorDataApi.updateCurrentData(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ['sensor-current', data.sensorId],
      });
    },
  });
};

// ===========================================
// HOOKS UTILITÁRIOS
// ===========================================

export const useSensorDataRealtime = (sensorIds: string[]) => {
  const queries = useCurrentSensorValues(sensorIds);

  // Retornar dados organizados por sensorId
  const sensorDataMap = queries.reduce(
    (acc, query, index) => {
      const sensorId = sensorIds[index];
      if (query.data?.data) {
        acc[sensorId] = query.data.data;
      }
      return acc;
    },
    {} as Record<string, SensorCurrentValue>
  );

  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);
  const errors = queries
    .filter(query => query.isError)
    .map(query => query.error);

  return {
    data: sensorDataMap,
    isLoading,
    isError,
    errors,
    queries,
  };
};

export const useSensorValue = (sensorId: string) => {
  const { data, isLoading, isError, error } = useCurrentSensorValue(sensorId);

  return {
    value: data?.data?.value || 0,
    rawValue: data?.data?.rawValue,
    unit: data?.data?.unit,
    quality: data?.data?.quality,
    lastUpdated: data?.data?.lastUpdated,
    isStale: data?.data?.isStale,
    isLoading,
    isError,
    error,
  };
};
