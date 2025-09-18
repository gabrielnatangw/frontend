import {
  Plus,
  Check,
  Pencil,
  Trash2,
  Loader2,
  Building2,
  AlertCircle,
  Activity,
  Thermometer,
  Gauge as GaugeIcon,
} from 'lucide-react';
import React from 'react';
import Container from '../../components/ui/container';
import ButtonIcon from '../../components/ui/button-icon';
import DashboardGrid from '../../components/dashboard-grid';
import Gauge from '../../components/gauge';
import CardCreator from '../../components/card-creator';
import Tabs from '../../components/ui/tabs';
import Stepper from '../../components/ui/stepper';
import ChartTypePreview from '../../components/charts/preview';
import PtraceLayout from '../../components/layout/PtraceLayout';
import { useModules } from '../../lib/hooks/use-modules';
import { useSensors } from '../../lib/hooks/use-sensors';
import { useMeasurementUnits } from '../../lib/hooks/use-measurement-units';
import OnOffIndicator from '../../components/onoff-indicator';
import StepChart from '../../components/stepchart';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { Module } from '../../types/module';
import type { Sensor } from '../../types/sensor';

// Imports para Views
import {
  useMyViews,
  useCreateView,
  useUpdateView,
  useDeleteView,
} from '../../lib/hooks/use-views';
import { useAddCard, useRemoveCard } from '../../lib/hooks/use-view-cards';
import { useUpdateCardPositions } from '../../lib/hooks/use-card-creator';
import { useQueryClient } from '@tanstack/react-query';
// import { StatusCard } from '../../components/ui/status-card';
// import {
//   HistoricalLineChart,
//   HistoricalBarChart,
// } from '../../components/charts/historical-charts';
import { StepChartRecharts } from '../../components/charts/step-chart-recharts';
import {
  // StatusIndicator,
  SensorStatus,
  SensorType,
} from '../../components/ui/status-indicator';
import type { ChartType } from '../../types/view';
import { io, Socket } from 'socket.io-client';
import { debug } from '../../lib/utils/debug';

// Tipos para dados de sensores em tempo real
type SensorDatum = {
  sensorId: string;
  value: number | boolean;
  status: number; // 0=normal,10=atenção,20=crítico
  type: number; // 1=digital,50=analógico,120=temperatura...
  timestamp: string;
  unit?: string;
};

type SensorMap = Record<string, SensorDatum>;

type UseRealtimeSensorsOpts = {
  sensorIds?: string[]; // se vazio, aceita todos
  debug?: boolean;
};

// Função auxiliar para buscar dados de autenticação do localStorage
function getAuthData() {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      return {
        token: authData?.state?.accessToken || '',
        tenantId: authData?.state?.user?.tenantId || '',
        user: authData?.state?.user || null,
      };
    }
  } catch (error) {
    console.error('Erro ao parsear auth-storage:', error);
  }

  // Fallback para busca direta
  return {
    token: localStorage.getItem('accessToken') || '',
    tenantId: localStorage.getItem('tenantId') || '',
    user: null,
  };
}

// Hook simplificado para conectar com WebSocket
function useRealtimeSensors(opts: UseRealtimeSensorsOpts = {}) {
  const { sensorIds = [], debug = false } = opts;

  const [isConnected, setIsConnected] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sensorData, setSensorData] = React.useState<SensorMap>({});
  const [sensorHistory, setSensorHistory] = React.useState<
    Record<string, Array<{ timestamp: number; value: number; status: number }>>
  >({});

  const socketRef = React.useRef<Socket | null>(null);

  // --- Conexão Socket.IO Simplificada ---
  React.useEffect(() => {
    // Buscar dados de autenticação
    const { token, tenantId } = getAuthData();

    // URL do socket - fixa para desenvolvimento, variável para produção
    const socketUrl = "https://smart-platform.io:8443/api-v2/socket.io"
    console.log(
      '🧪 Testando conexão com socket.io + autenticação...\n',
      'URL:',
      socketUrl,
      '\nToken:',
      token ? `${token.substring(0, 10)}...` : 'NENHUM',
      '\nTenant ID:',
      tenantId
    );

    if (!token) {
      setError('Token JWT não encontrado no localStorage (auth-storage)');
      return;
    }

    if (!tenantId) {
      setError('Tenant ID não encontrado no localStorage (auth-storage)');
      return;
    }

    // Teste de conectividade básica
    console.log('🔍 Testando conectividade básica...');
    fetch(`${socketUrl.replace('/socket.io', '')}/health`, { 
      method: 'GET',
      mode: 'cors'
    })
    .then(response => {
      console.log('✅ Servidor acessível:', response.status);
    })
    .catch(error => {
      console.warn('⚠️ Servidor pode estar inacessível:', error.message);
    });

    // Função para anexar listeners em um socket
    const attachListeners = (sock: Socket, usedNamespace: boolean) => {
      sock.on('connect', () => {
        console.log(
          '✅ Conectado ao',
          usedNamespace ? `${socketUrl}/sensor` : socketUrl,
          '! ID:',
          sock.id
        );
        if (usedNamespace) console.log('🔔 Namespace:', '/sensor');
        console.log('📡 Inscrito no tópico MQTT: gw/br_scs/#');

        setIsConnected(true);
        setError(null);

        // Enviar comando de inscrição no tópico
        sock.emit('subscribe', {
          topic: 'gw/br_scs/#',
          qos: 1,
        });

        console.log('📤 Comando de inscrição enviado...\n');
      });

      sock.on('disconnect', reason => {
        console.log('❌ Desconectado:', reason);
        setIsConnected(false);
      });

      sock.on('message', data => {
        console.log('📨 Mensagem MQTT recebida:');
        console.log('   Tópico:', data.topic);
        console.log('   Payload:', data.payload);
        console.log('   Timestamp:', new Date().toISOString());
        console.log('   QoS:', data.qos);
        console.log('---');
      });

      sock.on('sensor-data', data => {
        // Mantido abaixo
      });
    };

    // Opções padrão da conexão
    const socketOptions = {
      transports: ['polling'] as string[], // Começar apenas com polling para evitar problemas de WebSocket
      autoConnect: true,
      timeout: 15000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
      auth: {
        token,
        tenantId,
      },
      extraHeaders: {
        'X-Tenant-ID': tenantId,
      },
      forceNew: true, // Forçar nova conexão
    };

    // Tentar conectar primeiro com namespace /sensor; se falhar, tentar sem namespace
    let fallbackAttempted = false;
    let s: Socket = io(`${socketUrl}/sensor`, socketOptions);

    console.log('🔧 Conectando ao socket:', s);
    socketRef.current = s;

    attachListeners(s, true);

    s.on('connect_error', error => {
      console.error('❌ Erro de conexão:', error?.message);
      console.error('❌ Detalhes do erro:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      });
      
      if (!fallbackAttempted) {
        fallbackAttempted = true;
        console.warn('⚠️ Falha ao conectar com namespace /sensor. Tentando sem namespace...');
        try {
          s.disconnect();
        } catch {}
        const baseSocket = io(socketUrl, socketOptions);
        socketRef.current = baseSocket;
        attachListeners(baseSocket, false);

        // Reencaminhar eventos específicos para o handler abaixo
        baseSocket.on('sensor-data', data => {
          // Mantido abaixo
        });
      } else {
        setIsConnected(false);
        setError(`Erro de conexão: ${error?.message || 'Desconhecido'}`);
      }
    });

    // Escutar dados de sensores (formato específico)
    const handleSensorData = (data: any) => {
      console.log('📊 Dados de sensor recebidos:');
      console.log('   Dados:', JSON.stringify(data, null, 2));
      console.log('   Timestamp:', new Date().toISOString());
      console.log('---');

      // Processar dados MQTT relay
      if (data && data.payload) {
        try {
          const payload = JSON.parse(data.payload);
          console.log('🔍 Payload parseado:', payload);

          // Formato MQTT: ["tenantId", [v,s,t,"id"], [v,s,t,"id"], ...]
          if (Array.isArray(payload) && payload.length > 1) {
            const tenantId = payload[0];
            console.log('🏢 Tenant ID:', tenantId);

            const sensorMap: SensorMap = {};

            // Processar cada leitura de sensor
            for (let i = 1; i < payload.length; i++) {
              const reading = payload[i];
              if (Array.isArray(reading) && reading.length >= 4) {
                const [value, status, type, id] = reading;
                const sensorId = String(id);

                // Usar valores originais da API sem formatação
                const numericValue = value;
                const numericStatus = status;

                sensorMap[sensorId] = {
                  sensorId,
                  value: numericValue,
                  status: numericStatus,
                  type: type,
                  timestamp: data.timestamp || new Date().toISOString(),
                };

                console.log(`📡 Sensor ${sensorId}:`, {
                  value: numericValue,
                  status: numericStatus,
                  type: type,
                });
              }
            }

            // Atualizar estado com os dados processados
            setSensorData(prev => ({ ...prev, ...sensorMap }));

            // Atualizar histórico
            setSensorHistory(prev => {
              const newHistory = { ...prev };
              Object.entries(sensorMap).forEach(([sensorId, sensor]) => {
                if (!newHistory[sensorId]) {
                  newHistory[sensorId] = [];
                }

                // Usar timestamp real dos dados MQTT, não Date.now()
                const realTimestamp =
                  data.timestamp || new Date().toISOString();

                // Converter boolean para número: true = 1, false = 0
                const numericValue =
                  typeof sensor.value === 'boolean'
                    ? sensor.value
                      ? 1
                      : 0
                    : typeof sensor.value === 'number'
                      ? sensor.value
                      : 0;

                const historyPoint = {
                  timestamp: realTimestamp,
                  value: numericValue, // Usar valor convertido
                  status: sensor.status,
                };

                // Debug: Log de cada ponto adicionado ao histórico
                console.log(
                  `🔍 WEBSOCKET - ADICIONANDO AO HISTÓRICO (${sensorId}):`,
                  {
                    sensorId: sensorId,
                    sensorData: sensor,
                    originalValue: sensor.value,
                    convertedValue: numericValue,
                    valueType: typeof sensor.value,
                    historyPoint: historyPoint,
                    realTimestamp: realTimestamp,
                    dataTimestamp: data.timestamp,
                    currentHistoryLength: newHistory[sensorId].length,
                  }
                );

                newHistory[sensorId].push(historyPoint);

                // Manter apenas os últimos 50 pontos
                if (newHistory[sensorId].length > 50) {
                  newHistory[sensorId] = newHistory[sensorId].slice(-50);
                }

                // Debug: Log do histórico após adicionar o ponto
                console.log(
                  `📊 WEBSOCKET - HISTÓRICO ATUALIZADO (${sensorId}):`,
                  {
                    sensorId: sensorId,
                    newLength: newHistory[sensorId].length,
                    lastPoints: newHistory[sensorId].slice(-3), // Últimos 3 pontos
                    allValues: newHistory[sensorId].map(p => p.value),
                    allStatuses: newHistory[sensorId].map(p => p.status),
                  }
                );
              });

              return newHistory;
            });

            console.log('✅ Dados processados e salvos no estado');
          }
        } catch (error) {
          console.error('❌ Erro ao processar payload:', error);
        }
      }
    };

    s.on('sensor-data', handleSensorData);

    // Escutar qualquer evento
    s.onAny((eventName, ...args) => {
      if (
        eventName !== 'connect' &&
        eventName !== 'disconnect' &&
        eventName !== 'connect_error'
      ) {
        console.log(`🔔 Evento recebido: ${eventName}`);
        console.log('   Argumentos:', args);
        console.log('---');
      }
    });

    return () => {
      try {
        s.disconnect();
      } catch {}
      socketRef.current = null;
    };
  }, [sensorIds, debug]);

  // Calcular estatísticas dos sensores
  const stats = React.useMemo(() => {
    const sensors = Object.values(sensorData);
    const criticalAlerts = sensors.filter(s => s.status === 20).length;
    const warningAlerts = sensors.filter(s => s.status === 10).length;

    return {
      totalSensors: sensors.length,
      criticalAlerts,
      warningAlerts,
    };
  }, [sensorData]);

  // Gerar alertas baseados nos dados
  const alerts = React.useMemo(() => {
    const alertList: any[] = [];
    Object.values(sensorData).forEach(sensor => {
      if (sensor.status === 20) {
        alertList.push({
          id: `critical-${sensor.sensorId}-${sensor.timestamp}`,
          sensorId: sensor.sensorId,
          type: 'critical',
          message: `Sensor ${sensor.sensorId} em estado crítico: ${sensor.value}`,
          timestamp: sensor.timestamp,
        });
      } else if (sensor.status === 10) {
        alertList.push({
          id: `warning-${sensor.sensorId}-${sensor.timestamp}`,
          sensorId: sensor.sensorId,
          type: 'warning',
          message: `Sensor ${sensor.sensorId} em estado de atenção: ${sensor.value}`,
          timestamp: sensor.timestamp,
        });
      }
    });
    return alertList;
  }, [sensorData]);

  return {
    isConnected,
    error,
    sensorData,
    sensorHistory,
    stats,
    alerts,
  };
}

