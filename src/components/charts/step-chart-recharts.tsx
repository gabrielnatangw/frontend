import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface StepChartRechartsProps {
  data: Array<{ x: string; y: number; status: number }>;
  title?: string;
  unit?: string;
  height?: number;
  className?: string;
}

export function StepChartRecharts({
  data,
  title,
  unit,
  height = 200,
  className = '',
}: StepChartRechartsProps) {
  // Debug detalhado: Log completo dos dados recebidos
  console.log('🔍 StepChartRecharts - DADOS RECEBIDOS COMPLETOS:', {
    dataLength: data.length,
    data: data, // TODOS os dados, não apenas os últimos 3
    title: title,
    unit: unit,
  });

  // Validar se há dados
  if (!data || data.length === 0) {
    console.log('⚠️ StepChartRecharts - NENHUM DADO RECEBIDO');
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        {title && (
          <div className='text-sm font-medium text-gray-700 mb-2'>
            {title} {unit && `(${unit})`}
          </div>
        )}
        <div className='flex items-center justify-center h-full text-gray-500'>
          <div className='text-center'>
            <div className='text-sm font-medium'>Nenhum dado disponível</div>
            <div className='text-xs text-gray-400 mt-1'>
              Aguarde os dados chegarem via WebSocket
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Transformar dados para o formato do Recharts com debug detalhado
  const chartData = data.map((point, index) => {
    // Converter boolean para número: true = 1, false = 0
    let value = 0;
    if (typeof point.y === 'boolean') {
      value = point.y ? 1 : 0;
    } else if (typeof point.y === 'number') {
      value = point.y;
    } else {
      value = 0;
    }

    const status = typeof point.status === 'number' ? point.status : 0;

    const transformedPoint = {
      time: point.x || `Ponto ${index + 1}`,
      value: value,
      status: status,
      originalTimestamp: (point as any).timestamp || point.x, // Usar timestamp se existir, senão usar x
    };

    // Debug individual de cada ponto transformado
    console.log(`🔍 StepChartRecharts - PONTO TRANSFORMADO ${index + 1}:`, {
      original: point,
      transformed: transformedPoint,
      originalValue: point.y,
      convertedValue: value,
      valueType: typeof point.y,
      status: status,
      time: point.x,
    });

    return transformedPoint;
  });

  // Debug: Log dos dados transformados com análise detalhada
  console.log('📊 StepChartRecharts - DADOS TRANSFORMADOS COMPLETOS:', {
    chartDataLength: chartData.length,
    chartData: chartData, // TODOS os dados transformados
    values: chartData.map(p => p.value), // Apenas os valores
    times: chartData.map(p => p.time), // Apenas os tempos
    statuses: chartData.map(p => p.status), // Apenas os status
  });

  // Debug: Análise dos valores para verificar se estão mudando
  const uniqueValues = [...new Set(chartData.map(p => p.value))];
  const uniqueStatuses = [...new Set(chartData.map(p => p.status))];
  console.log('🔍 StepChartRecharts - ANÁLISE DE VALORES TRANSFORMADOS:', {
    uniqueValues: uniqueValues,
    uniqueStatuses: uniqueStatuses,
    hasValueChanges: uniqueValues.length > 1,
    hasStatusChanges: uniqueStatuses.length > 1,
    valueRange:
      uniqueValues.length > 0
        ? `${Math.min(...uniqueValues)} - ${Math.max(...uniqueValues)}`
        : 'N/A',
    allValues: chartData.map(p => p.value),
  });

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      {title && (
        <div className='text-sm font-medium text-gray-700 mb-2'>
          {title} {unit && `(${unit})`}
        </div>
      )}

      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={chartData}
          margin={{
            left: 0,
            right: 0,
            top: 8,
            bottom: 20,
          }}
          style={{ transform: 'translate(-32px, 0px)' }}
        >
          <CartesianGrid
            vertical={false}
            horizontal={true}
            stroke='#e5e7eb'
            strokeDasharray='3 3'
          />
          <XAxis
            dataKey='time'
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={value => value}
            fontSize={12}
          />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 1]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={value => value.toFixed(0)}
            fontSize={12}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
                    <p className='text-sm font-medium text-gray-700'>{label}</p>
                    <p className='text-sm text-blue-600'>
                      Valor: {payload[0].value}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Status: {data?.status || 'N/A'}
                    </p>
                    {data?.originalTimestamp && (
                      <p className='text-xs text-gray-400'>
                        Timestamp:{' '}
                        {new Date(data.originalTimestamp).toLocaleString(
                          'pt-BR'
                        )}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            dataKey='value'
            type='step'
            stroke='#3b82f6'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
