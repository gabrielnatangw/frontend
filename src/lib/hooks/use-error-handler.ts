import { useCallback } from 'react';
import { useNotifications } from './use-notifications';
import { useNavigate } from 'react-router-dom';

export interface ErrorDetails {
  code?: string;
  message: string;
  status?: number;
  field?: string;
  suggestions?: string[];
  recoveryActions?: Array<{
    label: string;
    action: () => void;
  }>;
}

/**
 * Hook para tratamento avançado de erros
 */
export function useErrorHandler() {
  const { showError, showInfo } = useNotifications();
  const navigate = useNavigate();

  // Mapear códigos de erro para mensagens específicas
  const getErrorMessage = useCallback(
    (error: any): ErrorDetails => {
      const status = error?.status || error?.response?.status;
      const code = error?.code || error?.response?.data?.code;
      const message =
        error?.message || error?.response?.data?.message || 'Erro desconhecido';

      switch (status) {
        case 400:
          return {
            code,
            message: 'Dados inválidos fornecidos',
            status,
            suggestions: [
              'Verifique se todos os campos obrigatórios estão preenchidos',
              'Confirme se os dados estão no formato correto',
              'Tente novamente com dados diferentes',
            ],
            recoveryActions: [
              {
                label: 'Limpar formulário',
                action: () => window.location.reload(),
              },
              { label: 'Voltar', action: () => navigate(-1) },
            ],
          };

        case 401:
          return {
            code,
            message: 'Não autorizado',
            status,
            suggestions: [
              'Sua sessão pode ter expirado',
              'Você não tem permissão para esta ação',
              'Faça login novamente',
            ],
            recoveryActions: [
              { label: 'Fazer login', action: () => navigate('/login') },
              {
                label: 'Atualizar página',
                action: () => window.location.reload(),
              },
            ],
          };

        case 403:
          return {
            code,
            message: 'Acesso negado',
            status,
            suggestions: [
              'Você não tem permissão para esta ação',
              'Entre em contato com o administrador',
              'Verifique suas permissões de usuário',
            ],
            recoveryActions: [
              { label: 'Voltar ao início', action: () => navigate('/admin') },
              {
                label: 'Ver permissões',
                action: () => navigate('/admin/permissions'),
              },
            ],
          };

        case 404:
          return {
            code,
            message: 'Recurso não encontrado',
            status,
            suggestions: [
              'O item pode ter sido removido',
              'Verifique se o ID está correto',
              'Tente atualizar a página',
            ],
            recoveryActions: [
              {
                label: 'Atualizar página',
                action: () => window.location.reload(),
              },
              {
                label: 'Voltar à lista',
                action: () => navigate('/admin/roles'),
              },
            ],
          };

        case 409:
          return {
            code,
            message: 'Conflito de dados',
            status,
            suggestions: [
              'Já existe um item com este nome',
              'O recurso pode estar sendo usado por outro usuário',
              'Tente com dados diferentes',
            ],
            recoveryActions: [
              {
                label: 'Tentar novamente',
                action: () => window.location.reload(),
              },
              {
                label: 'Ver itens existentes',
                action: () => navigate('/admin/roles'),
              },
            ],
          };

        case 422:
          return {
            code,
            message: 'Dados inválidos',
            status,
            field: error?.response?.data?.field,
            suggestions: [
              'Verifique os campos obrigatórios',
              'Confirme se os dados estão no formato correto',
              'Tente com valores diferentes',
            ],
            recoveryActions: [
              {
                label: 'Corrigir dados',
                action: () => window.location.reload(),
              },
              { label: 'Cancelar', action: () => navigate(-1) },
            ],
          };

        case 429:
          return {
            code,
            message: 'Muitas tentativas',
            status,
            suggestions: [
              'Aguarde alguns minutos antes de tentar novamente',
              'Reduza a frequência das operações',
              'Tente novamente mais tarde',
            ],
            recoveryActions: [
              {
                label: 'Aguardar',
                action: () => setTimeout(() => window.location.reload(), 30000),
              },
              { label: 'Voltar', action: () => navigate(-1) },
            ],
          };

        case 500:
          return {
            code,
            message: 'Erro interno do servidor',
            status,
            suggestions: [
              'O servidor está temporariamente indisponível',
              'Tente novamente em alguns minutos',
              'Entre em contato com o suporte se o problema persistir',
            ],
            recoveryActions: [
              {
                label: 'Tentar novamente',
                action: () => window.location.reload(),
              },
              {
                label: 'Reportar problema',
                action: () => navigate('/support'),
              },
            ],
          };

        case 503:
          return {
            code,
            message: 'Serviço indisponível',
            status,
            suggestions: [
              'O serviço está em manutenção',
              'Tente novamente mais tarde',
              'Verifique o status do sistema',
            ],
            recoveryActions: [
              {
                label: 'Verificar status',
                action: () => window.open('/status', '_blank'),
              },
              {
                label: 'Tentar novamente',
                action: () => setTimeout(() => window.location.reload(), 60000),
              },
            ],
          };

        default:
          if (code === 'NETWORK_ERROR' || !navigator.onLine) {
            return {
              code,
              message: 'Erro de conexão',
              suggestions: [
                'Verifique sua conexão com a internet',
                'Tente novamente quando a conexão for restaurada',
                'Algumas funcionalidades podem estar limitadas offline',
              ],
              recoveryActions: [
                {
                  label: 'Tentar novamente',
                  action: () => window.location.reload(),
                },
                { label: 'Modo offline', action: () => navigate('/offline') },
              ],
            };
          }

          return {
            code,
            message: message || 'Erro inesperado',
            status,
            suggestions: [
              'Tente novamente em alguns minutos',
              'Se o problema persistir, entre em contato com o suporte',
              'Verifique se todos os dados estão corretos',
            ],
            recoveryActions: [
              {
                label: 'Tentar novamente',
                action: () => window.location.reload(),
              },
              { label: 'Voltar', action: () => navigate(-1) },
            ],
          };
      }
    },
    [navigate]
  );

  // Função para mostrar erro com detalhes
  const handleError = useCallback(
    (error: any, context?: string) => {
      const errorDetails = getErrorMessage(error);

      // Log do erro para debugging
      console.error(`[${context || 'ErrorHandler'}]`, errorDetails, error);

      // Mostrar notificação de erro
      showError(`${errorDetails.message}${context ? ` (${context})` : ''}`);

      return errorDetails;
    },
    [getErrorMessage, showError]
  );

  // Função para mostrar warning
  const handleWarning = useCallback(
    (message: string, context?: string) => {
      showInfo(`${message}${context ? ` (${context})` : ''}`);
    },
    [showInfo]
  );

  // Função para mostrar info
  const handleInfo = useCallback(
    (message: string, context?: string) => {
      showInfo(`${message}${context ? ` (${context})` : ''}`);
    },
    [showInfo]
  );

  // Função para validar se é um erro recuperável
  const isRecoverableError = useCallback((error: any): boolean => {
    const status = error?.status || error?.response?.status;
    return [400, 401, 403, 404, 409, 422, 429].includes(status);
  }, []);

  // Função para obter sugestões de recuperação
  const getRecoverySuggestions = useCallback(
    (error: any): string[] => {
      const errorDetails = getErrorMessage(error);
      return errorDetails.suggestions || [];
    },
    [getErrorMessage]
  );

  return {
    handleError,
    handleWarning,
    handleInfo,
    isRecoverableError,
    getRecoverySuggestions,
    getErrorMessage,
  };
}

export default useErrorHandler;
