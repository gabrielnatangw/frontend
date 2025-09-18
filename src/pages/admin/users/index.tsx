import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../components/ui/error-message';
import { Label } from '../../../components/ui/label';
import { useUsers, useDeleteUser, useResetPassword } from '../../../lib';
import { useRoles } from '../../../lib';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  Calendar,
  RefreshCw,
  Key,
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

export default function UsersDashboard() {
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
  } = useUsers({
    page: currentPage,
    limit: 10,
  });

  // Hook para buscar roles
  const { data: rolesData } = useRoles();

  // Hooks de mutação
  const deleteUser = useDeleteUser();
  const resetPassword = useResetPassword();

  // Dados processados
  const users = usersData?.data?.users || [];

  // Calcular estatísticas dos dados reais
  const stats = {
    total: users.length,
    active: users.filter(user => user.isActive).length,
    inactive: users.filter(user => !user.isActive).length,
    newToday: users.filter(user => {
      const today = new Date();
      const userDate = new Date(user.createdAt);
      return userDate.toDateString() === today.toDateString();
    }).length,
  };

  // Mapear dados dos usuários para exibição
  const mappedUsers = users
    .map(user => {
      // Verificar se o usuário é válido
      if (!user || typeof user !== 'object') {
        return null;
      }

      // Verificar se o ID existe e é válido
      const userId = user.id;

      if (!userId) {
        return null;
      }

      return {
        ...user,
        id: userId, // Garantir que o ID está correto
        status: user.isActive ? 'active' : 'inactive',
        accessTypeDisplay:
          rolesData?.data?.roles?.find(
            (role: any) => role.id === user.accessType
          )?.name ||
          user.userType ||
          'Usuário',
      };
    })
    .filter(Boolean); // Remove usuários inválidos

  // Loading state
  if (usersLoading) {
    return <LoadingSpinner text='Carregando usuários...' />;
  }

  // Error state
  if (usersError) {
    return (
      <ErrorMessage
        error={usersError}
        onRetry={() => {
          refetchUsers();
        }}
      />
    );
  }

  // Processar estatísticas para exibição
  const processedStats = [
    {
      title: 'Total de Usuários',
      value: stats.total.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Usuários Ativos',
      value: stats.active.toString(),
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Usuários Inativos',
      value: stats.inactive.toString(),
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  // Função para obter badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge
            variant='default'
            className='bg-green-100 text-green-800 hover:bg-green-200'
          >
            <CheckCircle className='w-3 h-3 mr-1' />
            Ativo
          </Badge>
        );
      case 'inactive':
        return (
          <Badge
            variant='destructive'
            className='bg-red-100 text-red-800 hover:bg-red-200'
          >
            <XCircle className='w-3 h-3 mr-1' />
            Inativo
          </Badge>
        );
      default:
        return (
          <Badge variant='outline'>
            <Clock className='w-3 h-3 mr-1' />
            {status}
          </Badge>
        );
    }
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para verificar se é o usuário root (protegido)
  const isRootUser = (user: any) => {
    return (
      user.userType === 'root' ||
      (user.accessType === 'ADMIN' && user.email === 'admin@groupwork.com.br')
    );
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não disponível';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Data inválida:', dateString);
      return 'Data inválida';
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Função para formatar data e hora
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Data não disponível';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Data inválida:', dateString);
      return 'Data inválida';
    }

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Função para deletar usuário
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser.mutateAsync({ id: userId, permanent: false });
      showSuccess('Usuário excluído com sucesso');
      setShowDeleteDialog(null);
    } catch (error) {
      showError('Erro ao excluir usuário');
      console.error('Erro ao deletar usuário:', error);
    }
  };

  // Função para resetar senha
  const handleResetPassword = async (userId: string) => {
    try {
      await resetPassword.mutateAsync({
        userId,
        newPassword: newPassword || undefined,
        sendEmail: !newPassword,
      });
      showSuccess('Senha resetada com sucesso');
      setShowResetDialog(null);
      setNewPassword('');
    } catch (error) {
      showError('Erro ao resetar senha');
      console.error('Erro ao resetar senha:', error);
    }
  };

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
                Gerencie usuários e suas permissões
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                onClick={() => navigate('/admin/users/new')}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                <Plus className='w-4 h-4 mr-2' />
                Novo Usuário
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='p-6 space-y-6'>
        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {processedStats.map((stat, index) => {
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

        {/* Lista de Usuários */}
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <Users className='w-5 h-5 text-blue-600' />
              Usuários do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            {users.length === 0 ? (
              <div className='text-center py-12'>
                <Users className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Nenhum usuário encontrado
                </h3>
                <p className='text-gray-500 mb-4'>
                  Nenhum usuário encontrado. Comece criando seu primeiro
                  usuário.
                </p>
                <Button
                  onClick={() => navigate('/admin/users/new')}
                  className='bg-blue-600 hover:bg-blue-700 text-white'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Criar Primeiro Usuário
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {mappedUsers.map(user => (
                  <div
                    key={user.id}
                    className='group border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <Avatar className='w-12 h-12'>
                          <AvatarFallback className='bg-blue-100 text-blue-800 font-semibold'>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3 className='text-sm font-medium text-gray-900 truncate'>
                              {user.name}
                            </h3>
                            {getStatusBadge(user.status)}
                          </div>
                          <p className='text-sm text-gray-500 truncate'>
                            {user.email}
                          </p>
                          <div className='flex items-center gap-4 mt-1 text-xs text-gray-500'>
                            <span className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              Criado em {formatDate(user.createdAt)}
                            </span>
                            {user.lastLogin && (
                              <span className='flex items-center gap-1'>
                                <Clock className='w-3 h-3' />
                                Último login: {formatDateTime(user.lastLogin)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {user.accessTypeDisplay}
                        </Badge>
                        {/* Badge especial para usuário root */}
                        {isRootUser(user) && (
                          <Badge
                            variant='default'
                            className='text-xs bg-amber-100 text-amber-800 border-amber-300'
                          >
                            <Shield className='w-3 h-3 mr-1' />
                            Root
                          </Badge>
                        )}
                        <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              if (!user.id) {
                                console.error(
                                  'Cannot edit user: ID is undefined',
                                  user
                                );
                                showError('Erro: ID do usuário não encontrado');
                                return;
                              }
                              navigate(`/admin/users/${user.id}`);
                            }}
                            className='text-blue-600 border-blue-300 hover:bg-blue-50'
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              if (!user.id) {
                                console.error(
                                  'Cannot manage roles: ID is undefined',
                                  user
                                );
                                showError('Erro: ID do usuário não encontrado');
                                return;
                              }
                              navigate(`/admin/users/${user.id}/roles`);
                            }}
                            className='text-purple-600 border-purple-300 hover:bg-purple-50'
                          >
                            <Shield className='w-4 h-4' />
                          </Button>
                          {/* Botão de resetar senha - não aparece para usuário root */}
                          {!isRootUser(user) && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setShowResetDialog(user.id)}
                              className='text-green-600 border-green-300 hover:bg-green-50'
                            >
                              <Key className='w-4 h-4' />
                            </Button>
                          )}
                          {/* Botão de deletar - não aparece para usuário root */}
                          {!isRootUser(user) && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setShowDeleteDialog(user.id)}
                              className='text-red-600 border-red-300 hover:bg-red-50'
                            >
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Controles de Paginação */}
            {mappedUsers.length > 0 && (
              <div className='flex items-center justify-between mt-6 pt-4 border-t border-gray-200'>
                <div className='flex items-center text-sm text-gray-700'>
                  <span>Mostrando {mappedUsers.length} usuários</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setCurrentPage(prev => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className='text-gray-700 hover:bg-gray-50'
                  >
                    Anterior
                  </Button>
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-gray-700 hover:bg-gray-50'
                    >
                      {currentPage}
                    </Button>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={mappedUsers.length < 10}
                    className='text-gray-700 hover:bg-gray-50'
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de Exclusão */}
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
              onClick={() =>
                showDeleteDialog && handleDeleteUser(showDeleteDialog)
              }
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

      {/* Diálogo de Reset de Senha */}
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
              <Label htmlFor='newPassword'>Nova Senha (opcional)</Label>
              <Input
                id='newPassword'
                type='password'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder='Deixe em branco para enviar por email'
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
              className='bg-green-600 hover:bg-green-700'
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
