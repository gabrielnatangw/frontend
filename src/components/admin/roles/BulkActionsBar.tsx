import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Copy,
  Download,
  X,
  Loader2,
} from 'lucide-react';
import { useBulkRoleOperations } from '@/lib/hooks/use-bulk-role-operations';

interface BulkActionsBarProps {
  selectedRoles: string[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  totalRoles: number;
  isAllSelected: boolean;
}

export function BulkActionsBar({
  selectedRoles,
  onClearSelection,
  onSelectAll,
  totalRoles,
  isAllSelected,
}: BulkActionsBarProps) {
  const {
    activateRoles,
    deactivateRoles,
    deleteRoles,
    duplicateRoles,
    exportSelectedRoles,
  } = useBulkRoleOperations();

  const selectedCount = selectedRoles.length;
  const isAnySelected = selectedCount > 0;

  if (!isAnySelected) return null;

  return (
    <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'>
      <div className='bg-white border border-zinc-200 rounded-xl shadow-xl p-4 backdrop-blur-sm'>
        <div className='flex items-center gap-4'>
          {/* Informações de seleção */}
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
              {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
            </Badge>
            {!isAllSelected && (
              <Button
                variant='outline'
                size='sm'
                onClick={onSelectAll}
                className='text-xs'
              >
                Selecionar todos ({totalRoles})
              </Button>
            )}
          </div>

          {/* Ações em lote */}
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => activateRoles.mutate(selectedRoles)}
              disabled={activateRoles.isPending}
              className='hover:bg-green-50 hover:text-green-600 border-green-200'
            >
              {activateRoles.isPending ? (
                <Loader2 className='w-4 h-4 mr-1 animate-spin' />
              ) : (
                <CheckCircle className='w-4 h-4 mr-1' />
              )}
              Ativar
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => deactivateRoles.mutate(selectedRoles)}
              disabled={deactivateRoles.isPending}
              className='hover:bg-red-50 hover:text-red-600 border-red-200'
            >
              {deactivateRoles.isPending ? (
                <Loader2 className='w-4 h-4 mr-1 animate-spin' />
              ) : (
                <XCircle className='w-4 h-4 mr-1' />
              )}
              Desativar
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => duplicateRoles.mutate(selectedRoles)}
              disabled={duplicateRoles.isPending}
              className='hover:bg-blue-50 hover:text-blue-600 border-blue-200'
            >
              {duplicateRoles.isPending ? (
                <Loader2 className='w-4 h-4 mr-1 animate-spin' />
              ) : (
                <Copy className='w-4 h-4 mr-1' />
              )}
              Duplicar
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                exportSelectedRoles.mutate({ roleIds: selectedRoles })
              }
              disabled={exportSelectedRoles.isPending}
              className='hover:bg-purple-50 hover:text-purple-600 border-purple-200'
            >
              {exportSelectedRoles.isPending ? (
                <Loader2 className='w-4 h-4 mr-1 animate-spin' />
              ) : (
                <Download className='w-4 h-4 mr-1' />
              )}
              Exportar
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => deleteRoles.mutate(selectedRoles)}
              disabled={deleteRoles.isPending}
              className='hover:bg-red-50 hover:text-red-600 border-red-200'
            >
              {deleteRoles.isPending ? (
                <Loader2 className='w-4 h-4 mr-1 animate-spin' />
              ) : (
                <Trash2 className='w-4 h-4 mr-1' />
              )}
              Deletar
            </Button>
          </div>

          {/* Botão para limpar seleção */}
          <Button
            variant='outline'
            size='sm'
            onClick={onClearSelection}
            className='hover:bg-zinc-100'
          >
            <X className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BulkActionsBar;
