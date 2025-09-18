import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../components/ui/error-message';
import {
  useUsersIntegration,
  useUserStatsIntegration,
  useDeleteUserIntegration,
  useResetPasswordIntegration,
  useActivateUserIntegration,
  useDeactivateUserIntegration,
} from '../../../lib';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  ArrowLeft,
  UserCheck,
  UserX,
  RefreshCw,
  Key,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../lib';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

export default function UsersDashboardIntegration() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Hooks para buscar dados do backend
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useUsersIntegration({
    page: currentPage,
    limit: 10,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useUserStatsIntegration();

  // Hooks de mutação
  const deleteUser = useDeleteUserIntegration();
  const resetPassword = useResetPasswordIntegration();
  const activateUser = useActivateUserIntegration();
  const deactivateUser = useDeactivateUserIntegration();

  // Dados processados
  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination;
  const stats = statsData?.data;

  // Função para verificar se é o usuário root (protegido)
  const isRootUser = (user: any) => {
    return (
      user?.userType === 'root' ||
      (user?.accessType === 'ADMIN' && user?.email === 'admin@groupwork.com.br')
    );
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para formatar data

  // Função para deletar usuário
  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync({ id, permanent: false });
      showSuccess('Usuário excluído com sucesso');
      setShowDeleteDialog(null);
    } catch (error) {
      showError('Erro ao excluir usuário');
      console.error('Erro ao deletar usuário:', error);
    }
  };

  // Função para resetar senha
  const handleResetPassword = async (id: string) => {
    try {
      await resetPassword.mutateAsync({
        userId: id,
        newPassword: newPassword || undefined,
        sendEmail: !newPassword,
      });
      showSuccess('Senha resetada com sucesso');
      setNewPassword('');
      setShowResetDialog(null);
    } catch (error) {
      showError('Erro ao resetar senha');
      console.error('Erro ao resetar senha:', error);
    }
  };

  // Função para ativar/desativar usuário
  const handleToggleStatus = async (user: any) => {
    try {
      if (user.isActive) {
        await deactivateUser.mutateAsync(user.id);
        showSuccess('Usuário desativado com sucesso');
      } else {
        await activateUser.mutateAsync(user.id);
        showSuccess('Usuário ativado com sucesso');
      }
    } catch (error) {
      showError('Erro ao alterar status do usuário');
      console.error('Erro ao alterar status:', error);
    }
  };

  // Loading state
  if (usersLoading || statsLoading) {
    return <LoadingSpinner text='Carregando usuários...' />;
  }

  // Error state
  if (usersError || statsError) {
    return (
      <div className='min-h-screen bg-transparent'>
        <div className='mx-8 py-8'>
          <ErrorMessage
            error={usersError || statsError}
            onRetry={() => {
              refetchUsers();
              refetchStats();
            }}
            onGoHome={() => navigate('/admin')}
            title='Erro ao carregar usuários'
            description='Não foi possível carregar os dados dos usuários.'
          />
        </div>
      </div>
    );
  }

  // Estatísticas processadas
  const processedStats = [
    {
      title: 'Total de Usuários',
      value: stats?.total || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Usuários Ativos',
      value: stats?.active || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Administradores',
      value: stats?.admins || 0,
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

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
                onClick={() => navigate('/admin')}
                className='text-slate-700 hover:text-slate-900 hover:bg-white/60 mb-2'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Voltar
              </Button>
              <h1 className='text-2xl font-bold text-slate-900'>
                Gerenciar Usuários
              </h1>
              <p className='text-slate-600 mt-1'>
                Gerencie usuários, permissões e acessos do sistema
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                onClick={() => navigate('/admin/users/new-integration')}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                <Plus className='w-4 h-4 mr-2' />
                Novo Usuário
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='p-6'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Estatísticas */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {processedStats.map((stat, index) => (
              <Card key={index} className='border border-slate-200 shadow-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-slate-600'>
                        {stat.title}
                      </p>
                      <p className='text-3xl font-bold text-slate-900'>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Lista de Usuários */}
          <Card className='border border-slate-200 shadow-sm'>
            <CardHeader className='bg-slate-50/50'>
              <CardTitle className='flex items-center gap-2'>
                <Users className='w-5 h-5 text-slate-600' />
                Usuários do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              {users.length === 0 ? (
                <div className='text-center py-12'>
                  <Users className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Nenhum usuário encontrado
                  </h3>
                  <p className='text-gray-500 mb-4'>
                    Comece criando seu primeiro usuário.
                  </p>
                  <Button
                    onClick={() => navigate('/admin/users/new-integration')}
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Criar Usuário
                  </Button>
                </div>
              ) : (
                <div className='divide-y divide-slate-200'>
                  {users.map(user => (
                    <div key={user.id} className='p-6 hover:bg-slate-50/50'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                          <Avatar className='w-12 h-12'>
                            <AvatarFallback className='bg-blue-100 text-blue-700'>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='flex items-center gap-2'>
                              <h3 className='text-lg font-medium text-slate-900'>
                                {user.name}
                              </h3>
                              {isRootUser(user) && (
                                <Badge
                                  variant='default'
                                  className='text-xs bg-amber-100 text-amber-800 border-amber-300'
                                >
                                  <Shield className='w-3 h-3 mr-1' />
                                  Root
                                </Badge>
                              )}
                            </div>
                            <p className='text-sm text-slate-600'>
                              {user.email}
                            </p>
                            <div className='flex items-center gap-2 mt-1'>
                              <Badge
                                variant={user.isActive ? 'default' : 'outline'}
                              >
                                {user.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                              <Badge variant='outline'>
                                {user.userType === 'root'
                                  ? 'Root'
                                  : user.userType === 'admin'
                                    ? 'Admin'
                                    : 'Usuário'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleToggleStatus(user)}
                            disabled={isRootUser(user)}
                            className={
                              user.isActive
                                ? 'text-orange-600 border-orange-300 hover:bg-orange-50'
                                : 'text-green-600 border-green-300 hover:bg-green-50'
                            }
                          >
                            {user.isActive ? (
                              <UserX className='w-4 h-4' />
                            ) : (
                              <UserCheck className='w-4 h-4' />
                            )}
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className='text-blue-600 border-blue-300 hover:bg-blue-50'
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              navigate(`/admin/users/${user.id}/permissions`)
                            }
                            className='text-purple-600 border-purple-300 hover:bg-purple-50'
                          >
                            <Settings className='w-4 h-4' />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='outline' size='sm'>
                                <MoreHorizontal className='w-4 h-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              {!isRootUser(user) && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => setShowResetDialog(user.id)}
                                    className='text-green-600'
                                  >
                                    <Key className='w-4 h-4 mr-2' />
                                    Resetar Senha
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(user.id)}
                                    className='text-red-600'
                                  >
                                    <Trash2 className='w-4 h-4 mr-2' />
                                    Excluir
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className='flex items-center justify-between'>
              <p className='text-sm text-slate-600'>
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                de {pagination.total} usuários
              </p>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrev}
                >
                  Anterior
                </Button>
                <span className='text-sm text-slate-600'>
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage(prev =>
                      Math.min(pagination.totalPages, prev + 1)
                    )
                  }
                  disabled={!pagination.hasNext}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Exclusão */}
      <Dialog
        open={!!showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowDeleteDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
              disabled={deleteUser.isPending}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleteUser.isPending ? (
                <LoadingSpinner size='sm' className='mr-2' />
              ) : (
                <Trash2 className='w-4 h-4 mr-2' />
              )}
              {deleteUser.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Reset de Senha */}
      <Dialog
        open={!!showResetDialog}
        onOpenChange={() => setShowResetDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para o usuário ou envie um email com
              instruções.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Nova Senha (opcional)
              </label>
              <input
                type='password'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder='Deixe em branco para enviar por email'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <p className='text-sm text-gray-500'>
                Se deixado em branco, um email será enviado com instruções para
                definir uma nova senha.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowResetDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                showResetDialog && handleResetPassword(showResetDialog)
              }
              disabled={resetPassword.isPending}
              className='bg-blue-600 hover:bg-blue-700'
            >
              {resetPassword.isPending ? (
                <LoadingSpinner size='sm' className='mr-2' />
              ) : (
                <RefreshCw className='w-4 h-4 mr-2' />
              )}
              {resetPassword.isPending ? 'Resetando...' : 'Resetar Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
