import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  text = 'Carregando...',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className='flex flex-col items-center gap-3'>
        <Loader2
          className={`animate-spin text-blue-600 ${sizeClasses[size]}`}
        />
        {text && <span className='text-sm text-zinc-600'>{text}</span>}
      </div>
    </div>
  );
}

export default LoadingSpinner;
