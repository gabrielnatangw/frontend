// Tipos para integração completa de usuários baseado em INTEGRACAO_USUARIOS.md

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'root' | 'admin' | 'user';
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  firstLogin?: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  userType: 'user' | 'admin';
  isActive?: boolean;
  notes?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  isActive?: boolean;
  notes?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  users: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
}

export interface ResetPasswordRequest {
  newPassword?: string;
  sendEmail?: boolean;
}

export interface UserPermission {
  id: string;
  userId: string;
  permissionId: string;
  grantedAt: string;
  grantedBy: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissionsResponse {
  success: boolean;
  data: {
    permissions: UserPermission[];
    availablePermissions: Permission[];
  };
}

export interface UserRolesResponse {
  success: boolean;
  data: {
    roles: UserRole[];
    availableRoles: Role[];
  };
}

export interface GrantPermissionsRequest {
  permissionIds: string[];
}

export interface RevokePermissionsRequest {
  permissionIds: string[];
}

export interface AssignRolesRequest {
  roleIds: string[];
}

export interface RemoveRolesRequest {
  roleIds: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: 'root' | 'admin' | 'user';
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  firstLogin?: boolean;
  permissions: Permission[];
  roles: Role[];
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
}

// Filtros para busca de usuários
export interface UserFilters {
  page?: number;
  limit?: number;
  userType?: 'root' | 'admin' | 'user';
  isActive?: boolean;
  search?: string;
  tenantId?: string;
}

// Operações de ativação/desativação
export interface UserStatusResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    isActive: boolean;
    updatedAt: string;
  };
}

// Operações de restauração
export interface RestoreUserResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    restoredAt: string;
  };
}

// Busca por email
export interface UserByEmailResponse {
  success: boolean;
  data: User | null;
}

// Busca por tenant
export interface UsersByTenantResponse {
  success: boolean;
  data: {
    users: User[];
    tenantId: string;
    total: number;
  };
}
