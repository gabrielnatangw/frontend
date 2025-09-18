import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { ErrorRecovery } from './error-recovery';

interface ErrorMessageProps {
  error: Error | null;
  onRetry?: () => void;
  onGoHome?: () => void;
  title?: string;
  description?: string;
  className?: string;
  context?: string;
  useAdvancedRecovery?: boolean;
}

export function ErrorMessage({
  error,
  onRetry,
  onGoHome,
  title = 'Erro ao carregar dados',
  description,
  className = '',
  context,
  useAdvancedRecovery = false,
}: ErrorMessageProps) {
  const errorMessage = error?.message || 'Ocorreu um erro inesperado';
  const errorDescription =
    description || 'Tente recarregar a página ou verificar sua conexão.';

  // Se usar recovery avançado, usar o componente ErrorRecovery
  if (useAdvancedRecovery && error) {
    const errorDetails = {
      message: errorMessage,
      code: (error as any)?.code,
      status: (error as any)?.status,
      field: (error as any)?.field,
      suggestions: [
        'Tente recarregar a página',
        'Verifique sua conexão com a internet',
        'Se o problema persistir, entre em contato com o suporte',
      ],
      recoveryActions: [
        ...(onRetry ? [{ label: 'Tentar Novamente', action: onRetry }] : []),
        ...(onGoHome ? [{ label: 'Voltar ao Início', action: onGoHome }] : []),
      ],
    };

    return (
      <ErrorRecovery
        error={errorDetails}
        context={context}
        className={className}
      />
    );
  }

  // Fallback para o componente original
  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardContent className='p-8 text-center'>
        <div className='flex flex-col items-center gap-4'>
          <AlertCircle className='w-16 h-16 text-red-500' />

          <div className='space-y-2'>
            <h3 className='text-xl font-semibold text-red-900'>{title}</h3>
            <p className='text-red-700 max-w-md'>{errorDescription}</p>
            {error && (
              <details className='mt-4 text-left'>
                <summary className='cursor-pointer text-sm text-red-600 hover:text-red-800'>
                  Detalhes do erro
                </summary>
                <pre className='mt-2 p-3 bg-red-100 rounded text-xs text-red-800 overflow-auto'>
                  {errorMessage}
                </pre>
              </details>
            )}
          </div>

          <div className='flex gap-3'>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant='outline'
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
                className='border-red-300 text-red-700 hover:bg-red-100'
              >
                <Home className='w-4 h-4 mr-2' />
                Voltar ao Início
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ErrorMessage;
