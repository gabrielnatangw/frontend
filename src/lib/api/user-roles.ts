import { apiRequest } from './config';
import type {
  UserRole,
  CreateUserRoleRequest,
  UpdateUserRoleRequest,
  ListUserRolesParams,
  ListUserRolesResponse,
  UserRoleResponse,
  UserRoleStatsResponse,
} from '../../types/user-role';

export const userRolesApi = {
  // Listar relacionamentos user-role com filtros e paginação
  async list(params: ListUserRolesParams = {}): Promise<ListUserRolesResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.roleId) searchParams.append('roleId', params.roleId);
    if (params.isActive !== undefined)
      searchParams.append('isActive', params.isActive.toString());
    if (params.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/user-roles${queryString ? `?${queryString}` : ''}`;

    return apiRequest<ListUserRolesResponse>(endpoint);
  },

  // Buscar relacionamento user-role específico
  async get(id: string): Promise<UserRoleResponse> {
    return apiRequest<UserRoleResponse>(`/user-roles/${id}`);
  },

  // Criar novo relacionamento user-role
  async create(data: CreateUserRoleRequest): Promise<UserRoleResponse> {
    return apiRequest<UserRoleResponse>('/user-roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar relacionamento user-role
  async update(
    id: string,
    data: UpdateUserRoleRequest
  ): Promise<UserRoleResponse> {
    return apiRequest<UserRoleResponse>(`/user-roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar relacionamento user-role
  async delete(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/user-roles/${id}`, {
      method: 'DELETE',
    });
  },

  // Obter estatísticas de user-roles
  async stats(): Promise<UserRoleStatsResponse> {
    return apiRequest<UserRoleStatsResponse>('/user-roles/stats');
  },

  // Obter roles de um usuário
  async getByUser(
    userId: string
  ): Promise<{ success: boolean; data: UserRole[] }> {
    return apiRequest<{ success: boolean; data: UserRole[] }>(
      `/user-roles/by-user/${userId}`
    );
  },

  // Obter usuários de um role
  async getByRole(
    roleId: string
  ): Promise<{ success: boolean; data: UserRole[] }> {
    return apiRequest<{ success: boolean; data: UserRole[] }>(
      `/user-roles/by-role/${roleId}`
    );
  },

  // Atribuir role a usuário
  async assignRole(userId: string, roleId: string): Promise<UserRoleResponse> {
    return apiRequest<UserRoleResponse>('/user-roles/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  },

  // Remover role de usuário
  async unassignRole(
    userId: string,
    roleId: string
  ): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('/user-roles/unassign', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  },

  // Atribuir múltiplos roles a um usuário
  async assignMultipleRoles(
    userId: string,
    roleIds: string[]
  ): Promise<{ success: boolean; data: UserRole[] }> {
    return apiRequest<{ success: boolean; data: UserRole[] }>(
      '/user-roles/assign-multiple',
      {
        method: 'POST',
        body: JSON.stringify({ userId, roleIds }),
      }
    );
  },

  // Remover múltiplos roles de um usuário
  async unassignMultipleRoles(
    userId: string,
    roleIds: string[]
  ): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('/user-roles/unassign-multiple', {
      method: 'POST',
      body: JSON.stringify({ userId, roleIds }),
    });
  },

  // Atribuir role a múltiplos usuários
  async assignRoleToUsers(
    roleId: string,
    userIds: string[]
  ): Promise<{ success: boolean; data: UserRole[] }> {
    return apiRequest<{ success: boolean; data: UserRole[] }>(
      '/user-roles/assign-to-users',
      {
        method: 'POST',
        body: JSON.stringify({ roleId, userIds }),
      }
    );
  },

  // Remover role de múltiplos usuários
  async unassignRoleFromUsers(
    roleId: string,
    userIds: string[]
  ): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('/user-roles/unassign-from-users', {
      method: 'POST',
      body: JSON.stringify({ roleId, userIds }),
    });
  },
};
