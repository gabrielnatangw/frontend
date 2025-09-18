import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../components/ui/tabs';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../../components/ui/error-message';
import { useUserIntegration } from '../../../../lib';
import { UserPermissionsManager } from '../../../../components/admin/user-permissions/UserPermissionsManager';
import { UserRolesManager } from '../../../../components/admin/user-roles/UserRolesManager';

export default function UserPermissionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useUserIntegration(id || '');

  // Simular dados de permissões de usuário (endpoint não existe na API)
  // const userPermissionsData = {
  //   data: {
  //     permissions: [
  //       {
  //         id: 'perm-1',
  //         name: 'Gerenciar Usuários',
  //         description: 'Pode criar, editar e excluir usuários',
  //         module: 'Usuários',
  //         isActive: true,
  //       },
  //       {
  //         id: 'perm-2',
  //         name: 'Gerenciar Roles',
  //         description: 'Pode criar, editar e excluir roles',
  //         module: 'Roles',
  //         isActive: true,
  //       },
  //     ],
  //   },
  // };

  if (userLoading) {
    return <LoadingSpinner text='Carregando usuário...' />;
  }

  if (userError || !userData?.data) {
    return (
      <div className='min-h-screen bg-transparent'>
        <div className='mx-8 py-8'>
          <ErrorMessage
            error={userError}
            onRetry={() => window.location.reload()}
            onGoHome={() => navigate('/admin/users')}
            title='Erro ao carregar usuário'
            description='Não foi possível carregar os dados do usuário.'
          />
        </div>
      </div>
    );
  }

  const user = userData.data;

  return (
    <div className='min-h-screen bg-transparent'>
      {/* Header */}
      <div className='relative bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-b border-blue-100/50 rounded-t-2xl'>
        <div className='absolute inset-0 bg-blue-100/80'></div>
        <div className='relative px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate('/admin/users')}
                className='text-slate-700 hover:text-slate-900 hover:bg-white/60 mb-2'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Voltar
              </Button>
              <h1 className='text-2xl font-bold text-slate-900'>
                Gerenciar Permissões e Roles
              </h1>
              <p className='text-slate-600 mt-1'>
                {user.name} - {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='p-6'>
        <div className='max-w-6xl mx-auto'>
          <Tabs defaultValue='permissions' className='space-y-6'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger
                value='permissions'
                className='flex items-center gap-2'
              >
                <Shield className='w-4 h-4' />
                Permissões
              </TabsTrigger>
              <TabsTrigger value='roles' className='flex items-center gap-2'>
                <Users className='w-4 h-4' />
                Roles
              </TabsTrigger>
            </TabsList>

            <TabsContent value='permissions'>
              <UserPermissionsManager userId={user.id} userName={user.name} />
            </TabsContent>

            <TabsContent value='roles'>
              <UserRolesManager userId={user.id} userName={user.name} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
