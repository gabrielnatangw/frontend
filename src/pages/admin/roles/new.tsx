import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button, LoadingSpinner, ErrorMessage } from '../../../components';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import Input from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { PermissionGrid } from '../../../components/admin/permissions/PermissionGrid';
import { useCreateRole, useRoles, useNotifications } from '../../../lib';
import { useAppPermissions } from '../../../lib/hooks/use-app-permissions';
import { createRoleSchema } from '../../../lib/schemas/role';
import type { CreateRoleRequest } from '../../../types/role';
import type { Permission } from '../../../types/permission';

export default function NewRolePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotifications();

  // Estado para preview das permissões
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isDuplicated, setIsDuplicated] = useState(false);

  // Buscar dados para duplicação
  const duplicateRoleId = searchParams.get('duplicate');
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useRoles();
  const { data: permissionsData } = useAppPermissions();

  // Dados mockados de permissões como fallback
  const mockPermissions = {
    data: [
      {
        id: 'perm-1',
        name: 'Visualizar Dashboard',
        description: 'Permite visualizar o dashboard principal',
        module: 'Dashboard',
        action: 'read',
        resource: 'dashboard',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'perm-2',
        name: 'Gerenciar Usuários',
        description: 'Permite criar, editar e excluir usuários',
        module: 'Usuários',
        action: 'manage',
        resource: 'users',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'perm-3',
        name: 'Gerenciar Roles',
        description: 'Permite criar, editar e excluir roles',
        module: 'Roles',
        action: 'manage',
        resource: 'roles',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'perm-4',
        name: 'Visualizar Relatórios',
        description: 'Permite visualizar relatórios do sistema',
        module: 'Relatórios',
        action: 'read',
        resource: 'reports',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'perm-5',
        name: 'Configurar Sistema',
        description: 'Permite alterar configurações do sistema',
        module: 'Configurações',
        action: 'manage',
        resource: 'settings',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
  };

  // Usar dados reais se disponíveis, senão usar mock

  // A API retorna data como array direto, não data.permissions
  // Mapear dados da API para o formato esperado pelo componente
  const rawPermissions =
    (permissionsData as any)?.data || mockPermissions.data || [];
  const permissions = Array.isArray(rawPermissions)
    ? rawPermissions.map(perm => ({
        ...perm,
        id: perm.permissionId || perm.id, // Usar permissionId como id
        name: perm.displayName || perm.name, // Usar displayName como name
        action: perm.action || 'manage', // Adicionar action padrão se não existir
        isActive: perm.isActive !== undefined ? perm.isActive : true, // Garantir isActive
        module: perm.module?.replace(/_/g, ' ') || perm.module, // Trocar underscore por espaço
      }))
    : [];

  // Remover debug logs

  const createRole = useCreateRole();

  // Formulário - sempre declarado antes dos early returns
  const form = useForm<CreateRoleRequest>({
    resolver: zodResolver(createRoleSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
  });

  const { setValue, watch } = form;
  const watchedName = watch('name');
  const watchedDescription = watch('description');

  // Carregar dados do role para duplicação - sempre declarado antes dos early returns
  useEffect(() => {
    if (duplicateRoleId && rolesData?.data?.roles && !isDuplicated) {
      const roleToDuplicate = rolesData.data.roles.find(
        r => r.id === duplicateRoleId
      );
      if (roleToDuplicate) {
        const permissionIds = roleToDuplicate.permissions?.map(p => p.id) || [];

        setValue('name', `${roleToDuplicate.name} (Cópia)`);
        setValue('description', roleToDuplicate.description || '');
        setValue('permissionIds', permissionIds);
        setSelectedPermissions(permissionIds);
        setIsDuplicated(true);
      }
    }
  }, [duplicateRoleId, rolesData?.data?.roles, setValue, isDuplicated]);

  // Loading state - apenas se roles estiver carregando (permissões têm fallback)
  if (rolesLoading) {
    return <LoadingSpinner text='Carregando dados...' />;
  }

  // Error state - apenas se roles falhar (permissões têm fallback)
  if (rolesError) {
    return (
      <div className='min-h-screen bg-transparent'>
        <div className='mx-8 py-8'>
          <ErrorMessage
            error={rolesError}
            onRetry={() => window.location.reload()}
            onGoHome={() => navigate('/admin/roles')}
            title='Erro ao carregar dados'
            description='Não foi possível carregar os dados necessários para criar o role.'
          />
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  // Função para submeter formulário
  const onSubmit = async (data: CreateRoleRequest) => {
    try {
      await createRole.mutateAsync(data);
      showSuccess('Role criado com sucesso');
      navigate('/admin/roles');
    } catch (error) {
      showError('Erro ao criar role');
      console.error('Erro ao criar role:', error);
    }
  };

  // Função para alternar permissão
  const handlePermissionToggle = (permissionId: string) => {
    const newSelected = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter(id => id !== permissionId)
      : [...selectedPermissions, permissionId];

    setSelectedPermissions(newSelected);
    setValue('permissionIds', newSelected);
  };

  // Função para selecionar todas as permissões de um módulo
  const handleSelectAllModule = (module: string) => {
    const modulePermissions =
      permissions?.filter(p => p.module === module)?.map(p => p.id) || [];

    const newSelected = [
      ...new Set([...selectedPermissions, ...modulePermissions]),
    ];
    setSelectedPermissions(newSelected);
    setValue('permissionIds', newSelected);
  };

  // Função para deselecionar todas as permissões de um módulo
  const handleDeselectAllModule = (module: string) => {
    const modulePermissions =
      permissions?.filter(p => p.module === module)?.map(p => p.id) || [];

    const newSelected = selectedPermissions.filter(
      id => !modulePermissions.includes(id)
    );
    setSelectedPermissions(newSelected);
    setValue('permissionIds', newSelected);
  };

  // Função para selecionar todas as permissões
  const handleSelectAll = () => {
    const allPermissions = permissions?.map(p => p.id) || [];
    setSelectedPermissions(allPermissions);
    setValue('permissionIds', allPermissions);
  };

  // Função para deselecionar todas as permissões
  const handleDeselectAll = () => {
    setSelectedPermissions([]);
    setValue('permissionIds', []);
  };

  // Obter permissões selecionadas para preview
  const selectedPermissionsData =
    permissions?.filter(p => selectedPermissions.includes(p.id)) || [];

  // Agrupar permissões por módulo para preview
  const permissionsByModule = selectedPermissionsData.reduce(
    (acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <div className='min-h-screen bg-transparent'>
      {/* Header com gradiente moderno */}
      <div className='relative overflow-hidden rounded-lg mx-8 mt-2'>
        <div className='absolute inset-0 bg-blue-100/80'></div>
        <div className='relative px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate('/admin/roles')}
                className='text-slate-700 hover:text-slate-900 hover:bg-white/60 mb-2'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Voltar
              </Button>
              <h1 className='text-2xl font-semibold text-slate-800'>
                {duplicateRoleId ? 'Duplicar Role' : 'Novo Role'}
              </h1>
              <p className='text-sm text-slate-600'>
                {duplicateRoleId
                  ? 'Crie uma cópia de um role existente'
                  : 'Crie um novo role com permissões específicas'}
              </p>
            </div>
            <div className='hidden lg:block'>
              <div className='w-32 h-32 bg-white/40 rounded-full backdrop-blur-sm flex items-center justify-center'>
                <Shield className='w-16 h-16 text-slate-700' />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className='mx-8 py-2 space-y-4'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {/* Formulário Principal */}
            <div className='lg:col-span-2 space-y-4'>
              {/* Informações Básicas */}
              <Card className='shadow-lg border border-zinc-200'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-3 text-xl'>
                    <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg'>
                      <Shield className='w-5 h-5 text-white' />
                    </div>
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <Label htmlFor='name'>Nome do Role *</Label>
                    <Input
                      id='name'
                      {...register('name')}
                      placeholder='Ex: Administrador, Operador, Visualizador'
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className='text-sm text-red-600 mt-1'>
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor='description'>Descrição</Label>
                    <Textarea
                      id='description'
                      {...register('description')}
                      placeholder='Descreva o propósito e responsabilidades deste role'
                      rows={3}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className='text-sm text-red-600 mt-1'>
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Gerenciamento de Permissões */}
              <Card className='shadow-lg border border-zinc-200'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='flex items-center gap-3 text-xl'>
                      <div className='p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg'>
                        <Shield className='w-5 h-5 text-white' />
                      </div>
                      Permissões
                    </CardTitle>
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setShowPreview(!showPreview)}
                        className='bg-white/60 text-slate-700 border-slate-300 hover:bg-white/80 backdrop-blur-sm'
                      >
                        {showPreview ? (
                          <EyeOff className='w-4 h-4 mr-2' />
                        ) : (
                          <Eye className='w-4 h-4 mr-2' />
                        )}
                        {showPreview ? 'Ocultar' : 'Visualizar'} Preview
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <PermissionGrid
                    permissions={permissions}
                    selectedPermissions={selectedPermissions}
                    onPermissionToggle={handlePermissionToggle}
                    onSelectAll={handleSelectAllModule}
                    onDeselectAll={handleDeselectAllModule}
                    onSelectAllModules={handleSelectAll}
                    onDeselectAllModules={handleDeselectAll}
                    showFilters={true}
                    showSearch={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar com Preview e Ações */}
            <div className='space-y-4'>
              {/* Preview do Role */}
              <Card className='shadow-lg border border-zinc-200'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-3 text-xl'>
                    <div className='p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg'>
                      <Eye className='w-5 h-5 text-white' />
                    </div>
                    Preview do Role
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <Label className='text-sm font-medium text-zinc-600'>
                      Nome
                    </Label>
                    <p className='text-lg font-semibold text-zinc-900'>
                      {watchedName || 'Nome do role'}
                    </p>
                  </div>

                  <div>
                    <Label className='text-sm font-medium text-zinc-600'>
                      Descrição
                    </Label>
                    <p className='text-sm text-zinc-700'>
                      {watchedDescription || 'Descrição do role'}
                    </p>
                  </div>

                  <div>
                    <Label className='text-sm font-medium text-zinc-600'>
                      Permissões Selecionadas
                    </Label>
                    <div className='flex items-center gap-2'>
                      <Shield className='w-4 h-4 text-zinc-400' />
                      <span className='text-sm font-medium text-zinc-900'>
                        {selectedPermissions.length} permissões
                      </span>
                    </div>
                  </div>

                  {selectedPermissions.length > 0 && (
                    <div>
                      <Label className='text-sm font-medium text-zinc-600'>
                        Módulos
                      </Label>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {Object.keys(permissionsByModule).map(module => (
                          <Badge key={module} variant='secondary'>
                            {module}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview das Permissões */}
              {showPreview && selectedPermissions.length > 0 && (
                <Card className='shadow-lg border border-zinc-200'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-3 text-lg'>
                      <div className='p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg'>
                        <CheckCircle2 className='w-4 h-4 text-white' />
                      </div>
                      Permissões Selecionadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3 max-h-64 overflow-y-auto'>
                      {Object.entries(permissionsByModule).map(
                        ([module, permissions]) => (
                          <div key={module}>
                            <h4 className='text-sm font-medium text-zinc-900 mb-2'>
                              {module}
                            </h4>
                            <div className='space-y-1'>
                              {Array.isArray(permissions) &&
                                permissions.map(permission => (
                                  <div
                                    key={permission.id}
                                    className='flex items-center gap-2 text-xs'
                                  >
                                    <CheckCircle2 className='w-3 h-3 text-green-600' />
                                    <span className='text-zinc-700'>
                                      {permission.name}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ações */}
              <Card className='shadow-lg border border-zinc-200'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-3 text-xl'>
                    <div className='p-2 bg-gradient-to-br from-slate-500 to-slate-700 rounded-lg'>
                      <Save className='w-5 h-5 text-white' />
                    </div>
                    Ações
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Button
                    type='submit'
                    className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    disabled={
                      createRole.isPending || selectedPermissions.length === 0
                    }
                  >
                    {createRole.isPending ? (
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    ) : (
                      <Save className='w-4 h-4 mr-2' />
                    )}
                    {createRole.isPending ? 'Criando...' : 'Criar Role'}
                  </Button>

                  <Button
                    type='button'
                    variant='outline'
                    className='w-full border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                    onClick={() => navigate('/admin/roles')}
                  >
                    Cancelar
                  </Button>
                </CardContent>

                {selectedPermissions.length === 0 && (
                  <div className='mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                    <div className='flex items-center gap-2'>
                      <AlertCircle className='w-4 h-4 text-yellow-600' />
                      <p className='text-sm text-yellow-800'>
                        Selecione pelo menos uma permissão
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
