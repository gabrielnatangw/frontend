// Tipos para sensores baseados na documentação da API
export interface Sensor {
  id: string;
  name: string;
  description?: string;
  sensorType?: number;
  measurementUnitId?: string;
  minScale?: number;
  maxScale?: number;
  minAlarm?: number;
  maxAlarm?: number;
  ix?: number;
  machineId?: string;
  machineName?: string;
  moduleId?: string;
  moduleName?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateSensorRequest {
  name: string;
  description?: string;
  sensorType?: number;
  measurementUnitId?: string;
  minScale?: number;
  maxScale?: number;
  minAlarm?: number;
  maxAlarm?: number;
  machineId?: string;
  moduleId?: string;
}

export interface UpdateSensorRequest {
  name?: string;
  description?: string;
  sensorType?: number;
  measurementUnitId?: string;
  minScale?: number;
  maxScale?: number;
  minAlarm?: number;
  maxAlarm?: number;
  machineId?: string;
  moduleId?: string;
}

export interface SensorStats {
  totalSensors: number;
  activeSensors: number;
  deletedSensors: number;
  sensorsByType: Record<string, number>;
  sensorsByMachine: Record<string, number>;
  sensorsByModule: Record<string, number>;
}

export interface ListSensorsParams {
  page?: number;
  limit?: number;
  sensorType?: number;
  machineId?: string;
  moduleId?: string;
  measurementUnitId?: string;
  isDeleted?: boolean;
}

export interface ListSensorsResponse {
  success: boolean;
  data: {
    sensors: Sensor[];
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

export interface SensorResponse {
  success: boolean;
  data: {
    sensor: Sensor;
  };
}

export interface SensorStatsResponse {
  success: boolean;
  data: {
    stats: SensorStats;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
