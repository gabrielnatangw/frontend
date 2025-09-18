import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import { DataCard } from '../../components';
import { useAuth, useMe } from '../../lib/hooks/use-auth';
import { User, Building2, Calendar, Clock, AlertCircle } from 'lucide-react';

// Mock data para últimos acessos (comentado - não utilizado)
// const mockRecentAccesses = [
//   {
//     id: '1',
//     device: 'Desktop Windows',
//     deviceIcon: <className='w-4 h-4' />,
//     browser: 'Chrome 120.0.0',
//     ip: '192.168.1.100',
//     location: 'São Paulo, SP',
//     sessionValid: true,
//     lastActivity: '2024-03-20T14:30:00Z',
//     loginTime: '2024-03-20T08:00:00Z',
//   },
//   {
//     id: '2',
//     device: 'iPhone 15',
//     deviceIcon: <className='w-4 h-4' />,
//     browser: 'Safari Mobile',
//     ip: '192.168.1.101',
//     location: 'São Paulo, SP',
//     sessionValid: true,
//     lastActivity: '2024-03-20T12:15:00Z',
//     loginTime: '2024-03-20T07:30:00Z',
//   },
//   {
//     id: '3',
//     device: 'iPad Pro',
//     deviceIcon: <className='w-4 h-4' />,
//     browser: 'Safari',
//     ip: '192.168.1.102',
//     location: 'São Paulo, SP',
//     sessionValid: false,
//     lastActivity: '2024-03-19T18:45:00Z',
//     loginTime: '2024-03-19T09:00:00Z',
//   },
//   {
//     id: '4',
//     device: 'MacBook Pro',
//     deviceIcon: <className='w-4 h-4' />,
//     browser: 'Safari 17.0',
//     ip: '192.168.1.103',
//     location: 'São Paulo, SP',
//     sessionValid: false,
//     lastActivity: '2024-03-18T16:20:00Z',
//     loginTime: '2024-03-18T08:15:00Z',
//   },
// ];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // Buscar dados do usuário atual usando a rota /api/auth/me
  const { data: meData, isLoading, error } = useMe();

  // Usar dados da API /auth/me ou fallback para dados do auth
  const user = meData?.user || authUser;
  const tenant = meData?.tenant;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // const getSessionStatusIcon = (isValid: boolean) => {
  //   if (isValid) {
  //     return <className='w-4 h-4 text-green-500' />;
  //   }
  //   return <className='w-4 h-4 text-red-500' />;
  // };

  // const getSessionStatusText = (isValid: boolean) => {
  //   if (isValid) {
  //     return <span className='text-green-600 font-medium'>Sessão Ativa</span>;
  //   }
  //   return <span className='text-red-600 font-medium'>Sessão Expirada</span>;
  // };

  // const handleEndSession = (sessionId: string) => {
  //   // TODO: Implementar lógica para encerrar sessão
  //   // Aqui você pode chamar a API para encerrar a sessão
  // };

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-end gap-2 mb-6'>
          <Button disabled>Editar Perfil</Button>
          <Button disabled>Alterar Senha</Button>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='animate-pulse'>
            <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2 mb-6'></div>
            <div className='space-y-3'>
              <div className='h-4 bg-gray-200 rounded w-full'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-end gap-2 mb-6'>
          <Button onClick={() => navigate('/p-trace/profile/edit')}>
            Editar Perfil
          </Button>
          <Button onClick={() => navigate('/p-trace/profile/password')}>
            Alterar Senha
          </Button>
        </div>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
          <div className='flex items-center gap-3'>
            <AlertCircle className='w-6 h-6 text-red-500' />
            <div>
              <h3 className='text-lg font-semibold text-red-800'>
                Erro ao carregar perfil
              </h3>
              <p className='text-red-600'>
                Não foi possível carregar os dados do perfil. Tente novamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se não tiver usuário, mostrar erro
  if (!user) {
    return (
      <div className='space-y-6'>
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6'>
          <div className='flex items-center gap-3'>
            <AlertCircle className='w-6 h-6 text-yellow-500' />
            <div>
              <h3 className='text-lg font-semibold text-yellow-800'>
                Usuário não encontrado
              </h3>
              <p className='text-yellow-600'>
                Não foi possível identificar o usuário logado.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Botões de ação no topo */}
      <div className='flex items-center justify-end gap-2 mb-6'>
        <Button onClick={() => navigate('/p-trace/profile/edit')}>
          Editar Perfil
        </Button>
        <Button onClick={() => navigate('/p-trace/profile/password')}>
          Alterar Senha
        </Button>
      </div>

      {/* Card principal de informações básicas - Largura completa */}
      <DataCard
        title={user.name || 'Nome não informado'}
        subtitle={`${user.email || 'Email não informado'} • ${user.userType || 'Tipo não informado'}`}
        icon={<User className='w-5 h-5' />}
        iconBgColor='bg-blue-50'
        iconColor='text-blue-600'
        fields={[
          {
            label: 'Empresa',
            value: tenant?.name || 'Empresa não informada',
            icon: <Building2 className='w-4 h-4' />,
          },
          {
            label: 'Data de Criação',
            value: user.createdAt
              ? formatDate(user.createdAt)
              : 'Data não informada',
            icon: <Calendar className='w-4 h-4' />,
          },
          {
            label: 'Última Atualização',
            value: user.updatedAt
              ? formatDate(user.updatedAt)
              : 'Data não informada',
            icon: <Clock className='w-4 h-4' />,
          },
        ]}
        status={{
          label: user.isActive ? 'Conta Ativa' : 'Conta Inativa',
          variant: user.isActive ? 'success' : 'error',
        }}
        badges={[
          {
            label: user.userType || 'Tipo não informado',
            variant: 'info',
          },
          {
            label: tenant?.name || 'Empresa não informada',
            variant: 'default',
          },
        ]}
        className='w-full'
      />

      {/* 
        TODO: IMPLEMENTAR SEÇÃO DE ÚLTIMOS ACESSOS
        =============================================
        
        Esta seção foi comentada temporariamente pois ainda não foi implementada no backend.
        Ela será implementada em breve e NÃO deve ser removida.
        
        Funcionalidades que serão implementadas:
        - Histórico de dispositivos de acesso
        - Status das sessões ativas/expiradas
        - Informações de IP, localização, browser
        - Horários de login e última atividade
        - Botão para encerrar sessões ativas
        
        Dados mock atuais (para referência):
        - mockRecentAccesses: Array com 4 dispositivos de exemplo
        - formatDate(): Função para formatação de datas
        - getSessionStatusIcon(): Função para ícones de status
        - getSessionStatusText(): Função para texto de status
        - handleEndSession(): Função para encerrar sessões
      */}
    </div>
  );
}
