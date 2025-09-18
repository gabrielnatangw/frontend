import React, { useState, useEffect } from 'react';
import {
  useUserPermissionsByFunction,
  useSetUserPermissions,
} from '../../lib/hooks/use-permissions-new';
import { useUserType } from '../../lib/hooks/use-user-type';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Checkbox } from '../ui/checkbox';
import { Shield, User, Settings, Cpu, FileText, Home } from 'lucide-react';

interface PermissionManagerProps {
  targetUserId: string;
  targetUserName?: string;
}

const FUNCTION_ICONS = {
  users: User,
  machines: Cpu,
  sensors: Cpu,
  modules: Settings,
  reports: FileText,
  dashboard: Home,
  settings: Settings,
};

const PERMISSION_LEVELS = ['read', 'write', 'update', 'delete'] as const;

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  targetUserId,
  targetUserName,
}) => {
  const { canManageUsers } = useUserType();
  const { data: permissionsData, isLoading } =
    useUserPermissionsByFunction(targetUserId);
  const setUserPermissions = useSetUserPermissions();

  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, string[]>
  >({});

  // Inicializar permissões selecionadas
  useEffect(() => {
    if (permissionsData?.data) {
      setSelectedPermissions(permissionsData.data);
    }
  }, [permissionsData]);

  // Verificar se pode gerenciar este usuário
  if (!canManageUsers) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center text-gray-500'>
            <Shield className='w-12 h-12 mx-auto mb-4 text-gray-400' />
            <p>Você não tem permissão para gerenciar usuários</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePermissionToggle = (
    functionName: string,
    permissionLevel: string
  ) => {
    setSelectedPermissions(prev => {
      const currentPermissions = prev[functionName] || [];
      const isSelected = currentPermissions.includes(permissionLevel);

      if (isSelected) {
        return {
          ...prev,
          [functionName]: currentPermissions.filter(p => p !== permissionLevel),
        };
      } else {
        return {
          ...prev,
          [functionName]: [...currentPermissions, permissionLevel],
        };
      }
    });
  };

  const handleSavePermissions = async () => {
    // Converter permissões selecionadas para IDs (simulado)
    const permissionIds = Object.entries(selectedPermissions).flatMap(
      ([functionName, levels]) =>
        levels.map(level => `${functionName}_${level}`)
    );

    try {
      await setUserPermissions.mutateAsync({
        userId: targetUserId,
        permissionIds,
      });
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text='Carregando permissões...' />;
  }

  const functions = Object.keys(permissionsData?.data || {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='w-5 h-5' />
          Gerenciar Permissões
          {targetUserName && <Badge variant='outline'>{targetUserName}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {functions.length === 0 ? (
          <div className='text-center text-gray-500 py-8'>
            <Shield className='w-12 h-12 mx-auto mb-4 text-gray-400' />
            <p>Nenhuma permissão encontrada</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {functions.map(functionName => {
              const Icon =
                FUNCTION_ICONS[functionName as keyof typeof FUNCTION_ICONS] ||
                Settings;
              const currentPermissions =
                selectedPermissions[functionName] || [];

              return (
                <div key={functionName} className='border rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Icon className='w-4 h-4' />
                    <h3 className='font-medium capitalize'>{functionName}</h3>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                    {PERMISSION_LEVELS.map(level => {
                      const isSelected = currentPermissions.includes(level);

                      return (
                        <div
                          key={level}
                          className='flex items-center space-x-2'
                        >
                          <Checkbox
                            id={`${functionName}-${level}`}
                            checked={isSelected}
                            onCheckedChange={() =>
                              handlePermissionToggle(functionName, level)
                            }
                          />
                          <label
                            htmlFor={`${functionName}-${level}`}
                            className='text-sm font-medium capitalize cursor-pointer'
                          >
                            {level}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className='flex justify-end gap-2 pt-4 border-t'>
          <Button
            variant='outline'
            onClick={() => setSelectedPermissions(permissionsData?.data || {})}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSavePermissions}
            disabled={setUserPermissions.isPending}
          >
            {setUserPermissions.isPending ? (
              <LoadingSpinner size='sm' className='mr-2' />
            ) : null}
            Salvar Permissões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
