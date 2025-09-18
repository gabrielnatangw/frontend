import React from 'react';
import { MoreVertical } from 'lucide-react';

export interface DataCardField {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
}

export interface DataCardAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
}

export interface DataCardProps {
  // Dados principais
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;

  // Campos de dados
  fields: DataCardField[];

  // Status e badges
  status?: {
    label: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  };
  badges?: Array<{
    label: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  }>;

  // Ações
  actions?: DataCardAction[];

  // Estado
  isDeleted?: boolean;
  isDisabled?: boolean;

  // Estilo
  className?: string;
}

function DataCard({
  title,
  subtitle,
  icon,
  iconBgColor = 'bg-brand-50',
  iconColor = 'text-brand-600',
  fields,
  status,
  badges = [],
  actions = [],
  isDeleted = false,
  isDisabled = false,
  className = '',
}: DataCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const statusVariants = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const badgeVariants = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-700',
  };

  const actionVariants = {
    default: 'text-zinc-700 hover:bg-zinc-50',
    danger: 'text-red-600 hover:bg-red-50',
    success: 'text-green-600 hover:bg-green-50',
  };

  return (
    <div
      className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
        isDeleted ? 'border-red-200 bg-red-50' : 'border-zinc-200'
      } ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          {icon && (
            <div className={`p-2 rounded-lg ${iconBgColor}`}>
              <div className={`h-5 w-5 ${iconColor}`}>{icon}</div>
            </div>
          )}
          <div>
            <h3 className='font-semibold text-zinc-900 text-lg'>{title}</h3>
            {subtitle && <p className='text-zinc-600 text-sm'>{subtitle}</p>}
          </div>
        </div>

        {/* Menu de ações */}
        {actions.length > 0 && (
          <div className='relative'>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className='p-1 hover:bg-zinc-100 rounded'
              disabled={isDisabled}
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className='absolute right-0 top-full mt-1 w-40 bg-white border border-zinc-200 rounded-md shadow-lg z-10'>
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm ${actionVariants[action.variant || 'default']}`}
                    onClick={() => {
                      action.onClick();
                      setMenuOpen(false);
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Campos de dados */}
      <div className='space-y-3'>
        {/* Status e badges */}
        {(status || badges.length > 0) && (
          <div className='flex items-center justify-between'>
            {status && (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusVariants[status.variant]}`}
              >
                {status.label}
              </span>
            )}
            <div className='flex gap-2'>
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeVariants[badge.variant]}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Grid de campos */}
        <div className='grid grid-cols-2 gap-4 text-sm'>
          {fields.map((field, index) => (
            <div key={index}>
              <span className='text-zinc-500'>{field.label}:</span>
              <div className='font-medium text-zinc-900 flex items-center gap-1'>
                {field.icon && field.icon}
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DataCard;
