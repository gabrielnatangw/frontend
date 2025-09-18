import { useMemo } from 'react';
import type { Sensor } from '../types/sensor';
import type { SensorStatus } from '../components/ui/status-indicator';

export interface GaugeData {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  status: SensorStatus;
  percentage: number;
  clampedValue: number;
}

export function useGaugeData(
  card: any,
  realtimeData: any,
  sensors: Sensor[],
  measurementUnits: any[],
  getSensorStatus: (sensorId: string) => SensorStatus
): GaugeData | null {
  return useMemo(() => {
    if (!card || !card.sensorId) return null;

    // Buscar dados do sensor
    const sensorInfo = sensors.find(s => s.id === card.sensorId);
    if (!sensorInfo) return null;

    // Dados em tempo real
    const sensorData = realtimeData[card.sensorId];
    if (!sensorData) return null;

    // Configurações do sensor
    const minScale = sensorInfo.minScale ?? 0;
    const maxScale = sensorInfo.maxScale ?? 100;
    const sensorName = sensorInfo.name ?? card.sensor?.name ?? 'Sensor';

    // Unidade de medida
    const measurementUnitId = sensorInfo.measurementUnitId;
    const sensorUnit = measurementUnitId
      ? measurementUnits?.find(u => u.id === measurementUnitId)?.unitSymbol ||
        ''
      : (card.sensor?.unit ?? '');

    // Valor e status
    const rawValue =
      typeof sensorData.value === 'boolean'
        ? sensorData.value
          ? 1
          : 0
        : Number(sensorData.value);

    const clampedValue = Math.max(minScale, Math.min(maxScale, rawValue));
    const status = getSensorStatus(card.sensorId);

    // Percentual para visualização
    const percentage =
      maxScale > minScale
        ? ((clampedValue - minScale) / (maxScale - minScale)) * 100
        : 0;

    return {
      value: rawValue,
      min: minScale,
      max: maxScale,
      label: sensorName,
      unit: sensorUnit,
      status,
      percentage: Math.round(percentage),
      clampedValue,
    };
  }, [card, realtimeData, sensors, measurementUnits, getSensorStatus]);
}
