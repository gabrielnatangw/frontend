import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingSpinner,
  ErrorMessage,
} from '../../../components';
import { Building, Edit, ArrowLeft } from 'lucide-react';
import { useTenant } from '../../../lib/hooks/use-tenants';

export default function ViewTenantPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, error } = useTenant(id || '');

  if (isLoading) {
    return <LoadingSpinner text='Carregando tenant...' />;
  }

  if (error) {
    return (
      <ErrorMessage error={error} onRetry={() => window.location.reload()} />
    );
  }

  const tenant = data?.data;

  if (!tenant) {
    return (
      <div className='p-6'>
        <Card className='border border-gray-200'>
          <CardContent className='p-6'>
            <p className='text-sm text-gray-600'>Tenant não encontrado.</p>
            <div className='mt-4'>
              <Button
                variant='outline'
                onClick={() => navigate('/admin/tenants')}
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='outline' onClick={() => navigate('/admin/tenants')}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Voltar
          </Button>
          <h1 className='text-2xl font-bold text-slate-900'>
            Detalhes do Tenant
          </h1>
        </div>
        <Button
          onClick={() => navigate(`/admin/tenants/${tenant.id}/edit`)}
          className='flex items-center gap-2'
        >
          <Edit className='w-4 h-4' />
          Editar
        </Button>
      </div>

      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-lg font-semibold flex items-center gap-2'>
            <Building className='w-5 h-5 text-blue-600' />
            {tenant.name}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p className='text-sm text-gray-700'>
            <span className='font-medium'>CNPJ:</span> {tenant.cnpj}
          </p>
          <p className='text-sm text-gray-700'>
            <span className='font-medium'>Endereço:</span> {tenant.address}
          </p>
          <p className='text-sm text-gray-700'>
            <span className='font-medium'>Status:</span>{' '}
            {tenant.isActive ? 'Ativo' : 'Inativo'}
          </p>
          <p className='text-xs text-gray-500'>
            Criado em {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
