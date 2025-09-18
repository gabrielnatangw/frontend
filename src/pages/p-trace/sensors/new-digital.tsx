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
  Zap,
  Activity,
} from 'lucide-react';
import { Button, Stepper, Input, Label } from '../../../components';
import {
  useCreateSensor,
  useNotifications,
  useMeasurementUnits,
  useModules,
} from '../../../lib';

// Schema de validação Zod para sensores digitais
const digitalSensorSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    entry: z.number().optional(), // Campo opcional pois não existe na API
    counterName: z.string().min(1, 'Nome do contador é obrigatório'),
    frequencyName: z.string().optional(), // Campo opcional pois não existe na API
    speedSource: z.number(),
    interruptTransition: z.enum(['both', 'rising', 'falling']),
    timeUnit: z.enum(['seconds', 'milliseconds']),
    speedUnit: z.enum(['m/s', 'km/h', 'un/h']),
    maximumPeriod: z.number(),
    frequencyResolution: z.number(),
    minimumPeriod: z.number(),
    samplingInterval: z.number(),
    measurementUnitId: z.string().min(1, 'Unidade de medida é obrigatória'),
    moduleId: z.string().min(1, 'Módulo é obrigatório'),
  })
  .refine(data => data.maximumPeriod > data.minimumPeriod, {
    message: 'Período máximo deve ser maior que o período mínimo',
    path: ['maximumPeriod'], // Mostrar erro no campo maximumPeriod
  });

type DigitalSensorFormData = z.infer<typeof digitalSensorSchema>;

