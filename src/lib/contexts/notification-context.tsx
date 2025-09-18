import React from 'react';
import { useNotifications } from '../hooks/use-notifications';

// Exemplo de uso em um contexto
export const NotificationContext = React.createContext<ReturnType<
  typeof useNotifications
> | null>(null);

export function useNotificationContext() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotificationContext deve ser usado dentro de NotificationContext.Provider'
    );
  }
  return context;
}
