import { apiRequest } from './config';

export interface AuditLog {
  id: string;
  type: string;
  title: string;
  description: string;
  user: string;
  userEmail: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'warning' | 'error';
  severity: 'info' | 'warning' | 'error';
  details?: Record<string, any>;
}

export interface ListAuditLogsParams {
  search?: string;
  type?: string;
  date?: string;
  page?: number;
  limit?: number;
  userId?: string;
  severity?: string;
}

export interface ListAuditLogsResponse {
  success: boolean;
  data: {
    logs: AuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLog;
}

export interface AuditStatsResponse {
  success: boolean;
  data: {
    total: number;
    today: number;
    warnings: number;
    errors: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

export const auditLogsApi = {
  // Listar logs de auditoria com filtros e paginação
  async list(params: ListAuditLogsParams = {}): Promise<ListAuditLogsResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.type) searchParams.append('type', params.type);
    if (params.date) searchParams.append('date', params.date);
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.severity) searchParams.append('severity', params.severity);

    const queryString = searchParams.toString();
    const endpoint = `/audit-logs${queryString ? `?${queryString}` : ''}`;

    return apiRequest<ListAuditLogsResponse>(endpoint);
  },

  // Buscar log específico
  async get(id: string): Promise<AuditLogResponse> {
    return apiRequest<AuditLogResponse>(`/audit-logs/${id}`);
  },

  // Obter estatísticas de auditoria
  async stats(): Promise<AuditStatsResponse> {
    return apiRequest<AuditStatsResponse>('/audit-logs/stats');
  },

  // Exportar logs
  async export(
    params: {
      type?: string;
      date?: string;
      format?: string;
    } = {}
  ): Promise<Blob> {
    const searchParams = new URLSearchParams();
    if (params.type) searchParams.append('type', params.type);
    if (params.date) searchParams.append('date', params.date);
    if (params.format) searchParams.append('format', params.format);

    const queryString = searchParams.toString();
    const endpoint = `/audit-logs/export${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(
      `https://smart-platform.io:8443/api-v2/${endpoint}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao exportar logs de auditoria');
    }

    return response.blob();
  },
};