export default function PtracePage() {
  // Hooks para Views
  const { data: viewsData, isLoading: viewsLoading } = useMyViews();

  // Hooks para Cards
  const addCardMutation = useAddCard();
  const removeCardMutation = useRemoveCard();
  const updateCardPositionsMutation = useUpdateCardPositions();
  const queryClient = useQueryClient();

  const createViewMutation = useCreateView();
  const updateViewMutation = useUpdateView();
  const deleteViewMutation = useDeleteView();

  // Estado local
  const [selectedViewId, setSelectedViewId] = React.useState<string>('');
  const [manageOpen, setManageOpen] = React.useState(false);
  const [newViewName, setNewViewName] = React.useState('');
  const [hasTriedToSubmit, setHasTriedToSubmit] = React.useState(false);
  const [editing, setEditing] = React.useState<{
    id: string | null;
    value: string;
  }>(() => ({ id: null, value: '' }));
  const [gridLoading, setGridLoading] = React.useState(false);
  const [showSpinner, setShowSpinner] = React.useState(false);
  const spinnerMinUntilRef = React.useRef<number | null>(null);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // View selecionada e seus cards - com validação robusta
  const selectedView = React.useMemo(() => {
    // A API retorna data como array direto, não data.views
    const views = viewsData?.data;
    if (!views || !Array.isArray(views) || !selectedViewId) return null;
    return views.find(v => v.id === selectedViewId) || null;
  }, [viewsData?.data, selectedViewId]);

  const cards = React.useMemo(() => {
    if (!selectedView?.cards) return [];
    return Array.isArray(selectedView.cards) ? selectedView.cards : [];
  }, [selectedView?.cards]);

  // Debug removido - não essencial para a feature

  // Dados em tempo real dos sensores - com validação
  const sensorIds = React.useMemo(() => {
    if (!cards || cards.length === 0) return [];
    return cards
      .filter((card: any) => card && card.sensorId)
      .map((card: any) => card.sensorId);
  }, [cards]);

  // Hook para dados reais dos sensores via WebSocket
  const realtimeState = useRealtimeSensors({
    sensorIds,
    debug: debug.isDebugEnabled(),
  });

  // Manter compatibilidade com código existente
  const realtimeSensorData = realtimeState.sensorData;
  const realtimeSensorHistory = realtimeState.sensorHistory;
  const wsConnected = realtimeState.isConnected;
  const parserState = {
    sensorData: realtimeState.sensorData,
    isConnected: realtimeState.isConnected,
    stats: realtimeState.stats,
    alerts: realtimeState.alerts,
  };
  // const parserActions = realtimeState.actions;

  // Add Sensor Modal state
  const [addOpen, setAddOpen] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0); // 0: módulo, 1: sensor, 2: gráfico
  const [selectedModule, setSelectedModule] = React.useState<string | null>(
    null
  );

  // Debug: Log quando o modal é aberto/fechado
  React.useEffect(() => {
    console.log('🔧 Modal addOpen mudou para:', addOpen);
  }, [addOpen]);

  // Debug: Log quando stepIndex muda
  React.useEffect(() => {
    console.log('🔧 stepIndex mudou para:', stepIndex);
  }, [stepIndex]);

  // Debug: Log quando selectedModule muda
  React.useEffect(() => {
    console.log('🔧 selectedModule mudou para:', selectedModule);
  }, [selectedModule]);

  // Edit Card Modal state
  const [editCardOpen, setEditCardOpen] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<any>(null);

  // Estado para modo de edição
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [pendingLayoutChanges, setPendingLayoutChanges] = React.useState<any[]>(
    []
  );

  // Função para salvar alterações pendentes
  const savePendingChanges = React.useCallback(async () => {
    if (pendingLayoutChanges.length === 0) {
      setIsEditMode(false);
      return;
    }

    try {
      // Usar o hook correto para atualizar posições dos cards
      const cardsData = pendingLayoutChanges.map(layout => ({
        id: layout.i,
        positionX: layout.x,
        positionY: layout.y,
        width: layout.w,
        height: layout.h,
      }));

      await updateCardPositionsMutation.mutateAsync({
        viewId: selectedViewId,
        cards: cardsData,
      });

      // Sair do modo de edição e limpar alterações pendentes
      setIsEditMode(false);
      setPendingLayoutChanges([]);
    } catch (e: unknown) {
      console.error('❌ Falha ao salvar alterações:', e);
      // O hook useUpdateCardPositions já trata as notificações de erro
    }
  }, [pendingLayoutChanges, updateCardPositionsMutation, selectedViewId]);

  // Função para alternar modo de edição
  const handleEditModeToggle = React.useCallback(() => {
    if (isEditMode) {
      // Salvar alterações pendentes
      savePendingChanges();
    } else {
      // Entrar no modo de edição
      setIsEditMode(true);
      setPendingLayoutChanges([]);
    }
  }, [isEditMode, savePendingChanges]);

  // Função para capturar mudanças de layout durante edição
  const handleLayoutChange = React.useCallback(
    (layout: any[]) => {
      if (isEditMode) {
        setPendingLayoutChanges(layout);
      }
    },
    [isEditMode]
  );
  const [selectedSensor, setSelectedSensor] = React.useState<string | null>(
    null
  );
  const [selectedChart, setSelectedChart] = React.useState<string | null>(null);

  // Debug: Log quando selectedSensor muda
  React.useEffect(() => {
    console.log('🔧 selectedSensor mudou para:', selectedSensor);
  }, [selectedSensor]);

  // Debug: Log quando selectedChart muda
  React.useEffect(() => {
    console.log('🔧 selectedChart mudou para:', selectedChart);
  }, [selectedChart]);

  // Debug: Log quando selectedViewId muda
  React.useEffect(() => {
    console.log('🔧 selectedViewId mudou para:', selectedViewId);
  }, [selectedViewId]);

  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(
    null
  );

  // Buscar módulos da API
  const {
    data: modulesData,
    isLoading: modulesLoading,
    error: modulesError,
  } = useModules({
    limit: 100, // Buscar mais módulos para o modal
    isDeleted: false, // Apenas módulos ativos
  });

  // Buscar sensores do módulo selecionado
  const {
    data: sensorsData,
    isLoading: sensorsLoading,
    error: sensorsError,
  } = useSensors({
    moduleId: selectedModule || undefined,
    limit: 100,
    isDeleted: false,
  });

  // Buscar unidades de medida
  const { data: measurementUnitsData } = useMeasurementUnits({
    limit: 100,
    isDeleted: false,
  });

  const measurementUnits = React.useMemo(
    () => measurementUnitsData?.data?.measurementUnits || [],
    [measurementUnitsData?.data?.measurementUnits]
  );

  // Selecionar primeira view automaticamente - com validação
  React.useEffect(() => {
    // A API retorna data como array direto, não data.views
    const views = viewsData?.data;
    console.log('🔍 Verificando views para seleção automática:', {
      views,
      viewsLength: views?.length,
      selectedViewId,
      hasSelectedViewId: !!selectedViewId,
    });

    if (views && Array.isArray(views) && views.length > 0 && !selectedViewId) {
      // Selecionar a primeira view disponível (mesmo sem cards)
      if (views[0]?.id) {
        console.log('🎯 Selecionando primeira view:', views[0]);
        setSelectedViewId(views[0].id);
      }
    }
  }, [viewsData?.data, selectedViewId]);

  // Debug: Log do estado das views e cards
  React.useEffect(() => {
    debug.view('Estado das Views', {
      viewsLoading,
      viewsData: viewsData?.data,
      selectedViewId,
      selectedView,
      cards: cards,
      cardsLength: cards.length,
    });

    // Log detalhado da view selecionada
    if (selectedView) {
      debug.view('View selecionada detalhada', {
        id: selectedView.id,
        name: selectedView.name,
        cards: selectedView.cards,
        cardsLength: selectedView.cards?.length || 0,
        cardsArray: Array.isArray(selectedView.cards)
          ? selectedView.cards
          : 'NÃO É ARRAY',
      });
    }
  }, [viewsLoading, viewsData, selectedViewId, selectedView, cards]);

  // Teste manual da API para debug - removido para limpeza de código
  // React.useEffect(() => {
  //   const testApi = async () => {
  //     // Testar API de views para ver se está retornando cards
  //     if (selectedViewId) {
  //       try {
  //         const response = await fetch(`/api/views/${selectedViewId}`);
  //         const data = await response.json();
  //         debug.api('API View Response', data);
  //       } catch (error) {
  //         debug.error('Erro ao testar API de view', error);
  //       }
  //     }
  //     // Executar teste apenas uma vez
  //     if (viewsData && !viewsLoading) {
  //       testApi();
  //     }
  //   };
  // }, [viewsData, viewsLoading, selectedViewId]);

  // Spinner policy: show immediately when loading starts; keep visible for at least 1s
  React.useEffect(() => {
    if (gridLoading) {
      // Clear any pending hide
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setShowSpinner(true);
      spinnerMinUntilRef.current = Date.now() + 1000;
    } else {
      const minUntil = spinnerMinUntilRef.current ?? 0;
      const remaining = Math.max(0, minUntil - Date.now());
      if (remaining > 0) {
        hideTimerRef.current = setTimeout(() => {
          setShowSpinner(false);
          hideTimerRef.current = null;
          spinnerMinUntilRef.current = null;
        }, remaining);
      } else {
        setShowSpinner(false);
        spinnerMinUntilRef.current = null;
      }
    }
    return () => {
      // cleanup when component unmounts or gridLoading changes
      // (we do not clear minUntil to preserve min visibility across quick toggles)
    };
  }, [gridLoading]);

  const addView = async () => {
    const name = newViewName.trim();

    // Marcar que o usuário tentou submeter
    setHasTriedToSubmit(true);

    // Validar se o nome não está vazio
    if (!name) {
      // Usar o sistema de notificações em vez de alert
      console.error('Nome da visão não pode estar vazio');
      return;
    }

    try {
      const newView = await createViewMutation.mutateAsync({
        name,
        description: `Visão criada em ${new Date().toLocaleDateString('pt-BR')}`,
        isPublic: false,
        permission: 'WRITE' as const,
      });

      setNewViewName('');
      setHasTriedToSubmit(false);

      // Aguardar um pouco para garantir que os dados foram atualizados
      setTimeout(() => {
        setSelectedViewId(newView.data.id);
      }, 100);
    } catch (error) {
      console.error('Erro ao criar view:', error);
    }
  };

  const startEdit = (id: string, current: string) =>
    setEditing({ id, value: current });

  const commitEdit = async () => {
    if (!editing.id) return;
    const name = editing.value.trim();

    try {
      await updateViewMutation.mutateAsync({
        id: editing.id,
        data: { name },
      });
      setEditing({ id: null, value: '' });
    } catch (error) {
      console.error('Erro ao atualizar view:', error);
    }
  };

  const deleteView = async (id: string) => {
    try {
      await deleteViewMutation.mutateAsync(id);

      // Aguardar um pouco para garantir que os dados foram atualizados
      setTimeout(() => {
        if (selectedViewId === id) {
          const views = viewsData?.data;
          const remainingViews = Array.isArray(views)
            ? views.filter(v => v.id !== id)
            : [];
          setSelectedViewId(remainingViews[0]?.id || '');
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao deletar view:', error);
    }
  };

  // Processar sensores da API
  const sensors: Sensor[] = React.useMemo(() => {
    if (!sensorsData?.data?.sensors) return [];
    const sensorList = sensorsData.data.sensors;
    console.log('📊 Sensores carregados:', {
      total: sensorList.length,
      sensors: sensorList.map(s => ({
        id: s.id,
        name: s.name,
        sensorType: s.sensorType,
      })),
    });
    return sensorList;
  }, [sensorsData]);

  // Função para determinar status do sensor
  const getSensorStatus = React.useCallback(
    (sensorId: string): SensorStatus => {
      const data = parserState.sensorData[sensorId];
      if (!data) return 'offline';

      const status = data.status;
      if (status === 0) return 'normal';
      if (status === 10) return 'warning';
      if (status === 20) return 'critical';

      // Para status diferentes dos padrões, verificar se está dentro dos limites de alarme
      const sensorInfo = sensors.find(s => s.id === sensorId);
      if (
        sensorInfo &&
        sensorInfo.minAlarm !== undefined &&
        sensorInfo.maxAlarm !== undefined
      ) {
        const value = typeof data.value === 'number' ? data.value : 0;
        if (value < sensorInfo.minAlarm || value > sensorInfo.maxAlarm) {
          return 'critical';
        }
        // Verificar se está próximo dos limites (10% de tolerância)
        const range = sensorInfo.maxAlarm - sensorInfo.minAlarm;
        const tolerance = range * 0.1;
        if (
          value < sensorInfo.minAlarm + tolerance ||
          value > sensorInfo.maxAlarm - tolerance
        ) {
          return 'warning';
        }
        return 'normal';
      }

      return 'normal'; // Assumir normal para status desconhecidos
    },
    [parserState.sensorData, sensors]
  );

  // Função para determinar tipo do sensor
  const getSensorType = React.useCallback(
    (sensorId: string): SensorType => {
      const sensor = realtimeSensorData[sensorId];
      if (!sensor) return 'analog';

      // type 1 = digital, outros = analog
      return sensor.type === 1 ? 'digital' : 'analog';
    },
    [realtimeSensorData]
  );

  // Função para renderizar conteúdo do gráfico
  const renderChartContent = React.useCallback(
    (card: any, value: number, _status: SensorStatus, _type: SensorType) => {
      switch (card.chartType) {
        case 'GAUGE': {
          // Buscar dados do sensor na lista de sensores
          const sensorInfo = sensors.find(s => s.id === card.sensorId);
          if (!sensorInfo) {
            return (
              <div className='flex items-center justify-center h-full text-gray-500'>
                Sensor não encontrado
              </div>
            );
          }

          // Dados em tempo real
          const sensorData = realtimeSensorData[card.sensorId];
          if (!sensorData) {
            return (
              <div className='flex items-center justify-center h-full text-gray-500'>
                Dados não disponíveis
              </div>
            );
          }

          // Configurações do sensor
          const minScale = sensorInfo.minScale ?? 0;
          const maxScale = sensorInfo.maxScale ?? 100;
          const minAlarm = sensorInfo.minAlarm;
          const maxAlarm = sensorInfo.maxAlarm;
          const sensorName = sensorInfo.name ?? card.sensor?.name ?? 'Sensor';

          // Unidade de medida
          const measurementUnitId = sensorInfo.measurementUnitId;
          const sensorUnit = measurementUnitId
            ? measurementUnits?.find(u => u.id === measurementUnitId)
                ?.unitSymbol || ''
            : (card.sensor?.unit ?? '');

          // Valor e status - usar valor original da API sem formatação
          const rawValue = sensorData.value;

          // Usar exatamente os valores min/max que vêm da API do sensor
          // Sem adaptação dinâmica - respeitar os limites definidos
          const clampedValue = Math.max(
            minScale,
            Math.min(maxScale, rawValue as number)
          );
          const sensorStatus = getSensorStatus(card.sensorId) as
            | 'normal'
            | 'warning'
            | 'critical'
            | 'offline';

          // Debug: Log dos dados do gauge (apenas quando necessário)
          if (debug.isDebugEnabled()) {
            debug.sensor('Gauge Debug', {
              cardId: card.id,
              sensorId: card.sensorId,
              value: rawValue,
              status: sensorStatus,
              sensorInfo,
              minScale,
              maxScale,
              sensorName,
              sensorUnit,
              measurementUnitId,
              measurementUnits: measurementUnits.length,
              realtimeData: realtimeSensorData[card.sensorId],
              clampedValue,
              percentage:
                Math.round(
                  ((clampedValue - minScale) / (maxScale - minScale)) * 100
                ) + '%',
            });
          }

          return (
            <Gauge
              value={rawValue as number}
              min={minScale}
              max={maxScale}
              alarmMin={minAlarm}
              alarmMax={maxAlarm}
              label={sensorName}
              unit={sensorUnit}
              responsive
              className='w-full h-full'
            />
          );
        }

        case 'STEP': {
          // Usar dados históricos reais do WebSocket
          const history = realtimeSensorHistory[card.sensorId] || [];

          // Debug detalhado: Log completo dos dados históricos
          console.log('🔍 STEP CHART - DADOS HISTÓRICOS COMPLETOS:', {
            sensorId: card.sensorId,
            historyLength: history.length,
            history: history, // TODOS os dados, não apenas os últimos 5
            realtimeSensorHistory: realtimeSensorHistory, // Estado completo
          });

          // Debug: Verificar dados em tempo real também
          const currentSensorData = realtimeSensorData[card.sensorId];
          console.log('🔍 STEP CHART - DADOS ATUAIS DO SENSOR:', {
            sensorId: card.sensorId,
            currentData: currentSensorData,
            hasCurrentData: !!currentSensorData,
          });

          // Verificar se há dados históricos
          if (history.length === 0) {
            console.log('⚠️ STEP CHART - NENHUM DADO HISTÓRICO ENCONTRADO');
            return (
              <div className='flex items-center justify-center h-full text-gray-500'>
                <div className='text-center'>
                  <div className='text-sm font-medium'>Aguardando dados...</div>
                  <div className='text-xs text-gray-400 mt-1'>
                    Os dados aparecerão aqui quando disponíveis
                  </div>
                </div>
              </div>
            );
          }

          // Processar dados históricos com debug detalhado
          const stepData = history.map((point, index) => {
            // Usar timestamp real dos dados, não Date.now()
            const timestamp = point.timestamp;
            const date = new Date(timestamp);

            // Converter boolean para número: true = 1, false = 0
            const numericValue =
              typeof point.value === 'boolean'
                ? point.value
                  ? 1
                  : 0
                : typeof point.value === 'number'
                  ? point.value
                  : 0;

            const processedPoint = {
              x: date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
              y: numericValue, // Usar valor convertido
              status: point.status,
              timestamp: timestamp,
              index: index,
              originalValue: point.value, // Manter valor original para debug
              originalStatus: point.status, // Manter status original para debug
            };

            // Debug individual de cada ponto
            console.log(`🔍 STEP CHART - PONTO ${index + 1}:`, {
              original: point,
              processed: processedPoint,
              timestamp: timestamp,
              date: date.toISOString(),
              originalValue: point.value,
              convertedValue: numericValue,
              valueType: typeof point.value,
              status: point.status,
            });

            return processedPoint;
          });

          // Debug: Log dos dados processados com mais detalhes
          console.log('📊 STEP CHART - DADOS PROCESSADOS COMPLETOS:', {
            sensorId: card.sensorId,
            stepDataLength: stepData.length,
            stepData: stepData, // TODOS os dados processados
            values: stepData.map(p => p.y), // Apenas os valores
            timestamps: stepData.map(p => p.timestamp), // Apenas os timestamps
            statuses: stepData.map(p => p.status), // Apenas os status
          });

          // Debug: Verificar se os valores estão mudando
          const uniqueValues = [...new Set(stepData.map(p => p.y))];
          const uniqueStatuses = [...new Set(stepData.map(p => p.status))];
          console.log('🔍 STEP CHART - ANÁLISE DE VALORES:', {
            uniqueValues: uniqueValues,
            uniqueStatuses: uniqueStatuses,
            hasValueChanges: uniqueValues.length > 1,
            hasStatusChanges: uniqueStatuses.length > 1,
            valueRange:
              uniqueValues.length > 0
                ? `${Math.min(...uniqueValues)} - ${Math.max(...uniqueValues)}`
                : 'N/A',
          });

          return (
            <div className='w-full h-full flex flex-col'>
              <StepChartRecharts
                data={stepData}
                title={card.sensor?.name || 'Sensor'}
                unit={card.sensor?.unit}
                height={200}
                className='flex-1'
              />
            </div>
          );
        }

        case 'LINE': {
          // Buscar dados do sensor na lista de sensores
          const sensorInfo = sensors.find(s => s.id === card.sensorId);
          if (!sensorInfo) {
            return (
              <div className='flex items-center justify-center h-full text-gray-500'>
                Sensor não encontrado
              </div>
            );
          }

          // Configurações do sensor
          const minScale = sensorInfo.minScale ?? 0;
          const maxScale = sensorInfo.maxScale ?? 100;
          const minAlarm = sensorInfo.minAlarm;
          const maxAlarm = sensorInfo.maxAlarm;

          // Usar dados históricos reais do WebSocket
          const lineHistory = realtimeSensorHistory[card.sensorId] || [];

          // Usar dados históricos originais sem filtro de duplicatas
          // (sensores podem ter valores iguais em momentos diferentes)
          const uniqueLineHistory = lineHistory;

          // Debug: Log removido para evitar spam no console
          // console.log('🔍 LINE CHART - FILTRO DE DUPLICATAS:', {
          //   originalLength: lineHistory.length,
          //   uniqueLength: uniqueLineHistory.length,
          //   duplicatesRemoved: lineHistory.length - uniqueLineHistory.length,
          // });

          // Se não há dados históricos, mostrar mensagem informativa
          if (uniqueLineHistory.length === 0) {
            return (
              <div className='flex items-center justify-center h-full text-gray-500'>
                <div className='text-center'>
                  <div className='text-sm font-medium'>Aguardando dados...</div>
                  <div className='text-xs text-gray-400 mt-1'>
                    Os dados aparecerão aqui quando disponíveis
                  </div>
                </div>
              </div>
            );
          }

          // Processar dados históricos reais - mostrar valores originais da API
          const lineData = uniqueLineHistory.map((point, _index) => {
            return {
              name: new Date(point.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
              value: point.value, // Valor original da API
              timestamp: point.timestamp,
            };
          });

          // Calcular média móvel (janela fixa de 5 pontos)
          const movingAverageData = lineData.map((point, index) => {
            const windowSize = 5;
            const startIndex = Math.max(0, index - windowSize + 1);
            const endIndex = index + 1;

            // Garantir que sempre temos exatamente 5 pontos quando possível
            let window;
            if (index < windowSize - 1) {
              // Para os primeiros pontos, usar todos os pontos disponíveis
              window = lineData.slice(0, endIndex);
            } else {
              // Para pontos subsequentes, usar exatamente 5 pontos
              window = lineData.slice(startIndex, endIndex);
            }

            const average =
              window.reduce((sum, p) => sum + p.value, 0) / window.length;

            return {
              ...point,
              movingAverage: average,
            };
          });

          // Calcular escala do eixo Y baseada nos valores min/max do sensor
          // e nos valores reais dos dados (se ultrapassarem os limites)
          const allValues = movingAverageData.map(d => d.value);
          const allMovingAverages = movingAverageData.map(d => d.movingAverage);
          const allDataValues = [...allValues, ...allMovingAverages];

          // Verificar se há dados válidos
          let finalMin, finalMax;
          if (allDataValues.length === 0) {
            // Se não há dados, usar escala padrão do sensor
            finalMin = minScale;
            finalMax = maxScale;
          } else {
            const dataMin = Math.min(...allDataValues);
            const dataMax = Math.max(...allDataValues);

            // Lógica: Se valor estiver entre min e max da API, usar escala da API
            // Se ultrapassar qualquer limite, usar o valor que ultrapassou como base
            let yAxisMin, yAxisMax;

            if (dataMin >= minScale && dataMax <= maxScale) {
              // Todos os valores estão dentro da escala da API - usar escala da API
              yAxisMin = minScale;
              yAxisMax = maxScale;
            } else {
              // Algum valor ultrapassou os limites - usar valores que ultrapassaram como base
              yAxisMin = dataMin < minScale ? dataMin : minScale;
              yAxisMax = dataMax > maxScale ? dataMax : maxScale;
            }

            // Adicionar uma pequena margem (5% do range) para melhor visualização
            const range = yAxisMax - yAxisMin;
            const margin = range * 0.05;
            finalMin = yAxisMin - margin;
            finalMax = yAxisMax + margin;
          }

          // Debug: Log da escala calculada
          if (debug.isDebugEnabled()) {
            console.log('📊 LINE CHART - Escala calculada:', {
              sensorId: card.sensorId,
              minScale,
              maxScale,
              dataValues: allDataValues,
              dataMin:
                allDataValues.length > 0 ? Math.min(...allDataValues) : 'N/A',
              dataMax:
                allDataValues.length > 0 ? Math.max(...allDataValues) : 'N/A',
              finalMin,
              finalMax,
            });
          }

          return (
            <div className='w-full h-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={movingAverageData}
                  margin={{ top: 10, right: 12, left: 6, bottom: 0 }}
                >
                  <CartesianGrid stroke='#eee' />
                  <XAxis dataKey='name' tick={{ fontSize: 10 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    domain={[finalMin, finalMax]}
                    scale='linear'
                  />
                  <Tooltip
                    cursor={{ stroke: '#e5e7eb' }}
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(2) : value,
                      name === 'value'
                        ? 'Valor'
                        : name === 'movingAverage'
                          ? 'Média Móvel'
                          : name,
                    ]}
                    labelFormatter={label => `Hora: ${label}`}
                  />
                  <Line
                    type='monotone'
                    dataKey='value'
                    stroke='#3b82f6'
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    name='Valor'
                  />
                  <Line
                    type='monotone'
                    dataKey='movingAverage'
                    stroke='#f59e0b'
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    name='Média Móvel'
                  />
                  {/* Linhas de alarme */}
                  {minAlarm !== undefined && (
                    <ReferenceLine
                      y={minAlarm}
                      stroke='#ef4444'
                      strokeWidth={2}
                      strokeDasharray='5 5'
                    />
                  )}
                  {maxAlarm !== undefined && (
                    <ReferenceLine
                      y={maxAlarm}
                      stroke='#ef4444'
                      strokeWidth={2}
                      strokeDasharray='5 5'
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        }

        case 'BAR': {
          // Buscar dados do sensor na lista de sensores
          const sensorInfo = sensors.find(s => s.id === card.sensorId);
          if (!sensorInfo) {
            return (
              <div className='flex items-center justify-center h-full text-gray-500'>
                Sensor não encontrado
              </div>
            );
          }

          // Configurações do sensor
          const minScale = sensorInfo.minScale ?? 0;
          const maxScale = sensorInfo.maxScale ?? 100;

          // Usar dados históricos reais do WebSocket
          const barHistory = realtimeSensorHistory[card.sensorId] || [];

          // Usar dados históricos originais sem filtro de duplicatas
          // (sensores podem ter valores iguais em momentos diferentes)
          const uniqueBarHistory = barHistory;

          // Debug: Log removido para evitar spam no console
          // console.log('🔍 BAR CHART - FILTRO DE DUPLICATAS:', {
          //   originalLength: barHistory.length,
          //   uniqueLength: uniqueBarHistory.length,
          //   duplicatesRemoved: barHistory.length - uniqueBarHistory.length,
          // });

          // Se não há dados históricos, mostrar mensagem informativa
          if (uniqueBarHistory.length === 0) {
            return (
              <div className='flex items-center justify-center h-full text-gray-500'>
                <div className='text-center'>
                  <div className='text-sm font-medium'>Aguardando dados...</div>
                  <div className='text-xs text-gray-400 mt-1'>
                    Os dados aparecerão aqui quando disponíveis
                  </div>
                </div>
              </div>
            );
          }

          // Para gráfico de barras, vamos mostrar valores incrementais em vez de acumulativos
          // Cada barra representa o valor individual do ponto no tempo
          const barData = uniqueBarHistory.map((point, _index) => {
            // Debug: Log removido para evitar spam no console
            // console.log(`📊 Bar ${index + 1} (ÚNICO):`, {
            //   originalValue: point.value,
            //   timestamp: point.timestamp,
            // });
            return {
              name: new Date(point.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
              value: point.value, // Usar valor individual, não acumulado
              timestamp: point.timestamp,
            };
          });

          // Calcular escala do eixo Y para gráfico de barras
          const barValues = barData.map(d => d.value);
          const barDataMin = Math.min(...barValues);
          const barDataMax = Math.max(...barValues);

          // Lógica: Se valor estiver entre min e max da API, usar escala da API
          // Se ultrapassar qualquer limite, usar o valor que ultrapassou como base
          let barYAxisMin, barYAxisMax;

          if (barDataMin >= minScale && barDataMax <= maxScale) {
            // Todos os valores estão dentro da escala da API - usar escala da API
            barYAxisMin = minScale;
            barYAxisMax = maxScale;
          } else {
            // Algum valor ultrapassou os limites - usar valores que ultrapassaram como base
            barYAxisMin = barDataMin < minScale ? barDataMin : minScale;
            barYAxisMax = barDataMax > maxScale ? barDataMax : maxScale;
          }

          // Adicionar uma pequena margem (5% do range) para melhor visualização
          const barRange = barYAxisMax - barYAxisMin;
          const barMargin = barRange * 0.05;
          const barFinalMin = barYAxisMin - barMargin;
          const barFinalMax = barYAxisMax + barMargin;

          return (
            <div className='w-full h-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={barData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis
                    dataKey='name'
                    tick={{ fontSize: 10 }}
                    stroke='#9ca3af'
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke='#9ca3af'
                    domain={[barFinalMin, barFinalMax]}
                    scale='linear'
                  />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    formatter={value => [
                      typeof value === 'number' ? value.toFixed(2) : value,
                      'Valor',
                    ]}
                    labelFormatter={label => `Hora: ${label}`}
                  />
                  <Bar dataKey='value' fill='#2563eb' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        }

        case 'ONOFF': {
          return (
            <div className='flex items-center justify-center h-full'>
              <OnOffIndicator
                value={Boolean(value)}
                label={card.sensor?.name || 'Sensor Digital'}
              />
            </div>
          );
        }

        default:
          return (
            <div className='flex items-center justify-center h-full text-gray-500'>
              Tipo de gráfico não suportado
            </div>
          );
      }
    },
    [
      realtimeSensorData,
      realtimeSensorHistory,
      sensors,
      measurementUnits,
      getSensorStatus,
    ]
  );

  // Função para renderizar conteúdo do card
  const renderCardContent = React.useCallback(
    (card: any) => {
      const sensorData = realtimeSensorData[card.sensorId];
      const value = sensorData?.value || 0;
      const status = getSensorStatus(card.sensorId);
      const type = getSensorType(card.sensorId);

      // Usar valor original da API sem formatação
      const numericValue = value;

      // Card simplificado - apenas gráfico
      return (
        <div className='relative w-full h-full bg-white rounded-lg overflow-hidden'>
          {/* Gráfico */}
          <div className='w-full h-full flex items-center justify-center p-1'>
            {renderChartContent(card, numericValue as number, status, type)}
          </div>
        </div>
      );
    },
    [realtimeSensorData, getSensorStatus, getSensorType, renderChartContent]
  );

  // Converter cards da API para formato do DashboardGrid
  const dashboardCards = React.useMemo(() => {
    const result = cards.map((card: any) => {
      const dashboardCard = {
        id: card.id,
        title: card.title || card.sensor?.name || 'Sensor',
        // Propriedades de posição do card
        positionX: card.positionX,
        positionY: card.positionY,
        width: card.width,
        height: card.height,
        // Propriedades originais do card para renderização
        chartType: card.chartType,
        sensorId: card.sensorId,
        sensor: card.sensor,
      };

      // Debug: Log do card processado
      debug.card('Dashboard Card Processado', {
        id: dashboardCard.id,
        title: dashboardCard.title,
        chartType: dashboardCard.chartType,
        sensorId: dashboardCard.sensorId,
        hasSensor: !!dashboardCard.sensor,
      });

      return dashboardCard;
    });

    console.log('📋 Total de cards processados:', result.length);
    return result;
  }, [cards]);

  // Card actions (menu)
  const handleRemoveCard = React.useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleEditCard = React.useCallback(
    (id: string) => {
      // Encontrar o card pelo ID
      const card = cards.find((c: any) => c.id === id);
      if (card) {
        setEditingCard(card);
        setEditCardOpen(true);
      }
    },
    [cards]
  );

  // Callbacks para CardCreator
  const handleCardUpdated = React.useCallback((_updatedCard: any) => {
    setEditCardOpen(false);
    setEditingCard(null);
  }, []);

  const handleEditCardCancel = React.useCallback(() => {
    setEditCardOpen(false);
    setEditingCard(null);
  }, []);

  // Processar módulos da API
  const modules: Module[] = React.useMemo(() => {
    if (!modulesData?.data?.modules) return [];
    const moduleList = modulesData.data.modules;
    console.log('🏭 Módulos carregados:', {
      total: moduleList.length,
      modules: moduleList.map(m => ({
        id: m.id,
        blueprint: m.blueprint,
        customer: m.customer,
      })),
    });
    return moduleList;
  }, [modulesData]);

  // Função para obter ícone do sensor baseado no tipo
  const getSensorIcon = (sensorType?: number) => {
    switch (sensorType) {
      case 0: // Analógico
        return <GaugeIcon className='w-4 h-4' />;
      case 1: // Digital
        return <Activity className='w-4 h-4' />;
      default:
        return <Thermometer className='w-4 h-4' />;
    }
  };

  // Função para obter nome do tipo de sensor
  const getSensorTypeName = (sensorType?: number) => {
    switch (sensorType) {
      case 0:
        return 'Analógico';
      case 1:
        return 'Digital';
      default:
        return 'Sensor';
    }
  };

  const chartOptions = React.useMemo(() => {
    const selectedSensorData = sensors.find(s => s.id === selectedSensor);
    const isDigitalSensor = selectedSensorData?.sensorType === 1;

    const allOptions = [
      {
        id: 'LINE' as const,
        name: 'Linha',
        desc: 'Tendências ao longo do tempo.',
        icon: (
          <svg viewBox='0 0 64 40' className='h-6 w-10' aria-hidden>
            <polyline
              fill='none'
              stroke='#2563eb'
              strokeWidth='3'
              points='2,28 12,18 22,22 32,12 46,16 62,20'
            />
          </svg>
        ),
        sensorType: 'analog' as const,
      },
      {
        id: 'BAR' as const,
        name: 'Barra',
        desc: 'Comparações entre categorias.',
        icon: (
          <svg viewBox='0 0 64 40' className='h-6 w-10' aria-hidden>
            <rect x='6' y='18' width='12' height='16' fill='#2563eb' rx='2' />
            <rect x='28' y='12' width='12' height='22' fill='#60a5fa' rx='2' />
            <rect x='50' y='22' width='12' height='12' fill='#93c5fd' rx='2' />
          </svg>
        ),
        sensorType: 'analog' as const,
      },
      {
        id: 'GAUGE' as const,
        name: 'Gauge',
        desc: 'Indicador de valor instantâneo.',
        icon: (
          <svg viewBox='0 0 64 40' className='h-6 w-10' aria-hidden>
            {/* Semicírculo azul completo (100%) levemente mais baixo para alinhar baseline visual */}
            <path
              d='M16 21 A16 16 0 0 1 48 21'
              stroke='#2563eb'
              strokeWidth='6'
              fill='none'
            />
          </svg>
        ),
        sensorType: 'analog' as const,
      },
      {
        id: 'ONOFF' as const,
        name: 'On/Off',
        desc: 'Indicador de estado ligado/desligado.',
        icon: (
          <svg viewBox='0 0 64 40' className='h-6 w-10' aria-hidden>
            <circle cx='32' cy='20' r='12' fill='#10b981' />
            <text
              x='32'
              y='25'
              textAnchor='middle'
              fontSize='8'
              fill='white'
              fontWeight='bold'
            >
              ON
            </text>
          </svg>
        ),
        sensorType: 'digital' as const,
      },
      {
        id: 'STEP' as const,
        name: 'Step Chart',
        desc: 'Gráfico de degraus para mudanças discretas.',
        icon: (
          <svg viewBox='0 0 64 40' className='h-6 w-10' aria-hidden>
            <polyline
              fill='none'
              stroke='#2563eb'
              strokeWidth='3'
              points='2,30 12,30 12,15 22,15 22,25 32,25 32,10 46,10 46,20 62,20'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        ),
        sensorType: 'digital' as const,
      },
    ];

    // Filtrar opções baseado no tipo de sensor
    return allOptions.filter(option => {
      if (isDigitalSensor) {
        return option.sensorType === 'digital';
      } else {
        return option.sensorType === 'analog';
      }
    });
  }, [selectedSensor, sensors]);

  // Pré-selecionar o primeiro gráfico quando chegar no step 3
  React.useEffect(() => {
    if (stepIndex === 2 && chartOptions.length > 0 && !selectedChart) {
      setSelectedChart(chartOptions[0].id);
    }
  }, [stepIndex, chartOptions, selectedChart]);

  const resetAddForm = () => {
    setSelectedModule(null);
    setSelectedSensor(null);
    setSelectedChart(null);
    setStepIndex(0);
  };
  const confirmAddCard = async () => {
    console.log('🚀 confirmAddCard chamada com:', {
      selectedChart,
      selectedModule,
      selectedSensor,
      selectedViewId,
    });

    // Validação mais detalhada
    if (!selectedChart) {
      console.error('❌ selectedChart não definido');
      return;
    }
    if (!selectedModule) {
      console.error('❌ selectedModule não definido');
      return;
    }
    if (!selectedSensor) {
      console.error('❌ selectedSensor não definido');
      return;
    }
    if (!selectedViewId) {
      console.error('❌ selectedViewId não definido');
      return;
    }

    try {
      // Buscar dados do sensor selecionado
      const selectedSensorData = sensors.find(s => s.id === selectedSensor);
      if (!selectedSensorData) {
        console.error('❌ Sensor não encontrado:', selectedSensor);
        return;
      }

      // Buscar dados do módulo selecionado
      const selectedModuleData = modules.find(m => m.id === selectedModule);
      if (!selectedModuleData) {
        console.error('❌ Módulo não encontrado:', selectedModule);
        return;
      }

      const moduleName = selectedModuleData.blueprint || 'Módulo';
      const sensorName = selectedSensorData.name;
      const title = `${sensorName} - ${moduleName}`;

      const cardData = {
        sensorId: selectedSensor,
        moduleId: selectedModule,
        machineId: selectedModuleData.machineId,
        positionX: 0,
        positionY: 0,
        width: 4, // Largura padrão de 4
        height: 9, // Altura padrão de 9
        chartType: selectedChart as ChartType,
        title,
        isVisible: true,
        sortOrder: cards?.length || 0,
        isActive: true,
      };

      console.log('📤 Enviando dados do card:', cardData);

      const result = await addCardMutation.mutateAsync({
        viewId: selectedViewId,
        data: cardData,
      });

      console.log('✅ Card adicionado com sucesso:', result);

      setAddOpen(false);
      resetAddForm();
    } catch (error) {
      console.error('❌ Erro ao adicionar card:', error);
      console.error('❌ Detalhes do erro:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
    }
  };

  // Confirm deletion modal actions
  const confirmDelete = React.useCallback(async () => {
    if (!deleteConfirmId) return;

    try {
      await removeCardMutation.mutateAsync(deleteConfirmId);

      // Forçar atualização imediata do estado local
      queryClient.invalidateQueries({ queryKey: ['views', 'my'] });
      queryClient.refetchQueries({ queryKey: ['views', 'my'] });

      setDeleteConfirmId(null);
    } catch (error) {
      console.error('❌ Erro ao remover card:', error);
    }
  }, [deleteConfirmId, removeCardMutation, queryClient]);

  const cancelDelete = React.useCallback(() => setDeleteConfirmId(null), []);

  return (
    <PtraceLayout>
      <div className='space-y-4 h-[calc(100vh-5.5rem)]'>
        {/* Debug WebSocket - Comentado temporariamente */}

        {/* Container central com ação "Nova produção" */}
        <Container
          tabs={
            <Tabs
              value={selectedViewId}
              onValueChange={isEditMode ? undefined : setSelectedViewId}
            >
              <Tabs.List className='overflow-x-auto scroll-smooth'>
                {Array.isArray(viewsData?.data) &&
                  viewsData.data
                    .sort((a, b) => {
                      // Ordenar por data de criação: mais antigas primeiro
                      const dateA = new Date(a.createdAt || 0);
                      const dateB = new Date(b.createdAt || 0);
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map(v => (
                      <Tabs.Trigger
                        key={v.id}
                        value={v.id}
                        disabled={isEditMode}
                        className='whitespace-nowrap flex-shrink-0'
                      >
                        {v.name}
                      </Tabs.Trigger>
                    ))}
              </Tabs.List>
            </Tabs>
          }
          actions={
            <div className='flex items-center gap-2'>
              {/* Indicador de status WebSocket */}
              <div className='flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-100'>
                <div
                  className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className='text-gray-600'>
                  {wsConnected ? 'Conectado' : 'Desconectado'}
                </span>
                {realtimeState.error && (
                  <span className='text-red-600 ml-1'>
                    • {realtimeState.error}
                  </span>
                )}
              </div>

              <ButtonIcon
                aria-label='Adicionar'
                icon={<Plus />}
                onClick={() => setManageOpen(true)}
              />
              <ButtonIcon
                aria-label={isEditMode ? 'Salvar alterações' : 'Editar layout'}
                icon={isEditMode ? <Check /> : <Pencil />}
                onClick={handleEditModeToggle}
              />
              <button
                type='button'
                onClick={() => setAddOpen(true)}
                className='px-3 py-1.5 rounded-md text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition whitespace-nowrap'
              >
                <span className='hidden sm:inline'>Adicionar sensor</span>
                <span className='sm:hidden'>+ Sensor</span>
              </button>
            </div>
          }
        >
          <div className='relative h-full'>
            {/* Spinner overlay during grid loading */}
            {showSpinner && (
              <div className='absolute inset-0 z-20 flex items-center justify-center bg-white/80'>
                <div className='h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin' />
              </div>
            )}

            {/* Grid de cards - só renderiza quando dados estiverem prontos */}
            <div className='relative z-10 h-full'>
              {viewsLoading ? (
                <div className='flex items-center justify-center h-full'>
                  <div className='text-center'>
                    <div className='h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-4' />
                    <p className='text-gray-600'>Carregando dados da API...</p>
                  </div>
                </div>
              ) : !selectedView ? (
                <div className='flex items-center justify-center h-full'>
                  <div className='text-center'>
                    <div className='text-gray-400 mb-4'>
                      <svg
                        className='w-16 h-16 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1.5}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    </div>
                    <p className='text-gray-600 text-lg font-medium mb-2'>
                      Nenhuma view selecionada
                    </p>
                    <p className='text-gray-500 text-sm'>
                      Selecione uma view para visualizar os dados
                    </p>
                  </div>
                </div>
              ) : cards.length === 0 ? (
                <div className='flex items-center justify-center h-full'>
                  <div className='text-center'>
                    <div className='text-gray-400 mb-4'>
                      <svg
                        className='w-16 h-16 mx-auto'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1.5}
                          d='M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z'
                        />
                      </svg>
                    </div>
                    <p className='text-gray-600 text-lg font-medium mb-2'>
                      Nenhum card encontrado
                    </p>
                    <p className='text-gray-500 text-sm'>
                      Adicione cards para visualizar dados nesta view
                    </p>
                  </div>
                </div>
              ) : (
                <div className='h-full'>
                  <DashboardGrid
                    cards={dashboardCards}
                    onLoadingChange={setGridLoading}
                    onEditCard={handleEditCard}
                    onRemoveCard={handleRemoveCard}
                    disablePersistence={true}
                    isEditMode={isEditMode}
                    onLayoutChange={handleLayoutChange}
                    renderCardContent={renderCardContent}
                  />
                </div>
              )}
            </div>
          </div>
        </Container>

        {/* Modal: Adicionar sensor */}
        {addOpen && (
          <div className='fixed inset-0 z-[2147483647]'>
            <div
              className='absolute inset-0 bg-black/30 z-[2147483647]'
              onClick={() => {
                setAddOpen(false);
                resetAddForm();
              }}
            />
            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2147483647] w-[900px] h-[640px] max-w-[95vw] max-h-[92vh] rounded-lg border border-zinc-200 bg-white shadow-lg flex flex-col'>
              <div className='flex items-center justify-between px-4 py-3 border-b border-zinc-200 shrink-0'>
                <h3 className='text-sm font-semibold text-zinc-800'>
                  Adicionar sensor
                </h3>
                <button
                  className='p-1 text-zinc-500 hover:text-zinc-700'
                  onClick={() => {
                    setAddOpen(false);
                    resetAddForm();
                  }}
                >
                  ✕
                </button>
              </div>
              <div className='p-4 flex-1 overflow-auto space-y-4'>
                {/* Stepper header */}
                <Stepper
                  variant='wizard'
                  current={stepIndex}
                  steps={[
                    { label: 'Selecione o módulo' },
                    { label: 'Selecione o sensor' },
                    { label: 'Selecione o tipo de gráfico' },
                  ]}
                />

                {/* Conteúdo do passo */}
                {stepIndex === 0 && (
                  <div>
                    <div className='flex items-center justify-between mb-4'>
                      <div>
                        <h4 className='text-sm font-semibold text-zinc-800'>
                          Selecione um módulo
                        </h4>
                        <p className='text-xs text-zinc-600 mt-1'>
                          Escolha o módulo que contém o sensor que deseja
                          monitorar
                        </p>
                      </div>
                      {modulesData?.data?.pagination && (
                        <div className='text-xs text-zinc-500'>
                          {modulesData.data.pagination.total} módulos
                          disponíveis
                        </div>
                      )}
                    </div>

                    {/* Estado de carregamento */}
                    {modulesLoading && (
                      <div className='flex items-center justify-center py-12'>
                        <div className='flex items-center gap-3 text-zinc-600'>
                          <Loader2 className='w-5 h-5 animate-spin' />
                          <span className='text-sm'>Carregando módulos...</span>
                        </div>
                      </div>
                    )}

                    {/* Estado de erro */}
                    {modulesError && (
                      <div className='flex items-center justify-center py-12'>
                        <div className='flex flex-col items-center gap-3 text-red-600'>
                          <AlertCircle className='w-8 h-8' />
                          <div className='text-center'>
                            <p className='text-sm font-medium'>
                              Erro ao carregar módulos
                            </p>
                            <p className='text-xs text-red-500 mt-1'>
                              Verifique sua conexão e tente novamente
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lista de módulos */}
                    {!modulesLoading && !modulesError && (
                      <div className='max-h-64 overflow-y-auto'>
                        {modules.length === 0 ? (
                          <div className='flex items-center justify-center py-8'>
                            <div className='flex flex-col items-center gap-2 text-zinc-400'>
                              <Building2 className='w-6 h-6' />
                              <div className='text-center'>
                                <p className='text-sm font-medium text-zinc-600'>
                                  Nenhum módulo encontrado
                                </p>
                                <p className='text-xs text-zinc-500'>
                                  Crie um módulo primeiro
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className='space-y-1'>
                            {modules.map(module => (
                              <button
                                key={module.id}
                                type='button'
                                onClick={() => {
                                  setSelectedModule(module.id);
                                  setSelectedSensor(null);
                                  setSelectedChart(null);
                                }}
                                className={`group w-full p-3 rounded-lg text-left transition-all duration-200 ${
                                  selectedModule === module.id
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                                }`}
                              >
                                <div className='flex items-center gap-3'>
                                  {/* Ícone compacto */}
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                      selectedModule === module.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-zinc-100 text-zinc-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                                    }`}
                                  >
                                    <Building2 className='w-4 h-4' />
                                  </div>

                                  {/* Conteúdo compacto */}
                                  <div className='flex-1 min-w-0'>
                                    <div className='flex items-center justify-between'>
                                      <h5 className='text-sm font-semibold text-zinc-900 truncate'>
                                        {module.blueprint}
                                      </h5>
                                      {selectedModule === module.id && (
                                        <Check className='w-4 h-4 text-blue-500' />
                                      )}
                                    </div>
                                    <div className='flex items-center gap-3 text-xs text-zinc-600 mt-0.5'>
                                      <span className='truncate'>
                                        {module.customer}
                                      </span>
                                      <span>•</span>
                                      <span className='truncate'>
                                        {module.sector}
                                      </span>
                                      {module.machineName && (
                                        <>
                                          <span>•</span>
                                          <span className='truncate'>
                                            {module.machineName}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {stepIndex === 1 && (
                  <div>
                    <div className='flex items-center justify-between mb-4'>
                      <div>
                        <h4 className='text-sm font-semibold text-zinc-800'>
                          Selecione um sensor
                        </h4>
                        <p className='text-xs text-zinc-600 mt-1'>
                          Escolha o sensor que deseja monitorar
                        </p>
                      </div>
                      {sensorsData?.data?.pagination && (
                        <div className='text-xs text-zinc-500'>
                          {sensorsData.data.pagination.total} sensores
                          disponíveis
                        </div>
                      )}
                    </div>

                    {/* Estado de carregamento */}
                    {sensorsLoading && (
                      <div className='flex items-center justify-center py-8'>
                        <div className='flex items-center gap-3 text-zinc-600'>
                          <Loader2 className='w-5 h-5 animate-spin' />
                          <span className='text-sm'>
                            Carregando sensores...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Estado de erro */}
                    {sensorsError && (
                      <div className='flex items-center justify-center py-8'>
                        <div className='flex flex-col items-center gap-3 text-red-600'>
                          <AlertCircle className='w-8 h-8' />
                          <div className='text-center'>
                            <p className='text-sm font-medium'>
                              Erro ao carregar sensores
                            </p>
                            <p className='text-xs text-red-500 mt-1'>
                              Verifique sua conexão e tente novamente
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lista de sensores */}
                    {!sensorsLoading && !sensorsError && (
                      <div className='max-h-64 overflow-y-auto'>
                        {sensors.length === 0 ? (
                          <div className='flex items-center justify-center py-8'>
                            <div className='flex flex-col items-center gap-2 text-zinc-400'>
                              <Activity className='w-6 h-6' />
                              <div className='text-center'>
                                <p className='text-sm font-medium text-zinc-600'>
                                  Nenhum sensor encontrado
                                </p>
                                <p className='text-xs text-zinc-500'>
                                  Este módulo não possui sensores
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className='space-y-1'>
                            {sensors.map(sensor => (
                              <button
                                key={sensor.id}
                                type='button'
                                onClick={() => setSelectedSensor(sensor.id)}
                                className={`group w-full p-3 rounded-lg text-left transition-all duration-200 ${
                                  selectedSensor === sensor.id
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                                }`}
                              >
                                <div className='flex items-center gap-3'>
                                  {/* Ícone do sensor */}
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                      selectedSensor === sensor.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-zinc-100 text-zinc-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                                    }`}
                                  >
                                    {getSensorIcon(sensor.sensorType)}
                                  </div>

                                  {/* Conteúdo do sensor */}
                                  <div className='flex-1 min-w-0'>
                                    <div className='flex items-center justify-between'>
                                      <h5 className='text-sm font-semibold text-zinc-900 truncate'>
                                        {sensor.name}
                                      </h5>
                                      {selectedSensor === sensor.id && (
                                        <Check className='w-4 h-4 text-blue-500' />
                                      )}
                                    </div>
                                    <div className='flex items-center gap-3 text-xs text-zinc-600 mt-0.5'>
                                      <span className='truncate'>
                                        {getSensorTypeName(sensor.sensorType)}
                                      </span>
                                      {sensor.description && (
                                        <>
                                          <span>•</span>
                                          <span className='truncate'>
                                            {sensor.description}
                                          </span>
                                        </>
                                      )}
                                      {sensor.minScale !== undefined &&
                                        sensor.maxScale !== undefined && (
                                          <>
                                            <span>•</span>
                                            <span className='truncate'>
                                              {sensor.minScale}-
                                              {sensor.maxScale}
                                            </span>
                                          </>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {stepIndex === 2 && (
                  <div>
                    <div className='text-xs font-medium text-zinc-700 mb-2'>
                      Tipos de gráfico
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div className='md:col-span-1'>
                        <div className='flex flex-col gap-3'>
                          {chartOptions.map(opt => {
                            const active = selectedChart === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type='button'
                                onClick={() => setSelectedChart(opt.id)}
                                className={`group w-full rounded-lg border p-3 text-left transition bg-white hover:shadow-sm ${
                                  active
                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                    : 'border-zinc-300 hover:bg-zinc-50'
                                }`}
                              >
                                <div className='flex items-center gap-3'>
                                  <div className='shrink-0 size-12 p-2 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center'>
                                    {opt.icon}
                                  </div>
                                  <div className='min-w-0'>
                                    <div className='text-sm font-medium text-zinc-800'>
                                      {opt.name}
                                    </div>
                                    <div className='text-xs text-zinc-600 truncate'>
                                      {opt.desc}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className='md:col-span-2'>
                        <div className='rounded-lg border border-zinc-200 p-4 bg-zinc-50/50'>
                          <div className='flex items-center justify-between mb-3'>
                            <div>
                              <div className='text-sm font-medium text-zinc-800'>
                                {chartOptions.find(c => c.id === selectedChart)
                                  ?.name ?? 'Pré-visualização'}
                              </div>
                              <div className='text-xs text-zinc-600'>
                                {chartOptions.find(c => c.id === selectedChart)
                                  ?.desc ??
                                  'Escolha um tipo de gráfico à esquerda.'}
                              </div>
                            </div>
                            <span className='text-[10px] px-2 py-1 rounded bg-white border border-zinc-200 text-zinc-600'>
                              Preview
                            </span>
                          </div>
                          <div className='rounded-md bg-white border border-zinc-200 p-3'>
                            {selectedChart === 'ONOFF' ? (
                              <div className='h-72 flex items-center justify-center w-full'>
                                <OnOffIndicator value={true} label='Preview' />
                              </div>
                            ) : selectedChart === 'STEP' ? (
                              <div className='h-72'>
                                <StepChart
                                  data={[
                                    { name: 'P1', value: 0 },
                                    { name: 'P2', value: 0 },
                                    { name: 'P3', value: 1 },
                                    { name: 'P4', value: 1 },
                                    { name: 'P5', value: 0 },
                                    { name: 'P6', value: 0 },
                                  ]}
                                />
                              </div>
                            ) : (
                              <ChartTypePreview
                                type={
                                  selectedChart === 'LINE' ||
                                  selectedChart === 'BAR' ||
                                  selectedChart === 'GAUGE'
                                    ? (selectedChart as any)
                                    : 'LINE'
                                }
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className='flex justify-between items-center px-4 py-3 border-t border-zinc-200 shrink-0'>
                <button
                  type='button'
                  className='px-3 py-1.5 rounded-md border border-zinc-300 text-sm hover:bg-zinc-50'
                  onClick={() => {
                    setAddOpen(false);
                    resetAddForm();
                  }}
                >
                  Cancelar
                </button>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    className='px-3 py-1.5 rounded-md border border-zinc-300 text-sm hover:bg-zinc-50 disabled:opacity-50'
                    disabled={stepIndex === 0}
                    onClick={() => setStepIndex(i => Math.max(0, i - 1))}
                  >
                    Anterior
                  </button>
                  {stepIndex < 2 ? (
                    <button
                      type='button'
                      className='px-3 py-1.5 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700'
                      disabled={
                        (stepIndex === 0 &&
                          (!selectedModule ||
                            modulesLoading ||
                            !!modulesError)) ||
                        (stepIndex === 1 &&
                          (!selectedSensor || sensorsLoading || !!sensorsError))
                      }
                      onClick={() => setStepIndex(i => Math.min(2, i + 1))}
                    >
                      Próximo
                    </button>
                  ) : (
                    <button
                      type='button'
                      onClick={confirmAddCard}
                      disabled={
                        !selectedModule || !selectedSensor || !selectedChart
                      }
                      className='px-3 py-1.5 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700'
                    >
                      Adicionar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de gerenciamento de abas */}
        {manageOpen && (
          <div className='fixed inset-0 z-[2147483647]'>
            <div
              className='absolute inset-0 bg-black/30 z-[2147483647]'
              onClick={() => {
                setManageOpen(false);
                setHasTriedToSubmit(false);
              }}
            />
            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2147483647] w-[640px] h-[560px] max-w-[92vw] max-h-[90vh] rounded-lg border border-zinc-200 bg-white shadow-lg flex flex-col'>
              <div className='flex items-center justify-between px-4 py-3 border-b border-zinc-200 shrink-0'>
                <h3 className='text-sm font-semibold text-zinc-800'>
                  Gerenciar visões
                </h3>
                <button
                  className='p-1 text-zinc-500 hover:text-zinc-700'
                  onClick={() => {
                    setManageOpen(false);
                    setHasTriedToSubmit(false);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className='p-4 space-y-4 flex-1 overflow-auto'>
                <div className='flex gap-2'>
                  <input
                    value={newViewName}
                    onChange={e => setNewViewName(e.target.value)}
                    placeholder='Nome da nova visão'
                    className={`flex-1 px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                      hasTriedToSubmit && newViewName.trim() === ''
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-zinc-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  <button
                    type='button'
                    onClick={addView}
                    disabled={newViewName.trim() === ''}
                    className='px-3 py-2 rounded-md text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700'
                  >
                    Adicionar
                  </button>
                </div>

                <ul className='divide-y divide-zinc-200 rounded-md border border-zinc-200 flex-1 overflow-y-auto'>
                  {viewsData?.data
                    ?.sort((a, b) => {
                      // Ordenar por data de criação: mais antigas primeiro
                      const dateA = new Date(a.createdAt || 0);
                      const dateB = new Date(b.createdAt || 0);
                      return dateA.getTime() - dateB.getTime();
                    })
                    ?.map(v => (
                      <li
                        key={v.id}
                        className='flex items-center gap-2 px-3 py-2'
                      >
                        {editing.id === v.id ? (
                          <input
                            autoFocus
                            value={editing.value}
                            onChange={e =>
                              setEditing({ id: v.id, value: e.target.value })
                            }
                            onBlur={commitEdit}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitEdit();
                              if (e.key === 'Escape')
                                setEditing({ id: null, value: '' });
                            }}
                            className='flex-1 px-2 py-1 rounded border border-zinc-300 text-sm'
                          />
                        ) : (
                          <span className='flex-1 text-sm text-zinc-800'>
                            {v.name}
                          </span>
                        )}
                        {editing.id === v.id ? (
                          <button
                            type='button'
                            className='p-1.5 rounded hover:bg-green-50 text-green-600'
                            onClick={commitEdit}
                            title='Salvar'
                          >
                            <Check size={16} />
                          </button>
                        ) : (
                          <button
                            type='button'
                            className='p-1.5 rounded hover:bg-zinc-100 text-zinc-600'
                            onClick={() => startEdit(v.id, v.name)}
                            title='Renomear'
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        <button
                          type='button'
                          className='p-1.5 rounded hover:bg-red-50 text-red-600'
                          onClick={() => deleteView(v.id)}
                          title='Excluir'
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
              <div className='flex justify-end gap-2 px-4 py-3 border-t border-zinc-200 shrink-0'>
                <button
                  type='button'
                  onClick={() => {
                    setManageOpen(false);
                    setHasTriedToSubmit(false);
                  }}
                  className='px-3 py-1.5 rounded-md border border-zinc-300 text-sm hover:bg-zinc-50'
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmação de remoção de card */}
        {deleteConfirmId && (
          <div className='fixed inset-0 z-[2147483647]'>
            <div
              className='absolute inset-0 bg-black/30'
              onClick={cancelDelete}
            />
            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[92vw] rounded-lg border border-zinc-200 bg-white shadow-lg'>
              <div className='px-4 py-3 border-b border-zinc-200'>
                <h3 className='text-sm font-semibold text-zinc-800'>
                  Remover card
                </h3>
              </div>
              <div className='p-4 text-sm text-zinc-700'>
                Tem certeza que deseja remover este card?
              </div>
              <div className='flex justify-end gap-2 px-4 py-3 border-t border-zinc-200'>
                <button
                  type='button'
                  onClick={cancelDelete}
                  className='px-3 py-1.5 rounded-md border border-zinc-300 text-sm hover:bg-zinc-50'
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  onClick={confirmDelete}
                  className='px-3 py-1.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700'
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Creator Modal para Edição */}
        <CardCreator
          viewId={selectedViewId}
          onCardCreated={handleCardUpdated}
          existingCard={editingCard}
          isOpen={editCardOpen}
          onClose={handleEditCardCancel}
        />
      </div>
    </PtraceLayout>
  );
}
