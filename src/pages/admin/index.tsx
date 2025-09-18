import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { ErrorMessage } from '../../components/ui/error-message';
import { useRoles } from '../../lib/hooks/use-roles';
import { useUsers } from '../../lib/hooks/use-users';
import {
  Users,
  Shield,
  Activity,
  Plus,
  UserCheck,
  Building,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Hooks para buscar dados do backend
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useRoles({ page: 1, limit: 100 });

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers({ page: 1, limit: 100 });

  // Loading state
  if (rolesLoading || usersLoading) {
    return <LoadingSpinner text='Carregando dashboard...' />;
  }

  // Error state
  if (rolesError || usersError) {
    return (
      <ErrorMessage
        error={rolesError || usersError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Processar dados das APIs com verificações de segurança
  const roles = Array.isArray(rolesData?.data?.roles)
    ? rolesData.data.roles
    : [];
  const users = Array.isArray(usersData?.data?.users)
    ? usersData.data.users
    : [];

  // Calcular estatísticas dos dados reais
  const roleStats = {
    total: roles.length,
    active: roles.filter(role => role?.isActive === true).length,
    inactive: roles.filter(role => role?.isActive === false).length,
    system: roles.filter(role => role?.isSystem === true).length,
  };

  const userStats = {
    total: users.length,
    active: users.filter(user => user?.isActive === true).length,
    inactive: users.filter(user => user?.isActive === false).length,
    newToday: users.filter(user => {
      try {
        if (!user?.createdAt) return false;
        const today = new Date();
        const userDate = new Date(user.createdAt);
        return userDate.toDateString() === today.toDateString();
      } catch {
        return false;
      }
    }).length,
  };

  // Ações rápidas
  const quickActions = [
    {
      title: 'Gerenciar Tenants',
      description: 'Criar e gerenciar tenants do sistema',
      href: '/admin/tenants',
      icon: Building,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Gerenciar Roles',
      description: 'Criar, editar e gerenciar roles do sistema',
      href: '/admin/roles',
      icon: Shield,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Gerenciar Usuários',
      description: 'Administrar usuários e suas permissões',
      href: '/admin/users',
      icon: Users,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  // Estatísticas principais
  const mainStats = [
    {
      title: 'Total de Roles',
      value: (roleStats?.total || 0).toString(),
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Usuários Ativos',
      value: (userStats?.active || 0).toString(),
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  // Simular atividades recentes baseadas nos dados disponíveis
  const recentActivities = [
    ...roles.slice(0, 2).map(role => ({
      id: `role-${role?.id || 'unknown'}`,
      type: 'role_created',
      title: `Role "${role?.name || 'Sem nome'}" criado`,
      description: role?.description || 'Novo role adicionado ao sistema',
      time: 'Há poucos minutos',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    })),
    ...users.slice(0, 2).map(user => ({
      id: `user-${user?.id || 'unknown'}`,
      type: 'user_created',
      title: `Usuário "${user?.name || 'Sem nome'}" criado`,
      description: `Email: ${user?.email || 'Sem email'}`,
      time: 'Há poucos minutos',
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    })),
  ].slice(0, 5);

  return (
    <div className='min-h-screen bg-transparent'>
      {/* Header */}
      <div className='relative bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-b border-blue-100/50 rounded-t-2xl'>
        <div className='absolute inset-0 bg-blue-100/80'></div>
        <div className='relative px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-slate-900'>
                Painel Administrativo
              </h1>
              <p className='text-slate-600 mt-1'>
                Gerencie roles, usuários e monitore o sistema
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                onClick={() => navigate('/admin/roles/new')}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                <Plus className='w-4 h-4 mr-2' />
                Novo Role
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='p-6 space-y-6'>
        {/* Estatísticas Principais */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className='border border-gray-200 shadow-sm hover:shadow-md transition-shadow'
              >
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        {stat.title}
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {stat.value}
                      </p>
                      <div className='flex items-center mt-1'>
                        <span className='text-xs font-medium text-gray-600'>
                          Estatísticas do sistema
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ações Rápidas */}
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <Shield className='w-5 h-5 text-blue-600' />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant='outline'
                    className='w-full justify-start h-auto p-4 hover:bg-zinc-50 group transition-all duration-300'
                    onClick={() => navigate(action.href)}
                  >
                    <div
                      className={`p-3 rounded-xl ${action.iconBg} mr-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-5 h-5 ${action.iconColor}`} />
                    </div>
                    <div className='text-left'>
                      <h3 className='font-medium text-gray-900'>
                        {action.title}
                      </h3>
                      <p className='text-sm text-gray-500 mt-1'>
                        {action.description}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <Activity className='w-5 h-5 text-blue-600' />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='space-y-4'>
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className='flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <div className={`p-2 rounded-full ${activity.bgColor}`}>
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-medium text-gray-900'>
                          {activity.title}
                        </h4>
                        <p className='text-sm text-gray-600 mt-1'>
                          {activity.description}
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className='text-center py-8'>
                  <Activity className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                  <p className='text-gray-500 text-sm'>
                    Nenhuma atividade recente encontrada
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
