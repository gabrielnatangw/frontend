import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  useSensor,
  useUpdateSensor,
  useNotifications,
  useMeasurementUnits,
  useModules,
} from '../../../lib';

// Schema de validação Zod para sensores digitais
const digitalSensorSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Máximo 100 caracteres'),
  entry: z
    .number()
    .min(0, 'Entrada deve ser entre 0 e 7')
    .max(7, 'Entrada deve ser entre 0 e 7'),
  counterName: z
    .string()
    .min(1, 'Nome do contador é obrigatório')
    .max(100, 'Máximo 100 caracteres'),
  frequencyName: z
    .string()
    .min(1, 'Nome da frequência é obrigatório')
    .max(100, 'Máximo 100 caracteres'),
  speedSource: z.number().min(0).max(1),
  interruptTransition: z.enum(['both', 'rising', 'falling']),
  timeUnit: z.enum(['seconds', 'milliseconds']),
  speedUnit: z.enum(['m/s', 'km/h', 'un/h']),
  maxPeriod: z
    .number()
    .min(0.1, 'Período máximo deve ser maior que 0.1')
    .max(10000, 'Período máximo deve ser menor que 10000'),
  frequencyResolution: z
    .number()
    .min(0.001, 'Resolução de frequência deve ser maior que 0.001')
    .max(1000, 'Resolução de frequência deve ser menor que 1000'),
  measurementUnitId: z.string().min(1, 'Unidade de medida é obrigatória'),
  moduleId: z.string().min(1, 'Módulo é obrigatório'),
});

type DigitalSensorFormData = z.infer<typeof digitalSensorSchema>;

