// Tipos para módulos baseados na documentação da API
export interface Module {
  id: string;
  customer: string;
  sector: string;
  country: string;
  city: string;
  blueprint: string;
  machineId?: string;
  machineName?: string;
  tenantId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateModuleRequest {
  customer: string;
  sector: string;
  country: string;
  city: string;
  blueprint: string;
  machineName: string;
  machineId?: string;
}

export interface UpdateModuleRequest {
  customer?: string;
  sector?: string;
  country?: string;
  city?: string;
  blueprint?: string;
  machineName?: string;
  machineId?: string;
}

export interface ModuleStats {
  totalModules: number;
  activeModules: number;
  deletedModules: number;
  modulesBySector: Record<string, number>;
  modulesByCountry: Record<string, number>;
}

export interface ListModulesParams {
  page?: number;
  limit?: number;
  sector?: string;
  customer?: string;
  country?: string;
  machineId?: string;
  isDeleted?: boolean;
}

export interface ListModulesResponse {
  success: boolean;
  data: {
    modules: Module[];
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

export interface ModuleResponse {
  success: boolean;
  data: {
    module: Module;
  };
}

export interface ModuleStatsResponse {
  success: boolean;
  stats: ModuleStats;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
