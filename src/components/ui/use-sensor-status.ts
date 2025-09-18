import type { SensorStatus, SensorType } from './status-indicator';

/**
 * Hook para determinar status baseado em valor e limites
 */
export function useSensorStatus(
  value: number | boolean | undefined,
  _type: SensorType = 'analog',
  limits?: {
    min?: number;
    max?: number;
    warningMin?: number;
    warningMax?: number;
  }
): SensorStatus {
  if (value === undefined || value === null) {
    return 'offline';
  }

  if (typeof value === 'boolean') {
    return value ? 'normal' : 'warning';
  }

  if (typeof value === 'number') {
    if (!limits) return 'normal';

    const { min = 0, max = 100, warningMin, warningMax } = limits;

    // Valores críticos (fora dos limites)
    if (value < min || value > max) {
      return 'critical';
    }

    // Valores de atenção (próximos aos limites)
    if (
      (warningMin !== undefined && value < warningMin) ||
      (warningMax !== undefined && value > warningMax)
    ) {
      return 'warning';
    }

    return 'normal';
  }

  return 'unknown';
}