export default function EditDigitalSensorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
    reset,
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
      maxPeriod: 1.0,
      frequencyResolution: 0.1,
      measurementUnitId: '',
      moduleId: '',
    },
  });

  // Hooks para buscar dados
  const {
    data: sensorData,
    isLoading: isLoadingSensor,
    error: sensorError,
  } = useSensor(id!);
  const { data: measurementUnitsData } = useMeasurementUnits();
  const { data: modulesData } = useModules();

  // Hook para atualizar sensor
  const updateSensorMutation = useUpdateSensor();

  // Hook para notificações
  const { showUpdateSuccess, showUpdateError, showValidationError } =
    useNotifications();

  const formData = watch();

  // Preencher formulário quando os dados do sensor chegarem
  useEffect(() => {
    if (sensorData?.data?.sensor) {
      const sensor = sensorData.data.sensor;

      // Mapear campos da API para o formulário
      reset({
        name: sensor.name || '',
        entry: (sensor as any).entry || 0, // Campo específico do sensor digital
        counterName: (sensor as any).counterName || '', // Campo específico do sensor digital
        frequencyName: (sensor as any).frequencyName || '', // Campo específico do sensor digital
        speedSource: (sensor as any).speedSource ? 1 : 0, // Converter boolean para 0/1
        interruptTransition: (sensor as any).interruptTransition || 'both', // Campo específico do sensor digital
        timeUnit: (sensor as any).timeUnit || 'seconds', // Campo específico do sensor digital
        speedUnit: (sensor as any).speedUnit || 'm/s', // Campo específico do sensor digital
        maxPeriod: (sensor as any).maxPeriod || 1.0, // Campo específico do sensor digital
        frequencyResolution: (sensor as any).frequencyResolution || 0.1, // Campo específico do sensor digital
        measurementUnitId: sensor.measurementUnitId || '',
        moduleId: sensor.moduleId || '',
      });
    }
  }, [sensorData, reset]);

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
          'maxPeriod',
          'frequencyResolution',
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
                    : value || 'Não informado'}
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
                <Label htmlFor='name'>
                  Nome do Sensor *{' '}
                  <span className='text-xs text-zinc-500'>
                    (1-100 caracteres)
                  </span>
                </Label>
                <Input
                  {...register('name')}
                  placeholder='Ex: Sensor Digital Contador'
                  maxLength={100}
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
                <p className='text-xs text-zinc-500'>
                  Máximo 100 caracteres ({formData.name?.length || 0}/100)
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='entry'>
                  Entrada *{' '}
                  <span className='text-xs text-zinc-500'>(0 a 7)</span>
                </Label>
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
                <Label htmlFor='counterName'>
                  Nome do Contador *{' '}
                  <span className='text-xs text-zinc-500'>
                    (1-100 caracteres)
                  </span>
                </Label>
                <Input
                  {...register('counterName')}
                  placeholder='Ex: Contador de Pulsos'
                  maxLength={100}
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
                  Nome da Frequência do Contador *{' '}
                  <span className='text-xs text-zinc-500'>
                    (1-100 caracteres)
                  </span>
                </Label>
                <Input
                  {...register('frequencyName')}
                  placeholder='Ex: Frequência de Rotação'
                  maxLength={100}
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
                <Label htmlFor='maxPeriod'>
                  Período Máximo *{' '}
                  <span className='text-xs text-zinc-500'>(0.1 a 10000)</span>
                </Label>
                <Input
                  {...register('maxPeriod', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  placeholder='Ex: 1.0'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.maxPeriod ? 'border-red-500' : ''}
                />
                {errors.maxPeriod && (
                  <p className='text-xs text-red-600'>
                    {errors.maxPeriod.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='frequencyResolution'>
                  Resolução de Frequência *{' '}
                  <span className='text-xs text-zinc-500'>(0.001 a 1000)</span>
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
                  'maxPeriod',
                  'Período Máximo',
                  formData.maxPeriod || 0
                )}
                {renderEditableField(
                  'frequencyResolution',
                  'Resolução de Frequência',
                  formData.frequencyResolution || 0
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
      // Adaptar dados para a API de sensores
      const sensorData = {
        name: data.name,
        measurementUnitId: data.measurementUnitId,
        sensorType: 1, // Tipo digital
        minScale: 0, // Valores padrão para sensor digital
        maxScale: 1,
        minAlarm: 0,
        maxAlarm: 1,
        moduleId: data.moduleId,
        // Campos específicos para sensor digital
        entry: data.entry,
        counterName: data.counterName,
        frequencyName: data.frequencyName,
        speedSource: data.speedSource === 1,
        interruptTransition: data.interruptTransition,
        timeUnit: data.timeUnit,
        speedUnit: data.speedUnit,
        maxPeriod: data.maxPeriod,
        frequencyResolution: data.frequencyResolution,
      };

      await updateSensorMutation.mutateAsync({
        id: id!,
        data: sensorData,
      });

      showUpdateSuccess('Sensor Digital');
      navigate('/p-trace/sensors');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        showValidationError(error.response.data.errors);
      } else if (error.response?.status === 409) {
        showUpdateError('Sensor Digital', error);
      } else if (error.response?.status >= 500) {
        showUpdateError('Sensor Digital', {
          message: 'Erro no servidor. Tente novamente mais tarde.',
        });
      } else if (!error.response) {
        showUpdateError('Sensor Digital', {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        });
      } else {
        showUpdateError('Sensor Digital', error);
      }
    }
  };

  // Renderizar estado de carregamento
  if (isLoadingSensor) {
    return (
      <div className='h-full flex flex-col'>
        <div className='px-6'>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold text-zinc-900'>
              Editando Sensor Digital
            </h1>
            <p className='text-zinc-600'>Carregando dados do sensor...</p>
          </div>
        </div>
        <div className='flex-1 px-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className='bg-white border border-zinc-200 rounded-lg p-6 h-48'
              >
                <div className='space-y-4'>
                  <div className='h-4 bg-zinc-200 rounded w-3/4'></div>
                  <div className='h-4 bg-zinc-200 rounded w-1/2'></div>
                  <div className='space-y-2'>
                    <div className='h-3 bg-zinc-200 rounded w-full'></div>
                    <div className='h-3 bg-zinc-200 rounded w-2/3'></div>
                    <div className='h-3 bg-zinc-200 rounded w-4/5'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar estado de erro
  if (sensorError) {
    return (
      <div className='h-full flex flex-col'>
        <div className='px-6'>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold text-zinc-900'>
              Editando Sensor Digital
            </h1>
            <p className='text-zinc-600'>Erro ao carregar sensor</p>
          </div>
        </div>
        <div className='flex-1 px-6'>
          <div className='text-center py-12'>
            <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
              <h3 className='text-lg font-medium text-red-900 mb-2'>
                Erro ao carregar sensor
              </h3>
              <p className='text-red-600'>
                Não foi possível carregar os dados do sensor. Tente novamente.
              </p>
              <Button
                variant='outline'
                colorScheme='default'
                size='md'
                onClick={() => navigate('/p-trace/sensors')}
                className='mt-4'
              >
                Voltar para Sensores
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
            onClick={() => navigate('/p-trace/sensors')}
            className='flex items-center gap-2'
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
          <h1 className='text-2xl font-bold text-zinc-900'>
            Editando Sensor Digital
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
                        editingField !== null || updateSensorMutation.isPending
                      }
                      className='flex items-center gap-2'
                    >
                      Próximo
                      <ArrowRight size={16} />
                    </Button>
                  ) : (
                    // Botão "Atualizar Sensor Digital" para o passo 2 (submissão do formulário)
                    <Button
                      type='submit'
                      variant='contained'
                      colorScheme='primary'
                      size='lg'
                      disabled={
                        editingField !== null || updateSensorMutation.isPending
                      }
                      className='flex items-center gap-2'
                    >
                      {updateSensorMutation.isPending
                        ? 'Atualizando...'
                        : 'Atualizar Sensor Digital'}
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
