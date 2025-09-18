import { apiRequest } from './config';
import type {
  ListMeasurementUnitsParams,
  CreateMeasurementUnitRequest,
  UpdateMeasurementUnitRequest,
  ListMeasurementUnitsResponse,
  MeasurementUnitResponse,
  CreateMeasurementUnitResponse,
  UpdateMeasurementUnitResponse,
  RestoreMeasurementUnitResponse,
  DeleteMeasurementUnitResponse,
  MeasurementUnitStatsResponse,
} from '../../types/measurement-unit';

export const measurementUnitsApi = {
  // Listar unidades de medida com paginação e filtros
  async list(
    params: ListMeasurementUnitsParams = {}
  ): Promise<ListMeasurementUnitsResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params.isDeleted !== undefined)
      searchParams.append('isDeleted', params.isDeleted.toString());
    if (params.label) searchParams.append('label', params.label);
    if (params.unitSymbol) searchParams.append('unitSymbol', params.unitSymbol);

    const queryString = searchParams.toString();
    const endpoint = `/measurement-units${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  },

  // Buscar unidade de medida por ID
  async get(id: string): Promise<MeasurementUnitResponse> {
    return apiRequest(`/measurement-units/${id}`);
  },

  // Criar nova unidade de medida
  async create(
    data: CreateMeasurementUnitRequest
  ): Promise<CreateMeasurementUnitResponse> {
    return apiRequest('/measurement-units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar unidade de medida existente
  async update(
    id: string,
    data: UpdateMeasurementUnitRequest
  ): Promise<UpdateMeasurementUnitResponse> {
    return apiRequest(`/measurement-units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar unidade de medida (soft delete)
  async delete(id: string): Promise<DeleteMeasurementUnitResponse> {
    return apiRequest(`/measurement-units/${id}`, {
      method: 'DELETE',
    });
  },

  // Restaurar unidade de medida deletada
  async restore(id: string): Promise<RestoreMeasurementUnitResponse> {
    return apiRequest(`/measurement-units/${id}/restore`, {
      method: 'PATCH',
    });
  },

  // Buscar estatísticas de unidades de medida
  async getStats(): Promise<MeasurementUnitStatsResponse> {
    return apiRequest('/measurement-units/stats');
  },

  // Buscar unidades de medida por tenant
  async getByTenant(tenantId: string): Promise<ListMeasurementUnitsResponse> {
    return apiRequest(`/measurement-units/by-tenant/${tenantId}`);
  },

  // Buscar unidades de medida ativas (não deletadas)
  async getActive(): Promise<ListMeasurementUnitsResponse> {
    return apiRequest('/measurement-units/active');
  },

  // Buscar unidades de medida deletadas
  async getDeleted(): Promise<ListMeasurementUnitsResponse> {
    return apiRequest('/measurement-units/deleted');
  },
};
