/**
 * Componentes de Gráficos Históricos
 *
 * Componentes otimizados para exibir dados históricos
 * de sensores com performance e responsividade.
 */

import React, { useMemo } from 'react';
// import { HistoricalDataPoint } from '../../lib/stores/history-store';

export interface LineChartProps {
  data: Array<{ x: string; y: number }>;
  title?: string;
  unit?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showPoints?: boolean;
  animated?: boolean;
  className?: string;
}

export interface StepChartProps {
  data: Array<{ x: string; y: number; status: number }>;
  title?: string;
  unit?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showStatusColors?: boolean;
  animated?: boolean;
  className?: string;
}

export interface BarChartProps {
  data: Array<{ x: string; y: number; status: number }>;
  title?: string;
  unit?: string;
  height?: number;
  showGrid?: boolean;
  showStatusColors?: boolean;
  animated?: boolean;
  className?: string;
}

const statusColors = {
  0: '#10b981', // Normal - Verde
  10: '#f59e0b', // Atenção - Amarelo
  20: '#ef4444', // Crítico - Vermelho
};

/**
 * Componente de Gráfico de Linha Histórico
 */
export function HistoricalLineChart({
  data,
  title,
  unit,
  color = '#3b82f6',
  height = 200,
  showGrid = true,
  showPoints = true,
  animated = true,
  className = '',
}: LineChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { points: [], minY: 0, maxY: 100 };

    // Filtrar valores válidos e não NaN
    const validData = data.filter(d => typeof d.y === 'number' && !isNaN(d.y));
    if (validData.length === 0) return { points: [], minY: 0, maxY: 100 };

    const values = validData.map(d => d.y);
    const minY = Math.min(...values);
    const maxY = Math.max(...values);

    // Evitar divisão por zero
    const range = maxY - minY;
    const padding = range > 0 ? range * 0.1 : 1;
    const denominator = range + padding * 2;

    // Se o denominador for zero ou muito pequeno, usar valores padrão
    if (denominator <= 0) {
      return {
        points: validData.map((point, index) => ({
          x: (index / (validData.length - 1)) * 100,
          y: 50, // Valor central
          label: point.x,
          value: point.y,
        })),
        minY: minY - padding,
        maxY: maxY + padding,
      };
    }

    return {
      points: validData.map((point, index) => ({
        x: (index / (validData.length - 1)) * 100,
        y: ((point.y - minY + padding) / denominator) * 100,
        label: point.x,
        value: point.y,
      })),
      minY: minY - padding,
      maxY: maxY + padding,
    };
  }, [data]);

  const pathData = useMemo(() => {
    if (chartData.points.length === 0) return '';

    return chartData.points
      .map(
        (point, index) =>
          `${index === 0 ? 'M' : 'L'} ${point.x} ${100 - point.y}`
      )
      .join(' ');
  }, [chartData.points]);

  return (
    <div className={`relative w-full ${className}`}>
      {title && (
        <div className='text-sm font-medium text-gray-700 mb-2'>{title}</div>
      )}

      <div className='relative w-full' style={{ height }}>
        <svg
          width='100%'
          height='100%'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
          className='overflow-visible'
        >
          {/* Grid */}
          {showGrid && (
            <g className='opacity-20'>
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1='0'
                  y1={y}
                  x2='100'
                  y2={y}
                  stroke='#e5e7eb'
                  strokeWidth='0.5'
                />
              ))}
              {[0, 25, 50, 75, 100].map(x => (
                <line
                  key={x}
                  x1={x}
                  y1='0'
                  x2={x}
                  y2='100'
                  stroke='#e5e7eb'
                  strokeWidth='0.5'
                />
              ))}
            </g>
          )}

          {/* Linha */}
          <path
            d={pathData}
            fill='none'
            stroke={color}
            strokeWidth='2'
            className={animated ? 'animate-pulse' : ''}
          />

          {/* Pontos */}
          {showPoints &&
            chartData.points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={100 - point.y}
                r='1'
                fill={color}
                className={animated ? 'animate-pulse' : ''}
              />
            ))}
        </svg>

        {/* Labels */}
        <div className='absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500'>
          <span>
            {chartData.minY.toFixed(1)} {unit}
          </span>
          <span>
            {chartData.maxY.toFixed(1)} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de Gráfico de Step Histórico
 */
