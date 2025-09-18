import React from 'react';
import { cn } from '../../../lib/cn';

export type ContainerProps = {
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  /** Título do container (linha superior do cabeçalho interno) */
  title?: React.ReactNode;
  /** Descrição/legenda abaixo do título (opcional) */
  description?: React.ReactNode;
  /** Área de abas (Tabs) renderizada abaixo do título/descrição no cabeçalho */
  tabs?: React.ReactNode;
  /** Ações do lado direito do cabeçalho (ex.: botões) */
  actions?: React.ReactNode;
  /** Conteúdo interno do container */
  children?: React.ReactNode;
};

/**
 * Container padrão da aplicação.
 * - Borda arredondada, fundo branco e sombra sutil.
 * - Cabeçalho interno com título/descrição e área de ações à direita.
 * - Área de conteúdo rolável se exceder a altura disponível do pai.
 */
export default function Container({
  className,
  headerClassName,
  bodyClassName,
  title,
  description,
  tabs,
  actions,
  children,
}: ContainerProps) {
  return (
    <section
      className={cn(
        'border border-zinc-200 rounded-lg bg-white shadow-sm',
        'overflow-hidden h-full flex flex-col',
        className
      )}
    >
      {tabs && !title && !description ? (
        <div
          className={cn(
            'relative flex items-center justify-between gap-3 px-3 md:px-4 py-2',
            'border-b border-zinc-200',
            headerClassName
          )}
        >
          <div className='min-w-0 flex-1'>{tabs}</div>
          {actions ? (
            <div className='flex items-center gap-2 shrink-0'>{actions}</div>
          ) : null}
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-between gap-3 px-3 md:px-4 py-2',
            'border-b border-zinc-200',
            headerClassName
          )}
        >
          <div className='min-w-0 flex-1'>
            {title && (
              <h4 className='text-sm font-semibold text-zinc-800 truncate'>
                {title}
              </h4>
            )}
            {description && (
              <p className='text-xs text-zinc-500 truncate'>{description}</p>
            )}
            {tabs ? <div className='mt-2 -mb-1'>{tabs}</div> : null}
          </div>
          {actions ? (
            <div className='flex items-center gap-2 shrink-0'>{actions}</div>
          ) : null}
        </div>
      )}

      <div className={cn('p-2 flex-1 overflow-auto', bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
