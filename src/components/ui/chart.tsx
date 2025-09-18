import React from 'react';

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps {
  config: ChartConfig;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  config: _config,
  children,
  className = '',
}: ChartContainerProps) {
  return <div className={`w-full h-full ${className}`}>{children}</div>;
}

interface ChartTooltipProps {
  cursor?: boolean;
  content?: React.ReactNode;
}

export function ChartTooltip({
  cursor: _cursor = false,
  content: _content,
}: ChartTooltipProps) {
  return null; // Recharts já tem tooltip nativo
}

interface ChartTooltipContentProps {
  hideLabel?: boolean;
  className?: string;
}

export function ChartTooltipContent({
  hideLabel: _hideLabel = false,
  className: _className = '',
}: ChartTooltipContentProps) {
  return null; // Recharts já tem tooltip nativo
}
