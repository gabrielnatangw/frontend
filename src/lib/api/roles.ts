import { apiRequest, getApiUrl } from './config';
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  ListRolesParams,
  ListRolesResponse,
  RoleResponse,
  RoleStatsResponse,
} from '../../types/role';

export const rolesApi = {
  // Listar roles com filtros e paginação
  async list(params: ListRolesParams = {}): Promise<ListRolesResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.name) searchParams.append('name', params.name);
    if (params.description)
      searchParams.append('description', params.description);
    if (params.isActive !== undefined)
      searchParams.append('isActive', params.isActive.toString());
    if (params.isSystem !== undefined)
      searchParams.append('isSystem', params.isSystem.toString());
    if (params.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/roles${queryString ? `?${queryString}` : ''}`;

    return apiRequest<ListRolesResponse>(endpoint);
  },

  // Buscar role específico
  async get(id: string): Promise<RoleResponse> {
    return apiRequest<RoleResponse>(`/roles/${id}`);
  },

  // Criar novo role
  async create(data: CreateRoleRequest): Promise<RoleResponse> {
    return apiRequest<RoleResponse>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar role
  async update(id: string, data: UpdateRoleRequest): Promise<RoleResponse> {
    return apiRequest<RoleResponse>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar role (soft delete)
  async delete(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/roles/${id}`, {
      method: 'DELETE',
    });
  },

  // Restaurar role deletado
  async restore(id: string): Promise<RoleResponse> {
    return apiRequest<RoleResponse>(`/roles/${id}/restore`, {
      method: 'POST',
    });
  },

  // Duplicar role
  async duplicate(id: string, name: string): Promise<RoleResponse> {
    return apiRequest<RoleResponse>(`/roles/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  // Obter estatísticas de roles
  async stats(): Promise<RoleStatsResponse> {
    return apiRequest<RoleStatsResponse>('/roles/stats');
  },

  // Obter permissões de um role
  async getPermissions(
    roleId: string
  ): Promise<{ success: boolean; data: any[] }> {
    return apiRequest<{ success: boolean; data: any[] }>(
      `/roles/${roleId}/permissions`
    );
  },

  // Atualizar permissões de um role
  async updatePermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
    });
  },

  // Adicionar permissão a um role
  async addPermission(
    roleId: string,
    permissionId: string
  ): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/roles/${roleId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissionId }),
    });
  },

  // Remover permissão de um role
  async removePermission(
    roleId: string,
    permissionId: string
  ): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(
      `/roles/${roleId}/permissions/${permissionId}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Obter usuários de um role
  async getUsers(roleId: string): Promise<{ success: boolean; data: any[] }> {
    return apiRequest<{ success: boolean; data: any[] }>(
      `/roles/${roleId}/users`
    );
  },

  // Operações em lote
  async bulkUpdate(
    roleIds: string[],
    data: UpdateRoleRequest
  ): Promise<{ success: boolean; data: Role[] }> {
    return apiRequest<{ success: boolean; data: Role[] }>(
      '/roles/bulk-update',
      {
        method: 'POST',
        body: JSON.stringify({ roleIds, data }),
      }
    );
  },

  async bulkDelete(roleIds: string[]): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('/roles/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ roleIds }),
    });
  },

  async bulkDuplicate(
    roleIds: string[]
  ): Promise<{ success: boolean; data: Role[] }> {
    return apiRequest<{ success: boolean; data: Role[] }>(
      '/roles/bulk-duplicate',
      {
        method: 'POST',
        body: JSON.stringify({ roleIds }),
      }
    );
  },

  // Export/Import
  async export(
    params: { roleIds?: string[]; format?: string } = {}
  ): Promise<Blob> {
    const searchParams = new URLSearchParams();
    if (params.roleIds)
      searchParams.append('roleIds', params.roleIds.join(','));
    if (params.format) searchParams.append('format', params.format);

    const queryString = searchParams.toString();
    const endpoint = `/roles/export${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(getApiUrl(endpoint), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao exportar roles');
    }

    return response.blob();
  },

  async import(
    file: File
  ): Promise<{ success: boolean; imported: number; data: Role[] }> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<{ success: boolean; imported: number; data: Role[] }>(
      '/roles/import',
      {
        method: 'POST',
        body: formData,
      }
    );
  },
};