export function HistoricalStepChart({
  data,
  title,
  unit,
  color = '#3b82f6',
  height = 200,
  showGrid = true,
  showStatusColors = true,
  animated = true,
  className = '',
}: StepChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { steps: [], minY: 0, maxY: 100 };

    // Filtrar valores válidos e não NaN
    const validData = data.filter(d => typeof d.y === 'number' && !isNaN(d.y));
    if (validData.length === 0) return { steps: [], minY: 0, maxY: 100 };

    const values = validData.map(d => d.y);
    const minY = Math.min(...values);
    const maxY = Math.max(...values);

    // Evitar divisão por zero
    const range = maxY - minY;
    const padding = range > 0 ? range * 0.1 : 1;
    const denominator = range + padding * 2;

    // Se o denominador for zero ou muito pequeno, usar valores padrão
    if (denominator <= 0) {
      return {
        steps: validData.map((point, index) => ({
          x: (index / (validData.length - 1)) * 100,
          y: 50, // Valor central
          label: point.x,
          value: point.y,
          status: point.status,
          color: showStatusColors
            ? statusColors[point.status as keyof typeof statusColors] || color
            : color,
        })),
        minY: minY - padding,
        maxY: maxY + padding,
      };
    }

    return {
      steps: validData.map((point, index) => ({
        x: (index / (validData.length - 1)) * 100,
        y: ((point.y - minY + padding) / denominator) * 100,
        label: point.x,
        value: point.y,
        status: point.status,
        color: showStatusColors
          ? statusColors[point.status as keyof typeof statusColors] || color
          : color,
      })),
      minY: minY - padding,
      maxY: maxY + padding,
    };
  }, [data, showStatusColors, color]);

  const pathData = useMemo(() => {
    if (chartData.steps.length === 0) return '';

    const steps = [];
    for (let i = 0; i < chartData.steps.length; i++) {
      const current = chartData.steps[i];
      const next = chartData.steps[i + 1];

      // Validar valores antes de usar
      const currentX = isNaN(current.x) ? 0 : current.x;
      const currentY = isNaN(current.y)
        ? 50
        : Math.max(0, Math.min(100, current.y));

      if (i === 0) {
        steps.push(`M ${currentX} ${100 - currentY}`);
      }

      if (next) {
        const nextX = isNaN(next.x) ? 0 : next.x;
        const nextY = isNaN(next.y) ? 50 : Math.max(0, Math.min(100, next.y));

        steps.push(`L ${nextX} ${100 - currentY}`);
        steps.push(`L ${nextX} ${100 - nextY}`);
      }
    }

    return steps.join(' ');
  }, [chartData.steps]);

  return (
    <div className={`relative w-full ${className}`}>
      {title && (
        <div className='text-sm font-medium text-gray-700 mb-2'>{title}</div>
      )}

      <div className='relative w-full' style={{ height }}>
        <svg
          width='100%'
          height='100%'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
          className='overflow-visible'
        >
          {/* Grid */}
          {showGrid && (
            <g className='opacity-20'>
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1='0'
                  y1={y}
                  x2='100'
                  y2={y}
                  stroke='#e5e7eb'
                  strokeWidth='0.5'
                />
              ))}
            </g>
          )}

          {/* Linha de step */}
          <path
            d={pathData}
            fill='none'
            stroke='#3b82f6'
            strokeWidth='2'
            className={animated ? 'animate-pulse' : ''}
          />

          {/* Pontos com cores de status */}
          {chartData.steps.map((step, index) => {
            const x = isNaN(step.x) ? 0 : step.x;
            const y = isNaN(step.y) ? 50 : Math.max(0, Math.min(100, step.y));

            return (
              <circle
                key={index}
                cx={x}
                cy={100 - y}
                r='1.5'
                fill={step.color}
                className={animated ? 'animate-pulse' : ''}
              />
            );
          })}
        </svg>

        {/* Labels */}
        <div className='absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500'>
          <span>
            {chartData.minY.toFixed(1)} {unit}
          </span>
          <span>
            {chartData.maxY.toFixed(1)} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de Gráfico de Barra Histórico
 */
