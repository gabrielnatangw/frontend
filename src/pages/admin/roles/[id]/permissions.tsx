import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Shield,
  CheckCircle2,
  AlertCircle,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button, LoadingSpinner, ErrorMessage } from '../../../../components';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { PermissionGrid } from '../../../../components/admin/permissions/PermissionGrid';
import { useRole, useUpdateRole, useNotifications } from '../../../../lib';
import { useAppPermissions } from '../../../../lib/hooks/use-app-permissions';
import type { Permission } from '../../../../types/permission';

export default function RolePermissionsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useNotifications();

  // Estado para preview das permissões
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

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

  const updateRole = useUpdateRole();

  // Carregar permissões do role - sempre declarado antes dos early returns
  useEffect(() => {
    if (roleData?.data) {
      setSelectedPermissions(roleData.data.permissions?.map(p => p.id) || []);
    }
  }, [roleData?.data]);

  // Loading state
  if (roleLoading || permissionsLoading) {
    return <LoadingSpinner text='Carregando permissões...' />;
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
            title='Erro ao carregar permissões'
            description='Não foi possível carregar os dados do role ou permissões.'
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

  // Função para salvar alterações
  const handleSave = async () => {
    if (!id) return;

    try {
      await updateRole.mutateAsync({
        id,
        data: { permissionIds: selectedPermissions },
      });
      showSuccess('Permissões atualizadas com sucesso');
      setHasChanges(false);
    } catch (error) {
      showError('Erro ao atualizar permissões');
      console.error('Erro ao atualizar permissões:', error);
    }
  };

  // Função para alternar permissão
  const handlePermissionToggle = (permissionId: string) => {
    const newSelected = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter(id => id !== permissionId)
      : [...selectedPermissions, permissionId];

    setSelectedPermissions(newSelected);
    setHasChanges(true);
  };

  // Função para selecionar todas as permissões de um módulo
  const handleSelectAllModule = (module: string) => {
    const modulePermissions =
      permissions?.filter(p => p.module === module)?.map(p => p.id) || [];

    const newSelected = [
      ...new Set([...selectedPermissions, ...modulePermissions]),
    ];
    setSelectedPermissions(newSelected);
    setHasChanges(true);
  };

  // Função para deselecionar todas as permissões de um módulo
  const handleDeselectAllModule = (module: string) => {
    const modulePermissions =
      permissions?.filter(p => p.module === module)?.map(p => p.id) || [];

    const newSelected = selectedPermissions.filter(
      id => !modulePermissions.includes(id)
    );
    setSelectedPermissions(newSelected);
    setHasChanges(true);
  };

  // Função para selecionar todas as permissões
  const handleSelectAll = () => {
    const allPermissions = permissions?.map(p => p.id) || [];
    setSelectedPermissions(allPermissions);
    setHasChanges(true);
  };

  // Função para deselecionar todas as permissões
  const handleDeselectAll = () => {
    setSelectedPermissions([]);
    setHasChanges(true);
  };

  // Mapear dados da API para o formato esperado pelo componente
  const rawPermissions = (permissionsData as any)?.data || [];
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

  // Obter estatísticas por módulo
  const moduleStats = Object.entries(permissionsByModule).map(
    ([module, permissions]) => ({
      module,
      count: Array.isArray(permissions) ? permissions.length : 0,
      total: Array.isArray(permissions)
        ? permissions.filter(p => p.module === module)
        : [].length || 0,
    })
  );

  if (roleLoading) {
    return (
      <div className='p-6'>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-800'>Role não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate(`/admin/roles/${id}`)}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Voltar
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-zinc-900'>
              Gerenciar Permissões
            </h1>
            <p className='text-zinc-600 mt-1'>
              Configure as permissões do role "{role.name}"
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
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

          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateRole.isPending}
          >
            {updateRole.isPending ? (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
            ) : (
              <Save className='w-4 h-4 mr-2' />
            )}
            {updateRole.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Estatísticas do Role */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-zinc-600'>
                  Total de Permissões
                </p>
                <p className='text-2xl font-bold text-zinc-900'>
                  {selectedPermissions.length}
                </p>
              </div>
              <Shield className='w-8 h-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-zinc-600'>
                  Módulos Ativos
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {moduleStats.length}
                </p>
              </div>
              <CheckCircle2 className='w-8 h-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-zinc-600'>
                  Usuários com este Role
                </p>
                <p className='text-2xl font-bold text-purple-600'>
                  {role.userCount}
                </p>
              </div>
              <Users className='w-8 h-8 text-purple-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-zinc-600'>Status</p>
                <p className='text-2xl font-bold text-orange-600'>
                  {role.isActive ? 'Ativo' : 'Inativo'}
                </p>
              </div>
              <AlertCircle className='w-8 h-8 text-orange-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Grid de Permissões */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Permissões</CardTitle>
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

        {/* Sidebar com Preview e Estatísticas */}
        <div className='space-y-6'>
          {/* Estatísticas por Módulo */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Permissões por Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {moduleStats.map(({ module, count, total }) => (
                  <div
                    key={module}
                    className='flex items-center justify-between'
                  >
                    <div>
                      <p className='text-sm font-medium text-zinc-900'>
                        {module}
                      </p>
                      <p className='text-xs text-zinc-600'>
                        {count} de {total} permissões
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-16 bg-zinc-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{
                            width: `${typeof total === 'number' && total > 0 ? (count / total) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className='text-xs text-zinc-600 w-8 text-right'>
                        {typeof total === 'number' && total > 0
                          ? Math.round((count / total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                ))}

                {moduleStats.length === 0 && (
                  <p className='text-sm text-zinc-600 text-center py-4'>
                    Nenhuma permissão selecionada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview das Permissões */}
          {showPreview && selectedPermissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>
                  Preview das Permissões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3 max-h-64 overflow-y-auto'>
                  {Object.entries(permissionsByModule).map(
                    ([module, permissions]) => (
                      <div key={module}>
                        <h4 className='text-sm font-medium text-zinc-900 mb-2 flex items-center gap-2'>
                          {module}
                          <Badge variant='secondary' className='text-xs'>
                            {Array.isArray(permissions)
                              ? permissions.length
                              : 0}
                          </Badge>
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

          {/* Aviso sobre Alterações */}
          {hasChanges && (
            <Card className='border-yellow-200 bg-yellow-50'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2'>
                  <AlertCircle className='w-4 h-4 text-yellow-600' />
                  <p className='text-sm text-yellow-800'>
                    Você tem alterações não salvas
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
