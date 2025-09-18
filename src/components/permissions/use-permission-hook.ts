import { useHasPermission } from '../../lib/hooks/use-app-permissions';

// Hook para verificar permissão programaticamente
export const useHasPermissionHook = (
  functionName: string,
  permissionLevel: string
) => {
  const { hasPermission, isLoading } = useHasPermission(
    functionName,
    permissionLevel
  );

  return {
    hasPermission,
    isLoading,
  };
};
