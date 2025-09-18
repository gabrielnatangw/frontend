import React from 'react';
// import { cn } from '../../lib/utils';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Separator: React.FC<SeparatorProps> = ({
  className,
  orientation = 'horizontal',
}) => {
  return (
    <div
      className={`bg-gray-200 ${
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px'
      } ${className || ''}`}
    />
  );
};
