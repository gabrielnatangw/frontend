import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Trash2,
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
import { Switch } from '../../../components/ui/switch';
import { PermissionGrid } from '../../../components/admin/permissions/PermissionGrid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import {
  useRole,
  useUpdateRole,
  useDeleteRole,
  useNotifications,
} from '../../../lib';
import { useAppPermissions } from '../../../lib/hooks/use-app-permissions';
import { updateRoleSchema } from '../../../lib/schemas/role';
import type { UpdateRoleRequest } from '../../../types/role';
import type { Permission } from '../../../types/permission';

export default function EditRolePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useNotifications();

  // Estado para preview das permissões
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Buscar dados
  const {
    data: roleData,
    isLoading: roleLoading,
    error: roleError,
    refetch: refetchRole,
  } = useRole(id || '');
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = useAppPermissions();

  // Dados mockados de permissões como fallback
  const mockPermissions = {
    data: [
      {
        id: '1',
        name: 'FULL_ACCESS',
        displayName: 'Full System Access',
        description: 'Complete access to all system features and data',
        module: 'SYSTEM',
        action: 'manage',
        isActive: true,
      },
      {
        id: '2',
        name: 'USER_MANAGEMENT',
        displayName: 'User Management',
        description: 'Manage users and their roles',
        module: 'USER_MANAGEMENT',
        action: 'manage',
        isActive: true,
      },
      {
        id: '3',
        name: 'ROLE_MANAGEMENT',
        displayName: 'Role Management',
        description: 'Manage roles and permissions',
        module: 'ROLE_MANAGEMENT',
        action: 'manage',
        isActive: true,
      },
      {
        id: '4',
        name: 'SENSOR_READ',
        displayName: 'Sensor Read',
        description: 'Read sensor data',
        module: 'SENSOR_MANAGEMENT',
        action: 'read',
        isActive: true,
      },
      {
        id: '5',
        name: 'SENSOR_WRITE',
        displayName: 'Sensor Write',
        description: 'Write sensor data',
        module: 'SENSOR_MANAGEMENT',
        action: 'write',
        isActive: true,
      },
    ],
  };

  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  // Formulário - sempre declarado antes dos early returns
  const form = useForm<UpdateRoleRequest>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissionIds: [],
      isActive: true,
    },
  });

  const { setValue, watch } = form;
  const watchedName = watch('name');
  const watchedDescription = watch('description');
  const watchedIsActive = watch('isActive');

  // Carregar dados do role - sempre declarado antes dos early returns
  useEffect(() => {
    if (roleData?.data) {
      const role = roleData.data;
      setValue('name', role.name);
      setValue('description', role.description || '');
      setValue('permissionIds', role.permissions?.map(p => p.id) || []);
      setValue('isActive', role.isActive);
      setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    }
  }, [roleData?.data, setValue]);

  // Loading state
  if (roleLoading || permissionsLoading) {
    return <LoadingSpinner text='Carregando role...' />;
  }

  // Error state
  if (roleError || permissionsError) {
    return (
      <div className='min-h-screen bg-transparent'>
        <div className='mx-8 py-8'>
          <ErrorMessage
            error={roleError || permissionsError}
            onRetry={() => {
              refetchRole();
              refetchPermissions();
            }}
            onGoHome={() => navigate('/admin/roles')}
            title='Erro ao carregar role'
            description='Não foi possível carregar os dados do role. Verifique se o ID é válido.'
          />
        </div>
      </div>
    );
  }

  const role = roleData?.data;

  // Se não há dados do role, mostrar erro
  if (!role) {
    return (
      <div className='min-h-screen bg-transparent'>
        <div className='mx-8 py-8'>
          <ErrorMessage
            error={new Error('Role não encontrado')}
            onRetry={() => refetchRole()}
            onGoHome={() => navigate('/admin/roles')}
            title='Role não encontrado'
            description='O role solicitado não foi encontrado ou não existe.'
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
  const onSubmit = async (data: UpdateRoleRequest) => {
    if (!id) return;

    try {
      await updateRole.mutateAsync({ id, data });
      showSuccess('Role atualizado com sucesso');
      navigate('/admin/roles');
    } catch (error) {
      showError('Erro ao atualizar role');
      console.error('Erro ao atualizar role:', error);
    }
  };

  // Função para deletar role
  const handleDelete = async () => {
    if (!id || !role) return;

    if (role.isSystem) {
      showError('Não é possível deletar roles do sistema');
      return;
    }

    try {
      await deleteRole.mutateAsync(id);
      showSuccess('Role excluído com sucesso');
      navigate('/admin/roles');
    } catch (error) {
      showError('Erro ao excluir role');
      console.error('Erro ao deletar role:', error);
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
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate('/admin/roles')}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Voltar
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-zinc-900'>Editar Role</h1>
            <p className='text-zinc-600 mt-1'>
              Modifique as informações e permissões do role
            </p>
          </div>
        </div>

        {!role.isSystem && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='text-red-600 hover:text-red-700 hover:bg-red-50'
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Excluir Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir o role "{role.name}"? Esta ação
                  não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant='outline'
                  onClick={handleDelete}
                  disabled={deleteRole.isPending}
                >
                  {deleteRole.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Formulário Principal */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
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

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='isActive'>Status do Role</Label>
                    <p className='text-sm text-zinc-600'>
                      {watchedIsActive
                        ? 'Role ativo e disponível para atribuição'
                        : 'Role inativo'}
                    </p>
                  </div>
                  <Switch
                    id='isActive'
                    checked={watchedIsActive}
                    onCheckedChange={checked => setValue('isActive', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gerenciamento de Permissões */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>Permissões</CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setShowPreview(!showPreview)}
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
                {permissions && permissions.length > 0 ? (
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
                ) : (
                  <div className='text-center py-8'>
                    <Shield className='w-12 h-12 text-zinc-400 mx-auto mb-4' />
                    <p className='text-zinc-600'>Carregando permissões...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Preview e Ações */}
          <div className='space-y-6'>
            {/* Informações do Role */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='w-5 h-5' />
                  Informações do Role
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label className='text-sm font-medium text-zinc-600'>
                    ID
                  </Label>
                  <p className='text-sm font-mono text-zinc-700'>{role.id}</p>
                </div>

                <div>
                  <Label className='text-sm font-medium text-zinc-600'>
                    Status
                  </Label>
                  <div className='mt-1'>
                    <Badge variant={role.isActive ? 'default' : 'destructive'}>
                      {role.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {role.isSystem && (
                      <Badge variant='outline' className='ml-2'>
                        Sistema
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label className='text-sm font-medium text-zinc-600'>
                    Usuários
                  </Label>
                  <p className='text-sm text-zinc-700'>
                    {role.userCount} usuário(s)
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium text-zinc-600'>
                    Criado em
                  </Label>
                  <p className='text-sm text-zinc-700'>
                    {new Date(role.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium text-zinc-600'>
                    Última atualização
                  </Label>
                  <p className='text-sm text-zinc-700'>
                    {new Date(role.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview do Role */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Eye className='w-5 h-5' />
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
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>
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
            <Card>
              <CardContent className='p-4'>
                <div className='space-y-3'>
                  <Button
                    type='submit'
                    className='w-full'
                    disabled={
                      updateRole.isPending || selectedPermissions.length === 0
                    }
                  >
                    {updateRole.isPending ? (
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    ) : (
                      <Save className='w-4 h-4 mr-2' />
                    )}
                    {updateRole.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>

                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    onClick={() => navigate('/admin/roles')}
                  >
                    Cancelar
                  </Button>
                </div>

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
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
