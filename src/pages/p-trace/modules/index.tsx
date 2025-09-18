import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit,
  Package,
  MapPin,
  Building,
  Globe,
} from 'lucide-react';
import {
  Button,
  DataCard,
  useModules,
  useDeleteModule,
} from '../../../components';
import type { Module } from '../../../types/module';

export default function ModulesPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // 4 cards por linha × 3 linhas

  // Buscar módulos com paginação
  const {
    data: modulesData,
    isLoading,
    error,
  } = useModules({
    page: currentPage,
    limit: pageSize,
  });

  const deleteModule = useDeleteModule();

  // Extrair dados da API
  const modules = modulesData?.data?.modules || [];
  const pagination = modulesData?.data?.pagination;

  // Função para deletar módulo
  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Tem certeza que deseja excluir este módulo?')) {
      try {
        await deleteModule.mutateAsync(moduleId);
      } catch (error) {
        console.error('Erro ao deletar módulo:', error);
      }
    }
  };

  // Função para obter status do módulo
  const getModuleStatus = (module: Module) => {
    if (module.isDeleted) {
      return { label: 'Excluído', variant: 'error' as const };
    }
    return { label: 'Ativo', variant: 'success' as const };
  };

  // Função para obter badges do módulo
  const getModuleBadges = (module: Module) => {
    const badges = [];

    if (module.sector) {
      badges.push({ label: module.sector, variant: 'info' as const });
    }

    if (module.customer) {
      badges.push({ label: module.customer, variant: 'default' as const });
    }

    return badges;
  };

  // Função para obter campos do módulo
  const getModuleFields = (module: Module) => {
    return [
      {
        label: 'Cliente',
        value: module.customer,
        icon: <Building size={14} className='text-zinc-400' />,
      },
      {
        label: 'País',
        value: module.country,
        icon: <Globe size={14} className='text-zinc-400' />,
      },
      {
        label: 'Cidade',
        value: module.city,
        icon: <MapPin size={14} className='text-zinc-400' />,
      },
      {
        label: 'Máquina',
        value: module.machineName || 'Não atribuído',
        icon: <Package size={14} className='text-zinc-400' />,
      },
    ];
  };

  // Função para obter ações do módulo
  const getModuleActions = (module: Module) => {
    const actions = [
      {
        label: 'Editar',
        icon: <Edit size={14} />,
        onClick: () => navigate(`/p-trace/modules/${module.id}`),
        variant: 'default' as const,
      },
    ];

    if (!module.isDeleted) {
      actions.push({
        label: 'Excluir',
        icon: <Trash2 size={14} />,
        onClick: () => handleDeleteModule(module.id),
        variant: 'default' as const,
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
            <h1 className='text-2xl font-bold text-zinc-900'>Módulos</h1>
            <p className='text-zinc-600'>Gerenciamento de módulos</p>
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
            <h1 className='text-2xl font-bold text-zinc-900'>Módulos</h1>
            <p className='text-zinc-600'>Gerenciamento de módulos</p>
          </div>
        </div>
        <div className='flex-1 px-6'>
          <div className='text-center py-12'>
            <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
              <h3 className='text-lg font-medium text-red-900 mb-2'>
                Erro ao carregar módulos
              </h3>
              <p className='text-red-600'>
                Não foi possível carregar a lista de módulos. Tente novamente.
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
            <h1 className='text-2xl font-bold text-zinc-900'>Módulos</h1>
            <p className='text-zinc-600'>Gerenciamento de módulos</p>
          </div>
          <Link to='/p-trace/modules/new'>
            <Button
              variant='contained'
              colorScheme='primary'
              size='md'
              className='flex items-center gap-2'
            >
              <Plus size={20} />
              Novo módulo
            </Button>
          </Link>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className='flex-1 px-6'>
        {modules.length > 0 ? (
          <>
            {/* Grid de módulos */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              {modules.map(module => (
                <DataCard
                  key={module.id}
                  title={module.customer}
                  subtitle={`ID: ${module.id.slice(0, 8)}...`}
                  icon={<Package size={20} />}
                  iconBgColor='bg-blue-50'
                  iconColor='text-blue-600'
                  fields={getModuleFields(module)}
                  status={getModuleStatus(module)}
                  badges={getModuleBadges(module)}
                  actions={getModuleActions(module)}
                  isDeleted={module.isDeleted}
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
                  de {pagination.total} módulos
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
              <Package size={48} className='mx-auto text-zinc-400 mb-4' />
              <h3 className='text-lg font-medium text-zinc-900 mb-2'>
                Nenhum módulo encontrado
              </h3>
              <p className='text-zinc-600 mb-6'>
                Comece criando seu primeiro módulo para gerenciar componentes.
              </p>
              <Link to='/p-trace/modules/new'>
                <Button
                  variant='contained'
                  colorScheme='primary'
                  size='md'
                  className='flex items-center gap-2 mx-auto'
                >
                  <Plus size={20} />
                  Criar primeiro módulo
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
