import React, { useState } from 'react';
import { usePermissionsComplete } from '../../lib/hooks/use-permissions-complete';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Settings, CheckCircle } from 'lucide-react';

interface ApplicationSelectorProps {
  onApplicationSelected?: (application: any) => void;
}

export const ApplicationSelector: React.FC<ApplicationSelectorProps> = ({
  onApplicationSelected,
}) => {
  const { applications, loading, setCurrentApplication } =
    usePermissionsComplete();
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  const handleSelectApplication = (applicationId: string) => {
    const app = applications.find(a => a.applicationId === applicationId);
    if (app) {
      setCurrentApplication(app);
      onApplicationSelected?.(app);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner text='Carregando aplicações...' />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6 text-center'>
            <Settings className='w-12 h-12 mx-auto mb-4 text-gray-400' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Nenhuma aplicação disponível
            </h3>
            <p className='text-gray-500'>
              Entre em contato com o administrador para obter acesso às
              aplicações.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold text-gray-900'>
            Selecione uma Aplicação
          </CardTitle>
          <p className='text-gray-600 mt-2'>
            Escolha a aplicação que deseja acessar
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          {applications.map(app => (
            <div
              key={app.applicationId}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedAppId === app.applicationId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedAppId(app.applicationId)}
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      {app.displayName}
                    </h3>
                    {app.isActive ? (
                      <Badge
                        variant='default'
                        className='bg-green-100 text-green-800'
                      >
                        <CheckCircle className='w-3 h-3 mr-1' />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='text-gray-500'>
                        Inativo
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm text-gray-600 mb-2'>
                    {app.description}
                  </p>
                  <p className='text-xs text-gray-500'>
                    ID: {app.applicationId}
                  </p>
                </div>
                {selectedAppId === app.applicationId && (
                  <CheckCircle className='w-6 h-6 text-blue-600' />
                )}
              </div>
            </div>
          ))}

          <div className='flex justify-end pt-4 border-t'>
            <Button
              onClick={() => handleSelectApplication(selectedAppId)}
              disabled={!selectedAppId}
              className='w-full sm:w-auto'
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
