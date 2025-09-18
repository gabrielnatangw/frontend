import { useQuery } from '@tanstack/react-query';
import { userPermissionsApi } from '../api/user-permissions';

// IDs das aplicações disponíveis
export const APPLICATION_IDS = {
  P_TRACE: '4624d115-b617-41a8-ad07-166935b830d0', // P-Trace (Production Trace) - PADRÃO
  SMART_TRACE: '0f0e6d72-b140-4bf3-925e-9d51ecb468ae', // Smart Trace Platform (MAIN_APP)
  D_TRACE: '728d6b55-5685-4045-9d84-a113ba85ae28', // D-Trace (Development Trace)
  M_TRACE: '4f39418b-f970-4352-981d-264dd93c4fe8', // M-Trace (Manufacturing Trace)
  E_TRACE: '01ee1dde-12bb-4d64-8df4-93562fbab4cc', // E-Trace (Enterprise Trace)
} as const;

// Aplicação padrão
export const DEFAULT_APPLICATION_ID = APPLICATION_IDS.P_TRACE;

// Hook para buscar aplicações da API
export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: () => userPermissionsApi.getApplications(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

// Hook para encontrar P-Trace nas aplicações
export function usePTraceApplication() {
  const { data: applicationsData, isLoading, error } = useApplications();

  const data = applicationsData as any;
  const applications = data?.data?.applications || [];

  console.log('🔍 usePTraceApplication Debug:', {
    applicationsData,
    applications,
    applicationsCount: applications.length,
  });

  const pTraceApp = applications.find((app: any) => {
    const isPTrace =
      app.name === 'P_TRACE' ||
      app.displayName?.toLowerCase().includes('p-trace');
    console.log('🔍 Verificando app:', {
      name: app.name,
      displayName: app.displayName,
      isPTrace,
    });
    return isPTrace;
  });

  console.log('🎯 P-Trace encontrado:', pTraceApp);

  return {
    pTraceApp,
    isLoading,
    error,
    applicationId: pTraceApp?.applicationId,
  };
}

// Hook para carregar permissões do P-Trace dinamicamente
export function useAppPermissions() {
  const {
    applicationId,
    isLoading: appsLoading,
    error: appsError,
  } = usePTraceApplication();

  // Debug logs
  console.log('🔍 useAppPermissions Debug:', {
    applicationId,
    appsLoading,
    appsError,
    hasApplicationId: !!applicationId,
  });

  // Fallback temporário com ID hardcoded se não encontrar dinamicamente
  const finalApplicationId =
    applicationId || '4624d115-b617-41a8-ad07-166935b830d0';

  console.log('🎯 Application ID final:', finalApplicationId);

  return useQuery({
    queryKey: ['permissions', 'application', 'p-trace', finalApplicationId],
    queryFn: async () => {
      console.log(
        '🚀 Executando queryFn com applicationId:',
        finalApplicationId
      );

      console.log(
        '✅ Fazendo requisição para:',
        `/permissions?applicationId=${finalApplicationId}`
      );
      const result =
        await userPermissionsApi.getPermissionsByApplication(
          finalApplicationId
        );
      console.log('📥 Resposta da API:', result);
      return result;
    },
    enabled: true, // Sempre habilitado, usa fallback se necessário
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para verificar se usuário tem permissão específica
export function useHasPermission(
  functionName: string,
  permissionLevel: string
) {
  const { data: permissionsData, isLoading } = useAppPermissions();

  const hasPermission = () => {
    const data = permissionsData as any;
    if (!data?.data || !Array.isArray(data.data)) return false;

    const permission = data.data.find(
      (p: any) =>
        p.functionName === functionName && p.permissionLevel === permissionLevel
    );

    return !!permission;
  };

  const data = permissionsData as any;
  return {
    hasPermission: hasPermission(),
    isLoading,
    permissions: Array.isArray(data?.data) ? data.data : [],
  };
}
