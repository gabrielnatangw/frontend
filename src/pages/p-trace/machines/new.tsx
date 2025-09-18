import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  X,
  Factory,
  Info,
  Settings,
  Edit,
  Check,
} from 'lucide-react';
import { Button, Stepper, Input, Label } from '../../../components';
import { useCreateMachine, useNotifications } from '../../../lib';

// Schema de validação Zod
const machineSchema = z.object({
  operationalSector: z
    .string()
    .min(1, 'Setor operacional é obrigatório')
    .max(100, 'Máximo 100 caracteres'),
  name: z
    .string()
    .min(1, 'Nome da máquina é obrigatório')
    .max(100, 'Máximo 100 caracteres'),
  manufacturer: z
    .string()
    .min(1, 'Fabricante é obrigatório')
    .max(100, 'Máximo 100 caracteres'),
  serialNumber: z
    .string()
    .min(1, 'Número de série é obrigatório')
    .max(50, 'Máximo 50 caracteres'),
  yearOfManufacture: z
    .string()
    .min(1, 'Ano de fabricação é obrigatório')
    .regex(/^(19|20)\d{2}$/, 'Ano deve estar entre 1900 e 2031'),
  yearOfInstallation: z
    .string()
    .min(1, 'Ano de instalação é obrigatório')
    .regex(/^(19|20)\d{2}$/, 'Ano deve estar entre 1900 e 2031'),
  maxPerformance: z
    .string()
    .min(1, 'Performance máxima é obrigatória')
    .regex(/^\d+(\.\d+)?$/, 'Deve ser um número válido')
    .refine(val => {
      const num = parseFloat(val);
      return num >= 0 && num <= 999999;
    }, 'Performance deve estar entre 0 e 999999'),
  speedMeasureTech: z
    .string()
    .min(1, 'Tecnologia de medição é obrigatória')
    .regex(/^\d+$/, 'Deve ser um número')
    .refine(val => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0 && num <= 16;
    }, 'Deve estar entre 0 e 16'),
});

type MachineFormData = z.infer<typeof machineSchema>;

type FieldType = 'text' | 'number' | 'select';

