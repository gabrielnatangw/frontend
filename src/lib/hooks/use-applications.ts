import { useQuery } from '@tanstack/react-query';
import { applicationsApi } from '../api/applications';

// Query keys para aplicações
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
};

// Hook para listar aplicações
export function useApplications() {
  return useQuery({
    queryKey: applicationKeys.lists(),
    queryFn: () => applicationsApi.list(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

// Hook para buscar aplicação específica
export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: applicationKeys.detail(applicationId),
    queryFn: () => applicationsApi.get(applicationId),
    enabled: !!applicationId,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}
