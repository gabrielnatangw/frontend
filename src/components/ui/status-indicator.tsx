/**
 * Componente de Indicador de Status
 *
 * Exibe indicadores visuais para diferentes status de sensores
 * com cores, ícones e animações apropriadas.
 */

import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Thermometer,
  Gauge as GaugeIcon,
} from 'lucide-react';

export type SensorStatus =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'unknown';
export type SensorType =
  | 'analog'
  | 'digital'
  | 'temperature'
  | 'pressure'
  | 'flow'
  | 'level';

export interface StatusIndicatorProps {
  status: SensorStatus;
  type?: SensorType;
  value?: number | boolean;
  unit?: string;
  showValue?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const statusConfig = {
  normal: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    icon: CheckCircle,
    label: 'Normal',
    pulse: false,
  },
  warning: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: AlertTriangle,
    label: 'Atenção',
    pulse: true,
  },
  critical: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: AlertCircle,
    label: 'Crítico',
    pulse: true,
  },
  offline: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: XCircle,
    label: 'Offline',
    pulse: false,
  },
  unknown: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: Activity,
    label: 'Desconhecido',
    pulse: false,
  },
};

const typeIcons = {
  analog: GaugeIcon,
  digital: Zap,
  temperature: Thermometer,
  pressure: GaugeIcon,
  flow: Activity,
  level: GaugeIcon,
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'w-3 h-3',
    value: 'text-xs',
  },
  md: {
    container: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
    value: 'text-sm',
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
    value: 'text-base',
  },
};

export function StatusIndicator({
  status,
  type = 'analog',
  value,
  unit,
  showValue = true,
  showIcon = true,
  size = 'md',
  animated = true,
  className = '',
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const TypeIcon = typeIcons[type];
  const StatusIcon = config.icon;
  const sizeStyles = sizeConfig[size];

  const formatValue = (val: number | boolean | undefined) => {
    if (val === undefined || val === null) return '--';

    if (typeof val === 'boolean') {
      return val ? 'Ligado' : 'Desligado';
    }

    if (typeof val === 'number') {
      return unit ? `${val.toFixed(1)} ${unit}` : val.toFixed(1);
    }

    return String(val);
  };

  const pulseClass = animated && config.pulse ? 'animate-pulse' : '';

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-lg border
        ${config.bgColor} ${config.borderColor} ${config.color}
        ${sizeStyles.container} ${pulseClass} ${className}
      `}
    >
      {showIcon && (
        <div className='flex items-center gap-1'>
          <TypeIcon className={`${sizeStyles.icon} ${config.color}`} />
          <StatusIcon className={`${sizeStyles.icon} ${config.color}`} />
        </div>
      )}

      <div className='flex flex-col'>
        <span className={`font-medium ${sizeStyles.value}`}>
          {config.label}
        </span>
        {showValue && value !== undefined && (
          <span className={`text-xs opacity-75 ${sizeStyles.value}`}>
            {formatValue(value)}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Componente de Status Badge (versão compacta)
 */
export interface StatusBadgeProps {
  status: SensorStatus;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'sm',
  animated = true,
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const sizeStyles = sizeConfig[size];
  const pulseClass = animated && config.pulse ? 'animate-pulse' : '';

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-full
        ${config.bgColor} ${config.color}
        ${sizeStyles.container} ${pulseClass} ${className}
      `}
      title={config.label}
    >
      <StatusIcon className={`${sizeStyles.icon} ${config.color}`} />
      <span className={`font-medium ${sizeStyles.value}`}>{config.label}</span>
    </div>
  );
}

/**
 * Componente de Status Dot (versão mínima)
 */
export interface StatusDotProps {
  status: SensorStatus;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function StatusDot({
  status,
  size = 'md',
  animated = true,
  className = '',
}: StatusDotProps) {
  const config = statusConfig[status];
  const sizeStyles = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  const pulseClass = animated && config.pulse ? 'animate-pulse' : '';

  return (
    <div
      className={`
        rounded-full ${config.bgColor} ${config.borderColor} border
        ${sizeStyles[size]} ${pulseClass} ${className}
      `}
      title={config.label}
    />
  );
}

// Hook movido para use-sensor-status.ts para resolver problema de Fast Refresh
