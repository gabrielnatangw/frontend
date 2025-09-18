import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Label } from '../../components';
import { useAuth, useMe } from '../../lib/hooks/use-auth';
import { useUpdateUser } from '../../lib/hooks/use-users';
import { useNotifications } from '../../lib/hooks/use-notifications';
import { editProfileSchema } from '../../lib/schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Save, X, AlertCircle } from 'lucide-react';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { showSuccess, showError } = useNotifications();

  // Buscar dados do usuário atual usando a rota /api/auth/me
  const { data: meData, isLoading, error } = useMe();

  // Usar dados da API /auth/me ou fallback para dados do auth
  const user = meData?.user || authUser;

  // Hook para atualizar usuário
  const updateUserMutation = useUpdateUser();

  // Formulário para editar perfil
  const editProfileForm = useForm<{ name: string }>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: '',
    },
  });

  // Preencher formulário quando os dados do usuário chegarem
  useEffect(() => {
    if (user) {
      editProfileForm.reset({
        name: user.name || '',
      });
    }
  }, [user, editProfileForm]);

  // Função para submeter alterações
  const onSubmit = async (data: { name: string }) => {
    if (!user?.id) {
      showError('ID do usuário não encontrado');
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: data,
      });
      showSuccess('Perfil atualizado com sucesso!');

      // Aguardar um pouco para garantir que o store foi atualizado
      setTimeout(() => {
        navigate('/p-trace/profile');
      }, 100);
    } catch (error: any) {
      showError(error?.message || 'Erro ao atualizar perfil');
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
            <h1 className='text-2xl font-bold text-gray-900'>Editar Perfil</h1>
            <p className='text-gray-600'>Atualizar informações pessoais</p>
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
                <div className='h-4 bg-gray-200 rounded w-1/3'></div>
              </div>
              <div className='space-y-2'>
                <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                <div className='h-10 bg-gray-200 rounded w-full'></div>
                <div className='h-4 bg-gray-200 rounded w-1/3'></div>
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
            <h1 className='text-2xl font-bold text-gray-900'>Editar Perfil</h1>
            <p className='text-gray-600'>Atualizar informações pessoais</p>
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
            <h1 className='text-2xl font-bold text-gray-900'>Editar Perfil</h1>
            <p className='text-gray-600'>Atualizar informações pessoais</p>
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
          <h1 className='text-2xl font-bold text-gray-900'>Editar Perfil</h1>
          <p className='text-gray-600'>Atualizar informações pessoais</p>
        </div>
      </div>

      {/* Formulário de edição */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='p-2 bg-blue-50 rounded-lg'>
            <User className='w-5 h-5 text-blue-600' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>
              Informações Pessoais
            </h2>
            <p className='text-sm text-gray-600'>
              Atualize seus dados pessoais
            </p>
          </div>
        </div>

        <form
          onSubmit={editProfileForm.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          {/* Nome */}
          <div className='space-y-2'>
            <Label htmlFor='name'>Nome Completo *</Label>
            <Input
              id='name'
              placeholder='Digite seu nome completo'
              {...editProfileForm.register('name')}
              className={
                editProfileForm.formState.errors.name ? 'border-red-500' : ''
              }
            />
            <p className='text-sm text-gray-500'>Máximo 100 caracteres</p>
            {editProfileForm.formState.errors.name && (
              <p className='text-sm text-red-600'>
                {editProfileForm.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Email - Somente leitura */}
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={user.email || ''}
              readOnly
              className='bg-gray-50 text-gray-600 cursor-not-allowed'
            />
            <p className='text-sm text-gray-500'>
              O email não pode ser alterado por questões de segurança
            </p>
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
              disabled={updateUserMutation.isPending}
              className='flex items-center gap-2'
            >
              <Save className='w-4 h-4' />
              {updateUserMutation.isPending
                ? 'Salvando...'
                : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
