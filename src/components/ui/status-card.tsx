/**
 * Componente de Card com Status Visual
 *
 * Card que exibe indicadores visuais de status com bordas coloridas,
 * ícones de alerta e animações sutis.
 */

import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Info,
} from 'lucide-react';
import {
  StatusIndicator,
  StatusBadge,
  StatusDot,
  SensorStatus,
  SensorType,
} from './status-indicator';

export interface StatusCardProps {
  title: string;
  value?: number | boolean;
  unit?: string;
  status: SensorStatus;
  type?: SensorType;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  showStatusIndicator?: boolean;
  showStatusBadge?: boolean;
  showStatusDot?: boolean;
  animated?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  tooltip?: string;
}

const statusBorderConfig = {
  normal: 'border-green-300 hover:border-green-400',
  warning: 'border-yellow-300 hover:border-yellow-400',
  critical: 'border-red-300 hover:border-red-400',
  offline: 'border-gray-300 hover:border-gray-400',
  unknown: 'border-gray-200 hover:border-gray-300',
};

const statusBgConfig = {
  normal: 'bg-white hover:bg-green-50',
  warning: 'bg-white hover:bg-yellow-50',
  critical: 'bg-white hover:bg-red-50',
  offline: 'bg-white hover:bg-gray-50',
  unknown: 'bg-white hover:bg-gray-50',
};

const statusIconConfig = {
  normal: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  critical: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  offline: {
    icon: XCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
  unknown: {
    icon: Activity,
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
  },
};

export function StatusCard({
  title,
  value,
  unit,
  status,
  type = 'analog',
  subtitle,
  children,
  className = '',
  showStatusIndicator = false,
  showStatusBadge = true,
  showStatusDot = false,
  animated = true,
  clickable = false,
  onClick,
  tooltip,
}: StatusCardProps) {
  const config = statusIconConfig[status];
  const StatusIcon = config.icon;
  const borderClass = statusBorderConfig[status];
  const bgClass = statusBgConfig[status];

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

  const cardClasses = `
    relative rounded-lg border-2 shadow-sm transition-all duration-200
    ${borderClass} ${bgClass}
    ${clickable ? 'cursor-pointer' : ''}
    ${animated && (status === 'warning' || status === 'critical') ? 'animate-pulse' : ''}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick} title={tooltip}>
      {/* Header com status */}
      <div className='flex items-center justify-between p-4 pb-2'>
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-gray-900 truncate'>
            {title}
          </h3>
          {subtitle && (
            <p className='text-xs text-gray-500 truncate'>{subtitle}</p>
          )}
        </div>

        <div className='flex items-center gap-2 ml-2'>
          {/* Status Dot */}
          {showStatusDot && (
            <StatusDot status={status} size='sm' animated={animated} />
          )}

          {/* Status Badge */}
          {showStatusBadge && (
            <StatusBadge status={status} size='sm' animated={animated} />
          )}

          {/* Status Icon */}
          <div className={`p-1 rounded-full ${config.bgColor}`}>
            <StatusIcon className={`w-4 h-4 ${config.color}`} />
          </div>
        </div>
      </div>

      {/* Valor principal */}
      {value !== undefined && (
        <div className='px-4 pb-2'>
          <div className='text-2xl font-bold text-gray-900'>
            {formatValue(value)}
          </div>
        </div>
      )}

      {/* Status Indicator completo */}
      {showStatusIndicator && (
        <div className='px-4 pb-2'>
          <StatusIndicator
            status={status}
            type={type}
            value={value}
            unit={unit}
            size='sm'
            animated={animated}
          />
        </div>
      )}

      {/* Conteúdo customizado */}
      {children && <div className='px-4 pb-4'>{children}</div>}

      {/* Tooltip */}
      {tooltip && (
        <div className='absolute top-2 right-2'>
          <Info className='w-4 h-4 text-gray-400' />
        </div>
      )}
    </div>
  );
}

/**
 * Componente de Card de Alerta (especializado para alertas)
 */
export interface AlertCardProps {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function AlertCard({
  title,
  message,
  severity,
  timestamp,
  dismissible = true,
  onDismiss,
  className = '',
}: AlertCardProps) {
  const severityConfig = {
    info: {
      border: 'border-blue-300',
      bg: 'bg-blue-50',
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    warning: {
      border: 'border-yellow-300',
      bg: 'bg-yellow-50',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
    },
    error: {
      border: 'border-red-300',
      bg: 'bg-red-50',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
    },
    success: {
      border: 'border-green-300',
      bg: 'bg-green-50',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      className={`
      rounded-lg border-2 ${config.border} ${config.bg} p-4
      transition-all duration-200 hover:shadow-md
      ${className}
    `}
    >
      <div className='flex items-start gap-3'>
        <div className={`p-2 rounded-full ${config.iconBg}`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <div className='flex-1 min-w-0'>
          <h4 className='text-sm font-medium text-gray-900'>{title}</h4>
          <p className='text-sm text-gray-600 mt-1'>{message}</p>
          {timestamp && (
            <p className='text-xs text-gray-500 mt-2'>
              {new Date(timestamp).toLocaleString()}
            </p>
          )}
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <XCircle className='w-5 h-5' />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Componente de Grid de Status Cards
 */
export interface StatusCardGridProps {
  cards: Array<{
    id: string;
    title: string;
    value?: number | boolean;
    unit?: string;
    status: SensorStatus;
    type?: SensorType;
    subtitle?: string;
    onClick?: () => void;
  }>;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatusCardGrid({
  cards,
  columns = 3,
  className = '',
}: StatusCardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div
      className={`
      grid gap-4 ${gridCols[columns]} ${className}
    `}
    >
      {cards.map(card => (
        <StatusCard
          key={card.id}
          title={card.title}
          value={card.value}
          unit={card.unit}
          status={card.status}
          type={card.type}
          subtitle={card.subtitle}
          clickable={!!card.onClick}
          onClick={card.onClick}
        />
      ))}
    </div>
  );
}
