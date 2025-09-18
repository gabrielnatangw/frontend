import { apiRequest } from './config';
import type {
  PermissionCheckResponse,
  UserPermissionsResponse,
  UserPermissionsByFunctionResponse,
} from '../../types/user-new';

export const userPermissionsApi = {
  // Listar todas as aplicações
  async getApplications() {
    return apiRequest('/applications');
  },

  // Listar permissões por aplicação
  async getPermissionsByApplication(applicationId: string) {
    console.log('📞 getPermissionsByApplication chamado com:', applicationId);

    if (!applicationId) {
      console.error('❌ Application ID vazio!');
      throw new Error('Application ID is required');
    }

    const endpoint = `/permissions?applicationId=${applicationId}`;
    console.log('📡 Endpoint final:', endpoint);

    return apiRequest(endpoint);
  },

  // Verificar se usuário tem permissão específica
  async checkPermission(
    userId: string,
    functionName: string,
    permissionLevel: string
  ): Promise<PermissionCheckResponse> {
    return apiRequest(
      `/user-permissions/user/${userId}/check?functionName=${functionName}&permissionLevel=${permissionLevel}`
    );
  },

  // Obter todas as permissões de um usuário
  async getUserPermissions(userId: string): Promise<UserPermissionsResponse> {
    return apiRequest(`/user-permissions/user/${userId}`);
  },

  // Obter permissões agrupadas por função
  async getUserPermissionsByFunction(
    userId: string
  ): Promise<UserPermissionsByFunctionResponse> {
    return apiRequest(`/user-permissions/user/${userId}/by-function`);
  },

  // Conceder permissão
  async grantPermission(data: {
    userId: string;
    permissionId: string;
    grantedBy?: string;
  }): Promise<{ success: boolean }> {
    return apiRequest('/user-permissions/grant', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Revogar permissão
  async revokePermission(data: {
    userId: string;
    permissionId: string;
  }): Promise<{ success: boolean }> {
    return apiRequest('/user-permissions/revoke', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Definir todas as permissões (substitui existentes)
  async setUserPermissions(
    userId: string,
    permissionIds: string[]
  ): Promise<{ success: boolean }> {
    return apiRequest(`/user-permissions/user/${userId}/set`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
    });
  },

  // Verificar se pode gerenciar outro usuário
  async canManageUser(
    currentUserId: string,
    targetUserId: string
  ): Promise<{ success: boolean; data: { canManage: boolean } }> {
    return apiRequest(
      `/user-permissions/can-manage-user/${currentUserId}/${targetUserId}`
    );
  },

  // Verificar acesso a tenant
  async canAccessTenant(
    userId: string,
    tenantId: string
  ): Promise<{ success: boolean; data: { canAccess: boolean } }> {
    return apiRequest(
      `/user-permissions/can-access-tenant/${userId}/${tenantId}`
    );
  },
};
