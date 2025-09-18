import toast from 'react-hot-toast';

export function useNotifications() {
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showLoading = (message: string) => {
    return toast.loading(message);
  };

  const showInfo = (message: string) => {
    toast(message);
  };

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  // Notificações específicas para operações CRUD
  const showCreateSuccess = (entityName: string) => {
    showSuccess(`${entityName} criado com sucesso!`);
  };

  const showCreateError = (entityName: string, error?: unknown) => {
    const defaultMessage = `Erro ao criar ${entityName}`;
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const errorMessage =
      err?.response?.data?.message || err?.message || defaultMessage;
    showError(errorMessage);
  };

  const showUpdateSuccess = (entityName: string) => {
    showSuccess(`${entityName} atualizado com sucesso!`);
  };

  const showUpdateError = (entityName: string, error?: unknown) => {
    const defaultMessage = `Erro ao atualizar ${entityName}`;
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const errorMessage =
      err?.response?.data?.message || err?.message || defaultMessage;
    showError(errorMessage);
  };

  const showDeleteSuccess = (entityName: string) => {
    showSuccess(`${entityName} removido com sucesso!`);
  };

  const showDeleteError = (entityName: string, error?: unknown) => {
    const defaultMessage = `Erro ao remover ${entityName}`;
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const errorMessage =
      err?.response?.data?.message || err?.message || defaultMessage;
    showError(errorMessage);
  };

  const showRestoreSuccess = (entityName: string) => {
    showSuccess(`${entityName} restaurado com sucesso!`);
  };

  const showRestoreError = (entityName: string, error?: unknown) => {
    const defaultMessage = `Erro ao restaurar ${entityName}`;
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const errorMessage =
      err?.response?.data?.message || err?.message || defaultMessage;
    showError(errorMessage);
  };

  // Notificações para validação
  const showValidationError = (
    errors: Array<{ field: string; message: string }>
  ) => {
    if (errors && errors.length > 0) {
      const errorMessage = errors
        .map(error => `${error.field}: ${error.message}`)
        .join('\n');
      showError(`Erros de validação:\n${errorMessage}`);
    } else {
      showError('Dados inválidos. Verifique os campos e tente novamente.');
    }
  };

  // Notificações para operações de rede
  const showNetworkError = () => {
    showError('Erro de conexão. Verifique sua internet e tente novamente.');
  };

  const showServerError = () => {
    showError('Erro no servidor. Tente novamente mais tarde.');
  };

  return {
    // Métodos básicos
    showSuccess,
    showError,
    showLoading,
    showInfo,
    dismiss,
    dismissAll,

    // Métodos CRUD
    showCreateSuccess,
    showCreateError,
    showUpdateSuccess,
    showUpdateError,
    showDeleteSuccess,
    showDeleteError,
    showRestoreSuccess,
    showRestoreError,

    // Métodos específicos
    showValidationError,
    showNetworkError,
    showServerError,
  };
}
