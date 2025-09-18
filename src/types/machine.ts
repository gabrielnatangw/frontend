// Tipos baseados na documentação real da API de máquinas
export interface Machine {
  id: string;
  operationalSector: string;
  name: string;
  manufacturer: string;
  serialNumber: string;
  yearOfManufacture: string;
  yearOfInstallation: string;
  maxPerformance: number;
  speedMeasureTech: number;
  tenantId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateMachineRequest {
  operationalSector: string;
  name: string;
  manufacturer: string;
  serialNumber: string;
  yearOfManufacture: string;
  yearOfInstallation: string;
  maxPerformance: number;
  speedMeasureTech: number;
}

export interface UpdateMachineRequest {
  operationalSector?: string;
  name?: string;
  manufacturer?: string;
  serialNumber?: string;
  yearOfManufacture?: string;
  yearOfInstallation?: string;
  maxPerformance?: number;
  speedMeasureTech?: number;
}

export interface MachineStats {
  totalMachines: number;
  activeMachines: number;
  deletedMachines: number;
  machinesBySector: Record<string, number>;
  machinesByManufacturer: Record<string, number>;
}

export interface ListMachinesParams {
  page?: number;
  limit?: number;
  operationalSector?: string;
  name?: string;
  manufacturer?: string;
  isDeleted?: boolean;
}

export interface ListMachinesResponse {
  success: boolean;
  data: {
    machines: Machine[];
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

export interface MachineResponse {
  success: boolean;
  data: Machine;
}

export interface MachineStatsResponse {
  success: boolean;
  data: MachineStats;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
