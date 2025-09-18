// Tipos baseados na documentação da User API
export interface User {
  id: string;
  name: string;
  email: string;
  accessType: 'ADMIN' | 'USER' | 'MANAGER' | 'OPERATOR';
  userType: 'ADMIN' | 'STANDARD';
  firstLogin: boolean;
  isActive: boolean;
  status: 'active' | 'inactive';
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted: boolean;
  avatar?: string;
  lastLogin?: string;
  notes?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  accessType: 'ADMIN' | 'USER' | 'MANAGER' | 'OPERATOR';
  userType: 'ADMIN' | 'STANDARD';
  firstLogin?: boolean;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  accessType?: 'ADMIN' | 'USER' | 'MANAGER' | 'OPERATOR';
  userType?: 'ADMIN' | 'STANDARD';
  isActive?: boolean;
  firstLogin?: boolean;
  notes?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SetPasswordRequest {
  newPassword: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  newToday: number;
  admins: number;
  firstLogin: number;
  byTenant: Array<{
    tenantId: string;
    count: number;
  }>;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  accessType?: 'ADMIN' | 'USER' | 'MANAGER' | 'OPERATOR';
  userType?: 'ADMIN' | 'STANDARD';
  isActive?: boolean;
  firstLogin?: boolean;
  tenantId?: string;
  isDeleted?: boolean;
}

export interface ListUsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
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

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
