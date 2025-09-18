import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viewCardsApi } from '../api/views';
import type { CreateViewCardData, UpdateViewCardData } from '../../types/view';

// ===========================================
// HOOKS PARA VIEW CARDS
// ===========================================

export const useAddCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      viewId,
      data,
    }: {
      viewId: string;
      data: CreateViewCardData;
    }) => viewCardsApi.addCard(viewId, data),
    onSuccess: (result, { viewId }) => {
      console.log('✅ Card adicionado com sucesso, invalidando queries...', {
        result,
        viewId,
      });

      // Invalidar todas as queries relacionadas a views
      queryClient.invalidateQueries({ queryKey: ['view', viewId] });
      queryClient.invalidateQueries({ queryKey: ['views'] });
      queryClient.invalidateQueries({ queryKey: ['views', 'my'] });

      console.log('🔄 Queries invalidadas, dados devem ser recarregados');
    },
  });
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      data,
    }: {
      cardId: string;
      data: UpdateViewCardData;
    }) => viewCardsApi.updateCard(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['view'] });
    },
  });
};

export const useUpdateCardPositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ viewId, cards }: { viewId: string; cards: any[] }) =>
      viewCardsApi.updateCardPositions(viewId, { cards }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['view'] });
    },
  });
};

export const useRemoveCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: viewCardsApi.removeCard,
    onSuccess: (response, cardId) => {
      console.log('🗑️ Card removido com sucesso, invalidando queries...', {
        cardId,
        response,
      });

      // Limpar cache completamente para forçar atualização
      queryClient.removeQueries({ queryKey: ['views', 'my'] });

      // Invalidar todas as queries relacionadas a views de forma mais agressiva
      queryClient.invalidateQueries({ queryKey: ['view'] });
      queryClient.invalidateQueries({ queryKey: ['views'] });
      queryClient.invalidateQueries({ queryKey: ['views', 'my'] });

      // Forçar refetch imediato das queries
      queryClient.refetchQueries({ queryKey: ['views', 'my'] });

      console.log(
        '🔄 Cache limpo, queries invalidadas e refetch forçado após remoção do card'
      );
    },
    onError: error => {
      console.error('❌ Erro ao remover card:', error);
    },
  });
};
