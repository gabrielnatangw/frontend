import React from 'react';
import {
  AlertCircle,
  RefreshCw,
  Home,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface ErrorRecoveryProps {
  error: {
    code?: string;
    message: string;
    status?: number;
    field?: string;
    suggestions?: string[];
    recoveryActions?: Array<{
      label: string;
      action: () => void;
    }>;
  };
  context?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

export function ErrorRecovery({
  error,
  context,
  onRetry,
  onGoHome,
  className = '',
}: ErrorRecoveryProps) {
  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-500';
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-yellow-500';
    if (status >= 400 && status < 500) return 'bg-red-500';
    if (status >= 500) return 'bg-red-600';
    return 'bg-gray-500';
  };

  const getStatusText = (status?: number) => {
    if (!status) return 'Erro';
    if (status >= 200 && status < 300) return 'Sucesso';
    if (status >= 300 && status < 400) return 'Redirecionamento';
    if (status >= 400 && status < 500) return 'Erro do Cliente';
    if (status >= 500) return 'Erro do Servidor';
    return 'Erro';
  };

  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-red-100 rounded-lg'>
            <AlertCircle className='w-6 h-6 text-red-600' />
          </div>
          <div className='flex-1'>
            <CardTitle className='text-red-900 text-lg'>
              {error.message}
              {context && (
                <span className='text-red-600 text-sm font-normal ml-2'>
                  ({context})
                </span>
              )}
            </CardTitle>
            <div className='flex items-center gap-2 mt-1'>
              {error.status && (
                <Badge className={`${getStatusColor(error.status)} text-white`}>
                  {error.status} - {getStatusText(error.status)}
                </Badge>
              )}
              {error.code && (
                <Badge
                  variant='outline'
                  className='border-red-300 text-red-700'
                >
                  {error.code}
                </Badge>
              )}
              {error.field && (
                <Badge
                  variant='outline'
                  className='border-red-300 text-red-700'
                >
                  Campo: {error.field}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Sugestões */}
        {error.suggestions && error.suggestions.length > 0 && (
          <div>
            <h4 className='text-sm font-semibold text-red-800 mb-2'>
              O que você pode fazer:
            </h4>
            <ul className='space-y-1'>
              {error.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className='text-sm text-red-700 flex items-start gap-2'
                >
                  <span className='text-red-500 mt-1'>•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ações de recuperação */}
        <div className='flex flex-wrap gap-2'>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant='outline'
              size='sm'
              className='border-red-300 text-red-700 hover:bg-red-100'
            >
              <RefreshCw className='w-4 h-4 mr-2' />
              Tentar Novamente
            </Button>
          )}

          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant='outline'
              size='sm'
              className='border-red-300 text-red-700 hover:bg-red-100'
            >
              <Home className='w-4 h-4 mr-2' />
              Voltar ao Início
            </Button>
          )}

          {error.recoveryActions?.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              variant='outline'
              size='sm'
              className='border-red-300 text-red-700 hover:bg-red-100'
            >
              {action.label === 'Fazer login' && (
                <ArrowLeft className='w-4 h-4 mr-2' />
              )}
              {action.label === 'Verificar status' && (
                <ExternalLink className='w-4 h-4 mr-2' />
              )}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Detalhes técnicos (colapsável) */}
        <details className='mt-4'>
          <summary className='cursor-pointer text-sm text-red-600 hover:text-red-800 font-medium'>
            Detalhes técnicos
          </summary>
          <div className='mt-2 p-3 bg-red-100 rounded text-xs text-red-800 overflow-auto'>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

export default ErrorRecovery;
