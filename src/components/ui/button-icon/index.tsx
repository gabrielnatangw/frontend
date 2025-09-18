import React from 'react';
import { cn } from '../../../lib/cn';

export type ButtonIconProps = {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  type?: 'button' | 'submit' | 'reset';
};

export function ButtonIcon({
  icon,
  onClick,
  className,
  disabled = false,
  'aria-label': ariaLabel,
  type = 'button',
}: ButtonIconProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'h-9 w-9 rounded-md flex items-center justify-center transition-colors',
        'text-zinc-600 hover:text-zinc-900',
        'hover:bg-zinc-100',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
        className
      )}
    >
      {icon}
    </button>
  );
}

export default ButtonIcon;
