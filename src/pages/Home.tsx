import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-white text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirecionar baseado no status de autenticação
  if (isAuthenticated) {
    return <Navigate to='/p-trace' replace />;
  } else {
    return <Navigate to='/auth/login' replace />;
  }
}
