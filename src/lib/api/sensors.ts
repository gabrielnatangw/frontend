import { apiRequest } from './config';
import type {
  ListSensorsParams,
  CreateSensorRequest,
  UpdateSensorRequest,
  ListSensorsResponse,
  SensorResponse,
  SensorStatsResponse,
} from '../../types/sensor';

export const sensorsApi = {
  // Listar sensores com paginação e filtros
  async list(params: ListSensorsParams = {}): Promise<ListSensorsResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sensorType !== undefined)
      searchParams.append('sensorType', params.sensorType.toString());
    if (params.machineId) searchParams.append('machineId', params.machineId);
    if (params.moduleId) searchParams.append('moduleId', params.moduleId);
    if (params.measurementUnitId)
      searchParams.append('measurementUnitId', params.measurementUnitId);
    if (params.isDeleted !== undefined)
      searchParams.append('isDeleted', params.isDeleted.toString());

    const queryString = searchParams.toString();
    const endpoint = `/sensors${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  },

  // Buscar sensor por ID
  async get(id: string): Promise<SensorResponse> {
    return apiRequest(`/sensors/${id}`);
  },

  // Criar novo sensor
  async create(data: CreateSensorRequest): Promise<SensorResponse> {
    return apiRequest('/sensors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar sensor existente
  async update(id: string, data: UpdateSensorRequest): Promise<SensorResponse> {
    if (!id || id === 'undefined') {
      throw new Error('ID do sensor é obrigatório para atualização');
    }

    console.log('🔧 Atualizando sensor:', { id, data });
    return apiRequest(`/sensors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar sensor (soft delete)
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/sensors/${id}`, {
      method: 'DELETE',
    });
  },

  // Restaurar sensor deletado
  async restore(id: string): Promise<SensorResponse> {
    return apiRequest(`/sensors/${id}/restore`, {
      method: 'POST',
    });
  },

  // Buscar estatísticas de sensores
  async getStats(): Promise<SensorStatsResponse> {
    return apiRequest('/sensors/stats');
  },

  // Buscar sensores por tipo
  async getByType(sensorType: number): Promise<ListSensorsResponse> {
    return apiRequest(`/sensors/by-type/${sensorType}`);
  },

  // Buscar sensores por máquina
  async getByMachine(machineId: string): Promise<ListSensorsResponse> {
    return apiRequest(`/sensors/by-machine/${machineId}`);
  },

  // Buscar sensores por módulo
  async getByModule(moduleId: string): Promise<ListSensorsResponse> {
    return apiRequest(`/sensors/by-module/${moduleId}`);
  },

  // Buscar sensores por unidade de medida
  async getByMeasurementUnit(
    measurementUnitId: string
  ): Promise<ListSensorsResponse> {
    return apiRequest(`/sensors/by-measurement-unit/${measurementUnitId}`);
  },

  // Buscar sensores ativos (não deletados)
  async getActive(): Promise<ListSensorsResponse> {
    return apiRequest('/sensors/active');
  },

  // Buscar sensores deletados
  async getDeleted(): Promise<ListSensorsResponse> {
    return apiRequest('/sensors/deleted');
  },
};