export default function NewMachinePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [editingField, setEditingField] = useState<
    keyof MachineFormData | null
  >(null);
  const [editValue, setEditValue] = useState('');

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),
    mode: 'onChange',
    defaultValues: {
      operationalSector: '',
      name: '',
      manufacturer: '',
      serialNumber: '',
      yearOfManufacture: '',
      yearOfInstallation: '',
      maxPerformance: '',
      speedMeasureTech: '14',
    },
  });

  // Hook para criar máquina
  const createMachineMutation = useCreateMachine();

  // Hook para notificações
  const { showCreateSuccess, showCreateError, showValidationError } =
    useNotifications();

  const formData = watch();
  const isValid = Object.keys(errors).length === 0;

  // Debug: Log do estado de validação
  React.useEffect(() => {
    console.log('🔍 Estado de validação:', {
      isValid,
      hasErrors: Object.keys(errors).length > 0,
      currentStep,
      editingField,
    });

    // Verificar se chegou ao último step
    if (currentStep === 2) {
      console.log('✅ Último step alcançado:', {
        isValid,
        errors: Object.keys(errors),
      });
    }
  }, [errors, currentStep, editingField, isValid]);

  const nextStep = async () => {
    if (currentStep < 2) {
      // Validar campos do step atual antes de avançar
      let fieldsToValidate: (keyof MachineFormData)[] = [];

      if (currentStep === 0) {
        fieldsToValidate = [
          'operationalSector',
          'name',
          'manufacturer',
          'serialNumber',
        ];
      } else if (currentStep === 1) {
        fieldsToValidate = [
          'yearOfManufacture',
          'yearOfInstallation',
          'maxPerformance',
          'speedMeasureTech',
        ];
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

  const startEditing = (field: keyof MachineFormData, currentValue: string) => {
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

  // const cancelEdit = () => {
  //   setEditingField(null);
  //   setEditValue('');
  // };

  const getSpeedMeasureTechLabel = (value: string) => {
    const speedOptions = {
      '0': 'Duração do período por segundo',
      '1': 'Ciclos por hora',
      '2': 'Ciclos por minuto',
      '3': 'Ciclos por segundo',
      '4': 'Velocidade linear (m/s)',
      '5': 'Velocidade linear (m/min)',
      '6': 'Velocidade linear (m/h)',
      '7': 'Velocidade angular (rad/s)',
      '8': 'Velocidade angular (rad/min)',
      '9': 'Velocidade angular (rad/h)',
      '10': 'Velocidade angular (graus/s)',
      '11': 'Velocidade angular (graus/min)',
      '12': 'Velocidade angular (graus/h)',
      '13': 'Rotações por segundo (RPS)',
      '14': 'Rotações por minuto (RPM)',
      '15': 'Rotações por hora (RPH)',
      '16': 'Frequência (Hz)',
    };
    return (
      speedOptions[value as keyof typeof speedOptions] || 'Selecione uma opção'
    );
  };

  const renderEditableField = (
    field: keyof MachineFormData,
    label: string,
    value: string,
    type: FieldType = 'text'
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
                {type === 'select' ? (
                  <select
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevenir submissão automática
                      }
                    }}
                    className='px-2 py-1 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
                  >
                    <option value='0'>
                      0 - Duração do período por segundo
                    </option>
                    <option value='1'>1 - Ciclos por hora</option>
                    <option value='2'>2 - Ciclos por minuto</option>
                    <option value='3'>3 - Ciclos por segundo</option>
                    <option value='4'>4 - Velocidade linear (m/s)</option>
                    <option value='5'>5 - Velocidade linear (m/min)</option>
                    <option value='6'>6 - Velocidade linear (m/h)</option>
                    <option value='7'>7 - Velocidade angular (rad/s)</option>
                    <option value='8'>8 - Velocidade angular (rad/min)</option>
                    <option value='9'>9 - Velocidade angular (rad/h)</option>
                    <option value='10'>
                      10 - Velocidade angular (graus/s)
                    </option>
                    <option value='11'>
                      11 - Velocidade angular (graus/min)
                    </option>
                    <option value='12'>
                      12 - Velocidade angular (graus/h)
                    </option>
                    <option value='13'>13 - Rotações por segundo (RPS)</option>
                    <option value='14'>14 - Rotações por minuto (RPM)</option>
                    <option value='15'>15 - Rotações por hora (RPH)</option>
                    <option value='16'>16 - Frequência (Hz)</option>
                  </select>
                ) : (
                  <Input
                    type={type === 'number' ? 'number' : 'text'}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevenir submissão automática
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
              </>
            ) : (
              <>
                <span className='text-zinc-900'>
                  {field === 'speedMeasureTech'
                    ? getSpeedMeasureTechLabel(value)
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
              <Factory size={20} className='text-blue-600' />
              Informações Básicas
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Dados principais da máquina
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='operationalSector'>
                  Setor Operacional *{' '}
                  <span className='text-xs text-zinc-500'>
                    (1-100 caracteres)
                  </span>
                </Label>
                <Input
                  {...register('operationalSector')}
                  placeholder='Ex: Produção, Manutenção, Qualidade'
                  maxLength={100}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevenir submissão automática
                    }
                  }}
                  className={errors.operationalSector ? 'border-red-500' : ''}
                />
                {errors.operationalSector && (
                  <p className='text-xs text-red-600'>
                    {errors.operationalSector.message}
                  </p>
                )}
                <p className='text-xs text-zinc-500'>
                  Máximo 100 caracteres (
                  {formData.operationalSector?.length || 0}/100)
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='name'>
                  Nome da Máquina *{' '}
                  <span className='text-xs text-zinc-500'>
                    (1-100 caracteres)
                  </span>
                </Label>
                <Input
                  {...register('name')}
                  placeholder='Ex: Máquina de Corte 001'
                  maxLength={100}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevenir submissão automática
                    }
                  }}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className='text-xs text-red-600'>{errors.name.message}</p>
                )}
                <p className='text-xs text-zinc-500'>
                  Máximo 100 caracteres ({formData.name?.length || 0}/100)
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='manufacturer'>
                  Fabricante *{' '}
                  <span className='text-xs text-zinc-500'>
                    (1-100 caracteres)
                  </span>
                </Label>
                <Input
                  {...register('manufacturer')}
                  placeholder='Ex: IndustriaTech, Siemens, ABB'
                  maxLength={100}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevenir submissão automática
                    }
                  }}
                  className={errors.manufacturer ? 'border-red-500' : ''}
                />
                {errors.manufacturer && (
                  <p className='text-xs text-red-600'>
                    {errors.manufacturer.message}
                  </p>
                )}
                <p className='text-xs text-zinc-500'>
                  Máximo 100 caracteres ({formData.manufacturer?.length || 0}
                  /100)
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='serialNumber'>
                  Número de Série *{' '}
                  <span className='text-xs text-zinc-500'>
                    (1-50 caracteres)
                  </span>
                </Label>
                <Input
                  {...register('serialNumber')}
                  placeholder='Ex: SN001234567'
                  maxLength={50}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevenir submissão automática
                    }
                  }}
                  className={errors.serialNumber ? 'border-red-500' : ''}
                />
                {errors.serialNumber && (
                  <p className='text-xs text-red-600'>
                    {errors.serialNumber.message}
                  </p>
                )}
                <p className='text-xs text-zinc-500'>
                  Máximo 50 caracteres ({formData.serialNumber?.length || 0}/50)
                </p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold text-zinc-900 flex items-center gap-2'>
              <Info size={20} className='text-green-600' />
              Especificações Técnicas
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Informações técnicas e de fabricação
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='yearOfManufacture'>
                  Ano de Fabricação *{' '}
                  <span className='text-xs text-zinc-500'>(1900-2031)</span>
                </Label>
                <Input
                  {...register('yearOfManufacture')}
                  type='number'
                  min='1900'
                  max='2031'
                  placeholder='Ex: 2020'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevenir submissão automática
                    }
                  }}
                  className={errors.yearOfManufacture ? 'border-red-500' : ''}
                />
                {errors.yearOfManufacture && (
                  <p className='text-xs text-red-600'>
                    {errors.yearOfManufacture.message}
                  </p>
                )}
                <p className='text-xs text-zinc-500'>Ano entre 1900 e 2031</p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='yearOfInstallation'>
                  Ano de Instalação *{' '}
                  <span className='text-xs text-zinc-500'>(1900-2031)</span>
                </Label>
                <Input
                  {...register('yearOfInstallation')}
                  type='number'
                  min='1900'
                  max='2031'
                  placeholder='Ex: 2021'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevenir submissão automática
                    }
                  }}
                  className={errors.yearOfInstallation ? 'border-red-500' : ''}
                />
                {errors.yearOfInstallation && (
                  <p className='text-xs text-red-600'>
                    {errors.yearOfInstallation.message}
                  </p>
                )}
                <p className='text-xs text-zinc-500'>Ano entre 1900 e 2031</p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxPerformance'>
                  Performance Máxima *{' '}
                  <span className='text-xs text-zinc-500'>(0-999999)</span>
                </Label>
                <Input
                  {...register('maxPerformance')}
                  type='number'
                  min='0'
                  max='999999'
                  step='0.01'
                  placeholder='Ex: 150.5'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevenir submissão automática
                    }
                  }}
                  className={errors.maxPerformance ? 'border-red-500' : ''}
                />
                {errors.maxPerformance && (
                  <p className='text-xs text-red-600'>
                    {errors.maxPerformance.message}
                  </p>
                )}
                <p className='text-xs text-zinc-500'>Valor entre 0 e 999999</p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='speedMeasureTech'>
                  Tecnologia de Medição *
                </Label>
                <select
                  {...register('speedMeasureTech')}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevenir submissão automática
                    }
                  }}
                  className={`w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.speedMeasureTech ? 'border-red-500' : ''
                  }`}
                >
                  <option value='0'>0 - Duração do período por segundo</option>
                  <option value='1'>1 - Ciclos por hora</option>
                  <option value='2'>2 - Ciclos por minuto</option>
                  <option value='3'>3 - Ciclos por segundo</option>
                  <option value='4'>4 - Velocidade linear (m/s)</option>
                  <option value='5'>5 - Velocidade linear (m/min)</option>
                  <option value='6'>6 - Velocidade linear (m/h)</option>
                  <option value='7'>7 - Velocidade angular (rad/s)</option>
                  <option value='8'>8 - Velocidade angular (rad/min)</option>
                  <option value='9'>9 - Velocidade angular (rad/h)</option>
                  <option value='10'>10 - Velocidade angular (graus/s)</option>
                  <option value='11'>
                    11 - Velocidade angular (graus/min)
                  </option>
                  <option value='12'>12 - Velocidade angular (graus/h)</option>
                  <option value='13'>13 - Rotações por segundo (RPS)</option>
                  <option value='14'>14 - Rotações por minuto (RPM)</option>
                  <option value='15'>15 - Rotações por hora (RPH)</option>
                  <option value='16'>16 - Frequência (Hz)</option>
                </select>
                {errors.speedMeasureTech && (
                  <p className='text-xs text-red-600'>
                    {errors.speedMeasureTech.message}
                  </p>
                )}
                <p className='text-xs text-zinc-500'>
                  Selecione a tecnologia de medição apropriada
                </p>
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
                Dados da Máquina
              </h4>
              <div className='space-y-1'>
                {renderEditableField(
                  'operationalSector',
                  'Setor Operacional',
                  formData.operationalSector || ''
                )}
                {renderEditableField(
                  'name',
                  'Nome da Máquina',
                  formData.name || ''
                )}
                {renderEditableField(
                  'manufacturer',
                  'Fabricante',
                  formData.manufacturer || ''
                )}
                {renderEditableField(
                  'serialNumber',
                  'Número de Série',
                  formData.serialNumber || ''
                )}
                {renderEditableField(
                  'yearOfManufacture',
                  'Ano de Fabricação',
                  formData.yearOfManufacture || ''
                )}
                {renderEditableField(
                  'yearOfInstallation',
                  'Ano de Instalação',
                  formData.yearOfInstallation || ''
                )}
                {renderEditableField(
                  'maxPerformance',
                  'Performance Máxima',
                  formData.maxPerformance || ''
                )}
                {renderEditableField(
                  'speedMeasureTech',
                  'Tecnologia de Medição',
                  formData.speedMeasureTech || '',
                  'select'
                )}
              </div>

              {editingField && (
                <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                  <p className='text-sm text-blue-800'>
                    <strong>Editando:</strong>{' '}
                    {editingField === 'speedMeasureTech'
                      ? 'Tecnologia de Medição'
                      : editingField}
                  </p>
                  <p className='text-xs text-blue-600 mt-1'>
                    Clique no check verde para confirmar ou continue editando
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

  const onSubmit = async (data: MachineFormData) => {
    console.log('🚀 Submetendo dados da máquina:', {
      isValid,
      errors: Object.keys(errors),
    });

    try {
      // Converter dados para o formato esperado pela API
      const machineData = {
        ...data,
        maxPerformance: parseFloat(data.maxPerformance),
        speedMeasureTech: parseInt(data.speedMeasureTech, 10), // Convertendo para number
      };

      // Criar máquina via API
      await createMachineMutation.mutateAsync(machineData);

      // Sucesso! Mostrar notificação e redirecionar
      showCreateSuccess('Máquina');
      navigate('/p-trace/machines');
    } catch (error: unknown) {
      console.error('❌ Erro ao criar máquina:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Estrutura do erro:', error);

      // Tratar diferentes tipos de erro
      const err = error as {
        response?: {
          data?: { errors?: Array<{ field: string; message: string }> };
          status?: number;
        };
        status?: number;
      };
      if (err.response?.data?.errors) {
        // Erros de validação da API
        showValidationError(err.response.data.errors);
      } else if (err.response?.status === 409) {
        // Conflito (nome/serial já existe)
        showCreateError('Máquina', error);
      } else if (err.response?.status >= 500) {
        // Erro do servidor
        showCreateError('Máquina', {
          message: 'Erro no servidor. Tente novamente mais tarde.',
        });
      } else if (!err.response) {
        // Erro de rede
        showCreateError('Máquina', {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        });
      } else {
        // Outros erros
        showCreateError('Máquina', error);
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
            onClick={() => navigate('/p-trace/machines')}
            className='flex items-center gap-2'
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
          <h1 className='text-2xl font-bold text-zinc-900'>Nova Máquina</h1>
        </div>
      </div>

      {/* Container - dividido em 3 partes no eixo Y */}
      <div className='flex-1'>
        <form
          onSubmit={handleSubmit(data => {
            onSubmit(data);
          })}
          className='h-full'
        >
          <div className='bg-white border border-zinc-200 rounded-lg h-full flex flex-col'>
            {/* Primeira parte - Wizard/Stepper */}
            <div className='px-6 py-6'>
              <Stepper
                steps={[
                  { label: 'Informações Básicas' },
                  { label: 'Especificações Técnicas' },
                  { label: 'Revisão e Confirmação' },
                ]}
                current={currentStep}
                variant='wizard'
                onStepChange={() => {}}
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
                  onClick={() => navigate('/p-trace/machines')}
                  className='flex items-center gap-2'
                >
                  <X size={16} />
                  Cancelar
                </Button>

                {/* Lado direito - Botões Voltar e Próximo/Criar Máquina */}
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
                        e.preventDefault(); // Prevenir submissão automática
                        nextStep();
                      }}
                      disabled={
                        editingField !== null || createMachineMutation.isPending
                      }
                      className='flex items-center gap-2'
                    >
                      Próximo
                      <ArrowRight size={16} />
                    </Button>
                  ) : (
                    // Botão "Criar Máquina" para o passo 2 (submissão do formulário)
                    <Button
                      type='submit'
                      variant='contained'
                      colorScheme='primary'
                      size='lg'
                      disabled={
                        editingField !== null || createMachineMutation.isPending
                      }
                      onClick={() => {}}
                      className='flex items-center gap-2'
                    >
                      {createMachineMutation.isPending
                        ? 'Criando...'
                        : 'Criar Máquina'}
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
