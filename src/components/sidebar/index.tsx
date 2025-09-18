import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  isValidElement,
  cloneElement,
  useRef,
} from 'react';
import { ChevronDown, Circle } from 'lucide-react';
import { cn } from '../../lib/cn';

export type SidebarItem = {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
};

export type SidebarProps = {
  items: SidebarItem[];
  /**
   * default → sidebar visível em desktop e colapsável
   * hidden → sidebar fica fora da tela quando fechada (mobile/off-canvas)
   */
  variant?: 'default' | 'hidden';
  className?: string;
  /** abre expandido por padrão no desktop */
  initialOpen?: boolean;
  /** conteúdo do topo (logo/marca) */
  brand?: React.ReactNode;
  /** conteúdo inferior (ex.: usuário/versão) */
  footer?: React.ReactNode;
  /** controle externo de abertura */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const WIDTH_OPEN = 320;
const WIDTH_CLOSED = 80;

export function Sidebar({
  items,
  variant = 'default',
  className,
  initialOpen = true,
  brand,
  footer,
  open: openProp,
  onOpenChange,
}: SidebarProps) {
  const isControlled = typeof openProp === 'boolean';
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const open = isControlled ? (openProp as boolean) : uncontrolledOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      if (isControlled) {
        onOpenChange?.(v);
      } else {
        setUncontrolledOpen(v);
      }
    },
    [isControlled, onOpenChange]
  );
  const isHiddenVariant = variant === 'hidden';
  const asideRef = useRef<HTMLDivElement | null>(null);

  // Fecha subitens quando o sidebar é fechado
  useEffect(() => {
    if (!open) {
      setExpanded({});
    }
  }, [open]);

  // Clique fora: quando hidden e aberto, fechar ao clicar fora do aside
  useEffect(() => {
    if (!(isHiddenVariant && open)) return;
    const handleDown = (e: MouseEvent) => {
      const el = asideRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && !el.contains(target)) {
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setOpen(false);
        }
      }
    };
    window.addEventListener('mousedown', handleDown);
    return () => window.removeEventListener('mousedown', handleDown);
  }, [isHiddenVariant, open, onOpenChange, setOpen]);

  // Marca ativo (simplificado para Vite)
  const isActive = useCallback((href?: string) => {
    if (!href) return false;
    // Para Vite, podemos usar window.location.pathname ou implementar roteamento
    return window.location.pathname === href;
  }, []);

  // Expansão de submenus controlada por item
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = useCallback(
    (key: string) => {
      // Se o sidebar estiver fechado, abre ele e expande o item
      if (!open) {
        // Abre o sidebar quando clicar em item com subitens
        if (!isControlled) {
          setUncontrolledOpen(true);
        } else {
          onOpenChange?.(true);
        }
        // Expande o item automaticamente quando o sidebar abrir
        setExpanded(prev => ({ ...prev, [key]: true }));
        return;
      }

      // Se o sidebar estiver aberto, alterna a expansão do item
      setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    },
    [open, isControlled, onOpenChange, setUncontrolledOpen]
  );

  const hasAnyActiveChild = useCallback(
    (it: SidebarItem): boolean => {
      if (!it.children) return false;
      return it.children.some(c => isActive(c.href) || hasAnyActiveChild(c));
    },
    [isActive]
  );

  const normalizedExpanded = useMemo(() => {
    // Retorna apenas o estado manual de expansão
    // Não expande automaticamente itens com filho ativo
    return expanded;
  }, [expanded]);

  // Transform responsivo: fechado fica fora da tela apenas em mobile; no desktop fica visível colapsado
  const transformClasses = open
    ? 'translate-x-0'
    : '-translate-x-full md:translate-x-0';

  return (
    <>
      {/* Overlay sempre que aberto (sobrepõe conteúdo em qualquer breakpoint) */}
      {open && (
        <div
          className='fixed inset-0 z-[9999] bg-transparent backdrop-blur-sm backdrop-saturate-150'
          onClick={() => (onOpenChange ? onOpenChange(false) : setOpen(false))}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-[10000] overflow-hidden h-full flex flex-col bg-brand-800 bg-gradient-to-b from-brand-600 to-brand-800 text-white shadow-2xl border-r border-white/10 transition-transform duration-300',
          transformClasses,
          className
        )}
        ref={asideRef}
        style={{
          width: open ? WIDTH_OPEN : WIDTH_CLOSED,
          transition: 'width 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Cabeçalho / Marca (sem botões internos) */}
        <div className='relative flex items-center justify-between px-4 py-4 '>
          <div
            className={cn('flex items-center gap-2', !open && 'justify-center')}
          >
            {brand ? (
              <div className={cn('flex items-center w-40 h-10')}>{brand}</div>
            ) : (
              <span className='font-semibold'>TRACE</span>
            )}
          </div>
        </div>

        {/* Navegação */}
        <nav className='flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-white/20'>
          <ul className='space-y-1'>
            {items.map(item => (
              <li key={item.title}>
                <MenuEntry
                  item={item}
                  active={isActive(item.href)}
                  expanded={!!normalizedExpanded[item.title]}
                  canShowText={open}
                  onToggle={() => toggleExpanded(item.title)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        {footer && <div className='border-t border-white/10'>{footer}</div>}
      </aside>
    </>
  );
}

function MenuEntry({
  item,
  active,
  expanded,
  canShowText,
  onToggle,
}: {
  item: SidebarItem;
  active: boolean;
  expanded: boolean;
  canShowText: boolean;
  onToggle: () => void;
}) {
  const hasChildren = !!item.children?.length;

  const renderIcon = (icon?: React.ReactNode) => {
    if (isValidElement(icon)) {
      const iconEl = icon as React.ReactElement<{ className?: string }>;
      const merged = cloneElement(iconEl, {
        className: cn('h-5 w-5', iconEl.props?.className),
      });
      return <span aria-hidden>{merged}</span>;
    }
    return <Circle className='h-5 w-5' aria-hidden />;
  };

  const baseClasses = cn(
    'w-full relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group',
    !canShowText && 'justify-center',
    active
      ? 'bg-white/15 text-white shadow-sm'
      : 'hover:bg-white/10 text-white/90 hover:text-white'
  );

  const content = (
    <>
      {/* Ícone (Lucide) */}
      <span
        className={cn(
          'flex-shrink-0 transition-transform group-hover:scale-110'
        )}
      >
        {renderIcon(item.icon)}
      </span>
      {/* Texto */}
      {canShowText && (
        <span className='font-medium text-sm tracking-wide'>{item.title}</span>
      )}
      {/* Chevron */}
      {hasChildren && canShowText && (
        <ChevronDown
          className={cn(
            'ml-auto w-4 h-4 transition-transform duration-200',
            expanded ? 'rotate-180' : ''
          )}
        />
      )}
      {/* Indicador ativo */}
      {active && (
        <span
          className={cn(
            'ml-auto h-6 w-1 rounded bg-white/90',
            !canShowText && 'absolute right-2',
            ''
          )}
        ></span>
      )}
    </>
  );

  if (hasChildren) {
    return (
      <div>
        <button
          type='button'
          className={baseClasses}
          onClick={onToggle}
          aria-expanded={expanded}
        >
          {content}
        </button>
        {expanded && (
          <ul className='mt-2 ml-4 space-y-1'>
            {item.children!.map(child => (
              <li key={child.title}>
                <a
                  href={child.href}
                  className={cn(
                    'block p-2 pl-8 rounded-lg text-sm transition-all duration-200',
                    'text-white/80 hover:text-white hover:bg-white/5'
                  )}
                >
                  {child.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        className={baseClasses}
        aria-current={active ? 'page' : undefined}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type='button'
      className={baseClasses}
      aria-current={active ? 'page' : undefined}
    >
      {content}
    </button>
  );
}

export default Sidebar;
