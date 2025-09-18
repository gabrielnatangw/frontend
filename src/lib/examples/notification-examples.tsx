import React from 'react';
import { useNotifications } from '../hooks/use-notifications';

// Exemplo de componente que demonstra diferentes tipos de notificações
export function NotificationExamples() {
  const {
    showSuccess,
    showError,
    showLoading,
    showInfo,
    showCreateSuccess,
    showCreateError,
    showUpdateSuccess,
    showUpdateError,
    showDeleteSuccess,
    showDeleteError,
    showRestoreSuccess,
    showRestoreError,
    showValidationError,
    showNetworkError,
    showServerError,
    dismiss,
    dismissAll,
  } = useNotifications();

  const handleBasicNotifications = () => {
    showSuccess('Operação realizada com sucesso!');
    showError('Algo deu errado!');
    showInfo('Informação importante para o usuário');
  };

  const handleCRUDNotifications = () => {
    showCreateSuccess('Produto');
    showUpdateSuccess('Cliente');
    showDeleteSuccess('Pedido');
    showRestoreSuccess('Categoria');
  };

  const handleErrorNotifications = () => {
    showCreateError('Produto', { message: 'Nome já existe no sistema' });
    showUpdateError('Cliente', { message: 'Email inválido' });
    showDeleteError('Pedido', { message: 'Pedido não pode ser excluído' });
    showRestoreError('Categoria', { message: 'Categoria não encontrada' });
  };

  const handleValidationErrors = () => {
    showValidationError([
      { field: 'nome', message: 'Nome é obrigatório' },
      { field: 'email', message: 'Email inválido' },
      { field: 'senha', message: 'Senha deve ter pelo menos 6 caracteres' },
    ]);
  };

  const handleNetworkErrors = () => {
    showNetworkError();
    showServerError();
  };

  const handleLoadingNotification = () => {
    const loadingToast = showLoading('Processando...');

    // Simular operação assíncrona
    setTimeout(() => {
      dismiss(loadingToast);
      showSuccess('Operação concluída!');
    }, 3000);
  };

  return (
    <div className='p-6 space-y-4'>
      <h2 className='text-2xl font-bold'>Exemplos de Notificações</h2>

      <div className='grid grid-cols-2 gap-4'>
        <button
          onClick={handleBasicNotifications}
          className='p-3 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Notificações Básicas
        </button>

        <button
          onClick={handleCRUDNotifications}
          className='p-3 bg-green-500 text-white rounded hover:bg-green-600'
        >
          Notificações CRUD
        </button>

        <button
          onClick={handleErrorNotifications}
          className='p-3 bg-red-500 text-white rounded hover:bg-red-600'
        >
          Notificações de Erro
        </button>

        <button
          onClick={handleValidationErrors}
          className='p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600'
        >
          Erros de Validação
        </button>

        <button
          onClick={handleNetworkErrors}
          className='p-3 bg-purple-500 text-white rounded hover:bg-purple-600'
        >
          Erros de Rede/Servidor
        </button>

        <button
          onClick={handleLoadingNotification}
          className='p-3 bg-indigo-500 text-white rounded hover:bg-indigo-600'
        >
          Notificação de Loading
        </button>
      </div>

      <div className='mt-6'>
        <button
          onClick={dismissAll}
          className='p-3 bg-gray-500 text-white rounded hover:bg-gray-600'
        >
          Limpar Todas as Notificações
        </button>
      </div>
    </div>
  );
}

// Funções e contextos movidos para arquivos separados:
// - useCustomNotifications: src/lib/hooks/use-custom-notifications.ts
// - NotificationContext: src/lib/contexts/notification-context.tsx
