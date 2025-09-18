import React from 'react';
import { cn } from '../../lib/cn';
import ButtonIcon from '../ui/button-icon';
import { Menu } from 'lucide-react';
import ProfileDropdown from '../ui/profile-dropdown';

export type TopbarProps = {
  className?: string;
  title?: string;
  onMenuClick?: () => void;
  onAppsClick?: () => void;
  onNotificationsClick?: () => void;
  onAppSelect?: (appId: string | number) => void;

  user?: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  /** Se verdadeiro, o Topbar reserva espaço para o Sidebar no desktop */
  reserveSidebarSpace?: boolean;
  /** Estado de abertura do Sidebar (para calcular o deslocamento no desktop) */
  sidebarOpen?: boolean;
  /** Lista de notificações exibidas no dropdown */
  notifications?: Array<{
    id: string | number;
    title: string;
    description: string;
    read?: boolean;
    createdAt: Date | string | number;
  }>;
  /** Lista de apps para o seletor de aplicativos */
  apps?: Array<{
    id: string | number;
    name: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
};

export function Topbar({
  className,
  title,
  onMenuClick,
  onAppsClick: _onAppsClick,
  onAppSelect: _onAppSelect,
  onNotificationsClick: _onNotificationsClick,
  // user,
  reserveSidebarSpace = true,
  sidebarOpen = false,
  notifications: _notifications = [],
  apps: _apps = [],
}: TopbarProps) {
  const [notifOpen, setNotifOpen] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement | null>(null);

  // Fechar ao clicar fora
  React.useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      const el = notifRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && !el.contains(target)) setNotifOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  // Fechar com Esc
  React.useEffect(() => {
    if (!notifOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotifOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [notifOpen]);

  // const lastFive = React.useMemo(
  //   () => notifications.slice(0, 5),
  //   [notifications]
  // );

  // Apps dropdown
  const [appsOpen, setAppsOpen] = React.useState(false);
  const appsRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!appsOpen) return;
    const handler = (e: MouseEvent) => {
      const el = appsRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && !el.contains(target)) setAppsOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [appsOpen]);
  React.useEffect(() => {
    if (!appsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAppsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [appsOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-[9000] h-16 w-full border-b border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60',
        'flex items-center',
        // usar padding-left para não aumentar a largura total e evitar overflow horizontal
        reserveSidebarSpace && (sidebarOpen ? 'md:pl-[320px]' : 'md:pl-[80px]'),
        'transition-[padding] duration-300',
        className
      )}
      role='banner'
    >
      <div className='flex items-center justify-between w-full px-4 md:px-4'>
        {/* Left group: menu and title */}
        <div className='flex items-center gap-2.5 min-w-0'>
          <ButtonIcon
            aria-label='Abrir menu lateral'
            icon={<Menu />}
            onClick={onMenuClick}
          />
          {title && (
            <h1 className='truncate text-[1.1rem] md:text-xl font-semibold text-zinc-700'>
              {title}
            </h1>
          )}
        </div>

        {/* Right group: notifications, apps, avatar */}
        <div className='flex items-center gap-2'>
          {/* Temporariamente comentado - ícones de notificação e seleção de app */}
          {/* <div
            className='hidden sm:flex items-center gap-2.5 relative'
            ref={notifRef}
          >
            <ButtonIcon
              aria-label='Notificações'
              icon={<Bell />}
              onClick={() => {
                setNotifOpen(v => {
                  const next = !v;
                  if (next) setAppsOpen(false);
                  return next;
                });
                onNotificationsClick?.();
              }}
            />
            <div className='absolute right-0 top-full mt-2 w-[320px] max-h-[360px] bg-white border border-zinc-200 rounded-lg shadow-lg z-[9500] flex flex-col'>
              <div className='p-2 border-b border-zinc-200'>
                <span className='text-sm font-semibold text-zinc-700'>
                  Notificações
                </span>
              </div>
              <ul className='divide-y divide-zinc-100 overflow-auto max-h-[280px]'>
                {lastFive.length === 0 ? (
                  <li className='p-4 text-sm text-zinc-500'>
                    Sem notificações
                  </li>
                ) : (
                  lastFive.map(n => {
                    const date = new Date(n.createdAt);
                    const time = date.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <li
                        key={n.id}
                        className={cn(
                          'p-3 transition-colors',
                          n.read ? 'bg-white' : 'bg-brand-50/70'
                        )}
                      >
                        <button
                          type='button'
                          className='w-full text-left'
                          onClick={() => setNotifOpen(false)}
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0'>
                              <div className='text-sm font-semibold text-zinc-800 truncate'>
                                {n.title}
                              </div>
                              <div className='text-xs text-zinc-600 truncate'>
                                {n.description}
                              </div>
                            </div>
                            <time className='text-[11px] text-zinc-500 shrink-0'>
                              {time}
                            </time>
                          </div>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              {lastFive.length > 0 && (
                <div className='border-t border-zinc-200'>
                  <button
                    type='button'
                    className='w-full text-center text-sm font-medium text-brand-600 hover:underline py-2'
                  >
                    ver todas
                  </button>
                </div>
              )}
            </div>

            <div className='relative' ref={appsRef}>
              <ButtonIcon
                aria-label='Selecionar aplicativo'
                icon={<LayoutGrid />}
                onClick={() => {
                  setAppsOpen(v => {
                    const next = !v;
                    if (next) setNotifOpen(false);
                    return next;
                  });
                  onAppsClick?.();
                }}
              />
              {appsOpen && (
                <div className='absolute right-0 top-full mt-2 w-[320px] bg-white border border-zinc-200 rounded-lg shadow-lg z-[9500]'>
                  <div className='p-2 border-b border-zinc-200'>
                    <span className='text-sm font-semibold text-zinc-700'>
                      Selecionar app
                    </span>
                  </div>
                  <div className='p-2 grid grid-cols-2 gap-2 max-h-[320px] overflow-auto'>
                    {apps.length === 0 ? (
                      <div className='col-span-2 text-sm text-zinc-500 p-2'>
                        Nenhum app disponível
                      </div>
                    ) : (
                      apps.map(app => (
                        <button
                          key={app.id}
                          type='button'
                          disabled={app.disabled}
                          onClick={() => {
                            onAppSelect?.(app.id);
                            setAppsOpen(false);
                          }}
                          className={cn(
                            'w-full h-24 border rounded-md text-sm font-semibold flex flex-col items-center justify-center gap-2 transition',
                            app.disabled
                              ? 'text-zinc-300 bg-zinc-100 cursor-not-allowed border-zinc-200'
                              : 'text-zinc-600 border-zinc-300 hover:border-brand-400 hover:bg-brand-50/70'
                          )}
                        >
                          <span className='[&>*]:h-6 [&>*]:w-6 opacity-70'>
                            {app.icon}
                          </span>
                          <span className='truncate max-w-[120px]'>
                            {app.name}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div> */}
          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}

export default Topbar;
