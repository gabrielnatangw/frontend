import { apiRequest } from './config';
import type { ApplicationsResponse } from '../../types/user-new';

export const applicationsApi = {
  // Listar todas as aplicações disponíveis
  async list(): Promise<ApplicationsResponse> {
    return apiRequest('/applications');
  },

  // Buscar aplicação por ID
  async get(applicationId: string) {
    return apiRequest(`/applications/${applicationId}`);
  },
};
