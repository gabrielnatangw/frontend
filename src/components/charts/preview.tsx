import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import Gauge from '../gauge';

export type PreviewChartType = 'LINE' | 'BAR' | 'GAUGE';

const sample = Array.from({ length: 7 }).map((_, i) => ({
  name: `D${i + 1}`,
  a: Math.round(20 + Math.random() * 80),
  b: Math.round(10 + Math.random() * 60),
}));

function LinePreview() {
  return (
    <ResponsiveContainer width='100%' height={288}>
      <LineChart
        data={sample}
        margin={{ top: 10, right: 12, left: 6, bottom: 0 }}
      >
        <CartesianGrid stroke='#eee' />
        <XAxis dataKey='name' tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip cursor={{ stroke: '#e5e7eb' }} />
        <Line
          type='monotone'
          dataKey='a'
          stroke='#3b82f6'
          strokeWidth={2}
          dot={false}
        />
        <Line
          type='monotone'
          dataKey='b'
          stroke='#f59e0b'
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarPreview() {
  return (
    <ResponsiveContainer width='100%' height={288}>
      <BarChart
        data={sample}
        margin={{ top: 10, right: 12, left: 6, bottom: 0 }}
      >
        <CartesianGrid stroke='#eee' />
        <XAxis dataKey='name' tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip cursor={{ fill: '#f3f4f6' }} />
        <Bar dataKey='a' fill='#3b82f6' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function GaugePreview() {
  const value = 72;
  return (
    <div className='w-full h-72'>
      <Gauge
        value={value}
        min={0}
        max={100}
        responsive
        aspectRatio={0.6}
        showEdgeLabels={false}
        valueFontScale={0.2}
        labelFontScale={0.04}
        strokeWidthScale={0.085}
        valueOffsetScale={0.12}
        lineCap='butt'
        edgeGap={8}
        colors={{
          base: '#2563eb',
          track: '#eef2f7',
          warn: '#f59e0b',
          danger: '#ef4444',
        }}
        formatValue={v => `${Math.round(v)}%`}
      />
    </div>
  );
}

export default function ChartTypePreview({ type }: { type: PreviewChartType }) {
  if (type === 'LINE') return <LinePreview />;
  if (type === 'BAR') return <BarPreview />;
  return <GaugePreview />;
}
