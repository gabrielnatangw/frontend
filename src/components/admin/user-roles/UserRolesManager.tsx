import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { LoadingSpinner } from '../../ui/loading-spinner';
import { ErrorMessage } from '../../ui/error-message';
import { Checkbox } from '../../ui/checkbox';
import {
  useUserRolesIntegration,
  useAssignRoleIntegration,
  useRemoveRoleIntegration,
} from '../../../lib';
import { Check, X, AlertCircle, Users } from 'lucide-react';

interface UserRolesManagerProps {
  userId: string;
  userName: string;
}

export const UserRolesManager: React.FC<UserRolesManagerProps> = ({
  userId,
  userName,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useUserRolesIntegration(userId);

  const assignRole = useAssignRoleIntegration();
  const removeRole = useRemoveRoleIntegration();

  const userRoles = rolesData?.data?.roles || [];
  const availableRoles = rolesData?.data?.availableRoles || [];

  const userRoleIds = userRoles.map(r => r.roleId);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleAssignRoles = async () => {
    if (selectedRoles.length === 0) return;

    try {
      // Simular atribuição de roles
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSelectedRoles([]);
    } catch (error) {
      console.error('Erro ao atribuir roles:', error);
    }
  };

  const handleRemoveRoles = async () => {
    if (selectedRoles.length === 0) return;

    try {
      // Simular remoção de roles
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSelectedRoles([]);
    } catch (error) {
      console.error('Erro ao remover roles:', error);
    }
  };

  const isRoleAssigned = (roleId: string) => {
    return userRoleIds.includes(roleId);
  };

  if (rolesLoading) {
    return <LoadingSpinner text='Carregando roles...' />;
  }

  if (rolesError) {
    return (
      <ErrorMessage
        error={rolesError}
        title='Erro ao carregar roles'
        description='Não foi possível carregar os roles do usuário.'
      />
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Gerenciar Roles - {userName}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Ações em lote */}
          {selectedRoles.length > 0 && (
            <div className='flex items-center gap-2 p-3 bg-blue-50 rounded-lg'>
              <span className='text-sm font-medium'>
                {selectedRoles.length} role(s) selecionado(s)
              </span>
              <Button
                size='sm'
                onClick={handleAssignRoles}
                disabled={assignRole.isPending}
                className='bg-green-600 hover:bg-green-700'
              >
                {assignRole.isPending ? (
                  <LoadingSpinner size='sm' className='mr-2' />
                ) : (
                  <Check className='w-4 h-4 mr-2' />
                )}
                Atribuir
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={handleRemoveRoles}
                disabled={removeRole.isPending}
                className='text-red-600 border-red-300 hover:bg-red-50'
              >
                {removeRole.isPending ? (
                  <LoadingSpinner size='sm' className='mr-2' />
                ) : (
                  <X className='w-4 h-4 mr-2' />
                )}
                Remover
              </Button>
            </div>
          )}

          {/* Lista de roles */}
          <div className='space-y-3'>
            {availableRoles.map(role => {
              const isAssigned = isRoleAssigned(role.id);
              const isSelected = selectedRoles.includes(role.id);

              return (
                <div
                  key={role.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isAssigned
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                    />
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{role.name}</span>
                        {isAssigned && (
                          <Badge
                            variant='default'
                            className='bg-green-100 text-green-800'
                          >
                            <Check className='w-3 h-3 mr-1' />
                            Atribuído
                          </Badge>
                        )}
                        {!role.isActive && (
                          <Badge variant='outline' className='text-gray-500'>
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className='text-sm text-gray-600'>
                        {role.description}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-xs text-gray-500'>
                          Criado em:{' '}
                          {new Date(role.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {availableRoles.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <AlertCircle className='w-8 h-8 mx-auto mb-2' />
              <p>Nenhum role disponível</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
