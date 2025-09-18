import { apiRequest } from './config';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UsersResponse,
  UserResponse,
  UserStatsResponse,
  ResetPasswordRequest,
  UserPermissionsResponse,
  UserRolesResponse,
  GrantPermissionsRequest,
  RevokePermissionsRequest,
  ChangePasswordRequest,
  UserProfileResponse,
  UserFilters,
  UserStatusResponse,
  RestoreUserResponse,
  UserByEmailResponse,
  UsersByTenantResponse,
} from '../../types/user-integration';

export const userIntegrationApi = {
  // CRUD Básico
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.userType) params.append('userType', filters.userType);
    if (filters.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.tenantId) params.append('tenantId', filters.tenantId);

    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';

    return apiRequest(endpoint);
  },

  async getUserById(id: string): Promise<UserResponse> {
    return apiRequest(`/users/${id}`);
  },

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(
    id: string,
    permanent: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/users/${id}?permanent=${permanent}`, {
      method: 'DELETE',
    });
  },

  // Operações Avançadas
  async restoreUser(id: string): Promise<RestoreUserResponse> {
    return apiRequest(`/users/${id}/restore`, {
      method: 'PATCH',
    });
  },

  async activateUser(id: string): Promise<UserStatusResponse> {
    return apiRequest(`/users/${id}/activate`, {
      method: 'PATCH',
    });
  },

  async deactivateUser(id: string): Promise<UserStatusResponse> {
    return apiRequest(`/users/${id}/deactivate`, {
      method: 'PATCH',
    });
  },

  async resetPassword(
    id: string,
    data: ResetPasswordRequest
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/users/${id}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Busca e Estatísticas
  async getUserByEmail(email: string): Promise<UserByEmailResponse> {
    return apiRequest(`/users/by-email?email=${encodeURIComponent(email)}`);
  },

  async getUsersByTenant(tenantId: string): Promise<UsersByTenantResponse> {
    return apiRequest(`/users/by-tenant/${tenantId}`);
  },

  async getUserStats(): Promise<UserStatsResponse> {
    return apiRequest('/users/stats');
  },

  // Gerenciamento de Permissões
  async getUserPermissions(id: string): Promise<UserPermissionsResponse> {
    return apiRequest(`/users/${id}/permissions`);
  },

  async grantPermissions(
    id: string,
    data: GrantPermissionsRequest
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/users/${id}/permissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async revokePermissions(
    id: string,
    data: RevokePermissionsRequest
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/users/${id}/permissions`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },

  // Gerenciamento de Roles - Usando API que realmente existe
  async getUserRoles(id: string): Promise<UserRolesResponse> {
    return apiRequest(`/user-roles/by-user/${id}`);
  },

  async assignRole(
    id: string,
    data: { roleId: string }
  ): Promise<{ success: boolean; message: string; data?: any }> {
    return apiRequest(`/user-roles`, {
      method: 'POST',
      body: JSON.stringify({
        userId: id,
        roleId: data.roleId,
      }),
    });
  },

  async assignMultipleRoles(
    id: string,
    data: { roleIds: string[] }
  ): Promise<{ success: boolean; message: string; data?: any[] }> {
    return apiRequest(`/user-roles/assign-multiple`, {
      method: 'POST',
      body: JSON.stringify({
        userId: id,
        roleIds: data.roleIds,
      }),
    });
  },

  async replaceUserRoles(
    id: string,
    data: { roleIds: string[] }
  ): Promise<{ success: boolean; message: string; data?: any[] }> {
    return apiRequest(`/user-roles/replace`, {
      method: 'POST',
      body: JSON.stringify({
        userId: id,
        roleIds: data.roleIds,
      }),
    });
  },

  async removeRole(
    userId: string,
    roleId: string
  ): Promise<{ success: boolean; message: string }> {
    // Primeiro buscar o user-role ID, depois deletar
    const userRoles = await this.getUserRoles(userId);
    const userRole = userRoles.data?.find((ur: any) => ur.roleId === roleId);

    if (!userRole) {
      throw new Error('User role not found');
    }

    return apiRequest(`/user-roles/${userRole.id}`, {
      method: 'DELETE',
    });
  },

  // Operações de Usuário Comum
  async getMyProfile(): Promise<UserProfileResponse> {
    return apiRequest('/users/profile/me');
  },

  async updateMyProfile(data: UpdateUserRequest): Promise<UserProfileResponse> {
    return apiRequest('/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest('/users/profile/change-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
