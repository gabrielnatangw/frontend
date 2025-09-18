import { apiRequest } from './config';
import type {
  CreateMachineRequest,
  UpdateMachineRequest,
  ListMachinesParams,
  ListMachinesResponse,
  MachineResponse,
  MachineStatsResponse,
} from '../../types/machine';

export const machinesApi = {
  // Listar máquinas
  list: (params?: ListMachinesParams) =>
    apiRequest<ListMachinesResponse>('/machines', {
      method: 'GET',
      ...(params && { body: JSON.stringify(params) }),
    }),

  // Obter uma máquina específica
  get: (id: string) =>
    apiRequest<MachineResponse>(`/machines/${id}`, {
      method: 'GET',
    }),

  // Criar máquina
  create: (data: CreateMachineRequest) =>
    apiRequest<MachineResponse>('/machines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Atualizar máquina
  update: (id: string, data: UpdateMachineRequest) =>
    apiRequest<MachineResponse>(`/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Deletar máquina
  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/machines/${id}`, {
      method: 'DELETE',
    }),

  // Restaurar máquina
  restore: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(
      `/machines/${id}/restore`,
      {
        method: 'POST',
      }
    ),

  // Estatísticas de máquinas
  stats: () =>
    apiRequest<MachineStatsResponse>('/machines/stats', {
      method: 'GET',
    }),
};
