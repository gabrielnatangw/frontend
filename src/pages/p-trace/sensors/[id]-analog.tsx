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
  Gauge,
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

// Schema de validação Zod para sensores analógicos
const analogSensorSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    measurementUnitId: z.string().min(1, 'Unidade de medida é obrigatória'),
    entry: z.number(),
    inputMode: z.enum(['cmode', 'diff']),
    moduleId: z.string().min(1, 'Módulo é obrigatório'),
    minScale: z.number(),
    maxScale: z.number(),
    minAlarm: z.number(),
    maxAlarm: z.number(),
    gain: z.number(),
    offset: z.number(),
    alarmTimer: z.number(),
    gaugeColor: z.enum(['gc1', 'gc2', 'gc3', 'gc4', 'gc5']),
  })
  .refine(data => data.minScale < data.maxScale, {
    message: 'Escala mínima deve ser menor que escala máxima',
    path: ['minScale'],
  })
  .refine(data => data.minAlarm >= data.minScale, {
    message: 'Alarme mínimo deve ser maior ou igual à escala mínima',
    path: ['minAlarm'],
  })
  .refine(data => data.maxAlarm <= data.maxScale, {
    message: 'Alarme máximo deve ser menor ou igual à escala máxima',
    path: ['maxAlarm'],
  })
  .refine(data => data.minAlarm < data.maxAlarm, {
    message: 'Alarme mínimo deve ser menor que alarme máximo',
    path: ['minAlarm'],
  });

type AnalogSensorFormData = z.infer<typeof analogSensorSchema>;

