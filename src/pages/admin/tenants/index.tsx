import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../components/ui/error-message';
import { useTenants, useDeleteTenant } from '../../../lib/hooks/use-tenants';
import {
  Plus,
  Building,
  Users,
  Settings,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';

export default function TenantsPage() {
  const navigate = useNavigate();
  const [searchTerm] = useState('');
  const [currentPage] = useState(1);

  // Hooks para buscar dados
  const {
    data: tenantsData,
    isLoading: tenantsLoading,
    error: tenantsError,
  } = useTenants({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
  });

  const deleteTenantMutation = useDeleteTenant();

  // Loading state
  if (tenantsLoading) {
    return <LoadingSpinner text='Carregando tenants...' />;
  }

  // Error state
  if (tenantsError) {
    return (
      <ErrorMessage
        error={tenantsError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const tenants = tenantsData?.data?.tenants || [];
  const pagination = tenantsData?.data?.pagination;

  const handleDeleteTenant = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o tenant "${name}"?`)) {
      try {
        await deleteTenantMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao deletar tenant:', error);
      }
    }
  };

  return (
    <div className='min-h-screen bg-transparent'>
      {/* Header */}
      <div className='relative bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-b border-blue-100/50 rounded-t-2xl'>
        <div className='absolute inset-0 bg-blue-100/80'></div>
        <div className='relative px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-slate-900'>
                Gerenciar Tenants
              </h1>
              <p className='text-slate-600 mt-1'>
                Administre tenants e seus administradores
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                onClick={() => navigate('/admin/tenants/new')}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                <Plus className='w-4 h-4 mr-2' />
                Novo Tenant
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='p-6 space-y-6'>
        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card className='border border-gray-200 shadow-sm'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Total de Tenants
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {pagination?.total || 0}
                  </p>
                </div>
                <div className='p-3 rounded-xl bg-blue-50'>
                  <Building className='w-6 h-6 text-blue-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-gray-200 shadow-sm'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Tenants Ativos
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {tenants.filter(tenant => tenant.isActive).length}
                  </p>
                </div>
                <div className='p-3 rounded-xl bg-green-50'>
                  <Users className='w-6 h-6 text-green-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-gray-200 shadow-sm'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Página Atual
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {pagination?.page || 1}
                  </p>
                </div>
                <div className='p-3 rounded-xl bg-purple-50'>
                  <Settings className='w-6 h-6 text-purple-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Tenants */}
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <Building className='w-5 h-5 text-blue-600' />
              Lista de Tenants
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            {tenants.length > 0 ? (
              <div className='space-y-4'>
                {tenants.map(tenant => (
                  <div
                    key={tenant.id}
                    className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex-1'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-full bg-blue-100'>
                          <Building className='w-5 h-5 text-blue-600' />
                        </div>
                        <div>
                          <h3 className='font-medium text-gray-900'>
                            {tenant.name}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            CNPJ: {tenant.cnpj}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {tenant.address}
                          </p>
                          <div className='flex items-center gap-2 mt-1'>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                tenant.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {tenant.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className='text-xs text-gray-500'>
                              Criado em{' '}
                              {new Date(tenant.createdAt).toLocaleDateString(
                                'pt-BR'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                        className='flex items-center gap-1'
                      >
                        <Eye size={14} />
                        Ver
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          navigate(`/admin/tenants/${tenant.id}/edit`)
                        }
                        className='flex items-center gap-1'
                      >
                        <Edit size={14} />
                        Editar
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          handleDeleteTenant(tenant.id, tenant.name)
                        }
                        disabled={deleteTenantMutation.isPending}
                        className='flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50'
                      >
                        <Trash2 size={14} />
                        Deletar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <Building className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                <p className='text-gray-500 text-sm'>
                  Nenhum tenant encontrado. Comece criando seu primeiro tenant.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
