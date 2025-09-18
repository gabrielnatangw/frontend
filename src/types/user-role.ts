// Tipos para relacionamentos entre usuários e roles
export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
  user?: User;
  role?: Role;
}

export interface CreateUserRoleRequest {
  userId: string;
  roleId: string;
}

export interface UpdateUserRoleRequest {
  isActive?: boolean;
}

export interface ListUserRolesParams {
  page?: number;
  limit?: number;
  userId?: string;
  roleId?: string;
  isActive?: boolean;
  tenantId?: string;
  search?: string;
}

export interface ListUserRolesResponse {
  success: boolean;
  data: {
    userRoles: UserRole[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UserRoleResponse {
  success: boolean;
  data: UserRole;
}

export interface UserRoleStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{
    roleId: string;
    roleName: string;
    userCount: number;
  }>;
  byUser: Array<{
    userId: string;
    userName: string;
    roleCount: number;
  }>;
}

export interface UserRoleStatsResponse {
  success: boolean;
  data: UserRoleStats;
}

// Importar tipos necessários
import type { User } from './user';
import type { Role } from './role';
