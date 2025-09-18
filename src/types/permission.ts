// Tipos para gerenciamento de permissões
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  resource: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  module: string;
  action: string;
  resource: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  module?: string;
  action?: string;
  resource?: string;
  isActive?: boolean;
}

export interface ListPermissionsParams {
  page?: number;
  limit?: number;
  name?: string;
  module?: string;
  action?: string;
  resource?: string;
  isActive?: boolean;
  tenantId?: string;
  search?: string;
}

export interface ListPermissionsResponse {
  success: boolean;
  data: {
    permissions: Permission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PermissionResponse {
  success: boolean;
  data: Permission;
}

export interface PermissionStats {
  total: number;
  active: number;
  inactive: number;
  byModule: Array<{
    module: string;
    count: number;
  }>;
  byAction: Array<{
    action: string;
    count: number;
  }>;
  mostUsed: Array<{
    permissionId: string;
    permissionName: string;
    roleCount: number;
  }>;
}

export interface PermissionStatsResponse {
  success: boolean;
  data: PermissionStats;
}

// Módulos disponíveis no sistema
export const PERMISSION_MODULES = {
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  SENSORS: 'sensors',
  MACHINES: 'machines',
  MODULES: 'modules',
  VIEWS: 'views',
  DASHBOARDS: 'dashboards',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  AUDIT: 'audit',
} as const;

// Ações disponíveis
export const PERMISSION_ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  ASSIGN: 'assign',
  EXPORT: 'export',
  IMPORT: 'import',
} as const;

// Recursos disponíveis
export const PERMISSION_RESOURCES = {
  ALL: 'all',
  OWN: 'own',
  TENANT: 'tenant',
} as const;
