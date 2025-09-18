// Tipos atualizados conforme o novo sistema de permissões granular
export interface User {
  userId: string;
  email: string;
  tenantId?: string;
  userType: 'root' | 'admin' | 'user';
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Application {
  applicationId: string;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationsResponse {
  success: boolean;
  data: {
    applications: Application[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserPermission {
  id: string;
  userId: string;
  permissionId: string;
  granted: boolean;
  grantedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  functionName: string;
  permissionLevel: 'read' | 'write' | 'update' | 'delete';
  description?: string;
}

export interface UserPermissionsByFunction {
  [functionName: string]: string[]; // { "users": ["read", "write"], "sensors": ["read"] }
}

export interface PermissionCheckResponse {
  success: boolean;
  data: {
    hasPermission: boolean;
    userId: string;
    functionName: string;
    permissionLevel: string;
  };
}

export interface UserPermissionsResponse {
  success: boolean;
  data: UserPermission[];
}

export interface UserPermissionsByFunctionResponse {
  success: boolean;
  data: UserPermissionsByFunction;
}
