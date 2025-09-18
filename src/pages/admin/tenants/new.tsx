import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  X,
  Settings,
  Edit,
  Check,
  Building,
  User,
} from 'lucide-react';
import { Button, Stepper, Input, Label } from '../../../components';
import { useCreateTenantWithAdmin, useNotifications } from '../../../lib';

// Função para formatar CNPJ - versão atualizada
const formatCNPJ = (value: string) => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');

  // Aplica a máscara do CNPJ: XX.XXX.XXX/XXXX-XX
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  } else if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  } else {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }
};

// Schema de validação Zod para tenant e admin
const tenantAdminSchema = z
  .object({
    // Dados do Tenant
    name: z.string().min(1, 'Nome da empresa é obrigatório'),
    cnpj: z
      .string()
      .min(1, 'CNPJ é obrigatório')
      .refine(val => {
        const numbers = val.replace(/\D/g, '');
        return numbers.length === 14;
      }, 'CNPJ deve ter 14 dígitos'),
    address: z.string().min(1, 'Endereço é obrigatório'),
    isActive: z.boolean(),

    // Dados do Admin
    adminName: z.string().min(1, 'Nome do administrador é obrigatório'),
    adminEmail: z.string().email('Email inválido'),
    adminPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine(data => data.adminPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

type TenantAdminFormData = z.infer<typeof tenantAdminSchema>;

export default function NewTenantPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [editingField, setEditingField] = useState<
    keyof TenantAdminFormData | null
  >(null);
  const [editValue, setEditValue] = useState('');

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm<TenantAdminFormData>({
    resolver: zodResolver(tenantAdminSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      cnpj: '',
      address: '',
      isActive: true,
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: '',
    },
  });

  // Hook para criar tenant com admin
  const createTenantWithAdminMutation = useCreateTenantWithAdmin();

  // Hook para notificações
  const { showCreateSuccess, showCreateError, showValidationError } =
    useNotifications();

  const formData = watch();

  // Debug: Log do estado de validação
  React.useEffect(() => {
    console.log('Estado de validação:', {
      isValid,
      hasErrors: Object.keys(errors).length > 0,
      currentStep,
      editingField,
    });
  }, [isValid, errors, currentStep, editingField]);

  // Debug: Log dos dados do formulário
  React.useEffect(() => {
    console.log('Dados do formulário (formData):', formData);
  }, [formData]);

  const nextStep = async () => {
    if (currentStep < 2) {
      // Validar campos do step atual antes de avançar
      let fieldsToValidate: (keyof TenantAdminFormData)[] = [];

      if (currentStep === 0) {
        fieldsToValidate = ['name', 'cnpj', 'address'];
      } else if (currentStep === 1) {
        fieldsToValidate = [
          'adminName',
          'adminEmail',
          'adminPassword',
          'confirmPassword',
        ];
      }

      const isValidStep = await trigger(fieldsToValidate);
      if (isValidStep) {
        setCurrentStep(currentStep + 1);
      } else {
        console.log('Validação falhou para o step atual');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const startEditing = (
    field: keyof TenantAdminFormData,
    currentValue: string | boolean
  ) => {
    setEditingField(field);
    setEditValue(currentValue.toString());
  };

  const confirmEdit = () => {
    if (editingField) {
      const value =
        editingField === 'isActive' ? editValue === 'true' : editValue;
      setValue(editingField, value as any);
      setEditingField(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderEditableField = (
    field: keyof TenantAdminFormData,
    label: string,
    value: string | boolean,
    type: 'text' | 'boolean' = 'text'
  ) => {
    const isEditing = editingField === field;
    const fieldError = errors[field];

    return (
      <div className='py-2 border-b border-zinc-100'>
        <div className='flex items-center justify-between'>
          <span className='font-medium text-zinc-700'>{label}:</span>
          <div className='flex items-center gap-2'>
            {isEditing ? (
              <>
                {type === 'boolean' ? (
                  <select
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className='w-32 text-sm border border-gray-300 rounded px-2 py-1'
                    autoFocus
                  >
                    <option value='true'>Ativo</option>
                    <option value='false'>Inativo</option>
                  </select>
                ) : (
                  <Input
                    type={field.includes('Password') ? 'password' : 'text'}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    className='w-32 text-sm'
                    autoFocus
                  />
                )}
                <button
                  onClick={confirmEdit}
                  className='p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded'
                  title='Confirmar'
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={cancelEdit}
                  className='p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded'
                  title='Cancelar'
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className='text-zinc-900'>
                  {type === 'boolean'
                    ? value
                      ? 'Ativo'
                      : 'Inativo'
                    : value || 'Não informado'}
                </span>
                <button
                  onClick={() => startEditing(field, value)}
                  className='p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded'
                  title='Editar'
                >
                  <Edit size={14} />
                </button>
              </>
            )}
          </div>
        </div>
        {fieldError && (
          <p className='text-xs text-red-600 mt-1'>{fieldError.message}</p>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold text-zinc-900 flex items-center gap-2'>
              <Building size={20} className='text-blue-600' />
              Informações do Tenant
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Dados principais do tenant e configurações
            </p>

            <div className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nome da Empresa *</Label>
                <Input
                  {...register('name')}
                  placeholder='Ex: Empresa ABC Ltda, Cliente XYZ S.A.'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className='text-xs text-red-600'>{errors.name.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='cnpj'>CNPJ *</Label>
                <Input
                  placeholder='Ex: 12.345.678/0001-90'
                  maxLength={18}
                  {...register('cnpj', {
                    onChange: e => {
                      const formatted = formatCNPJ(e.target.value);
                      setValue('cnpj', formatted);
                    },
                  })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.cnpj ? 'border-red-500' : ''}
                />
                {errors.cnpj && (
                  <p className='text-xs text-red-600'>{errors.cnpj.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='address'>Endereço *</Label>
                <Input
                  {...register('address')}
                  placeholder='Ex: Rua Exemplo, 123 - Bairro, Cidade - UF'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className='text-xs text-red-600'>
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold text-zinc-900 flex items-center gap-2'>
              <User size={20} className='text-green-600' />
              Administrador do Tenant
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Dados do administrador que gerenciará este tenant
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='adminName'>Nome do Administrador *</Label>
                <Input
                  {...register('adminName')}
                  placeholder='Ex: João Silva, Maria Santos'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.adminName ? 'border-red-500' : ''}
                />
                {errors.adminName && (
                  <p className='text-xs text-red-600'>
                    {errors.adminName.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='adminEmail'>Email *</Label>
                <Input
                  {...register('adminEmail')}
                  type='email'
                  placeholder='Ex: admin@empresa.com'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.adminEmail ? 'border-red-500' : ''}
                />
                {errors.adminEmail && (
                  <p className='text-xs text-red-600'>
                    {errors.adminEmail.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='adminPassword'>Senha *</Label>
                <Input
                  {...register('adminPassword')}
                  type='password'
                  placeholder='Mínimo 6 caracteres'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.adminPassword ? 'border-red-500' : ''}
                />
                {errors.adminPassword && (
                  <p className='text-xs text-red-600'>
                    {errors.adminPassword.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirmar Senha *</Label>
                <Input
                  {...register('confirmPassword')}
                  type='password'
                  placeholder='Digite a senha novamente'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className='text-xs text-red-600'>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold text-zinc-900 flex items-center gap-2'>
              <Settings size={20} className='text-purple-600' />
              Revisão e Confirmação
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Revise todos os dados e faça ajustes se necessário
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Dados do Tenant */}
              <div className='bg-white border border-zinc-200 rounded-lg p-6'>
                <h4 className='font-medium text-zinc-900 mb-4 flex items-center gap-2'>
                  <Building size={16} className='text-blue-600' />
                  Dados do Tenant
                </h4>
                <div className='space-y-1'>
                  {renderEditableField(
                    'name',
                    'Nome',
                    formData.name || 'Não informado'
                  )}
                  {renderEditableField(
                    'cnpj',
                    'CNPJ',
                    formData.cnpj || 'Não informado'
                  )}
                  {renderEditableField(
                    'address',
                    'Endereço',
                    formData.address || 'Não informado'
                  )}
                  {renderEditableField(
                    'isActive',
                    'Status',
                    formData.isActive,
                    'boolean'
                  )}
                </div>
              </div>

              {/* Dados do Admin */}
              <div className='bg-white border border-zinc-200 rounded-lg p-6'>
                <h4 className='font-medium text-zinc-900 mb-4 flex items-center gap-2'>
                  <User size={16} className='text-green-600' />
                  Administrador
                </h4>
                <div className='space-y-1'>
                  {renderEditableField(
                    'adminName',
                    'Nome',
                    formData.adminName || 'Não informado'
                  )}
                  {renderEditableField(
                    'adminEmail',
                    'Email',
                    formData.adminEmail || 'Não informado'
                  )}
                  {renderEditableField(
                    'adminPassword',
                    'Senha',
                    '••••••',
                    'text'
                  )}
                </div>
              </div>
            </div>

            {editingField && (
              <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <strong>Editando:</strong> {editingField}
                </p>
                <p className='text-xs text-blue-600 mt-1'>
                  Clique no check verde para confirmar ou no X para cancelar
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const onSubmit = async (data: TenantAdminFormData) => {
    console.log('Submetendo formulário:', {
      isValid,
      errors: Object.keys(errors),
    });

    try {
      // Converter dados para o formato esperado pela API
      const tenantData = {
        name: data.name,
        cnpj: data.cnpj, // Mantém a formatação (XX.XXX.XXX/XXXX-XX)
        address: data.address,
        isActive: data.isActive,
        adminUser: {
          name: data.adminName,
          email: data.adminEmail,
          password: data.adminPassword,
          accessType: 'ADMIN' as const,
        },
      };

      console.log('Dados do tenant e admin a serem enviados:', tenantData);

      // Criar tenant com admin via API
      await createTenantWithAdminMutation.mutateAsync(tenantData);

      // Sucesso! Mostrar notificação e redirecionar
      showCreateSuccess('Tenant e Administrador');
      navigate('/admin/tenants');
    } catch (error: unknown) {
      console.error('❌ Erro ao criar tenant:', error);

      // Tratar diferentes tipos de erro
      const err = error as {
        response?: {
          data?: { errors?: Array<{ field: string; message: string }> };
          status?: number;
        };
        status?: number;
      };
      if (err.response?.data?.errors) {
        showValidationError(err.response.data.errors);
      } else if (err.response?.status === 409) {
        showCreateError('Tenant', error);
      } else if (err.response?.status && err.response.status >= 500) {
        showCreateError('Tenant', {
          message: 'Erro no servidor. Tente novamente mais tarde.',
        });
      } else if (!err.response) {
        showCreateError('Tenant', {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        });
      } else {
        showCreateError('Tenant', error);
      }
    }
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='py-4'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            colorScheme='default'
            size='md'
            onClick={() => navigate('/admin/tenants')}
            className='flex items-center gap-2'
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
          <h1 className='text-2xl font-bold text-zinc-900'>Novo Tenant</h1>
        </div>
      </div>

      {/* Container - dividido em 3 partes no eixo Y */}
      <div className='flex-1'>
        <form
          onSubmit={handleSubmit(data => {
            onSubmit(data as unknown as TenantAdminFormData);
          })}
          className='h-full'
        >
          <div className='bg-white border border-zinc-200 rounded-lg h-full flex flex-col'>
            {/* Primeira parte - Wizard/Stepper */}
            <div className='px-6 py-6'>
              <Stepper
                steps={[
                  { label: 'Informações do Tenant' },
                  { label: 'Administrador' },
                  { label: 'Revisão e Confirmação' },
                ]}
                current={currentStep}
                variant='wizard'
                onStepChange={stepIndex => {
                  console.log('Mudando para step:', stepIndex);
                }}
              />
            </div>

            {/* Segunda parte - Formulário (expande e preenche o espaço) */}
            <div className='flex-1 px-6 py-6'>{renderStepContent()}</div>

            {/* Terceira parte - Footer com botões */}
            <div className='px-6 py-4 border-t border-zinc-200'>
              <div className='flex items-center justify-between'>
                {/* Lado esquerdo - Botão Cancelar */}
                <Button
                  type='button'
                  variant='outline'
                  colorScheme='default'
                  size='lg'
                  onClick={() => navigate('/admin/tenants')}
                  className='flex items-center gap-2'
                >
                  <X size={16} />
                  Cancelar
                </Button>

                {/* Lado direito - Botões Voltar e Próximo/Criar Tenant */}
                <div className='flex items-center gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    colorScheme='default'
                    size='lg'
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className='flex items-center gap-2'
                  >
                    <ArrowLeft size={16} />
                    Voltar
                  </Button>

                  {currentStep < 2 ? (
                    // Botão "Próximo" para os passos 0 e 1
                    <Button
                      type='button'
                      variant='contained'
                      colorScheme='primary'
                      size='lg'
                      onClick={e => {
                        e.preventDefault();
                        nextStep();
                      }}
                      disabled={
                        editingField !== null ||
                        createTenantWithAdminMutation.isPending
                      }
                      className='flex items-center gap-2'
                    >
                      Próximo
                      <ArrowRight size={16} />
                    </Button>
                  ) : (
                    // Botão "Criar Tenant" para o passo 2 (submissão do formulário)
                    <Button
                      type='submit'
                      variant='contained'
                      colorScheme='primary'
                      size='lg'
                      disabled={
                        editingField !== null ||
                        createTenantWithAdminMutation.isPending
                      }
                      onClick={() => {
                        console.log('Criando tenant...');
                      }}
                      className='flex items-center gap-2'
                    >
                      {createTenantWithAdminMutation.isPending
                        ? 'Criando...'
                        : 'Criar Tenant'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
