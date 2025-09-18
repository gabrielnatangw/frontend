import { useState } from 'react';
import { Button } from '../../components';
import { useLogin, useAuthStore } from '../../components';
import { LogIn, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { LoginRequestSchema } from '../../lib/schemas/auth';
import { ZodError } from 'zod';
import { debug } from '../../lib/utils/debug';

export default function Login() {
  const navigate = useNavigate();
  const { isLoading, error } = useAuthStore();
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    debug.auth('Iniciando processo de login', {
      email,
      passwordLength: password.length,
      isLoading,
      error,
    });

    // Limpar erros anteriores
    setValidationErrors({});

    try {
      debug.auth('Validando credenciais com Zod');
      // Validar dados com Zod
      const credentials = LoginRequestSchema.parse({ email, password });
      debug.auth('Credenciais validadas', {
        email: credentials.email,
        passwordLength: credentials.password.length,
      });

      debug.auth('Enviando requisição para API');
      // Fazer login
      await loginMutation.mutateAsync(credentials);
      debug.success('Login realizado com sucesso!');

      // Sucesso - redirecionar para P-TRACE
      debug.auth('Redirecionando para /p-trace');
      navigate('/p-trace');
    } catch (error: unknown) {
      debug.error('Erro capturado no login', error);

      if (error instanceof ZodError) {
        debug.error('Erro de validação Zod', error.issues);
        // Erro de validação Zod
        const errors: Record<string, string> = {};
        error.issues.forEach(issue => {
          if (issue.path) {
            const field = issue.path[0] as string;
            errors[field] = issue.message;
          }
        });
        debug.error('Erros de validação mapeados', errors);
        setValidationErrors(errors);
      } else if (error instanceof Error) {
        // Erro da API já está sendo tratado pelo hook
        console.error('❌ Login - Erro da API:', error.message);
        console.error('❌ Login - Stack trace:', error.stack);
      } else {
        // Erro desconhecido
        console.error('❌ Login - Erro desconhecido:', error);
      }
    }
  };

  // Debug: Log dos estados do componente
  debug.state('Estados do componente Login', {
    email,
    passwordLength: password.length,
    showPassword,
    isLoading,
    error,
    validationErrors,
    mutationPending: loginMutation.isPending,
    mutationError: loginMutation.error,
  });

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Error State */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
            <div className='flex items-center gap-2 text-red-700'>
              <AlertTriangle size={16} />
              <span className='text-sm font-medium'>Erro no login</span>
            </div>
            <p className='text-red-600 text-xs mt-1'>{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-slate-700 mb-2'
          >
            Email
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={e => {
              debug.state('Email alterado', e.target.value);
              setEmail(e.target.value);
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.email ? 'border-red-300' : 'border-slate-300'
            }`}
            placeholder='Digite seu email'
            required
          />
          {validationErrors.email && (
            <p className='text-red-600 text-xs mt-1'>
              {validationErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-slate-700 mb-2'
          >
            Senha
          </label>
          <div className='relative'>
            <input
              id='password'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => {
                debug.state('Password alterado', {
                  length: e.target.value.length,
                });
                setPassword(e.target.value);
              }}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.password
                  ? 'border-red-300'
                  : 'border-slate-300'
              }`}
              placeholder='Digite sua senha'
              required
            />
            <button
              type='button'
              onClick={() => {
                debug.state('Toggle show password', !showPassword);
                setShowPassword(!showPassword);
              }}
              className='absolute inset-y-0 right-0 pr-3 flex items-center'
            >
              {showPassword ? (
                <EyeOff className='h-5 w-5 text-slate-400' />
              ) : (
                <Eye className='h-5 w-5 text-slate-400' />
              )}
            </button>
          </div>
          {validationErrors.password && (
            <p className='text-red-600 text-xs mt-1'>
              {validationErrors.password}
            </p>
          )}
        </div>

        <Button
          type='submit'
          className='w-full bg-green-500 hover:bg-green-600 border-green-600 text-white'
          disabled={isLoading || loginMutation.isPending}
        >
          <LogIn className='w-4 h-4 mr-2' />
          {isLoading || loginMutation.isPending ? 'Entrando...' : 'Entrar'}
        </Button>

        <div className='text-left'>
          <Link
            to='/auth/recover-password'
            className='text-blue-600 hover:text-blue-700 text-sm'
          >
            Esqueceu a senha?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
