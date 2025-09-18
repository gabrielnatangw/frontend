import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viewCardsApi } from '../api/views';
import { useNotifications } from './use-notifications';
import type { CreateViewCardData, UpdateViewCardData } from '../../types/view';

// Hook para criar cards
export function useCreateCard() {
  const queryClient = useQueryClient();
  const { showCreateSuccess, showCreateError, showValidationError } =
    useNotifications();

  return useMutation({
    mutationFn: async ({
      viewId,
      data,
    }: {
      viewId: string;
      data: CreateViewCardData;
    }) => {
      console.log('📤 useCreateCard - Enviando:', {
        width: data.width,
        height: data.height,
      });
      const response = await viewCardsApi.addCard(viewId, data);
      console.log('✅ useCreateCard - Resposta:', {
        width: response.data?.width,
        height: response.data?.height,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['views'] });
      queryClient.invalidateQueries({ queryKey: ['views', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['view', variables.viewId] });

      showCreateSuccess('Card');
    },
    onError: (error: any) => {
      console.error('Erro ao criar card:', error);

      // Tratar diferentes tipos de erro
      if (error.response?.data?.errors) {
        showValidationError(error.response.data.errors);
      } else if (error.response?.status === 400) {
        showCreateError('Card', {
          message: 'Dados inválidos. Verifique os campos obrigatórios.',
        });
      } else if (error.response?.status === 409) {
        showCreateError('Card', {
          message: 'Já existe um card para este sensor nesta view.',
        });
      } else if (error.response?.status >= 500) {
        showCreateError('Card', {
          message: 'Erro no servidor. Tente novamente mais tarde.',
        });
      } else if (!error.response) {
        showCreateError('Card', {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        });
      } else {
        showCreateError('Card', error);
      }
    },
  });
}

// Hook para atualizar cards
export function useUpdateCard() {
  const queryClient = useQueryClient();
  const { showUpdateSuccess, showUpdateError, showValidationError } =
    useNotifications();

  return useMutation({
    mutationFn: async ({
      cardId,
      data,
    }: {
      cardId: string;
      data: UpdateViewCardData;
    }) => {
      return viewCardsApi.updateCard(cardId, data);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['views'] });
      queryClient.invalidateQueries({ queryKey: ['views', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['view'] });

      showUpdateSuccess('Card');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar card:', error);

      if (error.response?.data?.errors) {
        showValidationError(error.response.data.errors);
      } else if (error.response?.status === 400) {
        showUpdateError('Card', {
          message: 'Dados inválidos. Verifique os campos obrigatórios.',
        });
      } else if (error.response?.status >= 500) {
        showUpdateError('Card', {
          message: 'Erro no servidor. Tente novamente mais tarde.',
        });
      } else if (!error.response) {
        showUpdateError('Card', {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        });
      } else {
        showUpdateError('Card', error);
      }
    },
  });
}

// Hook para remover cards
export function useRemoveCard() {
  const queryClient = useQueryClient();
  const { showDeleteSuccess, showDeleteError } = useNotifications();

  return useMutation({
    mutationFn: async (cardId: string) => {
      return viewCardsApi.removeCard(cardId);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['views'] });
      queryClient.invalidateQueries({ queryKey: ['views', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['view'] });

      showDeleteSuccess('Card');
    },
    onError: (error: any) => {
      console.error('Erro ao remover card:', error);

      if (error.response?.status >= 500) {
        showDeleteError('Card', {
          message: 'Erro no servidor. Tente novamente mais tarde.',
        });
      } else if (!error.response) {
        showDeleteError('Card', {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        });
      } else {
        showDeleteError('Card', error);
      }
    },
  });
}

// Hook para atualizar posições dos cards
export function useUpdateCardPositions() {
  const queryClient = useQueryClient();
  const { showUpdateSuccess, showUpdateError } = useNotifications();

  return useMutation({
    mutationFn: async ({
      viewId,
      cards,
    }: {
      viewId: string;
      cards: Array<{
        id: string;
        positionX: number;
        positionY: number;
        width: number;
        height: number;
      }>;
    }) => {
      return viewCardsApi.updateCardPositions(viewId, { cards });
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['views'] });
      queryClient.invalidateQueries({ queryKey: ['views', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['view'] });

      showUpdateSuccess('Posições dos cards');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar posições dos cards:', error);

      if (
        error?.message?.includes('500') ||
        error?.message?.includes('Erro interno do servidor')
      ) {
        showUpdateError('Posições dos cards', {
          message:
            'Erro interno do servidor. Verifique se o backend está funcionando corretamente.',
        });
      } else if (error?.status >= 500) {
        showUpdateError('Posições dos cards', {
          message: 'Erro no servidor. Tente novamente mais tarde.',
        });
      } else if (!error?.response) {
        showUpdateError('Posições dos cards', {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        });
      } else {
        showUpdateError('Posições dos cards', error);
      }
    },
  });
}
