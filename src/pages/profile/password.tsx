import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Label } from '../../components';
import {
  useAuth,
  useMe,
  useChangePasswordProfile,
} from '../../lib/hooks/use-auth';
import { useSetPassword } from '../../lib/hooks/use-users';
import { useNotifications } from '../../lib/hooks/use-notifications';
import { changePasswordSchema } from '../../lib/schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { ChangePasswordRequest } from '../../types/user';
import { z } from 'zod';

// Tipo local para o formulário de confirmação de senha
interface SetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

// Schema local para validação de confirmação de senha
const setPasswordFormSchema = z
  .object({
    newPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export default function ProfilePasswordPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { showSuccess, showError } = useNotifications();

  // Buscar dados do usuário atual usando a rota /api/auth/me
  const { data: meData, isLoading, error } = useMe();

  // Usar dados da API /auth/me ou fallback para dados do auth
  const user = meData?.user || authUser;

  // Estados para visibilidade das senhas
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Hooks para alterar senha
  const changePasswordMutation = useChangePasswordProfile();
  const setPasswordMutation = useSetPassword();

  // Formulário para alterar senha (usuários existentes)
  const changePasswordForm = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  // Formulário para definir senha (primeiro login)
  const setPasswordForm = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Função para alterar senha
  const onSubmitChangePassword = async (data: ChangePasswordRequest) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      showSuccess('Senha alterada com sucesso!');
      changePasswordForm.reset();
      navigate('/p-trace/profile');
    } catch (error: any) {
      showError(error?.message || 'Erro ao alterar senha');
    }
  };

  // Função para definir senha (primeiro login)
  const onSubmitSetPassword = async (data: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!user?.id) {
      showError('ID do usuário não encontrado');
      return;
    }

    try {
      await setPasswordMutation.mutateAsync({
        id: user.id,
        data: { newPassword: data.newPassword },
      });
      showSuccess('Senha definida com sucesso!');
      setPasswordForm.reset();
      navigate('/p-trace/profile');
    } catch (error: any) {
      showError(error?.message || 'Erro ao definir senha');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='w-full'>
        <div className='flex items-center gap-3 mb-6'>
          <button
            onClick={() => navigate('/p-trace/profile')}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label='Voltar para perfil'
          >
            <ArrowLeft className='w-5 h-5 text-gray-600' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Alterar Senha</h1>
            <p className='text-gray-600'>Gerenciar segurança da conta</p>
          </div>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='animate-pulse'>
            <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2 mb-6'></div>
            <div className='space-y-6'>
              <div className='space-y-2'>
                <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                <div className='h-10 bg-gray-200 rounded w-full'></div>
              </div>
              <div className='space-y-2'>
                <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                <div className='h-10 bg-gray-200 rounded w-full'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='w-full'>
        <div className='flex items-center gap-3 mb-6'>
          <button
            onClick={() => navigate('/p-trace/profile')}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label='Voltar para perfil'
          >
            <ArrowLeft className='w-5 h-5 text-gray-600' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Alterar Senha</h1>
            <p className='text-gray-600'>Gerenciar segurança da conta</p>
          </div>
        </div>

        <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
          <div className='flex items-center gap-3'>
            <AlertCircle className='w-6 h-6 text-red-500' />
            <div>
              <h3 className='text-lg font-semibold text-red-800'>
                Erro ao carregar perfil
              </h3>
              <p className='text-red-600'>
                Não foi possível carregar os dados do perfil. Tente novamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se não tiver usuário, mostrar erro
  if (!user) {
    return (
      <div className='w-full'>
        <div className='flex items-center gap-3 mb-6'>
          <button
            onClick={() => navigate('/p-trace/profile')}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label='Voltar para perfil'
          >
            <ArrowLeft className='w-5 h-5 text-gray-600' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Alterar Senha</h1>
            <p className='text-gray-600'>Gerenciar segurança da conta</p>
          </div>
        </div>

        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6'>
          <div className='flex items-center gap-3'>
            <AlertCircle className='w-6 h-6 text-yellow-500' />
            <div>
              <h3 className='text-lg font-semibold text-yellow-800'>
                Usuário não encontrado
              </h3>
              <p className='text-yellow-600'>
                Não foi possível identificar o usuário logado.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Header com botão voltar */}
      <div className='flex items-center gap-3 mb-6'>
        <button
          onClick={() => navigate('/p-trace/profile')}
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          aria-label='Voltar para perfil'
        >
          <ArrowLeft className='w-5 h-5 text-gray-600' />
        </button>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Alterar Senha</h1>
          <p className='text-gray-600'>Gerenciar segurança da conta</p>
        </div>
      </div>

      {/* Formulário de alterar senha */}
      {!user.firstLogin ? (
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-blue-50 rounded-lg'>
              <Lock className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Alterar Senha
              </h2>
              <p className='text-sm text-gray-600'>Atualize sua senha atual</p>
            </div>
          </div>

          <form
            onSubmit={changePasswordForm.handleSubmit(onSubmitChangePassword)}
            className='space-y-6'
          >
            {/* Senha Atual */}
            <div className='space-y-2'>
              <Label htmlFor='currentPassword'>Senha Atual *</Label>
              <div className='relative'>
                <Input
                  id='currentPassword'
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder='Digite sua senha atual'
                  {...changePasswordForm.register('currentPassword')}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showCurrentPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              {changePasswordForm.formState.errors.currentPassword && (
                <p className='text-sm text-red-600'>
                  {changePasswordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* Nova Senha */}
            <div className='space-y-2'>
              <Label htmlFor='newPassword'>Nova Senha *</Label>
              <div className='relative'>
                <Input
                  id='newPassword'
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder='Digite sua nova senha'
                  {...changePasswordForm.register('newPassword')}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showNewPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              <p className='text-sm text-gray-500'>Mínimo 6 caracteres</p>
              {changePasswordForm.formState.errors.newPassword && (
                <p className='text-sm text-red-600'>
                  {changePasswordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Botões de ação */}
            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/p-trace/profile')}
                className='flex items-center gap-2'
              >
                <X className='w-4 h-4' />
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={changePasswordMutation.isPending}
                className='flex items-center gap-2'
              >
                <Check className='w-4 h-4' />
                {changePasswordMutation.isPending
                  ? 'Alterando...'
                  : 'Alterar Senha'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* Formulário para primeiro login */
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-yellow-50 rounded-lg'>
              <Lock className='w-5 h-5 text-yellow-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Definir Nova Senha (Primeiro Login)
              </h2>
              <p className='text-sm text-gray-600'>
                Configure sua senha inicial
              </p>
            </div>
          </div>

          {/* Alerta de primeiro acesso */}
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
            <p className='text-sm text-yellow-800'>
              <strong>Primeiro acesso:</strong> Como este é seu primeiro login,
              você precisa definir uma senha para sua conta.
            </p>
          </div>

          <form
            onSubmit={setPasswordForm.handleSubmit(onSubmitSetPassword)}
            className='space-y-6'
          >
            {/* Nova Senha */}
            <div className='space-y-2'>
              <Label htmlFor='newPassword'>Nova Senha *</Label>
              <div className='relative'>
                <Input
                  id='newPassword'
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder='Digite sua nova senha'
                  {...setPasswordForm.register('newPassword')}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showNewPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              <p className='text-sm text-gray-500'>Mínimo 6 caracteres</p>
              {setPasswordForm.formState.errors.newPassword && (
                <p className='text-sm text-red-600'>
                  {setPasswordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirmar Nova Senha *</Label>
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirme sua nova senha'
                  {...setPasswordForm.register('confirmPassword')}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              <p className='text-sm text-gray-500'>
                Digite a mesma senha para confirmar
              </p>
              {setPasswordForm.formState.errors.confirmPassword && (
                <p className='text-sm text-red-600'>
                  {setPasswordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Botões de ação */}
            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/p-trace/profile')}
                className='flex items-center gap-2'
              >
                <X className='w-4 h-4' />
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={setPasswordMutation.isPending}
                className='flex items-center gap-2'
              >
                <Lock className='w-4 h-4' />
                {setPasswordMutation.isPending
                  ? 'Definindo...'
                  : 'Definir Senha'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