export default function EditAnalogSensorPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [currentStep, setCurrentStep] = useState(0);
  const [editingField, setEditingField] = useState<
    keyof AnalogSensorFormData | null
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
  } = useForm<AnalogSensorFormData>({
    resolver: zodResolver(analogSensorSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      measurementUnitId: '',
      entry: 0,
      inputMode: 'cmode',
      moduleId: '',
      minScale: 0,
      maxScale: 100,
      minAlarm: 10,
      maxAlarm: 90,
      gain: 1.0,
      offset: 0.0,
      alarmTimer: 0,
      gaugeColor: 'gc5',
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

  // Funções auxiliares para buscar nomes pelos IDs
  const getModuleName = (moduleId: string) => {
    if (!modulesData?.data?.modules) return moduleId;
    const module = modulesData.data.modules.find(m => m.id === moduleId);
    return module ? `${module.customer} - ${module.sector}` : moduleId;
  };

  const getMeasurementUnitName = (unitId: string) => {
    if (!measurementUnitsData?.data?.measurementUnits) return unitId;
    const unit = measurementUnitsData.data.measurementUnits.find(
      u => u.id === unitId
    );
    return unit ? `${unit.label} (${unit.unitSymbol})` : unitId;
  };

  // Hook para atualizar sensor
  const updateSensorMutation = useUpdateSensor();

  // Hook para notificações
  const { showUpdateSuccess, showUpdateError, showValidationError } =
    useNotifications();

  const formData = watch();

  // Debug: verificar se o ID está sendo extraído corretamente
  useEffect(() => {
    console.log('🔍 Debug - ID extraído:', {
      id: id,
      isIdValid: !!id && id !== 'undefined',
    });

    // Validar se o ID é válido
    if (!id || id === 'undefined') {
      console.error('❌ ID inválido para sensor analógico:', { id: id });
      navigate('/p-trace/sensors');
      return;
    }
  }, [id, navigate]);

  // Debug: verificar estado de autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { useAuthStore } = await import('../../../lib/stores/auth-store');
        const authState = useAuthStore.getState();
        console.log('🔐 Estado de autenticação:', {
          isAuthenticated: authState.isAuthenticated,
          hasToken: !!authState.accessToken,
          token: authState.accessToken ? 'Presente' : 'Ausente',
        });
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
      }
    };
    checkAuth();
  }, []);

  // Debug: verificar estado da query
  useEffect(() => {
    console.log('🔍 Estado da query do sensor:', {
      isLoading: isLoadingSensor,
      hasData: !!sensorData,
      hasError: !!sensorError,
      data: sensorData,
      error: sensorError,
    });
  }, [isLoadingSensor, sensorData, sensorError]);

  // Preencher formulário quando os dados do sensor chegarem
  useEffect(() => {
    if (sensorData?.data) {
      const sensor = sensorData.data as any;

      console.log('📊 Dados do sensor analógico recebidos:', {
        sensorId: sensor.id,
        sensorName: sensor.name,
        sensorType: sensor.sensorType,
        rawData: sensor,
      });

      // Mapear campos da API para o formulário
      const formData = {
        name: sensor.name || '',
        measurementUnitId: sensor.measurementUnitId || '',
        entry: sensor.ix || 0, // Mapear ix para entry
        inputMode: sensor.inputMode || 'cmode', // Campo específico do sensor analógico
        moduleId: sensor.moduleId || '',
        minScale: sensor.minScale || 0,
        maxScale: sensor.maxScale || 100,
        minAlarm: sensor.minAlarm || 10,
        maxAlarm: sensor.maxAlarm || 90,
        gain: sensor.gain || 1.0, // Campo específico do sensor analógico
        offset: sensor.offset || 0.0, // Campo específico do sensor analógico
        alarmTimer: sensor.alarmTimeout || 0, // Mapear alarmTimeout para alarmTimer
        gaugeColor: sensor.gaugeColor || 'gc5', // Campo específico do sensor analógico
      };

      console.log('📝 Preenchendo formulário com dados:', formData);
      reset(formData);
      // setIsDataLoaded(true);
    } else if (sensorError) {
      console.error(
        '❌ Erro ao carregar dados do sensor analógico:',
        sensorError
      );
      // setIsDataLoaded(false);
    } else if (!isLoadingSensor && !sensorData) {
      console.warn('⚠️ Nenhum dado de sensor encontrado');
    }
  }, [sensorData, sensorError, isLoadingSensor, reset]);

  const nextStep = async () => {
    if (currentStep < 2) {
      let fieldsToValidate: (keyof AnalogSensorFormData)[] = [];

      if (currentStep === 0) {
        fieldsToValidate = [
          'name',
          'measurementUnitId',
          'entry',
          'inputMode',
          'moduleId',
        ];
      } else if (currentStep === 1) {
        fieldsToValidate = [
          'minScale',
          'maxScale',
          'minAlarm',
          'maxAlarm',
          'gain',
          'offset',
          'alarmTimer',
          'gaugeColor',
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
    field: keyof AnalogSensorFormData,
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
    field: keyof AnalogSensorFormData,
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
                  {value !== null && value !== undefined
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
              <Gauge size={20} className='text-blue-600' />
              Configuração Básica do Sensor
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Informações principais e configurações básicas
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nome do Sensor *</Label>
                <Input
                  {...register('name')}
                  placeholder='Ex: Sensor Temperatura Forno'
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
                </select>
                {errors.entry && (
                  <p className='text-xs text-red-600'>{errors.entry.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='inputMode'>
                  Modo de Entrada *{' '}
                  <span className='text-xs text-zinc-500'>(obrigatório)</span>
                </Label>
                <select
                  {...register('inputMode')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.inputMode ? 'border-red-500' : 'border-zinc-300'
                  }`}
                >
                  <option value='cmode'>Modo Comum</option>
                  <option value='dmode'>Modo Diferencial</option>
                </select>
                {errors.inputMode && (
                  <p className='text-xs text-red-600'>
                    {errors.inputMode.message}
                  </p>
                )}
              </div>

              <div className='space-y-2 md:col-span-2'>
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

      case 1:
        return (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold text-zinc-900 flex items-center gap-2'>
              <Activity size={20} className='text-green-600' />
              Configuração de Escalas e Alarmes
            </h3>
            <p className='text-sm text-zinc-600 mb-4'>
              Configurações de escalas, alarmes e calibração
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='minScale'>Escala Mínima *</Label>
                <Input
                  {...register('minScale', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  placeholder='Ex: 0'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.minScale ? 'border-red-500' : ''}
                />
                {errors.minScale && (
                  <p className='text-xs text-red-600'>
                    {errors.minScale.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxScale'>Escala Máxima *</Label>
                <Input
                  {...register('maxScale', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  placeholder='Ex: 200'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.maxScale ? 'border-red-500' : ''}
                />
                {errors.maxScale && (
                  <p className='text-xs text-red-600'>
                    {errors.maxScale.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='minAlarm'>Alarme Mínimo *</Label>
                <Input
                  {...register('minAlarm', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  placeholder='Ex: 10'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.minAlarm ? 'border-red-500' : ''}
                />
                {errors.minAlarm && (
                  <p className='text-xs text-red-600'>
                    {errors.minAlarm.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxAlarm'>Alarme Máximo *</Label>
                <Input
                  {...register('maxAlarm', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  placeholder='Ex: 180'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.maxAlarm ? 'border-red-500' : ''}
                />
                {errors.maxAlarm && (
                  <p className='text-xs text-red-600'>
                    {errors.maxAlarm.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='gain'>Ganho *</Label>
                <Input
                  {...register('gain', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  placeholder='Ex: 1.0'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.gain ? 'border-red-500' : ''}
                />
                {errors.gain && (
                  <p className='text-xs text-red-600'>{errors.gain.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='offset'>Offset *</Label>
                <Input
                  {...register('offset', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  placeholder='Ex: 0.0'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.offset ? 'border-red-500' : ''}
                />
                {errors.offset && (
                  <p className='text-xs text-red-600'>
                    {errors.offset.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='alarmTimer'>Temporizador de Alarme *</Label>
                <Input
                  {...register('alarmTimer', { valueAsNumber: true })}
                  type='number'
                  step='1'
                  placeholder='Ex: 0'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className={errors.alarmTimer ? 'border-red-500' : ''}
                />
                {errors.alarmTimer && (
                  <p className='text-xs text-red-600'>
                    {errors.alarmTimer.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='gaugeColor'>
                  Medidor de Cor *{' '}
                  <span className='text-xs text-zinc-500'>(obrigatório)</span>
                </Label>
                <select
                  {...register('gaugeColor')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.gaugeColor ? 'border-red-500' : 'border-zinc-300'
                  }`}
                >
                  <option value='gc5'>Default</option>
                  <option value='gc1'>Azul</option>
                  <option value='gc2'>Verde</option>
                  <option value='gc3'>Amarelo</option>
                  <option value='gc4'>Cinza</option>
                </select>
                {errors.gaugeColor && (
                  <p className='text-xs text-red-600'>
                    {errors.gaugeColor.message}
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
                Dados do Sensor Analógico
              </h4>
              <div className='space-y-1'>
                {renderEditableField('name', 'Nome', formData.name || '')}
                {renderEditableField(
                  'measurementUnitId',
                  'Unidade de Medida',
                  getMeasurementUnitName(formData.measurementUnitId || '')
                )}
                {renderEditableField('entry', 'Entrada', formData.entry || 0)}
                {renderEditableField(
                  'inputMode',
                  'Modo de Entrada',
                  formData.inputMode || ''
                )}
                {renderEditableField(
                  'moduleId',
                  'Módulo',
                  getModuleName(formData.moduleId || '')
                )}
                {renderEditableField(
                  'minScale',
                  'Escala Mínima',
                  formData.minScale || 0
                )}
                {renderEditableField(
                  'maxScale',
                  'Escala Máxima',
                  formData.maxScale || 0
                )}
                {renderEditableField(
                  'minAlarm',
                  'Alarme Mínimo',
                  formData.minAlarm || 0
                )}
                {renderEditableField(
                  'maxAlarm',
                  'Alarme Máximo',
                  formData.maxAlarm || 0
                )}
                {renderEditableField('gain', 'Ganho', formData.gain || 0)}
                {renderEditableField('offset', 'Offset', formData.offset || 0)}
                {renderEditableField(
                  'alarmTimer',
                  'Temporizador de Alarme',
                  formData.alarmTimer || 0
                )}
                {renderEditableField(
                  'gaugeColor',
                  'Medidor de Cor',
                  formData.gaugeColor || ''
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

  const onSubmit = async (data: AnalogSensorFormData) => {
    try {
      // Validar se o ID existe
      if (!id || id === 'undefined') {
        showUpdateError('Sensor Analógico', {
          message: 'ID do sensor não encontrado. Verifique a URL.',
        });
        return;
      }

      // Adaptar dados para a API de atualização de sensores (conforme ROTAS_SENSORES.md)
      const sensorData = {
        name: data.name,
        minScale: data.minScale,
        maxScale: data.maxScale,
        minAlarm: data.minAlarm,
        maxAlarm: data.maxAlarm,
        gain: data.gain,
        inputMode: data.inputMode,
        ix: data.entry,
        gaugeColor: data.gaugeColor,
        offset: data.offset,
        alarmTimeout: data.alarmTimer, // Mapear alarmTimer para alarmTimeout
        counterName: null, // Campo específico para sensor analógico
        frequencyCounterName: null, // Campo específico para sensor analógico
        speedSource: false, // Campo específico para sensor analógico
        interruptTransition: null, // Campo específico para sensor analógico
        timeUnit: 'ms', // Campo específico para sensor analógico
        speedUnit: 'RPM', // Campo específico para sensor analógico
        samplingInterval: 1000, // Campo específico para sensor analógico
        minimumPeriod: 0.1, // Campo específico para sensor analógico
        maximumPeriod: 10.0, // Campo específico para sensor analógico
        frequencyResolution: 0.01, // Campo específico para sensor analógico
        sensorType: 0, // Tipo analógico
        measurementUnitId: data.measurementUnitId,
        moduleId: data.moduleId,
      };

      await updateSensorMutation.mutateAsync({
        id: id!,
        data: sensorData,
      });

      showUpdateSuccess('Sensor Analógico');
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
        showUpdateError('Sensor Analógico', error);
      } else if (err.response?.status >= 500) {
        showUpdateError('Sensor Analógico', {
          message: 'Erro no servidor. Tente novamente mais tarde.',
        });
      } else if (!err.response) {
        showUpdateError('Sensor Analógico', {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        });
      } else {
        showUpdateError('Sensor Analógico', error);
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
              Editando Sensor Analógico
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
              Editando Sensor Analógico
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
            Editando Sensor Analógico
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
                  { label: 'Escalas e Alarmes' },
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

                {/* Lado direito - Botões Voltar e Próximo/Atualizar Sensor */}
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
                    // Botão "Atualizar Sensor Analógico" para o passo 2 (submissão do formulário)
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
                        : 'Atualizar Sensor Analógico'}
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
