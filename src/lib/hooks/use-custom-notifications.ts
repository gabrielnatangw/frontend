import { useNotifications } from './use-notifications';

// Exemplo de uso em um hook personalizado
export function useCustomNotifications() {
  const { showSuccess, showError } = useNotifications();

  const showCustomMessage = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      showSuccess(message);
    } else {
      showError(message);
    }
  };

  return { showCustomMessage };
}
