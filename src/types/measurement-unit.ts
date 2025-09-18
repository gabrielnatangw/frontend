// Tipos para unidades de medida baseados na documentação da API
export interface MeasurementUnit {
  id: string;
  label: string;
  unitSymbol: string;
  tenantId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateMeasurementUnitRequest {
  label: string;
  unitSymbol: string;
}

export interface UpdateMeasurementUnitRequest {
  label?: string;
  unitSymbol?: string;
}

export interface MeasurementUnitStats {
  total: number;
  active: number;
  deleted: number;
  byTenant: Array<{
    tenantId: string;
    count: number;
  }>;
}

export interface ListMeasurementUnitsParams {
  page?: number;
  limit?: number;
  tenantId?: string;
  isDeleted?: boolean;
  label?: string;
  unitSymbol?: string;
}

export interface ListMeasurementUnitsResponse {
  success: boolean;
  data: {
    measurementUnits: MeasurementUnit[];
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

export interface MeasurementUnitResponse {
  success: boolean;
  message?: string;
  data: MeasurementUnit;
}

export interface CreateMeasurementUnitResponse {
  id: string;
  label: string;
  unitSymbol: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted: boolean;
}

export interface UpdateMeasurementUnitResponse {
  success: boolean;
  message: string;
  data: MeasurementUnit;
}

export interface RestoreMeasurementUnitResponse {
  success: boolean;
  message: string;
}

export interface DeleteMeasurementUnitResponse {
  success: boolean;
  message: string;
}

export interface MeasurementUnitStatsResponse {
  success: boolean;
  data: MeasurementUnitStats;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
