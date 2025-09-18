import { apiRequest, getApiUrl } from './config';
import type {
  View,
  CreateViewRequest,
  UpdateViewRequest,
  ListViewsParams,
  ListViewsResponse,
  MyViewsCompleteResponse,
  ViewResponse,
  ViewStatsResponse,
  SensorCurrentValue,
  UpdateSensorCurrentData,
} from '../../types/view';

// API para dados de sensores
export const sensorDataApi = {
  async getCurrentData(
    sensorId: string
  ): Promise<{ data: SensorCurrentValue }> {
    return apiRequest<{ data: SensorCurrentValue }>(
      `/sensors/${sensorId}/current-data`
    );
  },

  async updateCurrentData(
    data: UpdateSensorCurrentData
  ): Promise<{ data: SensorCurrentValue }> {
    return apiRequest<{ data: SensorCurrentValue }>(
      `/sensors/${data.sensorId}/current-data`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },
};

export const viewsApi = {
  // Listar views
  async list(params: ListViewsParams = {}): Promise<ListViewsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.permission) searchParams.append('permission', params.permission);
    if (params.isPublic !== undefined)
      searchParams.append('isPublic', params.isPublic.toString());

    const queryString = searchParams.toString();
    const endpoint = `/views${queryString ? `?${queryString}` : ''}`;
    return apiRequest<ListViewsResponse>(endpoint);
  },

  // Listar views completas (com cards)
  async listComplete(
    params: ListViewsParams = {}
  ): Promise<MyViewsCompleteResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.permission) searchParams.append('permission', params.permission);
    if (params.isPublic !== undefined)
      searchParams.append('isPublic', params.isPublic.toString());
    if (params.my) searchParams.append('my', 'true');

    const queryString = searchParams.toString();
    const endpoint = `/views/my/complete${queryString ? `?${queryString}` : ''}`;
    return apiRequest<MyViewsCompleteResponse>(endpoint);
  },

  // Buscar view por ID
  async get(id: string): Promise<ViewResponse> {
    return apiRequest<ViewResponse>(`/views/${id}`);
  },

  // Criar view
  async create(data: CreateViewRequest): Promise<ViewResponse> {
    return apiRequest<ViewResponse>('/views', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar view
  async update(id: string, data: UpdateViewRequest): Promise<ViewResponse> {
    return apiRequest<ViewResponse>(`/views/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar view
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/views/${id}`, {
      method: 'DELETE',
    });
  },

  // Compartilhar view
  async share(
    id: string,
    data: { userIds: string[]; permission: string; isPublic: boolean }
  ): Promise<ViewResponse> {
    return apiRequest<ViewResponse>(`/views/${id}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar permissões da view
  async updatePermissions(
    id: string,
    data: { permissionIds: string[] }
  ): Promise<ViewResponse> {
    return apiRequest<ViewResponse>(`/views/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Estatísticas de views
  async stats(): Promise<ViewStatsResponse> {
    return apiRequest<ViewStatsResponse>('/views/stats');
  },

  // Duplicar view
  async duplicate(id: string, name?: string): Promise<ViewResponse> {
    return apiRequest<ViewResponse>(`/views/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  // Exportar views
  async export(
    params: { viewIds?: string[]; format?: string } = {}
  ): Promise<Blob> {
    const searchParams = new URLSearchParams();
    if (params.viewIds)
      searchParams.append('viewIds', params.viewIds.join(','));
    if (params.format) searchParams.append('format', params.format);

    const queryString = searchParams.toString();
    const endpoint = `/views/export${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(getApiUrl(endpoint), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao exportar views');
    }

    return response.blob();
  },

  // Importar views
  async import(
    file: File
  ): Promise<{ success: boolean; imported: number; data: View[] }> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<{ success: boolean; imported: number; data: View[] }>(
      '/views/import',
      {
        method: 'POST',
        body: formData,
      }
    );
  },
};

// API para View Cards
export const viewCardsApi = {
  // Adicionar card a uma view
  async addCard(viewId: string, data: any): Promise<any> {
    return apiRequest(`/views/${viewId}/cards`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar card
  async updateCard(cardId: string, data: any): Promise<any> {
    return apiRequest(`/view-cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Remover card
  async removeCard(cardId: string): Promise<any> {
    return apiRequest(`/view-cards/${cardId}`, {
      method: 'DELETE',
    });
  },

  // Atualizar posições dos cards
  async updateCardPositions(viewId: string, data: any): Promise<any> {
    return apiRequest(`/views/cards/positions`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
