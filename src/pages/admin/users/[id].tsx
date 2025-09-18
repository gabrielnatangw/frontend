import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  User,
  Shield,
  AlertCircle,
  Trash2,
  Key,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { Button, LoadingSpinner, ErrorMessage } from '../../../components';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import {
  useUserIntegration,
  useUpdateUserIntegration,
  useDeleteUserIntegration,
  useResetPasswordIntegration,
  useNotifications,
  useRoles,
} from '../../../lib';
import type { UpdateUserRequest } from '../../../types/user-integration';

// Schema de validação
const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  userType: z.enum(['user', 'admin']),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export default function EditUserPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useNotifications();

  // Estados
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Buscar dados do usuário
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useUserIntegration(id || '');

  // Buscar roles para o campo Tipo de Acesso
  const { data: rolesData } = useRoles();

  // Função para verificar se é o usuário root (protegido)
  const isRootUser = (user: any) => {
    return (
      user?.userType === 'root' ||
      (user?.accessType === 'ADMIN' && user?.email === 'admin@groupwork.com.br')
    );
  };

  // Hooks de mutação
  const updateUser = useUpdateUserIntegration();
  const deleteUser = useDeleteUserIntegration();
  const resetPassword = useResetPasswordIntegration();

  // Formulário
  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      userType: 'user',
      isActive: true,
      notes: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = form;
  const watchedIsActive = watch('isActive');

  // Remover debug logs

  // Carregar dados do usuário no formulário
  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;

      reset({
        name: user.name || '',
        email: user.email || '',
        userType: user.userType === 'root' ? 'admin' : user.userType || 'user',
        isActive: user.isActive !== undefined ? user.isActive : true,
        // notes: user.notes || '', // Campo não existe na API
      });
    }
  }, [userData, reset]);

  // Loading state
  if (userLoading) {
    return <LoadingSpinner text='Carregando usuário...' />;
  }

  // Error state
  if (userError || !userData?.data) {
    return (
      <div className='min-h-screen bg-transparent'>
        <div className='mx-8 py-8'>
          <ErrorMessage
            error={userError}
            onRetry={() => refetchUser()}
            onGoHome={() => navigate('/admin/users')}
            title='Erro ao carregar usuário'
            description='Não foi possível carregar os dados do usuário.'
          />
        </div>
      </div>
    );
  }

  const user = userData.data;

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

  // Função para submeter formulário
  const onSubmit = async (data: UpdateUserFormData) => {
    if (!id) return;

    try {
      const userData: UpdateUserRequest = {
        name: data.name,
        email: data.email,
        // userType: data.userType, // Campo não existe na API
        isActive: data.isActive,
        notes: data.notes || undefined,
      };

      await updateUser.mutateAsync({ id, data: userData });
      showSuccess('Usuário atualizado com sucesso');
      navigate('/admin/users');
    } catch (error) {
      showError('Erro ao atualizar usuário');
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  // Função para deletar usuário
  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteUser.mutateAsync({ id, permanent: false });
      showSuccess('Usuário excluído com sucesso');
      navigate('/admin/users');
    } catch (error) {
      showError('Erro ao excluir usuário');
      console.error('Erro ao deletar usuário:', error);
    }
  };

  // Função para resetar senha
  const handleResetPassword = async () => {
    if (!id) return;

    setIsResettingPassword(true);
    try {
      await resetPassword.mutateAsync({
        userId: id,
        newPassword: newPassword || undefined,
        sendEmail: !newPassword,
      });
      showSuccess('Senha resetada com sucesso');
      setNewPassword('');
    } catch (error) {
      showError('Erro ao resetar senha');
      console.error('Erro ao resetar senha:', error);
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                onClick={() => navigate('/admin/users')}
                className='text-slate-700 hover:text-slate-900 hover:bg-white/60 mb-2'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Voltar
              </Button>
              <h1 className='text-2xl font-bold text-slate-900'>
                Editar Usuário
              </h1>
              <p className='text-slate-600 mt-1'>
                Edite as informações do usuário
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                onClick={() => navigate(`/admin/users/${id}/roles`)}
                variant='outline'
                className='text-blue-600 border-blue-300 hover:bg-blue-50'
              >
                <Shield className='w-4 h-4 mr-2' />
                Gerenciar Roles
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={updateUser.isPending}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                {updateUser.isPending ? (
                  <LoadingSpinner size='sm' className='mr-2' />
                ) : (
                  <Save className='w-4 h-4 mr-2' />
                )}
                {updateUser.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='p-6'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Informações do Usuário */}
          <Card className='border border-slate-200 shadow-sm'>
            <CardHeader className='bg-slate-50/50'>
              <div className='flex items-center gap-4'>
                <Avatar className='w-12 h-12'>
                  <AvatarImage src={''} alt={user.name} />
                  <AvatarFallback className='bg-blue-100 text-blue-700'>
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className='text-lg'>{user.name}</CardTitle>
                  <p className='text-sm text-slate-600'>{user.email}</p>
                  <div className='flex items-center gap-2 mt-2'>
                    <Badge variant={user.isActive ? 'default' : 'outline'}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant='outline'>
                      {user.userType === 'root'
                        ? 'Root'
                        : user.userType === 'admin'
                          ? 'Administrador'
                          : 'Usuário'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className='p-6'>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Nome */}
                  <div className='space-y-2'>
                    <Label htmlFor='name' className='text-sm font-medium'>
                      Nome Completo *
                    </Label>
                    <Input
                      id='name'
                      {...register('name')}
                      placeholder='Digite o nome completo'
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className='text-sm text-red-600 flex items-center gap-1'>
                        <AlertCircle className='w-4 h-4' />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className='space-y-2'>
                    <Label htmlFor='email' className='text-sm font-medium'>
                      Email *
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      {...register('email')}
                      placeholder='usuario@exemplo.com'
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className='text-sm text-red-600 flex items-center gap-1'>
                        <AlertCircle className='w-4 h-4' />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Tipo de Usuário */}
                  <div className='space-y-2'>
                    <Label htmlFor='userType' className='text-sm font-medium'>
                      Tipo de Usuário *
                    </Label>
                    <Select
                      value={watch('userType')}
                      onValueChange={value =>
                        setValue('userType', value as 'user' | 'admin')
                      }
                    >
                      <SelectTrigger
                        className={errors.userType ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder='Selecione o tipo de usuário' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='user'>
                          <div className='flex items-center gap-2'>
                            <User className='w-4 h-4 text-gray-600' />
                            <span>Usuário</span>
                          </div>
                        </SelectItem>
                        <SelectItem value='admin'>
                          <div className='flex items-center gap-2'>
                            <Shield className='w-4 h-4 text-red-600' />
                            <span>Administrador</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.userType && (
                      <p className='text-sm text-red-600 flex items-center gap-1'>
                        <AlertCircle className='w-4 h-4' />
                        {errors.userType.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Ativo/Inativo */}
                <div className='flex items-center justify-between p-4 bg-slate-50 rounded-lg'>
                  <div className='space-y-1'>
                    <Label htmlFor='isActive' className='text-sm font-medium'>
                      Usuário Ativo
                    </Label>
                    <p className='text-sm text-gray-600'>
                      {watchedIsActive
                        ? 'Usuário pode acessar o sistema'
                        : 'Usuário está desativado'}
                    </p>
                  </div>
                  <Switch
                    id='isActive'
                    checked={watchedIsActive}
                    onCheckedChange={checked => setValue('isActive', checked)}
                  />
                </div>

                {/* Observações */}
                <div className='space-y-2'>
                  <Label htmlFor='notes' className='text-sm font-medium'>
                    Observações
                  </Label>
                  <Textarea
                    id='notes'
                    {...register('notes')}
                    placeholder='Adicione observações sobre o usuário (opcional)'
                    rows={3}
                    className='resize-none'
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Informações de Sistema */}
            <Card className='border border-slate-200 shadow-sm'>
              <CardHeader className='bg-slate-50/50'>
                <CardTitle className='flex items-center gap-2 text-sm'>
                  <Settings className='w-4 h-4 text-slate-600' />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4 space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-slate-500'>ID:</span>
                  <span className='font-mono text-xs'>{user.id}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-slate-500'>Criado em:</span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-slate-500'>Última atualização:</span>
                  <span>{formatDate(user.updatedAt)}</span>
                </div>
                {user.lastLogin && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-slate-500'>Último login:</span>
                    <span>{formatDate(user.lastLogin)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card className='border border-slate-200 shadow-sm'>
              <CardHeader className='bg-slate-50/50'>
                <CardTitle className='flex items-center gap-2 text-sm'>
                  <Settings className='w-4 h-4 text-slate-600' />
                  Ações Rápidas
                  {isRootUser(userData?.data) && (
                    <Badge
                      variant='default'
                      className='text-xs bg-amber-100 text-amber-800 border-amber-300'
                    >
                      <Shield className='w-3 h-3 mr-1' />
                      Root - Protegido
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4 space-y-3'>
                <>
                  {/* Reset de Senha - não aparece para usuário root */}
                  {!isRootUser(userData?.data) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='w-full justify-start'
                          disabled={isResettingPassword}
                        >
                          {isResettingPassword ? (
                            <LoadingSpinner size='sm' className='mr-2' />
                          ) : (
                            <Key className='w-4 h-4 mr-2' />
                          )}
                          Resetar Senha
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Resetar Senha</DialogTitle>
                          <DialogDescription>
                            Defina uma nova senha para o usuário ou envie um
                            email com instruções.
                          </DialogDescription>
                        </DialogHeader>
                        <div className='space-y-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='newPassword'>
                              Nova Senha (opcional)
                            </Label>
                            <Input
                              id='newPassword'
                              type='password'
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              placeholder='Deixe em branco para enviar por email'
                            />
                            <p className='text-sm text-gray-500'>
                              Se deixado em branco, um email será enviado com
                              instruções para definir uma nova senha.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleResetPassword}
                            disabled={isResettingPassword}
                            className='bg-blue-600 hover:bg-blue-700'
                          >
                            {isResettingPassword ? (
                              <LoadingSpinner size='sm' className='mr-2' />
                            ) : (
                              <RefreshCw className='w-4 h-4 mr-2' />
                            )}
                            {isResettingPassword
                              ? 'Resetando...'
                              : 'Resetar Senha'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Excluir Usuário - não aparece para usuário root */}
                  {!isRootUser(userData?.data) && (
                    <Dialog
                      open={showDeleteDialog}
                      onOpenChange={setShowDeleteDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='w-full justify-start text-red-600 border-red-300 hover:bg-red-50'
                        >
                          <Trash2 className='w-4 h-4 mr-2' />
                          Excluir Usuário
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Excluir Usuário</DialogTitle>
                          <DialogDescription>
                            Tem certeza que deseja excluir este usuário? Esta
                            ação não pode ser desfeita.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant='outline'
                            onClick={() => setShowDeleteDialog(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleDelete}
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
                  )}
                </>
              </CardContent>
            </Card>

            {/* Informações sobre Roles */}
            {rolesData?.data?.roles && rolesData.data.roles.length > 0 && (
              <Card className='border border-slate-200 shadow-sm'>
                <CardHeader className='bg-slate-50/50'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <Shield className='w-4 h-4 text-slate-600' />
                    Roles Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-4'>
                  <p className='text-sm text-slate-600 mb-3'>
                    Para atribuir roles específicos a este usuário, use a página
                    de gerenciamento de permissões.
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                    {rolesData.data.roles.slice(0, 4).map((role: any) => (
                      <div
                        key={role.id}
                        className='flex items-center gap-2 p-2 bg-slate-50 rounded'
                      >
                        <Shield className='w-4 h-4 text-blue-600' />
                        <span className='text-sm font-medium'>{role.name}</span>
                      </div>
                    ))}
                    {rolesData.data.roles.length > 4 && (
                      <div className='flex items-center gap-2 p-2 bg-slate-50 rounded'>
                        <span className='text-sm text-gray-500'>
                          +{rolesData.data.roles.length - 4} outros roles
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
