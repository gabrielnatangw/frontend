/**
 * Hook para tooltip com dados de sensor
 */
export function useSensorTooltip(sensorId: string, sensorData: any) {
  const getStatus = ():
    | 'normal'
    | 'warning'
    | 'critical'
    | 'offline'
    | 'unknown' => {
    if (!sensorData) return 'offline';

    const value = sensorData.value;
    if (typeof value === 'boolean') {
      return value ? 'normal' : 'warning';
    }

    if (typeof value === 'number') {
      // Lógica simplificada - em produção seria baseada em limites do sensor
      if (value < 0 || value > 100) return 'critical';
      if (value < 10 || value > 90) return 'warning';
      return 'normal';
    }

    return 'unknown';
  };

  const getValue = () => {
    if (!sensorData) return 'N/A';
    return sensorData.value?.toString() || 'N/A';
  };

  const getUnit = () => {
    return sensorData?.unit || '';
  };

  const getTimestamp = () => {
    if (!sensorData?.timestamp) return 'N/A';
    return new Date(sensorData.timestamp).toLocaleString('pt-BR');
  };

  return {
    status: getStatus(),
    value: getValue(),
    unit: getUnit(),
    timestamp: getTimestamp(),
    sensorId,
  };
}
