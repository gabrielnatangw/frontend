import React from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../topbar';
import Sidebar, { type SidebarItem } from '../sidebar';
import {
  LayoutDashboard,
  Settings,
  AppWindow,
  Database,
  Shield,
} from 'lucide-react';
import { useAuth } from '../index';
import Ptrace from '../logos/ptrace';

export default function PtraceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  // const logout = ();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const sidebarItems: SidebarItem[] = [
    { title: 'Início', href: '/p-trace', icon: <LayoutDashboard /> },
    {
      title: 'Ativos',
      icon: <Database />,
      children: [
        { title: 'Módulos', href: '/p-trace/modules' },
        { title: 'Sensores', href: '/p-trace/sensors' },
      ],
    },
    {
      title: 'Administração',
      icon: <Shield />,
      children: [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Roles', href: '/admin/roles' },
        { title: 'Usuários', href: '/admin/users' },
        { title: 'Tenants', href: '/admin/tenants' },
      ],
    },
    {
      title: 'Configurações',
      icon: <Settings />,
      children: [
        {
          title: 'Unidades de Medida',
          href: '/p-trace/settings/measurement-unit',
        },
      ],
    },
  ];

  const apps = [
    { id: 'tarce', name: 'tarce', icon: <AppWindow /> },
    { id: 'ptrace', name: 'ptrace', icon: <AppWindow /> },
    { id: 'etrace', name: 'etrace', icon: <AppWindow /> },
    { id: 'mtrace', name: 'mtrace', icon: <AppWindow /> },
  ];

  const handleSelectApp = (id: string | number) => {
    const map: Record<string, string> = {
      tarce: '/t-race',
      ptrace: '/p-trace',
      etrace: '/e-trace',
      mtrace: '/m-trace',
    };
    const to = map[String(id)] || '/';
    navigate(to);
  };

  // const handleLogout = async () => {
  //   try {
  //     console.log('Iniciando logout...');
  //     console.log('Access token:', useAuthStore.getState().accessToken);
  //     console.log('Refresh token:', useAuthStore.getState().refreshToken);

  //     await logout.mutateAsync();
  //     console.log('Logout realizado com sucesso');

  //     navigate('/auth/login');
  //   } catch (error) {
  //     console.error('Erro no logout:', error);
  //     // Mesmo com erro, redirecionar para login
  //     navigate('/auth/login');
  //   }
  // };

  return (
    <div className='min-h-screen'>
      <Topbar
        onMenuClick={() => setSidebarOpen(v => !v)}
        sidebarOpen={sidebarOpen}
        reserveSidebarSpace
        user={{
          name: user?.name || 'Usuário',
          email: user?.email || 'usuario@exemplo.com',
        }}
        apps={apps}
        onAppSelect={handleSelectApp}
        notifications={[]}
      />

      <Sidebar
        items={sidebarItems}
        variant='hidden'
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        brand={<Ptrace open={sidebarOpen} />}
        // footer={<HelpCenterFooter isOpen={sidebarOpen} />}
      />

      <main
        className={
          sidebarOpen
            ? 'transition-[padding] duration-300 md:pl-[320px] min-h-[90vh]'
            : 'transition-[padding] duration-300 md:pl-[80px] min-h-[90vh]'
        }
      >
        <div className='px-4 md:px-3 py-3 md:py-3 w-full'>{children}</div>
      </main>
    </div>
  );
}