export function HistoricalBarChart({
  data,
  title,
  unit,
  height = 200,
  showGrid = true,
  showStatusColors = true,
  animated = true,
  className = '',
}: BarChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { bars: [], maxY: 100 };

    const values = data.map(d => d.y);
    const maxY = Math.max(...values);

    return {
      bars: data.map((point, index) => ({
        x: (index / data.length) * 100,
        width: (1 / data.length) * 100,
        height: (point.y / maxY) * 100,
        label: point.x,
        value: point.y,
        status: point.status,
        color: showStatusColors
          ? statusColors[point.status as keyof typeof statusColors] || '#3b82f6'
          : '#3b82f6',
      })),
      maxY,
    };
  }, [data, showStatusColors]);

  return (
    <div className={`relative w-full ${className}`}>
      {title && (
        <div className='text-sm font-medium text-gray-700 mb-2'>{title}</div>
      )}

      <div className='relative w-full' style={{ height }}>
        <svg
          width='100%'
          height='100%'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
          className='overflow-visible'
        >
          {/* Grid */}
          {showGrid && (
            <g className='opacity-20'>
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1='0'
                  y1={y}
                  x2='100'
                  y2={y}
                  stroke='#e5e7eb'
                  strokeWidth='0.5'
                />
              ))}
            </g>
          )}

          {/* Barras */}
          {chartData.bars.map((bar, index) => (
            <rect
              key={index}
              x={bar.x}
              y={100 - bar.height}
              width={bar.width * 0.8}
              height={bar.height}
              fill={bar.color}
              className={animated ? 'animate-pulse' : ''}
            />
          ))}
        </svg>

        {/* Labels */}
        <div className='absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500'>
          <span>0 {unit}</span>
          <span>
            {chartData.maxY.toFixed(1)} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de Gráfico Combinado
 */
export interface CombinedChartProps {
  lineData?: Array<{ x: string; y: number }>;
  stepData?: Array<{ x: string; y: number; status: number }>;
  barData?: Array<{ x: string; y: number; status: number }>;
  title?: string;
  unit?: string;
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
}

export function CombinedHistoricalChart({
  lineData,
  stepData,
  barData,
  title,
  unit: _unit,
  height = 200,
  showGrid = true,
  animated = true,
  className = '',
}: CombinedChartProps) {
  const hasData = lineData?.length || stepData?.length || barData?.length;

  if (!hasData) {
    return (
      <div className={`relative w-full ${className}`}>
        {title && (
          <div className='text-sm font-medium text-gray-700 mb-2'>{title}</div>
        )}
        <div className='flex items-center justify-center h-48 text-gray-500'>
          <div className='text-center'>
            <div className='text-sm'>Sem dados históricos</div>
            <div className='text-xs'>Aguardando dados...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {title && (
        <div className='text-sm font-medium text-gray-700 mb-2'>{title}</div>
      )}

      <div className='relative w-full' style={{ height }}>
        <svg
          width='100%'
          height='100%'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
          className='overflow-visible'
        >
          {/* Grid */}
          {showGrid && (
            <g className='opacity-20'>
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1='0'
                  y1={y}
                  x2='100'
                  y2={y}
                  stroke='#e5e7eb'
                  strokeWidth='0.5'
                />
              ))}
            </g>
          )}

          {/* Renderizar gráficos baseado nos dados disponíveis */}
          {lineData && lineData.length > 0 && (
            <g>
              <path
                d={lineData
                  .map(
                    (point, index) =>
                      `${index === 0 ? 'M' : 'L'} ${(index / (lineData.length - 1)) * 100} ${100 - (point.y / Math.max(...lineData.map(d => d.y))) * 100}`
                  )
                  .join(' ')}
                fill='none'
                stroke='#3b82f6'
                strokeWidth='2'
                className={animated ? 'animate-pulse' : ''}
              />
            </g>
          )}

          {stepData && stepData.length > 0 && (
            <g>
              {stepData.map((point, index) => (
                <circle
                  key={index}
                  cx={(index / (stepData.length - 1)) * 100}
                  cy={
                    100 - (point.y / Math.max(...stepData.map(d => d.y))) * 100
                  }
                  r='1.5'
                  fill={
                    statusColors[point.status as keyof typeof statusColors] ||
                    '#3b82f6'
                  }
                  className={animated ? 'animate-pulse' : ''}
                />
              ))}
            </g>
          )}

          {barData && barData.length > 0 && (
            <g>
              {barData.map((point, index) => (
                <rect
                  key={index}
                  x={(index / barData.length) * 100}
                  y={100 - (point.y / Math.max(...barData.map(d => d.y))) * 100}
                  width={(1 / barData.length) * 100 * 0.8}
                  height={(point.y / Math.max(...barData.map(d => d.y))) * 100}
                  fill={
                    statusColors[point.status as keyof typeof statusColors] ||
                    '#3b82f6'
                  }
                  className={animated ? 'animate-pulse' : ''}
                />
              ))}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
