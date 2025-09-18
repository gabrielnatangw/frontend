import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Button,
  Input,
  Label,
  Switch,
  LoadingSpinner,
  ErrorMessage,
} from '../../../../components';
import { ArrowLeft, Save } from 'lucide-react';
import { useTenant, useUpdateTenant } from '../../../../lib/hooks/use-tenants';

type EditTenantForm = {
  name: string;
  isActive: boolean;
};

export default function EditTenantPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, error } = useTenant(id || '');
  const updateTenant = useUpdateTenant();

  const tenant = data?.data;

  const { register, handleSubmit, setValue, watch } = useForm<EditTenantForm>({
    defaultValues: {
      name: tenant?.name || '',
      isActive: tenant?.isActive ?? true,
    },
  });

  React.useEffect(() => {
    if (tenant) {
      setValue('name', tenant.name);
      setValue('isActive', tenant.isActive);
    }
  }, [tenant, setValue]);

  if (isLoading) {
    return <LoadingSpinner text='Carregando tenant...' />;
  }

  if (error) {
    return (
      <ErrorMessage error={error} onRetry={() => window.location.reload()} />
    );
  }

  if (!tenant) {
    return null;
  }

  const onSubmit = async (values: EditTenantForm) => {
    if (!id) return;
    try {
      await updateTenant.mutateAsync({
        id,
        data: { name: values.name, isActive: values.isActive },
      });
      navigate(`/admin/tenants/${id}`);
    } catch (e) {
      // Notificações já devem ser tratadas globalmente
      console.error(e);
    }
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <Button
          variant='outline'
          onClick={() => navigate(`/admin/tenants/${id}`)}
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Voltar
        </Button>
        <h1 className='text-2xl font-bold text-slate-900'>Editar Tenant</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Nome</Label>
          <Input id='name' {...register('name')} placeholder='Nome do tenant' />
        </div>

        <div className='flex items-center gap-3'>
          <Switch
            id='isActive'
            checked={watch('isActive')}
            onCheckedChange={v => setValue('isActive', v)}
          />
          <Label htmlFor='isActive'>Ativo</Label>
        </div>

        {/* Campos somente leitura conforme tipos atuais de UpdateTenantRequest */}
        <div className='text-sm text-gray-600'>
          CNPJ e Endereço são exibidos na visualização e não são editáveis aqui.
        </div>

        <div>
          <Button
            type='submit'
            className='flex items-center gap-2'
            disabled={updateTenant.isPending}
          >
            <Save className='w-4 h-4' />
            {updateTenant.isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
