import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  User,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../../components';
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
import { useCreateUserIntegration, useRoles } from '../../../lib';
import type { CreateUserRequest } from '../../../types/user-integration';

// Schema de validação
const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  userType: z.enum(['user', 'admin']),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function NewUserIntegrationPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Hook para buscar roles
  const { data: rolesData } = useRoles();

  // Hook para criar usuário
  const createUser = useCreateUserIntegration();

  // Formulário
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
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
  } = form;

  const watchedIsActive = watch('isActive');

  // Função para submeter formulário
  const onSubmit = async (data: CreateUserFormData) => {
    try {
      const userData: CreateUserRequest = {
        name: data.name,
        email: data.email,
        password: data.password,
        userType: data.userType,
        isActive: data.isActive,
        notes: data.notes || undefined,
      };

      await createUser.mutateAsync(userData);
      navigate('/admin/users');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
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
                onClick={() => navigate('/admin/users')}
                className='text-slate-700 hover:text-slate-900 hover:bg-white/60 mb-2'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Voltar
              </Button>
              <h1 className='text-2xl font-bold text-slate-900'>
                Criar Novo Usuário
              </h1>
              <p className='text-slate-600 mt-1'>
                Crie um novo usuário no sistema
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={createUser.isPending}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                {createUser.isPending ? (
                  <LoadingSpinner size='sm' className='mr-2' />
                ) : (
                  <Save className='w-4 h-4 mr-2' />
                )}
                {createUser.isPending ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='p-6'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Formulário de Criação */}
          <Card className='border border-slate-200 shadow-sm'>
            <CardHeader className='bg-slate-50/50'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <User className='w-5 h-5 text-slate-600' />
                Informações do Usuário
              </CardTitle>
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

                  {/* Senha */}
                  <div className='space-y-2'>
                    <Label htmlFor='password' className='text-sm font-medium'>
                      Senha *
                    </Label>
                    <div className='relative'>
                      <Input
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder='Digite a senha'
                        className={
                          errors.password ? 'border-red-500 pr-10' : 'pr-10'
                        }
                      />
                      <Button
                        type='button'
                        variant='text'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className='text-sm text-red-600 flex items-center gap-1'>
                        <AlertCircle className='w-4 h-4' />
                        {errors.password.message}
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
                  Após criar o usuário, você poderá atribuir roles específicos
                  na página de edição.
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
  );
}
