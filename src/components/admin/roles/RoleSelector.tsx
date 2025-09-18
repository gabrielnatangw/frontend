import React, { useState, useMemo } from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { ChevronDown, Shield, Users, X, CheckCircle2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import type { Role } from '../../../types/role';

interface RoleSelectorProps {
  roles: Role[];
  selectedRoles: string[];
  onRoleToggle: (roleId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRemoveRole: (roleId: string) => void;
  placeholder?: string;
  maxDisplay?: number;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  showSearch?: boolean;
  showStats?: boolean;
}

export function RoleSelector({
  roles,
  selectedRoles,
  onRoleToggle,
  onSelectAll,
  onDeselectAll,
  onRemoveRole,
  placeholder = 'Selecionar roles...',
  maxDisplay = 3,
  className = '',
  disabled = false,
  multiple = true,
  showSearch = true,
  showStats = true,
}: RoleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar roles baseado na busca
  const filteredRoles = useMemo(() => {
    if (!searchTerm) return roles;

    return roles.filter(
      role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  // Obter roles selecionados
  const selectedRolesData = useMemo(() => {
    return roles.filter(role => selectedRoles.includes(role.id));
  }, [roles, selectedRoles]);

  // Obter roles ativos
  const activeRoles = useMemo(() => {
    return roles.filter(role => role.isActive);
  }, [roles]);

  // Obter roles do sistema
  const systemRoles = useMemo(() => {
    return roles.filter(role => role.isSystem);
  }, [roles]);

  const handleRoleToggle = (roleId: string) => {
    onRoleToggle(roleId);
    if (!multiple) {
      setOpen(false);
    }
  };

  const handleSelectAll = () => {
    onSelectAll();
  };

  const handleDeselectAll = () => {
    onDeselectAll();
  };

  const isAllSelected =
    roles.length > 0 && selectedRoles.length === roles.length;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Seletor principal */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full justify-between h-auto min-h-[40px] p-2'
            disabled={disabled}
          >
            <div className='flex items-center gap-2 flex-wrap'>
              {selectedRolesData.length === 0 ? (
                <span className='text-gray-500'>{placeholder}</span>
              ) : (
                <div className='flex items-center gap-1 flex-wrap'>
                  {selectedRolesData.slice(0, maxDisplay).map(role => (
                    <Badge
                      key={role.id}
                      variant='secondary'
                      className='flex items-center gap-1 pr-1'
                    >
                      <Shield className='w-3 h-3' />
                      {role.name}
                      {!disabled && (
                        <Button
                          variant='text'
                          size='sm'
                          className='h-4 w-4 p-0 hover:bg-transparent'
                          onClick={e => {
                            e.stopPropagation();
                            onRemoveRole(role.id);
                          }}
                        >
                          <X className='w-3 h-3' />
                        </Button>
                      )}
                    </Badge>
                  ))}
                  {selectedRolesData.length > maxDisplay && (
                    <Badge variant='outline' className='text-xs'>
                      +{selectedRolesData.length - maxDisplay} mais
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>

        <PopoverContent className='w-full p-0' align='start'>
          <Command>
            {showSearch && (
              <CommandInput
                placeholder='Buscar roles...'
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
            )}
            <CommandList>
              <CommandEmpty>Nenhum role encontrado.</CommandEmpty>

              {/* Controles de seleção */}
              {multiple && roles.length > 0 && (
                <CommandGroup heading='Ações'>
                  <CommandItem
                    onSelect={
                      isAllSelected ? handleDeselectAll : handleSelectAll
                    }
                  >
                    <CheckCircle2 className='w-4 h-4 mr-2' />
                    {isAllSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                  </CommandItem>
                </CommandGroup>
              )}

              {/* Lista de roles */}
              <CommandGroup heading='Roles Disponíveis'>
                {filteredRoles.map(role => (
                  <CommandItem
                    key={role.id}
                    onSelect={() => handleRoleToggle(role.id)}
                    className='flex items-center gap-3 p-3'
                  >
                    <Checkbox
                      checked={selectedRoles.includes(role.id)}
                      className='pointer-events-none'
                    />

                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                      <Shield className='w-4 h-4 text-gray-500 flex-shrink-0' />
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-sm truncate'>
                            {role.name}
                          </span>
                          {role.isSystem && (
                            <Badge variant='outline' className='text-xs'>
                              Sistema
                            </Badge>
                          )}
                          {!role.isActive && (
                            <Badge variant='secondary' className='text-xs'>
                              Inativo
                            </Badge>
                          )}
                        </div>
                        {role.description && (
                          <p className='text-xs text-gray-500 truncate mt-1'>
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {showStats && (
                      <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <div className='flex items-center gap-1'>
                          <Users className='w-3 h-3' />
                          {role.userCount || 0}
                        </div>
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Resumo das seleções */}
      {selectedRolesData.length > 0 && (
        <div className='flex items-center justify-between text-sm text-gray-600'>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='w-4 h-4 text-primary' />
            <span>
              {selectedRolesData.length} role
              {selectedRolesData.length !== 1 ? 's' : ''} selecionado
              {selectedRolesData.length !== 1 ? 's' : ''}
            </span>
          </div>

          {multiple && selectedRolesData.length > 0 && (
            <Button
              variant='text'
              size='sm'
              onClick={handleDeselectAll}
              className='h-6 px-2 text-xs'
            >
              Limpar seleção
            </Button>
          )}
        </div>
      )}

      {/* Estatísticas */}
      {showStats && (
        <div className='grid grid-cols-3 gap-2 text-xs text-gray-500'>
          <div className='text-center'>
            <div className='font-medium'>{roles.length}</div>
            <div>Total</div>
          </div>
          <div className='text-center'>
            <div className='font-medium'>{activeRoles.length}</div>
            <div>Ativos</div>
          </div>
          <div className='text-center'>
            <div className='font-medium'>{systemRoles.length}</div>
            <div>Sistema</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleSelector;
