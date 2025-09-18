import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userPermissionsApi } from '../api/user-permissions';
import { useApplications } from './use-applications';
import { useAuth } from './use-auth';
import type {
  Application,
  UserPermissionsByFunction,
} from '../../types/user-new';

// Hook completo de permissões com suporte a aplicações
export function usePermissionsComplete() {
  const { user } = useAuth();
  const { data: applicationsData, isLoading: appsLoading } = useApplications();
  const queryClient = useQueryClient();

  // Estado para aplicação atual
  const [currentApplication, setCurrentApplication] =
    useState<Application | null>(null);
  const [permissions, setPermissions] = useState<UserPermissionsByFunction>({});

  // Carregar permissões da aplicação atual
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: [
      'permissions',
      'by-application',
      currentApplication?.applicationId || 'default',
    ],
    queryFn: () =>
      userPermissionsApi.getPermissionsByApplication(
        currentApplication?.applicationId
      ),
    enabled: true, // Sempre habilitado, usa ID padrão se não houver aplicação selecionada
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Processar permissões quando dados chegarem
  useEffect(() => {
    if ((permissionsData as any)?.data) {
      const permissionsMap: UserPermissionsByFunction = {};
      (permissionsData as any).data.forEach((permission: any) => {
        if (!permissionsMap[permission.functionName]) {
          permissionsMap[permission.functionName] = [];
        }
        permissionsMap[permission.functionName].push(
          permission.permissionLevel
        );
      });
      setPermissions(permissionsMap);
    }
  }, [permissionsData]);

  // Verificar se usuário tem permissão específica
  const hasPermission = (
    functionName: string,
    permissionLevel: string
  ): boolean => {
    return permissions[functionName]?.includes(permissionLevel) || false;
  };

  // Verificar permissão específica via API
  const checkPermission = async (
    functionName: string,
    permissionLevel: string
  ) => {
    if (!user) return false;

    try {
      const response = await userPermissionsApi.checkPermission(
        user.id,
        functionName,
        permissionLevel
      );
      return response.data.hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  // Verificar se pode gerenciar outro usuário
  const canManageUser = async (targetUserId: string) => {
    if (!user) return false;

    try {
      const response = await userPermissionsApi.canManageUser(
        user.id,
        targetUserId
      );
      return response.data.canManage;
    } catch (error) {
      console.error('Error checking user management permission:', error);
      return false;
    }
  };

  // Verificar acesso a tenant
  const canAccessTenant = async (tenantId: string) => {
    if (!user) return false;

    try {
      const response = await userPermissionsApi.canAccessTenant(
        user.id,
        tenantId
      );
      return response.data.canAccess;
    } catch (error) {
      console.error('Error checking tenant access:', error);
      return false;
    }
  };

  // Carregar aplicações
  const loadApplications = async () => {
    // Aplicações já são carregadas automaticamente pelo useApplications
    return applicationsData?.data?.applications || [];
  };

  // Carregar permissões da aplicação
  const loadApplicationPermissions = async (applicationId: string) => {
    const app = applicationsData?.data?.applications.find(
      a => a.applicationId === applicationId
    );
    if (app) {
      setCurrentApplication(app);
    }
  };

  // Atualizar permissões
  const refreshPermissions = (newPermissions?: UserPermissionsByFunction) => {
    if (newPermissions) {
      setPermissions(newPermissions);
    } else {
      // Recarregar permissões da aplicação atual
      queryClient.invalidateQueries({
        queryKey: [
          'permissions',
          'by-application',
          currentApplication?.applicationId,
        ],
      });
    }
  };

  return {
    // Dados
    user,
    applications: applicationsData?.data?.applications || [],
    currentApplication,
    permissions,

    // Estados de loading
    loading: appsLoading || permissionsLoading,
    appsLoading,
    permissionsLoading,

    // Funções
    hasPermission,
    checkPermission,
    canManageUser,
    canAccessTenant,
    loadApplications,
    loadApplicationPermissions,
    setCurrentApplication,
    refreshPermissions,
  };
}

// Hook para verificação de tipo de usuário
export function useUserType() {
  const { user } = useAuth();

  return {
    isRoot:
      user?.accessType === 'ADMIN' && (user?.userType as string) === 'ADMIN',
    isAdmin: user?.accessType === 'ADMIN',
    isUser: user?.accessType === 'USER',
    canCreateRoot:
      user?.accessType === 'ADMIN' && (user?.userType as string) === 'ADMIN',
    canManageUsers: user?.accessType === 'ADMIN',
    canAccessAllTenants:
      user?.accessType === 'ADMIN' && (user?.userType as string) === 'ADMIN',
    userType: user?.userType,
    userId: user?.id,
    tenantId: user?.tenantId,
  };
}
