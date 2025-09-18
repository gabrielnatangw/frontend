import { apiRequest } from './config';
import type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantResponse,
  TenantsResponse,
  CreateTenantWithAdminRequest,
} from '../../types/tenant';

export const tenantApi = {
  // Listar tenants
  getTenants: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<TenantsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `/tenants${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<TenantsResponse>(url, { method: 'GET' });
  },

  // Buscar tenant por ID
  getTenant: async (id: string): Promise<TenantResponse> => {
    return apiRequest<TenantResponse>(`/tenants/${id}`, { method: 'GET' });
  },

  // Criar tenant
  createTenant: async (data: CreateTenantRequest): Promise<TenantResponse> => {
    return apiRequest<TenantResponse>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar tenant
  updateTenant: async (
    id: string,
    data: UpdateTenantRequest
  ): Promise<TenantResponse> => {
    return apiRequest<TenantResponse>(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar tenant
  deleteTenant: async (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    return apiRequest<{ success: boolean; message?: string }>(
      `/tenants/${id}`,
      { method: 'DELETE' }
    );
  },

  // Criar tenant com admin
  createTenantWithAdmin: async (
    data: CreateTenantWithAdminRequest
  ): Promise<{
    success: boolean;
    data: {
      tenant: Tenant;
      admin: any; // Tipo do admin será definido quando a API estiver pronta
    };
    message?: string;
  }> => {
    return apiRequest('/tenants/with-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
