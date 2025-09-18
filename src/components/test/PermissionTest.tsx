import React from 'react';
import {
  useAppPermissions,
  useHasPermission,
  useApplications,
  usePTraceApplication,
} from '../../lib/hooks/use-app-permissions';
import { PermissionGuard } from '../permissions/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/loading-spinner';

export const PermissionTest: React.FC = () => {
  const {
    data: applicationsData,
    isLoading: appsLoading,
    error: appsError,
  } = useApplications();
  const {
    pTraceApp,
    applicationId,
    isLoading: pTraceLoading,
    error: pTraceError,
  } = usePTraceApplication();
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useAppPermissions();
  const { hasPermission: canReadUsers } = useHasPermission('users', 'read');
  const { hasPermission: canWriteUsers } = useHasPermission('users', 'write');

  const isLoading = appsLoading || pTraceLoading || permissionsLoading;
  const error = appsError || pTraceError || permissionsError;

  if (isLoading) {
    return <LoadingSpinner text='Carregando permissões...' />;
  }

  if (error) {
    return (
      <Card className='w-full max-w-2xl mx-auto'>
        <CardContent className='p-6'>
          <div className='text-red-600'>
            <h3 className='font-semibold'>Erro ao carregar permissões:</h3>
            <p className='text-sm mt-1'>{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      <Card>
        <CardHeader>
          <CardTitle>
            🧪 Teste de Permissões - P-Trace (Production Trace)
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <h4 className='font-medium mb-2'>Status da API:</h4>
              <Badge
                variant={
                  (permissionsData as any)?.success ? 'default' : 'destructive'
                }
              >
                {(permissionsData as any)?.success ? '✅ Conectado' : '❌ Erro'}
              </Badge>
            </div>

            <div>
              <h4 className='font-medium mb-2'>Aplicação:</h4>
              <Badge variant='outline' className='bg-blue-100 text-blue-800'>
                P-Trace (Production)
              </Badge>
            </div>

            <div>
              <h4 className='font-medium mb-2'>Total de Permissões:</h4>
              <Badge variant='outline'>
                {(permissionsData as any)?.data?.length || 0} permissões
              </Badge>
            </div>
          </div>

          <div className='bg-blue-50 p-3 rounded-lg'>
            <h4 className='font-medium mb-2 text-blue-900'>
              🔧 Fluxo Dinâmico:
            </h4>
            <div className='text-sm text-blue-800 space-y-1'>
              <p>
                <strong>1. GET /api/applications:</strong>{' '}
                {(applicationsData as any)?.success ? '✅' : '❌'} (
                {(applicationsData as any)?.data?.applications?.length || 0}{' '}
                aplicações)
              </p>
              <p>
                <strong>2. P-Trace encontrado:</strong>{' '}
                {pTraceApp ? '✅' : '❌'} {pTraceApp?.displayName || 'N/A'}
              </p>
              <p>
                <strong>3. Application ID:</strong> {applicationId || 'N/A'}
              </p>
              <p>
                <strong>4. GET /api/permissions:</strong>{' '}
                {(permissionsData as any)?.success ? '✅' : '❌'}
              </p>
            </div>
          </div>

          {(applicationsData as any)?.data?.applications && (
            <div className='bg-gray-50 p-3 rounded-lg'>
              <h4 className='font-medium mb-2'>📱 Aplicações Disponíveis:</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                {(applicationsData as any).data.applications.map(
                  (app: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded ${
                        app.applicationId === applicationId
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-white'
                      }`}
                    >
                      <div>
                        <span className='text-sm font-medium'>
                          {app.displayName}
                        </span>
                        <p className='text-xs text-gray-500'>{app.name}</p>
                      </div>
                      <Badge
                        variant={
                          app.applicationId === applicationId
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {app.applicationId === applicationId
                          ? 'Ativo'
                          : 'Inativo'}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div>
            <h4 className='font-medium mb-2'>Permissões Disponíveis:</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {(permissionsData as any)?.data?.map(
                (permission: any, index: number) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-2 bg-gray-50 rounded'
                  >
                    <span className='text-sm font-medium'>
                      {permission.functionName}
                    </span>
                    <Badge variant='outline' className='text-xs'>
                      {permission.permissionLevel}
                    </Badge>
                  </div>
                )
              )}
            </div>
          </div>

          <div className='border-t pt-4'>
            <h4 className='font-medium mb-2'>
              Teste de Verificação de Permissões:
            </h4>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='text-sm'>users:read</span>
                <Badge variant={canReadUsers ? 'default' : 'outline'}>
                  {canReadUsers ? '✅ Tem permissão' : '❌ Sem permissão'}
                </Badge>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-sm'>users:write</span>
                <Badge variant={canWriteUsers ? 'default' : 'outline'}>
                  {canWriteUsers ? '✅ Tem permissão' : '❌ Sem permissão'}
                </Badge>
              </div>
            </div>
          </div>

          <div className='border-t pt-4'>
            <h4 className='font-medium mb-2'>Teste de PermissionGuard:</h4>
            <div className='space-y-2'>
              <PermissionGuard
                functionName='users'
                permissionLevel='read'
                fallback={
                  <div className='text-red-500'>
                    ❌ Sem permissão para ler usuários
                  </div>
                }
              >
                <div className='text-green-600'>✅ Pode ler usuários</div>
              </PermissionGuard>

              <PermissionGuard
                functionName='users'
                permissionLevel='write'
                fallback={
                  <div className='text-red-500'>
                    ❌ Sem permissão para escrever usuários
                  </div>
                }
              >
                <div className='text-green-600'>✅ Pode escrever usuários</div>
              </PermissionGuard>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
