import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { LoadingSpinner, ErrorMessage } from '../../../components';
import {
  Shield,
  Plus,
  Edit,
  Users,
  Settings,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoles } from '../../../lib';

export default function RolesDashboard() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Hooks para buscar dados do backend
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useRoles({
    page: currentPage,
    limit: 10,
  });

  // Dados processados
  const roles = rolesData?.data?.roles || [];

  // Calcular estatísticas dos dados reais
  const stats = {
    total: roles.length,
    active: roles.filter(role => role.isActive).length,
    inactive: roles.filter(role => !role.isActive).length,
    system: roles.filter(role => role.isSystem).length,
  };

  // Loading state
  if (rolesLoading) {
    return <LoadingSpinner text='Carregando roles...' />;
  }

  // Error state
  if (rolesError) {
    return (
      <div className='min-h-screen bg-transparent'>
        <div className='mx-8 py-8'>
          <ErrorMessage
            error={rolesError}
            onRetry={() => {
              refetchRoles();
            }}
            onGoHome={() => navigate('/admin')}
            title='Erro ao carregar roles'
            description='Não foi possível carregar os dados dos roles. Verifique sua conexão e tente novamente.'
          />
        </div>
      </div>
    );
  }

  // Processar estatísticas dos dados reais
  const processedStats = [
    {
      title: 'Total de Roles',
      value: stats.total.toString(),
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Roles Ativos',
      value: stats.active.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Roles Inativos',
      value: stats.inactive.toString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  // Função para mapear dados do backend para o formato da interface
  const mapRoleData = (role: any) => {
    const iconMap = {
      admin: Shield,
      manager: Users,
      operator: Settings,
      viewer: Eye,
      auditor: Eye,
      default: Shield,
    };

    const colorMap = {
      admin: 'bg-red-500',
      manager: 'bg-blue-500',
      operator: 'bg-green-500',
      viewer: 'bg-purple-500',
      auditor: 'bg-orange-500',
      default: 'bg-gray-500',
    };

    const roleType = role.name?.toLowerCase().replace(/\s+/g, '') || 'default';

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions?.length || 0,
      users: role.userCount || 0,
      status: role.isActive ? 'active' : 'inactive',
      createdAt: role.createdAt,
      lastModified: role.updatedAt,
      color: colorMap[roleType as keyof typeof colorMap] || colorMap.default,
      icon: iconMap[roleType as keyof typeof iconMap] || iconMap.default,
    };
  };

  // Mapear roles para o formato da interface
  const filteredRoles = roles.map(mapRoleData);

  // Funções para ações de roles

  // Funções para seleção múltipla
  const handleSelectRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRoles([]);
      setSelectAll(false);
    } else {
      setSelectedRoles(filteredRoles.map(role => role.id));
      setSelectAll(true);
    }
  };

  // Verificar se todos os roles estão selecionados
  const isAllSelected =
    selectedRoles.length === filteredRoles.length && filteredRoles.length > 0;

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge className='bg-green-500 text-white border-green-500 hover:bg-green-600 transition-colors font-medium px-3 py-1'>
          <CheckCircle className='w-3 h-3 mr-1' />
          Ativo
        </Badge>
      );
    }
    return (
      <Badge className='bg-red-500 text-white border-red-500 hover:bg-red-600 transition-colors font-medium px-3 py-1'>
        <XCircle className='w-3 h-3 mr-1' />
        Inativo
      </Badge>
    );
  };

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
                onClick={() => navigate('/admin')}
                className='text-slate-700 hover:text-slate-900 hover:bg-white/60 mb-2'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Voltar
              </Button>
              <h1 className='text-2xl font-semibold text-slate-800'>
                Gerenciar Roles
              </h1>
              <p className='text-sm text-slate-600'>
                Crie e gerencie roles do sistema
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Button
                  onClick={() => navigate('/admin/roles/new')}
                  className='bg-white/60 text-slate-700 border-slate-300 hover:bg-white/80 backdrop-blur-sm'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Novo Role
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mx-8 py-2 space-y-4'>
        {/* Stats Cards com design moderno */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {processedStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className='relative overflow-hidden border border-zinc-200 shadow-lg hover:shadow-lg transition-all duration-500 group'
              >
                <div
                  className={`absolute inset-0 ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                ></div>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium text-zinc-600'>
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-4xl font-bold text-zinc-900 mb-2'>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Controles de Paginação */}
        {roles.length > 0 && (
          <Card className='shadow-lg border border-zinc-200'>
            <CardContent className='p-4'>
              <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
                <div className='flex items-center gap-4'>
                  <span className='text-sm text-zinc-600'>
                    Mostrando {filteredRoles.length} roles
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setCurrentPage(prev => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className='border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                  >
                    Anterior
                  </Button>

                  <div className='flex items-center gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                    >
                      {currentPage}
                    </Button>
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={filteredRoles.length < 10}
                    className='border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roles Grid */}
        <Card className='shadow-lg border border-zinc-200'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-3 text-xl'>
                <div className='p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg'>
                  <Shield className='w-5 h-5 text-white' />
                </div>
                Roles do Sistema
              </CardTitle>

              {filteredRoles.length > 0 && (
                <div className='flex items-center gap-2'>
                  <label className='flex items-center gap-2 text-sm text-zinc-600 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                    />
                    Selecionar todos
                  </label>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredRoles.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {filteredRoles.map(role => {
                  const Icon = role.icon;
                  const isSelected = selectedRoles.includes(role.id);
                  return (
                    <div
                      key={role.id}
                      className={`flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-all duration-300 group border ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-zinc-200'
                      }`}
                    >
                      {/* Checkbox de seleção */}
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => handleSelectRole(role.id)}
                        className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                      />

                      <div
                        className={`p-3 rounded-xl ${role.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon
                          className={`w-5 h-5 ${role.color.replace('bg-', 'text-')}`}
                        />
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <div className='font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors'>
                              {role.name}
                            </div>
                            <div className='text-sm text-zinc-600 mt-1'>
                              {role.description}
                            </div>
                          </div>
                          {getStatusBadge(role.status)}
                        </div>
                        <div className='flex items-center gap-4 mt-2 text-xs text-zinc-500'>
                          <span>{role.permissions} permissões</span>
                          <span>{role.users} usuários</span>
                          <span>
                            Criado em{' '}
                            {new Date(role.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </div>
                      </div>
                      <div className='flex gap-1'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => navigate(`/admin/roles/${role.id}`)}
                          className='hover:bg-blue-50 hover:text-blue-600 transition-colors'
                          title='Editar role'
                        >
                          <Edit className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            navigate(`/admin/roles/${role.id}/permissions`)
                          }
                          className='hover:bg-purple-50 hover:text-purple-600 transition-colors'
                          title='Gerenciar permissões'
                        >
                          <Shield className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='p-12 text-center'>
                <Shield className='w-16 h-16 text-zinc-300 mx-auto mb-4' />
                <h3 className='text-xl font-semibold text-zinc-900 mb-2'>
                  Nenhum role encontrado
                </h3>
                <p className='text-zinc-600 mb-6'>
                  Nenhum role encontrado. Comece criando seu primeiro role.
                </p>
                <Button
                  onClick={() => navigate('/admin/roles/new')}
                  className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Criar Primeiro Role
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Barra de ações em lote - Removida por enquanto */}
    </div>
  );
}
