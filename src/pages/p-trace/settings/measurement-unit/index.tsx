import React, { useState, useEffect } from 'react';
import {
  Edit,
  Trash2,
  Save,
  X,
  Ruler,
  Tag,
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Button,
  useMeasurementUnits,
  useCreateMeasurementUnit,
  useUpdateMeasurementUnit,
  useDeleteMeasurementUnit,
  useRestoreMeasurementUnit,
  useNotifications,
} from '../../../../components';
import type {
  MeasurementUnit,
  CreateMeasurementUnitRequest,
  UpdateMeasurementUnitRequest,
  ListMeasurementUnitsParams,
} from '../../../../types/measurement-unit';

// Modal de Confirmação
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'success';
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-auto'>
        <div className='flex items-center gap-3 mb-4'>
          {variant === 'danger' ? (
            <div className='w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
              <Trash2 size={16} className='text-red-600 sm:w-5 sm:h-5' />
            </div>
          ) : (
            <div className='w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
              <RotateCcw size={16} className='text-green-600 sm:w-5 sm:h-5' />
            </div>
          )}
          <h3 className='text-base sm:text-lg font-semibold text-zinc-900'>
            {title}
          </h3>
        </div>

        <p className='text-sm sm:text-base text-zinc-600 mb-6'>{message}</p>

        <div className='flex flex-col sm:flex-row gap-3 justify-end'>
          <Button
            variant='outline'
            colorScheme='default'
            size='md'
            onClick={onClose}
            className='w-full sm:w-auto'
          >
            {cancelText}
          </Button>
          <Button
            variant='contained'
            colorScheme={variant === 'danger' ? 'error' : 'primary'}
            size='md'
            onClick={onConfirm}
            className='w-full sm:w-auto'
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MeasurementUnitsPage() {
  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    unitSymbol: '',
  });

  // Estados para filtros e paginação
  const [filters, setFilters] = useState<ListMeasurementUnitsParams>({
    page: 1,
    limit: 10,
    isDeleted: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Estados para modais de confirmação
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    unitId: string | null;
    unitLabel: string;
  }>({
    isOpen: false,
    unitId: null,
    unitLabel: '',
  });
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    unitId: string | null;
    unitLabel: string;
  }>({
    isOpen: false,
    unitId: null,
    unitLabel: '',
  });

  // Hooks para API
  const { data: unitsData, isLoading, error } = useMeasurementUnits(filters);
  const createUnit = useCreateMeasurementUnit();
  const updateUnit = useUpdateMeasurementUnit();
  const deleteUnit = useDeleteMeasurementUnit();
  const restoreUnit = useRestoreMeasurementUnit();

  // Hook para notificações
  const {
    showCreateSuccess,
    showCreateError,
    showUpdateSuccess,
    showUpdateError,
    showDeleteSuccess,
    showDeleteError,
    showRestoreSuccess,
    showRestoreError,
  } = useNotifications();

  const units = unitsData?.data?.measurementUnits || [];
  const pagination = unitsData?.data?.pagination;

  // Aplicar filtros de busca
  useEffect(() => {
    const newFilters: ListMeasurementUnitsParams = {
      page: 1, // Reset para primeira página ao filtrar
      limit: filters.limit,
      isDeleted: showDeleted,
    };

    if (searchTerm.trim()) {
      // Se há termo de busca, usar filtros específicos
      if (searchTerm.includes(':')) {
        const [field, value] = searchTerm.split(':').map(s => s.trim());
        if (field === 'label' || field === 'l') {
          newFilters.label = value;
        } else if (field === 'symbol' || field === 's') {
          newFilters.unitSymbol = value;
        }
      } else {
        // Busca geral em label e symbol
        newFilters.label = searchTerm;
      }
    }

    setFilters(newFilters);
  }, [searchTerm, showDeleted, filters.limit]);

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({ label: '', unitSymbol: '' });
    setEditingUnit(null);
  };

  // Função para salvar unidade (criar ou atualizar)
  const handleSave = async () => {
    if (!formData.label.trim() || !formData.unitSymbol.trim()) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      if (editingUnit) {
        // Atualizar unidade existente
        const updateData: UpdateMeasurementUnitRequest = {
          label: formData.label.trim(),
          unitSymbol: formData.unitSymbol.trim(),
        };
        await updateUnit.mutateAsync({ id: editingUnit.id, data: updateData });
        showUpdateSuccess('Unidade de Medida');
      } else {
        // Criar nova unidade
        const createData: CreateMeasurementUnitRequest = {
          label: formData.label.trim(),
          unitSymbol: formData.unitSymbol.trim(),
        };
        await createUnit.mutateAsync(createData);
        showCreateSuccess('Unidade de Medida');
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar unidade:', error);
      if (editingUnit) {
        showUpdateError('Unidade de Medida', error);
      } else {
        showCreateError('Unidade de Medida', error);
      }
    }
  };

  // Função para editar unidade
  const handleEdit = (unit: MeasurementUnit) => {
    setEditingUnit(unit);
    setFormData({
      label: unit.label,
      unitSymbol: unit.unitSymbol,
    });
  };

  // Função para abrir modal de deleção
  const openDeleteModal = (unit: MeasurementUnit) => {
    setDeleteModal({
      isOpen: true,
      unitId: unit.id,
      unitLabel: unit.label,
    });
  };

  // Função para confirmar deleção
  const confirmDelete = async () => {
    if (deleteModal.unitId) {
      try {
        await deleteUnit.mutateAsync({ id: deleteModal.unitId });
        setDeleteModal({ isOpen: false, unitId: null, unitLabel: '' });
        showDeleteSuccess('Unidade de Medida');
      } catch (error) {
        console.error('Erro ao deletar unidade:', error);
        showDeleteError('Unidade de Medida', error);
      }
    }
  };

  // Função para abrir modal de restauração
  const openRestoreModal = (unit: MeasurementUnit) => {
    setRestoreModal({
      isOpen: true,
      unitId: unit.id,
      unitLabel: unit.label,
    });
  };

  // Função para confirmar restauração
  const confirmRestore = async () => {
    if (restoreModal.unitId) {
      try {
        await restoreUnit.mutateAsync(restoreModal.unitId);
        setRestoreModal({ isOpen: false, unitId: null, unitLabel: '' });
        showRestoreSuccess('Unidade de Medida');
      } catch (error) {
        console.error('Erro ao restaurar unidade:', error);
        showRestoreError('Unidade de Medida', error);
      }
    }
  };

  // Função para mudar página
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Função para mudar limite por página
  const handleLimitChange = (newLimit: number) => {
    setFilters(prev => ({ ...prev, page: 1, limit: newLimit }));
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setShowDeleted(false);
    setFilters({ page: 1, limit: 10, isDeleted: false });
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='px-3 sm:px-6'>
        <div className='mb-4 sm:mb-6'>
          <h1 className='text-xl sm:text-2xl font-bold text-zinc-900'>
            Unidades de Medida
          </h1>
          <p className='text-sm sm:text-base text-zinc-600'>
            Gerenciar unidades de medida do sistema
          </p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className='flex-1 px-3 sm:px-6'>
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8 h-full'>
          {/* Lado esquerdo - Formulário */}
          <div className='bg-white border border-zinc-200 rounded-lg p-4 sm:p-6'>
            <div className='flex items-center gap-2 mb-4 sm:mb-6'>
              <Ruler size={20} className='text-blue-600' />
              <h2 className='text-lg font-semibold text-zinc-900'>
                {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
              </h2>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
              className='space-y-4'
            >
              {/* Campo Label */}
              <div>
                <label
                  htmlFor='label'
                  className='block text-sm font-medium text-zinc-700 mb-2'
                >
                  Rótulo da Unidade *
                </label>
                <input
                  type='text'
                  id='label'
                  value={formData.label}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, label: e.target.value }))
                  }
                  placeholder='Ex: Graus Celsius, Pascal, Volt...'
                  className='w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  maxLength={100}
                />
                <p className='text-xs text-zinc-500 mt-1'>
                  Máximo 100 caracteres ({formData.label.length}/100)
                </p>
              </div>

              {/* Campo Unit Symbol */}
              <div>
                <label
                  htmlFor='unitSymbol'
                  className='block text-sm font-medium text-zinc-700 mb-2'
                >
                  Símbolo da Unidade *
                </label>
                <input
                  type='text'
                  id='unitSymbol'
                  value={formData.unitSymbol}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      unitSymbol: e.target.value,
                    }))
                  }
                  placeholder='Ex: °C, Pa, V...'
                  className='w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  maxLength={20}
                />
                <p className='text-xs text-zinc-500 mt-1'>
                  Máximo 20 caracteres ({formData.unitSymbol.length}/20)
                </p>
              </div>

              {/* Botões */}
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4'>
                <Button
                  type='submit'
                  variant='contained'
                  colorScheme='primary'
                  size='md'
                  className='flex items-center justify-center gap-2'
                  disabled={createUnit.isPending || updateUnit.isPending}
                >
                  <Save size={16} />
                  {editingUnit ? 'Atualizar' : 'Criar'}
                </Button>

                {editingUnit && (
                  <Button
                    type='button'
                    variant='outline'
                    colorScheme='default'
                    size='md'
                    onClick={resetForm}
                    className='flex items-center justify-center gap-2'
                  >
                    <X size={16} />
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Lado direito - Lista */}
          <div className='bg-white border border-zinc-200 rounded-lg p-4 sm:p-6'>
            <div className='flex items-center justify-between mb-4 sm:mb-6'>
              <div className='flex items-center gap-2'>
                <Tag size={20} className='text-green-600' />
                <h2 className='text-lg font-semibold text-zinc-900'>
                  Unidades Cadastradas
                </h2>
                <span className='bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full text-sm'>
                  {pagination?.total || units.length}
                </span>
              </div>
            </div>

            {/* Filtros e Busca */}
            <div className='mb-4 sm:mb-6 space-y-4'>
              {/* Barra de busca */}
              <div className='relative'>
                <Search
                  size={18}
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400'
                />
                <input
                  type='text'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder='Buscar por label ou símbolo...'
                  className='w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base'
                />
              </div>

              {/* Filtros */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4'>
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='showDeleted'
                    checked={showDeleted}
                    onChange={e => setShowDeleted(e.target.checked)}
                    className='rounded border-zinc-300 text-blue-600 focus:ring-blue-500'
                  />
                  <label
                    htmlFor='showDeleted'
                    className='text-sm text-zinc-700 whitespace-nowrap'
                  >
                    Mostrar excluídas
                  </label>
                </div>

                <select
                  value={filters.limit}
                  onChange={e => handleLimitChange(Number(e.target.value))}
                  className='px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto'
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>

                <Button
                  variant='outline'
                  colorScheme='default'
                  size='sm'
                  onClick={clearFilters}
                  className='flex items-center gap-2 w-full sm:w-auto justify-center'
                >
                  <Filter size={16} />
                  Limpar
                </Button>
              </div>
            </div>

            {/* Estado de carregamento */}
            {isLoading && (
              <div className='space-y-3'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='animate-pulse'>
                    <div className='flex items-center justify-between p-3 border border-zinc-200 rounded-lg'>
                      <div className='space-y-2 flex-1 min-w-0'>
                        <div className='h-4 bg-zinc-200 rounded w-32'></div>
                        <div className='h-3 bg-zinc-200 rounded w-16'></div>
                      </div>
                      <div className='flex gap-2 ml-3'>
                        <div className='h-8 w-8 bg-zinc-200 rounded'></div>
                        <div className='h-8 w-8 bg-zinc-200 rounded'></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Estado de erro */}
            {error && (
              <div className='text-center py-8'>
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <p className='text-red-600'>
                    Erro ao carregar unidades de medida. Tente novamente.
                  </p>
                </div>
              </div>
            )}

            {/* Lista de unidades */}
            {!isLoading && !error && (
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {units.length > 0 ? (
                  units.map(unit => (
                    <div
                      key={unit.id}
                      className={`flex items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-zinc-50 transition-colors ${
                        unit.isDeleted
                          ? 'border-red-200 bg-red-50'
                          : 'border-zinc-200'
                      } ${editingUnit?.id === unit.id ? 'ring-2 ring-blue-200 border-blue-300' : ''}`}
                    >
                      <div className='flex-1 min-w-0'>
                        <h3
                          className={`font-medium text-sm sm:text-base ${unit.isDeleted ? 'text-red-700' : 'text-zinc-900'}`}
                        >
                          {unit.label}
                        </h3>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-zinc-600 mt-1 sm:mt-0'>
                          <span className='font-mono bg-zinc-100 px-2 py-1 rounded text-xs sm:text-sm'>
                            {unit.unitSymbol}
                          </span>
                          {unit.isDeleted && (
                            <span className='text-red-600 text-xs'>
                              Excluído
                            </span>
                          )}
                          <span className='text-xs text-zinc-500'>
                            Criado em{' '}
                            {new Date(unit.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-2 ml-3 flex-shrink-0'>
                        {unit.isDeleted ? (
                          <button
                            onClick={() => openRestoreModal(unit)}
                            className='p-2 text-zinc-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors'
                            title='Restaurar'
                            disabled={restoreUnit.isPending}
                          >
                            <RotateCcw size={16} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(unit)}
                              className='p-2 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
                              title='Editar'
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(unit)}
                              className='p-2 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
                              title='Excluir'
                              disabled={deleteUnit.isPending}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8'>
                    <Ruler size={48} className='mx-auto text-zinc-400 mb-4' />
                    <h3 className='text-lg font-medium text-zinc-900 mb-2'>
                      Nenhuma unidade encontrada
                    </h3>
                    <p className='text-zinc-600 text-sm sm:text-base'>
                      {searchTerm || showDeleted
                        ? 'Tente ajustar os filtros de busca.'
                        : 'Crie sua primeira unidade de medida usando o formulário ao lado.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Paginação */}
            {pagination && pagination.pages > 1 && (
              <div className='mt-6 pt-4 border-t border-zinc-200'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                  <div className='text-sm text-zinc-600 text-center sm:text-left'>
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    de {pagination.total} unidades
                  </div>

                  <div className='flex items-center gap-2 w-full sm:w-auto justify-center'>
                    <Button
                      variant='outline'
                      colorScheme='default'
                      size='sm'
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className='flex items-center gap-1'
                    >
                      <ChevronLeft size={16} />
                      <span className='hidden sm:inline'>Anterior</span>
                    </Button>

                    <span className='text-sm text-zinc-600 px-2'>
                      {pagination.page} / {pagination.pages}
                    </span>

                    <Button
                      variant='outline'
                      colorScheme='default'
                      size='sm'
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className='flex items-center gap-1'
                    >
                      <span className='hidden sm:inline'>Próxima</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Deleção */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, unitId: null, unitLabel: '' })
        }
        onConfirm={confirmDelete}
        title='Confirmar Exclusão'
        message={`Tem certeza que deseja excluir a unidade de medida "${deleteModal.unitLabel}"? Esta ação não pode ser desfeita.`}
        confirmText='Excluir'
        cancelText='Cancelar'
        variant='danger'
      />

      {/* Modal de Confirmação de Restauração */}
      <ConfirmationModal
        isOpen={restoreModal.isOpen}
        onClose={() =>
          setRestoreModal({ isOpen: false, unitId: null, unitLabel: '' })
        }
        onConfirm={confirmRestore}
        title='Confirmar Restauração'
        message={`Tem certeza que deseja restaurar a unidade de medida "${restoreModal.unitLabel}"?`}
        confirmText='Restaurar'
        cancelText='Cancelar'
        variant='success'
      />
    </div>
  );
}
