import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Trash2, Plus } from 'lucide-react';
import { Button } from '../../../../components';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../../components/ui/avatar';
import {
  useUserIntegration,
  // useRoles,
  useNotifications,
} from '../../../../lib';

export default function UserRolesPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useNotifications();

  // Estados
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Buscar dados
  const { data: userData, isLoading: userLoading } = useUserIntegration(
    id || ''
  );
  // const { data: rolesData } = useRoles();

  const user = userData?.data;
  // const roles = rolesData?.data?.roles || [];

  // Simular dados de roles de usuário (endpoint não existe na API)
  // Dados simulados para diferentes usuários
  const mockUserRoles = {
    '9ad846ac-3947-47c7-a19b-37ebd68d3d7a': [
      // Usuário atual
      {
        id: 'user-role-1',
        roleId: 'role-1',
        userId: '9ad846ac-3947-47c7-a19b-37ebd68d3d7a',
        name: 'Administrador',
        description: 'Acesso total ao sistema',
        isActive: true,
        assignedAt: new Date().toISOString(),
      },
      {
        id: 'user-role-2',
        roleId: 'role-2',
        userId: '9ad846ac-3947-47c7-a19b-37ebd68d3d7a',
        name: 'Operador',
        description: 'Acesso limitado ao sistema',
        isActive: true,
        assignedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    'other-user-id': [
      // Outro usuário
      {
        id: 'user-role-3',
        roleId: 'role-3',
        userId: 'other-user-id',
        name: 'Editor',
        description: 'Acesso de edição',
        isActive: true,
        assignedAt: new Date().toISOString(),
      },
    ],
  };

  // Obter apenas roles atribuídos a este usuário específico
  const userRoles = mockUserRoles[id || ''] || [];

  // Função para obter iniciais do nome
  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return 'U'; // Default para usuário sem nome
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para remover role
  const handleRemoveRole = async (userRoleId: string) => {
    if (!id) return;

    setIsRemoving(userRoleId);

    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Role removido com sucesso');
    } catch (error) {
      showError('Erro ao remover role');
      console.error('Erro ao remover role:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  if (userLoading) {
    return (
      <div className='p-6'>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-800'>Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Voltar
          </Button>
          <div className='flex items-center gap-4'>
            <Avatar className='w-12 h-12'>
              <AvatarImage src='' />
              <AvatarFallback className='bg-blue-100 text-blue-800 font-semibold'>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className='text-3xl font-bold text-zinc-900'>
                Gerenciar Roles do Usuário
              </h1>
              <p className='text-zinc-600 mt-1'>
                Configure os roles para {user.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='w-5 h-5' />
            Informações do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <h4 className='text-sm font-medium text-zinc-600'>Nome</h4>
              <p className='text-lg font-semibold text-zinc-900'>
                {user?.name}
              </p>
            </div>
            <div>
              <h4 className='text-sm font-medium text-zinc-600'>Email</h4>
              <p className='text-lg text-zinc-900'>{user?.email}</p>
            </div>
            <div>
              <h4 className='text-sm font-medium text-zinc-600'>
                Tipo de Usuário
              </h4>
              <Badge
                variant={user?.userType === 'admin' ? 'outline' : 'default'}
              >
                {user?.userType === 'root'
                  ? 'Root'
                  : user?.userType === 'admin'
                    ? 'Administrador'
                    : 'Usuário'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Atribuídos */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='w-5 h-5' />
            Roles Atribuídos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length > 0 ? (
            <div className='space-y-4'>
              {userRoles.map(userRole => (
                <div
                  key={userRole.id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full'>
                      <Shield className='w-5 h-5 text-blue-600' />
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-900'>
                        {userRole.name}
                      </h4>
                      <p className='text-sm text-gray-500'>
                        {userRole.description}
                      </p>
                      <p className='text-xs text-gray-400'>
                        Atribuído em:{' '}
                        {new Date(userRole.assignedAt).toLocaleDateString(
                          'pt-BR'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={userRole.isActive ? 'default' : 'secondary'}
                    >
                      {userRole.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRemoveRole(userRole.id)}
                      disabled={isRemoving === userRole.id}
                      className='text-red-600 hover:text-red-700 hover:bg-red-50'
                    >
                      {isRemoving === userRole.id ? (
                        <div className='w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
                      ) : (
                        <Trash2 className='w-4 h-4' />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <Shield className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 mb-4'>
                Nenhum role atribuído a este usuário
              </p>
              <Button>
                <Plus className='w-4 h-4 mr-2' />
                Atribuir Primeiro Role
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
