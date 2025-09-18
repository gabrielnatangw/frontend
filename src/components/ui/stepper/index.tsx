import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../lib/cn';

export type Step = {
  id?: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

export type StepperProps = {
  steps: Step[];
  current: number; // 0-based index
  onStepChange?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  // When true, show connecting lines between steps (horizontal only). Default: true
  connect?: boolean;
  // Visual size preset
  size?: 'sm' | 'md' | 'lg';
  // Visual emphasis for connectors and colors
  emphasis?: 'subtle' | 'solid';
  // Show numeric index even when completed
  showNumbers?: boolean;
  // Place description below label (horizontal)
  describeBelow?: boolean;
  // Visual variant: classic dots or wizard header
  variant?: 'dots' | 'wizard';
};

function getStatus(index: number, current: number): StepStatus {
  if (index < current) return 'completed';
  if (index === current) return 'active';
  return 'pending';
}

export default function Stepper({
  steps,
  current,
  onStepChange,
  orientation = 'horizontal',
  className,
  connect = true,
  size = 'md',
  emphasis = 'subtle',
  showNumbers = false,
  describeBelow = true,
  variant = 'dots',
}: StepperProps) {
  const isHorizontal = orientation === 'horizontal';
  const sizes = {
    sm: {
      bullet: 'h-7 w-7 text-[12px]',
      top: 'top-3.5',
      label: 'text-[13px]',
      desc: 'text-[11px]',
      gap: 'gap-2',
    },
    md: {
      bullet: 'h-9 w-9 text-[13px]',
      top: 'top-4',
      label: 'text-sm',
      desc: 'text-xs',
      gap: 'gap-3',
    },
    lg: {
      bullet: 'h-11 w-11 text-[14px]',
      top: 'top-5',
      label: 'text-[15px]',
      desc: 'text-[13px]',
      gap: 'gap-3.5',
    },
  } as const;
  const sz = sizes[size];

  if (variant === 'wizard') {
    const total = steps.length;
    // Corrigir a lógica do índice para evitar problemas de espelhamento
    const idx = Math.max(0, Math.min(current, total - 1));
    const cur = steps[idx];
    const progress = total > 0 ? ((idx + 1) / total) * 100 : 0;

    console.log('🔍 Stepper Wizard Debug:', { current, total, idx, progress });

    return (
      <div className={cn('w-full', className)}>
        <div className={cn('flex items-center w-full gap-3')}>
          {/* Col 1, Row 1 (auto) */}
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold',
              size === 'lg'
                ? 'h-11 w-11 text-[14px]'
                : size === 'sm'
                  ? 'h-8 w-8 text-[12px]'
                  : 'h-9 w-9 text-[13px]'
            )}
          >
            {idx + 1}
          </span>

          {/* Progress bar + counter under title */}
          <div className='flex items-center gap-2 flex-1 min-w-0'>
            <div className='flex-col flex w-full'>
              <div
                className={cn(
                  'text-zinc-800 font-medium',
                  size === 'lg'
                    ? 'text-[15px]'
                    : size === 'sm'
                      ? 'text-[13px]'
                      : 'text-sm'
                )}
              >
                {cur?.label ?? ''}
              </div>
              <div className='w-full h-[4px] bg-blue-100 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-blue-500 rounded-full transition-all duration-300'
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className='text-zinc-500 text-xs md:text-sm whitespace-nowrap'>
              {idx + 1} de {total}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('w-full', isHorizontal ? '' : 'flex', className)}
      role='tablist'
      aria-orientation={orientation}
    >
      {isHorizontal ? (
        <div
          className={cn(
            'flex w-full items-start',
            steps.length > 1 ? 'justify-between' : 'justify-start',
            'relative'
          )}
        >
          {steps.map((s, i) => {
            const status = getStatus(i, current);
            const clickable = !!onStepChange && !s.disabled;
            return (
              <div key={s.id ?? i} className={cn('relative flex-1')}>
                {/* Connector line (left side) */}
                {connect && i > 0 && (
                  <div
                    aria-hidden
                    className={cn(
                      'absolute left-[-50%] -translate-x-1/2 w-[100%] z-0',
                      sz.top,
                      'h-[2px]',
                      status === 'completed'
                        ? emphasis === 'solid'
                          ? 'bg-blue-600'
                          : 'bg-blue-500'
                        : emphasis === 'solid'
                          ? 'bg-zinc-300'
                          : 'bg-zinc-200'
                    )}
                  />
                )}
                <StepItem
                  index={i}
                  step={s}
                  status={status}
                  clickable={clickable}
                  onClick={() => clickable && onStepChange?.(i)}
                  size={size}
                  emphasis={emphasis}
                  showNumbers={showNumbers}
                  describeBelow={describeBelow}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className='flex w-full gap-3'>
          <div className='flex flex-col items-center gap-4 pt-1'>
            {steps.map((s, i) => {
              const status = getStatus(i, current);
              const isLast = i === steps.length - 1;
              return (
                <React.Fragment key={s.id ?? i}>
                  <StepBullet
                    status={status}
                    index={i}
                    size={size}
                    emphasis={emphasis}
                    showNumbers={showNumbers}
                  />
                  {!isLast && (
                    <div
                      className={cn(
                        'w-px grow',
                        emphasis === 'solid' ? 'bg-zinc-300' : 'bg-zinc-200'
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className='flex-1'>
            {steps.map((s, i) => {
              // const status = getStatus(i, current);
              const clickable = !!onStepChange && !s.disabled;
              return (
                <button
                  key={s.id ?? i}
                  type='button'
                  role='tab'
                  aria-selected={i === current}
                  onClick={() => clickable && onStepChange?.(i)}
                  disabled={!clickable}
                  className={cn(
                    'w-full text-left py-2 px-3 rounded-md border mb-2',
                    i === current
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-zinc-200 hover:bg-zinc-50',
                    s.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div
                    className={cn(
                      'font-medium text-zinc-800',
                      sizes[size].label
                    )}
                  >
                    {s.label}
                  </div>
                  {s.description && (
                    <div
                      className={cn('text-zinc-500 mt-0.5', sizes[size].desc)}
                    >
                      {s.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StepItem({
  step,
  status,
  index,
  clickable,
  onClick,
  size,
  emphasis,
  showNumbers,
  describeBelow,
}: {
  step: Step;
  status: StepStatus;
  index: number;
  clickable: boolean;
  onClick?: () => void;
  size: 'sm' | 'md' | 'lg';
  emphasis: 'subtle' | 'solid';
  showNumbers: boolean;
  describeBelow: boolean;
}) {
  const sizes = {
    sm: {
      bullet: 'h-7 w-7 text-[12px]',
      label: 'text-[13px]',
      desc: 'text-[11px]',
      gap: 'gap-2',
    },
    md: {
      bullet: 'h-9 w-9 text-[13px]',
      label: 'text-sm',
      desc: 'text-xs',
      gap: 'gap-3',
    },
    lg: {
      bullet: 'h-11 w-11 text-[14px]',
      label: 'text-[15px]',
      desc: 'text-[13px]',
      gap: 'gap-3.5',
    },
  } as const;
  return (
    <button
      type='button'
      role='tab'
      aria-selected={status === 'active'}
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        'group inline-flex items-start',
        sizes[size].gap,
        'px-1.5 py-1',
        clickable ? 'cursor-pointer' : 'cursor-default',
        'disabled:opacity-60'
      )}
      title={step.label}
    >
      <StepBullet
        status={status}
        index={index}
        size={size}
        emphasis={emphasis}
        showNumbers={showNumbers}
      />
      <div className='min-w-0'>
        <div
          className={cn(
            'font-medium truncate',
            sizes[size].label,
            status === 'active'
              ? 'text-blue-700'
              : status === 'completed'
                ? 'text-zinc-700'
                : 'text-zinc-600'
          )}
        >
          {step.label}
        </div>
        {step.description && describeBelow && (
          <div className={cn('text-zinc-500 truncate', sizes[size].desc)}>
            {step.description}
          </div>
        )}
      </div>
    </button>
  );
}

function StepBullet({
  status,
  index,
  size,
  emphasis,
  showNumbers,
}: {
  status: StepStatus;
  index: number;
  size: 'sm' | 'md' | 'lg';
  emphasis: 'subtle' | 'solid';
  showNumbers: boolean;
}) {
  const bulletSize =
    size === 'sm'
      ? 'h-7 w-7 text-[12px]'
      : size === 'lg'
        ? 'h-11 w-11 text-[14px]'
        : 'h-9 w-9 text-[13px]';
  return (
    <span
      aria-hidden
      className={cn(
        'relative z-10 mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full border font-medium',
        bulletSize,
        status === 'completed'
          ? emphasis === 'solid'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-blue-600/90 text-white border-blue-600/90'
          : status === 'active'
            ? cn(
                'bg-white border-blue-600 text-blue-700',
                'ring-2 ring-blue-500/30'
              )
            : emphasis === 'solid'
              ? 'bg-white border-zinc-300 text-zinc-500'
              : 'bg-white border-zinc-300 text-zinc-500'
      )}
    >
      {status === 'completed' && !showNumbers ? (
        <Check className='h-4 w-4' />
      ) : (
        index + 1
      )}
    </span>
  );
}
