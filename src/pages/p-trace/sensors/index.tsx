import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit,
  Gauge,
  Activity,
  X,
  Zap,
  BarChart3,
} from 'lucide-react';
import {
  Button,
  DataCard,
  useSensors,
  useDeleteSensor,
} from '../../../components';
import { useMeasurementUnits, useModules } from '../../../lib';
import type { Sensor } from '../../../types/sensor';

export default function SensorsPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // 4 cards por linha × 3 linhas
  const [showSensorTypeModal, setShowSensorTypeModal] = useState(false);

  // Buscar sensores com paginação
  const {
    data: sensorsData,
    isLoading,
    error,
  } = useSensors({
    page: currentPage,
    limit: pageSize,
  });

  // Buscar dados para exibir nomes em vez de IDs
  const { data: measurementUnitsData } = useMeasurementUnits();
  const { data: modulesData } = useModules();

  const deleteSensor = useDeleteSensor();

  const sensors = useMemo(
    () => sensorsData?.data?.sensors || [],
    [sensorsData?.data?.sensors]
  );
  const pagination = sensorsData?.data?.pagination;

  // Debug: verificar dados dos sensores
  useEffect(() => {
    if (sensors.length > 0) {
      console.log(
        '🔍 Debug - Dados dos sensores:',
        sensors.map(sensor => ({
          id: sensor.id,
          name: sensor.name,
          sensorType: sensor.sensorType,
          sensorTypeString:
            sensor.sensorType === 0
              ? 'Analógico'
              : sensor.sensorType === 1
                ? 'Digital'
                : 'Desconhecido',
        }))
      );
    }
  }, [sensors]);

  // Função para deletar sensor
  const handleDeleteSensor = async (sensorId: string) => {
    if (confirm('Tem certeza que deseja excluir este sensor?')) {
      try {
        await deleteSensor.mutateAsync(sensorId);
      } catch (error) {
        console.error('Erro ao deletar sensor:', error);
      }
    }
  };

  // Função para obter status do sensor
  const getSensorStatus = (sensor: Sensor) => {
    if (sensor.isDeleted) {
      return { label: 'Excluído', variant: 'error' as const };
    }
    return { label: 'Ativo', variant: 'success' as const };
  };

  // Função para obter badges do sensor
  const getSensorBadges = (sensor: Sensor) => {
    const badges = [];

    // Debug: verificar tipo do sensor
    console.log('🔍 Debug - Badge do sensor:', {
      sensorId: sensor.id,
      sensorName: sensor.name,
      sensorType: sensor.sensorType,
      sensorTypeString:
        sensor.sensorType === 0
          ? 'Analógico'
          : sensor.sensorType === 1
            ? 'Digital'
            : 'Desconhecido',
    });

    // Badge principal: Tipo do sensor
    if (sensor.sensorType !== undefined) {
      if (sensor.sensorType === 0) {
        badges.push({
          label: 'Analógico',
          variant: 'info' as const,
          icon: <BarChart3 size={12} />,
        });
      } else if (sensor.sensorType === 1) {
        badges.push({
          label: 'Digital',
          variant: 'success' as const,
          icon: <Zap size={12} />,
        });
      } else {
        badges.push({
          label: `Tipo ${sensor.sensorType}`,
          variant: 'default' as const,
        });
      }
    }

    return badges;
  };

  // Função para obter campos do sensor
  const getSensorFields = (sensor: Sensor) => {
    const fields = [];

    // Campos comuns para todos os sensores
    fields.push({
      label: 'Escala Mín',
      value: sensor.minScale?.toString() || 'N/A',
      icon: <Gauge size={14} className='text-zinc-400' />,
    });

    fields.push({
      label: 'Escala Máx',
      value: sensor.maxScale?.toString() || 'N/A',
      icon: <Gauge size={14} className='text-zinc-400' />,
    });

    fields.push({
      label: 'Alarme Mín',
      value: sensor.minAlarm?.toString() || 'N/A',
      icon: <Activity size={14} className='text-zinc-400' />,
    });

    fields.push({
      label: 'Alarme Máx',
      value: sensor.maxAlarm?.toString() || 'N/A',
      icon: <Activity size={14} className='text-zinc-400' />,
    });

    // Campos específicos para sensores analógicos
    if (sensor.sensorType === 0) {
      // Campos específicos para sensores analógicos serão adicionados quando o tipo for expandido
      fields.push({
        label: 'Tipo',
        value: 'Analógico',
        icon: <BarChart3 size={14} className='text-blue-400' />,
      });
    }

    // Campos específicos para sensores digitais
    if (sensor.sensorType === 1) {
      // Campos específicos para sensores digitais serão adicionados quando o tipo for expandido
      fields.push({
        label: 'Tipo',
        value: 'Digital',
        icon: <Zap size={14} className='text-green-400' />,
      });
    }

    // Informações de relacionamento
    if (sensor.measurementUnitId) {
      const unit = measurementUnitsData?.data?.measurementUnits?.find(
        u => u.id === sensor.measurementUnitId
      );
      if (unit) {
        fields.push({
          label: 'Unidade',
          value: unit.label,
          icon: <Gauge size={14} className='text-purple-400' />,
        });
      }
    }

    if (sensor.moduleId) {
      const module = modulesData?.data?.modules?.find(
        m => m.id === sensor.moduleId
      );
      if (module) {
        fields.push({
          label: 'Módulo',
          value: `${module.machineName} - ${module.sector}`,
          icon: <Activity size={14} className='text-purple-400' />,
        });
      }
    }

    return fields;
  };

  // Função para obter ações do sensor
  const getSensorActions = (sensor: Sensor) => {
    const actions = [
      {
        label: 'Editar',
        icon: <Edit size={14} />,
        onClick: () => {
          // Debug: verificar tipo do sensor
          console.log('🔍 Debug - Navegando para edição:', {
            sensorId: sensor.id,
            sensorName: sensor.name,
            sensorType: sensor.sensorType,
            sensorTypeString:
              sensor.sensorType === 0
                ? 'Analógico'
                : sensor.sensorType === 1
                  ? 'Digital'
                  : 'Desconhecido',
          });

          // Direcionar para a rota correta baseada no tipo do sensor
          if (sensor.sensorType === 0) {
            // Sensor analógico
            console.log('📊 Navegando para página analógica');
            navigate(`/p-trace/sensors/analog/${sensor.id}`);
          } else if (sensor.sensorType === 1) {
            // Sensor digital
            console.log('⚡ Navegando para página digital');
            navigate(`/p-trace/sensors/digital/${sensor.id}`);
          } else {
            // Fallback para rota genérica (não deveria acontecer)
            console.log('❓ Tipo de sensor desconhecido, usando rota genérica');
            navigate(`/p-trace/sensors/${sensor.id}`);
          }
        },
        variant: 'default' as const,
      },
    ];

    if (!sensor.isDeleted) {
      actions.push({
        label: 'Excluir',
        icon: <Trash2 size={14} />,
        onClick: () => handleDeleteSensor(sensor.id),
        variant: 'default' as const,
      });
    }

    return actions;
  };

  // Função para abrir modal de seleção de tipo
  const handleNewSensorClick = () => {
    setShowSensorTypeModal(true);
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setShowSensorTypeModal(false);
  };

  // Função para navegar para criação de sensor específico
  const handleSensorTypeSelect = (type: 'analog' | 'digital') => {
    setShowSensorTypeModal(false);
    if (type === 'analog') {
      navigate('/p-trace/sensors/new-analog');
    } else {
      navigate('/p-trace/sensors/new-digital');
    }
  };

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <div className='h-full flex flex-col'>
        <div className='px-6'>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold text-zinc-900'>Sensores</h1>
            <p className='text-zinc-600'>Gerenciamento de sensores</p>
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
  if (error) {
    return (
      <div className='h-full flex flex-col'>
        <div className='px-6'>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold text-zinc-900'>Sensores</h1>
            <p className='text-zinc-600'>Gerenciamento de sensores</p>
          </div>
        </div>
        <div className='flex-1 px-6'>
          <div className='text-center py-12'>
            <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
              <h3 className='text-lg font-medium text-red-900 mb-2'>
                Erro ao carregar sensores
              </h3>
              <p className='text-red-600'>
                Não foi possível carregar a lista de sensores. Tente novamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='px-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-zinc-900'>Sensores</h1>
            <p className='text-zinc-600'>Gerenciamento de sensores</p>
          </div>
          <Button
            variant='contained'
            colorScheme='primary'
            size='md'
            className='flex items-center gap-2'
            onClick={handleNewSensorClick}
          >
            <Plus size={20} />
            Novo sensor
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className='flex-1 px-6'>
        {sensors.length > 0 ? (
          <>
            {/* Grid de sensores */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              {sensors.map(sensor => (
                <DataCard
                  key={sensor.id}
                  title={sensor.name}
                  subtitle={`ID: ${sensor.id.slice(0, 8)}...`}
                  icon={
                    sensor.sensorType === 0 ? (
                      <BarChart3 size={20} />
                    ) : (
                      <Zap size={20} />
                    )
                  }
                  iconBgColor={
                    sensor.sensorType === 0 ? 'bg-blue-50' : 'bg-green-50'
                  }
                  iconColor={
                    sensor.sensorType === 0 ? 'text-blue-600' : 'text-green-600'
                  }
                  fields={getSensorFields(sensor)}
                  status={getSensorStatus(sensor)}
                  badges={getSensorBadges(sensor)}
                  actions={getSensorActions(sensor)}
                  isDeleted={sensor.isDeleted}
                  className='h-full'
                />
              ))}
            </div>

            {/* Paginação */}
            {pagination && pagination.pages > 1 && (
              <div className='flex items-center justify-between border-t border-zinc-200 pt-6'>
                <div className='text-sm text-zinc-600'>
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{' '}
                  de {pagination.total} sensores
                </div>

                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    colorScheme='default'
                    size='sm'
                    onClick={() => setCurrentPage(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Anterior
                  </Button>

                  <span className='px-3 py-1 text-sm text-zinc-600'>
                    Página {pagination.page} de {pagination.pages}
                  </span>

                  <Button
                    variant='outline'
                    colorScheme='default'
                    size='sm'
                    onClick={() => setCurrentPage(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Estado vazio */
          <div className='text-center py-12'>
            <div className='bg-zinc-50 border border-zinc-200 rounded-lg p-12'>
              <Gauge size={48} className='mx-auto text-zinc-400 mb-4' />
              <h3 className='text-lg font-medium text-zinc-900 mb-2'>
                Nenhum sensor encontrado
              </h3>
              <p className='text-zinc-600 mb-6'>
                Comece criando seu primeiro sensor para monitorar equipamentos.
              </p>
              <Button
                variant='contained'
                colorScheme='primary'
                size='md'
                className='flex items-center gap-2 mx-auto'
                onClick={handleNewSensorClick}
              >
                <Plus size={20} />
                Criar primeiro sensor
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de seleção de tipo de sensor */}
      {showSensorTypeModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-zinc-900'>
                Selecione o tipo de sensor
              </h3>
              <button
                onClick={handleCloseModal}
                className='text-zinc-400 hover:text-zinc-600 transition-colors'
              >
                <X size={20} />
              </button>
            </div>

            <div className='space-y-4'>
              <button
                onClick={() => handleSensorTypeSelect('analog')}
                className='w-full p-4 border border-zinc-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group'
              >
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors'>
                    <BarChart3 size={24} className='text-blue-600' />
                  </div>
                  <div className='text-left'>
                    <h4 className='font-medium text-zinc-900'>
                      Sensor Analógico
                    </h4>
                    <p className='text-sm text-zinc-600'>
                      Para medições contínuas (temperatura, pressão, etc.)
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSensorTypeSelect('digital')}
                className='w-full p-4 border border-zinc-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group'
              >
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors'>
                    <Zap size={24} className='text-green-600' />
                  </div>
                  <div className='text-left'>
                    <h4 className='font-medium text-zinc-900'>
                      Sensor Digital
                    </h4>
                    <p className='text-sm text-zinc-600'>
                      Para estados discretos (ligado/desligado, presença, etc.)
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className='mt-6 flex justify-end'>
              <Button
                variant='outline'
                colorScheme='default'
                size='sm'
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
