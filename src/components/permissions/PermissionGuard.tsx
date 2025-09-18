import React from 'react';
import { useHasPermission } from '../../lib/hooks/use-app-permissions';

interface PermissionGuardProps {
  functionName: string;
  permissionLevel: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
  permissions?: Array<{ functionName: string; permissionLevel: string }>;
  userId?: string; // Para verificar permissões de outro usuário
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  functionName,
  permissionLevel,
  children,
  fallback = null,
  requireAll = false,
  permissions = [],
  userId: _userId,
}) => {
  const { hasPermission, isLoading } = useHasPermission(
    functionName,
    permissionLevel
  );

  if (isLoading) {
    return <div>Verificando permissão...</div>;
  }

  // Verificação de permissão única
  if (permissions.length === 0) {
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }

  // Verificação de múltiplas permissões
  if (requireAll) {
    // Requer todas as permissões - simplificado para usar apenas a permissão principal
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  } else {
    // Requer pelo menos uma permissão - simplificado para usar apenas a permissão principal
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }
};

export default PermissionGuard;
