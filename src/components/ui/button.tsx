import * as React from 'react';
import { tvc, type VariantProps } from '@/lib/tv';
import { cn } from '@/lib/cn';

const buttonStyles = tvc({
  base: 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
  variants: {
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-11 px-5 text-lg',
    },
    variant: {
      contained: 'border',
      outline: 'border bg-transparent',
      text: 'bg-transparent border border-transparent',
    },
    // colorScheme sets base text/border tone, background handled by compoundVariants
    colorScheme: {
      primary: 'text-brand-600 border-brand-600/60',
      secondary: 'text-info-600 border-info-700/60',
      default: 'text-muted-800 border-muted-300',
      error: 'text-danger-600 border-danger-600/60',
    },
    full: {
      true: 'w-full',
      false: '',
    },
  },
  compoundVariants: [
    // contained + colorScheme (filled)
    {
      variant: 'contained',
      colorScheme: 'primary',
      class: 'bg-brand-600 text-white border-brand-700 hover:bg-brand-700',
    },
    {
      variant: 'contained',
      colorScheme: 'secondary',
      class: 'bg-info-600 text-white border-info-800 hover:bg-info-700',
    },
    {
      variant: 'contained',
      colorScheme: 'default',
      class: 'bg-muted-100 text-muted-900 border-muted-300 hover:bg-muted-200',
    },
    {
      variant: 'contained',
      colorScheme: 'error',
      class: 'bg-danger-600 text-white border-danger-700 hover:bg-danger-700',
    },

    // outline + colors (transparent bg)
    {
      variant: 'outline',
      colorScheme: 'primary',
      class:
        'bg-transparent text-brand-600 hover:bg-brand-50 border-brand-600/60',
    },
    {
      variant: 'outline',
      colorScheme: 'secondary',
      class: 'bg-transparent text-info-600 hover:bg-info-50 border-info-700/60',
    },
    {
      variant: 'outline',
      colorScheme: 'default',
      class:
        'bg-transparent text-muted-800 hover:bg-muted-100 border-muted-300',
    },
    {
      variant: 'outline',
      colorScheme: 'error',
      class:
        'bg-transparent text-danger-600 hover:bg-danger-50 border-danger-600/60',
    },

    // text + colors (transparent bg)
    {
      variant: 'text',
      colorScheme: 'primary',
      class: 'text-brand-600 hover:bg-brand-50',
    },
    {
      variant: 'text',
      colorScheme: 'secondary',
      class: 'text-info-600 hover:bg-info-50',
    },
    {
      variant: 'text',
      colorScheme: 'default',
      class: 'text-muted-800 hover:bg-muted-100',
    },
    {
      variant: 'text',
      colorScheme: 'error',
      class: 'text-danger-600 hover:bg-danger-50',
    },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'contained',
    colorScheme: 'primary',
    full: false,
  },
});

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonStyles> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size,
      variant,
      colorScheme,
      full,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonStyles({ size, variant, colorScheme, full }),
          className
        )}
        {...props}
      >
        {leftIcon ? (
          <span className='-ml-0.5 inline-flex items-center'>{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon ? (
          <span className='-mr-0.5 inline-flex items-center'>{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
