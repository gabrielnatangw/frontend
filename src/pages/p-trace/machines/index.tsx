import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit,
  Factory,
  Calendar,
  Gauge,
  MapPin,
  Zap,
  Building,
} from 'lucide-react';
import { Button, DataCard } from '../../../components';
import { useMachines, useDeleteMachine, useNotifications } from '../../../lib';
import type { Machine } from '../../../types/machine';

export default function MachinesPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // 4 cards por linha × 3 linhas

  // Buscar máquinas com paginação
  const {
    data: machinesData,
    isLoading,
    error,
  } = useMachines({
    page: currentPage,
    limit: pageSize,
  });

  const deleteMachine = useDeleteMachine();

  // Hook para notificações
  const { showDeleteSuccess, showDeleteError } = useNotifications();

  const machines = machinesData?.data?.machines || [];
  const pagination = machinesData?.data?.pagination;

  // Função para deletar máquina
  const handleDeleteMachine = async (machineId: string) => {
    if (confirm('Tem certeza que deseja excluir esta máquina?')) {
      try {
        await deleteMachine.mutateAsync(machineId);
        showDeleteSuccess('Máquina');
      } catch (error) {
        console.error('Erro ao deletar máquina:', error);
        showDeleteError('Máquina', error);
      }
    }
  };

  // Função para obter status da máquina
  const getMachineStatus = (machine: Machine) => {
    if (machine.isDeleted) {
      return { label: 'Excluída', variant: 'error' as const };
    }
    return { label: 'Ativa', variant: 'success' as const };
  };

  // Função para obter badges da máquina
  const getMachineBadges = (machine: Machine) => {
    const badges = [];

    if (machine.operationalSector) {
      badges.push({
        label: machine.operationalSector,
        variant: 'info' as const,
      });
    }

    if (machine.manufacturer) {
      badges.push({ label: machine.manufacturer, variant: 'default' as const });
    }

    return badges;
  };

  // Função para obter campos da máquina
  const getMachineFields = (machine: Machine) => {
    const fields = [
      {
        label: 'Setor Operacional',
        value: machine.operationalSector,
        icon: <MapPin size={14} className='text-zinc-400' />,
      },
      {
        label: 'Fabricante',
        value: machine.manufacturer,
        icon: <Building size={14} className='text-zinc-400' />,
      },
      {
        label: 'Número de Série',
        value: machine.serialNumber,
        icon: <Gauge size={14} className='text-zinc-400' />,
      },
      {
        label: 'Ano de Fabricação',
        value: machine.yearOfManufacture,
        icon: <Calendar size={14} className='text-zinc-400' />,
      },
      {
        label: 'Ano de Instalação',
        value: machine.yearOfInstallation,
        icon: <Calendar size={14} className='text-zinc-400' />,
      },
      {
        label: 'Performance Máx',
        value: `${machine.maxPerformance} ${machine.speedMeasureTech}`,
        icon: <Zap size={14} className='text-zinc-400' />,
      },
    ];

    return fields;
  };

  // Função para obter ações da máquina
  const getMachineActions = (machine: Machine) => {
    const actions = [
      {
        label: 'Editar',
        icon: <Edit size={14} />,
        onClick: () => navigate(`/p-trace/machines/${machine.id}`),
        variant: 'default' as const,
      },
    ];

    // Adicionar ação de exclusão apenas para máquinas não deletadas
    if (!machine.isDeleted) {
      actions.push({
        label: 'Excluir',
        icon: <Trash2 size={14} />,
        onClick: () => handleDeleteMachine(machine.id),
        variant: 'default',
      });
    }

    return actions;
  };

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <div className='h-full flex flex-col'>
        <div className='px-6'>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold text-zinc-900'>Máquinas</h1>
            <p className='text-zinc-600'>
              Gerenciamento de máquinas industriais
            </p>
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
            <h1 className='text-2xl font-bold text-zinc-900'>Máquinas</h1>
            <p className='text-zinc-600'>
              Gerenciamento de máquinas industriais
            </p>
          </div>
        </div>
        <div className='flex-1 px-6'>
          <div className='text-center py-12'>
            <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
              <h3 className='text-lg font-medium text-red-900 mb-2'>
                Erro ao carregar máquinas
              </h3>
              <p className='text-red-600'>
                Não foi possível carregar a lista de máquinas. Tente novamente.
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
            <h1 className='text-2xl font-bold text-zinc-900'>Máquinas</h1>
            <p className='text-zinc-600'>
              Gerenciamento de máquinas industriais
            </p>
          </div>
          <Link to='/p-trace/machines/new'>
            <Button
              variant='contained'
              colorScheme='primary'
              size='md'
              className='flex items-center gap-2'
            >
              <Plus size={20} />
              Nova máquina
            </Button>
          </Link>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className='flex-1 px-6'>
        {machines.length > 0 ? (
          <>
            {/* Grid de máquinas */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              {machines.map(machine => (
                <DataCard
                  key={machine.id}
                  title={machine.name}
                  subtitle={`Série: ${machine.serialNumber}`}
                  icon={<Factory size={20} />}
                  iconBgColor='bg-blue-50'
                  iconColor='text-blue-600'
                  fields={getMachineFields(machine)}
                  status={getMachineStatus(machine)}
                  badges={getMachineBadges(machine)}
                  actions={getMachineActions(machine)}
                  isDeleted={machine.isDeleted}
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
                  de {pagination.total} máquinas
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
              <Factory size={48} className='mx-auto text-zinc-400 mb-4' />
              <h3 className='text-lg font-medium text-zinc-900 mb-2'>
                Nenhuma máquina encontrada
              </h3>
              <p className='text-zinc-600 mb-6'>
                Comece criando sua primeira máquina para gerenciar equipamentos
                industriais.
              </p>
              <Link to='/p-trace/machines/new'>
                <Button
                  variant='contained'
                  colorScheme='primary'
                  size='md'
                  className='flex items-center gap-2 mx-auto'
                >
                  <Plus size={20} />
                  Criar primeira máquina
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
