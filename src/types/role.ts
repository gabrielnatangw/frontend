// Tipos para gerenciamento de roles
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: any[]; // Será tipado corretamente quando importar Permission
  isActive: boolean;
  isSystem: boolean; // Role do sistema (não pode ser deletado)
  tenantId: string;
  userCount: number; // Número de usuários com este role
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
}

export interface ListRolesParams {
  page?: number;
  limit?: number;
  name?: string;
  description?: string;
  isActive?: boolean;
  isSystem?: boolean;
  tenantId?: string;
  search?: string;
}

export interface ListRolesResponse {
  success: boolean;
  data: {
    roles: Role[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface RoleResponse {
  success: boolean;
  data: Role;
}

export interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  system: number;
  custom: number;
  byModule: Array<{
    module: string;
    count: number;
  }>;
  mostUsed: Array<{
    roleId: string;
    roleName: string;
    userCount: number;
  }>;
}

export interface RoleStatsResponse {
  success: boolean;
  data: RoleStats;
}
