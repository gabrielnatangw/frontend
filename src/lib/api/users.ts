import { apiRequest } from './config';
import type {
  ListUsersParams,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  SetPasswordRequest,
  ListUsersResponse,
  UserResponse,
  UserStatsResponse,
} from '../../types/user';

export const usersApi = {
  // Listar usuários com paginação e filtros
  async list(params: ListUsersParams = {}): Promise<ListUsersResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.name) searchParams.append('name', params.name);
    if (params.email) searchParams.append('email', params.email);
    if (params.accessType) searchParams.append('accessType', params.accessType);
    if (params.userType) searchParams.append('userType', params.userType);
    if (params.isActive !== undefined)
      searchParams.append('isActive', params.isActive.toString());
    if (params.firstLogin !== undefined)
      searchParams.append('firstLogin', params.firstLogin.toString());
    if (params.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params.isDeleted !== undefined)
      searchParams.append('isDeleted', params.isDeleted.toString());

    const queryString = searchParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  },

  // Buscar usuário por ID
  async get(id: string): Promise<UserResponse> {
    return apiRequest(`/users/${id}`);
  },

  // Criar novo usuário
  async create(data: CreateUserRequest): Promise<UserResponse> {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar usuário existente
  async update(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar usuário (soft delete)
  async delete(
    id: string,
    permanent: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    const searchParams = new URLSearchParams();
    if (permanent) searchParams.append('permanent', 'true');

    const queryString = searchParams.toString();
    const endpoint = `/users/${id}${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint, {
      method: 'DELETE',
    });
  },

  // Restaurar usuário deletado
  async restore(id: string): Promise<UserResponse> {
    return apiRequest(`/users/${id}/restore`, {
      method: 'PATCH',
    });
  },

  // Ativar usuário
  async activate(id: string): Promise<UserResponse> {
    return apiRequest(`/users/${id}/activate`, {
      method: 'PATCH',
    });
  },

  // Desativar usuário
  async deactivate(id: string): Promise<UserResponse> {
    return apiRequest(`/users/${id}/deactivate`, {
      method: 'PATCH',
    });
  },

  // Trocar senha
  async changePassword(
    id: string,
    data: ChangePasswordRequest
  ): Promise<UserResponse> {
    return apiRequest(`/users/${id}/change-password`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Definir nova senha
  async setPassword(
    id: string,
    data: SetPasswordRequest
  ): Promise<UserResponse> {
    return apiRequest(`/users/${id}/set-password`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Resetar senha
  async resetPassword(
    id: string,
    data: { newPassword?: string; sendEmail?: boolean }
  ): Promise<UserResponse> {
    return apiRequest(`/users/${id}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Buscar estatísticas de usuários
  async getStats(tenantId?: string): Promise<UserStatsResponse> {
    const searchParams = new URLSearchParams();
    if (tenantId) searchParams.append('tenantId', tenantId);

    const queryString = searchParams.toString();
    const endpoint = `/users/stats${queryString ? `?${queryString}` : ''}`;

    return apiRequest<UserStatsResponse>(endpoint);
  },

  // Buscar por email e tenant
  async getByEmail(email: string, tenantId: string): Promise<UserResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('email', email);
    searchParams.append('tenantId', tenantId);

    const endpoint = `/users/by-email?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },

  // Buscar por tenant
  async getByTenant(tenantId: string): Promise<UserResponse> {
    return apiRequest(`/users/by-tenant/${tenantId}`);
  },

  // Buscar por role
  async getByRole(roleId: string, tenantId?: string): Promise<UserResponse> {
    const searchParams = new URLSearchParams();
    if (tenantId) searchParams.append('tenantId', tenantId);

    const queryString = searchParams.toString();
    const endpoint = `/users/by-role/${roleId}${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  },

  // Buscar admins do tenant
  async getTenantAdmins(tenantId: string): Promise<UserResponse> {
    return apiRequest(`/users/tenant-admins/${tenantId}`);
  },

  // Buscar primeiro admin do tenant
  async getFirstTenantAdmin(tenantId: string): Promise<UserResponse> {
    return apiRequest(`/users/first-tenant-admin/${tenantId}`);
  },

  // Busca avançada
  async search(
    searchTerm: string,
    params: Omit<ListUsersParams, 'name' | 'email'> = {}
  ): Promise<UserResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('searchTerm', searchTerm);

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.accessType) searchParams.append('accessType', params.accessType);
    if (params.userType) searchParams.append('userType', params.userType);
    if (params.isActive !== undefined)
      searchParams.append('isActive', params.isActive.toString());
    if (params.tenantId) searchParams.append('tenantId', params.tenantId);

    const endpoint = `/users/search?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },
};
