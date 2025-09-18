import { apiRequest } from './config';
import type {
  ListModulesParams,
  CreateModuleRequest,
  UpdateModuleRequest,
  ListModulesResponse,
  ModuleResponse,
  ModuleStatsResponse,
} from '../../types/module';

export const modulesApi = {
  // Listar módulos com paginação e filtros
  async list(params: ListModulesParams = {}): Promise<ListModulesResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sector) searchParams.append('sector', params.sector);
    if (params.customer) searchParams.append('customer', params.customer);
    if (params.country) searchParams.append('country', params.country);
    if (params.machineId) searchParams.append('machineId', params.machineId);
    if (params.isDeleted !== undefined)
      searchParams.append('isDeleted', params.isDeleted.toString());

    const queryString = searchParams.toString();
    const endpoint = `/modules${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  },

  // Buscar módulo por ID
  async get(id: string): Promise<ModuleResponse> {
    return apiRequest(`/modules/${id}`);
  },

  // Criar novo módulo
  async create(data: CreateModuleRequest): Promise<ModuleResponse> {
    return apiRequest('/modules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar módulo existente
  async update(id: string, data: UpdateModuleRequest): Promise<ModuleResponse> {
    return apiRequest(`/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar módulo (soft delete)
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/modules/${id}`, {
      method: 'DELETE',
    });
  },

  // Restaurar módulo deletado
  async restore(id: string): Promise<ModuleResponse> {
    return apiRequest(`/modules/${id}/restore`, {
      method: 'POST',
    });
  },

  // Buscar estatísticas de módulos
  async getStats(): Promise<ModuleStatsResponse> {
    return apiRequest('/modules/stats');
  },

  // Buscar módulos por setor
  async getBySector(sector: string): Promise<ListModulesResponse> {
    return apiRequest(`/modules/by-sector/${sector}`);
  },

  // Buscar módulos por cliente
  async getByCustomer(customer: string): Promise<ListModulesResponse> {
    return apiRequest(`/modules/by-customer/${customer}`);
  },

  // Buscar módulos por país
  async getByCountry(country: string): Promise<ListModulesResponse> {
    return apiRequest(`/modules/by-country/${country}`);
  },

  // Buscar módulos por máquina
  async getByMachine(machineId: string): Promise<ListModulesResponse> {
    return apiRequest(`/modules/by-machine/${machineId}`);
  },

  // Buscar módulos ativos (não deletados)
  async getActive(): Promise<ListModulesResponse> {
    return apiRequest('/modules/active');
  },

  // Buscar módulos deletados
  async getDeleted(): Promise<ListModulesResponse> {
    return apiRequest('/modules/deleted');
  },
};
