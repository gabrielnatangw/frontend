import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { LoadingSpinner } from '../../ui/loading-spinner';
import { ErrorMessage } from '../../ui/error-message';
import { Checkbox } from '../../ui/checkbox';
import {
  useUserPermissionsIntegration,
  useGrantPermissionsIntegration,
  useRevokePermissionsIntegration,
} from '../../../lib';
import { Shield, Check, X, AlertCircle } from 'lucide-react';

interface UserPermissionsManagerProps {
  userId: string;
  userName: string;
}

export const UserPermissionsManager: React.FC<UserPermissionsManagerProps> = ({
  userId,
  userName,
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useUserPermissionsIntegration(userId);

  const grantPermissions = useGrantPermissionsIntegration();
  const revokePermissions = useRevokePermissionsIntegration();

  const userPermissions = permissionsData?.data?.permissions || [];
  const availablePermissions =
    permissionsData?.data?.availablePermissions || [];

  const userPermissionIds = userPermissions.map(p => p.permissionId);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleGrantPermissions = async () => {
    if (selectedPermissions.length === 0) return;

    try {
      await grantPermissions.mutateAsync({
        id: userId,
        data: { permissionIds: selectedPermissions },
      });
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Erro ao conceder permissões:', error);
    }
  };

  const handleRevokePermissions = async () => {
    if (selectedPermissions.length === 0) return;

    try {
      await revokePermissions.mutateAsync({
        id: userId,
        data: { permissionIds: selectedPermissions },
      });
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Erro ao revogar permissões:', error);
    }
  };

  const isPermissionGranted = (permissionId: string) => {
    return userPermissionIds.includes(permissionId);
  };

  if (permissionsLoading) {
    return <LoadingSpinner text='Carregando permissões...' />;
  }

  if (permissionsError) {
    return (
      <ErrorMessage
        error={permissionsError}
        title='Erro ao carregar permissões'
        description='Não foi possível carregar as permissões do usuário.'
      />
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='w-5 h-5' />
            Gerenciar Permissões - {userName}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Ações em lote */}
          {selectedPermissions.length > 0 && (
            <div className='flex items-center gap-2 p-3 bg-blue-50 rounded-lg'>
              <span className='text-sm font-medium'>
                {selectedPermissions.length} permissão(ões) selecionada(s)
              </span>
              <Button
                size='sm'
                onClick={handleGrantPermissions}
                disabled={grantPermissions.isPending}
                className='bg-green-600 hover:bg-green-700'
              >
                {grantPermissions.isPending ? (
                  <LoadingSpinner size='sm' className='mr-2' />
                ) : (
                  <Check className='w-4 h-4 mr-2' />
                )}
                Conceder
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={handleRevokePermissions}
                disabled={revokePermissions.isPending}
                className='text-red-600 border-red-300 hover:bg-red-50'
              >
                {revokePermissions.isPending ? (
                  <LoadingSpinner size='sm' className='mr-2' />
                ) : (
                  <X className='w-4 h-4 mr-2' />
                )}
                Revogar
              </Button>
            </div>
          )}

          {/* Lista de permissões */}
          <div className='space-y-3'>
            {availablePermissions.map(permission => {
              const isGranted = isPermissionGranted(permission.id);
              const isSelected = selectedPermissions.includes(permission.id);

              return (
                <div
                  key={permission.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isGranted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() =>
                        handlePermissionToggle(permission.id)
                      }
                    />
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{permission.name}</span>
                        {isGranted && (
                          <Badge
                            variant='default'
                            className='bg-green-100 text-green-800'
                          >
                            <Check className='w-3 h-3 mr-1' />
                            Concedida
                          </Badge>
                        )}
                      </div>
                      <p className='text-sm text-gray-600'>
                        {permission.description}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge variant='outline' className='text-xs'>
                          {permission.resource}
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                          {permission.action}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {availablePermissions.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <AlertCircle className='w-8 h-8 mx-auto mb-2' />
              <p>Nenhuma permissão disponível</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
