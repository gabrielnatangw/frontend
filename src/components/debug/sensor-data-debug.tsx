import React from 'react';
// import { Card } from '../ui/card';

interface SensorDataDebugProps {
  sensorData: Record<string, any>;
  isConnected: boolean;
  error: string | null;
  stats: {
    totalSensors: number;
    activeSensors: number;
    criticalAlerts: number;
    warningAlerts: number;
  };
  alerts?: any[];
}

export default function SensorDataDebug({
  sensorData,
  isConnected,
  error,
  stats,
  alerts = [],
}: SensorDataDebugProps) {
  return (
    <div className='fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
      <div className='p-4'>
        <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
          <div
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          ></div>
          Debug - Dados dos Sensores
        </h3>

        {/* Status da Conexão */}
        <div className='mb-4'>
          <div className='text-sm'>
            <span className='font-medium'>Status:</span>
            <span
              className={`ml-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}
            >
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          {error && (
            <div className='text-sm text-red-600 mt-1'>
              <span className='font-medium'>Erro:</span> {error}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className='mb-4 grid grid-cols-2 gap-2 text-sm'>
          <div>
            <span className='font-medium'>Total:</span> {stats.totalSensors}
          </div>
          <div>
            <span className='font-medium'>Ativos:</span> {stats.activeSensors}
          </div>
          <div>
            <span className='font-medium'>Críticos:</span>
            <span className='ml-1 text-red-600'>{stats.criticalAlerts}</span>
          </div>
          <div>
            <span className='font-medium'>Atenção:</span>
            <span className='ml-1 text-yellow-600'>{stats.warningAlerts}</span>
          </div>
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className='mb-4'>
            <h4 className='font-medium text-sm mb-2'>
              Alertas Ativos ({alerts.length}):
            </h4>
            <div className='space-y-1 max-h-20 overflow-y-auto'>
              {alerts.slice(-5).map((alert, index) => (
                <div
                  key={index}
                  className={`text-xs p-2 rounded ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 text-red-700'
                      : alert.severity === 'warning'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <div className='font-medium'>{alert.sensorId}</div>
                  <div>{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dados dos Sensores */}
        <div>
          <h4 className='font-medium text-sm mb-2'>Dados dos Sensores:</h4>
          {Object.keys(sensorData).length === 0 ? (
            <div className='text-sm text-gray-500 italic'>
              Nenhum dado de sensor recebido
            </div>
          ) : (
            <div className='space-y-2 max-h-40 overflow-y-auto'>
              {Object.entries(sensorData).map(([sensorId, data]) => (
                <div key={sensorId} className='text-xs bg-gray-50 p-2 rounded'>
                  <div className='font-medium truncate'>{sensorId}</div>
                  <div className='text-gray-600'>
                    Valor: {data.value} {data.unit}
                  </div>
                  <div className='text-gray-600'>
                    Status: {data.status} | Tipo: {data.type}
                  </div>
                  <div className='text-gray-500'>
                    Atualizado:{' '}
                    {new Date(data.lastUpdated).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
