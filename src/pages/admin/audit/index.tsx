import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../components/ui/error-message';
// import { useAuditLogs, useAuditStats } from '../../../lib/hooks/use-audit-logs';
import { useDebounce } from '../../../lib/hooks/use-debounce';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  User,
  Shield,
  Database,
  Download,
  RefreshCw,
  ArrowLeft,
  Eye,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuditDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate] = useState('today');
  const [, setCurrentPage] = useState(1);

  // Debounced search para evitar muitas requisições
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterType, filterDate]);

  // Dados simulados para auditoria (já que a API não tem endpoints de auditoria)
  const mockAuditLogs = [
    {
      id: '1',
      type: 'user_login',
      title: 'Login de usuário',
      description: 'Usuário fez login no sistema',
      user: 'admin@groupwork.com.br',
      timestamp: new Date().toISOString(),
      severity: 'info',
      ip: '192.168.1.1',
    },
    {
      id: '2',
      type: 'role_created',
      title: 'Role criado',
      description: 'Novo role "Operador" foi criado',
      user: 'admin@groupwork.com.br',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'info',
      ip: '192.168.1.1',
    },
    {
      id: '3',
      type: 'user_created',
      title: 'Usuário criado',
      description: 'Novo usuário "João Silva" foi criado',
      user: 'admin@groupwork.com.br',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: 'info',
      ip: '192.168.1.1',
    },
  ];

  const mockStats = {
    total: mockAuditLogs.length,
    today: mockAuditLogs.length,
    warnings: 0,
    errors: 0,
  };

  // Simular loading e error states
  const logsLoading = false;
  const logsError = null;
  const statsLoading = false;
  const statsError = null;

  // Dados processados
  const auditLogs = mockAuditLogs;
  const stats = mockStats;

  // Loading state
  if (logsLoading || statsLoading) {
    return <LoadingSpinner text='Carregando logs de auditoria...' />;
  }

  // Error state
  if (logsError || statsError) {
    return (
      <ErrorMessage
        error={logsError || statsError}
        onRetry={() => {
          window.location.reload();
        }}
      />
    );
  }

  // Processar estatísticas para exibição
  const processedStats = [
    {
      title: 'Total de Eventos',
      value: stats.total.toString(),
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Eventos Hoje',
      value: stats.today.toString(),
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Avisos',
      value: stats.warnings.toString(),
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Erros',
      value: stats.errors.toString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  // Função para obter badge de severidade
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return (
          <Badge
            variant='destructive'
            className='bg-red-100 text-red-800 hover:bg-red-200'
          >
            <XCircle className='w-3 h-3 mr-1' />
            Erro
          </Badge>
        );
      case 'warning':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          >
            <AlertTriangle className='w-3 h-3 mr-1' />
            Aviso
          </Badge>
        );
      case 'info':
        return (
          <Badge
            variant='default'
            className='bg-blue-100 text-blue-800 hover:bg-blue-200'
          >
            <Info className='w-3 h-3 mr-1' />
            Info
          </Badge>
        );
      default:
        return (
          <Badge variant='outline'>
            <Info className='w-3 h-3 mr-1' />
            {severity}
          </Badge>
        );
    }
  };

  // Função para obter ícone do tipo de evento
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'user_login':
        return <User className='w-4 h-4' />;
      case 'role_created':
      case 'role_updated':
      case 'role_deleted':
        return <Shield className='w-4 h-4' />;
      case 'permission_denied':
        return <AlertTriangle className='w-4 h-4' />;
      case 'system_error':
        return <Database className='w-4 h-4' />;
      case 'data_export':
        return <Download className='w-4 h-4' />;
      default:
        return <Activity className='w-4 h-4' />;
    }
  };

  // Função para formatar data e hora
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Função para formatar data relativa
  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <div className='min-h-screen bg-transparent'>
      {/* Header */}
      <div className='relative bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-b border-blue-100/50 rounded-t-2xl'>
        <div className='absolute inset-0 bg-blue-100/80'></div>
        <div className='relative px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate('/admin')}
                className='text-slate-700 hover:text-slate-900 hover:bg-white/60 mb-2'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Voltar
              </Button>
              <h1 className='text-2xl font-bold text-slate-900'>
                Logs de Auditoria
              </h1>
              <p className='text-slate-600 mt-1'>
                Monitore todas as atividades do sistema
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                className='text-slate-700 hover:text-slate-900 hover:bg-white/60'
              >
                <RefreshCw className='w-4 h-4 mr-2' />
                Atualizar
              </Button>
              <Button
                onClick={() => {
                  /* Implementar export */
                }}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                <Download className='w-4 h-4 mr-2' />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='p-6 space-y-6'>
        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {processedStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className='border border-gray-200 shadow-sm hover:shadow-md transition-shadow'
              >
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        {stat.title}
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {stat.value}
                      </p>
                      <div className='flex items-center mt-1'>
                        <span className='text-xs font-medium text-gray-600'>
                          Estatísticas do sistema
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filtros */}
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <Filter className='w-5 h-5 text-blue-600' />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                  <Input
                    placeholder='Buscar logs...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant={filterType === 'all' ? 'contained' : 'outline'}
                  size='sm'
                  onClick={() => setFilterType('all')}
                  className={`${
                    filterType === 'all'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Todos
                </Button>
                <Button
                  variant={
                    filterType === 'user_login' ? 'contained' : 'outline'
                  }
                  size='sm'
                  onClick={() => setFilterType('user_login')}
                  className={`${
                    filterType === 'user_login'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Logins
                </Button>
                <Button
                  variant={
                    filterType === 'role_created' ? 'contained' : 'outline'
                  }
                  size='sm'
                  onClick={() => setFilterType('role_created')}
                  className={`${
                    filterType === 'role_created'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Roles
                </Button>
                <Button
                  variant={
                    filterType === 'system_error' ? 'contained' : 'outline'
                  }
                  size='sm'
                  onClick={() => setFilterType('system_error')}
                  className={`${
                    filterType === 'system_error'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Erros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Logs */}
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <Activity className='w-5 h-5 text-blue-600' />
              Logs de Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            {auditLogs.length === 0 ? (
              <div className='text-center py-12'>
                <Activity className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Nenhum log encontrado
                </h3>
                <p className='text-gray-500 mb-4'>
                  {searchTerm || filterType !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Os logs de auditoria aparecerão aqui quando houver atividade.'}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant='outline'
                  className='text-gray-700 hover:bg-gray-50'
                >
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Atualizar
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className='group border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start space-x-3'>
                        <div className='flex-shrink-0'>
                          <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                            {getEventIcon(log.type)}
                          </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3 className='text-sm font-medium text-gray-900'>
                              {log.title}
                            </h3>
                            {getSeverityBadge(log.severity)}
                          </div>
                          <p className='text-sm text-gray-600 mb-2'>
                            {log.description}
                          </p>
                          <div className='flex items-center gap-4 text-xs text-gray-500'>
                            <span className='flex items-center gap-1'>
                              <User className='w-3 h-3' />
                              {log.user}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Clock className='w-3 h-3' />
                              {formatRelativeTime(log.timestamp)}
                            </span>
                            {log.ip && (
                              <span className='flex items-center gap-1'>
                                <ExternalLink className='w-3 h-3' />
                                {log.ip}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-500'>
                          {formatDateTime(log.timestamp)}
                        </span>
                        <Button
                          variant='outline'
                          size='sm'
                          className='opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <Eye className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <Copy className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
