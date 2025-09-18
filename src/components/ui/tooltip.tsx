/**
 * Componente de Tooltip Informativo
 *
 * Tooltip que exibe informações detalhadas sobre sensores,
 * status e valores com posicionamento inteligente.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  maxWidth?: string;
  className?: string;
  disabled?: boolean;
}

export interface SensorTooltipProps {
  sensorId: string;
  value?: number | boolean;
  unit?: string;
  status: 'normal' | 'warning' | 'critical' | 'offline' | 'unknown';
  timestamp?: string;
  limits?: {
    min?: number;
    max?: number;
    warningMin?: number;
    warningMax?: number;
  };
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
}

const statusConfig = {
  normal: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Normal',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Atenção',
  },
  critical: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Crítico',
  },
  offline: {
    icon: XCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Offline',
  },
  unknown: {
    icon: Info,
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Desconhecido',
  },
};

export function Tooltip({
  content,
  children,
  position = 'auto',
  delay = 300,
  maxWidth = '300px',
  className = '',
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const showTooltip = () => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      calculatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current || position !== 'auto') {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

    // Calcular posição baseada no espaço disponível
    if (triggerRect.top - tooltipRect.height < 0) {
      newPosition = 'bottom';
    } else if (triggerRect.bottom + tooltipRect.height > viewportHeight) {
      newPosition = 'top';
    } else if (triggerRect.left - tooltipRect.width < 0) {
      newPosition = 'right';
    } else if (triggerRect.right + tooltipRect.width > viewportWidth) {
      newPosition = 'left';
    } else {
      newPosition = 'top';
    }

    setTooltipPosition(newPosition);
  };

  const getPositionClasses = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-t-4 border-x-transparent border-x-4';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-b-4 border-x-transparent border-x-4';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-l-4 border-y-transparent border-y-4';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-r-4 border-y-transparent border-y-4';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-t-4 border-x-transparent border-x-4';
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className='relative inline-block'
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg
            ${getPositionClasses()} ${className}
          `}
          style={{ maxWidth }}
        >
          {content}

          {/* Arrow */}
          <div
            className={`
            absolute w-0 h-0 ${getArrowClasses()}
          `}
          />
        </div>
      )}
    </div>
  );
}

export function SensorTooltip({
  sensorId,
  value,
  unit,
  status,
  timestamp,
  limits,
  children,
  position = 'auto',
  delay = 300,
}: SensorTooltipProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatValue = (val: number | boolean | undefined) => {
    if (val === undefined || val === null) return 'Sem dados';

    if (typeof val === 'boolean') {
      return val ? 'Ligado' : 'Desligado';
    }

    if (typeof val === 'number') {
      return unit ? `${val.toFixed(2)} ${unit}` : val.toFixed(2);
    }

    return String(val);
  };

  const formatTimestamp = (ts: string | undefined) => {
    if (!ts) return 'Desconhecido';
    return new Date(ts).toLocaleString('pt-BR');
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'normal':
        return 'Sensor funcionando normalmente';
      case 'warning':
        return 'Valor próximo aos limites de atenção';
      case 'critical':
        return 'Valor fora dos limites seguros';
      case 'offline':
        return 'Sensor não está respondendo';
      case 'unknown':
        return 'Status do sensor desconhecido';
      default:
        return 'Status não definido';
    }
  };

  const tooltipContent = (
    <div className='space-y-2'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <StatusIcon className={`w-4 h-4 ${config.color}`} />
        <span className='font-medium'>{sensorId}</span>
      </div>

      {/* Status */}
      <div
        className={`px-2 py-1 rounded text-xs ${config.bgColor} ${config.borderColor} border`}
      >
        <span className={config.color}>{config.label}</span>
      </div>

      {/* Valor */}
      <div>
        <div className='text-xs text-gray-300'>Valor Atual:</div>
        <div className='font-mono text-sm'>{formatValue(value)}</div>
      </div>

      {/* Limites */}
      {limits && (
        <div>
          <div className='text-xs text-gray-300'>Limites:</div>
          <div className='text-xs'>
            {limits.min !== undefined && (
              <div>
                Min: {limits.min} {unit}
              </div>
            )}
            {limits.max !== undefined && (
              <div>
                Max: {limits.max} {unit}
              </div>
            )}
            {limits.warningMin !== undefined && (
              <div className='text-yellow-400'>
                Atenção Min: {limits.warningMin} {unit}
              </div>
            )}
            {limits.warningMax !== undefined && (
              <div className='text-yellow-400'>
                Atenção Max: {limits.warningMax} {unit}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div>
        <div className='text-xs text-gray-300'>Última Atualização:</div>
        <div className='text-xs'>{formatTimestamp(timestamp)}</div>
      </div>

      {/* Descrição do Status */}
      <div>
        <div className='text-xs text-gray-300'>Status:</div>
        <div className='text-xs'>{getStatusDescription()}</div>
      </div>
    </div>
  );

  return (
    <Tooltip
      content={tooltipContent}
      position={position}
      delay={delay}
      maxWidth='280px'
    >
      {children}
    </Tooltip>
  );
}

// Hook movido para use-sensor-tooltip.ts para resolver problema de Fast Refresh
