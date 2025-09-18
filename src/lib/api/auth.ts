import { API_CONFIG, getApiUrl } from './config';
import type {
  LoginRequest,
  ResetPasswordRequest,
  FirstLoginRequest,
  AuthResponse,
  VerifyResponse,
  SessionsResponse,
  SimpleResponse,
} from '../schemas/auth';

// Função auxiliar para fazer requisições
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = getApiUrl(endpoint);

    const defaultHeaders = {
      ...API_CONFIG.DEFAULT_HEADERS,
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || `Erro ${response.status}`;

      // Log detalhado para debug
      console.error('Auth API request failed:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorData: data,
        endpoint,
      });

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Log detalhado para debug
    console.error('Auth API request failed:', {
      endpoint,
      error: error instanceof Error ? error.message : error,
      options,
    });

    // Se for erro de rede (Failed to fetch), mostrar mensagem amigável
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error(
        'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
      );
    }

    // Se for erro de timeout ou conexão
    if (
      error instanceof Error &&
      (error.message.includes('timeout') || error.message.includes('network'))
    ) {
      throw new Error(
        'Conexão lenta ou instável. Tente novamente em alguns instantes.'
      );
    }

    // Para outros erros, manter a mensagem original se for amigável
    if (error instanceof Error && !error.message.includes('HTTP error')) {
      throw error;
    }

    // Erro genérico para casos não tratados
    throw new Error('Ocorreu um erro inesperado. Tente novamente.');
  }
}

// Função para obter headers com autenticação (comentada - não utilizada)
// function getAuthHeaders(accessToken?: string | null): Record<string, string> {
//   const token =
//     accessToken ||
//     (typeof window !== 'undefined'
//       ? localStorage.getItem('accessToken')
//       : null);
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// Serviços de autenticação
export const authApi = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
  },

  // Logout
  async logout(
    accessToken: string,
    refreshToken: string
  ): Promise<SimpleResponse> {
    return apiRequest<SimpleResponse>('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
  },

  // Verificar token
  async verifyToken(accessToken: string): Promise<VerifyResponse> {
    return apiRequest<VerifyResponse>('/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  // Solicitar reset de senha
  async forgotPassword(email: string): Promise<SimpleResponse> {
    return apiRequest<SimpleResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset de senha
  async resetPassword(data: ResetPasswordRequest): Promise<SimpleResponse> {
    return apiRequest<SimpleResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Primeiro login
  async firstLogin(data: FirstLoginRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/first-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Listar sessões
  async getSessions(accessToken: string): Promise<SessionsResponse> {
    return apiRequest<SessionsResponse>('/auth/sessions', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  // Encerrar sessão
  async endSession(
    accessToken: string,
    sessionId: string
  ): Promise<SimpleResponse> {
    return apiRequest<SimpleResponse>(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  // Buscar dados do usuário atual
  async getMe(accessToken: string): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      userType: string;
      tenantId: string;
      firstLogin: boolean;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    tenant: {
      id: string;
      name: string;
      cnpj: string;
      address: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string | null;
    };
  }> {
    return apiRequest<{
      user: {
        id: string;
        name: string;
        email: string;
        userType: string;
        tenantId: string;
        firstLogin: boolean;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
      tenant: {
        id: string;
        name: string;
        cnpj: string;
        address: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string | null;
      };
    }>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  // Alterar senha do perfil atual
  async changePassword(
    accessToken: string,
    data: { currentPassword: string; newPassword: string }
  ): Promise<SimpleResponse> {
    return apiRequest<SimpleResponse>('/users/profile/change-password', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },
};
