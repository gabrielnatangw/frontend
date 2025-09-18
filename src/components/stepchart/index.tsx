import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface StepChartProps {
  data?: Array<{ name: string; value: number }>;
  className?: string;
}

export default function StepChart({ data, className = '' }: StepChartProps) {
  // Dados de exemplo se não fornecidos
  const defaultData = [
    { name: 'P1', value: 0 },
    { name: 'P2', value: 0 },
    { name: 'P3', value: 1 },
    { name: 'P4', value: 1 },
    { name: 'P5', value: 0 },
    { name: 'P6', value: 0 },
    { name: 'P7', value: 1 },
    { name: 'P8', value: 1 },
    { name: 'P9', value: 0 },
    { name: 'P10', value: 0 },
    { name: 'P11', value: 1 },
    { name: 'P12', value: 1 },
  ];

  const chartData = data || defaultData;

  // Detectar se os dados são digitais (apenas 0 e 1) ou analógicos (0-100)
  const maxValue = Math.max(...chartData.map(d => d.value));
  const isDigitalData = maxValue <= 1;

  // Definir domínio do eixo Y baseado no tipo de dados
  const yAxisDomain = isDigitalData ? [0, 1] : [0, 100];

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis
            dataKey='name'
            tick={{ fontSize: 10 }}
            stroke='#9ca3af'
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke='#9ca3af'
            axisLine={false}
            tickLine={false}
            domain={yAxisDomain}
            ticks={isDigitalData ? [0, 1] : undefined}
          />
          <Tooltip
            cursor={{ stroke: '#93c5fd', strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Line
            type='stepAfter'
            dataKey='value'
            stroke='#2563eb'
            strokeWidth={3}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
