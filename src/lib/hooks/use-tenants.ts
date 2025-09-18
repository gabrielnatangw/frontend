import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '../api/tenants';
import type {
  CreateTenantRequest,
  UpdateTenantRequest,
  CreateTenantWithAdminRequest,
} from '../../types/tenant';

// Hook para listar tenants
export const useTenants = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['tenants', params],
    queryFn: () => tenantApi.getTenants(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar tenant por ID
export const useTenant = (id: string) => {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantApi.getTenant(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para criar tenant
export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTenantRequest) => tenantApi.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};

// Hook para atualizar tenant
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantRequest }) =>
      tenantApi.updateTenant(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
    },
  });
};

// Hook para deletar tenant
export const useDeleteTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tenantApi.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};

// Hook para criar tenant com admin
export const useCreateTenantWithAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTenantWithAdminRequest) =>
      tenantApi.createTenantWithAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
