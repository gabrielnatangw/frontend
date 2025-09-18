import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BarChart3,
  Activity,
  AlertCircle,
  Loader2,
  Building2,
  Check,
  Gauge as GaugeIcon,
} from 'lucide-react';
import { Stepper } from '../../components';
import { ChartType } from '../../types/view';
import { useSensors, useModules, useMeasurementUnits } from '../../lib';
import { useCreateCard, useUpdateCard } from '../../lib/hooks/use-card-creator';
import Gauge from '../gauge';
import OnOffIndicator from '../onoff-indicator';
import StepChart from '../stepchart';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

// Componente para preview dos gráficos
interface ChartPreviewProps {
  chartType: string;
  sensorType?: number;
  sensorName?: string;
  minScale?: number;
  maxScale?: number;
}

function ChartPreview({
  chartType,
  sensorType,
  sensorName,
  minScale,
  maxScale,
}: ChartPreviewProps) {
  const isDigitalSensor = sensorType === 1;

  // Dados de exemplo para gráficos
  const sampleData = Array.from({ length: 12 }).map((_, i) => ({
    name: `P${i + 1}`,
    value: isDigitalSensor
      ? Math.round(Math.random())
      : Math.round(20 + Math.random() * 80),
    a: Math.round(20 + Math.random() * 80),
    b: Math.round(10 + Math.random() * 60),
  }));

  switch (chartType) {
    case 'GAUGE':
      return (
        <div className='h-full flex items-center justify-center'>
          <Gauge
            value={72}
            min={minScale || 0}
            max={maxScale || 100}
            label={sensorName || 'Sensor'}
            responsive
            valueFontScale={0.18}
            labelFontScale={0.04}
            lineCap='butt'
          />
        </div>
      );

    case 'LINE':
      return (
        <div className='h-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={sampleData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='name' tick={{ fontSize: 10 }} stroke='#9ca3af' />
              <YAxis tick={{ fontSize: 10 }} stroke='#9ca3af' />
              <Tooltip cursor={{ stroke: '#93c5fd', strokeWidth: 1 }} />
              <Line
                type='monotone'
                dataKey='a'
                stroke='#2563eb'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );

    case 'BAR':
      return (
        <div className='h-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={sampleData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='name' tick={{ fontSize: 10 }} stroke='#9ca3af' />
              <YAxis tick={{ fontSize: 10 }} stroke='#9ca3af' />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey='a' fill='#2563eb' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'ONOFF':
      return (
        <div className='h-full flex items-center justify-center'>
          <OnOffIndicator
            value={Math.random() > 0.5}
            label={sensorName || 'Sensor Digital'}
          />
        </div>
      );

    case 'STEP':
      return (
        <div className='h-full'>
          <StepChart data={sampleData} />
        </div>
      );

    default:
      return (
        <div className='h-full flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3'>
              <Activity className='w-6 h-6 text-blue-600' />
            </div>
            <p className='text-sm font-medium text-zinc-700'>Preview</p>
            <p className='text-xs text-zinc-500'>
              Selecione um tipo de gráfico
            </p>
          </div>
        </div>
      );
  }
}

// Schema de validação Zod
const createCardSchema = z.object({
  sensorId: z.string().min(1, 'Sensor é obrigatório'),
  moduleId: z.string().min(1, 'Módulo é obrigatório'),
  chartType: z.enum(['GAUGE', 'LINE', 'BAR', 'ONOFF', 'STEP'] as const),
  // positionX, positionY, width, height, title, isVisible, sortOrder e isActive são definidos automaticamente
});

type CreateCardFormData = z.infer<typeof createCardSchema>;

// Tipos de gráfico com ícones
const chartTypeOptions = [
  {
    value: 'GAUGE',
    label: 'Gauge',
    icon: GaugeIcon,
    description: 'Medidor circular',
  },
  {
    value: 'LINE',
    label: 'Linha',
    icon: Activity,
    description: 'Gráfico de linha',
  },
  {
    value: 'BAR',
    label: 'Barras',
    icon: BarChart3,
    description: 'Gráfico de barras',
  },
  {
    value: 'ONOFF',
    label: 'On/Off',
    icon: Activity,
    description: 'Indicador ligado/desligado',
  },
  {
    value: 'STEP',
    label: 'Degraus',
    icon: Activity,
    description: 'Gráfico de degraus',
  },
];

interface CardCreatorProps {
  viewId: string; // ID da view onde o card será criado
  onCardCreated?: (card: any) => void;
  existingCard?: any; // Para edição
  isOpen: boolean;
  onClose: () => void;
}

export default function CardCreator({
  viewId,
  onCardCreated,
  existingCard,
  isOpen,
  onClose,
}: CardCreatorProps) {
  // Estado de loading será gerenciado pela mutation
  const [currentStep, setCurrentStep] = useState(0);

  // Hooks para buscar dados
  const {
    data: sensorsData,
    isLoading: sensorsLoading,
    error: sensorsError,
  } = useSensors();
  const {
    data: modulesData,
    isLoading: modulesLoading,
    error: modulesError,
  } = useModules();
  const { data: measurementUnitsData } = useMeasurementUnits();

  // Hooks para criar e atualizar card
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();

  // Steps do stepper
  const steps = [
    { label: 'Selecione o módulo' },
    { label: 'Selecione o sensor' },
    { label: 'Selecione o tipo de gráfico' },
  ];

  // React Hook Form
  const { handleSubmit, watch, setValue, reset } = useForm<CreateCardFormData>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      sensorId: existingCard?.sensorId || '',
      moduleId: existingCard?.moduleId || '',
      chartType: existingCard?.chartType || 'GAUGE',
    },
  });

  const formData = watch();

  // Validação manual para verificar se todos os campos obrigatórios estão preenchidos
  const isFormValid = React.useMemo(() => {
    const valid = !!(
      formData.sensorId &&
      formData.moduleId &&
      formData.chartType
    );
    console.log('Validação do formulário:', {
      sensorId: formData.sensorId,
      moduleId: formData.moduleId,
      chartType: formData.chartType,
      isValid: valid,
    });
    return valid;
  }, [formData.sensorId, formData.moduleId, formData.chartType]);

  // Obter dados do sensor selecionado
  const selectedSensor = sensorsData?.data?.sensors?.find(
    s => s.id === formData.sensorId
  ) as any;

  // Obter unidade de medida do sensor selecionado
  const selectedMeasurementUnit =
    measurementUnitsData?.data?.measurementUnits?.find(
      unit => unit.id === selectedSensor?.measurementUnitId
    );

  // Gerar título automaticamente baseado no measurementUnitId
  const generateTitle = React.useCallback(() => {
    if (!selectedSensor?.measurementUnitId) return '';

    const unitLabel = selectedMeasurementUnit?.label || '';
    const unitSymbol = selectedMeasurementUnit?.unitSymbol || '';
    const ix = selectedSensor?.ix;

    // Formato: "Entrada ${ix} - ${unitLabel} ${unitSymbol}"
    // Exemplo: "Entrada 1 - Temperatura °C"
    if (ix !== undefined && unitLabel && unitSymbol) {
      return `Entrada ${ix} - ${unitLabel} ${unitSymbol}`;
    } else if (ix !== undefined && unitLabel) {
      return `Entrada ${ix} - ${unitLabel}`;
    } else if (ix !== undefined && unitSymbol) {
      return `Entrada ${ix} - ${unitSymbol}`;
    } else if (unitLabel && unitSymbol) {
      return `${unitLabel} ${unitSymbol}`;
    } else if (unitLabel) {
      return unitLabel;
    } else if (unitSymbol) {
      return unitSymbol;
    }

    return '';
  }, [
    selectedSensor?.measurementUnitId,
    selectedSensor?.ix,
    selectedMeasurementUnit,
  ]);

  // Filtrar tipos de gráfico baseado no tipo de sensor
  const availableChartTypes = React.useMemo(() => {
    if (!selectedSensor) return chartTypeOptions;

    const isDigitalSensor = selectedSensor.sensorType === 1;

    if (isDigitalSensor) {
      // Para sensores digitais, apenas ONOFF e STEP
      return chartTypeOptions.filter(
        option => option.value === 'ONOFF' || option.value === 'STEP'
      );
    } else {
      // Para sensores analógicos, todos exceto ONOFF e STEP
      return chartTypeOptions.filter(
        option => option.value !== 'ONOFF' && option.value !== 'STEP'
      );
    }
  }, [selectedSensor]);

  // Reset form quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0); // Reset step
      if (existingCard) {
        // Modo edição
        reset({
          sensorId: existingCard.sensorId,
          moduleId: existingCard.moduleId,
          chartType: existingCard.chartType,
        });
      } else {
        // Modo criação
        reset({
          sensorId: '',
          moduleId: '',
          chartType: 'GAUGE',
        });
      }
    }
  }, [isOpen, existingCard, reset]);

  // Reset chartType quando o sensor muda e atualizar título automaticamente
  useEffect(() => {
    if (selectedSensor && availableChartTypes.length > 0) {
      const currentChartType = formData.chartType;
      const isCurrentChartTypeAvailable = availableChartTypes.some(
        opt => opt.value === currentChartType
      );

      if (!isCurrentChartTypeAvailable) {
        // Se o tipo de gráfico atual não está disponível para o sensor selecionado,
        // seleciona o primeiro tipo disponível
        setValue('chartType', availableChartTypes[0].value as ChartType);
      }

      // Título será gerado automaticamente no onSubmit
    }
  }, [
    selectedSensor,
    availableChartTypes,
    formData.chartType,
    setValue,
    generateTitle,
  ]);

  const onSubmit = async (data: CreateCardFormData) => {
    // Preparar dados para a API
    const cardData = {
      sensorId: data.sensorId,
      moduleId: data.moduleId,
      chartType: data.chartType,
      positionX: existingCard?.positionX || 0, // Manter posição existente ou 0
      positionY: existingCard?.positionY || 0, // Manter posição existente ou 0
      width: existingCard?.width || 4, // Manter largura existente ou 4
      height: existingCard?.height || 9, // Manter altura existente ou 9
      title: generateTitle(), // Título gerado automaticamente
      isVisible: existingCard?.isVisible ?? true, // Manter visibilidade existente ou true
      isActive: existingCard?.isActive ?? true, // Manter status ativo existente ou true
      // sortOrder será mantido para edição ou calculado para criação
    };

    console.log('📤 CardCreator - Enviando para API:', {
      isEdit: !!existingCard,
      cardData,
      existingCardId: existingCard?.id,
    });

    // Escolher mutation baseado se é edição ou criação
    if (existingCard) {
      // EDITAR CARD EXISTENTE
      updateCardMutation.mutate(
        {
          cardId: existingCard.id,
          data: cardData,
        },
        {
          onSuccess: response => {
            console.log('✅ CardCreator - Card atualizado:', response.data);
            onCardCreated?.(response.data);
            onClose();
          },
          onError: error => {
            console.error('Erro ao atualizar card:', error);
          },
        }
      );
    } else {
      // CRIAR NOVO CARD
      createCardMutation.mutate(
        { viewId, data: cardData },
        {
          onSuccess: response => {
            console.log('✅ CardCreator - Card criado:', response.data);
            onCardCreated?.(response.data);
            onClose();
          },
          onError: error => {
            console.error('Erro ao criar card:', error);
          },
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[2147483647]'>
      <div
        className='absolute inset-0 bg-black/30 z-[2147483647]'
        onClick={onClose}
      />
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2147483647] w-[900px] h-[640px] max-w-[95vw] max-h-[92vh] rounded-lg border border-zinc-200 bg-white shadow-lg flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-zinc-200 shrink-0'>
          <h3 className='text-sm font-semibold text-zinc-800'>
            {existingCard ? 'Editar Card' : 'Adicionar sensor'}
          </h3>
          <button
            className='p-1 text-zinc-500 hover:text-zinc-700'
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className='p-4 flex-1 overflow-auto space-y-4'>
          {/* Stepper header */}
          <Stepper variant='wizard' current={currentStep} steps={steps} />

          {/* Conteúdo do passo */}
          {currentStep === 0 && (
            <div>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h4 className='text-sm font-semibold text-zinc-800'>
                    Selecione um módulo
                  </h4>
                  <p className='text-xs text-zinc-600 mt-1'>
                    Escolha o módulo que contém o sensor que deseja monitorar
                  </p>
                </div>
                {modulesData?.data?.pagination && (
                  <div className='text-xs text-zinc-500'>
                    {modulesData.data.pagination.total} módulos disponíveis
                  </div>
                )}
              </div>

              {/* Estado de carregamento */}
              {modulesLoading && (
                <div className='flex items-center justify-center py-12'>
                  <div className='flex items-center gap-3 text-zinc-600'>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    <span className='text-sm'>Carregando módulos...</span>
                  </div>
                </div>
              )}

              {/* Estado de erro */}
              {modulesError && (
                <div className='flex items-center justify-center py-12'>
                  <div className='flex flex-col items-center gap-3 text-red-600'>
                    <AlertCircle className='w-8 h-8' />
                    <div className='text-center'>
                      <p className='text-sm font-medium'>
                        Erro ao carregar módulos
                      </p>
                      <p className='text-xs text-red-500 mt-1'>
                        Verifique sua conexão e tente novamente
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de módulos */}
              {!modulesLoading && !modulesError && (
                <div className='max-h-64 overflow-y-auto'>
                  {modulesData?.data?.modules?.length === 0 ? (
                    <div className='flex items-center justify-center py-8'>
                      <div className='flex flex-col items-center gap-2 text-zinc-400'>
                        <Building2 className='w-6 h-6' />
                        <div className='text-center'>
                          <p className='text-sm font-medium text-zinc-600'>
                            Nenhum módulo encontrado
                          </p>
                          <p className='text-xs text-zinc-500'>
                            Crie um módulo primeiro
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-1'>
                      {modulesData?.data?.modules?.map(module => (
                        <button
                          key={module.id}
                          type='button'
                          onClick={() => setValue('moduleId', module.id)}
                          className={`group w-full p-3 rounded-lg text-left transition-all duration-200 ${
                            formData.moduleId === module.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            {/* Ícone compacto */}
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                formData.moduleId === module.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-zinc-100 text-zinc-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                              }`}
                            >
                              <Building2 className='w-4 h-4' />
                            </div>

                            {/* Conteúdo compacto */}
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between'>
                                <h5 className='text-sm font-semibold text-zinc-900 truncate'>
                                  {module.blueprint}
                                </h5>
                                {formData.moduleId === module.id && (
                                  <Check className='w-4 h-4 text-blue-500' />
                                )}
                              </div>
                              <div className='flex items-center gap-3 text-xs text-zinc-600 mt-0.5'>
                                <span className='truncate'>
                                  {module.customer}
                                </span>
                                <span>•</span>
                                <span className='truncate'>
                                  {module.sector}
                                </span>
                                {module.machineName && (
                                  <>
                                    <span>•</span>
                                    <span className='truncate'>
                                      {module.machineName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h4 className='text-sm font-semibold text-zinc-800'>
                    Selecione um sensor
                  </h4>
                  <p className='text-xs text-zinc-600 mt-1'>
                    Escolha o sensor que deseja monitorar
                  </p>
                </div>
                {sensorsData?.data?.pagination && (
                  <div className='text-xs text-zinc-500'>
                    {sensorsData.data.pagination.total} sensores disponíveis
                  </div>
                )}
              </div>

              {/* Estado de carregamento */}
              {sensorsLoading && (
                <div className='flex items-center justify-center py-8'>
                  <div className='flex items-center gap-3 text-zinc-600'>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    <span className='text-sm'>Carregando sensores...</span>
                  </div>
                </div>
              )}

              {/* Estado de erro */}
              {sensorsError && (
                <div className='flex items-center justify-center py-8'>
                  <div className='flex flex-col items-center gap-3 text-red-600'>
                    <AlertCircle className='w-8 h-8' />
                    <div className='text-center'>
                      <p className='text-sm font-medium'>
                        Erro ao carregar sensores
                      </p>
                      <p className='text-xs text-red-500 mt-1'>
                        Verifique sua conexão e tente novamente
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de sensores */}
              {!sensorsLoading && !sensorsError && (
                <div className='max-h-64 overflow-y-auto'>
                  {sensorsData?.data?.sensors?.length === 0 ? (
                    <div className='flex items-center justify-center py-8'>
                      <div className='flex flex-col items-center gap-2 text-zinc-400'>
                        <Activity className='w-6 h-6' />
                        <div className='text-center'>
                          <p className='text-sm font-medium text-zinc-600'>
                            Nenhum sensor encontrado
                          </p>
                          <p className='text-xs text-zinc-500'>
                            Este módulo não possui sensores
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-1'>
                      {sensorsData?.data?.sensors?.map(sensor => (
                        <button
                          key={sensor.id}
                          type='button'
                          onClick={() => setValue('sensorId', sensor.id)}
                          className={`group w-full p-3 rounded-lg text-left transition-all duration-200 ${
                            formData.sensorId === sensor.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            {/* Ícone do sensor */}
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                formData.sensorId === sensor.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-zinc-100 text-zinc-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                              }`}
                            >
                              {sensor.sensorType === 0 ? (
                                <GaugeIcon className='w-4 h-4' />
                              ) : (
                                <Activity className='w-4 h-4' />
                              )}
                            </div>

                            {/* Conteúdo do sensor */}
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between'>
                                <h5 className='text-sm font-semibold text-zinc-900 truncate'>
                                  {sensor.name}
                                </h5>
                                {formData.sensorId === sensor.id && (
                                  <Check className='w-4 h-4 text-blue-500' />
                                )}
                              </div>
                              <div className='flex items-center gap-3 text-xs text-zinc-600 mt-0.5'>
                                <span className='truncate'>
                                  {sensor.sensorType === 0
                                    ? 'Analógico'
                                    : 'Digital'}
                                </span>
                                {sensor.minScale !== undefined &&
                                  sensor.maxScale !== undefined && (
                                    <>
                                      <span>•</span>
                                      <span className='truncate'>
                                        {sensor.minScale}-{sensor.maxScale}
                                      </span>
                                    </>
                                  )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className='text-xs font-medium text-zinc-700 mb-2'>
                Tipos de gráfico
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='md:col-span-1'>
                  <div className='flex flex-col gap-3'>
                    {availableChartTypes.map(opt => {
                      const active = formData.chartType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type='button'
                          onClick={() =>
                            setValue('chartType', opt.value as ChartType)
                          }
                          className={`group w-full rounded-lg border p-3 text-left transition bg-white hover:shadow-sm ${
                            active
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            <div className='shrink-0 size-12 p-2 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center'>
                              <opt.icon size={20} />
                            </div>
                            <div className='min-w-0'>
                              <div className='text-sm font-medium text-zinc-800'>
                                {opt.label}
                              </div>
                              <div className='text-xs text-zinc-600 truncate'>
                                {opt.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className='md:col-span-2'>
                  <div className='rounded-lg border border-zinc-200 p-4 bg-zinc-50/50'>
                    <div className='flex items-center justify-between mb-3'>
                      <div>
                        <div className='text-sm font-medium text-zinc-800'>
                          {chartTypeOptions.find(
                            c => c.value === formData.chartType
                          )?.label ?? 'Pré-visualização'}
                        </div>
                        <div className='text-xs text-zinc-600'>
                          {chartTypeOptions.find(
                            c => c.value === formData.chartType
                          )?.description ??
                            'Escolha um tipo de gráfico à esquerda.'}
                        </div>
                      </div>
                      <span className='text-[10px] px-2 py-1 rounded bg-white border border-zinc-200 text-zinc-600'>
                        Preview
                      </span>
                    </div>
                    <div className='rounded-md bg-white border border-zinc-200 p-3'>
                      <div className='h-72'>
                        {formData.chartType && selectedSensor ? (
                          <ChartPreview
                            chartType={formData.chartType}
                            sensorType={selectedSensor.sensorType}
                            sensorName={selectedSensor.name}
                            minScale={selectedSensor.minScale}
                            maxScale={selectedSensor.maxScale}
                          />
                        ) : (
                          <div className='h-full flex items-center justify-center'>
                            <div className='text-center'>
                              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3'>
                                {availableChartTypes.find(
                                  opt => opt.value === formData.chartType
                                )?.icon &&
                                  React.createElement(
                                    availableChartTypes.find(
                                      opt => opt.value === formData.chartType
                                    )!.icon,
                                    { size: 24, className: 'text-blue-600' }
                                  )}
                              </div>
                              <p className='text-sm font-medium text-zinc-700'>
                                {availableChartTypes.find(
                                  opt => opt.value === formData.chartType
                                )?.label || 'Selecione um tipo'}
                              </p>
                              <p className='text-xs text-zinc-500 mt-1'>
                                {availableChartTypes.find(
                                  opt => opt.value === formData.chartType
                                )?.description || 'Escolha um tipo de gráfico'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-between items-center px-4 py-3 border-t border-zinc-200 shrink-0'>
          <button
            type='button'
            className='px-3 py-1.5 rounded-md border border-zinc-300 text-sm hover:bg-zinc-50'
            onClick={onClose}
          >
            Cancelar
          </button>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              className='px-3 py-1.5 rounded-md border border-zinc-300 text-sm hover:bg-zinc-50 disabled:opacity-50'
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(i => Math.max(0, i - 1))}
            >
              Anterior
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                type='button'
                className='px-3 py-1.5 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700'
                disabled={
                  (currentStep === 0 && !formData.moduleId) ||
                  (currentStep === 1 && !formData.sensorId) ||
                  (currentStep === 2 && !formData.chartType)
                }
                onClick={() =>
                  setCurrentStep(i => Math.min(steps.length - 1, i + 1))
                }
              >
                Próximo
              </button>
            ) : (
              <button
                type='button'
                onClick={() => {
                  console.log(
                    'Botão clicado - isFormValid:',
                    isFormValid,
                    'isPending:',
                    createCardMutation.isPending
                  );
                  console.log('formData:', formData);
                  handleSubmit(onSubmit)();
                }}
                disabled={
                  !isFormValid ||
                  createCardMutation.isPending ||
                  updateCardMutation.isPending
                }
                className='px-3 py-1.5 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700'
              >
                {createCardMutation.isPending ||
                updateCardMutation.isPending ? (
                  <>
                    <Loader2 size={16} className='animate-spin mr-2' />
                    {existingCard ? 'Atualizando...' : 'Criando...'}
                  </>
                ) : existingCard ? (
                  'Atualizar Card'
                ) : (
                  'Criar Card'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