export default function NewDigitalSensorPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [editingField, setEditingField] = useState<
    keyof DigitalSensorFormData | null
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
  } = useForm<DigitalSensorFormData>({
    resolver: zodResolver(digitalSensorSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      entry: 0,
      counterName: '',
      frequencyName: '',
      speedSource: 0,
      interruptTransition: 'both',
      timeUnit: 'seconds',
      speedUnit: 'm/s',
      maximumPeriod: 1.0,
      frequencyResolution: 0.1,
      minimumPeriod: 10,
      samplingInterval: 1000,
      measurementUnitId: '',
      moduleId: '',
    },
  });

  // Hooks para buscar dados
  const { data: measurementUnitsData } = useMeasurementUnits();
  const { data: modulesData } = useModules();

  // Hook para criar sensor
  const createSensorMutation = useCreateSensor();

  // Hook para notificações
  const { showCreateSuccess, showCreateError, showValidationError } =
    useNotifications();

  const formData = watch();

  const nextStep = async () => {
    if (currentStep < 2) {
      let fieldsToValidate: (keyof DigitalSensorFormData)[] = [];

      if (currentStep === 0) {
        fieldsToValidate = [
          'name',
          'entry',
          'counterName',
          'frequencyName',
          'speedSource',
          'interruptTransition',
        ];
      } else if (currentStep === 1) {
        fieldsToValidate = [
          'timeUnit',
          'speedUnit',
          'maximumPeriod',
          'frequencyResolution',
          'minimumPeriod',
          'samplingInterval',
          'measurementUnitId',
          'moduleId',
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

  const startEditing = (
    field: keyof DigitalSensorFormData,
    currentValue: string | number
  ) => {
    setEditingField(field);
    setEditValue(currentValue.toString());
  };

  const confirmEdit = () => {
    if (editingField) {
      const fieldType = typeof formData[editingField];
      if (fieldType === 'number') {
        setValue(editingField, parseFloat(editValue) || 0);
      } else {
        setValue(editingField, editValue);
      }
      setEditingField(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderEditableField = (
    field: keyof DigitalSensorFormData,
    label: string,
    value: string | number
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
                  type={typeof value === 'number' ? 'number' : 'text'}
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
                  type='button'
                  onClick={confirmEdit}
                  className='p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded'
                  title='Confirmar'
                >
                  <Check size={16} />
                </button>
                <button
                  type='button'
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
                  {field === 'speedSource'
                    ? value === 1
                      ? 'Sim'
                      : 'Não'
                    : value !== null && value !== undefined
                      ? value
                      : 'Não informado'}
                </span>
                <button
                  type='button'
                  onClick={e => {
                    e.preventDefault();
                    startEditing(field, value);
                  }}
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
              <Zap size={20} className='text-blue-600' />
              Configuração Básica do Sensor Digital
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Informações principais e configurações básicas
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nome do Sensor *</Label>
                <Input
                  {...register('name')}
                  placeholder='Ex: Sensor Digital Contador'
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
                <Label htmlFor='entry'>Entrada *</Label>
                <select
                  {...register('entry', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.entry ? 'border-red-500' : 'border-zinc-300'
                  }`}
                >
                  <option value={0}>Entrada 0</option>
                  <option value={1}>Entrada 1</option>
                  <option value={2}>Entrada 2</option>
                  <option value={3}>Entrada 3</option>
                  <option value={4}>Entrada 4</option>
                  <option value={5}>Entrada 5</option>
                  <option value={6}>Entrada 6</option>
                  <option value={7}>Entrada 7</option>
                </select>
                {errors.entry && (
                  <p className='text-xs text-red-600'>{errors.entry.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='counterName'>Nome do Contador *</Label>
                <Input
                  {...register('counterName')}
                  placeholder='Ex: Contador de Pulsos'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.counterName ? 'border-red-500' : ''}
                />
                {errors.counterName && (
                  <p className='text-xs text-red-600'>
                    {errors.counterName.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='frequencyName'>
                  Nome da Frequência do Contador *
                </Label>
                <Input
                  {...register('frequencyName')}
                  placeholder='Ex: Frequência de Rotação'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.frequencyName ? 'border-red-500' : ''}
                />
                {errors.frequencyName && (
                  <p className='text-xs text-red-600'>
                    {errors.frequencyName.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='speedSource'>
                  Fonte de Velocidade *{' '}
                  <span className='text-xs text-zinc-500'>(obrigatório)</span>
                </Label>
                <select
                  {...register('speedSource', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.speedSource ? 'border-red-500' : 'border-zinc-300'
                  }`}
                >
                  <option value={0}>Não</option>
                  <option value={1}>Sim</option>
                </select>
                {errors.speedSource && (
                  <p className='text-xs text-red-600'>
                    {errors.speedSource.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='interruptTransition'>
                  Transição de Interrupção *{' '}
                  <span className='text-xs text-zinc-500'>(obrigatório)</span>
                </Label>
                <select
                  {...register('interruptTransition')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.interruptTransition
                      ? 'border-red-500'
                      : 'border-zinc-300'
                  }`}
                >
                  <option value='both'>Ambas</option>
                  <option value='rising'>Subida (rising)</option>
                  <option value='falling'>Decida (falling)</option>
                </select>
                {errors.interruptTransition && (
                  <p className='text-xs text-red-600'>
                    {errors.interruptTransition.message}
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
              <Activity size={20} className='text-green-600' />
              Configuração de Unidades e Parâmetros
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Configurações de unidades e parâmetros técnicos
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='timeUnit'>
                  Unidade de Tempo *{' '}
                  <span className='text-xs text-zinc-500'>(obrigatório)</span>
                </Label>
                <select
                  {...register('timeUnit')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.timeUnit ? 'border-red-500' : 'border-zinc-300'
                  }`}
                >
                  <option value='seconds'>Segundos</option>
                  <option value='milliseconds'>Milessegundos</option>
                </select>
                {errors.timeUnit && (
                  <p className='text-xs text-red-600'>
                    {errors.timeUnit.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='speedUnit'>
                  Unidade de Velocidade *{' '}
                  <span className='text-xs text-zinc-500'>(obrigatório)</span>
                </Label>
                <select
                  {...register('speedUnit')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.speedUnit ? 'border-red-500' : 'border-zinc-300'
                  }`}
                >
                  <option value='m/s'>m/s</option>
                  <option value='km/h'>km/h</option>
                  <option value='un/h'>un/h</option>
                </select>
                {errors.speedUnit && (
                  <p className='text-xs text-red-600'>
                    {errors.speedUnit.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maximumPeriod'>Período Máximo (s) *</Label>
                <Input
                  {...register('maximumPeriod', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  placeholder='Ex: 1000'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.maximumPeriod ? 'border-red-500' : ''}
                />
                {errors.maximumPeriod && (
                  <p className='text-xs text-red-600'>
                    {errors.maximumPeriod.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='frequencyResolution'>
                  Resolução de Frequência *
                </Label>
                <Input
                  {...register('frequencyResolution', { valueAsNumber: true })}
                  type='number'
                  step='0.001'
                  placeholder='Ex: 0.1'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.frequencyResolution ? 'border-red-500' : ''}
                />
                {errors.frequencyResolution && (
                  <p className='text-xs text-red-600'>
                    {errors.frequencyResolution.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='minimumPeriod'>Período Mínimo (s) *</Label>
                <Input
                  {...register('minimumPeriod', { valueAsNumber: true })}
                  type='number'
                  step='1'
                  placeholder='Ex: 10'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.minimumPeriod ? 'border-red-500' : ''}
                />
                {errors.minimumPeriod && (
                  <p className='text-xs text-red-600'>
                    {errors.minimumPeriod.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='samplingInterval'>
                  Intervalo de Amostragem (ms) *
                </Label>
                <Input
                  {...register('samplingInterval', { valueAsNumber: true })}
                  type='number'
                  step='100'
                  placeholder='Ex: 1000'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.samplingInterval ? 'border-red-500' : ''}
                />
                {errors.samplingInterval && (
                  <p className='text-xs text-red-600'>
                    {errors.samplingInterval.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='measurementUnitId'>
                  Unidade de Medida *{' '}
                  <span className='text-xs text-zinc-500'>(obrigatório)</span>
                </Label>
                <select
                  {...register('measurementUnitId')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.measurementUnitId
                      ? 'border-red-500'
                      : 'border-zinc-300'
                  }`}
                >
                  <option value=''>Selecione uma unidade</option>
                  {measurementUnitsData?.data?.measurementUnits?.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                {errors.measurementUnitId && (
                  <p className='text-xs text-red-600'>
                    {errors.measurementUnitId.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='moduleId'>
                  Módulo *{' '}
                  <span className='text-xs text-zinc-500'>(obrigatório)</span>
                </Label>
                <select
                  {...register('moduleId')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.moduleId ? 'border-red-500' : 'border-zinc-300'
                  }`}
                >
                  <option value=''>Selecione um módulo</option>
                  {modulesData?.data?.modules?.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.machineName} - {module.sector}
                    </option>
                  ))}
                </select>
                {errors.moduleId && (
                  <p className='text-xs text-red-600'>
                    {errors.moduleId.message}
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
                Dados do Sensor Digital
              </h4>
              <div className='space-y-1'>
                {renderEditableField('name', 'Nome', formData.name || '')}
                {renderEditableField('entry', 'Entrada', formData.entry || 0)}
                {renderEditableField(
                  'counterName',
                  'Nome do Contador',
                  formData.counterName || ''
                )}
                {renderEditableField(
                  'frequencyName',
                  'Nome da Frequência',
                  formData.frequencyName || ''
                )}
                {renderEditableField(
                  'speedSource',
                  'Fonte de Velocidade',
                  formData.speedSource || 0
                )}
                {renderEditableField(
                  'interruptTransition',
                  'Transição de Interrupção',
                  formData.interruptTransition || ''
                )}
                {renderEditableField(
                  'timeUnit',
                  'Unidade de Tempo',
                  formData.timeUnit === 'seconds'
                    ? 'Segundos'
                    : formData.timeUnit === 'milliseconds'
                      ? 'Milessegundos'
                      : formData.timeUnit || ''
                )}
                {renderEditableField(
                  'speedUnit',
                  'Unidade de Velocidade',
                  formData.speedUnit || ''
                )}
                {renderEditableField(
                  'maximumPeriod',
                  'Período Máximo (s)',
                  formData.maximumPeriod || 0
                )}
                {renderEditableField(
                  'frequencyResolution',
                  'Resolução de Frequência',
                  formData.frequencyResolution || 0
                )}
                {renderEditableField(
                  'minimumPeriod',
                  'Período Mínimo (s)',
                  formData.minimumPeriod || 0
                )}
                {renderEditableField(
                  'samplingInterval',
                  'Intervalo de Amostragem (ms)',
                  formData.samplingInterval || 0
                )}
                {renderEditableField(
                  'measurementUnitId',
                  'Unidade de Medida',
                  (() => {
                    const unit =
                      measurementUnitsData?.data?.measurementUnits?.find(
                        u => u.id === formData.measurementUnitId
                      );
                    return unit ? unit.label : formData.measurementUnitId || '';
                  })()
                )}
                {renderEditableField(
                  'moduleId',
                  'Módulo',
                  (() => {
                    const module = modulesData?.data?.modules?.find(
                      m => m.id === formData.moduleId
                    );
                    return module
                      ? `${module.machineName} - ${module.sector}`
                      : formData.moduleId || '';
                  })()
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

  const onSubmit = async (data: DigitalSensorFormData) => {
    try {
      // Adaptar dados para a API de sensores (conforme ROTAS_SENSORES.md)
      const sensorData = {
        name: data.name,
        minScale: 0, // Valores padrão para sensor digital
        maxScale: 1,
        minAlarm: 0,
        maxAlarm: 1,
        gain: null, // Campo específico para sensor digital
        inputMode: null, // Campo específico para sensor digital
        ix: data.entry || 0, // Mapear entry para ix
        gaugeColor: null, // Campo específico para sensor digital
        offset: null, // Campo específico para sensor digital
        alarmTimeout: null, // Campo específico para sensor digital
        counterName: data.counterName,
        frequencyCounterName: data.frequencyName || null, // Mapear frequencyName para frequencyCounterName
        speedSource: data.speedSource === 1,
        interruptTransition: data.interruptTransition,
        timeUnit: data.timeUnit,
        speedUnit: data.speedUnit,
        samplingInterval: data.samplingInterval,
        minimumPeriod: data.minimumPeriod,
        maximumPeriod: data.maximumPeriod,
        frequencyResolution: data.frequencyResolution,
        sensorType: 1, // Tipo digital
        measurementUnitId: data.measurementUnitId,
        moduleId: data.moduleId,
      };

      // Debug: Log dos dados que serão enviados para a API
      console.log('Dados do sensor digital a serem enviados:', {
        name: data.name,
        entry: data.entry,
        counterName: data.counterName,
        frequencyName: data.frequencyName,
        speedSource: data.speedSource,
        interruptTransition: data.interruptTransition,
        timeUnit: data.timeUnit,
        speedUnit: data.speedUnit,
        maximumPeriod: data.maximumPeriod,
        frequencyResolution: data.frequencyResolution,
        minimumPeriod: data.minimumPeriod,
        samplingInterval: data.samplingInterval,
        measurementUnitId: data.measurementUnitId,
        moduleId: data.moduleId,
      });

      await createSensorMutation.mutateAsync(sensorData);

      showCreateSuccess('Sensor Digital');
      navigate('/p-trace/sensors');
    } catch (error: unknown) {
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
        showCreateError('Sensor Digital', error);
      } else if (err.response?.status >= 500) {
        showCreateError('Sensor Digital', {
          message: 'Erro no servidor. Tente novamente mais tarde.',
        });
      } else if (!err.response) {
        showCreateError('Sensor Digital', {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        });
      } else {
        showCreateError('Sensor Digital', error);
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
            onClick={() => navigate('/p-trace/sensors')}
            className='flex items-center gap-2'
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
          <h1 className='text-2xl font-bold text-zinc-900'>
            Novo Sensor Digital
          </h1>
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
                  { label: 'Configuração Básica' },
                  { label: 'Unidades e Parâmetros' },
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
                  onClick={() => navigate('/p-trace/sensors')}
                  className='flex items-center gap-2'
                >
                  <X size={16} />
                  Cancelar
                </Button>

                {/* Lado direito - Botões Voltar e Próximo/Criar Sensor */}
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
                        editingField !== null || createSensorMutation.isPending
                      }
                      className='flex items-center gap-2'
                    >
                      Próximo
                      <ArrowRight size={16} />
                    </Button>
                  ) : (
                    // Botão "Criar Sensor Digital" para o passo 2 (submissão do formulário)
                    <Button
                      type='submit'
                      variant='contained'
                      colorScheme='primary'
                      size='lg'
                      disabled={
                        editingField !== null || createSensorMutation.isPending
                      }
                      className='flex items-center gap-2'
                    >
                      {createSensorMutation.isPending
                        ? 'Criando...'
                        : 'Criar Sensor Digital'}
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
