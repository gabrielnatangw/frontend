import { useAuth } from './use-auth';

export const useUserType = () => {
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
};
