// Configuração centralizada da API
export const API_CONFIG = {
  // URL base da API - ajustar para o backend correto
  BASE_URL: 'https://smart-platform.io:8443/api-v2', // URL local para desenvolvimento

  // Timeout padrão para requisições (em ms)
  TIMEOUT: 10000,

  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },

  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
    MODULES: {
      LIST: '/modules',
      CREATE: '/modules',
      GET: (id: string) => `/modules/${id}`,
      UPDATE: (id: string) => `/modules/${id}`,
      DELETE: (id: string) => `/modules/${id}`,
      ASSIGN: (id: string) => `/modules/${id}/assign`,
      UNASSIGN: (id: string) => `/modules/${id}/unassign`,
      RESTORE: (id: string) => `/modules/${id}/restore`,
      BY_MACHINE: (machineId: string) => `/modules/by-machine/${machineId}`,
      STATS: '/modules/stats',
    },
    SENSORS: {
      LIST: '/sensors',
      CREATE: '/sensors',
      GET: (id: string) => `/sensors/${id}`,
      UPDATE: (id: string) => `/sensors/${id}`,
      DELETE: (id: string) => `/sensors/${id}`,
      RESTORE: (id: string) => `/sensors/${id}/restore`,
      BY_MODULE: (moduleId: string) => `/sensors/by-module/${moduleId}`,
      BY_MEASUREMENT_UNIT: (measurementUnitId: string) =>
        `/sensors/by-measurement-unit/${measurementUnitId}`,
      STATS: '/sensors/stats',
    },
  },
} as const;

// Função para obter URL completa do endpoint
export function getApiUrl(endpoint: string): string {
  const url = `${API_CONFIG.BASE_URL}/api${endpoint}`;
  return url;
}

// Função auxiliar para fazer requisições à API
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);

  console.log('🌐 API Request:', {
    endpoint,
    url,
    method: options.method || 'GET',
    headers: options.headers,
  });

  // Log específico para chamadas de permissions (debug)
  if (endpoint.includes('permissions') && !endpoint.includes('applicationId')) {
    console.warn('⚠️ Chamada de permissions sem applicationId detectada:', {
      endpoint,
      url,
      stackTrace: new Error().stack,
    });
  }

  // Obter token do store de autenticação
  let accessToken: string | null = null;
  let tenantId: string | null = null;

  // Verificar se estamos no browser
  if (typeof window !== 'undefined') {
    try {
      // Importar dinamicamente para evitar problemas de SSR
      const { useAuthStore } = await import('../stores/auth-store');
      const { extractTenantIdFromToken } = await import('../utils/jwt');

      const authState = useAuthStore.getState();
      accessToken = authState.accessToken;

      // Extrair tenant ID do token JWT
      if (accessToken) {
        tenantId = extractTenantIdFromToken(accessToken);
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível obter dados de autenticação:', error);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // Adicionar token de autorização se disponível
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        // Adicionar tenant ID se disponível
        ...(tenantId && { 'X-Tenant-ID': tenantId }),
        ...options.headers,
      },
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();

      return data;
    } else {
      console.error(
        '❌ Erro na resposta:',
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.error('❌ Corpo do erro:', errorText);

      // Se for erro 401, fazer logout automático
      if (response.status === 401) {
        // Importar e executar logout
        try {
          const { useAuthStore } = await import('../stores/auth-store');
          // const { useQueryClient } = await import('@tanstack/react-query');

          // Fazer logout
          useAuthStore.getState().logout();

          // Limpar cache do React Query
          // queryClient.clear(); // Comentado pois não podemos usar hook fora de componente

          // Redirecionar para login
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.includes('/auth/login')
          ) {
            window.location.href = '/auth/login';
          }
        } catch (importError) {
          console.error('Erro ao importar módulos para logout:', importError);
        }
      }

      // Criar erro com propriedade status para o interceptor detectar
      const error = new Error(
        `Erro ${response.status}: ${response.statusText}`
      ) as Error & { status: number; response?: Response };
      error.status = response.status;
      error.response = response;
      throw error;
    }
  } catch (error) {
    clearTimeout(timeoutId);

    console.error('💥 Erro na requisição:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout da requisição');
    }

    throw error;
  }
}
