export interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateTenantRequest {
  name: string;
  cnpj: string;
  address: string;
  isActive?: boolean;
}

export interface AdminUser {
  name: string;
  email: string;
  password: string;
  accessType: 'ADMIN';
}

export interface CreateTenantWithAdminRequest {
  name: string;
  cnpj: string;
  address: string;
  isActive: boolean;
  adminUser: AdminUser;
}

export interface UpdateTenantRequest {
  name?: string;
  domain?: string;
  isActive?: boolean;
}

export interface TenantResponse {
  success: boolean;
  data: Tenant;
  message?: string;
}

export interface TenantsResponse {
  success: boolean;
  data: {
    tenants: Tenant[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}
