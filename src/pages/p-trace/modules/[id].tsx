import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  X,
  Info,
  Settings,
  Edit,
  Check,
  Building,
  Save,
} from 'lucide-react';
import { Button, Stepper, Input, Label } from '../../../components';
import { useModule, useUpdateModule, useNotifications } from '../../../lib';
// import type { Module } from '../../../types/module';

// Schema de validação Zod para módulos (mesmo da criação)
const moduleSchema = z.object({
  customer: z.string().min(1, 'Cliente é obrigatório'),
  country: z.string().min(1, 'País é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  blueprint: z.string().min(1, 'Planta é obrigatório'),
  sector: z.string().min(1, 'Setor é obrigatório'),
  machineName: z.string().min(1, 'Nome da máquina é obrigatório'),
  machineId: z.string().optional(), // Opcional, pode ser undefined
});

type ModuleFormData = z.infer<typeof moduleSchema>;

export default function EditModulePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [editingField, setEditingField] = useState<keyof ModuleFormData | null>(
    null
  );
  const [editValue, setEditValue] = useState('');

  // Buscar módulo existente
  const {
    data: moduleData,
    isLoading: isLoadingModule,
    error: moduleError,
  } = useModule(id!);

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    mode: 'onChange',
    defaultValues: moduleData?.data?.module
      ? {
          customer: moduleData.data.module.customer,
          country: moduleData.data.module.country,
          city: moduleData.data.module.city,
          blueprint: moduleData.data.module.blueprint,
          sector: moduleData.data.module.sector,
          machineName: moduleData.data.module.machineName,
          machineId: moduleData.data.module.machineId || '',
        }
      : {
          customer: '',
          country: '',
          city: '',
          blueprint: '',
          sector: '',
          machineName: '',
          machineId: '',
        },
  });

  // Hook para atualizar módulo
  const updateModuleMutation = useUpdateModule();

  // Hook para notificações
  const { showUpdateSuccess, showUpdateError, showValidationError } =
    useNotifications();

  const formData = watch();

  // Preencher formulário quando os dados do módulo chegarem
  useEffect(() => {
    if (moduleData?.data?.module) {
      const module = moduleData.data.module;

      const formValues = {
        customer: module.customer,
        country: module.country,
        city: module.city,
        blueprint: module.blueprint,
        sector: module.sector,
        machineName: module.machineName,
        machineId: module.machineId || '',
      };

      // Usar setValue para preencher o formulário
      Object.entries(formValues).forEach(([key, value]) => {
        setValue(key as keyof ModuleFormData, value);
      });
    }
  }, [moduleData, setValue]);

  const nextStep = async () => {
    if (currentStep < 2) {
      // Validar campos do step atual antes de avançar
      let fieldsToValidate: (keyof ModuleFormData)[] = [];

      if (currentStep === 0) {
        fieldsToValidate = ['customer', 'country', 'city'];
      } else if (currentStep === 1) {
        fieldsToValidate = ['blueprint', 'sector', 'machineName'];
      }

      const isValidStep = await trigger(fieldsToValidate);
      if (isValidStep) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const startEditing = (field: keyof ModuleFormData, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const confirmEdit = () => {
    if (editingField) {
      setValue(editingField, editValue);
      setEditingField(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderEditableField = (
    field: keyof ModuleFormData,
    label: string,
    value: string
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
                <Input
                  type='text'
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
                  {value || 'Não informado'}
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
              Informações do Cliente
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Dados principais do cliente e localização
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='customer'>Cliente *</Label>
                <Input
                  {...register('customer')}
                  placeholder='Ex: Cliente ABC, Empresa XYZ'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.customer ? 'border-red-500' : ''}
                />
                {errors.customer && (
                  <p className='text-xs text-red-600'>
                    {errors.customer.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='country'>País *</Label>
                <Input
                  {...register('country')}
                  placeholder='Ex: Brasil, Argentina, Chile'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && (
                  <p className='text-xs text-red-600'>
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='city'>Cidade *</Label>
                <Input
                  {...register('city')}
                  placeholder='Ex: São Paulo, Buenos Aires, Santiago'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className='text-xs text-red-600'>{errors.city.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold text-zinc-900 flex items-center gap-2'>
              <Info size={20} className='text-green-600' />
              Informações Técnicas
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Dados técnicos e de localização do módulo
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='blueprint'>Planta *</Label>
                <Input
                  {...register('blueprint')}
                  placeholder='Ex: Planta A - Setor Norte, Edifício B'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.blueprint ? 'border-red-500' : ''}
                />
                {errors.blueprint && (
                  <p className='text-xs text-red-600'>
                    {errors.blueprint.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='sector'>Setor *</Label>
                <Input
                  {...register('sector')}
                  placeholder='Ex: Produção, Manutenção, Logística'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.sector ? 'border-red-500' : ''}
                />
                {errors.sector && (
                  <p className='text-xs text-red-600'>
                    {errors.sector.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='machineName'>Nome da Máquina *</Label>
                <Input
                  {...register('machineName')}
                  placeholder='Ex: Máquina Principal 001, Equipamento A'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.machineName ? 'border-red-500' : ''}
                />
                {errors.machineName && (
                  <p className='text-xs text-red-600'>
                    {errors.machineName.message}
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

            <div className='bg-white border border-zinc-200 rounded-lg p-6'>
              <h4 className='font-medium text-zinc-900 mb-4'>
                Dados do Módulo
              </h4>
              <div className='space-y-1'>
                {renderEditableField(
                  'customer',
                  'Cliente',
                  formData.customer || ''
                )}
                {renderEditableField('country', 'País', formData.country || '')}
                {renderEditableField('city', 'Cidade', formData.city || '')}
                {renderEditableField(
                  'blueprint',
                  'Planta',
                  formData.blueprint || ''
                )}
                {renderEditableField('sector', 'Setor', formData.sector || '')}
                {renderEditableField(
                  'machineName',
                  'Nome da Máquina',
                  formData.machineName || ''
                )}
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
          </div>
        );

      default:
        return null;
    }
  };

  const onSubmit = async (data: ModuleFormData) => {
    if (!id) return;

    try {
      // Converter dados para o formato esperado pela API
      const updateData = {
        ...data,
        machineId: data.machineId || undefined,
      };

      // Atualizar módulo via API
      await updateModuleMutation.mutateAsync({ id, data: updateData });

      // Sucesso! Mostrar notificação e redirecionar
      showUpdateSuccess('Módulo');
      navigate('/p-trace/modules');
    } catch (error: unknown) {
      console.error('❌ Erro ao atualizar módulo:', error);

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
        showUpdateError('Módulo', error);
      } else if (err.response?.status >= 500) {
        showUpdateError('Módulo', {
          message: 'Erro no servidor. Tente novamente mais tarde.',
        });
      } else if (!err.response) {
        showUpdateError('Módulo', {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        });
      } else {
        showUpdateError('Módulo', error);
      }
    }
  };

  // Renderizar estados de loading e erro
  if (isLoadingModule) {
    return (
      <div className='h-full flex flex-col'>
        <div className='px-6 py-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              colorScheme='default'
              size='md'
              onClick={() => navigate('/p-trace/modules')}
              className='flex items-center gap-2'
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
            <h1 className='text-2xl font-bold text-zinc-900'>
              Editando Módulo
            </h1>
          </div>
        </div>
        <div className='flex-1 px-6'>
          <div className='bg-white border border-zinc-200 rounded-lg p-12'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-zinc-600'>Carregando dados do módulo...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (moduleError) {
    return (
      <div className='h-full flex flex-col'>
        <div className='px-6 py-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              colorScheme='default'
              size='md'
              onClick={() => navigate('/p-trace/modules')}
              className='flex items-center gap-2'
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
            <h1 className='text-2xl font-bold text-zinc-900'>
              Erro ao Carregar Módulo
            </h1>
          </div>
        </div>
        <div className='flex-1 px-6'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-12'>
            <div className='text-center'>
              <h3 className='text-lg font-medium text-red-900 mb-2'>
                Erro ao carregar módulo
              </h3>
              <p className='text-red-600 mb-4'>
                Não foi possível carregar os dados do módulo. Tente novamente.
              </p>
              <Button
                variant='outline'
                colorScheme='default'
                size='md'
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='py-4'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            colorScheme='default'
            size='md'
            onClick={() => navigate('/p-trace/modules')}
            className='flex items-center gap-2'
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
          <h1 className='text-2xl font-bold text-zinc-900'>Editando Módulo</h1>
        </div>
      </div>

      {/* Container - dividido em 3 partes no eixo Y */}
      <div className='flex-1'>
        <form onSubmit={handleSubmit(onSubmit)} className='h-full'>
          <div className='bg-white border border-zinc-200 rounded-lg h-full flex flex-col'>
            {/* Primeira parte - Wizard/Stepper */}
            <div className='px-6 py-6'>
              <Stepper
                steps={[
                  { label: 'Informações do Cliente' },
                  { label: 'Informações Técnicas' },
                  { label: 'Revisão e Confirmação' },
                ]}
                current={currentStep}
                variant='wizard'
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
                  onClick={() => navigate('/p-trace/modules')}
                  className='flex items-center gap-2'
                >
                  <X size={16} />
                  Cancelar
                </Button>

                {/* Lado direito - Botões Voltar e Próximo/Salvar */}
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
                        editingField !== null || updateModuleMutation.isPending
                      }
                      className='flex items-center gap-2'
                    >
                      Próximo
                      <ArrowRight size={16} />
                    </Button>
                  ) : (
                    // Botão "Salvar Alterações" para o passo 2 (submissão do formulário)
                    <Button
                      type='submit'
                      variant='contained'
                      colorScheme='primary'
                      size='lg'
                      disabled={
                        editingField !== null ||
                        updateModuleMutation.isPending ||
                        false
                      }
                      className='flex items-center gap-2'
                    >
                      {updateModuleMutation.isPending
                        ? 'Salvando...'
                        : 'Salvar Alterações'}
                      <Save size={16} />
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
