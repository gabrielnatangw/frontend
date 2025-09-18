import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import Input from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { Search, Shield, CheckCircle2, XCircle, Settings } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import type { Permission } from '../../../types/permission';

interface PermissionGridProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
  onSelectAll: (module: string) => void;
  onDeselectAll: (module: string) => void;
  onSelectAllModules: () => void;
  onDeselectAllModules: () => void;
  className?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  readOnly?: boolean;
}

export function PermissionGrid({
  permissions,
  selectedPermissions,
  onPermissionToggle,
  onSelectAll,
  onDeselectAll,
  onSelectAllModules,
  onDeselectAllModules,
  className = '',
  showFilters = true,
  showSearch = true,
  readOnly = false,
}: PermissionGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);

  // Agrupar permissões por módulo
  const permissionsByModule = useMemo(() => {
    const filtered = permissions.filter(permission => {
      const matchesSearch =
        !searchTerm ||
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule =
        selectedModule === 'all' || permission.module === selectedModule;
      const matchesAction =
        selectedAction === 'all' || permission.action === selectedAction;
      const matchesStatus = showInactive || permission.isActive;

      return matchesSearch && matchesModule && matchesAction && matchesStatus;
    });

    return filtered.reduce(
      (acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  }, [permissions, searchTerm, selectedModule, selectedAction, showInactive]);

  // Obter módulos únicos
  const modules = useMemo(() => {
    return Array.from(new Set(permissions.map(p => p.module))).sort();
  }, [permissions]);

  // Obter ações únicas
  const actions = useMemo(() => {
    return Array.from(new Set(permissions.map(p => p.action))).sort();
  }, [permissions]);

  // Contar permissões selecionadas por módulo
  const getModuleSelectionCount = (module: string) => {
    const modulePermissions = permissionsByModule[module] || [];
    return modulePermissions.filter(p => selectedPermissions.includes(p.id))
      .length;
  };

  // Verificar se módulo está totalmente selecionado
  const isModuleFullySelected = (module: string) => {
    const modulePermissions = permissionsByModule[module] || [];
    return (
      modulePermissions.length > 0 &&
      modulePermissions.every(p => selectedPermissions.includes(p.id))
    );
  };

  // Verificar se módulo está parcialmente selecionado
  const isModulePartiallySelected = (module: string) => {
    const modulePermissions = permissionsByModule[module] || [];
    const selectedCount = getModuleSelectionCount(module);
    return selectedCount > 0 && selectedCount < modulePermissions.length;
  };

  const handleModuleSelectAll = (module: string) => {
    const modulePermissions = permissionsByModule[module] || [];
    const allSelected = modulePermissions.every(p =>
      selectedPermissions.includes(p.id)
    );

    if (allSelected) {
      onDeselectAll(module);
    } else {
      onSelectAll(module);
    }
  };

  const totalSelected = selectedPermissions.length;
  const totalPermissions = permissions.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com controles */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Shield className='w-5 h-5 text-primary' />
          <h3 className='text-lg font-semibold'>Gerenciar Permissões</h3>
          <Badge variant='outline' className='ml-2'>
            {totalSelected} de {totalPermissions} selecionadas
          </Badge>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onSelectAllModules}
            disabled={readOnly}
          >
            <CheckCircle2 className='w-4 h-4 mr-1' />
            Selecionar Todas
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={onDeselectAllModules}
            disabled={readOnly}
          >
            <XCircle className='w-4 h-4 mr-1' />
            Desmarcar Todas
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {showSearch && (
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                placeholder='Buscar permissões...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          )}

          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger>
              <SelectValue placeholder='Filtrar por módulo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos os módulos</SelectItem>
              {modules.map(module => (
                <SelectItem key={module} value={module}>
                  {module}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger>
              <SelectValue placeholder='Filtrar por ação' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas as ações</SelectItem>
              {actions.map(action => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='flex items-center gap-2'>
            <Checkbox
              id='show-inactive'
              checked={showInactive}
              onCheckedChange={checked => setShowInactive(checked === true)}
            />
            <label htmlFor='show-inactive' className='text-sm text-gray-600'>
              Mostrar inativas
            </label>
          </div>
        </div>
      )}

      {/* Grid de permissões por módulo */}
      <div className='space-y-6'>
        {Object.entries(permissionsByModule).map(
          ([module, modulePermissions]) => {
            const permissions = modulePermissions as Permission[];
            return (
              <Card key={module} className='overflow-hidden'>
                <CardHeader className='pb-3 bg-gray-50'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <Settings className='w-5 h-5 text-gray-600' />
                      <CardTitle className='text-base font-medium text-gray-900'>
                        {module}
                      </CardTitle>
                      <Badge variant='outline' className='text-xs'>
                        {permissions.length} permissões
                      </Badge>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Badge
                        variant={
                          isModuleFullySelected(module)
                            ? 'default'
                            : isModulePartiallySelected(module)
                              ? 'secondary'
                              : 'outline'
                        }
                        className='text-xs'
                      >
                        {getModuleSelectionCount(module)} selecionadas
                      </Badge>

                      {!readOnly && (
                        <Button
                          variant='text'
                          size='sm'
                          onClick={() => handleModuleSelectAll(module)}
                          className='h-8 px-2'
                        >
                          {isModuleFullySelected(module) ? (
                            <>
                              <XCircle className='w-4 h-4 mr-1' />
                              Desmarcar
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className='w-4 h-4 mr-1' />
                              Selecionar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='pt-4'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                    {permissions.map(permission => (
                      <div
                        key={permission.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          selectedPermissions.includes(permission.id)
                            ? 'bg-primary/5 border-primary/20'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {!readOnly && (
                          <Checkbox
                            checked={selectedPermissions.includes(
                              permission.id
                            )}
                            onCheckedChange={() =>
                              onPermissionToggle(permission.id)
                            }
                            className='mt-0.5'
                          />
                        )}

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='font-medium text-sm text-gray-900 truncate'>
                              {permission.name}
                            </span>
                            {!permission.isActive && (
                              <Badge variant='secondary' className='text-xs'>
                                Inativa
                              </Badge>
                            )}
                          </div>

                          <p className='text-xs text-gray-600 mb-2 line-clamp-2'>
                            {permission.description}
                          </p>

                          <div className='flex items-center gap-2 text-xs text-gray-500'>
                            <Badge variant='outline' className='text-xs'>
                              {permission.action}
                            </Badge>
                            <span>•</span>
                            <span>{permission.resource}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      {/* Resumo */}
      {totalSelected > 0 && (
        <Card className='bg-primary/5 border-primary/20'>
          <CardContent className='pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <CheckCircle2 className='w-5 h-5 text-primary' />
                <span className='font-medium text-primary'>
                  {totalSelected} permissões selecionadas
                </span>
              </div>
              <div className='text-sm text-gray-600'>
                {Math.round((totalSelected / totalPermissions) * 100)}% do total
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PermissionGrid;
