import React from 'react';
import { cn } from '../../lib/cn';

export type CardPrimaryRootProps = {
  className?: string;
  children?: React.ReactNode;
};

function Root({ className, children }: CardPrimaryRootProps) {
  return (
    <section
      className={cn(
        // Base per docs: w-full h-min p-4 border rounded, shadow, bg-white
        'w-full h-min p-4 border border-zinc-200 rounded-lg shadow-md bg-white',
        // Tokens suggestion (mantidos por padrão via cores neutras)
        // bg-white -> bg-bg | border-zinc-200 -> border-muted-200 | text via herdado
        className
      )}
    >
      {children}
    </section>
  );
}

export type CardPrimaryHeaderProps = {
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
};

function Header({
  className,
  title,
  subtitle,
  actions,
}: CardPrimaryHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className='min-w-0'>
        {title && (
          <h3 className='text-sm font-semibold text-zinc-800 truncate'>
            {title}
          </h3>
        )}
        {subtitle && (
          <p className='text-xs text-zinc-500 truncate'>{subtitle}</p>
        )}
      </div>
      {actions ? (
        <div className='shrink-0 flex items-center gap-2'>{actions}</div>
      ) : null}
    </div>
  );
}

export type CardPrimaryBodyProps = {
  className?: string;
  children?: React.ReactNode;
};

function Body({ className, children }: CardPrimaryBodyProps) {
  return (
    <div className={cn('mt-3 text-sm text-zinc-700', className)}>
      {children}
    </div>
  );
}

export type CardPrimaryListProps = {
  className?: string;
  children?: React.ReactNode;
};

function List({ className, children }: CardPrimaryListProps) {
  return (
    <ul className={cn('mt-3 divide-y divide-zinc-200', className)}>
      {children}
    </ul>
  );
}

export type CardPrimaryListItemProps = {
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
};

function ListItem({
  className,
  title,
  description,
  right,
}: CardPrimaryListItemProps) {
  return (
    <li
      className={cn('py-2 flex items-center justify-between gap-3', className)}
    >
      <div className='min-w-0'>
        {title && <div className='text-sm text-zinc-800 truncate'>{title}</div>}
        {description && (
          <div className='text-xs text-zinc-500 truncate'>{description}</div>
        )}
      </div>
      {right ? <div className='shrink-0'>{right}</div> : null}
    </li>
  );
}

const CardPrimary = {
  Root,
  Header,
  Body,
  List,
  ListItem,
};

export default CardPrimary;
